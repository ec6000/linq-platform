import Link from "next/link";
import { Expletus_Sans } from "next/font/google";

const expletus = Expletus_Sans({
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

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
    title: "Unternehmen",
    links: [
      { label: "Über uns", href: "/ueber-uns" },
      { label: "Karriere", href: "/karriere" },
      { label: "Kontakt", href: "/kontakt" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Rechtliches",
    links: [
      { label: "Impressum", href: "/impressum" },
      { label: "Datenschutz", href: "/datenschutz" },
      { label: "AGB", href: "/agb" },
      { label: "Cookies", href: "/cookies" },
    ],
  },
];

export default function MarketingFooter() {
  return (
    <footer
      className="mt-10"
      style={{ borderTop: "1px solid var(--secondary)" }}
    >
      <div className="mx-auto max-w-[1280px] px-6 md:px-10 py-14 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-16">
          <div className="col-span-2 flex flex-col gap-4">
            <Link
              href="/"
              className="inline-flex"
              style={{ color: "var(--primary)" }}
            >
              <span className={`${expletus.className} text-[26px] tracking-wide leading-none`}>
                LiNQ.
              </span>
            </Link>
            <p
              className="max-w-xs text-[14px] leading-relaxed"
              style={{ color: "var(--text)", opacity: 0.6 }}
            >
              Die Plattform für lokale Dienstleistungen – entwickelt für Köln, gebaut für
              den Alltag.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <h3
                className="text-[12px] font-semibold uppercase tracking-[0.12em]"
                style={{ color: "var(--primary)" }}
              >
                {col.title}
              </h3>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[14px] transition-opacity duration-150 hover:opacity-100"
                      style={{ color: "var(--text)", opacity: 0.65 }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-14 pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          style={{ borderTop: "1px solid var(--secondary)" }}
        >
          <p
            className="text-[13px]"
            style={{ color: "var(--text)", opacity: 0.5 }}
          >
            © {new Date().getFullYear()} LiNQ. Alle Rechte vorbehalten. Made in Köln.
          </p>
          <p
            className="text-[13px]"
            style={{ color: "var(--text)", opacity: 0.5 }}
          >
            Deutsch (Deutschland)
          </p>
        </div>
      </div>
    </footer>
  );
}
