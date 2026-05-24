"use client"

import { useMemo, useState } from "react"
import { GeoPoint, Timestamp, doc, setDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { db } from "@/lib/firebase/firebase"
import { useOrders } from "@/lib/hooks/useOrders"
import { OrderPriority, OrderStatus } from "@/lib/types/order"
import { useAuth } from "@/components/auth/AuthProvider"

export default function OrderFormPage({ orderId }: { orderId?: number }) {
  const router = useRouter()
  const { user } = useAuth()
  const { orders } = useOrders()
  const existing = useMemo(() => (orderId ? orders.find((order) => order.id === orderId) : undefined), [orderId, orders])

  const [title, setTitle] = useState(existing?.title ?? "")
  const [description, setDescription] = useState(existing?.description ?? "")
  const [address, setAddress] = useState(existing?.address ?? "")
  const [budgetEuro, setBudgetEuro] = useState(existing ? String(Math.round(existing.budgetInCent / 100)) : "")
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!title.trim() || !description.trim() || !budgetEuro) return

    setSaving(true)
    const numericId = orderId ?? Math.max(0, ...orders.map((order) => order.id)) + 1
    const now = Timestamp.now()
    const start = existing?.timeWindow?.start ?? now
    const end = existing?.timeWindow?.end ?? Timestamp.fromDate(new Date(now.toDate().getTime() + 2 * 60 * 60 * 1000))

    await setDoc(
      doc(db, "orders", String(numericId)),
      {
        id: numericId,
        title: title.trim(),
        description: description.trim(),
        customerName: user?.displayName || "Kunde",
        customerId: user?.numericId ?? 0,
        status: existing?.status ?? OrderStatus.available,
        priority: existing?.priority ?? OrderPriority.normal,
        timeWindow: { start, end, isFlexible: true },
        budgetInCent: Math.round(Number(budgetEuro) * 100),
        location: existing?.location ?? new GeoPoint(50.9375, 6.9603),
        address: address.trim(),
        radiusInMeters: existing?.radiusInMeters ?? 10000,
        categoryId: existing?.categoryId ?? "other",
        subcategoryId: existing?.subcategoryId ?? "general",
        imageUrls: existing?.imageUrls ?? [],
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      },
      { merge: true },
    )

    router.push("/my-orders")
    router.refresh()
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-6 md:px-10 md:py-8">
      <h1 className="text-2xl font-semibold text-text">{orderId ? "Auftrag bearbeiten" : "Auftrag erstellen"}</h1>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4 rounded-2xl border border-secondary bg-background p-5">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titel" className="h-11 w-full rounded-xl border border-secondary px-4" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Beschreibung" rows={4} className="w-full rounded-xl border border-secondary px-4 py-3" />
        <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Adresse" className="h-11 w-full rounded-xl border border-secondary px-4" />
        <input value={budgetEuro} onChange={(e) => setBudgetEuro(e.target.value)} placeholder="Budget in €" inputMode="numeric" className="h-11 w-full rounded-xl border border-secondary px-4" />

        <div className="flex gap-2">
          <button type="button" onClick={() => router.push("/my-orders")} className="rounded-xl border border-secondary px-4 py-2 text-sm">Abbrechen</button>
          <button type="submit" disabled={saving} className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white">{saving ? "Speichern…" : "Speichern"}</button>
        </div>
      </form>
    </main>
  )
}
