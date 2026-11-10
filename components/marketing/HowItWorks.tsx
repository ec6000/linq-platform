import Reveal from "@/components/motion/Reveal";
import SectionHeading from "./SectionHeading";

const steps = [
  {
    step: "01",
    title: "Umzug beschreiben",
    text: "Was getragen werden soll, wo und wann. Dauert keine zwei Minuten.",
  },
  {
    step: "02",
    title: "Preise vergleichen",
    text: "Helfer aus Köln schicken dir ihren Preis. Du vergleichst in Ruhe und sagst einem zu.",
  },
  {
    step: "03",
    title: "Direkt loslegen",
    text: "Mit der Zusage bekommt ihr gegenseitig Telefon und E-Mail. Den Rest klärt ihr direkt.",
  },
];

export default function HowItWorks() {
  return (
    <section id="so-funktionierts" aria-labelledby="how-heading" className="section">
      <div className="shell">
        <Reveal>
          <SectionHeading
            id="how-heading"
            eyebrow="So funktioniert's"
            title="Drei Schritte bis zum erledigten Umzug."
            description="So einfach wie möglich, damit der eigentliche Umzug im Mittelpunkt steht."
            align="center"
          />
        </Reveal>

        <ol className="relative mt-16 grid grid-cols-1 gap-12 md:mt-24 md:grid-cols-3 md:gap-10">
          {/* The thread that ties the three steps together. */}
          <div
            aria-hidden
            className="absolute left-[16.66%] right-[16.66%] top-6 hidden h-px bg-secondary md:block"
          />

          {steps.map(({ step, title, text }, index) => (
            <Reveal
              as="li"
              key={step}
              delay={index * 110}
              className="relative flex flex-col items-start md:items-center md:text-center"
            >
              <span className="num flex h-12 w-12 items-center justify-center rounded-full border border-secondary bg-background text-[13px] font-semibold text-primary">
                {step}
              </span>
              <h3 className="mb-2.5 mt-7 text-[19px] font-semibold text-primary">{title}</h3>
              <p className="max-w-sm text-[15px] leading-relaxed text-text/62">{text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
