"use client"

import { useMemo, useState } from "react"
import { collection, collectionGroup, doc, orderBy, query, where } from "firebase/firestore"
import { useAuth } from "@/components/auth/AuthProvider"
import { db } from "@/lib/firebase/firebase"
import { decodeDocument } from "@/lib/firebase/documents"
import { useFirestoreDocument, useFirestoreQuery } from "@/lib/hooks/useFirestoreQuery"
import { createOffer, decideOffer, withdrawOffer } from "@/lib/data/offers"
import { isValidDocumentId } from "@/lib/utils/validation"
import type { Offer, OfferStatus } from "@/lib/types/offer"

const decode = decodeDocument<Offer>

/**
 * Every offer this provider has made, across all orders.
 *
 * A collection-group query over `offers` needs the index declared in
 * firestore.indexes.json.
 */
export function useProviderOffers() {
  const { user } = useAuth()
  const uid = user?.uid
  const role = user?.role
  const source = useMemo(
    () =>
      uid && role === "provider"
        ? query(
            collectionGroup(db, "offers"),
            where("providerId", "==", uid),
            orderBy("createdAt", "desc"),
          )
        : null,
    [uid, role],
  )
  const { data, ...state } = useFirestoreQuery(source, decode, "Preisangebote konnten nicht geladen werden.")
  return { offers: data, ...state }
}

/** Every offer on one order — what the customer compares. */
export function useOrderOffers(orderId?: string) {
  const source = useMemo(
    () =>
      isValidDocumentId(orderId)
        ? query(collection(db, "orders", orderId, "offers"), orderBy("createdAt", "desc"))
        : null,
    [orderId],
  )
  const { data, ...state } = useFirestoreQuery(source, decode, "Angebote konnten nicht geladen werden.")
  return { offers: data, ...state }
}

/**
 * This provider's own offer on one order.
 *
 * The offer document is keyed by provider UID, so this is a direct document
 * read rather than a filtered query.
 */
export function useMyOffer(orderId?: string) {
  const { user } = useAuth()
  const uid = user?.uid
  const role = user?.role
  const source = useMemo(
    () =>
      isValidDocumentId(orderId) && uid && role === "provider"
        ? doc(db, "orders", orderId, "offers", uid)
        : null,
    [orderId, uid, role],
  )
  const { data, ...state } = useFirestoreDocument<Offer>(source, "Angebot konnte nicht geladen werden.")
  return { offer: data, ...state }
}

export function useOfferActions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function run<A extends unknown[], R>(action: (...args: A) => Promise<R>, fallback: string) {
    return async (...args: A) => {
      setLoading(true)
      setError(null)
      try {
        await action(...args)
        return true
      } catch (err) {
        console.error(err)
        setError(err instanceof Error ? err.message : fallback)
        return false
      } finally {
        setLoading(false)
      }
    }
  }

  return {
    loading,
    error,
    submitOffer: run(
      (orderId: string, priceInCent: number, message: string) => createOffer(orderId, priceInCent, message),
      "Angebot konnte nicht gesendet werden.",
    ),
    retractOffer: run(
      (orderId: string) => withdrawOffer(orderId),
      "Angebot konnte nicht zurückgezogen werden.",
    ),
    resolveOffer: run(
      (orderId: string, providerId: string, decision: OfferStatus.accepted | OfferStatus.declined, comment?: string) =>
        decideOffer(orderId, providerId, decision, comment),
      "Angebot konnte nicht geändert werden.",
    ),
  }
}
