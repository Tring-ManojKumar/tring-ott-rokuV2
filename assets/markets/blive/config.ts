import type { Config } from "../../schema";

export const bliveConfig: Config = {
  brand: "blive",
  splash: { type: "image", uri: "pkg:/assets/blive/images/loader_white.png" },
  languages: [
    { code: "en", name: "English" },
  ],
  theme: {
    colors: {
      background: "#07111F",
      surface: "#10243A",
      textPrimary: "#FFFFFF",
      textSecondary: "#A9B8C8",
      accent: "#00AEEF",
      focus: "#00AEEF",
      disabled: "#526273",
    },
    gradients: {
      accent: { colors: ["#00AEEF", "#0758A8"], style: "linear", angle: 90 },
    },
    components: {
      cards: {
        plain: { border: "surface", borderWidth: 0 },
        outlined: { background: "surface", border: "textPrimary", borderWidth: 6 },
      },
    },

  typography: {
          fonts: {
                regular: "pkg:/assets/blive/fonts/Regular.otf",
                medium: "pkg:/assets/blive/fonts/Medium.otf",
                bold: "pkg:/assets/blive/fonts/Bold.otf"
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
            home: "pkg:/assets/blive/images/Roku.png",
            search: "pkg:/assets/blive/images/search.png",
            back: "pkg:/assets/blive/images/back.png",
            play: "pkg:/assets/blive/images/play.png",
            settings: "pkg:/assets/blive/images/settings.png"
        }
  },
  assets: {
    fonts: { regular: "fonts/Regular.otf", medium: "fonts/Medium.otf", bold: "fonts/Bold.otf" },
    icons: { call: "icons/callIcon.png", location: "icons/locationIcon.png" },
    images: { logo: "images/Roku.png", splash: "images/loader_white.png", poster: "images/movie.png" }
  },
};
