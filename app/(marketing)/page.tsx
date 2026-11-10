import type { Metadata } from "next";
import Hero from "@/components/marketing/Hero";
import ForProviders from "@/components/marketing/ForProviders";
import HowItWorks from "@/components/marketing/HowItWorks";
import Trust from "@/components/marketing/Trust";
import LocalFocus from "@/components/marketing/LocalFocus";
import FinalCTA from "@/components/marketing/FinalCTA";
import {
  SITE_URL,
  organizationSchema,
  websiteSchema,
  localBusinessSchema,
} from "@/lib/seo/structuredData";


export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { absolute: "LiNQ – Umzugshilfe in Köln, direkt vom Helfer" },
  description:
    "Beschreib deinen Umzug in zwei Minuten. Helfer aus Köln schicken dir ihren Preis, du suchst dir einen aus. Kostenlos, deine Adresse bleibt privat.",
  keywords: ["Umzugshilfe Köln", "Umzugshelfer Köln", "Möbel tragen Köln", "Kleintransport Köln", "Entrümpelung Köln"],
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
    title: "LiNQ – Umzugshilfe in Köln",
    description: "Helfer aus Köln schicken dir ihren Preis. Du suchst dir einen aus.",
  },
  twitter: {
    card: "summary",
    title: "LiNQ – Umzugshilfe in Köln",
    description: "Helfer aus Köln schicken dir ihren Preis. Du suchst dir einen aus.",
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
  category: "Umzugshilfe",
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
      <HowItWorks />
      <ForProviders />
      <Trust />
      <LocalFocus />
      <FinalCTA />
    </>
  );
}
