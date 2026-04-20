"use client"

import { useState } from "react"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"
import { OfferStatus } from "@/lib/types/offer"

interface CreateOfferParams {
  orderId: string
  priceInCent: number
  comment: string
}

export function useOffer() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function createOffer({ orderId, priceInCent, comment }: CreateOfferParams) {
    setLoading(true)
    setError(null)

    try {

      await addDoc(collection(db, "orders", orderId, "offers"), {
        priceInCent,
        comment,
        status: OfferStatus.pending,
        createdAt: serverTimestamp(),
      })
    } catch (err) {
      console.error(err)
      setError("Angebot konnte nicht gesendet werden")
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createOffer, loading, error }
}