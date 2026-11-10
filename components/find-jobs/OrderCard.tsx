import Link from "next/link"
import { ArrowRight, CalendarDays, MapPin } from "lucide-react"
import type { Order } from "@/lib/types/order"
import { formatDistance, formatEuro, formatTimeRange } from "@/lib/utils/format"

/** An open order on the job board. Status is always "open" here, so it is not repeated. */
export default function OrderCard({ order, distanceKm }: { order: Order; distanceKm?: number | null }) {
  return (
    <article className="card card-interactive p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[12.5px] text-text/50">
            {order.categoryName}
            {order.subcategoryName && ` · ${order.subcategoryName}`}
          </p>
          <h2 className="mt-1 text-[16px] font-semibold leading-snug text-text">{order.title}</h2>

          <div className="mt-3 space-y-1.5 text-[13px] text-text/60">
            <p className="flex items-center gap-2">
              <CalendarDays size={14} strokeWidth={1.8} className="flex-none text-text/35" aria-hidden />
              {formatTimeRange(order.timeWindow.start, order.timeWindow.end)}
              {order.timeWindow.isFlexible && <span className="text-text/35">(flexibel)</span>}
            </p>
            <p className="flex items-center gap-2">
              <MapPin size={14} strokeWidth={1.8} className="flex-none text-text/35" aria-hidden />
              {order.place.city}
              {typeof distanceKm === "number" && <span className="num text-text/40">· {formatDistance(distanceKm)}</span>}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-3">
          <div className="sm:text-right">
            <p className="num text-[19px] font-semibold text-text">{formatEuro(order.budgetInCent, { decimals: false })} €</p>
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
