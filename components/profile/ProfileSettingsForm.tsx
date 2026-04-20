"use client"

import { useEffect, useState } from "react"
import { Profile } from "@/lib/types/profile"

interface ProfileSettingsFormProps {
  initialProfile: Profile
  onSave: (nextProfile: Profile) => Promise<void>
  loading?: boolean
  saving?: boolean
}

export default function ProfileSettingsForm({
  initialProfile,
  onSave,
  loading = false,
  saving = false,
}: ProfileSettingsFormProps) {
  const [profile, setProfile] = useState<Profile>(initialProfile)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setProfile(initialProfile)
  }, [initialProfile])

  const handleChange = (field: keyof Profile, value: string | boolean) => {
    setSaved(false)
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    await onSave(profile)
    setSaved(true)
  }

  return (
    <section className="rounded-2xl border border-secondary bg-background p-5">
      <h2 className="mb-4 text-base font-semibold text-text">Einstellungen</h2>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm text-text/75">
            Vorname
            <input
              value={profile.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              disabled={loading || saving}
              className="rounded-xl border border-secondary px-3 py-2.5 text-[14px] text-text outline-none transition focus:border-primary/40 disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm text-text/75">
            Nachname
            <input
              value={profile.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              disabled={loading || saving}
              className="rounded-xl border border-secondary px-3 py-2.5 text-[14px] text-text outline-none transition focus:border-primary/40 disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm text-text/75">
            E-Mail
            <input
              type="email"
              value={profile.email}
              onChange={(e) => handleChange("email", e.target.value)}
              disabled={loading || saving}
              className="rounded-xl border border-secondary px-3 py-2.5 text-[14px] text-text outline-none transition focus:border-primary/40 disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm text-text/75">
            Telefon
            <input
              value={profile.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              disabled={loading || saving}
              className="rounded-xl border border-secondary px-3 py-2.5 text-[14px] text-text outline-none transition focus:border-primary/40 disabled:opacity-60"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1.5 text-sm text-text/75">
          Firma
          <input
            value={profile.company}
            onChange={(e) => handleChange("company", e.target.value)}
            disabled={loading || saving}
            className="rounded-xl border border-secondary px-3 py-2.5 text-[14px] text-text outline-none transition focus:border-primary/40 disabled:opacity-60"
          />
        </label>

        <label className="flex items-center gap-2.5 rounded-xl border border-secondary px-3 py-2.5 text-sm text-text/75">
          <input
            type="checkbox"
            checked={profile.notificationsEnabled}
            onChange={(e) => handleChange("notificationsEnabled", e.target.checked)}
            disabled={loading || saving}
            className="h-4 w-4 accent-primary"
          />
          Benachrichtigungen aktivieren
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading || saving}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Speichern…" : "Änderungen speichern"}
          </button>

          {saved && !saving && (
            <p className="text-sm text-primary">Gespeichert.</p>
          )}
        </div>
      </form>
    </section>
  )
}
