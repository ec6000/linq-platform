"use client"

import Link from "next/link"
import { ArrowRight, CalendarDays, MapPin } from "lucide-react"
import { ORDER_STATUS_LABEL, OrderStatus, type Order } from "@/lib/types/order"
import { formatEuro, formatTimeRange } from "@/lib/utils/format"

const statusStyles: Record<OrderStatus, string> = {
  [OrderStatus.open]: "pill-accent",
  [OrderStatus.assigned]: "pill-primary",
  [OrderStatus.inProgress]: "pill-primary",
  [OrderStatus.completed]: "pill-success",
  [OrderStatus.cancelled]: "pill-muted",
}

interface OrderCardProps {
  order: Order
  /** How well the order matched the current filters, 0–100. */
  matchScore?: number
  /** Distance from the searched location, in kilometres. */
  distanceKm?: number | null
}

export default function OrderCard({ order, matchScore, distanceKm }: OrderCardProps) {
  const when = formatTimeRange(order.timeWindow.start, order.timeWindow.end)

  return (
    <article className="card card-interactive p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[15.5px] font-semibold leading-snug text-text">{order.title}</h2>
            <span className={`pill ${statusStyles[order.status]}`}>
              {ORDER_STATUS_LABEL[order.status]}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="pill pill-outline">{order.categoryName}</span>
            {order.subcategoryName && <span className="pill pill-muted">{order.subcategoryName}</span>}
            {typeof matchScore === "number" && (
              <span className="pill pill-primary num">Match {matchScore}</span>
            )}
          </div>

          <div className="space-y-1.5 text-[13px] text-text/60">
            {when && (
              <p className="flex items-center gap-2">
                <CalendarDays size={14} strokeWidth={1.8} className="flex-none text-text/35" aria-hidden />
                {when}
                {order.timeWindow.isFlexible && <span className="text-text/35">(flexibel)</span>}
              </p>
            )}
            <p className="flex items-center gap-2">
              <MapPin size={14} strokeWidth={1.8} className="flex-none text-text/35" aria-hidden />
              <span className="truncate">{order.place.address}</span>
              {typeof distanceKm === "number" && (
                <span className="num flex-none text-text/40">· {distanceKm.toFixed(1)} km</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-3">
          <div className="sm:text-right">
            <span className="num text-[19px] font-semibold text-text">
              {formatEuro(order.budgetInCent, { decimals: false })} €
            </span>
            {order.offerCount > 0 && (
              <p className="num text-[12px] text-text/45">
                {order.offerCount} {order.offerCount === 1 ? "Angebot" : "Angebote"}
              </p>
            )}
          </div>
          <Link href={`/find-jobs/${order.id}`} className="btn btn-outline btn-sm">
            Details
            <ArrowRight size={14} strokeWidth={2.2} aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  )
}
