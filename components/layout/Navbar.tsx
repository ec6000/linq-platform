"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ClipboardList, Home, LogOut, Search, UserRound, Wrench } from "lucide-react"
import Logo from "@/components/brand/Logo"
import { useAuth } from "@/components/auth/AuthProvider"
import { getHomeForRole, getProfileForRole } from "@/lib/utils/auth"
import type { UserRole } from "@/lib/types/user"

const NAV: Record<UserRole, Array<{ label: string; href: string; icon: typeof Home }>> = {
  provider: [
    { label: "Übersicht", href: "/dashboard", icon: Home },
    { label: "Aufträge", href: "/find-jobs", icon: Search },
    { label: "Services", href: "/my-services", icon: Wrench },
  ],
  customer: [
    { label: "Übersicht", href: "/customer-dashboard", icon: Home },
    { label: "Services", href: "/find-services", icon: Search },
    { label: "Aufträge", href: "/my-orders", icon: ClipboardList },
  ],
}

/** Three destinations per role, the same on every screen size; mobile adds the profile. */
export default function Navbar({ role, userName }: { role: UserRole; userName: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()

  const profileHref = getProfileForRole(role)
  const items = NAV[role]
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  async function handleLogout() {
    await logout()
    router.replace("/login")
  }

  return (
    <>
      <header className="app-header sticky top-0 z-40 w-full border-b border-secondary bg-background/85 backdrop-blur-xl backdrop-saturate-150">
        <div className="shell-wide flex h-14 items-center justify-between md:h-16">
          <Link href={getHomeForRole(role)} className="-m-2 p-2" aria-label="Zur Übersicht">
            <Logo size="sm" />
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Hauptnavigation">
            {items.map(({ label, href, icon: Icon }) => (
              <Link key={href} href={href} className="nav-link" data-active={isActive(href)} aria-current={isActive(href) ? "page" : undefined}>
                <Icon size={15} strokeWidth={2} aria-hidden />
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <button type="button" onClick={handleLogout} className="icon-btn hidden md:inline-flex" aria-label="Abmelden">
              <LogOut size={17} strokeWidth={1.8} aria-hidden />
            </button>
            <Link href={profileHref} className="avatar ml-1" aria-label={`Profil von ${userName}`}>
              {userName.charAt(0).toUpperCase()}
            </Link>
          </div>
        </div>
      </header>

      <nav className="bottom-nav md:hidden" aria-label="Mobile Navigation">
        <div className="bottom-nav-inner">
          {[...items, { label: "Profil", href: profileHref, icon: UserRound }].map(({ label, href, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link key={href} href={href} className="bottom-nav-link" data-active={active} aria-current={active ? "page" : undefined}>
                <span className="bottom-nav-icon">
                  <Icon size={20} strokeWidth={active ? 2.2 : 1.8} aria-hidden />
                </span>
                <span>{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
