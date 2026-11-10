import { Euro, Handshake, Lock, MapPinOff } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import SectionHeading from "./SectionHeading";

const trustPoints = [
  {
    icon: MapPinOff,
    title: "Deine Adresse bleibt privat",
    text: "Dienstleister sehen nur den Stadtteil. Die genaue Adresse bekommt nur, wen du beauftragst.",
  },
  {
    icon: Euro,
    title: "Der Preis steht vorher fest",
    text: "Du siehst jeden Preis, bevor du zusagst. Ohne deine Zusage ist nichts vereinbart.",
  },
  {
    icon: Handshake,
    title: "Kontakt erst nach Zusage",
    text: "Telefon und E-Mail werden erst ausgetauscht, wenn beide Seiten zugestimmt haben.",
  },
  {
    icon: Lock,
    title: "Keine Werbung, kein Tracking",
    text: "Keine Werbenetzwerke, kein Weiterverkauf von Daten. Wir speichern nur, was der Ablauf braucht.",
  },
];

export default function Trust() {
  return (
    <section id="vertrauen" aria-labelledby="trust-heading" className="section">
      <div className="shell">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <SectionHeading
              id="trust-heading"
              eyebrow="Warum LiNQ"
              title="Vertrauen, das man nicht versprechen muss."
              description="Eine Plattform wird nicht durch Marketing sicher, sondern durch den Ablauf. Deshalb steckt der Schutz im Ablauf selbst."
            />
          </Reveal>

          <ul className="flex flex-col lg:col-span-7">
            {trustPoints.map(({ icon: Icon, title, text }, index) => (
              <Reveal
                as="li"
                key={title}
                delay={index * 70}
                className="border-t border-secondary py-6 first:border-t-0 first:pt-0"
              >
                <div className="flex items-start gap-5">
                  <Icon
                    size={19}
                    strokeWidth={1.8}
                    aria-hidden
                    className="mt-0.5 flex-none text-accent-ink"
                  />
                  <div>
                    <h3 className="mb-1.5 text-[16px] font-semibold text-primary">{title}</h3>
                    <p className="text-[14.5px] leading-relaxed text-text/62">{text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
