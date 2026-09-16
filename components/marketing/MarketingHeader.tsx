"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "@/components/brand/Logo";

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

  // The page must not scroll behind an open mobile sheet.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  return (
    <header
      data-scrolled={scrolled ? "true" : "false"}
      className="sticky top-0 z-50 w-full border-b border-transparent bg-background transition-[background-color,border-color,backdrop-filter] duration-300 data-[scrolled=true]:border-secondary data-[scrolled=true]:bg-background/75 data-[scrolled=true]:backdrop-blur-xl data-[scrolled=true]:backdrop-saturate-150"
    >
      <div className="shell flex h-16 items-center justify-between">
        <Link href="/" aria-label="LiNQ Startseite" className="-m-2 p-2">
          <Logo size="sm" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Hauptnavigation">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="nav-link">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-1.5 md:flex">
          <Link href="/login" className="btn btn-ghost">
            Anmelden
          </Link>
          <Link href="/signup" className="btn btn-primary">
            Registrieren
          </Link>
        </div>

        <button
          type="button"
          className="icon-btn md:hidden"
          aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={20} strokeWidth={1.8} /> : <Menu size={20} strokeWidth={1.8} />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-secondary bg-background md:hidden">
          <div className="shell flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-sm px-3 py-3 text-[15px] font-medium text-text/70 transition-colors hover:bg-muted hover:text-text"
              >
                {link.label}
              </a>
            ))}

            <div className="mt-3 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="btn btn-outline btn-lg btn-block"
              >
                Anmelden
              </Link>
              <Link
                href="/signup"
                onClick={() => setMenuOpen(false)}
                className="btn btn-primary btn-lg btn-block"
              >
                Registrieren
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
