"use client"

import { useState } from "react"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"
import type { Job, JobStatus } from "@/lib/types/job"


export function useUpdateJobStatus() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function updateJobStatus(jobId: string, status: JobStatus) {
    setLoading(true)
    setError(null)

    try {
      const jobRef = doc(db, "jobs", jobId)

      await updateDoc(jobRef, {
        status,
      })
    } catch (err) {
      console.error(err)
      setError("Status konnte nicht aktualisiert werden")
    } finally {
      setLoading(false)
    }
  }

  return { updateJobStatus, loading, error }
}