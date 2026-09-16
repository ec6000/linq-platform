"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Pencil, Plus, Trash2, X } from "lucide-react"
import { useMyOrders } from "@/lib/hooks/useOrders"
import { useOrderOffers, useOfferActions } from "@/lib/hooks/useOffers"
import { cancelOrder } from "@/lib/data/orders"
import { ORDER_STATUS_LABEL, OrderStatus, type Order } from "@/lib/types/order"
import { OFFER_STATUS_LABEL, OfferStatus } from "@/lib/types/offer"
import { formatEuro, formatTimeRange } from "@/lib/utils/format"
import PageHeader from "@/components/layout/PageHeader"
import ConfirmationModal from "@/components/ConfirmationModal"

const statusStyle: Record<OrderStatus, string> = {
  [OrderStatus.open]: "pill-accent",
  [OrderStatus.assigned]: "pill-primary",
  [OrderStatus.inProgress]: "pill-primary",
  [OrderStatus.completed]: "pill-success",
  [OrderStatus.cancelled]: "pill-muted",
}

const offerStatusStyle: Record<OfferStatus, string> = {
  [OfferStatus.pending]: "pill-accent",
  [OfferStatus.accepted]: "pill-success",
  [OfferStatus.declined]: "pill-muted",
}

export default function CustomerMyOrdersPage() {
  const { orders, loading, error } = useMyOrders()
  const router = useRouter()

  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all")
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [offersOrder, setOffersOrder] = useState<Order | null>(null)

  const visible = useMemo(
    () => (statusFilter === "all" ? orders : orders.filter((order) => order.status === statusFilter)),
    [orders, statusFilter],
  )

  async function handleCancel() {
    if (!cancelTarget || cancelling) return
    setCancelling(true)
    setActionError(null)
    try {
      await cancelOrder(cancelTarget.id)
      setCancelTarget(null)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Auftrag konnte nicht storniert werden.")
    } finally {
      setCancelling(false)
    }
  }

  return (
    <main id="main" className="shell-wide py-10 md:py-12">
      <PageHeader
        title="Meine Aufträge"
        description="Alles, was du ausgeschrieben hast, samt eingegangener Preisangebote."
        actions={
          <Link href="/my-orders/create" className="btn btn-primary">
            <Plus size={16} strokeWidth={2} aria-hidden />
            Auftrag erstellen
          </Link>
        }
      />

      {actionError && (
        <p role="alert" className="notice notice-error mb-5">
          {actionError}
        </p>
      )}

      {loading && (
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((index) => (
            <div key={index} className="skeleton h-44 rounded-xl" />
          ))}
        </div>
      )}

      {error && (
        <p role="alert" className="notice notice-error">
          {error}
        </p>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="empty">
          <h2 className="text-[17px] font-semibold text-text">Noch keine Aufträge</h2>
          <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-text/50">
            Beschreibe in zwei Minuten, was du brauchst. Passende Dienstleister melden sich direkt bei
            dir.
          </p>
          <Link href="/my-orders/create" className="btn btn-primary mt-7">
            Ersten Auftrag erstellen
          </Link>
        </div>
      )}

      {orders.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            data-active={statusFilter === "all" ? "true" : "false"}
            className="chip"
          >
            Alle
          </button>
          {Object.values(OrderStatus).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              data-active={statusFilter === status ? "true" : "false"}
              className="chip"
            >
              {ORDER_STATUS_LABEL[status]}
            </button>
          ))}
        </div>
      )}

      <section className="flex flex-col gap-4">
        {visible.map((order) => {
          const isOpen = order.status === OrderStatus.open
          const when = formatTimeRange(order.timeWindow.start, order.timeWindow.end)

          return (
            <article key={order.id} className="card card-interactive p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[17px] font-semibold leading-snug text-text">{order.title}</h2>
                <span className={`pill ${statusStyle[order.status]}`}>
                  {ORDER_STATUS_LABEL[order.status]}
                </span>
              </div>

              <p className="mt-2.5 line-clamp-2 text-[14px] leading-relaxed text-text/60">
                {order.description}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-text/45">
                <span>{order.categoryName}</span>
                {when && (
                  <>
                    <span aria-hidden>·</span>
                    <span>{when}</span>
                  </>
                )}
                <span aria-hidden>·</span>
                <span className="num">{formatEuro(order.budgetInCent, { decimals: false })} € Budget</span>
                {order.assignedProviderName && (
                  <>
                    <span aria-hidden>·</span>
                    <span>Vergeben an {order.assignedProviderName}</span>
                  </>
                )}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-secondary pt-4">
                <button
                  type="button"
                  disabled={!isOpen}
                  onClick={() => setCancelTarget(order)}
                  className="btn btn-danger btn-sm"
                >
                  <Trash2 size={14} strokeWidth={1.9} aria-hidden />
                  Stornieren
                </button>
                <button
                  type="button"
                  disabled={!isOpen}
                  onClick={() => router.push(`/my-orders/${order.id}/edit`)}
                  className="btn btn-ghost btn-sm"
                >
                  <Pencil size={14} strokeWidth={1.9} aria-hidden />
                  Bearbeiten
                </button>
                <button
                  type="button"
                  disabled={order.offerCount === 0}
                  onClick={() => setOffersOrder(order)}
                  className="btn btn-primary btn-sm"
                >
                  Preisangebote
                  <span className="num">({order.offerCount})</span>
                </button>
              </div>
            </article>
          )
        })}
      </section>

      <ConfirmationModal
        open={cancelTarget !== null}
        title="Auftrag stornieren?"
        description="Der Auftrag wird storniert und ist danach nicht mehr für Dienstleister sichtbar."
        confirmLabel="Ja, stornieren"
        destructive
        loading={cancelling}
        onCancel={() => setCancelTarget(null)}
        onConfirm={handleCancel}
      />

      {offersOrder && <OffersSheet order={offersOrder} onClose={() => setOffersOrder(null)} />}
    </main>
  )
}

