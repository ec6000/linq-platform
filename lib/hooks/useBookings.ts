"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"
import type { Booking } from "@/lib/types/booking"

export function useBookings(providerId?: string) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!providerId) {
      setBookings([])
      setLoading(false)
      setError(null)
      return
    }

    async function loadBookings() {
      try {
        const bookingsQuery = query(collection(db, "bookings"), where("providerId", "==", providerId))
        const snapshot = await getDocs(bookingsQuery)

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
  }, [providerId])

  return { bookings, loading, error }
}
