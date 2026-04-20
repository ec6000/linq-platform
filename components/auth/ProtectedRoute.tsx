"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { getHomeForRole } from "@/lib/utils/auth"

const PUBLIC_PATHS = new Set(["/login", "/signup"])

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) {
      return
    }

    if (!user && !PUBLIC_PATHS.has(pathname)) {
      router.replace("/login")
      return
    }

    if (user && PUBLIC_PATHS.has(pathname)) {
      router.replace(getHomeForRole(user.role))
    }
  }, [loading, pathname, router, user])

  if (loading) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-[1600px] items-center justify-center px-6 py-10">
        <p className="text-sm text-text/50">Session wird geladen…</p>
      </main>
    )
  }

  if (!user && !PUBLIC_PATHS.has(pathname)) {
    return null
  }

  return <>{children}</>
}
