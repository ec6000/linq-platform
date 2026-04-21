import SectionHeading from "./SectionHeading";

const steps = [
  {
    step: "01",
    title: "Auftrag beschreiben",
    text:
      "In wenigen Feldern sagst du, was gemacht werden soll, wo und wann. Dauert keine zwei Minuten.",
  },
  {
    step: "02",
    title: "Angebote erhalten",
    text:
      "Passende Dienstleister aus Köln reagieren mit Preis und Vorschlag. Du vergleichst in Ruhe.",
  },
  {
    step: "03",
    title: "Direkt umsetzen",
    text:
      "Termin bestätigen, Leistung erledigen, fertig. Alles an einem Ort – transparent und ohne Umwege.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="so-funktionierts"
      aria-labelledby="how-heading"
      className="py-20 md:py-28"
    >
      <div className="mx-auto max-w-[1280px] px-6 md:px-10">
        <SectionHeading
          eyebrow="So funktioniert's"
          title="Drei Schritte bis zur erledigten Aufgabe."
          description="Wir haben LiNQ so einfach gemacht wie möglich – damit der eigentliche Job wieder im Mittelpunkt steht."
          align="center"
        />

        <ol className="mt-14 md:mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative">
          {/* Verbindungslinie desktop */}
          <div
            className="hidden md:block absolute top-7 left-[16.66%] right-[16.66%] h-px"
            style={{ background: "var(--secondary)" }}
            aria-hidden
          />

          {steps.map(({ step, title, text }) => (
            <li key={step} className="relative flex flex-col items-start md:items-center md:text-center">
              <div
                className="relative flex h-14 w-14 items-center justify-center rounded-full text-[14px] font-semibold mb-6"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--secondary)",
                  color: "var(--primary)",
                }}
              >
                {step}
              </div>
              <h3
                className="text-[18px] md:text-[19px] font-semibold mb-2"
                style={{ color: "var(--primary)" }}
              >
                {title}
              </h3>
              <p
                className="text-[15px] leading-relaxed max-w-sm"
                style={{ color: "var(--text)", opacity: 0.68 }}
              >
                {text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
