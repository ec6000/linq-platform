import { ShieldCheck, Star, Users, Lock } from "lucide-react";
import SectionHeading from "./SectionHeading";

const trustPoints = [
  {
    icon: ShieldCheck,
    title: "Geprüfte Profile",
    text:
      "Jeder Dienstleister verifiziert seine Identität und Kontaktdaten, bevor er Aufträge annehmen kann.",
  },
  {
    icon: Star,
    title: "Ehrliche Bewertungen",
    text:
      "Feedback gibt es nur nach abgeschlossenen Aufträgen. Kein Fake, keine gekauften Sterne.",
  },
  {
    icon: Users,
    title: "Klare Kommunikation",
    text:
      "Alle Nachrichten dokumentiert im Chat. Bei Problemen ist nachvollziehbar, was besprochen wurde.",
  },
  {
    icon: Lock,
    title: "Datenschutz nach DSGVO",
    text:
      "Deine Daten gehören dir. Kein Weiterverkauf, keine Werbenetzwerke, keine versteckten Tracker.",
  },
];

export default function Trust() {
  return (
    <section
      id="vertrauen"
      aria-labelledby="trust-heading"
      className="py-20 md:py-28"
    >
      <div className="mx-auto max-w-[1280px] px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Warum LiNQ"
              title="Vertrauen, das man nicht versprechen muss – sondern strukturell verankert."
              description="Eine gute Plattform wird nicht durch Marketing sicher, sondern durch den Ablauf. Deshalb haben wir Vertrauen in jeden Schritt eingebaut."
            />
          </div>

          <ul className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
            {trustPoints.map(({ icon: Icon, title, text }) => (
              <li
                key={title}
                className="rounded-2xl bg-background p-6 transition-all duration-200"
                style={{ border: "1px solid var(--secondary)" }}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl mb-5"
                  style={{
                    background: "color-mix(in srgb, var(--primary) 8%, transparent)",
                    color: "var(--primary)",
                  }}
                >
                  <Icon size={18} strokeWidth={2} />
                </div>
                <h3
                  className="text-[16px] font-semibold mb-2"
                  style={{ color: "var(--primary)" }}
                >
                  {title}
                </h3>
                <p
                  className="text-[14px] leading-relaxed"
                  style={{ color: "var(--text)", opacity: 0.68 }}
                >
                  {text}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
