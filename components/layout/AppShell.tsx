"use client"

import { usePathname } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import { useAuth } from "@/components/auth/AuthProvider"
import ProtectedRoute from "@/components/auth/ProtectedRoute"

const PUBLIC_PATHS = new Set(["/login", "/signup"])

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()
  const withNav = Boolean(user) && !PUBLIC_PATHS.has(pathname)

  return (
    <>
      {withNav && user && <Navbar role={user.role} userName={user.displayName || user.email} />}
      {/* Keyed on the path so each page arrives with the same short fade-up. */}
      <div key={pathname} className={`page-enter ${withNav ? "app-content" : ""}`}>
        <ProtectedRoute>{children}</ProtectedRoute>
      </div>
    </>
  )
}
