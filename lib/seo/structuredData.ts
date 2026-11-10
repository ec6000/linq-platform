export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "LiNQ",
  url: SITE_URL,
  description:
    "LiNQ verbindet Menschen in Köln, die Hilfe beim Umzug brauchen, mit Helfern aus ihrer Nähe.",
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
    "Umzugshilfe in Köln: Helfer aus der Nähe schicken ihren Preis, Kunden suchen sich einen aus.",
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
