import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
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
    <section
      id="fuer-dienstleister"
      aria-labelledby="providers-heading"
      className="py-20 md:py-28"
    >
      <div className="mx-auto max-w-[1280px] px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          {/* Visueller Block links */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <ProviderVisual />
          </div>

          {/* Content rechts */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <SectionHeading
              eyebrow="Für Dienstleister"
              title="Mehr Aufträge. Weniger Akquise."
              description="Ob Solo-Selbstständig oder kleines Team – LiNQ bringt dich mit Kunden in Köln zusammen, die deine Leistung wirklich brauchen."
            />

            <ul className="mt-10 flex flex-col gap-5">
              {providerBenefits.map(({ title, text }) => (
                <li key={title} className="flex items-start gap-4">
                  <div
                    className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: "color-mix(in srgb, var(--accent) 14%, transparent)",
                      color: "var(--accent)",
                    }}
                    aria-hidden
                  >
                    <Check size={13} strokeWidth={3} />
                  </div>
                  <div>
                    <h3
                      className="text-[16px] font-semibold mb-1"
                      style={{ color: "var(--primary)" }}
                    >
                      {title}
                    </h3>
                    <p
                      className="text-[14.5px] leading-relaxed"
                      style={{ color: "var(--text)", opacity: 0.65 }}
                    >
                      {text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-[15px] font-semibold transition-all duration-150"
                style={{
                  background: "var(--primary)",
                  color: "#ffffff",
                }}
              >
                Kostenlos registrieren
                <ArrowRight
                  size={16}
                  strokeWidth={2.2}
                  className="transition-transform duration-150 group-hover:translate-x-0.5"
                />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-[15px] font-semibold transition-all duration-150"
                style={{
                  background: "transparent",
                  color: "var(--primary)",
                  border: "1px solid var(--secondary)",
                }}
              >
                Anmelden
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Dienstleister-Dashboard-artige Visualisierung */
function ProviderVisual() {
  const items = [
    { title: "Wohnungsreinigung", district: "Sülz", price: "85 €", badge: "Neu" },
    { title: "Möbelaufbau IKEA", district: "Nippes", price: "60 €" },
    { title: "Gartenpflege", district: "Lindenthal", price: "120 €" },
  ];

  return (
    <div
      className="rounded-2xl bg-background p-6 md:p-7 shadow-[0_10px_40px_-20px_rgba(10,27,61,0.2)]"
      style={{ border: "1px solid var(--secondary)" }}
    >
      <div className="flex items-center justify-between mb-5">
        <span
          className="text-[13px] font-semibold"
          style={{ color: "var(--primary)" }}
        >
          Offene Aufträge in Köln
        </span>
        <span
          className="text-[11px] font-medium"
          style={{ color: "var(--text)", opacity: 0.5 }}
        >
          Live
        </span>
      </div>

      <ul className="flex flex-col gap-3">
        {items.map((item, idx) => (
          <li
            key={item.title}
            className="flex items-center justify-between rounded-xl px-4 py-3.5"
            style={{
              border: "1px solid var(--secondary)",
              background:
                idx === 0 ? "color-mix(in srgb, var(--accent) 5%, transparent)" : "transparent",
            }}
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span
                  className="text-[14px] font-medium"
                  style={{ color: "var(--primary)" }}
                >
                  {item.title}
                </span>
                {item.badge && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{
                      background: "color-mix(in srgb, var(--accent) 15%, transparent)",
                      color: "var(--accent)",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className="text-[12px]"
                style={{ color: "var(--text)", opacity: 0.55 }}
              >
                {item.district}, Köln
              </span>
            </div>
            <span
              className="text-[14px] font-semibold"
              style={{ color: "var(--primary)" }}
            >
              {item.price}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}