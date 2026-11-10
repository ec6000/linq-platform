import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo/structuredData"

/** Only the public pages; everything behind the login is marked noindex in its layout. */
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/impressum", "/datenschutz"].map((path) => ({ url: `${SITE_URL}${path}` }))
}
