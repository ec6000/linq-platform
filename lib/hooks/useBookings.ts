"use client"

import { useMemo, useState } from "react"
import { collection, orderBy, query, where } from "firebase/firestore"
import { useAuth } from "@/components/auth/AuthProvider"
import { db } from "@/lib/firebase/firebase"
import { decodeDocument } from "@/lib/firebase/documents"
import { useFirestoreQuery } from "@/lib/hooks/useFirestoreQuery"
import { createBooking, respondToBooking, type BookingInput } from "@/lib/data/bookings"
import type { Booking, BookingStatus } from "@/lib/types/booking"

const decode = decodeDocument<Booking>

/** The signed-in user's bookings, from whichever side of the deal they are on. */
export function useBookings() {
  const { user } = useAuth()
  const uid = user?.uid
  const role = user?.role
  const source = useMemo(
    () =>
      uid
        ? query(
            collection(db, "bookings"),
            where(role === "customer" ? "customerId" : "providerId", "==", uid),
            orderBy("createdAt", "desc"),
          )
        : null,
    [uid, role],
  )
  const { data, ...state } = useFirestoreQuery(source, decode, "Buchungen konnten nicht geladen werden.")
  return { bookings: data, ...state }
}

export function useCreateBooking() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(input: BookingInput) {
    setLoading(true)
    setError(null)
    try {
      return await createBooking(input)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Anfrage konnte nicht gesendet werden.")
      return null
    } finally {
      setLoading(false)
    }
  }

  return { submit, loading, error }
}

export function useRespondToBooking() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function respond(
    bookingId: string,
    decision: BookingStatus.accepted | BookingStatus.declined,
    message?: string,
  ) {
    setLoading(true)
    setError(null)
    try {
      await respondToBooking(bookingId, decision, message)
      return true
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Buchung konnte nicht beantwortet werden.")
      return false
    } finally {
      setLoading(false)
    }
  }

  return { respond, loading, error }
}
