import { Mail, Phone, Building2 } from "lucide-react"
import { Profile } from "@/lib/types/profile"

interface ProfileSummaryCardProps {
  profile: Profile
}

export default function ProfileSummaryCard({ profile }: ProfileSummaryCardProps) {
  return (
    <section className="rounded-2xl border border-secondary bg-background p-5">
      <h2 className="mb-4 text-base font-semibold text-text">Profilübersicht</h2>

      <div className="space-y-3 text-sm text-text/80">
        <p className="text-[15px] font-medium text-text">
          {profile.firstName} {profile.lastName}
        </p>

        <div className="flex items-center gap-2">
          <Mail size={15} className="text-primary" strokeWidth={1.8} />
          <span>{profile.email}</span>
        </div>

        <div className="flex items-center gap-2">
          <Phone size={15} className="text-primary" strokeWidth={1.8} />
          <span>{profile.phone}</span>
        </div>

        <div className="flex items-center gap-2">
          <Building2 size={15} className="text-primary" strokeWidth={1.8} />
          <span>{profile.company}</span>
        </div>
      </div>
    </section>
  )
}
