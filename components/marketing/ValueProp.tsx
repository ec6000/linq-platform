import Reveal from "@/components/motion/Reveal";
import SectionHeading from "./SectionHeading";

export default function ValueProp() {
  return (
    <section id="was-ist-linq" aria-labelledby="value-prop-heading" className="section">
      <div className="shell">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <SectionHeading
              id="value-prop-heading"
              eyebrow="Was ist LiNQ"
              title="Die direkte Verbindung zwischen Hilfe und Bedarf."
            />
          </Reveal>

          <Reveal delay={100} className="flex flex-col gap-6 lg:col-span-7">
            <p className="text-[19px] leading-[1.6] text-text md:text-[21px]">
              LiNQ ist eine Plattform für lokale Dienstleistungen im Alltag – von der
              Wohnungsreinigung bis zum Umzug. Du beschreibst, was du brauchst. Passende
              Dienstleister in deiner Nähe melden sich direkt bei dir.
            </p>
            <p className="text-[16px] leading-relaxed text-text/60">
              Keine endlose Suche. Keine unklaren Kleinanzeigen. Kein Hin und Her. Stattdessen
              ein strukturierter Ablauf, klare Preise und transparente Kommunikation –
              entwickelt für Köln, gebaut für den Alltag.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
