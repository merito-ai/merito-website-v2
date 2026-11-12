import localFont from "next/font/local";
import "./fallbacks.css";

// Self-hosted (OFL, see *-OFL.txt) instead of the Google font loader: Turbopack's google-font
// import map intermittently broke Vercel builds ("queries have exactly one entry").
// Files are Google Fonts' own woff2 for latin + Latin Extended-A + currency (incl. ₹).
// Fallback faces come from fallbacks.css (the Google loader's exact metrics), not
// next/font/local's own estimate, so glyphs a font lacks (arrows, ticks) render as before.
// Declare each font once here; every page imports the instance it needs.

// Manrope, exposed under two variable names: the root layout's --font-poppins and the print pages' --font-manrope.
export const poppins = localFont({ adjustFontFallback: false, src: "./manrope.woff2", weight: "400 800", variable: "--font-poppins", fallback: ["Manrope Fallback"] });
export const manrope = localFont({ adjustFontFallback: false, src: "./manrope.woff2", weight: "400 800", variable: "--font-manrope", fallback: ["Manrope Fallback"] });

// Space Grotesk, exposed as --font-gabarito.
export const gabarito = localFont({ adjustFontFallback: false, src: "./space-grotesk.woff2", weight: "500 700", variable: "--font-gabarito", fallback: ["Space Grotesk Fallback"] });

export const fraunces = localFont({ adjustFontFallback: false, src: "./fraunces.woff2", weight: "400 700", variable: "--font-fraunces", fallback: ["Fraunces Fallback"] });
export const inter = localFont({ adjustFontFallback: false, src: "./inter.woff2", weight: "400 700", variable: "--font-inter", fallback: ["Inter Fallback"] });
export const ibmPlexMono = localFont({
  adjustFontFallback: false,
  src: [
    { path: "./ibm-plex-mono-400.woff2", weight: "400" },
    { path: "./ibm-plex-mono-500.woff2", weight: "500" },
    { path: "./ibm-plex-mono-600.woff2", weight: "600" },
  ],
  variable: "--font-ibm-plex-mono",
  fallback: ["IBM Plex Mono Fallback"],
});