/** The compare-and-decide view for one order's offers. */
function OffersSheet({ order, onClose }: { order: Order; onClose: () => void }) {
  const { offers, loading, error } = useOrderOffers(order.id)
  const { resolveOffer, loading: deciding, error: decideError } = useOfferActions()
  const [comment, setComment] = useState("")

  async function decide(providerId: string, decision: OfferStatus.accepted | OfferStatus.declined) {
    if (await resolveOffer(order.id, providerId, decision, comment)) {
      setComment("")
      if (decision === OfferStatus.accepted) onClose()
    }
  }

  return (
    <div
      className="overlay items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="offers-title"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="sheet flex max-h-[85vh] w-full max-w-2xl flex-col p-6 md:p-7">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id="offers-title" className="text-[18px] font-semibold text-text">
              Preisangebote
            </h2>
            <p className="mt-0.5 line-clamp-1 text-[13px] text-text/50">{order.title}</p>
          </div>
          <button type="button" onClick={onClose} className="icon-btn -mr-1.5" aria-label="Schließen">
            <X size={18} strokeWidth={1.9} aria-hidden />
          </button>
        </div>

        {(error || decideError) && (
          <p role="alert" className="notice notice-error mb-4">
            {decideError ?? error}
          </p>
        )}
        {loading && <div className="skeleton h-32 rounded-lg" />}
        {!loading && offers.length === 0 && (
          <p className="text-[14px] text-text/50">Noch keine Angebote vorhanden.</p>
        )}

        <div className="-mx-1 flex flex-col gap-3 overflow-y-auto px-1">
          {offers.map((offer) => {
            const canDecide = offer.status === OfferStatus.pending && order.status === OrderStatus.open

            return (
              <div key={offer.id} className="card-flat p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="num text-[19px] font-semibold text-text">
                      {formatEuro(offer.priceInCent)} €
                    </p>
                    <p className="mt-0.5 text-[13px] text-text/55">{offer.providerName}</p>
                  </div>
                  <span className={`pill ${offerStatusStyle[offer.status] ?? "pill-muted"}`}>
                    {OFFER_STATUS_LABEL[offer.status] ?? offer.status}
                  </span>
                </div>

                {offer.message && (
                  <p className="mt-3 text-[13.5px] leading-relaxed text-text/65">{offer.message}</p>
                )}

                {canDecide && (
                  <>
                    <textarea
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      rows={2}
                      placeholder="Optionaler Kommentar bei Ablehnung"
                      className="field mt-4 resize-none"
                    />

                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        disabled={deciding}
                        onClick={() => decide(offer.providerId, OfferStatus.declined)}
                        className="btn btn-outline btn-sm flex-1"
                      >
                        Ablehnen
                      </button>
                      <button
                        type="button"
                        disabled={deciding}
                        onClick={() => decide(offer.providerId, OfferStatus.accepted)}
                        className="btn btn-primary btn-sm flex-1"
                      >
                        Annehmen
                      </button>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
