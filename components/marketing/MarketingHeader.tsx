"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Expletus_Sans } from "next/font/google";

const expletus = Expletus_Sans({
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

const navLinks = [
  { label: "So funktioniert's", href: "#so-funktionierts" },
  { label: "Für Kunden", href: "#fuer-kunden" },
  { label: "Für Dienstleister", href: "#fuer-dienstleister" },
  { label: "Kategorien", href: "#kategorien" },
];

export default function MarketingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 w-full transition-all duration-200"
      style={{
        background: scrolled
          ? "color-mix(in srgb, var(--background) 88%, transparent)"
          : "var(--background)",
        backdropFilter: scrolled ? "saturate(180%) blur(12px)" : "none",
        WebkitBackdropFilter: scrolled ? "saturate(180%) blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid var(--secondary)" : "1px solid transparent",
      }}
    >
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6 md:px-10">
        <Link
          href="/"
          className="flex items-center"
          style={{ color: "var(--primary)" }}
          aria-label="LiNQ Startseite"
        >
          <span className={`${expletus.className} text-[28px] tracking-wide leading-none`}>
            LiNQ.
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1" aria-label="Hauptnavigation">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3 py-2 rounded-lg text-[14px] font-medium transition-all duration-150"
              style={{ color: "var(--text)", opacity: 0.65 }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = "1";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = "0.65";
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg text-[14px] font-medium transition-all duration-150"
            style={{ color: "var(--text)", opacity: 0.75 }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "1";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "0.75";
            }}
          >
            Anmelden
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2 rounded-xl text-[14px] font-medium transition-all duration-150"
            style={{
              background: "var(--primary)",
              color: "#ffffff",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 6px 20px -8px color-mix(in srgb, var(--primary) 70%, transparent)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            Registrieren
          </Link>
        </div>

        <button
          type="button"
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ color: "var(--text)" }}
          aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div
          className="md:hidden px-6 pb-4 pt-1 flex flex-col gap-1"
          style={{ borderTop: "1px solid var(--secondary)" }}
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="px-3 py-3 rounded-lg text-[15px] font-medium"
              style={{ color: "var(--text)", opacity: 0.75 }}
            >
              {link.label}
            </a>
          ))}
          <div className="mt-2 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="px-3 py-3 rounded-lg text-[15px] font-medium text-center"
              style={{
                color: "var(--text)",
                border: "1px solid var(--secondary)",
              }}
            >
              Anmelden
            </Link>
            <Link
              href="/signup"
              onClick={() => setMenuOpen(false)}
              className="px-3 py-3 rounded-xl text-[15px] font-medium text-center"
              style={{ background: "var(--primary)", color: "#ffffff" }}
            >
              Registrieren
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}