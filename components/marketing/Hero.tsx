import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Expletus_Sans } from "next/font/google";

const expletus = Expletus_Sans({
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Subtiler Hintergrund – ruhiger Verlauf, kein Gradient-Kitsch */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 60% at 50% -10%, color-mix(in srgb, var(--accent) 10%, transparent) 0%, transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[1px]"
        style={{ background: "var(--secondary)", opacity: 0 }}
      />

      <div className="relative mx-auto max-w-[1280px] px-6 md:px-10 pt-14 md:pt-24 pb-16 md:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-7 flex flex-col gap-7">
            <div
              className="inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5 text-[12px] font-medium"
              style={{
                background: "color-mix(in srgb, var(--primary) 6%, transparent)",
                color: "var(--primary)",
                border: "1px solid color-mix(in srgb, var(--primary) 10%, transparent)",
              }}
            >
              <MapPin size={13} strokeWidth={2.2} aria-hidden />
              Jetzt gestartet in Köln
            </div>

            <h1
              className={`${expletus.className} text-[42px] sm:text-[54px] md:text-[64px] leading-[1.02] tracking-tight`}
              style={{ color: "var(--primary)" }}
            >
              Lokale Hilfe.{" "}
              <span style={{ color: "var(--accent)" }}>Ohne Umwege.</span>
            </h1>

            <p
              className="max-w-xl text-[17px] md:text-[19px] leading-relaxed"
              style={{ color: "var(--text)", opacity: 0.72 }}
            >
              LiNQ verbindet Kölner mit geprüften Dienstleistern für Reinigung, Umzug,
              Gartenarbeit und mehr. Auftrag in Minuten veröffentlichen – passende
              Angebote direkt erhalten.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-[15px] font-medium transition-all duration-150"
                style={{
                  background: "var(--primary)",
                  color: "#ffffff",
                }}
              >
                Kostenlos registrieren
                <ArrowRight
                  size={17}
                  strokeWidth={2.2}
                  className="transition-transform duration-150 group-hover:translate-x-0.5"
                />
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-[15px] font-medium transition-all duration-150"
                style={{
                  background: "transparent",
                  color: "var(--primary)",
                  border: "1px solid var(--secondary)",
                }}
              >
                Anmelden
              </Link>
            </div>

            <div
              className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 text-[13px]"
              style={{ color: "var(--text)", opacity: 0.55 }}
            >
              <span className="flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: "var(--accent)" }}
                  aria-hidden
                />
                Kostenlos registrieren
              </span>
              <span className="flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: "var(--accent)" }}
                  aria-hidden
                />
                Keine Abo-Falle
              </span>
              <span className="flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: "var(--accent)" }}
                  aria-hidden
                />
                Direkter Kontakt
              </span>
            </div>
          </div>

          {/* Rechte Seite: visuelle Komposition – stilisierte Karten, keine Stock-Bilder */}
          <div className="lg:col-span-5 relative">
            <HeroVisual />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      {/* Hintergrund-Karte */}
      <div
        className="absolute -right-4 top-8 h-[260px] w-[220px] rounded-2xl"
        style={{
          background: "color-mix(in srgb, var(--accent) 8%, transparent)",
          border: "1px solid color-mix(in srgb, var(--accent) 20%, transparent)",
        }}
        aria-hidden
      />

      {/* Haupt-Karte: "Auftrag" */}
      <div
        className="relative rounded-2xl bg-background p-6 shadow-[0_10px_40px_-20px_rgba(10,27,61,0.25)]"
        style={{ border: "1px solid var(--secondary)" }}
      >
        <div className="flex items-center justify-between">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
            style={{
              background: "color-mix(in srgb, var(--accent) 12%, transparent)",
              color: "var(--accent)",
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full animate-pulse"
              style={{ background: "var(--accent)" }}
              aria-hidden
            />
            Neuer Auftrag
          </span>
          <span
            className="text-[12px]"
            style={{ color: "var(--text)", opacity: 0.5 }}
          >
            Ehrenfeld, Köln
          </span>
        </div>

        <h3
          className="mt-4 text-[17px] font-semibold leading-snug"
          style={{ color: "var(--primary)" }}
        >
          Umzugshilfe für 2-Zimmer-Wohnung
        </h3>
        <p
          className="mt-1.5 text-[13.5px] leading-relaxed"
          style={{ color: "var(--text)", opacity: 0.6 }}
        >
          Samstag Vormittag, ca. 3 Stunden. Zwei helfende Hände gesucht.
        </p>

        <div
          className="my-5 h-px"
          style={{ background: "var(--secondary)" }}
          aria-hidden
        />

        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-7 w-7 rounded-full ring-2 flex items-center justify-center text-[10px] font-semibold"
                style={{
                  background: `color-mix(in srgb, var(--primary) ${10 + i * 4}%, transparent)`,
                  color: "var(--primary)",
                  boxShadow: "0 0 0 2px var(--background)",
                }}
              >
                {["M", "S", "A"][i]}
              </div>
            ))}
          </div>
          <span
            className="text-[12px]"
            style={{ color: "var(--text)", opacity: 0.6 }}
          >
            3 Angebote erhalten
          </span>
        </div>
      </div>

      {/* Kleine schwebende Karte: Bewertung */}
      <div
        className="absolute -bottom-6 -left-4 max-w-[220px] rounded-2xl bg-background p-4 shadow-[0_10px_30px_-15px_rgba(10,27,61,0.25)]"
        style={{ border: "1px solid var(--secondary)" }}
        aria-hidden
      >
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-full flex items-center justify-center text-[13px] font-semibold"
            style={{
              background: "color-mix(in srgb, var(--primary) 10%, transparent)",
              color: "var(--primary)",
            }}
          >
            LR
          </div>
          <div className="flex flex-col">
            <span
              className="text-[13px] font-semibold"
              style={{ color: "var(--primary)" }}
            >
              Lena R.
            </span>
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <svg
                  key={i}
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="var(--accent)"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
        <p
          className="mt-2 text-[12px] leading-snug"
          style={{ color: "var(--text)", opacity: 0.65 }}
        >
          „Termin direkt bestätigt. Alles top geklappt."
        </p>
      </div>
    </div>
  );
}