import { MapPin } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
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
    <section id="lokal-koeln" aria-labelledby="local-heading" className="band section">
      <div className="shell">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-6">
            <SectionHeading
              id="local-heading"
              eyebrow="Lokal in Köln"
              title="Gebaut für Köln. Und für alles, was Köln braucht."
              description="LiNQ startet dort, wo wir selbst zuhause sind. Von Ehrenfeld über Sülz bis Mülheim konzentriert sich die Plattform bewusst auf das lokale Umfeld – damit Wege kurz und die Verbindungen echt bleiben."
            />

            <p className="mt-7 max-w-xl text-[15px] leading-relaxed text-text/60">
              Ob du in Deutz wohnst und Hilfe beim Umzug brauchst oder in Lindenthal deine
              Terrasse machen lassen willst – wir verbinden dich mit Menschen aus deinem Veedel.
            </p>
          </Reveal>

          <Reveal delay={120} className="lg:col-span-6">
            <div className="card bg-background p-7 md:p-8">
              <p className="eyebrow eyebrow-plain mb-6">
                <MapPin size={13} strokeWidth={2.2} aria-hidden />
                Verfügbar in
              </p>

              <ul className="flex flex-wrap gap-2">
                {districts.map((district) => (
                  <li
                    key={district}
                    className="rounded-full border border-secondary px-3.5 py-1.5 text-[13.5px] font-medium text-primary transition-colors duration-200 hover:border-accent/50 hover:bg-accent/6"
                  >
                    {district}
                  </li>
                ))}
              </ul>

              <p className="mt-7 text-[13px] leading-relaxed text-text/50">
                Dein Veedel ist nicht dabei? Trag dich ein – wir erweitern Köln Stück für Stück.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
