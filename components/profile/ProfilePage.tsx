"use client"

import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import ProfileSettingsForm from "@/components/profile/ProfileSettingsForm"
import PageHeader from "@/components/layout/PageHeader"
import { useAuth } from "@/components/auth/AuthProvider"
import { useUserProfile } from "@/lib/hooks/useUserProfile"

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { profile, loading, saving, error, saveProfile } = useUserProfile(user?.uid)

  async function handleLogout() {
    await logout()
    router.replace("/login")
  }

  return (
    <main id="main" className="shell-wide max-w-3xl py-10 md:py-12">
      <PageHeader
        title="Profil"
        description={user?.role === "customer" ? "Kundenkonto" : "Dienstleisterkonto"}
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
        <div className="skeleton h-96 rounded-xl" />
      ) : (
        <ProfileSettingsForm key={user?.uid} initialProfile={profile} onSave={saveProfile} saving={saving} />
      )}
    </main>
  )
}
