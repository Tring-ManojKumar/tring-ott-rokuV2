import type { Config } from "../../schema";

export const waypointConfig: Config = {
  brand: "waypoint",
  splash: { type: "image", uri: "pkg:/assets/waypoint/images/splash_fhd.png" },
  languages: [{ code: "en", name: "English" }],
  theme: {
    colors: { background: "#000000", surface: "#262626", textPrimary: "#FFFFFF", textSecondary: "#C4C4C4", accent: "#C7AE8E", focus: "#C7AE8E", disabled: "#555555" },
    typography: { fonts: { regular: "fonts/Regular.otf", medium: "fonts/Medium.otf", bold: "fonts/Bold.otf" }, sizes: { display: 42, heading: 32, title: 26, body: 20, caption: 16, button: 20 } },
    icons: { home: "pkg:/assets/images/app_logo.png", search: "pkg:/assets/images/Headphone.png", back: "pkg:/assets/images/arrow.png", play: "pkg:/assets/images/icon-play.png", settings: "pkg:/assets/images/setting-logo.png" }
  },
  assets: { fonts: { regular: "fonts/Regular.otf", medium: "fonts/Medium.otf", bold: "fonts/Bold.otf" }, icons: { location: "pkg:/assets/images/app_logo.png" }, images: { logo: "images/app_logo.png", splash: "images/splash_fhd.png", poster: "images/placeholder.png" } }
};
