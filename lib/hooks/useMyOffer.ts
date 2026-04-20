"use client"

import { useEffect, useState } from "react"
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"
import type { Offer } from "@/lib/types/offer"

export function useMyOffer(orderId: string) {
  const [offer, setOffer] = useState<Offer | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "orders", orderId, "offers"), (snap) => {
      if (!snap.empty) {
        const d = snap.docs[0]
        setOffer({ id: d.id, ...(d.data() as Omit<Offer, "id">) })
      } else {
        setOffer(null)
      }
      setLoading(false)
    })

    return () => unsub()
  }, [orderId])

  async function withdrawOffer() {
    if (!offer) return
    setDeleting(true)
    setError(null)
    try {
      await deleteDoc(doc(db, "orders", orderId, "offers", offer.id))
    } catch (err) {
      console.error(err)
      setError("Angebot konnte nicht zurückgezogen werden")
    } finally {
      setDeleting(false)
    }
  }

  return { offer, loading, deleting, error, withdrawOffer }
}