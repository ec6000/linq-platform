"use client"

import Link from "next/link"
import { ArrowRight, CalendarDays, MapPin } from "lucide-react"
import { Order, OrderStatus } from "@/lib/types/order"
import { useCategories } from "@/lib/hooks/useCategory"
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

interface OrderCardProps {
  order: Order
  matchingScore?: number
  categoryName?: string
}

function formatTimeWindow(order: Order) {
  const start = order.timeWindow.start.toDate()
  const end = order.timeWindow.end.toDate()

  const day = start.toLocaleDateString("de-DE")
  const startTime = start.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
  const endTime = end.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })

  return `${day} · ${startTime}–${endTime}`
}

export default function OrderCard({ order, matchingScore, categoryName }: OrderCardProps) {
  const budget = (order.budgetInCent / 100).toLocaleString("de-DE")
  const resolvedCategoryLabel = categoryName ?? `ID: ${order.categoryId}`

  return (
    <article className="rounded-2xl border border-secondary bg-background px-4 py-4 transition hover:border-primary/30 hover:shadow-sm sm:px-6 sm:py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[15px] font-medium leading-snug text-text">{order.title}</h2>
            <span className="rounded-full border border-secondary px-3 py-1 text-[12px] text-text/70">
              {resolvedCategoryLabel}
            </span>
            {typeof matchingScore === "number" && (
              <span className="rounded-full bg-primary/10 px-3 py-1 text-[12px] font-medium text-primary">
                Score: {matchingScore}
              </span>
            )}
            <span className={`rounded-full px-3 py-1 text-[12px] font-medium ${statusStyles[order.status]}`}>
              {statusLabel[order.status]}
            </span>
          </div>

          <div className="space-y-1 text-[13px] text-text/60">
            <p className="flex items-center gap-1.5">
              <CalendarDays size={14} className="text-text/40" />
              {formatTimeWindow(order)}
              {order.timeWindow.isFlexible && <span className="text-[12px] text-text/40">(flexibel)</span>}
            </p>

            {order.address && (
              <p className="flex items-center gap-1.5 truncate">
                <MapPin size={14} className="shrink-0 text-text/40" />
                <span className="truncate">{order.address}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <span className="text-[15px] font-semibold text-text">{budget}€</span>
          <Link
            href={`/find-jobs/${order.id}`}
            className="inline-flex items-center gap-1 rounded-xl border border-secondary px-3 py-1.5 text-[13px] font-medium text-text/70 transition hover:border-primary/30 hover:text-text"
          >
            Details
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  )
}
