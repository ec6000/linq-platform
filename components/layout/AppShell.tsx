"use client"

import { usePathname } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import { useAuth } from "@/components/auth/AuthProvider"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { useUserProfile } from "@/lib/hooks/useUserProfile"

const PUBLIC_PATHS = new Set(["/login", "/signup"])

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()
  const { profile } = useUserProfile(user?.uid)

  const isPublicPath = PUBLIC_PATHS.has(pathname)
  const fullName = `${profile.firstName} ${profile.lastName}`.trim()
  const userName = fullName || user?.displayName || user?.email || "U"

  return (
    <>
      {!isPublicPath && user && <Navbar userRole={user.role} userName={userName} />}
      <ProtectedRoute>{children}</ProtectedRoute>
    </>
  )
}
