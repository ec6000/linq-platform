"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Pencil, Plus, X } from "lucide-react"
import { useMyOrders } from "@/lib/hooks/useOrders"
import { useOfferActions, useOrderOffers } from "@/lib/hooks/useOffers"
import { cancelOrder } from "@/lib/data/orders"
import { OrderStatus, hasExpired, type Order } from "@/lib/types/order"
import { OfferStatus } from "@/lib/types/offer"
import { formatEuro, formatTimeRange } from "@/lib/utils/format"
import PageHeader from "@/components/layout/PageHeader"
import ConfirmationModal from "@/components/ConfirmationModal"
import ListState from "@/components/ListState"
import StatusPill from "@/components/StatusPill"

export default function CustomerMyOrdersPage() {
  const { orders, loading, error } = useMyOrders()
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [offersOrder, setOffersOrder] = useState<Order | null>(null)
  const [now] = useState(() => Date.now())

  async function handleCancel() {
    if (!cancelTarget) return
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

      <section className="flex flex-col gap-4">
        <ListState
          loading={loading}
          error={error}
          empty={orders.length === 0}
          emptyText="Beschreib in zwei Minuten, was du brauchst. Dienstleister aus Köln schicken dir ihren Preis."
        >
          <Link href="/my-orders/create" className="btn btn-primary">
            Ersten Auftrag erstellen
          </Link>
        </ListState>

        {orders.map((order) => {
          const isOpen = order.status === OrderStatus.open
          return (
            <article key={order.id} className="card p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-[17px] font-semibold leading-snug text-text">{order.title}</h2>
                <StatusPill status={order.status} />
              </div>

              <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[12.5px] text-text/45">
                <span>{formatTimeRange(order.timeWindow.start, order.timeWindow.end)}</span>
                <span className="num">{formatEuro(order.budgetInCent, { decimals: false })} € Budget</span>
                {order.assignedProviderName && <span>an {order.assignedProviderName}</span>}
                {isOpen && hasExpired(order, now) && (
                  <span className="font-medium text-text/70">Termin vorbei, für Dienstleister nicht mehr sichtbar</span>
                )}
              </p>

              {isOpen && (
                <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
                  <button type="button" onClick={() => setCancelTarget(order)} className="btn btn-ghost btn-sm">
                    Stornieren
                  </button>
                  {order.offerCount === 0 && (
                    <Link href={`/my-orders/${order.id}/edit`} className="btn btn-ghost btn-sm">
                      <Pencil size={14} strokeWidth={1.9} aria-hidden />
                      Bearbeiten
                    </Link>
                  )}
                  <button
                    type="button"
                    disabled={order.offerCount === 0}
                    onClick={() => setOffersOrder(order)}
                    className="btn btn-primary btn-sm"
                  >
                    {order.offerCount === 0
                      ? "Noch keine Angebote"
                      : `${order.offerCount} ${order.offerCount === 1 ? "Angebot" : "Angebote"} ansehen`}
                  </button>
                </div>
              )}
              {!isOpen && order.jobId && (
                <p className="mt-4 text-[13px] text-text/50">
                  Kontakt und Termin stehen in deiner{" "}
                  <Link href="/customer-dashboard" className="font-medium text-primary hover:underline">
                    Übersicht
                  </Link>
                  .
                </p>
              )}
            </article>
          )
        })}
      </section>

      <ConfirmationModal
        open={cancelTarget !== null}
        title="Auftrag stornieren?"
        description="Er verschwindet für Dienstleister aus der Suche. Offene Angebote verfallen."
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

/** Compare and decide. Accepting one offer declines the rest in the same step. */
function OffersSheet({ order, onClose }: { order: Order; onClose: () => void }) {
  const { offers, loading, error } = useOrderOffers(order.id)
  const { resolveOffer, loading: deciding, error: decideError } = useOfferActions()
  const pending = offers.filter((offer) => offer.status === OfferStatus.pending)
  // Accepting is binding, so it takes a second, deliberate tap.
  const [confirming, setConfirming] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  async function decide(providerId: string, decision: OfferStatus.accepted | OfferStatus.declined) {
    if ((await resolveOffer(order.id, providerId, decision)) && decision === OfferStatus.accepted) onClose()
  }

  return (
    <div
      className="overlay items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="offers-title"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="sheet flex max-h-[85vh] w-full max-w-xl flex-col p-6 md:p-7">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id="offers-title" className="text-[18px] font-semibold text-text">
              Angebote
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
        {!loading && pending.length === 0 && <p className="text-[14px] text-text/50">Keine offenen Angebote.</p>}

        <div className="-mx-1 flex flex-col gap-3 overflow-y-auto px-1">
          {[...pending]
            .sort((a, b) => a.priceInCent - b.priceInCent)
            .map((offer) => (
              <div key={offer.id} className="card-flat p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[14px] font-medium text-text">{offer.providerName}</p>
                  <p className="num text-[19px] font-semibold text-text">{formatEuro(offer.priceInCent)} €</p>
                </div>
                {offer.message && <p className="mt-2 text-[13.5px] leading-relaxed text-text/65">{offer.message}</p>}

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    disabled={deciding}
                    onClick={() => decide(offer.providerId, OfferStatus.declined)}
                    className="btn btn-ghost btn-sm flex-1"
                  >
                    Ablehnen
                  </button>
                  <button
                    type="button"
                    disabled={deciding}
                    onClick={() =>
                      confirming === offer.id
                        ? decide(offer.providerId, OfferStatus.accepted)
                        : setConfirming(offer.id)
                    }
                    className="btn btn-primary btn-sm flex-1"
                  >
                    {confirming === offer.id ? "Verbindlich annehmen" : "Annehmen"}
                  </button>
                </div>
              </div>
            ))}
        </div>

        {pending.length > 1 && (
          <p className="mt-4 text-[12.5px] text-text/45">
            Mit dem Annehmen bekommt ihr gegenseitig eure Kontaktdaten; alle anderen Angebote werden abgelehnt.
          </p>
        )}
      </div>
    </div>
  )
}
