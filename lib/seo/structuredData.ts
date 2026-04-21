const SITE_URL = "https://linq.de";

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "LiNQ",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
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
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/suche?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
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
  image: `${SITE_URL}/og-image.png`,
};