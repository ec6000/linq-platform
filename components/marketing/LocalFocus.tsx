import { MapPin } from "lucide-react";
import SectionHeading from "./SectionHeading";

const districts = [
  "Innenstadt",
  "Ehrenfeld",
  "Nippes",
  "Sülz",
  "Lindenthal",
  "Deutz",
  "Mülheim",
  "Kalk",
  "Rodenkirchen",
  "Chorweiler",
  "Porz",
  "Bayenthal",
];

export default function LocalFocus() {
  return (
    <section
      id="lokal-koeln"
      aria-labelledby="local-heading"
      className="py-20 md:py-28 relative overflow-hidden"
      style={{
        background: "color-mix(in srgb, var(--primary) 4%, transparent)",
      }}
    >
      <div className="mx-auto max-w-[1280px] px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-6">
            <SectionHeading
              eyebrow="Lokal in Köln"
              title="Gebaut für Köln. Und für alles, was Köln braucht."
              description={
                <>
                  LiNQ startet dort, wo wir selbst zuhause sind: in Köln. Von Ehrenfeld
                  über Sülz bis Mülheim – unsere Plattform konzentriert sich bewusst auf
                  das lokale Umfeld, damit Wege kurz, Anfahrten schnell und die
                  Verbindungen echt bleiben.
                </>
              }
            />

            <p
              className="mt-6 text-[15px] leading-relaxed max-w-xl"
              style={{ color: "var(--text)", opacity: 0.65 }}
            >
              Ob du in Deutz wohnst und Hilfe beim Umzug brauchst oder in Lindenthal
              deine Terrasse machen lassen willst – wir verbinden dich mit Menschen aus
              deinem Veedel.
            </p>
          </div>

          <div className="lg:col-span-6">
            <div
              className="rounded-2xl bg-background p-6 md:p-8"
              style={{ border: "1px solid var(--secondary)" }}
            >
              <div
                className="flex items-center gap-2 mb-6 text-[13px] font-semibold uppercase tracking-[0.12em]"
                style={{ color: "var(--accent)" }}
              >
                <MapPin size={14} strokeWidth={2.2} aria-hidden />
                Verfügbar in
              </div>

              <ul className="flex flex-wrap gap-2">
                {districts.map((district) => (
                  <li
                    key={district}
                    className="rounded-full px-4 py-2 text-[13.5px] font-medium"
                    style={{
                      background: "color-mix(in srgb, var(--primary) 6%, transparent)",
                      color: "var(--primary)",
                      border: "1px solid color-mix(in srgb, var(--primary) 10%, transparent)",
                    }}
                  >
                    {district}
                  </li>
                ))}
              </ul>

              <p
                className="mt-6 text-[13px] leading-relaxed"
                style={{ color: "var(--text)", opacity: 0.55 }}
              >
                Dein Veedel ist nicht dabei? Trag dich ein – wir erweitern Köln Stück für
                Stück.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
