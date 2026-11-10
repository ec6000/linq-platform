"use client"

import { Timestamp, doc, runTransaction, serverTimestamp, writeBatch } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"
import { requireAppUser } from "@/lib/firebase/currentUser"
import { assertMoney, newId, withoutUndefined } from "@/lib/utils/validation"
import { publicPlace } from "@/lib/utils/place"
import { OrderStatus, type PrivateAddress, type TimeWindow } from "@/lib/types/order"
import type { Place } from "@/lib/types/common"
import { shortName } from "@/lib/types/user"

export interface OrderInput {
  title: string
  description: string
  budgetInCent: number
  /** The exact place. Only its neighbourhood is published. */
  place: Place
  categoryId: string
  categoryName: string
  subcategoryId?: string
  subcategoryName?: string
  timeWindow: TimeWindow
}

export function privateAddressRef(orderId: string) {
  return doc(db, "orders", orderId, "private", "address")
}

export function validateOrder(input: OrderInput) {
  assertMoney(input.budgetInCent)
  if (input.budgetInCent <= 0) throw new Error("Bitte ein Budget über 0 € angeben.")
  if (!input.title.trim() || !input.description.trim()) throw new Error("Titel und Beschreibung fehlen.")
  if (!input.categoryId || !input.subcategoryId) throw new Error("Bitte Kategorie und Unterkategorie auswählen.")
  if (!input.place?.geo || (input.place.geo.latitude === 0 && input.place.geo.longitude === 0)) {
    throw new Error("Bitte einen Ort aus den Vorschlägen auswählen.")
  }
  if (input.timeWindow.end.toMillis() <= input.timeWindow.start.toMillis()) {
    throw new Error("Das Zeitfenster endet vor seinem Beginn.")
  }
}

/** Splits the input into what every provider sees and what only the customer sees. */
function split({ place, ...rest }: OrderInput) {
  return {
    order: withoutUndefined({
      ...rest,
      title: rest.title.trim(),
      description: rest.description.trim(),
      place: publicPlace(place),
    }),
    address: { address: place.address.trim(), geo: place.geo } satisfies PrivateAddress,
  }
}

export function defaultTimeWindow(): TimeWindow {
  const start = Timestamp.now()
  return { start, end: Timestamp.fromMillis(start.toMillis() + 2 * 60 * 60 * 1000), isFlexible: true }
}

export async function createOrder(input: OrderInput) {
  const user = await requireAppUser("customer")
  validateOrder(input)

  const id = newId()
  const { order, address } = split(input)
  const batch = writeBatch(db)
  batch.set(doc(db, "orders", id), {
    ...order,
    customerId: user.uid,
    customerName: shortName(user.displayName),
    status: OrderStatus.open,
    // Kept in sync by the offer writes, so order lists never read the
    // subcollection just to show "3 Angebote".
    offerCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  batch.set(privateAddressRef(id), address)
  await batch.commit()
  return id
}

export async function updateOrder(orderId: string, input: OrderInput) {
  const user = await requireAppUser("customer")
  validateOrder(input)
  const { order, address } = split(input)

  await runTransaction(db, async (transaction) => {
    const ref = doc(db, "orders", orderId)
    const current = (await transaction.get(ref)).data()
    if (!current || current.customerId !== user.uid) throw new Error("Auftrag nicht gefunden.")
    if (current.status !== OrderStatus.open) throw new Error("Nur offene Aufträge können bearbeitet werden.")
    transaction.update(ref, { ...order, updatedAt: serverTimestamp() })
    transaction.set(privateAddressRef(orderId), address)
  })
}

export async function cancelOrder(orderId: string) {
  const user = await requireAppUser("customer")

  await runTransaction(db, async (transaction) => {
    const ref = doc(db, "orders", orderId)
    const order = (await transaction.get(ref)).data()
    if (!order || order.customerId !== user.uid) throw new Error("Auftrag nicht gefunden.")
    if (order.status !== OrderStatus.open) throw new Error("Nur offene Aufträge können storniert werden.")
    transaction.update(ref, {
      status: OrderStatus.cancelled,
      cancelledAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  })
}
