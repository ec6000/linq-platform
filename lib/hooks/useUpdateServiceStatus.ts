"use client"

import { useState } from "react"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"
import { ServiceStatus } from "@/lib/types/service"

export function useUpdateServiceStatus() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function updateServiceStatus(serviceId: string, status: ServiceStatus) {
    setLoading(true)
    setError(null)

    try {
      await updateDoc(doc(db, "services", serviceId), { status })
    } catch (err) {
      console.error(err)
      setError("Status konnte nicht aktualisiert werden")
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { updateServiceStatus, loading, error }
}