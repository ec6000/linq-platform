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

const pricingLabel: Record<PricingType, string> = {
  [PricingType.fixed]: "Festpreis",
  [PricingType.perHour]: "Stundensatz",
  [PricingType.perUnit]: "Pro Einheit",
}

interface JobCardProps {
  job: Job
}

function formatMoney(valueInCent?: number) {
  if (valueInCent === undefined) return "–"
  return `${(valueInCent / 100).toLocaleString("de-DE")} €`
}

function formatTimestamp(value?: { toDate: () => Date }) {
  if (!value) return "–"
  return value.toDate().toLocaleString("de-DE")
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
    <article className="rounded-2xl border border-secondary bg-background px-6 py-5 transition hover:border-primary/30 hover:shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-semibold text-text">{job.title}</h2>
          <p className="mt-1 text-[13px] text-text/55">{job.description || "Keine Beschreibung hinterlegt."}</p>
        </div>

        <span className={`rounded-full px-3 py-1 text-[12px] font-medium ${statusStyles[status]}`}>
          {statusLabel[status]}
        </span>
      </div>

      <dl className="grid gap-x-6 gap-y-2 text-[13px] text-text/75 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-text/45">Quelle</dt>
          <dd>{sourceLabel[job.sourceType]}</dd>
        </div>
        <div>
          <dt className="text-text/45">Kategorie</dt>
          <dd>{categoryName || "–"}</dd>
        </div>
        <div>
          <dt className="text-text/45">Preismodell</dt>
          <dd>{pricingLabel[job.pricingType]}</dd>
        </div>
        <div>
          <dt className="text-text/45">Preis</dt>
          <dd>{formatMoney(job.priceInCent)}</dd>
        </div>
        <div>
          <dt className="text-text/45">Budget</dt>
          <dd>
            {formatMoney(job.minBudgetInCent)} – {formatMoney(job.maxBudgetInCent)}
          </dd>
        </div>
        <div>
          <dt className="text-text/45">Adresse</dt>
          <dd>{job.addressText || "–"}</dd>
        </div>
        <div>
          <dt className="text-text/45">Geopunkt</dt>
          <dd>
            {job.location
              ? `${job.location.latitude.toFixed(4)}, ${job.location.longitude.toFixed(4)}`
              : "–"}
          </dd>
        </div>
        <div>
          <dt className="text-text/45">Termin (Zeitstempel)</dt>
          <dd>{formatTimestamp(job.scheduledAt)}</dd>
        </div>
        <div>
          <dt className="text-text/45">Termin (Freitext)</dt>
          <dd>{job.scheduledDateText || "–"}</dd>
        </div>
      </dl>

      {error && <p className="mt-4 text-[12px] text-red-500">{error}</p>}

      <div className="mt-4 flex items-center justify-end gap-2">
        {canCancel && (
          <button
            type="button"
            disabled={loading}
            onClick={handleCancel}
            className="rounded-xl px-4 py-2 text-[13px] font-medium text-text/45 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
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
    </article>
  )
}
