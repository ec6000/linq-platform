"use client"

import Link from "next/link"
import { ClipboardList, Clock3, MapPin, Tag } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { useOrders } from "@/lib/hooks/useOrders"
import { OrderPriority, OrderStatus } from "@/lib/types/order"

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

const priorityLabel: Record<OrderPriority, string> = {
  [OrderPriority.low]: "Niedrig",
  [OrderPriority.normal]: "Normal",
  [OrderPriority.high]: "Hoch",
  [OrderPriority.urgent]: "Dringend",
}

function formatDateRange(startIso?: string, endIso?: string) {
  if (!startIso || !endIso) return "Zeitfenster folgt"

  const start = new Date(startIso)
  const end = new Date(endIso)

  return `${start.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })} · ${start.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}-${end.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}`
}

export default function CustomerMyOrdersPage() {
  const { user } = useAuth()
  const { orders, loading, error } = useOrders()

  const myOrders = orders
    .filter((order) => user?.numericId && order.customerId === user.numericId)
    .sort((a, b) => b.id - a.id)

  return (
    <main className="mx-auto max-w-[1600px] px-6 py-6 md:px-10 md:py-8">
      <div className="mb-5 flex items-center gap-3">
        <ClipboardList size={22} className="text-primary" strokeWidth={1.8} />
        <h1 className="text-[22px] font-semibold tracking-tight text-text">Meine Aufträge</h1>
      </div>

      {loading && <p className="rounded-2xl border border-secondary p-6 text-sm text-text/60">Aufträge werden geladen…</p>}
      {error && <p className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">{error}</p>}

      {!loading && !error && myOrders.length === 0 && (
        <section className="rounded-3xl border border-secondary bg-background p-8 text-center">
          <h2 className="text-lg font-semibold text-text">Noch keine Aufträge</h2>
          <p className="mt-2 text-sm text-text/55">Sobald du eine Anfrage stellst, erscheint sie hier.</p>
          <Link
            href="/find-services"
            className="mt-5 inline-flex items-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Service finden
          </Link>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {myOrders.map((order) => {
          const startIso = order.timeWindow?.start?.toDate?.()?.toISOString()
          const endIso = order.timeWindow?.end?.toDate?.()?.toISOString()
          const locationText = order.address?.trim() || "Ort nicht angegeben"

          return (
            <article key={order.id} className="rounded-3xl border border-secondary bg-background p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <h2 className="line-clamp-2 text-lg font-semibold leading-snug text-text">{order.title}</h2>
                <span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${statusStyle[order.status]}`}>
                  {statusLabel[order.status]}
                </span>
              </div>

              <p className="line-clamp-3 text-sm leading-6 text-text/60">{order.description}</p>

              <div className="mt-4 space-y-2 text-sm text-text/60">
                <div className="flex items-center gap-2">
                  <Clock3 size={15} className="text-text/40" />
                  <span>{formatDateRange(startIso, endIso)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="text-text/40" />
                  <span>{locationText}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag size={15} className="text-text/40" />
                  <span>{priorityLabel[order.priority]} · {(order.budgetInCent / 100).toLocaleString("de-DE")} €</span>
                </div>
              </div>
            </article>
          )
        })}
      </section>
    </main>
  )
}
