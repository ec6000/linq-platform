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
  { prefix: "/my-orders", role: "customer" },
  { prefix: "/find-services", role: "customer" },
  { prefix: "/service-finden", role: "customer" },
]

function pathMatchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

function getRequiredRole(pathname: string) {
  return ROLE_RESTRICTED_PATHS.find(({ prefix }) => pathMatchesPrefix(pathname, prefix))?.role
}

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { loading, user, error, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const isPublicPath = PUBLIC_PATHS.has(pathname)
  const requiredRole = getRequiredRole(pathname)
  const isWrongRole = Boolean(user && requiredRole && user.role !== requiredRole)

  useEffect(() => {
    if (loading || error) {
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
  }, [error, isPublicPath, loading, pathname, requiredRole, router, user])

  if (loading) {
    return (
      <main
        id="main"
        className="flex min-h-[calc(100vh-var(--nav-h))] items-center justify-center px-6 py-10"
      >
        <span className="flex items-center gap-2.5 text-[13px] text-text/40">
          <span className="dot-live text-accent" aria-hidden />
          Session wird geladen
        </span>
      </main>
    )
  }

  if (error && !user) {
    return (
      <main id="main" className="mx-auto max-w-lg px-6 py-20 text-center">
        <p role="alert" className="notice notice-error text-left">
          {error}
        </p>
        <button type="button" className="btn btn-primary mt-5" onClick={() => void logout()}>
          Neu anmelden
        </button>
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
