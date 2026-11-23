export type ConfigObject = Record<string, any>;

export interface ApiConfiguration extends ConfigObject {}

export interface ResolvedBuildConfiguration extends ConfigObject {
  market: string;
  environment: string;
  assetsRoot: string;
  assetSources: string[];
  manifest: string;
  theme: ConfigObject;
  api?: ApiConfiguration;
}

export function mergeConfig<T extends ConfigObject>(base: T, override: ConfigObject): T;
export function resolveBuildConfiguration(
  cwd: string,
  options: { market?: string; brand?: string; env?: string; architecture?: "core" | "mvvm-clean" },
): ResolvedBuildConfiguration;
export function writeResolvedConfiguration(cwd: string, configuration: ResolvedBuildConfiguration): string;
