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
        gradients: {
            primary: { colors: ["#F90D3D", "#F90E78"], style: "linear", angle: 90 }
        },
        components: {
            cards: {
                plain: { border: "surface", borderWidth: 0 },
                outlined: { background: "surface", border: "textPrimary", borderWidth: 6 }
            }
        },

        typography: {
            fonts: {
                regular: "fonts/Urbanist-Regular.ttf",
                medium: "fonts/Urbanist-Medium.ttf",
                bold: "fonts/Urbanist-Bold.ttf",
                semibold: "fonts/Urbanist-SemiBold.ttf"
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
        fonts: { regular: "fonts/Urbanist-Regular.ttf", medium: "fonts/Urbanist-Medium.ttf", bold: "fonts/Urbanist-Bold.ttf", semibold: "fonts/Urbanist-SemiBold.ttf" },
        icons: { call: "icons/callIcon.png" },
        images: { logo: "images/Roku.png", home: "images/home.png", splash: "images/splash.mp4", splashFallback: "images/splash_fhd.png", onboardIcon1: "images/Onboard_Icon1.png", onboardIcon2: "images/Onboard_Icon2.png", onboardIcon3: "images/Onboard_Icon3.png" }
    }
};
