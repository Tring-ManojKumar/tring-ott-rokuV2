import resolver = require("./ConfigurationResolver.js");

export type ConfigObject = Record<string, any>;

export interface ApiConfiguration extends ConfigObject {
}

export interface ResolvedBuildConfiguration extends ConfigObject {
  market: string;
  environment: string;
  assetsRoot: string;
  assetSources: string[];
  manifest: string;
  theme: ConfigObject;
  api?: ApiConfiguration;
}

export const mergeConfig: <T extends ConfigObject>(base: T, override: ConfigObject) => T = resolver.mergeConfig;
export const resolveBuildConfiguration: (
  cwd: string,
  options: { market?: string; brand?: string; env?: string; architecture?: "core" | "mvvm-clean" },
) => ResolvedBuildConfiguration = resolver.resolveBuildConfiguration;
export const writeResolvedConfiguration: (
  cwd: string,
  configuration: ResolvedBuildConfiguration,
) => string = resolver.writeResolvedConfiguration;
