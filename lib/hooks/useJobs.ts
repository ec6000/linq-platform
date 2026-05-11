"use client"

import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"
import type { Job } from "@/lib/types/job"

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadJobs() {
      try {
        const snapshot = await getDocs(collection(db, "jobs"))

        const data: Job[] = snapshot.docs
          .filter((doc) => doc.id !== "counter")
          .map((doc) => {
            const raw = doc.data() as Omit<Job, "id" | "firestoreId"> & { id?: number }
            const numericId = typeof raw.id === "number" ? raw.id : Number(doc.id)

            return {
              ...raw,
              id: numericId,
              firestoreId: doc.id,
            }
          })

        setJobs(data)
      } catch (err) {
        console.error(err)
        setError("Jobs konnten nicht geladen werden")
      } finally {
        setLoading(false)
      }
    }

    loadJobs()
  }, [])

  return { jobs, loading, error }
}