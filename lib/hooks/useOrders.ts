"use client"

import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"
import type { Order } from "@/lib/types/order"

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadOrders() {
      try {
        const snapshot = await getDocs(collection(db, "orders"))

        const data: Order[] = snapshot.docs
          .filter((doc) => doc.id !== "counter")
          .map((doc) => {
            const raw = doc.data() as Omit<Order, "id" | "firestoreId"> & { id?: number }
            const numericId = typeof raw.id === "number" ? raw.id : Number(doc.id)

            return {
              ...raw,
              id: numericId,
              firestoreId: doc.id,
            }
          })

        setOrders(data)
      } catch (err) {
        console.error(err)
        setError("Aufträge konnten nicht geladen werden")
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  return { orders, loading, error }
}