"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft, CalendarDays, CircleDollarSign, MapPin, UserRound } from "lucide-react"
import OfferModal from "@/components/find-jobs/OfferModal"
import ConfirmationModal from "@/components/ConfirmationModal"
import { useOrder } from "@/lib/hooks/useOrders"
import { useMyOffer, useOfferActions } from "@/lib/hooks/useOffers"
import { ORDER_STATUS_LABEL, OrderStatus } from "@/lib/types/order"
import { OFFER_STATUS_LABEL, OfferStatus } from "@/lib/types/offer"
import { formatEuro, formatTimeRange } from "@/lib/utils/format"
import { parseDocumentId } from "@/lib/utils/validation"

const statusStyles: Record<OrderStatus, string> = {
  [OrderStatus.open]: "pill-accent",
  [OrderStatus.assigned]: "pill-primary",
  [OrderStatus.inProgress]: "pill-primary",
  [OrderStatus.completed]: "pill-success",
  [OrderStatus.cancelled]: "pill-muted",
}

function BackLink() {
  return (
    <Link href="/find-jobs" className="link-quiet mb-7 inline-flex items-center gap-1.5 text-[13.5px]">
      <ArrowLeft size={14} strokeWidth={2} aria-hidden />
      Zurück zur Übersicht
    </Link>
  )
}

export default function DetailedOrderPage() {
  const params = useParams<{ orderId: string }>()
  const orderId = parseDocumentId(params.orderId)

  const { order, loading, error } = useOrder(orderId ?? undefined)
  const { offer, loading: offerLoading } = useMyOffer(orderId ?? undefined)
  const { retractOffer, loading: retracting, error: offerError } = useOfferActions()

  const [modalOpen, setModalOpen] = useState(false)
  const [withdrawConfirmOpen, setWithdrawConfirmOpen] = useState(false)

  if (loading) {
    return (
      <main id="main" className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 md:px-10 md:py-10">
        <div className="skeleton h-[560px] rounded-xl" />
      </main>
    )
  }

  if (error || !order) {
    return (
      <main id="main" className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 md:px-10 md:py-10">
        <BackLink />
        <div className="empty">
          <h1 className="text-[17px] font-semibold text-text">
            {error ? "Auftrag konnte nicht geladen werden" : "Auftrag nicht gefunden"}
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-text/50">
            {error ?? "Der Auftrag ist nicht mehr verfügbar oder wurde entfernt."}
          </p>
          <Link href="/find-jobs" className="btn btn-outline mt-7">
            Zurück zur Übersicht
          </Link>
        </div>
      </main>
    )
  }

  const canBid = order.status === OrderStatus.open && !offerLoading

  const facts = [
    {
      icon: CalendarDays,
      label: "Zeitfenster",
      value: formatTimeRange(order.timeWindow.start, order.timeWindow.end) ?? "Nach Absprache",
      hint: order.timeWindow.isFlexible ? "Zeitpunkt ist flexibel." : undefined,
    },
    {
      icon: MapPin,
      label: "Ort & Radius",
      value: order.place.address,
      hint: `Suchradius: ${order.radiusKm} km`,
    },
    { icon: UserRound, label: "Kunde", value: order.customerName },
    {
      icon: CircleDollarSign,
      label: "Dein Angebot",
      value: offer ? `${formatEuro(offer.priceInCent)} €` : "Noch kein Angebot gesendet.",
      hint: offer ? OFFER_STATUS_LABEL[offer.status] : undefined,
    },
  ]

  return (
    <main id="main" className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 md:px-10 md:py-10">
      <BackLink />

      {offerError && (
        <p role="alert" className="notice notice-error mb-5">
          {offerError}
        </p>
      )}

      <section className="card bg-background p-5 sm:p-6 md:p-9 lg:p-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="display text-[28px] text-primary md:text-[36px]">{order.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className={`pill ${statusStyles[order.status]}`}>
                {ORDER_STATUS_LABEL[order.status]}
              </span>
              <span className="pill pill-outline">
                {order.categoryName}
                {order.subcategoryName ? ` · ${order.subcategoryName}` : ""}
              </span>
              {order.offerCount > 0 && (
                <span className="pill pill-muted num">
                  {order.offerCount} {order.offerCount === 1 ? "Angebot" : "Angebote"}
                </span>
              )}
            </div>
          </div>

          <div className="card-sunken flex-none px-5 py-4 sm:text-right">
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-text/40">
              Budget
            </p>
            <p className="num mt-1 text-[24px] font-semibold text-text">
              {formatEuro(order.budgetInCent, { decimals: false })} €
            </p>
          </div>
        </div>

        <dl className="mt-9 grid gap-px overflow-hidden rounded-lg border border-secondary bg-secondary sm:grid-cols-2 lg:grid-cols-4">
          {facts.map(({ icon: Icon, label, value, hint }) => (
            <div key={label} className="bg-background p-5">
              <dt className="flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-text/40">
                <Icon size={13} strokeWidth={2} aria-hidden />
                {label}
              </dt>
              <dd className="mt-2 text-[14px] text-text">{value}</dd>
              {hint && <p className="mt-1 text-[12.5px] text-text/45">{hint}</p>}
            </div>
          ))}
        </dl>

        <div className="mt-9">
          <h2 className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-text/40">
            Auftragsbeschreibung
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-[15px] leading-[1.7] text-text/75">
            {order.description}
          </p>
        </div>

        {order.imageUrls.length > 0 && (
          <div className="mt-9">
            <h2 className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-text/40">
              Bilder
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {order.imageUrls.map((url) => (
                <div
                  key={url}
                  className="relative h-44 w-full overflow-hidden rounded-md border border-secondary bg-muted"
                >
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

        {canBid && (
          <div className="mt-9 flex flex-wrap items-center justify-end gap-2 border-t border-secondary pt-6">
            {offer && offer.status === OfferStatus.pending ? (
              <button
                type="button"
                disabled={retracting}
                onClick={() => setWithdrawConfirmOpen(true)}
                className="btn btn-danger"
              >
                Angebot zurückziehen
              </button>
            ) : (
              !offer && (
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="btn btn-primary btn-lg"
                >
                  Angebot senden
                </button>
              )
            )}
          </div>
        )}
      </section>

      <ConfirmationModal
        open={withdrawConfirmOpen}
        title="Angebot wirklich zurückziehen?"
        description="Danach ist dein Preisangebot für diesen Auftrag nicht mehr aktiv."
        confirmLabel="Ja, zurückziehen"
        destructive
        loading={retracting}
        onCancel={() => setWithdrawConfirmOpen(false)}
        onConfirm={async () => {
          if (await retractOffer(order.id)) setWithdrawConfirmOpen(false)
        }}
      />

      <OfferModal
        orderId={order.id}
        orderTitle={order.title}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </main>
  )
}
