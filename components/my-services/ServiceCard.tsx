"use client"

import { useState } from "react"
import Image from "next/image"
import { ImageIcon, MapPin, Pencil } from "lucide-react"
import { SERVICE_STATUS_LABEL, ServiceStatus, type Service } from "@/lib/types/service"
import { setServiceStatus } from "@/lib/data/services"
import { formatPriceRange } from "@/lib/utils/format"
import ConfirmationModal from "@/components/ConfirmationModal"

const statusStyles: Record<ServiceStatus, string> = {
  [ServiceStatus.active]: "pill-success",
  [ServiceStatus.paused]: "pill-muted",
  [ServiceStatus.archived]: "pill-muted",
}

interface ServiceCardProps {
  service: Service
  onEdit?: (service: Service) => void
}

export default function ServiceCard({ service, onEdit }: ServiceCardProps) {
  const [status, setStatus] = useState<ServiceStatus>(service.status)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false)
  const [toggleConfirmOpen, setToggleConfirmOpen] = useState(false)

  const isActive = status === ServiceStatus.active

  async function apply(next: ServiceStatus, close: () => void) {
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      await setServiceStatus(service.id, next)
      setStatus(next)
      close()
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Status konnte nicht aktualisiert werden.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="card card-interactive p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="relative h-16 w-16 flex-none overflow-hidden rounded-md bg-muted">
              {service.imageUrl ? (
                <Image
                  src={service.imageUrl}
                  alt={service.title}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-text/25">
                  <ImageIcon size={20} strokeWidth={1.6} aria-hidden />
                </div>
              )}
            </div>

            <div className="flex min-w-0 flex-col gap-1.5">
              <h2 className="text-[15.5px] font-semibold leading-snug text-text">{service.title}</h2>
              <p className="line-clamp-2 text-[13px] leading-relaxed text-text/55">
                {service.description}
              </p>
              <p className="text-[12px] text-text/40">
                {service.categoryName}
                {service.subcategoryName ? ` · ${service.subcategoryName}` : ""}
              </p>
            </div>
          </div>

          <div className="flex flex-none items-center justify-between gap-3 sm:flex-col sm:items-end sm:gap-2">
            <span className={`pill ${statusStyles[status]}`}>{SERVICE_STATUS_LABEL[status]}</span>

            <div className="flex flex-col items-start gap-1 sm:items-end">
              <p className="num text-[16px] font-semibold text-text">
                {formatPriceRange(service.minPriceInCent, service.maxPriceInCent, service.pricing)}
              </p>
              <p className="flex items-center gap-1 text-[11.5px] text-text/40">
                <MapPin size={11} strokeWidth={1.8} aria-hidden />
                {service.place.city} · {service.radiusKm} km
              </p>
            </div>
          </div>
        </div>

        {error && (
          <p role="alert" className="notice notice-error mt-4">
            {error}
          </p>
        )}

        <div className="mt-5 flex items-center justify-end gap-2 border-t border-secondary pt-4">
          <button
            type="button"
            disabled={loading}
            onClick={() => setArchiveConfirmOpen(true)}
            className="btn btn-danger btn-sm"
          >
            Archivieren
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => onEdit?.(service)}
            className="btn btn-ghost btn-sm"
          >
            <Pencil size={14} strokeWidth={1.8} aria-hidden />
            Bearbeiten
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => setToggleConfirmOpen(true)}
            className={`btn btn-sm ${isActive ? "btn-outline" : "btn-primary"}`}
          >
            {isActive ? "Pausieren" : "Aktivieren"}
          </button>
        </div>
      </div>

      <ConfirmationModal
        open={toggleConfirmOpen}
        title={isActive ? "Service pausieren?" : "Service aktivieren?"}
        description={
          isActive
            ? "Der Service ist danach nicht mehr in der Suche sichtbar. Du kannst ihn jederzeit wieder aktivieren."
            : "Der Service erscheint wieder in der Suche und kann angefragt werden."
        }
        confirmLabel={isActive ? "Ja, pausieren" : "Ja, aktivieren"}
        loading={loading}
        onCancel={() => setToggleConfirmOpen(false)}
        onConfirm={() =>
          apply(isActive ? ServiceStatus.paused : ServiceStatus.active, () => setToggleConfirmOpen(false))
        }
      />

      <ConfirmationModal
        open={archiveConfirmOpen}
        title="Service archivieren?"
        description="Der Service verschwindet aus deiner Liste und aus der Suche. Bestehende Buchungen bleiben erhalten."
        confirmLabel="Ja, archivieren"
        destructive
        loading={loading}
        onCancel={() => setArchiveConfirmOpen(false)}
        onConfirm={() => apply(ServiceStatus.archived, () => setArchiveConfirmOpen(false))}
      />
    </>
  )
}
