"use client"

import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import ProfileSummaryCard from "@/components/profile/ProfileSummaryCard"
import ProfileSettingsForm from "@/components/profile/ProfileSettingsForm"
import PageHeader from "@/components/layout/PageHeader"
import { useAuth } from "@/components/auth/AuthProvider"
import { Profile } from "@/lib/types/profile"
import { useUserProfile } from "@/lib/hooks/useUserProfile"

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout } = useAuth()

  const { profile, loading, saving, error, saveProfile } = useUserProfile(user?.uid)

  const handleSaveProfile = async (nextProfile: Profile) => {
    await saveProfile(nextProfile)
  }

  const handleLogout = async () => {
    await logout()
    router.replace("/login")
  }

  return (
    <main id="main" className="shell-wide py-10 md:py-12">
      <PageHeader
        title={user?.role === "customer" ? "Kundenprofil" : "Anbieterprofil"}
        description="Kontaktdaten und Einstellungen für dein LiNQ-Konto."
        actions={
          <button type="button" onClick={handleLogout} className="btn btn-outline w-full sm:w-auto">
            <LogOut size={16} strokeWidth={1.9} aria-hidden />
            Abmelden
          </button>
        }
      />

      {error && (
        <p role="alert" className="notice notice-error mb-6">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
          <div className="skeleton h-64" />
          <div className="skeleton h-96" />
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
          <ProfileSummaryCard profile={profile} />
          <ProfileSettingsForm
            key={user?.uid}
            initialProfile={profile}
            onSave={handleSaveProfile}
            loading={loading}
            saving={saving}
          />
        </div>
      )}
    </main>
  )
}
