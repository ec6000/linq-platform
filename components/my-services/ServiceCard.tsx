"use client"

import { useState } from "react"
import { Service, ServiceStatus } from "@/lib/types/service"
import { useUpdateServiceStatus } from "@/lib/hooks/useUpdateServiceStatus"

const statusStyles: Record<ServiceStatus, string> = {
  [ServiceStatus.active]: "bg-accent/10 text-accent",
  [ServiceStatus.inactive]: "bg-secondary text-text/60",
  [ServiceStatus.deleted]: "bg-secondary text-text/40",
}

const statusLabel: Record<ServiceStatus, string> = {
  [ServiceStatus.active]: "Aktiv",
  [ServiceStatus.inactive]: "Inaktiv",
  [ServiceStatus.deleted]: "Gelöscht",
}

interface ServiceCardProps {
  service: Service
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const [status, setStatus] = useState<ServiceStatus>(service.status)
  const { updateServiceStatus, loading, error } = useUpdateServiceStatus()

  const isDeleted = status === ServiceStatus.deleted
  const isActive = status === ServiceStatus.active

  async function handleToggleStatus() {
    if (loading) return
    const next = isActive ? ServiceStatus.inactive : ServiceStatus.active
    await updateServiceStatus(service.id, next)
    if (!error) setStatus(next)
  }

  async function handleDelete() {
    if (loading) return
    await updateServiceStatus(service.id, ServiceStatus.deleted)
    if (!error) setStatus(ServiceStatus.deleted)
  }

  return (
    <div
      className={`rounded-2xl border bg-background px-4 py-4 sm:px-6 sm:py-5 transition ${
        isDeleted
          ? "border-secondary opacity-50"
          : "border-secondary hover:border-primary/30 hover:shadow-sm"
      }`}
    >
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {/* Titel */}
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-[15px] font-medium text-text leading-snug">
            {service.title}
          </span>
          <span className="text-[13px] text-text/50">
            {service.providerName}
          </span>
        </div>

        {/* Status + Budget */}
        <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:gap-1 shrink-0">
          <span className={`rounded-full px-3 py-1 text-[12px] font-medium ${statusStyles[status]}`}>
            {statusLabel[status]}
          </span>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[15px] font-semibold text-text">
              {(service.minBudgetInCent / 100).toLocaleString("de-DE")}€
              {" – "}
              {(service.maxBudgetInCent / 100).toLocaleString("de-DE")}€
            </span>
            <span className="text-[11px] text-text/40">
              Umkreis: {service.radius} km
            </span>
          </div>
        </div>
      </div>

      <div className="my-4 border-t border-secondary" />

      {error && (
        <p className="mb-3 text-[12px] text-red-500">{error}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-end gap-2">
        {!isDeleted && (
          <>
            <button
              type="button"
              disabled={loading}
              onClick={handleDelete}
              className="rounded-xl px-4 py-2 text-[13px] font-medium text-text/40 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
            >
              Löschen
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handleToggleStatus}
              className={`rounded-xl px-4 py-2 text-[13px] font-medium transition disabled:opacity-50 ${
                isActive
                  ? "bg-secondary text-text/60 hover:bg-secondary/70"
                  : "bg-primary text-white hover:bg-primary/90"
              }`}
            >
              {loading ? "…" : isActive ? "Deaktivieren" : "Aktivieren"}
            </button>
          </>
        )}

        {isDeleted && (
          <span className="text-[13px] text-text/40">Gelöscht</span>
        )}
      </div>
    </div>
  )
}