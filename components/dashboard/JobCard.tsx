"use client"

import { useMemo, useState } from "react"
import { Job, JobSourceType, JobStatus } from "@/lib/types/job"
import { PricingType } from "@/lib/types/service"
import { useUpdateJobStatus } from "@/lib/hooks/useChangeJobStatus"
import { useCategories } from "@/lib/hooks/useCategory"

const statusStyles: Record<JobStatus, string> = {
  [JobStatus.pending]: "bg-accent/10 text-accent",
  [JobStatus.inProgress]: "bg-primary/10 text-primary",
  [JobStatus.completed]: "bg-secondary text-text/60",
  [JobStatus.cancelled]: "bg-secondary text-text/40",
}

const statusLabel: Record<JobStatus, string> = {
  [JobStatus.pending]: "Ausstehend",
  [JobStatus.inProgress]: "In Bearbeitung",
  [JobStatus.completed]: "Abgeschlossen",
  [JobStatus.cancelled]: "Storniert",
}

const sourceLabel: Record<JobSourceType, string> = {
  [JobSourceType.order]: "Auftrag",
  [JobSourceType.service]: "Service",
}

const pricingSuffix: Record<PricingType, string> = {
  [PricingType.fixed]: "",
  [PricingType.perHour]: " / Std.",
  [PricingType.perUnit]: " / Einheit",
}

interface JobCardProps {
  job: Job
}

function formatPrice(valueInCent: number | undefined, pricingType: PricingType) {
  if (valueInCent === undefined) return "Preis auf Anfrage"
  const value = (valueInCent / 100).toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${value} €${pricingSuffix[pricingType]}`
}

function formatScheduledAt(value?: { toDate: () => Date }) {
  if (!value) return null
  const date = value.toDate()
  const datePart = date.toLocaleDateString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
  const timePart = date.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  })
  return `${datePart} · ${timePart} Uhr`
}

function getNextStatus(status: JobStatus) {
  if (status === JobStatus.pending) return JobStatus.inProgress
  if (status === JobStatus.inProgress) return JobStatus.completed
  return null
}

export default function JobCard({ job }: JobCardProps) {
  const [status, setStatus] = useState<JobStatus>(job.status)
  const { updateJobStatus, loading, error } = useUpdateJobStatus()
  const { categories } = useCategories()

  const categoryName = useMemo(
    () => categories.find((category) => category.id === job.categoryId)?.nameDE,
    [categories, job.categoryId],
  )

  const nextStatus = getNextStatus(status)
  const canCancel = status === JobStatus.pending || status === JobStatus.inProgress
  const scheduledText = formatScheduledAt(job.scheduledAt)

  async function handleAdvanceStatus() {
    if (!nextStatus || loading) return
    await updateJobStatus(job.id, nextStatus)
    if (!error) setStatus(nextStatus)
  }

  async function handleCancel() {
    if (!canCancel || loading) return
    await updateJobStatus(job.id, JobStatus.cancelled)
    if (!error) setStatus(JobStatus.cancelled)
  }

  return (
    <article className="rounded-2xl border border-secondary bg-background p-6 transition hover:border-primary/30 hover:shadow-sm">
      {/* Header: Meta-Pills + Status */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[12px] text-text/55">
          <span>{sourceLabel[job.sourceType]}</span>
          {categoryName && (
            <>
              <span className="text-text/25">·</span>
              <span>{categoryName}</span>
            </>
          )}
        </div>

        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusStyles[status]}`}>
          {statusLabel[status]}
        </span>
      </div>

      {/* Titel + Beschreibung */}
      <h2 className="text-[17px] font-semibold leading-snug text-text">{job.title}</h2>
      {job.description && (
        <p className="mt-1.5 text-[13px] leading-relaxed text-text/60 line-clamp-2">
          {job.description}
        </p>
      )}

      {/* Preis prominent */}
      <div className="mt-5 text-[20px] font-semibold tracking-tight text-text">
        {formatPrice(job.priceInCent, job.pricingType)}
      </div>

      {/* Sekundär-Infos: Termin & Adresse */}
      {(scheduledText || job.addressText) && (
        <div className="mt-4 flex flex-col gap-1.5 text-[13px] text-text/65">
          {scheduledText && (
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 shrink-0 text-text/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <span>{scheduledText}</span>
            </div>
          )}
          {job.addressText && (
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 shrink-0 text-text/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{job.addressText}</span>
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-4 text-[12px] text-red-500">{error}</p>}

      {/* Aktionen */}
      {(canCancel || nextStatus) && (
        <div className="mt-5 flex items-center justify-end gap-2 border-t border-secondary pt-4">
          {canCancel && (
            <button
              type="button"
              disabled={loading}
              onClick={handleCancel}
              className="rounded-xl px-4 py-2 text-[13px] font-medium text-text/50 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
            >
              Stornieren
            </button>
          )}

          {nextStatus && (
            <button
              type="button"
              disabled={loading}
              onClick={handleAdvanceStatus}
              className="rounded-xl bg-primary px-4 py-2 text-[13px] font-medium text-white transition hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "…" : status === JobStatus.pending ? "Starten" : "Abschließen"}
            </button>
          )}
        </div>
      )}
    </article>
  )
}