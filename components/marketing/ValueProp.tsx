import SectionHeading from "./SectionHeading";

export default function ValueProp() {
  return (
    <section
      id="was-ist-linq"
      aria-labelledby="value-prop-heading"
      className="py-20 md:py-28"
    >
      <div className="mx-auto max-w-[1280px] px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Was ist LiNQ"
              title="Die direkte Verbindung zwischen Hilfe und Bedarf."
            />
          </div>

          <div className="lg:col-span-7 flex flex-col gap-5">
            <p
              className="text-[18px] md:text-[20px] leading-[1.55]"
              style={{ color: "var(--text)" }}
            >
              LiNQ ist eine Plattform für lokale Dienstleistungen im Alltag – von der
              Wohnungsreinigung bis zum Umzug. Du beschreibst, was du brauchst.
              Passende Dienstleister in deiner Nähe melden sich direkt bei dir.
            </p>
            <p
              className="text-[15.5px] md:text-[16px] leading-relaxed"
              style={{ color: "var(--text)", opacity: 0.65 }}
            >
              Keine endlose Suche. Keine unklaren Kleinanzeigen. Kein Hin und Her.
              Stattdessen ein strukturierter Ablauf, klare Preise und transparente
              Kommunikation – entwickelt für Köln, gebaut für den Alltag.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
