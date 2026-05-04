"use client"

import { useEffect, useState } from "react"
import { collectionGroup, getDocs, query, where, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"
import { OfferStatus } from "@/lib/types/offer"

export interface ProviderOffer {
  id: string
  orderId: string
  orderTitle: string
  priceInCent: number
  comment: string
  status: OfferStatus
  createdAt?: Timestamp
}

export function useProviderOffers(providerId?: string) {
  const [offers, setOffers] = useState<ProviderOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!providerId) {
      setOffers([])
      setLoading(false)
      return
    }

    async function loadOffers() {
      setLoading(true)
      setError(null)

      try {
        const q = query(collectionGroup(db, "offers"), where("providerId", "==", providerId))
        const snapshot = await getDocs(q)
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<ProviderOffer, "id">) }))
        setOffers(data.sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0)))
      } catch (err) {
        console.error(err)
        setError("Preisangebote konnten nicht geladen werden")
      } finally {
        setLoading(false)
      }
    }

    loadOffers()
  }, [providerId])

  return { offers, loading, error }
}
