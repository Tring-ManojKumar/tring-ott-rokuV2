import { FinalizedBsConfig, ProgramBuilder } from "brighterscript";
import { merge as _merge } from "lodash";
import { config } from "dotenv";
import FastGlob from "fast-glob";
import * as path from "path";
import { cwdPath } from "./utils.ts";
import * as fs from "fs";

declare module "brighterscript" {
  export interface BsConfig {
    brand?: string; // legacy market option
    market?: string; // canonical consumer market option; brand remains a compatibility alias
    env: string; // env we are injecting
    vscode?: boolean; // are we in vscode?
    debug?: boolean; // enable debug options
    charles?: boolean; // enable charles build output
    test?: boolean; // make a test build
    telnet?: boolean; // observe telnet output for ci
    buildId?: string; // ci build id
    trace?: boolean; // inject trace logging to all functions
    performance?: boolean | number; // run a performance test
    rooibos?: RooibosOptions;
    isLibrary?: boolean;
    rta?: boolean;
    automationIdentifiers?: boolean; // inject label identifiers
  }
}

export interface RooibosOptions {
  isRecordingCodeCoverage: boolean;
  printTestTimes: boolean;
  testsFilePattern: string;
  tags: string[];
  showOnlyFailures: boolean;
  catchCrashes: boolean;
  failFast: boolean;
  lineWidth: number;
  sendHomeOnFinish: boolean;
  coverageExcludedFiles: string[];
  isGlobalMethodMockingEnabled: boolean;
  isGlobalMethodMockingEfficientMode: boolean;
  printLcov: boolean;
}

const DEFAULT_TEST_OPTIONS: RooibosOptions = {
  isRecordingCodeCoverage: false,
  printTestTimes: true,
  testsFilePattern: "**/*.spec.bs",
  tags: [],
  failFast: false,
  coverageExcludedFiles: ["**/rooibos/**"], // exclude Rooibos test framework internals from coverage by default
  isGlobalMethodMockingEfficientMode: false,
  isGlobalMethodMockingEnabled: false,
  showOnlyFailures: true,
  catchCrashes: false,
  lineWidth: 70,
  sendHomeOnFinish: true,
  printLcov: false,
};

export class PluginOptions {
  logger: any;
  options: FinalizedBsConfig;
  constructor(program: ProgramBuilder) {
    this.logger = program.logger;
    this.options = program.options;
  }

  getProgramOptions(): FinalizedBsConfig {
    (process as any).bscCwd = this.options.cwd;
    config({ path: cwdPath(".env") });
    let defaults: { defaultMarket?: string; defaultEnvironment?: string } = {};
    let generated: { market?: string; environment?: string } = {};
    try {
      defaults = JSON.parse(fs.readFileSync(cwdPath("config/defaults.json"), "utf8"));
    } catch {
      // ConfigurationResolver reports the authoritative, actionable file error.
    }
    try {
      generated = JSON.parse(fs.readFileSync(cwdPath(".generated/resolved-config.json"), "utf8"));
    } catch {
      // A fresh project may invoke bsc without the initializer; use its defaults.
    }
    this.options.market = this.options.market ?? this.options.brand ?? defaults.defaultMarket ?? generated.market ?? "default";
    this.options.brand = this.options.brand ?? this.options.market;
    this.options.env = this.options.env ?? defaults.defaultEnvironment ?? generated.environment ?? "prod";
    config({ path: cwdPath(`.env.${this.options.env}`), override: true });
    if (!this.options.vscode) {
      this.options.vscode = process.argv[1].includes(
        "rokucommunity.brightscript-",
      );
      if (this.options.vscode) {
        this.logger.log(
          `Forcing options.vscode=true, detected extension in process arguments`,
        );
      }
    }
    if (this.options.vscode) {
      this.options.files.push({
        src: "./node_modules/rooibos-roku/dist/lib/framework/**/*",
        dest: "/source/rooibos/",
      });
    }
    if (this.options.test || this.options.vscode) {
      this.options.files.push({ src: "test/**/*", dest: "/" });
      this.options.files = this.options.files?.filter(
        (f) => typeof f !== "string" || !f.startsWith("!**/*.spec."),
      );
      this.options.rooibos = _merge(
        {},
        DEFAULT_TEST_OPTIONS,
        this.options.rooibos,
      );
      this.logger.log(`Adding rooibos options`);
    }

    this.options.isLibrary = !!this.options.isLibrary;

    this.updateDeviceCredentials();
    this.updateOutputName();
    this.updateManifestBsConsts();
    this.linkNodeModules();
    return this.options as FinalizedBsConfig;
  }

