import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  poweredByHeader: false,

  images: {
    // Seed photos. Provider image URLs render unoptimized, so the optimizer
    // never becomes an open proxy for arbitrary hosts.
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ]
  },

  async redirects() {
    return [
      // Earlier German URLs.
      { source: "/service-finden", destination: "/find-services", permanent: true },
      { source: "/service-finden/:id", destination: "/find-services/:id", permanent: true },
    ]
  },
}

export default nextConfig
