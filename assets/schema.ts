export interface Config {
    brand: string;
    splash: SplashConfig;
    theme: Theme;
    assets?: AssetMappings;
    languages?: LanguageOption[];
}

export interface AssetMappings {
    fonts?: Record<string, string>;
    icons?: Record<string, string>;
    images?: Record<string, string>;
}

export type SplashConfig =
    | { type: "image"; uri: string }
    | { type: "video"; uri: string; fallbackImage?: string };

export interface LanguageOption {
    code: string;
    name: string;
}

interface Theme {
    colors: Colors;
    typography: Typography;
    icons: Icons;
    spacing?: Record<string, number>;
    radii?: Record<string, number>;
    borders?: Record<string, number>;
    gradients?: Record<string, { colors: string[]; stops?: number[]; style: string; angle?: number }>;
    components?: {
        buttons?: Record<string, Record<string, string | number>>;
        labels?: Record<string, Record<string, string | number>>;
        cards?: Record<string, Record<string, string | number>>;
    };
}

interface Colors {
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    textBlack?: string;
    accent: string;
    focus: string;
    disabled: string;
}

interface Typography {
    fonts: Fonts;
    sizes: Sizes;
}

interface Fonts {
    regular: string;
    medium: string;
    bold: string;
    semibold?: string;
}

interface Sizes {
    display: number;
    heading: number;
    title: number;
    body: number;
    caption: number;
    button: number;
}

interface Icons {
    home: string;
    search: string;
    back: string;
    play: string;
    settings: string;
}

/** Validate configs at build time as ts-node runs in transpile-only mode. */
export function assertConfig(value: unknown, market: string): asserts value is Config {
    const required = (object: unknown, fields: string[], path: string) => {
        if (!object || typeof object !== "object") {
            throw new Error(`[AppConfigPlugin] ${market}: missing required object ${path}`);
        }
        for (const field of fields) {
            if (!(field in object) || (object as Record<string, unknown>)[field] === undefined) {
                throw new Error(`[AppConfigPlugin] ${market}: missing required field ${path}.${field}`);
            }
        }
    };

    required(value, ["brand", "splash", "theme"], "config");
    const config = value as Config;
    required(config.theme, ["colors", "typography", "icons"], "theme");
    required(config.theme.colors, ["background", "surface", "textPrimary", "textSecondary", "accent", "focus", "disabled"], "theme.colors");
    required(config.theme.typography, ["fonts", "sizes"], "theme.typography");
    required(config.theme.typography.fonts, ["regular", "medium", "bold"], "theme.typography.fonts");
    required(config.theme.typography.sizes, ["display", "heading", "title", "body", "caption", "button"], "theme.typography.sizes");
    required(config.theme.icons, ["home", "search", "back", "play", "settings"], "theme.icons");

    if (config.brand !== market) {
        throw new Error(`[AppConfigPlugin] ${market}: config brand must be "${market}"`);
    }
    if (config.splash.type !== "image" && config.splash.type !== "video") {
        throw new Error(`[AppConfigPlugin] ${market}: splash.type must be "image" or "video"`);
    }
    if (typeof config.splash.uri !== "string" || config.splash.uri.trim() === "") {
        throw new Error(`[AppConfigPlugin] ${market}: splash.uri must be a non-empty string`);
    }
    if (config.splash.type === "video" && config.splash.fallbackImage !== undefined && typeof config.splash.fallbackImage !== "string") {
        throw new Error(`[AppConfigPlugin] ${market}: splash.fallbackImage must be a string`);
    }
    if (config.languages !== undefined) {
        if (!Array.isArray(config.languages)) {
            throw new Error(`[AppConfigPlugin] ${market}: languages must be an array`);
        }
        const seenLanguageCodes = new Set<string>();
        for (const [index, language] of config.languages.entries()) {
            required(language, ["code", "name"], `languages[${index}]`);
            if (typeof language.code !== "string" || language.code.trim() === "" || typeof language.name !== "string" || language.name.trim() === "") {
                throw new Error(`[AppConfigPlugin] ${market}: languages[${index}] requires non-empty string code and name`);
            }
            const code = language.code.trim().toLowerCase();
            if (seenLanguageCodes.has(code)) {
                throw new Error(`[AppConfigPlugin] ${market}: duplicate language code "${language.code}"`);
            }
            seenLanguageCodes.add(code);
        }
    }
    for (const [name, color] of Object.entries(config.theme.colors)) {
        if (typeof color !== "string") throw new Error(`[AppConfigPlugin] ${market}: theme.colors.${name} must be a string`);
    }
    for (const [name, font] of Object.entries(config.theme.typography.fonts)) {
        if (typeof font !== "string") throw new Error(`[AppConfigPlugin] ${market}: theme.typography.fonts.${name} must be a string`);
    }
    for (const [name, size] of Object.entries(config.theme.typography.sizes)) {
        if (typeof size !== "number") throw new Error(`[AppConfigPlugin] ${market}: theme.typography.sizes.${name} must be a number`);
    }
    for (const [name, icon] of Object.entries(config.theme.icons)) {
        if (typeof icon !== "string") throw new Error(`[AppConfigPlugin] ${market}: theme.icons.${name} must be a string`);
    }
}
