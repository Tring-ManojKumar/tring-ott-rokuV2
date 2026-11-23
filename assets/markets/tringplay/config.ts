import type { Config } from "../../schema";

export const tringplayConfig: Config = {
    brand: "tringplay",
    splash: { type: "video", uri: "pkg:/assets/tringplay/images/splash_1080p.mp4",
        fallbackImage: "pkg:/assets/images/loader_red.png"
     },
    languages: [
        { code: "en", name: "English" },
        { code: "fr", name: "French" }
    ],

    theme: {
        colors: {
            background: "#0B0614",
            surface: "#21132E",
            textPrimary: "#FFFFFF",
            textSecondary: "#C8BFD1",
            accent: "#FF4F81",
            focus: "#FF4F81",
            disabled: "#62566B"
        },
        gradients: {
            accent: { colors: ["#FF4F81", "#8A3FFC"], style: "linear", angle: 90 }
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
        images: { logo: "images/Roku.png", home: "images/home.png", splash: "images/splash_1080p.mp4", splashFallback: "images/loader_red.png" }
    }
};
