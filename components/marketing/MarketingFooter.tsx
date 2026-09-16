import Link from "next/link";
import Logo from "@/components/brand/Logo";

const columns = [
  {
    title: "Plattform",
    links: [
      { label: "So funktioniert's", href: "/#so-funktionierts" },
      { label: "Für Kunden", href: "/#fuer-kunden" },
      { label: "Für Dienstleister", href: "/#fuer-dienstleister" },
      { label: "Kategorien", href: "/#kategorien" },
    ],
  },
  {
    title: "Konto",
    links: [
      { label: "Anmelden", href: "/login" },
      { label: "Registrieren", href: "/signup" },
    ],
  },
];

export default function MarketingFooter() {
  return (
    <footer className="border-t border-secondary">
      <div className="shell py-16 md:py-20">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 md:gap-16">
          <div className="col-span-2 flex flex-col gap-4">
            <Link href="/" className="inline-flex self-start" aria-label="LiNQ Startseite">
              <Logo size="sm" />
            </Link>
            <p className="max-w-xs text-[14px] leading-relaxed text-text/55">
              Die Plattform für lokale Dienstleistungen – entwickelt für Köln, gebaut für den
              Alltag.
            </p>
          </div>

          {columns.map((column) => (
            <nav key={column.title} className="flex flex-col gap-3.5" aria-label={column.title}>
              <h2 className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-text/40">
                {column.title}
              </h2>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="link-quiet text-[14px]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-3 border-t border-secondary pt-8 text-[13px] text-text/45 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} LiNQ. Alle Rechte vorbehalten. Made in Köln.</p>
          <p>Deutsch (Deutschland)</p>
        </div>
      </div>
    </footer>
  );
}
