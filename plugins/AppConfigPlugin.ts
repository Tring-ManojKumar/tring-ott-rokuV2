import { Program, ProgramBuilder } from "brighterscript";
import * as fs from "fs";
import * as path from "path";
import { cwdPath } from "./utils.ts";
import { IBuildPlugin } from "./core/IBuildPlugin.ts";
import { PluginContext } from "./core/PluginContext.ts";
import { ResolvedBuildConfiguration, resolveBuildConfiguration, writeResolvedConfiguration } from "./core/ConfigurationResolver.ts";

/**
 * Build-time resolver shared by both starters. It knows no market names or
 * application endpoints; those are consumer-owned JSON configuration data.
 */
export class AppConfigPlugin implements IBuildPlugin {
  name = "resolved-configuration-plugin";
  private resolved?: ResolvedBuildConfiguration;
  private programBuilder?: ProgramBuilder;
  private marketConstantsPath?: string;
  private marketConstantsError?: string;

  beforeBuild(context: PluginContext, programBuilder: ProgramBuilder): void {
    this.programBuilder = programBuilder;
    this.resolved = resolveBuildConfiguration(context.cwd, {
      market: (programBuilder.options as any).market,
      brand: (programBuilder.options as any).brand,
      env: (programBuilder.options as any).env,
      architecture: (programBuilder.options as any).architecture,
    });
    this.marketConstantsPath = path.resolve(context.cwd, this.resolved.assetsRoot, "config", "config.json");
    this.marketConstantsError = undefined;
    if (!fs.existsSync(this.marketConstantsPath)) {
      this.marketConstantsError =
        `Market-specific config.json is missing for market "${this.resolved.market}": ${this.marketConstantsPath}`;
    }
    const options = programBuilder.options as any;
    options.manifest = options.manifest || {};
    options.manifest.bs_const = { ...(options.manifest.bs_const || {}), ...(this.resolved.buildFlags || {}) };

    const configOutput = writeResolvedConfiguration(context.cwd, this.resolved);

    const files = (programBuilder.options.files || []) as Array<string | { src: string; dest: string }>;
    programBuilder.options.files = files.filter(file => {
      if (typeof file === "string") return file !== "manifest" && file !== "assets/**/*";
      return file.dest !== "manifest" && !file.dest.startsWith("assets/");
    });
    programBuilder.options.files.push({ src: configOutput, dest: "config/config.json" });
    if (!this.marketConstantsError && this.marketConstantsPath) {
      programBuilder.options.files.push({ src: this.marketConstantsPath, dest: "assets/config/config.json" });
    }
    const marketFlagsPath = path.resolve(context.cwd, this.resolved.assetsRoot, "config", "flags.json");
    if (fs.existsSync(marketFlagsPath)) {
      programBuilder.options.files.push({ src: marketFlagsPath, dest: "assets/config/flags.json" });
    }
    programBuilder.options.files.push({ src: this.resolved.manifest, dest: "manifest" });

    context.log(`[Configuration] market=${this.resolved.market}, env=${this.resolved.environment}`);
  }

  afterProgramCreate(program: Program): void {
    if (!this.resolved) throw new Error("Configuration must resolve before BrighterScript creates the program.");
    const manifestPath = path.resolve(program.options.cwd, this.resolved.manifest);
    program.loadManifest({ src: manifestPath, dest: "manifest" }, true);
    if (this.marketConstantsError && this.programBuilder) {
      const diagnostic = Object.assign({}, {
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
        severity: 1,
        code: "MARKET_CONFIG_MISSING",
        message: this.marketConstantsError,
      }) as Parameters<ProgramBuilder["addDiagnostic"]>[1];
      this.programBuilder.addDiagnostic(this.marketConstantsPath || manifestPath, diagnostic);
    }
  }

  afterFilesLoaded(_context: PluginContext, _program: Program): void {
    // Configuration and generated sources must exist before file discovery.
  }

  afterTranspile(_context: PluginContext, program: Program): void {
    const stagingDir = program.options.stagingDir;
    if (!stagingDir) throw new Error("Configuration plugin requires a valid stagingDir.");
    if (!this.resolved) throw new Error("Configuration was not resolved before transpilation.");

    const stagedConfig = path.join(cwdPath(stagingDir), "config", "config.json");
    fs.mkdirSync(path.dirname(stagedConfig), { recursive: true });
    fs.writeFileSync(stagedConfig, JSON.stringify(this.resolved, null, 2) + "\n");
    fs.mkdirSync(path.join(cwdPath(stagingDir), "assets"), { recursive: true });
    fs.writeFileSync(path.join(cwdPath(stagingDir), "assets", "url.json"), JSON.stringify(this.resolved.api || {}, null, 2) + "\n");
    // Merge base files first, then the selected market. Relative package paths
    // are stable and a market file intentionally replaces a base file at the
    // same path. No other market asset root is visited.
    const stagedAssets = path.join(cwdPath(stagingDir), "assets");
    for (const root of this.resolved.assetSources || [this.resolved.assetsRoot]) {
      for (const category of ["fonts", "icons", "images", "localization"]) {
        const source = path.join(cwdPath(root), category);
        if (fs.existsSync(source)) fs.cpSync(source, path.join(stagedAssets, category), { recursive: true, force: true });
      }
    }

    const isTestBuild = !!(program.options as any).test;
    const outputStagingDir = cwdPath(path.join("out", isTestBuild ? ".roku-test-deploy-staging" : ".roku-deploy-staging"));
    const currentStagingDir = cwdPath(stagingDir);
    if (path.resolve(currentStagingDir) !== path.resolve(outputStagingDir)) {
      fs.rmSync(outputStagingDir, { recursive: true, force: true });
      fs.cpSync(currentStagingDir, outputStagingDir, { recursive: true });
    }
  }

}

export default () => new AppConfigPlugin();
