"use client"

import {
  collection,
  doc,
  getDocs,
  increment,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"
import { requireAppUser } from "@/lib/firebase/currentUser"
import { contactOf } from "@/lib/utils/auth"
import { assertMoney, newId, withoutUndefined } from "@/lib/utils/validation"
import { privateAddressRef } from "@/lib/data/orders"
import { OfferStatus } from "@/lib/types/offer"
import { OrderStatus } from "@/lib/types/order"
import { JobSourceType, JobStatus } from "@/lib/types/job"
import { PricingType } from "@/lib/types/common"

export const MAX_OFFER_MESSAGE = 500

/**
 * `orders/{orderId}/offers/{providerId}` — the provider's UID is the document
 * ID, so "one offer per provider per order" cannot be violated even by a
 * concurrent double submit.
 */
function offerRef(orderId: string, providerId: string) {
  return doc(db, "orders", orderId, "offers", providerId)
}

export async function createOffer(orderId: string, priceInCent: number, message: string) {
  const user = await requireAppUser("provider")
  assertMoney(priceInCent)
  if (priceInCent <= 0) throw new Error("Bitte einen Preis über 0 € angeben.")
  if (message.trim().length > MAX_OFFER_MESSAGE) throw new Error("Der Kommentar ist zu lang.")

  await runTransaction(db, async (transaction) => {
    const orderRef = doc(db, "orders", orderId)
    const order = (await transaction.get(orderRef)).data()
    const existing = await transaction.get(offerRef(orderId, user.uid))

    if (!order || order.status !== OrderStatus.open) throw new Error("Der Auftrag ist nicht mehr verfügbar.")
    if (existing.exists()) throw new Error("Du hast bereits ein Angebot für diesen Auftrag abgegeben.")

    transaction.set(offerRef(orderId, user.uid), {
      orderId,
      orderTitle: order.title,
      providerId: user.uid,
      providerName: user.displayName,
      providerContact: contactOf(user),
      priceInCent,
      message: message.trim(),
      status: OfferStatus.pending,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    transaction.update(orderRef, { offerCount: increment(1), updatedAt: serverTimestamp() })
  })
}

export async function withdrawOffer(orderId: string) {
  const user = await requireAppUser("provider")

  await runTransaction(db, async (transaction) => {
    const orderRef = doc(db, "orders", orderId)
    const ref = offerRef(orderId, user.uid)
    const order = (await transaction.get(orderRef)).data()
    const offer = (await transaction.get(ref)).data()
    if (!offer || offer.status !== OfferStatus.pending) {
      throw new Error("Nur eigene offene Angebote können zurückgezogen werden.")
    }
    // Once the customer has chosen, the count is closed and must not drift below zero.
    if (order?.status !== OrderStatus.open) throw new Error("Der Auftrag ist bereits entschieden.")
    transaction.delete(ref)
    transaction.update(orderRef, { offerCount: increment(-1), updatedAt: serverTimestamp() })
  })
}

/**
 * Accepting an offer is the hinge of flow B: it assigns the order, creates the
 * job, closes every competing offer and hands over the exact address — all in
 * one transaction, so none of them can ever disagree about who won.
 */
export async function decideOffer(
  orderId: string,
  providerId: string,
  decision: OfferStatus.accepted | OfferStatus.declined,
) {
  const user = await requireAppUser("customer")
  const orderRef = doc(db, "orders", orderId)
  const ref = offerRef(orderId, providerId)

  // Queries cannot run inside a client transaction, so collect the competing
  // offers first and re-read each one inside it.
  const rivals =
    decision === OfferStatus.accepted
      ? (await getDocs(query(collection(orderRef, "offers"), where("status", "==", OfferStatus.pending))))
          .docs.filter((snapshot) => snapshot.id !== providerId)
          .map((snapshot) => snapshot.ref)
      : []

  return runTransaction(db, async (transaction) => {
    const order = (await transaction.get(orderRef)).data()
    const offer = (await transaction.get(ref)).data()
    if (!order || order.customerId !== user.uid || !offer) throw new Error("Angebot nicht gefunden.")
    if (order.status !== OrderStatus.open || offer.status !== OfferStatus.pending) {
      throw new Error("Dieses Angebot kann nicht mehr geändert werden.")
    }

    const decided = { decidedAt: serverTimestamp(), updatedAt: serverTimestamp() }

    if (decision === OfferStatus.declined) {
      transaction.update(ref, { status: OfferStatus.declined, ...decided })
      transaction.update(orderRef, { offerCount: increment(-1), updatedAt: serverTimestamp() })
      return null
    }

    const address = (await transaction.get(privateAddressRef(orderId))).data()
    const pendingRivals = []
    for (const rival of rivals) {
      if ((await transaction.get(rival)).data()?.status === OfferStatus.pending) pendingRivals.push(rival)
    }

    assertMoney(offer.priceInCent)
    const jobId = newId()
    transaction.set(
      doc(db, "jobs", jobId),
      withoutUndefined({
        sourceType: JobSourceType.order,
        sourceId: orderId,
        customerId: order.customerId,
        customerName: user.displayName,
        customerContact: contactOf(user),
        providerId: offer.providerId,
        providerName: offer.providerName,
        providerContact: offer.providerContact,
        title: order.title,
        description: order.description,
        categoryId: order.categoryId,
        categoryName: order.categoryName,
        subcategoryId: order.subcategoryId,
        subcategoryName: order.subcategoryName,
        pricing: { type: PricingType.fixed },
        priceInCent: offer.priceInCent,
        place: address ? { ...order.place, ...address } : order.place,
        scheduledAt: order.timeWindow.start,
        status: JobStatus.scheduled,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    )

    transaction.update(ref, { status: OfferStatus.accepted, ...decided })
    for (const rival of pendingRivals) transaction.update(rival, { status: OfferStatus.declined, ...decided })
    transaction.update(orderRef, {
      status: OrderStatus.assigned,
      assignedProviderId: offer.providerId,
      assignedProviderName: offer.providerName,
      jobId,
      assignedAt: serverTimestamp(),
      offerCount: 0,
      updatedAt: serverTimestamp(),
    })

    return jobId
  })
}
