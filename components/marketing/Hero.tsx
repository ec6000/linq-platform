import Link from "next/link";
import { ArrowRight, Check, MapPin } from "lucide-react";
import Reveal from "@/components/motion/Reveal";

const assurances = ["Kostenlos registrieren", "Keine Abo-Falle", "Direkter Kontakt"];

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* A single cool glow behind the headline, drifting slower than the eye tracks. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 h-[560px] aurora"
        style={{
          background:
            "radial-gradient(52% 50% at 50% 42%, color-mix(in srgb, var(--accent) 16%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="shell relative pb-20 pt-16 md:pb-28 md:pt-24">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-secondary bg-background/70 px-3.5 py-1.5 text-[12.5px] font-medium text-primary backdrop-blur">
              <MapPin size={13} strokeWidth={2.2} aria-hidden />
              Jetzt gestartet in Köln
            </span>
          </Reveal>

          <Reveal delay={60}>
            <h1 className="display mt-8 text-[46px] leading-[1.02] text-primary sm:text-[62px] md:text-[76px]">
              Lokale Hilfe.
              <br />
              <span className="text-accent-ink">Ohne Umwege.</span>
            </h1>
          </Reveal>

          <Reveal delay={120}>
            <p className="lede mx-auto mt-7 max-w-xl">
              Beschreibe, was du brauchst. Geprüfte Dienstleister aus deinem Veedel melden
              sich direkt bei dir.
            </p>
          </Reveal>

          <Reveal delay={180}>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="btn btn-primary btn-lg">
                Kostenlos registrieren
                <ArrowRight size={17} strokeWidth={2.2} aria-hidden />
              </Link>
              <Link href="/login" className="btn btn-outline btn-lg">
                Anmelden
              </Link>
            </div>
          </Reveal>

          <Reveal delay={240}>
            <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-text/50">
              {assurances.map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <Check size={13} strokeWidth={2.6} className="text-accent-ink" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={280} className="mt-16 md:mt-24">
          <HeroVisual />
        </Reveal>
      </div>
    </section>
  );
}

const offers = [
  { initials: "MS", name: "Marco S.", note: "Kann Samstag ab 9 Uhr", price: "140 €", lead: true },
  { initials: "AK", name: "Aylin K.", note: "Zwei Helfer, Transporter", price: "165 €" },
  { initials: "TB", name: "Tom B.", note: "Auch kurzfristig möglich", price: "120 €" },
];

/**
 * One card, not a collage: the whole product in a single glance —
 * an order goes out, offers come back.
 */
function HeroVisual() {
  return (
    <div className="mx-auto w-full max-w-[720px]">
      <div className="card overflow-hidden shadow-lg">
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between md:p-8">
          <div className="min-w-0">
            <span className="pill pill-accent">
              <span className="dot-live" aria-hidden />
              Neuer Auftrag
            </span>
            <h3 className="mt-3.5 text-[19px] font-semibold leading-snug text-primary">
              Umzugshilfe für 2-Zimmer-Wohnung
            </h3>
            <p className="mt-1.5 text-[14px] leading-relaxed text-text/60">
              Samstag Vormittag, ca. 3 Stunden. Zwei helfende Hände gesucht.
            </p>
          </div>
          <div className="flex items-center gap-1.5 whitespace-nowrap text-[13px] text-text/45 sm:flex-col sm:items-end sm:gap-1">
            <MapPin size={13} strokeWidth={2} aria-hidden />
            Ehrenfeld, Köln
          </div>
        </div>

        <div className="hairline" />

        <div className="bg-muted/60 px-6 py-5 md:px-8">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-text/40">
            3 Angebote erhalten
          </p>

          <ul className="mt-4 flex flex-col gap-2.5">
            {offers.map((offer) => (
              <li
                key={offer.initials}
                className="flex items-center gap-3 rounded-lg border bg-background px-3.5 py-3"
                style={{
                  borderColor: offer.lead
                    ? "color-mix(in srgb, var(--accent) 34%, transparent)"
                    : "var(--secondary)",
                }}
              >
                <span className="avatar h-8 w-8 text-[11px]">{offer.initials}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-medium text-primary">
                    {offer.name}
                  </span>
                  <span className="block truncate text-[12.5px] text-text/50">{offer.note}</span>
                </span>
                <span className="num text-[15px] font-semibold text-primary">{offer.price}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
