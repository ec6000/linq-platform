"use client"

import { doc, increment, runTransaction, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"
import { requireAppUser } from "@/lib/firebase/currentUser"
import { assertMoney, newId, withoutUndefined } from "@/lib/utils/validation"
import { OfferStatus } from "@/lib/types/offer"
import { OrderStatus } from "@/lib/types/order"
import { JobSourceType, JobStatus } from "@/lib/types/job"
import { PricingType } from "@/lib/types/common"

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
  if (message.trim().length > 500) throw new Error("Der Kommentar ist zu lang.")

  await runTransaction(db, async (transaction) => {
    const orderRef = doc(db, "orders", orderId)
    const order = (await transaction.get(orderRef)).data()
    const existing = await transaction.get(offerRef(orderId, user.uid))

    if (!order || order.status !== OrderStatus.open) throw new Error("Der Auftrag ist nicht mehr verfügbar.")
    if (order.customerId === user.uid) throw new Error("Auf eigene Aufträge kann man nicht bieten.")
    if (existing.exists()) throw new Error("Du hast bereits ein Angebot für diesen Auftrag abgegeben.")

    transaction.set(offerRef(orderId, user.uid), {
      orderId,
      orderTitle: order.title,
      providerId: user.uid,
      providerName: user.displayName,
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
    const snapshot = await transaction.get(ref)
    const offer = snapshot.data()
    if (!offer || offer.status !== OfferStatus.pending) {
      throw new Error("Nur eigene offene Angebote können zurückgezogen werden.")
    }
    transaction.delete(ref)
    transaction.update(orderRef, { offerCount: increment(-1), updatedAt: serverTimestamp() })
  })
}

/**
 * Accepting an offer is the hinge of flow B: it assigns the order, creates the
 * job and closes the bidding — all in one transaction, so the three can never
 * disagree about who won.
 */
export async function decideOffer(
  orderId: string,
  providerId: string,
  decision: OfferStatus.accepted | OfferStatus.declined,
  comment = "",
) {
  const user = await requireAppUser("customer")

  return runTransaction(db, async (transaction) => {
    const orderRef = doc(db, "orders", orderId)
    const ref = offerRef(orderId, providerId)
    const orderSnapshot = await transaction.get(orderRef)
    const offerSnapshot = await transaction.get(ref)
    const order = orderSnapshot.data()
    const offer = offerSnapshot.data()

    if (!order || order.customerId !== user.uid || !offer) throw new Error("Angebot nicht gefunden.")
    if (order.status !== OrderStatus.open || offer.status !== OfferStatus.pending) {
      throw new Error("Dieses Angebot kann nicht mehr geändert werden.")
    }

    transaction.update(ref, {
      status: decision,
      customerComment: comment.trim(),
      decidedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    if (decision === OfferStatus.declined) {
      transaction.update(orderRef, { offerCount: increment(-1), updatedAt: serverTimestamp() })
      return null
    }

    assertMoney(offer.priceInCent)
    const jobId = newId()
    transaction.set(
      doc(db, "jobs", jobId),
      withoutUndefined({
        sourceType: JobSourceType.order,
        sourceId: orderId,
        customerId: order.customerId,
        customerName: order.customerName,
        providerId: offer.providerId,
        providerName: offer.providerName,
        title: order.title,
        description: order.description,
        categoryId: order.categoryId,
        categoryName: order.categoryName,
        subcategoryId: order.subcategoryId,
        subcategoryName: order.subcategoryName,
        pricing: { type: PricingType.fixed },
        priceInCent: offer.priceInCent,
        place: order.place,
        scheduledAt: order.timeWindow?.start,
        status: JobStatus.scheduled,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    )

    transaction.update(orderRef, {
      status: OrderStatus.assigned,
      assignedProviderId: offer.providerId,
      assignedProviderName: offer.providerName,
      assignedAt: serverTimestamp(),
      // Bidding is over; the remaining offers stay for the record but no longer count.
      offerCount: 0,
      updatedAt: serverTimestamp(),
    })

    return jobId
  })
}
