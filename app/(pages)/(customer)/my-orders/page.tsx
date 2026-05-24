"use client"

import { useEffect, useMemo, useState } from "react"
import { collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore"
import { ClipboardList, Pencil, Trash2, X } from "lucide-react"
import { db } from "@/lib/firebase/firebase"
import { useOrders } from "@/lib/hooks/useOrders"
import { OrderStatus } from "@/lib/types/order"

const statusLabel: Record<OrderStatus, string> = {
  [OrderStatus.available]: "Offen",
  [OrderStatus.assigned]: "Vergeben",
  [OrderStatus.inProgress]: "In Arbeit",
  [OrderStatus.completed]: "Abgeschlossen",
  [OrderStatus.cancelled]: "Storniert",
}

const statusStyle: Record<OrderStatus, string> = {
  [OrderStatus.available]: "bg-accent/10 text-accent",
  [OrderStatus.assigned]: "bg-secondary text-text/60",
  [OrderStatus.inProgress]: "bg-primary/10 text-primary",
  [OrderStatus.completed]: "bg-secondary text-text/60",
  [OrderStatus.cancelled]: "bg-secondary text-text/60",
}

type OrderOffer = {
  id: string
  priceInCent: number
  comment?: string
  providerId?: number
  status?: "pending" | "accepted" | "declined"
}

export default function CustomerMyOrdersPage() {
  const { orders, loading, error } = useOrders()

  const [editingOrderId, setEditingOrderId] = useState<number | null>(null)
  const [deletingOrderId, setDeletingOrderId] = useState<number | null>(null)
  const [offerOrderId, setOfferOrderId] = useState<number | null>(null)
  const [offers, setOffers] = useState<OrderOffer[]>([])
  const [offersLoading, setOffersLoading] = useState(false)
  const [offerActionLoading, setOfferActionLoading] = useState<string | null>(null)
  const [declineComment, setDeclineComment] = useState("")
  const [offerCounts, setOfferCounts] = useState<Record<number, number>>({})
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all")
  const [offerFilter, setOfferFilter] = useState<"all" | "withOffers" | "withoutOffers">("all")

  const visibleOrders = useMemo(() => orders.slice().sort((a, b) => b.id - a.id), [orders])

  useEffect(() => {
    async function loadOfferCounts() {
      const entries = await Promise.all(
        visibleOrders.map(async (order) => {
          const snapshot = await getDocs(collection(db, "orders", String(order.id), "offers"))
          return [order.id, snapshot.size] as const
        }),
      )

      setOfferCounts(Object.fromEntries(entries))
    }

    if (visibleOrders.length === 0) {
      setOfferCounts({})
      return
    }

    loadOfferCounts()
  }, [visibleOrders])

  const filteredOrders = useMemo(() => {
    return visibleOrders.filter((order) => {
      const statusMatches = statusFilter === "all" || order.status === statusFilter
      const offersCount = offerCounts[order.id] ?? 0
      const offersMatches =
        offerFilter === "all" ||
        (offerFilter === "withOffers" && offersCount > 0) ||
        (offerFilter === "withoutOffers" && offersCount === 0)

      return statusMatches && offersMatches
    })
  }, [offerCounts, offerFilter, statusFilter, visibleOrders])

  async function openOffers(orderId: number) {
    setOfferOrderId(orderId)
    setOffers([])
    setOffersLoading(true)

    try {
      const snapshot = await getDocs(collection(db, "orders", String(orderId), "offers"))
      const data: OrderOffer[] = snapshot.docs.map((item) => {
        const raw = item.data() as Omit<OrderOffer, "id">
        return {
          id: item.id,
          priceInCent: typeof raw.priceInCent === "number" ? raw.priceInCent : 0,
          comment: typeof raw.comment === "string" ? raw.comment : "",
          providerId: typeof raw.providerId === "number" ? raw.providerId : undefined,
          status: raw.status,
        }
      })

      setOffers(data)
    } finally {
      setOffersLoading(false)
    }
  }

  async function handleDelete(orderId: number) {
    await deleteDoc(doc(db, "orders", String(orderId)))
    setDeletingOrderId(null)
    window.location.reload()
  }

  async function handleOfferDecision(offerId: string, next: "accepted" | "declined") {
    if (!offerOrderId) return
    setOfferActionLoading(offerId)

    await updateDoc(doc(db, "orders", String(offerOrderId), "offers", offerId), {
      status: next,
      customerComment: next === "declined" ? declineComment.trim() : "",
    })

    setOffers((current) =>
      current.map((offer) => (offer.id === offerId ? { ...offer, status: next } : offer)),
    )
    setDeclineComment("")
    setOfferActionLoading(null)
    setOfferOrderId(null)
  }

  return (
    <main className="mx-auto max-w-[1600px] px-6 py-6 md:px-10 md:py-8">
      <div className="mb-5 flex items-center gap-3">
        <ClipboardList size={22} className="text-primary" strokeWidth={1.8} />
        <h1 className="text-[22px] font-semibold tracking-tight text-text">Meine Aufträge</h1>
      </div>

      {loading && <p className="rounded-2xl border border-secondary p-6 text-sm text-text/60">Aufträge werden geladen…</p>}
      {error && <p className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">{error}</p>}

      {!loading && !error && visibleOrders.length === 0 && (
        <section className="rounded-3xl border border-secondary bg-background p-8 text-center">
          <h2 className="text-lg font-semibold text-text">Noch keine Aufträge</h2>
          <p className="mt-2 text-sm text-text/55">Sobald ein Auftrag erstellt wurde, erscheint er hier.</p>
        </section>
      )}

      {visibleOrders.length > 0 && (
        <section className="mb-4 flex flex-wrap gap-2">
          <button onClick={() => setStatusFilter("all")} className={`rounded-full px-3 py-1.5 text-xs font-medium ${statusFilter === "all" ? "bg-primary text-white" : "bg-secondary text-text/70"}`}>Alle Status</button>
          {Object.values(OrderStatus).map((status) => (
            <button key={status} onClick={() => setStatusFilter(status)} className={`rounded-full px-3 py-1.5 text-xs font-medium ${statusFilter === status ? "bg-primary text-white" : "bg-secondary text-text/70"}`}>{statusLabel[status]}</button>
          ))}
          <button onClick={() => setOfferFilter("all")} className={`rounded-full px-3 py-1.5 text-xs font-medium ${offerFilter === "all" ? "bg-primary text-white" : "bg-secondary text-text/70"}`}>Alle Vorschläge</button>
          <button onClick={() => setOfferFilter("withOffers")} className={`rounded-full px-3 py-1.5 text-xs font-medium ${offerFilter === "withOffers" ? "bg-primary text-white" : "bg-secondary text-text/70"}`}>Mit Vorschlägen</button>
          <button onClick={() => setOfferFilter("withoutOffers")} className={`rounded-full px-3 py-1.5 text-xs font-medium ${offerFilter === "withoutOffers" ? "bg-primary text-white" : "bg-secondary text-text/70"}`}>Ohne Vorschläge</button>
        </section>
      )}

      <section className="space-y-4">
        {filteredOrders.map((order) => {
          return (
            <article
              key={order.id}
              className="rounded-2xl border border-secondary bg-background px-5 py-5 transition hover:border-primary/30 hover:shadow-sm sm:px-6 sm:py-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[18px] font-semibold leading-snug text-text">{order.title}</h2>
                    <span className={`rounded-full px-3 py-1 text-[12px] font-medium ${statusStyle[order.status]}`}>
                      {statusLabel[order.status]}
                    </span>
                  </div>

                  <p className="line-clamp-2 text-[14px] leading-6 text-text/65">{order.description}</p>

                  <p className="text-xs text-text/45">Auftrag #{order.id}</p>
                </div>
              </div>

              <div className="my-4 border-t border-secondary" />

              <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setDeletingOrderId(order.id)}
                  className="rounded-xl px-4 py-2 text-[13px] font-medium text-text/40 transition hover:bg-red-50 hover:text-red-500"
                >
                  <span className="inline-flex items-center gap-1.5"><Trash2 size={14} /> Löschen</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingOrderId(order.id)}
                  className="rounded-xl px-4 py-2 text-[13px] font-medium text-text/70 transition hover:bg-secondary"
                >
                  <span className="inline-flex items-center gap-1.5"><Pencil size={14} /> Bearbeiten</span>
                </button>
                <button
                  type="button"
                  disabled={(offerCounts[order.id] ?? 0) === 0}
                  onClick={() => openOffers(order.id)}
                  className={`rounded-xl px-4 py-2 text-[13px] font-medium transition ${
                    (offerCounts[order.id] ?? 0) === 0
                      ? "bg-secondary text-text/45 cursor-not-allowed"
                      : "bg-primary text-white hover:opacity-90"
                  }`}
                >
                  Preisvorschläge ({offerCounts[order.id] ?? 0})
                </button>
              </div>
            </article>
          )
        })}
      </section>

      {editingOrderId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setEditingOrderId(null)}>
          <div className="w-full max-w-md rounded-2xl bg-background p-6" onClick={(event) => event.stopPropagation()}>
            <h2 className="text-lg font-semibold text-text">Bearbeiten</h2>
            <p className="mt-2 text-sm text-text/60">Der Bearbeiten-Flow folgt im nächsten Schritt (Order-Formular).</p>
            <button onClick={() => setEditingOrderId(null)} className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white">Schließen</button>
          </div>
        </div>
      )}

      {deletingOrderId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setDeletingOrderId(null)}>
          <div className="w-full max-w-md rounded-2xl bg-background p-6" onClick={(event) => event.stopPropagation()}>
            <h2 className="text-lg font-semibold text-text">Auftrag löschen?</h2>
            <p className="mt-2 text-sm text-text/60">Der Auftrag wird dauerhaft gelöscht.</p>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setDeletingOrderId(null)} className="flex-1 rounded-xl border border-secondary px-4 py-2 text-sm">Abbrechen</button>
              <button onClick={() => handleDelete(deletingOrderId)} className="flex-1 rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white">Löschen</button>
            </div>
          </div>
        </div>
      )}

      {offerOrderId !== null && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-0 sm:items-center sm:p-4" onClick={() => setOfferOrderId(null)}>
          <div className="w-full max-w-2xl rounded-t-3xl bg-background p-6 sm:rounded-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text">Preisangebote</h2>
              <button onClick={() => setOfferOrderId(null)} className="rounded-lg p-1 text-text/50 hover:bg-secondary"><X size={18} /></button>
            </div>

            {offersLoading && <p className="text-sm text-text/60">Angebote werden geladen…</p>}
            {!offersLoading && offers.length === 0 && <p className="text-sm text-text/60">Noch keine Angebote vorhanden.</p>}

            <div className="space-y-3">
              {offers.map((offer) => (
                <div key={offer.id} className="rounded-xl border border-secondary p-4">
                  <p className="text-sm font-semibold text-text">{(offer.priceInCent / 100).toLocaleString("de-DE")} €</p>
                  {offer.providerId && <p className="text-xs text-text/50">Anbieter #{offer.providerId}</p>}
                  {offer.comment && <p className="mt-2 text-sm text-text/65">{offer.comment}</p>}
                  <p className="mt-2 text-xs text-text/45">Status: {offer.status ?? "pending"}</p>

                  <textarea
                    value={declineComment}
                    onChange={(event) => setDeclineComment(event.target.value)}
                    placeholder="Optionaler Kommentar bei Ablehnung"
                    className="mt-3 w-full rounded-xl border border-secondary px-3 py-2 text-sm outline-none"
                  />

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      disabled={offerActionLoading === offer.id}
                      onClick={() => handleOfferDecision(offer.id, "declined")}
                      className="flex-1 rounded-xl border border-secondary px-3 py-2 text-sm"
                    >
                      Ablehnen
                    </button>
                    <button
                      type="button"
                      disabled={offerActionLoading === offer.id}
                      onClick={() => handleOfferDecision(offer.id, "accepted")}
                      className="flex-1 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-white"
                    >
                      Annehmen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
