"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { getHomeForRole } from "@/lib/utils/auth"
import { UserRole } from "@/lib/types/user"

const PUBLIC_PATHS = new Set(["/login", "/signup"])

const ROLE_RESTRICTED_PATHS: Array<{ prefix: string; role: UserRole }> = [
  { prefix: "/dashboard", role: "provider" },
  { prefix: "/find-jobs", role: "provider" },
  { prefix: "/invoices", role: "provider" },
  { prefix: "/my-services", role: "provider" },
  { prefix: "/profile", role: "provider" },
  { prefix: "/customer-dashboard", role: "customer" },
  { prefix: "/customer-profile", role: "customer" },
]

function pathMatchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

function getRequiredRole(pathname: string) {
  return ROLE_RESTRICTED_PATHS.find(({ prefix }) => pathMatchesPrefix(pathname, prefix))?.role
}

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const isPublicPath = PUBLIC_PATHS.has(pathname)
  const requiredRole = getRequiredRole(pathname)
  const isWrongRole = Boolean(user && requiredRole && user.role !== requiredRole)

  useEffect(() => {
    if (loading) {
      return
    }

    if (!user && !isPublicPath) {
      router.replace("/login")
      return
    }

    if (user && isPublicPath) {
      router.replace(getHomeForRole(user.role))
      return
    }

    if (user && requiredRole && user.role !== requiredRole) {
      router.replace(getHomeForRole(user.role))
    }
  }, [isPublicPath, loading, pathname, requiredRole, router, user])

  if (loading) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-[1600px] items-center justify-center px-6 py-10">
        <p className="text-sm text-text/50">Session wird geladen…</p>
      </main>
    )
  }

  if (!user && !isPublicPath) {
    return null
  }

  if (isWrongRole) {
    return null
  }

  return <>{children}</>
}
