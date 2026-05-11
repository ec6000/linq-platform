"use client"

import { useCallback, useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"
import type { Service } from "@/lib/types/service"

export function useServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadServices = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const snapshot = await getDocs(collection(db, "services"))

      const data: Service[] = snapshot.docs
        .filter((doc) => doc.id !== "counter")
        .map((doc) => {
          const raw = doc.data() as Omit<Service, "id" | "firestoreId"> & { id?: number }
          const numericId = typeof raw.id === "number" ? raw.id : Number(doc.id)

          return {
            ...raw,
            id: numericId,
            firestoreId: doc.id,
          }
        })

      setServices(data)
    } catch (err) {
      console.error(err)
      setError("Services konnten nicht geladen werden")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadServices()
  }, [loadServices])

  return { services, loading, error, reload: loadServices }
}
