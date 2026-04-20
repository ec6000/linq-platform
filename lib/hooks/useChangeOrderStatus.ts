"use client"

import { useState } from "react"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"
import type { OrderStatus } from "@/lib/types/order"

export function useUpdateOrderStatus() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function updateOrderStatus(orderId: string, status: OrderStatus) {
    setLoading(true)
    setError(null)

    try {
      const orderRef = doc(db, "orders", orderId)

      await updateDoc(orderRef, {
        status,
      })
    } catch (err) {
      console.error(err)
      setError("Status konnte nicht aktualisiert werden")
    } finally {
      setLoading(false)
    }
  }

  return { updateOrderStatus, loading, error }
}