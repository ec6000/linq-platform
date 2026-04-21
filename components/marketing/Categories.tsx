import {
  Sparkles,
  Truck,
  Leaf,
  Hammer,
  HomeIcon,
  Wrench,
  Paintbrush,
  Package,
} from "lucide-react";
import SectionHeading from "./SectionHeading";

const categories = [
  {
    icon: Sparkles,
    name: "Reinigung",
    description: "Wohnung, Büro, Grundreinigung",
  },
  {
    icon: Truck,
    name: "Umzugshilfe",
    description: "Tragen, Transport, Montage",
  },
  {
    icon: Leaf,
    name: "Gartenarbeit",
    description: "Pflege, Hecken, Beete",
  },
  {
    icon: Hammer,
    name: "Möbelaufbau",
    description: "IKEA, Maßmöbel, Einrichtung",
  },
  {
    icon: HomeIcon,
    name: "Haushaltshilfe",
    description: "Einkauf, Organisation, Alltag",
  },
  {
    icon: Wrench,
    name: "Kleine Reparaturen",
    description: "Lampen, Regale, Kleinkram",
  },
  {
    icon: Paintbrush,
    name: "Renovierung",
    description: "Streichen, Tapezieren, Verschönern",
  },
  {
    icon: Package,
    name: "Weitere Services",
    description: "Alltagsaufgaben, Botengänge, Hilfe",
  },
];

export default function Categories() {
  return (
    <section
      id="kategorien"
      aria-labelledby="categories-heading"
      className="py-20 md:py-28"
      style={{
        background: "color-mix(in srgb, var(--primary) 3%, transparent)",
      }}
    >
      <div className="mx-auto max-w-[1280px] px-6 md:px-10">
        <SectionHeading
          eyebrow="Kategorien"
          title="Für so ziemlich alles im Alltag."
          description="Die häufigsten Bereiche auf LiNQ – und es werden laufend mehr, während die Community wächst."
          align="center"
        />

        <ul className="mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {categories.map(({ icon: Icon, name, description }) => (
            <li
              key={name}
              className="group rounded-2xl bg-background p-5 md:p-6 transition-all duration-200 cursor-default"
              style={{ border: "1px solid var(--secondary)" }}
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl mb-4 transition-all duration-200"
                style={{
                  background: "color-mix(in srgb, var(--accent) 10%, transparent)",
                  color: "var(--accent)",
                }}
              >
                <Icon size={20} strokeWidth={1.9} />
              </div>
              <h3
                className="text-[15px] font-semibold mb-1"
                style={{ color: "var(--primary)" }}
              >
                {name}
              </h3>
              <p
                className="text-[13px] leading-relaxed"
                style={{ color: "var(--text)", opacity: 0.6 }}
              >
                {description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
