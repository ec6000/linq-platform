"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Bell,
  ClipboardList,
  Home,
  LayoutDashboard,
  LogOut,
  Search,
  UserRound,
  Wrench,
} from "lucide-react"
import Logo from "@/components/brand/Logo"
import { useAuth } from "@/components/auth/AuthProvider"
import { getHomeForRole, getProfileForRole } from "@/lib/utils/auth"

interface NavbarProps {
  userRole?: "provider" | "customer"
  userName?: string
}

const providerNavItems = [
  { label: "Dashboard", mobileLabel: "Übersicht", href: "/dashboard", icon: LayoutDashboard },
  { label: "Aufträge finden", mobileLabel: "Aufträge", href: "/find-jobs", icon: Search },
  { label: "Meine Services", mobileLabel: "Services", href: "/my-services", icon: Wrench },
]

const customerNavItems = [
  { label: "Übersicht", mobileLabel: "Übersicht", href: "/customer-dashboard", icon: Home },
  { label: "Service finden", mobileLabel: "Entdecken", href: "/find-services", icon: Search },
  { label: "Meine Aufträge", mobileLabel: "Aufträge", href: "/my-orders", icon: ClipboardList },
]

export default function Navbar({ userRole = "provider", userName = "E" }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()

  const navItems = userRole === "customer" ? customerNavItems : providerNavItems
  const avatarLetter = userName.charAt(0).toUpperCase()
  const profileHref = getProfileForRole(userRole)
  const homeHref = getHomeForRole(userRole)
  const mobileNavItems = [
    ...navItems,
    { label: "Profil", mobileLabel: "Profil", href: profileHref, icon: UserRound },
  ]

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  const handleLogout = async () => {
    await logout()
    router.replace("/login")
  }

  return (
    <>
      <header className="app-header sticky top-0 z-40 w-full border-b border-secondary bg-background/85 backdrop-blur-xl backdrop-saturate-150">
        <div className="shell-wide flex h-14 items-center justify-between md:h-16">
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
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
            </button>
            <button type="button" onClick={handleLogout} className="icon-btn hidden md:inline-flex" aria-label="Abmelden">
              <LogOut size={17} strokeWidth={1.8} aria-hidden />
            </button>
            <Link href={profileHref} className="avatar ml-1 md:inline-flex" aria-label={`Profil von ${userName}`}>
              {avatarLetter}
            </Link>
          </div>
        </div>
      </header>

      <nav className="bottom-nav md:hidden" aria-label="Mobile Hauptnavigation">
        <div className="bottom-nav-inner">
          {mobileNavItems.map(({ mobileLabel, href, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className="bottom-nav-link"
                data-active={active ? "true" : "false"}
                aria-current={active ? "page" : undefined}
              >
                <span className="bottom-nav-icon"><Icon size={20} strokeWidth={active ? 2.2 : 1.8} aria-hidden /></span>
                <span>{mobileLabel}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
