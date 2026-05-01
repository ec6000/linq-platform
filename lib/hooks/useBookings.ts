"use client"

import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"
import type { Booking } from "@/lib/types/booking"

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadBookings() {
      try {
        const snapshot = await getDocs(collection(db, "bookings"))

        const data: Booking[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Booking, "id">),
        }))

        setBookings(data)
        setError(null)
      } catch (err) {
        console.error(err)
        setError("Bookings konnten nicht geladen werden")
      } finally {
        setLoading(false)
      }
    }

    loadBookings()
  }, [])

  return { bookings, loading, error }
}
