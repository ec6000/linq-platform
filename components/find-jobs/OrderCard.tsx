"use client"

import { useState } from "react"
import { Order, OrderStatus } from "@/lib/types/order"
import { useMyOffer } from "@/lib/hooks/useMyOffer"
import OfferModal from "./OfferModal"

const statusStyles: Record<OrderStatus, string> = {
  [OrderStatus.available]: "bg-accent/10 text-accent",
  [OrderStatus.assigned]: "bg-secondary text-text/40",
  [OrderStatus.cancelled]: "bg-secondary text-text/40",
}

const statusLabel: Record<OrderStatus, string> = {
  [OrderStatus.available]: "Verfügbar",
  [OrderStatus.assigned]: "Vergeben",
  [OrderStatus.cancelled]: "Storniert",
}

interface OrderCardProps {
  order: Order
}

export default function OrderCard({ order }: OrderCardProps) {
  const [status] = useState<OrderStatus>(order.status)
  const [modalOpen, setModalOpen] = useState(false)
  const { offer, deleting, withdrawOffer } = useMyOffer(order.id)

  const isAvailable = status === OrderStatus.available
  const isInactive = status === OrderStatus.assigned || status === OrderStatus.cancelled
  const hasOffer = !!offer

  return (
    <div
      className={`rounded-2xl border bg-background px-4 py-4 sm:px-6 sm:py-5 transition ${
        isAvailable
          ? "border-secondary hover:border-primary/30 hover:shadow-sm"
          : "border-secondary opacity-60"
      }`}
    >
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {/* Titel + Meta */}
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-[15px] font-medium text-text leading-snug">
            {order.title}
          </span>
          <span className="text-[13px] text-text/50">
            {order.customerName} · {order.date.toDate().toLocaleDateString("de-DE")}
          </span>
        </div>

        {/* Status + Budget — auf Mobile: eigene Zeile, links-rechts aufgeteilt */}
        <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:gap-1 shrink-0">
          <span
            className={`rounded-full px-3 py-1 text-[12px] font-medium ${statusStyles[status]}`}
          >
            {statusLabel[status]}
          </span>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[15px] font-semibold text-text">
              {(order.budgetInCent / 100).toLocaleString("de-DE")}€
            </span>
            {hasOffer && (
              <span className="text-[11px] text-accent font-medium">
                Dein Angebot: {(offer.priceInCent / 100).toLocaleString("de-DE")}€
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="my-4 border-t border-secondary" />

      {/* Footer */}
      <div className="flex items-center justify-end gap-2">
        {isAvailable && !hasOffer && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="w-full sm:w-auto rounded-xl bg-primary px-4 py-2 text-[13px] font-medium text-white transition hover:bg-primary/90 text-center"
          >
            Angebot senden
          </button>
        )}

        {isAvailable && hasOffer && (
          <button
            type="button"
            disabled={deleting}
            onClick={withdrawOffer}
            className="w-full sm:w-auto rounded-xl border border-red-200 px-4 py-2 text-[13px] font-medium text-red-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50 text-center"
          >
            {deleting ? "…" : "Angebot zurückziehen"}
          </button>
        )}

        {isInactive && (
          <span className="text-[13px] text-text/40">{statusLabel[status]}</span>
        )}
      </div>

      <OfferModal
        orderId={order.id}
        orderTitle={order.title}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}