  /**
   * node_modules can be in ./ or ../ because of npm workspaces
   * here we iterate the files specified, and if they start
   * with the node_modules folder, we verify or fix them
   * @param options
   */
  private linkNodeModules() {
    this.options.files = this.options.files?.map((fileEntry) => {
      if (typeof fileEntry === "string") {
        return this.formatFileEntrySrcPath(fileEntry);
      } else if (typeof fileEntry.src === "string") {
        fileEntry.src = this.formatFileEntrySrcPath(fileEntry.src);
        return fileEntry;
      } else {
        fileEntry.src = fileEntry.src.map((s) => {
          return this.formatFileEntrySrcPath(s);
        });
        return fileEntry;
      }
    });
  }

  /**
   * required to do this beforeProgramCreate in order for
   * the language server to do its thing correctly
   * @param options
   */
  private updateManifestBsConsts() {
    const bs_const = {
      isDebugBuild: !!this.options.vscode || !!this.options.debug,
      isRegistryDiagnosticBuild:
        this.options.env === "stage" || !!this.options.vscode || !!this.options.debug,
      isTestBuild: !!this.options.vscode || !!this.options.test,
      ENABLE_RTA: !!this.options.rta,
      AUTOMATION_IDENTIFIERS: !!this.options.automationIdentifiers,
    };
    this.options.manifest = _merge(this.options.manifest ?? {}, {
      bs_const,
    });
    this.logger.log(`Updated bs_const values: ${JSON.stringify(bs_const)}`);
  }

  /**
   * ensures a srcPath that starts with node_modules points
   * to the correct node_modules
   * @param srcPath
   * @returns
   */
  private formatFileEntrySrcPath(srcPath: string): string {
    let modifiedPath = path.normalize(srcPath); // normalize for platform

    if (/^(?:\.\/)?(node_modules|roku-packages)[\\/].*/.test(modifiedPath)) {
      let globs = FastGlob.sync(cwdPath(modifiedPath));
      if (globs.length === 0) {
        const maxDepth = 3;
        let pathFound = false;

        for (let i = 0; i < maxDepth; i++) {
          modifiedPath = path.join("..", modifiedPath);
          globs = FastGlob.sync(cwdPath(modifiedPath));
          this.logger.log(
            `Checking for node_modules path: ${cwdPath(
              modifiedPath,
            )} {globs: ${globs.length}}`,
          );
          if (globs.length > 0) {
            pathFound = true;
            break;
          }
        }

        if (!pathFound) {
          throw new Error(
            `Cannot find node_modules path for ${srcPath} after ${maxDepth} attempts`,
          );
        }

        this.logger.log(
          `Fixed srcPath directory for node_modules dependency: ${modifiedPath}`,
        );

        const parts = path.normalize(modifiedPath).split(path.sep);
        const packageName = parts.find((part, i) => {
          return (
            (i > 1 &&
              parts[i - 2] === "node_modules" &&
              parts[i - 1].startsWith("@")) ||
            (i > 0 && parts[i - 1] === "node_modules" && !part.startsWith("@"))
          );
        });

        if (!packageName) {
          throw new Error(
            `Could not determine package name from path: ${modifiedPath}`,
          );
        }

        const symlinkPath = path.join(
          modifiedPath.split(packageName)[0],
          packageName,
        );
        const symlinkPathCwd = cwdPath(symlinkPath);

        try {
          const lstat = fs.lstatSync(symlinkPathCwd);
          if (lstat.isSymbolicLink()) {
            const realTarget = fs.realpathSync(symlinkPathCwd);
            const relativeTarget = path.relative(cwdPath("."), realTarget);

            modifiedPath = modifiedPath.replace(symlinkPath, relativeTarget);
            this.logger.log(`Found symlink, using real path: ${modifiedPath}`);
          }
        } catch (e) {
          this.logger.log(
            `Failed to resolve symlink at ${symlinkPathCwd}: ${e}`,
          );
        }
      }
    }

    return modifiedPath;
  }

  private updateDeviceCredentials() {
    let { ROKU_HOST, ROKU_PASS } = process.env;
    if (!this.options.host) {
      this.options.host = ROKU_HOST;
    }
    if (!this.options.password) {
      this.options.password = ROKU_PASS ?? "rokudev";
    }
    if (!this.options.username) {
      this.options.username = "rokudev";
    }
  }

  private updateOutputName() {
    // Test builds have their own package path and must not be redirected to the
    // production deployment archive.
    if (this.options.test) {
      return;
    }
    // Rewrite only the conventional out/ package path, independent of OS separators.
    const normalizedOutFile = this.options.outFile?.replace(/\\/g, "/");
    if (!normalizedOutFile || !/(^|\/)out\//.test(normalizedOutFile)) {
      return;
    }
    const market = this.options.market || this.options.brand || "default";
    const environment = this.options.env || "prod";
    this.options.outFile = `./out/roku-${market}-${environment}.zip`;
  }

}
