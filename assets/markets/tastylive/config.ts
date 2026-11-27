import type { Config } from "../../schema";

export const tastyliveConfig: Config = {
  brand: "tastylive",
  splash: { type: "image", uri: "pkg:/assets/tastylive/images/splash_fhd.png" },
  languages: [{ code: "en", name: "English" }, { code: "es", name: "Spanish" }],
  theme: {
    colors: { background: "#000000", surface: "#262626", textPrimary: "#FFFFFF", textSecondary: "#C4C4C4", accent: "#E32652", focus: "#E32652", disabled: "#555555" },
    gradients: { primary: { colors: ["#E32652", "#F90E78"], style: "linear", angle: 90 } },
    typography: { fonts: { regular: "fonts/Urbanist-Regular.ttf", medium: "fonts/Urbanist-Medium.ttf", bold: "fonts/Urbanist-Bold.ttf", semibold: "fonts/Urbanist-SemiBold.ttf" }, sizes: { display: 42, heading: 32, title: 26, body: 20, caption: 16, button: 20 } },
    icons: { home: "pkg:/assets/images/app_logo.png", search: "pkg:/assets/images/Headphone.png", back: "pkg:/assets/images/arrow.png", play: "pkg:/assets/images/icon-play.png", settings: "pkg:/assets/images/setting-logo.png" }
  },
  assets: { fonts: { regular: "fonts/Urbanist-Regular.ttf", medium: "fonts/Urbanist-Medium.ttf", bold: "fonts/Urbanist-Bold.ttf", semibold: "fonts/Urbanist-SemiBold.ttf" }, icons: { location: "pkg:/assets/images/app_logo.png" }, images: { logo: "images/app_logo.png", splash: "images/splash_fhd.png", poster: "images/placeholder.png", onboardIcon1: "images/Onboard_Icon1.png", onboardIcon2: "images/Onboard_Icon2.png", onboardIcon3: "images/Onboard_Icon3.png" } }
};
