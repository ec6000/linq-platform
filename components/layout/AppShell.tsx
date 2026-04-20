"use client"

import { usePathname } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import { useAuth } from "@/components/auth/AuthProvider"
import ProtectedRoute from "@/components/auth/ProtectedRoute"

const PUBLIC_PATHS = new Set(["/login", "/signup"])

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()
  const isPublicPath = PUBLIC_PATHS.has(pathname)

  return (
    <>
      {!isPublicPath && user && (
        <Navbar userRole={user.role} userName={user.displayName || user.email || "U"} />
      )}
      <ProtectedRoute>{children}</ProtectedRoute>
    </>
  )
}
