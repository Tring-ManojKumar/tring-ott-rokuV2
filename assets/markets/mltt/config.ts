import type { Config } from "../../schema";

export const mlttConfig: Config = {
  brand: "mltt",
  splash: { type: "image", uri: "pkg:/assets/mltt/images/splash_fhd.png" },
  languages: [{ code: "en", name: "English" }, { code: "es", name: "Spanish" }],
  theme: {
    colors: { background: "#000000", surface: "#262626", textPrimary: "#FFFFFF", textSecondary: "#C4C4C4", accent: "#E32652", focus: "#E32652", disabled: "#555555" },
    typography: { fonts: { regular: "fonts/Regular.otf", medium: "fonts/Medium.otf", bold: "fonts/Bold.otf" }, sizes: { display: 42, heading: 32, title: 26, body: 20, caption: 16, button: 20 } },
    icons: { home: "pkg:/assets/images/app_icon.png", search: "pkg:/assets/images/Headphone.png", back: "pkg:/assets/images/arrow.png", play: "pkg:/assets/images/icon-play.png", settings: "pkg:/assets/images/setting-logo.png" }
  },
  assets: { fonts: { regular: "fonts/Regular.otf", medium: "fonts/Medium.otf", bold: "fonts/Bold.otf" }, icons: { location: "pkg:/assets/images/app_icon.png" }, images: { logo: "images/app_icon.png", splash: "images/splash_fhd.png", poster: "images/placeholder.png" } }
};
