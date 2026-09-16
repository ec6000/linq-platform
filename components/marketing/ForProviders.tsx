import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import SectionHeading from "./SectionHeading";

const providerBenefits = [
  {
    title: "Aufträge direkt aus deiner Nachbarschaft",
    text: "Sieh neue Aufträge in Köln in Echtzeit und reagiere, wenn es passt.",
  },
  {
    title: "Sichtbar werden ohne Werbebudget",
    text: "Dein Profil erscheint dort, wo Menschen aktiv nach deiner Leistung suchen.",
  },
  {
    title: "Struktur statt Bauchgefühl",
    text: "Termine, Nachrichten und Rechnungen zentral – von der Anfrage bis zur Abrechnung.",
  },
  {
    title: "Frei entscheiden, was du annimmst",
    text: "Kein Zwang, kein Bieterdruck. Du wählst aus, was zu dir und deinem Kalender passt.",
  },
];

export default function ForProviders() {
  return (
    <section id="fuer-dienstleister" aria-labelledby="providers-heading" className="section">
      <div className="shell">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-20">
          <Reveal className="order-2 lg:order-1 lg:col-span-5">
            <ProviderVisual />
          </Reveal>

          <div className="order-1 lg:order-2 lg:col-span-7">
            <Reveal>
              <SectionHeading
                id="providers-heading"
                eyebrow="Für Dienstleister"
                title="Mehr Aufträge. Weniger Akquise."
                description="Ob solo-selbstständig oder kleines Team – LiNQ bringt dich mit Kunden in Köln zusammen, die deine Leistung wirklich brauchen."
              />
            </Reveal>

            <ul className="mt-10 flex flex-col gap-6">
              {providerBenefits.map(({ title, text }, index) => (
                <Reveal as="li" key={title} delay={80 + index * 70}>
                  <div className="flex items-start gap-4">
                    <span
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/14 text-accent-ink"
                      aria-hidden
                    >
                      <Check size={13} strokeWidth={3} />
                    </span>
                    <div>
                      <h3 className="mb-1 text-[16px] font-semibold text-primary">{title}</h3>
                      <p className="text-[14.5px] leading-relaxed text-text/62">{text}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ul>

            <Reveal delay={360} className="mt-11 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="btn btn-primary btn-lg">
                Kostenlos registrieren
                <ArrowRight size={16} strokeWidth={2.2} aria-hidden />
              </Link>
              <Link href="/login" className="btn btn-outline btn-lg">
                Anmelden
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

const openJobs = [
  { title: "Wohnungsreinigung", district: "Sülz", price: "85 €", fresh: true },
  { title: "Möbelaufbau IKEA", district: "Nippes", price: "60 €" },
  { title: "Gartenpflege", district: "Lindenthal", price: "120 €" },
];

/** A glimpse of the provider feed: what lands on their screen, nothing more. */
function ProviderVisual() {
  return (
    <div className="card p-6 shadow-md md:p-7">
      <div className="mb-5 flex items-center justify-between">
        <span className="text-[13px] font-semibold text-primary">Offene Aufträge in Köln</span>
        <span className="pill pill-accent">
          <span className="dot-live" aria-hidden />
          Live
        </span>
      </div>

      <ul className="flex flex-col gap-2.5">
        {openJobs.map((job) => (
          <li
            key={job.title}
            className="flex items-center justify-between gap-4 rounded-md border px-4 py-3.5"
            style={{
              borderColor: job.fresh
                ? "color-mix(in srgb, var(--accent) 34%, transparent)"
                : "var(--secondary)",
              background: job.fresh
                ? "color-mix(in srgb, var(--accent) 5%, transparent)"
                : "transparent",
            }}
          >
            <div className="min-w-0">
              <span className="block truncate text-[14px] font-medium text-primary">
                {job.title}
              </span>
              <span className="block text-[12px] text-text/50">{job.district}, Köln</span>
            </div>
            <span className="num text-[14px] font-semibold text-primary">{job.price}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
