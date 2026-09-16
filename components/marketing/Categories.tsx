import {
  Hammer,
  HomeIcon,
  Leaf,
  Package,
  Paintbrush,
  Sparkles,
  Truck,
  Wrench,
} from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import SectionHeading from "./SectionHeading";

const categories = [
  { icon: Sparkles, name: "Reinigung", description: "Wohnung, Büro, Grundreinigung" },
  { icon: Truck, name: "Umzugshilfe", description: "Tragen, Transport, Montage" },
  { icon: Leaf, name: "Gartenarbeit", description: "Pflege, Hecken, Beete" },
  { icon: Hammer, name: "Möbelaufbau", description: "IKEA, Maßmöbel, Einrichtung" },
  { icon: HomeIcon, name: "Haushaltshilfe", description: "Einkauf, Organisation, Alltag" },
  { icon: Wrench, name: "Kleine Reparaturen", description: "Lampen, Regale, Kleinkram" },
  { icon: Paintbrush, name: "Renovierung", description: "Streichen, Tapezieren, Verschönern" },
  { icon: Package, name: "Weitere Services", description: "Alltagsaufgaben, Botengänge, Hilfe" },
];

export default function Categories() {
  return (
    <section id="kategorien" aria-labelledby="categories-heading" className="band section">
      <div className="shell">
        <Reveal>
          <SectionHeading
            id="categories-heading"
            eyebrow="Kategorien"
            title="Für so ziemlich alles im Alltag."
            description="Die häufigsten Bereiche auf LiNQ – und es werden laufend mehr, während die Community wächst."
            align="center"
          />
        </Reveal>

        {/* One grid, hairlines instead of eight separate boxes. */}
        <Reveal delay={120} className="mt-14 md:mt-20">
          <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-secondary bg-secondary md:grid-cols-4">
            {categories.map(({ icon: Icon, name, description }) => (
              <li
                key={name}
                className="group bg-background p-6 transition-colors duration-200 hover:bg-muted md:p-7"
              >
                <Icon
                  size={20}
                  strokeWidth={1.7}
                  aria-hidden
                  className="mb-5 text-text/35 transition-colors duration-200 group-hover:text-accent-ink"
                />
                <h3 className="mb-1 text-[15px] font-semibold text-primary">{name}</h3>
                <p className="text-[13px] leading-relaxed text-text/55">{description}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
