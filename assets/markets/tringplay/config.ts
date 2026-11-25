import type { Config } from "../../schema";

export const tringplayConfig: Config = {
    brand: "tringplay",
    splash: { type: "video", uri: "pkg:/assets/tringplay/images/splash.mp4",
        fallbackImage: "pkg:/assets/tringplay/images/splash_fhd.png"
     },
    languages: [
        { code: "en", name: "English" },
        { code: "es", name: "Spanish" }
    ],

    theme: {
        colors: {
            background: "#000000",
            surface: "#262626",
            textPrimary: "#FFFFFF",
            textSecondary: "#C4C4C4",
            accent: "#E32652",
            focus: "#E32652",
            disabled: "#555555"
        },
        components: {
            cards: {
                plain: { border: "surface", borderWidth: 0 },
                outlined: { background: "surface", border: "textPrimary", borderWidth: 6 }
            }
        },

        typography: {
            fonts: {
                regular: "pkg:/assets/tringplay/fonts/Regular.otf",
                medium: "pkg:/assets/tringplay/fonts/Medium.otf",
                bold: "pkg:/assets/tringplay/fonts/Bold.otf"
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

        icons: {
            home: "pkg:/assets/tringplay/images/home.png",
            search: "pkg:/assets/tringplay/images/search.png",
            back: "pkg:/assets/tringplay/images/back.png",
            play: "pkg:/assets/tringplay/images/play.png",
            settings: "pkg:/assets/tringplay/images/settings.png"
        }
    },
    assets: {
        fonts: { regular: "fonts/Regular.otf", medium: "fonts/Medium.otf", bold: "fonts/Bold.otf" },
        icons: { call: "icons/callIcon.png" },
        images: { logo: "images/Roku.png", home: "images/home.png", splash: "images/splash.mp4", splashFallback: "images/splash_fhd.png" }
    }
};
