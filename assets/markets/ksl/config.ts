import type { Config } from "../../schema";

export const kslConfig: Config = {
  brand: "ksl",
  splash: { type: "image", uri: "pkg:/assets/ksl/images/splash_fhd.png" },
  languages: [{ code: "en", name: "English" }, { code: "es", name: "Spanish" }],
  theme: {
    colors: { background: "#002147", surface: "#143356", textPrimary: "#FFFFFF", textSecondary: "#CCD3DA", accent: "#4EABE9", focus: "#4EABE9", disabled: "#667A91" },
    gradients: { primary: { colors: ["#4EABE9", "#2878B8"], style: "linear", angle: 270 } },
    typography: { fonts: { regular: "fonts/Urbanist-Regular.ttf", medium: "fonts/Urbanist-Medium.ttf", bold: "fonts/Urbanist-Bold.ttf", semibold: "fonts/Urbanist-SemiBold.ttf" }, sizes: { display: 42, heading: 32, title: 26, body: 20, caption: 16, button: 20 } },
    icons: { home: "pkg:/assets/images/app_logo.png", search: "pkg:/assets/images/Headphone.png", back: "pkg:/assets/images/arrow.png", play: "pkg:/assets/images/icon-play.png", settings: "pkg:/assets/images/setting-logo.png" }
  },
  assets: { fonts: { regular: "fonts/Urbanist-Regular.ttf", medium: "fonts/Urbanist-Medium.ttf", bold: "fonts/Urbanist-Bold.ttf", semibold: "fonts/Urbanist-SemiBold.ttf" }, icons: { location: "pkg:/assets/images/app_logo.png" }, images: { logo: "images/app_logo.png", splash: "images/splash_fhd.png", poster: "images/placeholder.png", onboardIcon1: "images/Onboard_Icon1.png", onboardIcon2: "images/Onboard_Icon2.png", onboardIcon3: "images/Onboard_Icon3.png" } }
};
