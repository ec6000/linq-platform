"use client"
import { useState } from "react"
import { ClipboardList, Search } from "lucide-react"
import { useOrders } from "@/lib/hooks/useOrders"
import OrderCard from "@/components/find-jobs/OrderCard"

export default function FindOrders() {
  const { orders, loading, error } = useOrders()
  const [query, setQuery] = useState("")

  const filtered = orders.filter((order) =>
    order.title.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <main className="mx-auto max-w-[1600px] px-6 py-10">
      <div className="mb-8 flex items-center gap-3">
        <ClipboardList size={22} className="text-primary" strokeWidth={1.8} />
        <h1 className="text-[22px] font-semibold tracking-tight text-text">
          Aufträge finden
        </h1>
      </div>

      {/* Suchfeld */}
      <div className="relative mb-6 max-w-md">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text/30"
          strokeWidth={1.8}
        />
        <input
          type="text"
          placeholder="Aufträge durchsuchen…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl border border-secondary bg-background py-2.5 pl-9 pr-4 text-[14px] text-text placeholder:text-text/30 outline-none transition focus:border-primary/40"
        />
      </div>

      {loading && (
        <p className="text-sm text-text/40">Aufträge werden geladen…</p>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {!loading && !error && filtered.length === 0 && (
        <p className="text-sm text-text/40">
          {query ? `Keine Ergebnisse für „${query}".` : "Keine Aufträge gefunden."}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {filtered.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </main>
  )
}