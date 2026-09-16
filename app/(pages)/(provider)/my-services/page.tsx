"use client"

import { useMemo, useState } from "react"
import { Plus } from "lucide-react"
import { useMyServices } from "@/lib/hooks/useServices"
import { createService, updateService, type ServiceInput } from "@/lib/data/services"
import ServiceCard from "@/components/my-services/ServiceCard"
import ServiceForm from "@/components/my-services/ServiceForm"
import PageHeader from "@/components/layout/PageHeader"
import { ServiceStatus, type Service } from "@/lib/types/service"

type StatusFilter = "all" | ServiceStatus.active | ServiceStatus.paused

const filters = [
  { key: "all", label: "Alle" },
  { key: ServiceStatus.active, label: "Aktiv" },
  { key: ServiceStatus.paused, label: "Pausiert" },
] as const

export default function ServicesPage() {
  const { services, loading, error } = useMyServices()

  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const visible = useMemo(
    () => (activeFilter === "all" ? services : services.filter((service) => service.status === activeFilter)),
    [activeFilter, services],
  )

  function openCreate() {
    setEditing(null)
    setSubmitError(null)
    setFormOpen(true)
  }

  function openEdit(service: Service) {
    setEditing(service)
    setSubmitError(null)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditing(null)
    setSubmitError(null)
  }

  async function handleSubmit(values: ServiceInput) {
    setSaving(true)
    setSubmitError(null)
    try {
      if (editing) {
        await updateService(editing.id, values)
      } else {
        await createService(values)
      }
      closeForm()
    } catch (err) {
      console.error(err)
      setSubmitError(err instanceof Error ? err.message : "Service konnte nicht gespeichert werden.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <main id="main" className="shell-wide py-10 md:py-12">
      <PageHeader
        title="Meine Services"
        description="Was du anbietest, und wo Kunden dich finden."
        count={visible.length}
        actions={
          <button type="button" onClick={openCreate} className="btn btn-primary">
            <Plus size={16} strokeWidth={2} aria-hidden />
            Service erstellen
          </button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {filters.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => setActiveFilter(chip.key)}
            data-active={activeFilter === chip.key ? "true" : "false"}
            className="chip"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {formOpen && (
        <div className="mb-6">
          <ServiceForm
            key={editing?.id ?? "new"}
            mode={editing ? "edit" : "create"}
            initialService={editing}
            saving={saving}
            onCancel={closeForm}
            onSubmit={handleSubmit}
          />
          {submitError && (
            <p role="alert" className="notice notice-error mt-3">
              {submitError}
            </p>
          )}
        </div>
      )}

      {loading && (
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((index) => (
            <div key={index} className="skeleton h-40 rounded-xl" />
          ))}
        </div>
      )}

      {error && (
        <p role="alert" className="notice notice-error">
          {error}
        </p>
      )}

      {!loading && !error && visible.length === 0 && (
        <div className="empty">
          <h2 className="text-[17px] font-semibold text-text">
            {services.length === 0 ? "Noch keine Services" : "Keine Services mit diesem Filter"}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-text/50">
            {services.length === 0
              ? "Lege deinen ersten Service an, damit Kunden dich in der Suche finden."
              : "Wähle einen anderen Filter, um weitere Services zu sehen."}
          </p>
          {services.length === 0 && !formOpen && (
            <button type="button" onClick={openCreate} className="btn btn-primary mt-7">
              Ersten Service erstellen
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {visible.map((service) => (
          <ServiceCard key={service.id} service={service} onEdit={openEdit} />
        ))}
      </div>
    </main>
  )
}
