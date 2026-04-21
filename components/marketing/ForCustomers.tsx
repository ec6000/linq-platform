import Link from "next/link";
import { ArrowRight, Clock, MessageSquare, ShieldCheck, Target } from "lucide-react";
import SectionHeading from "./SectionHeading";

const customerBenefits = [
  {
    icon: Target,
    title: "Passend statt zufällig",
    text:
      "Beschreibe deinen Auftrag einmal – nur Dienstleister, die wirklich passen, melden sich bei dir.",
  },
  {
    icon: Clock,
    title: "Schnell zum Termin",
    text:
      "Die ersten Angebote kommen meist innerhalb weniger Stunden. Kein tagelanges Warten.",
  },
  {
    icon: MessageSquare,
    title: "Direkter Kontakt",
    text:
      "Alle Nachrichten, Angebote und Termine an einem Ort. Kein E-Mail-Chaos, kein Telefon-Ping-Pong.",
  },
  {
    icon: ShieldCheck,
    title: "Transparente Profile",
    text:
      "Sieh Bewertungen, Leistungen und Verfügbarkeiten bevor du dich entscheidest.",
  },
];

export default function ForCustomers() {
  return (
    <section
      id="fuer-kunden"
      aria-labelledby="customers-heading"
      className="py-20 md:py-28"
      style={{
        background: "color-mix(in srgb, var(--primary) 3%, transparent)",
      }}
    >
      <div className="mx-auto max-w-[1280px] px-6 md:px-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12 md:mb-16">
          <SectionHeading
            eyebrow="Für Kunden"
            title="Finde lokale Hilfe, die wirklich passt."
            description="Ob Umzug am Wochenende oder wöchentliche Reinigung – LiNQ bringt dich in wenigen Minuten mit geeigneten Dienstleistern in Köln zusammen."
          />
          <Link
            href="/signup"
            className="group inline-flex self-start lg:self-auto items-center gap-2 text-[14px] font-semibold whitespace-nowrap"
            style={{ color: "var(--primary)" }}
          >
            Jetzt registrieren
            <ArrowRight
              size={15}
              strokeWidth={2.2}
              className="transition-transform duration-150 group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {customerBenefits.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="group rounded-2xl bg-background p-6 transition-all duration-200"
              style={{ border: "1px solid var(--secondary)" }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl mb-5"
                style={{
                  background: "color-mix(in srgb, var(--primary) 8%, transparent)",
                  color: "var(--primary)",
                }}
              >
                <Icon size={18} strokeWidth={2} />
              </div>
              <h3
                className="text-[16px] font-semibold mb-2"
                style={{ color: "var(--primary)" }}
              >
                {title}
              </h3>
              <p
                className="text-[14px] leading-relaxed"
                style={{ color: "var(--text)", opacity: 0.68 }}
              >
                {text}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}