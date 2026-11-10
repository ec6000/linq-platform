"use client"

import { useState } from "react"
import { CalendarDays, Mail, MapPin, Phone } from "lucide-react"
import { JobStatus, type Job } from "@/lib/types/job"
import type { UserRole } from "@/lib/types/user"
import { useUpdateJobStatus } from "@/lib/hooks/useJobs"
import { canChangeJobStatus, getNextJobStatus } from "@/lib/utils/jobStatus"
import { formatDateTime, formatPrice } from "@/lib/utils/format"
import ConfirmationModal from "@/components/ConfirmationModal"
import StatusPill from "@/components/StatusPill"

const STEP = {
  [JobStatus.inProgress]: { button: "Starten", title: "Job starten?", text: "Der Job wechselt auf In Arbeit." },
  [JobStatus.completed]: { button: "Abschließen", title: "Job abschließen?", text: "Der Job wird als erledigt markiert." },
  [JobStatus.cancelled]: {
    button: "Stornieren",
    title: "Job stornieren?",
    text: "Das lässt sich nicht rückgängig machen. Sag deinem Gegenüber am besten kurz Bescheid.",
  },
} as const

type Step = keyof typeof STEP

/** One card for both sides of a job; `role` decides which buttons appear. */
export default function JobCard({ job, role }: { job: Job; role: UserRole }) {
  const { updateJobStatus, loading, error } = useUpdateJobStatus()
  const [confirm, setConfirm] = useState<Step | null>(null)

  const next = getNextJobStatus(job.status)
  const steps = [
    canChangeJobStatus(job.status, JobStatus.cancelled, role) && JobStatus.cancelled,
    role === "provider" && next,
  ].filter(Boolean) as Step[]

  const other = role === "provider"
    ? { name: job.customerName, contact: job.customerContact }
    : { name: job.providerName, contact: job.providerContact }
  const live = job.status === JobStatus.scheduled || job.status === JobStatus.inProgress

  async function run() {
    if (confirm && (await updateJobStatus(job.id, confirm))) setConfirm(null)
  }

  return (
    <>
      <article className="card p-6">
        <div className="mb-3 flex items-start justify-between gap-3">
          <p className="text-[12.5px] text-text/50">
            {job.categoryName}
            {job.subcategoryName && ` · ${job.subcategoryName}`}
          </p>
          <StatusPill status={job.status} />
        </div>

        <h2 className="text-[17px] font-semibold leading-snug text-text">{job.title}</h2>
        <p className="num mt-4 text-[22px] font-semibold text-text">{formatPrice(job.priceInCent, job.pricing)}</p>

        <div className="mt-4 flex flex-col gap-2 text-[13px] text-text/60">
          <p className="flex items-center gap-2">
            <CalendarDays size={14} strokeWidth={1.8} className="flex-none text-text/35" aria-hidden />
            {job.dateText || formatDateTime(job.scheduledAt)}
          </p>
          <p className="flex items-center gap-2">
            <MapPin size={14} strokeWidth={1.8} className="flex-none text-text/35" aria-hidden />
            {job.place.address}
          </p>
        </div>

        {/* Who is on the other side, and — while the job is live — how to reach them. */}
        <div className="card-sunken mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 text-[13.5px]">
          <span className="font-medium text-text">{other.name}</span>
          {live && other.contact?.phone && (
            <a href={`tel:${other.contact.phone}`} className="link-quiet inline-flex items-center gap-1.5">
              <Phone size={13} strokeWidth={1.9} aria-hidden />
              {other.contact.phone}
            </a>
          )}
          {live && other.contact?.email && (
            <a href={`mailto:${other.contact.email}`} className="link-quiet inline-flex items-center gap-1.5">
              <Mail size={13} strokeWidth={1.9} aria-hidden />
              {other.contact.email}
            </a>
          )}
        </div>

        {error && (
          <p role="alert" className="notice notice-error mt-4">
            {error}
          </p>
        )}

        {steps.length > 0 && (
          <div className="mt-5 flex items-center justify-end gap-2">
            {steps.map((step) => (
              <button
                key={step}
                type="button"
                disabled={loading}
                onClick={() => setConfirm(step)}
                className={`btn btn-sm ${step === JobStatus.cancelled ? "btn-danger" : "btn-primary"}`}
              >
                {STEP[step].button}
              </button>
            ))}
          </div>
        )}
      </article>

      <ConfirmationModal
        open={confirm !== null}
        title={confirm ? STEP[confirm].title : ""}
        description={confirm ? STEP[confirm].text : ""}
        confirmLabel={confirm ? `Ja, ${STEP[confirm].button.toLowerCase()}` : ""}
        destructive={confirm === JobStatus.cancelled}
        loading={loading}
        onCancel={() => setConfirm(null)}
        onConfirm={run}
      />
    </>
  )
}
