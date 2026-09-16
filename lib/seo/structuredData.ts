export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "LiNQ",
  url: SITE_URL,
  description:
    "LiNQ ist eine Plattform für lokale Dienstleistungen in Köln. Kunden finden passende Dienstleister, Dienstleister finden lokale Aufträge.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Köln",
    addressRegion: "NRW",
    addressCountry: "DE",
  },
  sameAs: [] as string[],
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "LiNQ",
  url: SITE_URL,
  inLanguage: "de-DE",

};

export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "LiNQ",
  url: SITE_URL,
  description:
    "Plattform für lokale Dienstleistungen in Köln: Reinigung, Umzugshilfe, Gartenarbeit, Möbelaufbau, Haushaltshilfe und mehr.",
  areaServed: {
    "@type": "City",
    name: "Köln",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Köln",
    addressRegion: "NRW",
    addressCountry: "DE",
  },
  priceRange: "€€",
};
