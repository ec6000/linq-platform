"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  LayoutDashboard,
  Search,
  Wrench,
  FileText,
  Menu,
  X,
  ShoppingBag,
  Settings,
} from "lucide-react";
import { useState } from "react";
import "@/app/globals.css";
import { Expletus_Sans } from "next/font/google";

const expletus = Expletus_Sans({
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

interface NavbarProps {
  userRole?: "provider" | "customer";
  userName?: string;
}

const providerNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Aufträge finden", href: "/find-jobs", icon: Search },
  { label: "Meine Services", href: "/my-services", icon: Wrench },
  { label: "Rechnungen", href: "/invoices", icon: FileText },
  { label: "Einstellungen", href: "/profile", icon: Settings },
];

const customerNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Services finden", href: "/find-services", icon: Search },
  { label: "Meine Aufträge", href: "/my-orders", icon: ShoppingBag },
  { label: "Rechnungen", href: "/invoices", icon: FileText },
  { label: "Einstellungen", href: "/profile", icon: Settings },
];

export default function Navbar({ userRole = "provider", userName = "E" }: NavbarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = userRole === "customer" ? customerNavItems : providerNavItems;
  const avatarLetter = userName.charAt(0).toUpperCase();

  return (
    <header
      className="w-full bg-background"
      style={{ borderBottom: "1px solid var(--secondary)" }}
    >
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-6 md:px-10">

        <Link
          href="/dashboard"
          className="text-[22px] font-bold tracking-tight"
          style={{ color: "var(--primary)" }}
        >
          <span className={`${expletus.className} text-3xl tracking-wide`}>
            LiNQ.
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-[14px] font-medium transition-all duration-150"
                style={{
                  color: isActive ? "var(--primary)" : "var(--text)",
                  opacity: isActive ? 1 : 0.5,
                  background: isActive ? "color-mix(in srgb, var(--primary) 8%, transparent)" : "transparent",
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.opacity = "0.85";
                    (e.currentTarget as HTMLElement).style.background = "var(--secondary)";
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.opacity = "0.5";
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }
                }}
              >
                <Icon size={15} strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-150"
            style={{ color: "var(--text)", opacity: 0.5 }}
            aria-label="Benachrichtigungen"
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.opacity = "1";
              (e.currentTarget as HTMLElement).style.background = "var(--secondary)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.opacity = "0.5";
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <Bell size={18} strokeWidth={1.9} />
            <span
              className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--accent)" }}
            />
          </button>

          <Link
            href="/profile"
            className="hidden md:flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-semibold ml-2 transition-all duration-150"
            style={{
              background: "color-mix(in srgb, var(--primary) 12%, transparent)",
              color: "var(--primary)",
            }}
            aria-label="Profil"
          >
            {avatarLetter}
          </Link>

          <button
            type="button"
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg transition-all duration-150"
            style={{ color: "var(--text)", opacity: 0.6 }}
            aria-label="Menü"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={18} strokeWidth={2} /> : <Menu size={18} strokeWidth={2} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          className="md:hidden px-4 py-3 flex flex-col gap-0.5"
          style={{ borderTop: "1px solid var(--secondary)" }}
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-150"
                style={{
                  color: isActive ? "var(--primary)" : "var(--text)",
                  opacity: isActive ? 1 : 0.55,
                  background: isActive ? "color-mix(in srgb, var(--primary) 8%, transparent)" : "transparent",
                }}
              >
                <Icon size={16} strokeWidth={1.9} />
                {item.label}
              </Link>
            );
          })}

          <Link
            href="/profile"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-3 mt-2"
            style={{ borderTop: "1px solid var(--secondary)" }}
          >
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-[13px] font-semibold"
              style={{
                background: "color-mix(in srgb, var(--primary) 12%, transparent)",
                color: "var(--primary)",
              }}
            >
              {avatarLetter}
            </div>
            <span className="text-[14px] font-medium" style={{ color: "var(--text)", opacity: 0.7 }}>
              {userName}
            </span>
          </Link>
        </div>
      )}
    </header>
  );
}
