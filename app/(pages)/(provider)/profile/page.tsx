"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Settings } from "lucide-react"
import ProfileSummaryCard from "@/components/profile/ProfileSummaryCard"
import ProfileSettingsForm from "@/components/profile/ProfileSettingsForm"
import { useAuth } from "@/components/auth/AuthProvider"
import { Profile } from "@/lib/types/profile"
import { useUserProfile } from "@/lib/hooks/useUserProfile"

export default function ProviderProfilePage() {
  const router = useRouter()
  const { user } = useAuth()

  const {
    profile,
    loading,
    saving,
    error,
    saveProfile,
  } = useUserProfile(user?.uid)

  useEffect(() => {
    if (user?.role === "customer") {
      router.replace("/customer-profile")
    }
  }, [router, user?.role])

  if (user?.role === "customer") {
    return null
  }

  const handleSaveProfile = async (nextProfile: Profile) => {
    await saveProfile(nextProfile)
  }

  return (
    <main className="mx-auto max-w-[1600px] px-6 py-10">
      <div className="mb-8 flex items-center gap-3">
        <Settings size={22} className="text-primary" strokeWidth={1.8} />
        <h1 className="text-[22px] font-semibold tracking-tight text-text">
          Provider Profil & Einstellungen
        </h1>
      </div>

      {loading && <p className="mb-4 text-sm text-text/40">Profil wird geladen…</p>}
      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <ProfileSummaryCard profile={profile} />
        <ProfileSettingsForm
          initialProfile={profile}
          onSave={handleSaveProfile}
          loading={loading}
          saving={saving}
        />
      </div>
    </main>
  )
}
