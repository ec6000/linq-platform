"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Wrench,
  X,
} from "lucide-react";
import Logo from "@/components/brand/Logo";
import { useAuth } from "@/components/auth/AuthProvider";
import { getHomeForRole, getProfileForRole } from "@/lib/utils/auth";

interface NavbarProps {
  userRole?: "provider" | "customer";
  userName?: string;
}

const providerNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Aufträge finden", href: "/find-jobs", icon: Search },
  { label: "Meine Services", href: "/my-services", icon: Wrench },
];

const customerNavItems = [
  { label: "Service finden", href: "/find-services", icon: Search },
  { label: "Meine Aufträge", href: "/my-orders", icon: ClipboardList },
];

export default function Navbar({ userRole = "provider", userName = "E" }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = userRole === "customer" ? customerNavItems : providerNavItems;
  const avatarLetter = userName.charAt(0).toUpperCase();
  const profileHref = getProfileForRole(userRole);
  const homeHref = getHomeForRole(userRole);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-secondary bg-background/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="shell-wide flex h-16 items-center justify-between">
        <Link href={homeHref} className="-m-2 p-2" aria-label="Zur Startseite">
          <Logo size="sm" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Hauptnavigation">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="nav-link"
              data-active={isActive(href) ? "true" : "false"}
              aria-current={isActive(href) ? "page" : undefined}
            >
              <Icon size={15} strokeWidth={2} aria-hidden />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button type="button" className="icon-btn" aria-label="Benachrichtigungen">
            <Bell size={18} strokeWidth={1.8} aria-hidden />
            <span
              className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent"
              aria-hidden
            />
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="icon-btn hidden md:inline-flex"
            aria-label="Abmelden"
          >
            <LogOut size={17} strokeWidth={1.8} aria-hidden />
          </button>

          <Link href={profileHref} className="avatar ml-1 hidden md:inline-flex" aria-label="Profil">
            {avatarLetter}
          </Link>

          <button
            type="button"
            className="icon-btn md:hidden"
            aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={18} strokeWidth={2} /> : <Menu size={18} strokeWidth={2} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-secondary bg-background md:hidden">
          <div className="shell-wide flex flex-col gap-0.5 py-3">
            {navItems.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                data-active={isActive(href) ? "true" : "false"}
                className="flex items-center gap-3 rounded-sm px-3 py-3 text-[14.5px] font-medium text-text/60 transition-colors hover:bg-muted data-[active=true]:bg-primary/6 data-[active=true]:text-primary"
              >
                <Icon size={16} strokeWidth={1.9} aria-hidden />
                {label}
              </Link>
            ))}

            <Link
              href={profileHref}
              onClick={() => setMenuOpen(false)}
              className="mt-2 flex items-center gap-3 border-t border-secondary px-3 pb-2 pt-4"
            >
              <span className="avatar">{avatarLetter}</span>
              <span className="truncate text-[14px] font-medium text-text/70">{userName}</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-sm px-3 py-3 text-[14.5px] font-medium text-text/60 transition-colors hover:bg-muted"
            >
              <LogOut size={16} strokeWidth={1.9} aria-hidden />
              Abmelden
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
