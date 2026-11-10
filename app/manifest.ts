import type { MetadataRoute } from "next"

/** Lets people put LiNQ on their home screen. It opens on the login, which forwards whoever is signed in. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LiNQ – Umzugshilfe in Köln",
    short_name: "LiNQ",
    description: "Helfer aus Köln schicken dir ihren Preis. Du suchst dir einen aus.",
    lang: "de",
    start_url: "/login",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }
}
