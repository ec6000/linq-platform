"use client"
import { useState } from "react"
import { Job, JobStatus } from "@/lib/types/job"
import { getNextJobStatus } from "@/lib/utils/getNextJobStatus"
import { useUpdateJobStatus } from "@/lib/hooks/useChangeJobStatus"
import { useCategories } from "@/lib/hooks/useCategory"

const statusStyles: Record<JobStatus, string> = {
  [JobStatus.open]: "bg-accent/10 text-accent",
  [JobStatus.inProgress]: "bg-primary/10 text-primary",
  [JobStatus.done]: "bg-secondary text-text/60",
  [JobStatus.cancelled]: "bg-secondary text-text/40",
}

const statusLabel: Record<JobStatus, string> = {
  [JobStatus.open]: "Offen",
  [JobStatus.inProgress]: "In Bearbeitung",
  [JobStatus.done]: "Abgeschlossen",
  [JobStatus.cancelled]: "Storniert",
}

const primaryCTA: Record<JobStatus, string> = {
  [JobStatus.open]: "Starten",
  [JobStatus.inProgress]: "Beenden",
  [JobStatus.done]: "Bewerten",
  [JobStatus.cancelled]: "",
}

const primaryCTAStyles: Record<JobStatus, string> = {
  [JobStatus.open]: "bg-primary text-white hover:bg-primary/90",
  [JobStatus.inProgress]: "bg-accent text-white hover:bg-accent/90",
  [JobStatus.done]: "bg-secondary text-text hover:bg-secondary/70",
  [JobStatus.cancelled]: "",
}

interface JobCardProps {
  job: Job
}

export default function JobCard({ job }: JobCardProps) {
  const [status, setStatus] = useState<JobStatus>(job.status)
  const { updateJobStatus, loading, error } = useUpdateJobStatus()
  const { categories } = useCategories()

  const categoryName = categories.find((c) => c.id === job.categoryId)?.nameDE

  const nextStatus = getNextJobStatus(status)
  const isCancelled = status === JobStatus.cancelled

  async function handleAdvanceStatus() {
    if (!nextStatus || loading) return
    await updateJobStatus(job.id, nextStatus)
    if (!error) setStatus(nextStatus)
  }

  async function handleCancel() {
    if (loading) return
    await updateJobStatus(job.id, JobStatus.cancelled)
    if (!error) setStatus(JobStatus.cancelled)
  }

  return (
    <div className="rounded-2xl border border-secondary bg-background px-6 py-5 transition hover:border-primary/30 hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[15px] font-medium text-text">{job.title}</span>
            {categoryName && (
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-text/50">
                {categoryName}
              </span>
            )}
          </div>
          <span className="text-[13px] text-text/50">
            {job.customerName} · {job.date.toDate().toLocaleDateString("de-DE")}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-[12px] font-medium ${statusStyles[status]}`}>
            {statusLabel[status]}
          </span>
          <span className="text-[15px] font-semibold text-text">
            {(job.priceInCent / 100).toLocaleString("de-DE")}€
          </span>
        </div>
      </div>

      <div className="my-4 border-t border-secondary" />

      {error && (
        <p className="mb-3 text-[12px] text-red-500">{error}</p>
      )}

      <div className="flex items-center justify-end gap-2">
        {!isCancelled && status !== JobStatus.done && (
          <button
            type="button"
            disabled={loading}
            onClick={handleCancel}
            className="rounded-xl px-4 py-2 text-[13px] font-medium text-text/40 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
          >
            Stornieren
          </button>
        )}

        {!isCancelled && (
          <button
            type="button"
            disabled={loading}
            onClick={handleAdvanceStatus}
            className={`rounded-xl px-4 py-2 text-[13px] font-medium transition disabled:opacity-50 ${primaryCTAStyles[status]}`}
          >
            {loading ? "…" : primaryCTA[status]}
          </button>
        )}

        {isCancelled && (
          <span className="text-[13px] text-text/40">Storniert</span>
        )}
      </div>
    </div>
  )
}