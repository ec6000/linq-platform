"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft, CalendarDays, CircleDollarSign, MapPin, UserRound } from "lucide-react"
import OfferModal from "@/components/find-jobs/OfferModal"
import { useCategories } from "@/lib/hooks/useCategory"
import { useMyOffer } from "@/lib/hooks/useMyOffer"
import { useOrders } from "@/lib/hooks/useOrders"
import { Order, OrderStatus } from "@/lib/types/order"
import { findCategoryByOrderValue } from "@/lib/utils/categoryMatching"

const statusStyles: Record<OrderStatus, string> = {
  [OrderStatus.available]: "bg-accent/10 text-accent",
  [OrderStatus.assigned]: "bg-secondary text-text/40",
  [OrderStatus.inProgress]: "bg-primary/10 text-primary",
  [OrderStatus.completed]: "bg-secondary text-text/40",
  [OrderStatus.cancelled]: "bg-secondary text-text/40",
}

const statusLabel: Record<OrderStatus, string> = {
  [OrderStatus.available]: "Verfügbar",
  [OrderStatus.assigned]: "Vergeben",
  [OrderStatus.inProgress]: "In Arbeit",
  [OrderStatus.completed]: "Abgeschlossen",
  [OrderStatus.cancelled]: "Storniert",
}

function normalize(value?: string) {
  return value?.trim().toLowerCase()
}

function formatDateTimeRange(order: Order) {
  const start = order.timeWindow.start.toDate()
  const end = order.timeWindow.end.toDate()

  const day = start.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
  const startTime = start.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
  const endTime = end.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })

  return `${day} · ${startTime}–${endTime}`
}

export default function DetailedOrderPage() {
  const params = useParams<{ orderId: string }>()
  const orderId = params.orderId

  const { orders, loading, error } = useOrders()
  const { categories } = useCategories()
  const [modalOpen, setModalOpen] = useState(false)

  const order = useMemo(() => orders.find((item) => item.id === orderId), [orders, orderId])
  const { offer, deleting, withdrawOffer } = useMyOffer(orderId)

  const category = findCategoryByOrderValue(categories, order?.categoryId)
  const subcategory = category?.subcategories.find((item) => {
    if (!order?.subcategoryId) {
      return false
    }

    const target = normalize(order.subcategoryId)
    return target === normalize(item.id) || target === normalize(item.name)
  })

  useEffect(() => {
    if (!order) {
      return
    }

    console.info("[order-detail][category-debug]", {
      orderId: order.id,
      orderCategoryId: order.categoryId,
      orderSubcategoryId: order.subcategoryId,
      resolvedCategory: category
        ? { id: category.id, firestoreId: category.firestoreId, name: category.name }
        : null,
      resolvedSubcategory: subcategory ? { id: subcategory.id, name: subcategory.name } : null,
      categoriesLoaded: categories.length,
    })
  }, [categories.length, category, order, subcategory])

  if (loading) {
    return <main className="mx-auto max-w-[1100px] px-6 py-10 text-sm text-text/40">Auftrag wird geladen…</main>
  }

  if (error) {
    return <main className="mx-auto max-w-[1100px] px-6 py-10 text-sm text-red-500">{error}</main>
  }

  if (!order) {
    return <main className="mx-auto max-w-[1100px] px-6 py-10 text-sm text-text/40">Auftrag nicht gefunden.</main>
  }

  const isAvailable = order.status === OrderStatus.available

  return (
    <main className="mx-auto max-w-[1100px] px-6 py-10">
      <Link
        href="/find-jobs"
        className="mb-6 inline-flex items-center gap-1 text-[13px] font-medium text-text/60 transition hover:text-text"
      >
        <ArrowLeft size={14} />
        Zurück zur Übersicht
      </Link>

      <section className="rounded-2xl border border-secondary bg-background p-5 sm:p-7">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[24px] font-semibold text-text">{order.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-text/60">
              <span className={`rounded-full px-3 py-1 text-[12px] font-medium ${statusStyles[order.status]}`}>
                {statusLabel[order.status]}
              </span>
              {category && (
                <span className="rounded-full border border-secondary px-3 py-1 text-[12px]">
                  {category.name}{subcategory ? ` · ${subcategory.name}` : ""}
                </span>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-primary/5 px-4 py-3 text-right">
            <p className="text-[12px] text-text/60">Budget</p>
            <p className="text-[20px] font-semibold text-text">
              {(order.budgetInCent / 100).toLocaleString("de-DE")}€
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-secondary p-4">
            <p className="mb-1 flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-wide text-text/45">
              <CalendarDays size={14} />
              Zeitfenster
            </p>
            <p className="text-[14px] text-text">{formatDateTimeRange(order)}</p>
            {order.timeWindow.isFlexible && (
              <p className="mt-1 text-[12px] text-text/50">Zeitpunkt ist flexibel.</p>
            )}
          </div>

          <div className="rounded-xl border border-secondary p-4">
            <p className="mb-1 flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-wide text-text/45">
              <MapPin size={14} />
              Ort & Radius
            </p>
            <p className="text-[14px] text-text">{order.address ?? "Adresse folgt nach Kontaktaufnahme"}</p>
            <p className="mt-1 text-[12px] text-text/50">
              Suchradius: {Math.round(order.radiusInMeters / 1000)} km
            </p>
          </div>

          <div className="rounded-xl border border-secondary p-4">
            <p className="mb-1 flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-wide text-text/45">
              <UserRound size={14} />
              Kunde
            </p>
            <p className="text-[14px] text-text">{order.customerName}</p>
          </div>

          <div className="rounded-xl border border-secondary p-4">
            <p className="mb-1 flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-wide text-text/45">
              <CircleDollarSign size={14} />
              Dein Angebot
            </p>
            {!offer && <p className="text-[14px] text-text/70">Noch kein Angebot gesendet.</p>}
            {offer && (
              <p className="text-[14px] text-text">
                {(offer.priceInCent / 100).toLocaleString("de-DE")}€
              </p>
            )}
          </div>
        </div>

        <div className="my-6 border-t border-secondary" />

        <div>
          <h2 className="mb-2 text-[14px] font-medium text-text">Auftragsbeschreibung</h2>
          <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-text/80">{order.description}</p>
        </div>

        {order.imageUrls.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-2 text-[14px] font-medium text-text">Bilder</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {order.imageUrls.map((url) => (
                <div key={url} className="relative h-44 w-full overflow-hidden rounded-xl border border-secondary">
                  <Image
                    src={url}
                    alt={`Bild zu ${order.title}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
          {isAvailable && !offer && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="rounded-xl bg-primary px-4 py-2 text-[13px] font-medium text-white transition hover:bg-primary/90"
            >
              Angebot senden
            </button>
          )}

          {isAvailable && offer && (
            <button
              type="button"
              disabled={deleting}
              onClick={withdrawOffer}
              className="rounded-xl border border-red-200 px-4 py-2 text-[13px] font-medium text-red-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
            >
              {deleting ? "…" : "Angebot zurückziehen"}
            </button>
          )}
        </div>
      </section>

      <OfferModal
        orderId={order.id}
        orderTitle={order.title}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </main>
  )
}
