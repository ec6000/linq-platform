import { Expletus_Sans, Inter } from "next/font/google"

/**
 * Display / Brand face.
 * Carries the LiNQ signature: the logo and the big editorial headlines.
 * Used sparingly – everything else runs on the neutral UI face.
 */
export const expletus = Expletus_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-display",
})

/**
 * UI face. Variable weight, optical sizing, tabular figures for prices.
 */
export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ui",
})

export const fontVariables = `${inter.variable} ${expletus.variable}`
