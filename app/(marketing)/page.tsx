// app/page.tsx
import type { Metadata } from "next";
import Hero from "@/components/marketing/Hero";
import TrustStrip from "@/components/marketing/TrustStrip";
import ValueProp from "@/components/marketing/ValueProp";
import ForCustomers from "@/components/marketing/ForCustomers";
import ForProviders from "@/components/marketing/ForProviders";
import Categories from "@/components/marketing/Categories";
import HowItWorks from "@/components/marketing/HowItWorks";
import Trust from "@/components/marketing/Trust";
import LocalFocus from "@/components/marketing/LocalFocus";
import FinalCTA from "@/components/marketing/FinalCTA";
import {
  organizationSchema,
  websiteSchema,
  localBusinessSchema,
} from "@/lib/seo/structuredData";

const SITE_URL = "https://linq.de";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "LiNQ – Lokale Dienstleister in Köln finden | Hilfe, die passt.",
  description:
    "Reinigung, Umzug, Gartenarbeit, Möbelaufbau: Finde zuverlässige Dienstleister in Köln – oder veröffentliche deinen Auftrag in Minuten. Lokal, direkt, unkompliziert.",
  keywords: [
    "Dienstleister Köln",
    "lokale Dienstleistungen",
    "Umzugshilfe Köln",
    "Reinigung Köln",
    "Gartenarbeit Köln",
    "Möbelaufbau Köln",
    "Haushaltshilfe Köln",
    "Aufträge finden Köln",
    "Handwerker Köln",
  ],
  authors: [{ name: "LiNQ" }],
  creator: "LiNQ",
  publisher: "LiNQ",
  alternates: {
    canonical: "/",
    languages: {
      "de-DE": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: SITE_URL,
    siteName: "LiNQ",
    title: "LiNQ – Lokale Dienstleister in Köln finden",
    description:
      "Die einfachste Art, lokale Hilfe in Köln zu finden oder als Dienstleister neue Aufträge zu bekommen.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LiNQ – Lokale Dienstleistungen in Köln",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LiNQ – Lokale Dienstleister in Köln finden",
    description:
      "Reinigung, Umzug, Gartenarbeit & mehr. Lokale Hilfe, die passt.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "Lokale Dienstleistungen",
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            organizationSchema,
            websiteSchema,
            localBusinessSchema,
          ]),
        }}
      />

      <Hero />
      <TrustStrip />
      <ValueProp />
      <ForCustomers />
      <ForProviders />
      <Categories />
      <HowItWorks />
      <Trust />
      <LocalFocus />
      <FinalCTA />
    </>
  );
}