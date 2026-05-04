"use client"

import { useState } from "react"
import Image from "next/image"
import { ImageIcon, Pencil, MapPin } from "lucide-react"
import { Service, ServiceStatus, PricingType } from "@/lib/types/service"
import { useUpdateServiceStatus } from "@/lib/hooks/useUpdateServiceStatus"
import ConfirmationModal from "@/components/ConfirmationModal"

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

function formatPricingSuffix(service: Service): string {
  if (service.pricingType === PricingType.perUnit) {
    return service.unitName ? `pro ${service.unitName}` : PricingType.perUnit
  }
  return service.pricingType
}

interface ServiceCardProps {
  service: Service
  onEdit?: (service: Service) => void
}

export default function ServiceCard({ service, onEdit }: ServiceCardProps) {
  const [status, setStatus] = useState<ServiceStatus>(service.status)
  const { updateServiceStatus, loading, error } = useUpdateServiceStatus()

  const isDeleted = status === ServiceStatus.deleted
  const isActive = status === ServiceStatus.active
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [toggleConfirmOpen, setToggleConfirmOpen] = useState(false)

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
    <>
    <div
      className={`rounded-2xl border bg-background px-4 py-4 sm:px-6 sm:py-5 transition ${
        isDeleted
          ? "border-secondary opacity-50"
          : "border-secondary hover:border-primary/30 hover:shadow-sm"
      }`}
    >
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {/* Bild + Titel + Description */}
        <div className="flex items-start gap-3 min-w-0">
          <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-xl bg-secondary">
            {service.imageUrl ? (
              <Image
                src={service.imageUrl}
                alt={service.title}
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-text/30">
                <ImageIcon size={20} strokeWidth={1.6} />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[15px] font-medium text-text leading-snug">
              {service.title}
            </span>
            <p className="text-[13px] text-text/50 leading-snug line-clamp-3">
              {service.description}
            </p>
          </div>
        </div>

        {/* Status + Budget + Ort */}
        <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:gap-1 shrink-0">
          <span className={`rounded-full px-3 py-1 text-[12px] font-medium ${statusStyles[status]}`}>
            {statusLabel[status]}
          </span>
          <div className="flex flex-col items-start sm:items-end gap-0.5">
            <span className="text-[15px] font-semibold text-text">
              {(service.minBudgetInCent / 100).toLocaleString("de-DE")}€
              {" – "}
              {(service.maxBudgetInCent / 100).toLocaleString("de-DE")}€
              <span className="ml-1 text-[12px] font-normal text-text/50">
                {formatPricingSuffix(service)}
              </span>
            </span>
            {service.city && (
              <span className="flex items-center gap-1 text-[11px] text-text/40">
                <MapPin size={11} strokeWidth={1.8} />
                {service.city} · {service.radius} km
              </span>
            )}
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
              onClick={() => setDeleteConfirmOpen(true)}
              className="rounded-xl px-4 py-2 text-[13px] font-medium text-text/40 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
            >
              Löschen
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => onEdit?.(service)}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-medium text-text/70 transition hover:bg-secondary disabled:opacity-50"
            >
              <Pencil size={14} strokeWidth={1.8} />
              Bearbeiten
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => setToggleConfirmOpen(true)}
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

    <ConfirmationModal
      open={toggleConfirmOpen}
      title={isActive ? "Service wirklich deaktivieren?" : "Service aktivieren?"}
      description={isActive ? "Der Service ist danach nicht mehr öffentlich sichtbar." : "Der Service wird wieder öffentlich sichtbar."}
      confirmLabel={isActive ? "Ja, deaktivieren" : "Ja, aktivieren"}
      loading={loading}
      onCancel={() => setToggleConfirmOpen(false)}
      onConfirm={async () => {
        await handleToggleStatus()
        setToggleConfirmOpen(false)
      }}
    />

    <ConfirmationModal
      open={deleteConfirmOpen}
      title="Service wirklich löschen?"
      description="Der Service wird als gelöscht markiert und nicht mehr angezeigt."
      confirmLabel="Ja, löschen"
      loading={loading}
      onCancel={() => setDeleteConfirmOpen(false)}
      onConfirm={async () => {
        await handleDelete()
        setDeleteConfirmOpen(false)
      }}
    />
    </>
  )
}