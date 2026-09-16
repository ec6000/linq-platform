"use client"

import { Timestamp, doc, runTransaction, serverTimestamp, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"
import { requireAppUser } from "@/lib/firebase/currentUser"
import { assertMoney, newId, withoutUndefined } from "@/lib/utils/validation"
import { OrderPriority, OrderStatus, type TimeWindow } from "@/lib/types/order"
import type { Place } from "@/lib/types/common"

export interface OrderInput {
  title: string
  description: string
  budgetInCent: number
  place: Place
  radiusKm: number
  categoryId: string
  categoryName: string
  subcategoryId?: string
  subcategoryName?: string
  timeWindow: TimeWindow
  priority?: OrderPriority
  imageUrls?: string[]
}

export function validateOrder(input: OrderInput) {
  assertMoney(input.budgetInCent)
  if (!input.title.trim() || !input.description.trim()) throw new Error("Titel und Beschreibung fehlen.")
  if (!input.categoryId || !input.subcategoryId) throw new Error("Bitte Kategorie und Unterkategorie auswählen.")
  if (!Number.isFinite(input.radiusKm) || input.radiusKm <= 0) throw new Error("Ungültiger Radius.")
  if (!input.place?.geo || (input.place.geo.latitude === 0 && input.place.geo.longitude === 0)) {
    throw new Error("Bitte einen Ort aus den Vorschlägen auswählen.")
  }
  if (input.timeWindow.end.toMillis() < input.timeWindow.start.toMillis()) {
    throw new Error("Das Zeitfenster endet vor seinem Beginn.")
  }
}

export function defaultTimeWindow(): TimeWindow {
  const start = Timestamp.now()
  return {
    start,
    end: Timestamp.fromMillis(start.toMillis() + 2 * 60 * 60 * 1000),
    isFlexible: true,
  }
}

export async function createOrder(input: OrderInput) {
  const user = await requireAppUser("customer")
  validateOrder(input)

  const id = newId()
  await setDoc(
    doc(db, "orders", id),
    withoutUndefined({
      ...input,
      priority: input.priority ?? OrderPriority.normal,
      imageUrls: input.imageUrls ?? [],
      customerId: user.uid,
      customerName: user.displayName,
      status: OrderStatus.open,
      // Kept in sync by the offer writes, so order lists never read the
      // subcollection just to show "3 Angebote".
      offerCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  )
  return id
}

export async function updateOrder(orderId: string, input: OrderInput) {
  const user = await requireAppUser("customer")
  validateOrder(input)

  await runTransaction(db, async (transaction) => {
    const ref = doc(db, "orders", orderId)
    const snapshot = await transaction.get(ref)
    const order = snapshot.data()
    if (!order || order.customerId !== user.uid) throw new Error("Auftrag nicht gefunden.")
    if (order.status !== OrderStatus.open) throw new Error("Nur offene Aufträge können bearbeitet werden.")
    transaction.update(ref, { ...withoutUndefined(input), updatedAt: serverTimestamp() })
  })
}

export async function cancelOrder(orderId: string) {
  const user = await requireAppUser("customer")

  await runTransaction(db, async (transaction) => {
    const ref = doc(db, "orders", orderId)
    const snapshot = await transaction.get(ref)
    const order = snapshot.data()
    if (!order || order.customerId !== user.uid) throw new Error("Auftrag nicht gefunden.")
    if (order.status !== OrderStatus.open) throw new Error("Nur offene Aufträge können storniert werden.")
    transaction.update(ref, {
      status: OrderStatus.cancelled,
      cancelledAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  })
}
