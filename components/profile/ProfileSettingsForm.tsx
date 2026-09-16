"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { Profile } from "@/lib/types/profile"

interface ProfileSettingsFormProps {
  initialProfile: Profile
  onSave: (nextProfile: Profile) => Promise<void>
  loading?: boolean
  saving?: boolean
}

const textFields = [
  { key: "firstName", label: "Vorname", type: "text", half: true },
  { key: "lastName", label: "Nachname", type: "text", half: true },
  { key: "email", label: "Kontakt-E-Mail", type: "email", half: true },
  { key: "phone", label: "Telefon", type: "tel", half: true },
  { key: "company", label: "Firma", type: "text", half: false },
] as const

export default function ProfileSettingsForm({
  initialProfile,
  onSave,
  loading = false,
  saving = false,
}: ProfileSettingsFormProps) {
  const [profile, setProfile] = useState<Profile>(initialProfile)
  const [saved, setSaved] = useState(false)

  const handleChange = (field: keyof Profile, value: string | boolean) => {
    setSaved(false)
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      await onSave(profile)
      setSaved(true)
    } catch {
      setSaved(false) // The profile hook renders the save error in the page.
    }
  }

  return (
    <section className="card bg-background p-6 md:p-7">
      <h2 className="text-[17px] font-semibold text-text">Einstellungen</h2>
      <p className="mt-1 text-[13.5px] text-text/50">
        Diese Angaben sehen deine Kontakte auf LiNQ.
      </p>

      <form onSubmit={handleSave} className="mt-7 flex flex-col gap-5">
        <div className="grid gap-5 md:grid-cols-2">
          {textFields.map(({ key, label, type, half }) => (
            <div key={key} className={half ? "" : "md:col-span-2"}>
              <label className="field-label" htmlFor={`profile-${key}`}>
                {label}
              </label>
              <input
                id={`profile-${key}`}
                type={type}
                value={profile[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                disabled={loading || saving}
                className="field field-h"
              />
            </div>
          ))}
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-md border border-secondary px-4 py-3.5 text-[14px] text-text/75 transition-colors hover:border-text/20">
          <input
            type="checkbox"
            checked={profile.notificationsEnabled}
            onChange={(e) => handleChange("notificationsEnabled", e.target.checked)}
            disabled={loading || saving}
            className="h-4 w-4 accent-primary"
          />
          Benachrichtigungen aktivieren
        </label>

        <div className="flex items-center gap-4 border-t border-secondary pt-5">
          <button type="submit" disabled={loading || saving} className="btn btn-primary">
            {saving ? "Speichern…" : "Änderungen speichern"}
          </button>

          {saved && !saving && (
            <p className="flex items-center gap-1.5 text-[13.5px] font-medium text-success">
              <Check size={15} strokeWidth={2.4} aria-hidden />
              Gespeichert
            </p>
          )}
        </div>
      </form>
    </section>
  )
}
