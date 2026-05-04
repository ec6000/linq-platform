"use client"
import { useMemo, useState } from "react"
import { Layers, Plus } from "lucide-react"
import { useServices } from "@/lib/hooks/useServices"
import ServiceCard from "@/components/my-services/ServiceCard"
import { Service, ServiceStatus } from "@/lib/types/service"
import ServiceForm, { ServiceFormValues } from "@/components/my-services/ServiceForm"
import { useAuth } from "@/components/auth/AuthProvider"
import { createService } from "@/lib/hooks/useCreateService"
import { editService } from "@/lib/hooks/useEditService"

const SERVICES_PER_PAGE = 10

type StatusFilter = "all" | ServiceStatus.active | ServiceStatus.inactive

export default function ServicesPage() {
  const { services, loading, error, reload } = useServices()
  const { user } = useAuth()

  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all")
  const [currentPage, setCurrentPage] = useState(1)

  const [formOpen, setFormOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const filteredServices = useMemo(() => {
    const withoutDeleted = services.filter((service) => service.status !== ServiceStatus.deleted)

    if (activeFilter === "all") {
      return withoutDeleted
    }

    return withoutDeleted.filter((service) => service.status === activeFilter)
  }, [activeFilter, services])

  const totalPages = Math.max(1, Math.ceil(filteredServices.length / SERVICES_PER_PAGE))
  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * SERVICES_PER_PAGE,
    currentPage * SERVICES_PER_PAGE,
  )

  function openCreateForm() {
    setEditingService(null)
    setSubmitError(null)
    setFormOpen(true)
  }

  function openEditForm(service: Service) {
    setEditingService(service)
    setSubmitError(null)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingService(null)
    setSubmitError(null)
  }

  async function handleCreate(values: ServiceFormValues) {
    if (!user) {
      setSubmitError("Du musst eingeloggt sein, um Services zu erstellen.")
      return
    }

    setSaving(true)
    setSubmitError(null)

    try {
      await createService({
        ...values,
        providerId: user.uid,
        providerName: user.displayName || user.email,
      })

      await reload()
      closeForm()
    } catch (err) {
      console.error(err)
      setSubmitError("Service konnte nicht erstellt werden.")
    } finally {
      setSaving(false)
    }
  }

  async function handleEdit(values: ServiceFormValues) {
    if (!editingService) return

    setSaving(true)
    setSubmitError(null)

    try {
      await editService(editingService.id, values)
      await reload()
      closeForm()
    } catch (err) {
      console.error(err)
      setSubmitError("Service konnte nicht aktualisiert werden.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="mx-auto max-w-[1600px] px-6 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Layers size={22} className="text-primary" strokeWidth={1.8} />
          <h1 className="text-[22px] font-semibold tracking-tight text-text">Meine Services</h1>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          <Plus size={16} strokeWidth={2} />
          Service erstellen
        </button>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {([
          { key: "all", label: "Alle" },
          { key: ServiceStatus.active, label: "Aktiv" },
          { key: ServiceStatus.inactive, label: "Inaktiv" },
        ] as const).map((chip) => {
          const selected = activeFilter === chip.key
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => {
                setActiveFilter(chip.key)
                setCurrentPage(1)
              }}
              className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition ${
                selected
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-secondary text-text/65 hover:bg-secondary"
              }`}
            >
              {chip.label}
            </button>
          )
        })}
      </div>

      {formOpen && (
        <div className="mb-6">
          <ServiceForm
            mode={editingService ? "edit" : "create"}
            initialService={editingService}
            saving={saving}
            onCancel={closeForm}
            onSubmit={editingService ? handleEdit : handleCreate}
          />
          {submitError && <p className="mt-2 text-sm text-red-500">{submitError}</p>}
        </div>
      )}

      {loading && <p className="text-sm text-text/40">Services werden geladen…</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && filteredServices.length === 0 && (
        <p className="text-sm text-text/40">Keine Services mit den gewählten Filtern gefunden.</p>
      )}

      <div className="flex flex-col gap-3">
        {paginatedServices.map((service) => (
          <ServiceCard key={service.id} service={service} onEdit={openEditForm} />
        ))}
      </div>

      {!loading && !error && filteredServices.length > SERVICES_PER_PAGE && (
        <div className="mt-6 flex items-center justify-between gap-3 text-sm text-text/70">
          <p>
            Seite {currentPage} von {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-secondary px-3 py-1.5 transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Zurück
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-secondary px-3 py-1.5 transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Weiter
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
