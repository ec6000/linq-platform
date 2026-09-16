"use client"

import { useState } from "react"
import { CalendarDays, MapPin } from "lucide-react"
import { JOB_SOURCE_LABEL, JOB_STATUS_LABEL, JobStatus, type Job } from "@/lib/types/job"
import { useUpdateJobStatus } from "@/lib/hooks/useJobs"
import { getNextJobStatus } from "@/lib/utils/jobStatus"
import { formatDateTime, formatPrice } from "@/lib/utils/format"
import ConfirmationModal from "@/components/ConfirmationModal"

const statusStyles: Record<JobStatus, string> = {
  [JobStatus.scheduled]: "pill-accent",
  [JobStatus.inProgress]: "pill-primary",
  [JobStatus.completed]: "pill-success",
  [JobStatus.cancelled]: "pill-muted",
}

export default function JobCard({ job }: { job: Job }) {
  const [status, setStatus] = useState<JobStatus>(job.status)
  const { updateJobStatus, loading, error } = useUpdateJobStatus()
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false)
  const [advanceConfirmOpen, setAdvanceConfirmOpen] = useState(false)

  const nextStatus = getNextJobStatus(status)
  const canCancel = status !== JobStatus.completed && status !== JobStatus.cancelled
  const scheduledText = formatDateTime(job.scheduledAt)

  async function handleAdvanceStatus() {
    if (!nextStatus || loading) return
    if (await updateJobStatus(job.id, nextStatus)) {
      setStatus(nextStatus)
      setAdvanceConfirmOpen(false)
    }
  }

  async function handleCancel() {
    if (!canCancel || loading) return
    if (await updateJobStatus(job.id, JobStatus.cancelled)) {
      setStatus(JobStatus.cancelled)
      setCancelConfirmOpen(false)
    }
  }

  return (
    <>
      <article className="card card-interactive p-6">
        <div className="mb-3.5 flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-text/50">
            <span className="pill pill-outline">{JOB_SOURCE_LABEL[job.sourceType]}</span>
            <span>{job.categoryName}</span>
            {job.subcategoryName && (
              <>
                <span aria-hidden className="text-text/20">
                  ·
                </span>
                <span>{job.subcategoryName}</span>
              </>
            )}
          </div>

          <span className={`pill ${statusStyles[status]}`}>{JOB_STATUS_LABEL[status]}</span>
        </div>

        <h2 className="text-[17px] font-semibold leading-snug text-text">{job.title}</h2>
        {job.description && (
          <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed text-text/55">
            {job.description}
          </p>
        )}

        <p className="num mt-5 text-[22px] font-semibold text-text">
          {formatPrice(job.priceInCent, job.pricing)}
        </p>

        <div className="mt-4 flex flex-col gap-2 text-[13px] text-text/60">
          {scheduledText && (
            <p className="flex items-center gap-2">
              <CalendarDays size={14} strokeWidth={1.8} className="flex-none text-text/35" aria-hidden />
              {scheduledText}
            </p>
          )}
          <p className="flex items-center gap-2">
            <MapPin size={14} strokeWidth={1.8} className="flex-none text-text/35" aria-hidden />
            {job.place.address}
          </p>
        </div>

        {error && (
          <p role="alert" className="notice notice-error mt-4">
            {error}
          </p>
        )}

        {(canCancel || nextStatus) && (
          <div className="mt-6 flex items-center justify-end gap-2 border-t border-secondary pt-5">
            {canCancel && (
              <button
                type="button"
                disabled={loading}
                onClick={() => setCancelConfirmOpen(true)}
                className="btn btn-danger btn-sm"
              >
                Stornieren
              </button>
            )}

            {nextStatus && (
              <button
                type="button"
                disabled={loading}
                onClick={() => setAdvanceConfirmOpen(true)}
                className="btn btn-primary btn-sm"
              >
                {nextStatus === JobStatus.inProgress ? "Starten" : "Abschließen"}
              </button>
            )}
          </div>
        )}
      </article>

      <ConfirmationModal
        open={advanceConfirmOpen}
        title={nextStatus === JobStatus.inProgress ? "Job wirklich starten?" : "Job wirklich abschließen?"}
        description={
          nextStatus === JobStatus.inProgress
            ? "Der Job wechselt in den Status In Arbeit."
            : "Der Job wird als abgeschlossen markiert."
        }
        confirmLabel={nextStatus === JobStatus.inProgress ? "Ja, starten" : "Ja, abschließen"}
        loading={loading}
        onCancel={() => setAdvanceConfirmOpen(false)}
        onConfirm={handleAdvanceStatus}
      />

      <ConfirmationModal
        open={cancelConfirmOpen}
        title="Job wirklich stornieren?"
        description="Du kannst den Status danach nicht automatisch zurücksetzen."
        confirmLabel="Ja, stornieren"
        destructive
        loading={loading}
        onCancel={() => setCancelConfirmOpen(false)}
        onConfirm={handleCancel}
      />
    </>
  )
}
