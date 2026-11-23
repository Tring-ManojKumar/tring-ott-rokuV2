"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeConfig = mergeConfig;
exports.resolveBuildConfiguration = resolveBuildConfiguration;
exports.writeResolvedConfiguration = writeResolvedConfiguration;
const fs = require("fs");
const Module = require("module");
const path = require("path");
function mergeConfig(base, override) {
    const result = { ...base };
    for (const [key, value] of Object.entries(override)) {
        const current = result[key];
        if (isRecord(current) && isRecord(value))
            result[key] = mergeConfig(current, value);
        else
            result[key] = value;
    }
    return result;
}
function resolveBuildConfiguration(cwd, options) {
    const defaultsPath = path.resolve(cwd, "config/defaults.json");
    const defaults = readJson(defaultsPath, true);
    const architecture = options.architecture || defaults.architecture || "mvvm-clean";
    const market = architecture === "core" ? (defaults.coreMarket || "default") : (options.market || options.brand || defaults.defaultMarket || "default");
    const environment = options.env || defaults.defaultEnvironment || "prod";
    const marketPath = path.resolve(cwd, "config/markets", `${market}.json`);
    const environmentPath = path.resolve(cwd, "config/environments", `${environment}.json`);
    const marketConfig = readJson(marketPath, false);
    const baseMarketPath = path.resolve(cwd, "config/markets/base.json");
    const baseMarketConfig = market !== "base" && fs.existsSync(baseMarketPath) ? readJson(baseMarketPath, false) : {};
    const baseAssetsRoot = [path.resolve(cwd, "assets/base"), path.resolve(cwd, "assets/markets/base")].find(candidate => fs.existsSync(candidate));
    const selectedAssetsRoot = path.resolve(cwd, marketConfig.assetsRoot || baseMarketConfig.assetsRoot || defaults.assetsRoot || "assets");
    const baseAssetConfigRoot = baseAssetsRoot || selectedAssetsRoot;
    const baseAssetConfig = loadAssetConfiguration(cwd, baseAssetConfigRoot);
    const marketAssetConfig = selectedAssetsRoot === baseAssetConfigRoot ? {} : loadAssetConfiguration(cwd, selectedAssetsRoot);
    const baseUrls = loadUrlConfiguration(cwd, baseAssetConfigRoot);
    const marketUrls = selectedAssetsRoot === baseAssetConfigRoot ? {} : loadUrlConfiguration(cwd, selectedAssetsRoot);
    const globalEnvironment = readJson(environmentPath, false);
    const marketEnvironmentPath = path.resolve(cwd, "config/markets", market, "environments", `${environment}.json`);
    const marketEnvironment = readJson(marketEnvironmentPath, true);
    let resolved = mergeConfig({}, defaults);
    resolved = mergeConfig(resolved, withoutTheme(baseMarketConfig));
    resolved = mergeConfig(resolved, baseAssetConfig);
    resolved.assets = mergeConfig(resolved.assets || {}, baseAssetConfig.assets || {});
    resolved = mergeConfig(resolved, withoutTheme(marketConfig));
    resolved.assets = mergeConfig(resolved.assets || {}, marketAssetConfig.assets || {});
    resolved = mergeConfig(resolved, withoutTheme(globalEnvironment));
    resolved = mergeConfig(resolved, withoutTheme(marketEnvironment));
    resolved = mergeConfig(resolved, baseAssetConfig);
    resolved = mergeConfig(resolved, marketAssetConfig);
    resolved.api = mergeConfig(mergeConfig({}, baseUrls), marketUrls);
    resolved.api = mergeConfig(resolved.api, globalEnvironment.api || {});
    resolved.api = mergeConfig(resolved.api, marketEnvironment.api || {});
    resolved.market = market;
    resolved.environment = environment;
    resolved.architecture = architecture;
    resolved.assetsRoot = resolved.assetsRoot || "assets";
    resolved.manifest = resolved.manifest || "manifest";
    resolved.theme = mergeConfig(baseAssetConfig.theme || defaults.theme || {}, marketAssetConfig.theme || {});
    resolved.splash = marketAssetConfig.splash || baseAssetConfig.splash || resolved.splash;
    resolved.languages = marketAssetConfig.languages || baseAssetConfig.languages || resolved.languages || [];
    resolveUrlEnvironments(resolved.api || {}, environment);
    const marketAssetsRoot = path.resolve(cwd, resolved.assetsRoot);
    resolved.assetSources = [];
    if (baseAssetsRoot && baseAssetsRoot !== marketAssetsRoot) resolved.assetSources.push(path.relative(cwd, baseAssetsRoot).replace(/\\/g, "/"));
    resolved.assetSources.push(path.relative(cwd, marketAssetsRoot).replace(/\\/g, "/"));
    resolveConfiguredAssetPaths(cwd, resolved);
    validateResolvedConfiguration(cwd, resolved, marketPath, environmentPath);
    return resolved;
}
function withoutTheme(value) {
    const copy = { ...value };
    for (const key of ["theme", "splash", "languages", "assets", "api"]) delete copy[key];
    return copy;
}
function loadAssetConfiguration(cwd, root) {
    const filePath = path.resolve(cwd, root, "config.ts");
    if (!fs.existsSync(filePath)) {
        throw new Error(`Required theme configuration file is missing: ${path.relative(cwd, filePath)}.`);
    }
    try {
        const ts = require("typescript");
        const source = fs.readFileSync(filePath, "utf8");
        const transpiled = ts.transpileModule(source, {
            compilerOptions: {
                module: ts.ModuleKind.CommonJS,
                target: ts.ScriptTarget.ES2020,
                esModuleInterop: true
            },
            fileName: filePath
        }).outputText;
        const configModule = new Module(filePath, module);
        configModule.filename = filePath;
        configModule.paths = Module._nodeModulePaths(path.dirname(filePath));
        configModule._compile(transpiled, filePath);
        const moduleExports = configModule.exports;
        const config = Object.values(moduleExports).find(value => isRecord(value) && value.theme);
        if (!config) {
            throw new Error(`No exported theme configuration was found in ${path.relative(cwd, filePath)}.`);
        }
        if (typeof moduleExports.assertConfig === "function") moduleExports.assertConfig(config, config.brand);
        const normalized = JSON.parse(JSON.stringify(config));
        const normalizePath = value => typeof value === "string" ? value.replace(`pkg:/assets/${path.basename(root)}/`, "pkg:/assets/") : value;
        normalized.theme.typography?.fonts && Object.keys(normalized.theme.typography.fonts).forEach(key => normalized.theme.typography.fonts[key] = normalizePath(normalized.theme.typography.fonts[key]));
        normalized.theme.icons && Object.keys(normalized.theme.icons).forEach(key => normalized.theme.icons[key] = normalizePath(normalized.theme.icons[key]));
        if (normalized.splash) { normalized.splash.uri = normalizePath(normalized.splash.uri); if (normalized.splash.fallbackImage) normalized.splash.fallbackImage = normalizePath(normalized.splash.fallbackImage); }
        return normalized;
    }
    catch (error) {
        if (error.code === "MODULE_NOT_FOUND" && /typescript/.test(error.message)) {
            throw new Error(`Unable to load required theme configuration ${path.relative(cwd, filePath)}: runtime dependency "typescript" is unavailable. Install the framework package with its production dependencies and retry.`);
        }
        if (error.message.startsWith("No exported theme configuration")) throw error;
        throw new Error(`Unable to load asset mappings from ${path.relative(cwd, filePath)}: ${error.message}`);
    }
}
function loadUrlConfiguration(cwd, root) {
    const filePath = path.resolve(cwd, root, "url.json");
    return fs.existsSync(filePath) ? readJson(filePath, false) : {};
}
function writeResolvedConfiguration(cwd, configuration) {
    const configOutput = path.resolve(cwd, ".generated/resolved-config.json");
    const themeOutput = path.resolve(cwd, "utils/theme/GeneratedTheme.bs");
    const compiledTheme = {
        ...configuration.theme,
        splash: configuration.splash,
        languages: configuration.languages || [],
    };
    const json = JSON.stringify(compiledTheme).replace(/"/g, '""');
    const themeSource = [
        "function GetCompiledTheme() as object",
        `    return ParseJson("${json}")`,
        "end function",
        "",
    ].join("\n");
    fs.mkdirSync(path.dirname(configOutput), { recursive: true });
    fs.writeFileSync(configOutput, JSON.stringify(configuration, null, 2) + "\n");
    fs.writeFileSync(themeOutput, themeSource);
    return configOutput;
}
function resolveUrlEnvironments(api, environment) {
    const urlEnvironment = environment === "prod" || environment === "production" ? "prod" : "sandBox";
    const contentBaseUrls = api.contentBaseUrls;
    if (isRecord(contentBaseUrls)) {
        const selected = contentBaseUrls[urlEnvironment];
        if (typeof selected === "string") api.contentBaseUrls = selected;
    }
    for (const sectionName of ["authBaseUrls", "qrBaseUrls", "subscriptionBaseUrls"]) {
        const section = api[sectionName];
        if (!isRecord(section))
            continue;
        for (const [name, value] of Object.entries(section)) {
            if (!isRecord(value))
                continue;
            const selected = value[urlEnvironment];
            if (typeof selected === "string" && selected.trim())
                section[name] = selected;
            else
                delete section[name];
        }
    }
}
function validateResolvedConfiguration(cwd, configuration, marketPath, environmentPath) {
    if (!fs.existsSync(path.resolve(cwd, configuration.assetsRoot))) {
        throw new Error(`Market configuration ${marketPath} references missing assetsRoot "${configuration.assetsRoot}".`);
    }
    if (!fs.existsSync(path.resolve(cwd, configuration.manifest))) {
        throw new Error(`Market configuration ${marketPath} references missing manifest "${configuration.manifest}".`);
    }
    const theme = configuration.theme || {};
    if (!isRecord(theme.colors) || !isRecord(theme.typography?.fonts) || !isRecord(theme.typography?.sizes)) {
        throw new Error(`Theme configuration for ${configuration.market} is invalid after applying ${environmentPath}; expected colors, typography.fonts, and typography.sizes.`);
    }
    for (const [name, uri] of Object.entries(theme.typography.fonts))
        validateAsset(cwd, configuration, uri, `theme.typography.fonts.${name}`, marketPath);
    if (theme.splash)
        validateAsset(cwd, configuration, theme.splash.uri, "splash.uri", marketPath);
    if (configuration.splash) {
        validateAsset(cwd, configuration, configuration.splash.uri, "splash.uri", marketPath);
        if (configuration.splash.fallbackImage)
            validateAsset(cwd, configuration, configuration.splash.fallbackImage, "splash.fallbackImage", marketPath);
    }
}
function validateAsset(cwd, configuration, value, field, source) {
    if (typeof value !== "string" || !value.startsWith("pkg:/assets/"))
        return;
    const relative = value.slice("pkg:/assets/".length);
    const localPaths = configuration.assetSources.map(root => path.resolve(cwd, root, relative));
    if (!localPaths.some(file => fs.existsSync(file))) throw new Error(`Configuration ${source} references missing asset ${field}: ${value} (searched ${localPaths.map(file => path.relative(cwd, file)).join(", ")}).`);
}
function resolveConfiguredAssetPaths(cwd, configuration) {
    const roots = configuration.assetSources || [configuration.assetsRoot];
    const normalize = (value, category, field) => {
        if (typeof value !== "string") return value;
        if (value.startsWith("@asset:")) {
            const reference = value.slice("@asset:".length).split(".");
            if (reference.length !== 2 || !["fonts", "icons", "images"].includes(reference[0])) throw new Error(`Invalid logical asset reference for ${field}: ${value}`);
            const resolved = configuration.assets?.[reference[0]]?.[reference[1]];
            if (typeof resolved !== "string") throw new Error(`Missing logical asset mapping for ${field}: ${value}`);
            return resolved;
        }
        if (value.startsWith("pkg:/assets/")) {
            const relative = value.slice("pkg:/assets/".length).replace(/\\/g, "/");
            if (!/^(fonts|icons|images)\//.test(relative)) throw new Error(`Asset ${field} must use pkg:/assets/fonts/, icons/, or images/: ${value}`);
            return `pkg:/assets/${relative}`;
        }
        const relative = value.replace(/^\/+/, "").replace(/\\/g, "/");
        const packaged = relative.startsWith(`${category}/`) ? relative : `${category}/${relative}`;
        if (!roots.some(root => fs.existsSync(path.resolve(cwd, root, packaged)))) throw new Error(`Missing asset ${field}: ${packaged} (searched base and selected market asset roots).`);
        return `pkg:/assets/${packaged}`;
    };
    for (const category of ["fonts", "icons", "images"]) {
        const mappings = configuration.assets?.[category];
        if (mappings && isRecord(mappings)) for (const [key, value] of Object.entries(mappings)) mappings[key] = normalize(value, category, `assets.${category}.${key}`);
    }
    const theme = configuration.theme || {};
    for (const [key, value] of Object.entries(theme.typography?.fonts || {})) theme.typography.fonts[key] = normalize(value, "fonts", `theme.typography.fonts.${key}`);
    for (const [key, value] of Object.entries(theme.icons || {})) theme.icons[key] = normalize(value, "icons", `theme.icons.${key}`);
    if (configuration.splash?.uri) configuration.splash.uri = normalize(configuration.splash.uri, "images", "splash.uri");
    if (configuration.splash?.fallbackImage) configuration.splash.fallbackImage = normalize(configuration.splash.fallbackImage, "images", "splash.fallbackImage");
}
function readJson(filePath, optional) {
    if (!fs.existsSync(filePath)) {
        if (optional)
            return {};
        if (filePath.endsWith("defaults.json"))
            throw new Error(`Missing required configuration file ${filePath}.`);
        if (filePath.includes(`${path.sep}markets${path.sep}`)) {
            const marketsDir = path.dirname(filePath);
            const available = fs.existsSync(marketsDir)
                ? fs.readdirSync(marketsDir).filter(file => file.endsWith(".json")).map(file => path.basename(file, ".json"))
                : [];
            throw new Error(`Unknown market configuration ${filePath}. Available markets: ${available.join(", ") || "none"}.`);
        }
        throw new Error(`Missing required environment configuration ${filePath}.`);
    }
    try {
        const value = JSON.parse(fs.readFileSync(filePath, "utf8"));
        if (!isRecord(value))
            throw new Error("Expected a JSON object at the file root.");
        return value;
    }
    catch (error) {
        throw new Error(`Invalid configuration ${filePath}: ${error.message}`);
    }
}
function isRecord(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
}
