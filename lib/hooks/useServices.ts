"use client"

import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"
import type { Service } from "@/lib/types/service"

export function useServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadServices() {
      try {
        const snapshot = await getDocs(collection(db, "services"))

        const data: Service[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Service, "id">),
        }))

        setServices(data)
      } catch (err) {
        console.error(err)
        setError("Services konnten nicht geladen werden")
      } finally {
        setLoading(false)
      }
    }

    loadServices()
  }, [])

  return { services, loading, error }
}