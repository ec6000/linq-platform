import Link from "next/link";
import { ArrowRight, Clock, MessageSquare, ShieldCheck, Target } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import SectionHeading from "./SectionHeading";

const customerBenefits = [
  {
    icon: Target,
    title: "Passend statt zufällig",
    text: "Beschreibe deinen Auftrag einmal – nur Dienstleister, die wirklich passen, melden sich bei dir.",
  },
  {
    icon: Clock,
    title: "Schnell zum Termin",
    text: "Die ersten Angebote kommen meist innerhalb weniger Stunden. Kein tagelanges Warten.",
  },
  {
    icon: MessageSquare,
    title: "Direkter Kontakt",
    text: "Alle Nachrichten, Angebote und Termine an einem Ort. Kein E-Mail-Chaos, kein Telefon-Ping-Pong.",
  },
  {
    icon: ShieldCheck,
    title: "Transparente Profile",
    text: "Sieh Bewertungen, Leistungen und Verfügbarkeiten bevor du dich entscheidest.",
  },
];

export default function ForCustomers() {
  return (
    <section id="fuer-kunden" aria-labelledby="customers-heading" className="band section">
      <div className="shell">
        <Reveal className="mb-14 flex flex-col gap-6 md:mb-16 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="customers-heading"
            eyebrow="Für Kunden"
            title="Finde lokale Hilfe, die wirklich passt."
            description="Ob Umzug am Wochenende oder wöchentliche Reinigung – LiNQ bringt dich in wenigen Minuten mit geeigneten Dienstleistern in Köln zusammen."
          />
          <Link href="/signup" className="link-arrow self-start whitespace-nowrap lg:self-auto">
            Jetzt registrieren
            <ArrowRight size={15} strokeWidth={2.2} aria-hidden />
          </Link>
        </Reveal>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-5">
          {customerBenefits.map(({ icon: Icon, title, text }, index) => (
            <Reveal as="li" key={title} delay={index * 70}>
              <div className="card card-interactive h-full p-6">
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-primary/8 text-primary">
                  <Icon size={18} strokeWidth={1.9} aria-hidden />
                </div>
                <h3 className="mb-2 text-[16px] font-semibold text-primary">{title}</h3>
                <p className="text-[14px] leading-relaxed text-text/62">{text}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
