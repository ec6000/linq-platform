import CountUp from "@/components/motion/CountUp";

const stats = [
  { to: 100, suffix: "%", label: "Lokal in Köln" },
  { to: 2, prefix: "<", suffix: " Min", label: "Auftrag veröffentlichen" },
  { to: 0, suffix: " €", label: "Registrierung" },
  { to: 24, suffix: " h", label: "Ø Antwortzeit" },
];

export default function TrustStrip() {
  return (
    <section aria-label="Kennzahlen" className="border-y border-secondary">
      <div className="shell">
        <dl className="grid grid-cols-2 divide-secondary md:grid-cols-4 md:divide-x">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col-reverse items-center gap-1 px-4 py-8 text-center md:py-10"
            >
              <dt className="text-[13px] text-text/55">{stat.label}</dt>
              <dd className="display text-[30px] text-primary md:text-[34px]">
                <CountUp to={stat.to} prefix={stat.prefix} suffix={stat.suffix} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
