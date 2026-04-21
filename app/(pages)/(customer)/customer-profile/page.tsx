"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { User } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"

export default function CustomerProfilePage() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (user?.role === "provider") {
      router.replace("/profile")
    }
  }, [router, user?.role])

  if (user?.role === "provider") {
    return null
  }

  return (
    <main className="mx-auto max-w-[1600px] px-6 py-10">
      <div className="mb-8 flex items-center gap-3">
        <User size={22} className="text-primary" strokeWidth={1.8} />
        <h1 className="text-[22px] font-semibold tracking-tight text-text">
          Customer Profil
        </h1>
      </div>

      <section className="max-w-xl rounded-2xl border border-secondary bg-background p-5">
        <p className="text-sm text-text/70">
          Das Customer-Profil ist als MVP-Platzhalter angelegt. Provider-Bereich ist aktuell vollständig.
        </p>
      </section>
    </main>
  )
}
