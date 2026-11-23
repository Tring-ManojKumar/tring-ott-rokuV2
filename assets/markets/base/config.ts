import type { Config } from "../../schema";

export const baseConfig: Config = {
    brand: "base",
    splash: { type: "image", uri: "pkg:/assets/base/images/Roku.png" },

    theme: {
        colors: {
            background: "#000000",
            surface: "#181818",
            textPrimary: "#FFFFFF",
            textSecondary: "#B3B3B3",
            textBlack: "#000000",
            accent: "#FFFFFF",
            focus: "#FFFFFF",
            disabled: "#666666"
        },

        typography: {
            fonts: {
                regular: "pkg:/assets/base/fonts/Regular.otf",
                medium: "pkg:/assets/base/fonts/Medium.otf",
                bold: "pkg:/assets/base/fonts/Bold.otf"
            },

            sizes: {
                display: 42,
                heading: 32,
                title: 26,
                body: 20,
                caption: 16,
                button: 20
            }
        },

        spacing: { xs: 8, sm: 16, md: 24, lg: 40, xl: 64 },
        radii: { none: 0, sm: 6, md: 12, lg: 20, pill: 999 },
        borders: { none: 0, thin: 2, thick: 4 },
        gradients: {
            accent: { colors: ["#FFFFFF", "#B3B3B3"], style: "linear", angle: 90 }
        },
        components: {
            buttons: {
                primary: { background: "accent", text: "textPrimary", border: "accent" },
                secondary: { background: "surface", text: "textPrimary", border: "focus" },
                outlined: { background: "background", text: "textPrimary", border: "focus" },
                text: { background: "background", text: "textPrimary", border: "background" },
                disabled: { background: "disabled", text: "textSecondary", border: "disabled" }
            },
            cards: {
                plain: { border: "surface", borderWidth: 0 },
                outlined: { background: "surface", border: "textPrimary", borderWidth: 6 },
                surface: { background: "surface", border: "focus" },
            },
            labels: {
                heading: { size: "heading", color: "textPrimary", font: "bold" },
                subtitle: { size: "title", color: "textSecondary", font: "medium" },
                body: { size: "body", color: "textPrimary", font: "regular" },
                caption: { size: "caption", color: "textSecondary", font: "regular" },
                button: { size: "button", color: "textPrimary", font: "medium" }
            }
        },

        icons: {
            home: "pkg:/assets/base/images/home.png",
            search: "pkg:/assets/base/images/search.png",
            back: "pkg:/assets/base/images/back.png",
            play: "pkg:/assets/base/images/play.png",
            settings: "pkg:/assets/base/images/settings.png"
        }
    },
    assets: {
        fonts: { regular: "fonts/Regular.otf", medium: "fonts/Medium.otf", bold: "fonts/Bold.otf" },
        icons: { location: "icons/locationIcon.png" },
        images: { logo: "images/Roku.png", poster: "images/movie.png" }
    }
};
