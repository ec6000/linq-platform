"use client"

import { useMemo, useState } from "react"
import { collection, orderBy, query, where } from "firebase/firestore"
import { useAuth } from "@/components/auth/AuthProvider"
import { db } from "@/lib/firebase/firebase"
import { decodeDocument } from "@/lib/firebase/documents"
import { useFirestoreQuery } from "@/lib/hooks/useFirestoreQuery"
import { changeJobStatus } from "@/lib/data/jobs"
import type { Job, JobStatus } from "@/lib/types/job"

const decode = decodeDocument<Job>

/** The signed-in user's jobs, from whichever side of the deal they are on. */
export function useJobs() {
  const { user } = useAuth()
  const uid = user?.uid
  const role = user?.role
  const source = useMemo(
    () =>
      uid
        ? query(
            collection(db, "jobs"),
            where(role === "customer" ? "customerId" : "providerId", "==", uid),
            orderBy("scheduledAt", "desc"),
          )
        : null,
    [uid, role],
  )
  const { data, ...state } = useFirestoreQuery(source, decode, "Jobs konnten nicht geladen werden.")
  return { jobs: data, ...state }
}

export function useUpdateJobStatus() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function updateJobStatus(jobId: string, status: JobStatus) {
    setLoading(true)
    setError(null)
    try {
      await changeJobStatus(jobId, status)
      return true
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Status konnte nicht aktualisiert werden.")
      return false
    } finally {
      setLoading(false)
    }
  }

  return { updateJobStatus, loading, error }
}
