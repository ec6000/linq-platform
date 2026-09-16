import { Building2, Mail, Phone } from "lucide-react"
import { Profile } from "@/lib/types/profile"

interface ProfileSummaryCardProps {
  profile: Profile
}

export default function ProfileSummaryCard({ profile }: ProfileSummaryCardProps) {
  const fullName = `${profile.firstName} ${profile.lastName}`.trim()
  const initials =
    [profile.firstName, profile.lastName]
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "–"

  const rows = [
    { icon: Mail, label: "E-Mail", value: profile.email },
    { icon: Phone, label: "Telefon", value: profile.phone },
    { icon: Building2, label: "Firma", value: profile.company },
  ]

  return (
    <section className="card h-fit bg-background p-6">
      <div className="flex items-center gap-4">
        <span className="avatar h-12 w-12 text-[15px]">{initials}</span>
        <div className="min-w-0">
          <p className="truncate text-[16px] font-semibold text-text">{fullName || "Dein Profil"}</p>
          <p className="text-[12.5px] text-text/45">Profilübersicht</p>
        </div>
      </div>

      <dl className="mt-7 flex flex-col">
        {rows.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex items-center gap-3 border-t border-secondary py-3.5 first:border-t-0 first:pt-0"
          >
            <Icon size={15} strokeWidth={1.8} className="flex-none text-text/30" aria-hidden />
            <dt className="sr-only">{label}</dt>
            <dd className="min-w-0 truncate text-[14px] text-text/75">
              {value || <span className="text-text/30">Noch nicht hinterlegt</span>}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
