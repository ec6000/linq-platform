"use client"

import { Timestamp, doc, runTransaction, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"
import { requireAppUser } from "@/lib/firebase/currentUser"
import { contactOf } from "@/lib/utils/auth"
import { assertMoney, newId, withoutUndefined } from "@/lib/utils/validation"
import { BookingStatus } from "@/lib/types/booking"
import { ServiceStatus } from "@/lib/types/service"
import { JobSourceType, JobStatus } from "@/lib/types/job"
import type { Place } from "@/lib/types/common"

export interface BookingInput {
  serviceId: string
  message: string
  requestedDateText: string
  /** Where the work should happen; falls back to the service's own place. */
  place?: Partial<Place>
  /** The customer's counter-offer. Absent means "price on request". */
  priceInCent?: number
}

/**
 * Creates a booking from a live service.
 *
 * Every snapshot field is copied from the service document inside the
 * transaction rather than trusted from the client, so a customer cannot book a
 * service at a price or provider of their choosing.
 */
export async function createBooking(input: BookingInput) {
  const user = await requireAppUser("customer")
  if (input.priceInCent !== undefined) assertMoney(input.priceInCent)
  if (!input.message.trim()) throw new Error("Bitte beschreibe kurz, was du brauchst.")

  return runTransaction(db, async (transaction) => {
    const service = (await transaction.get(doc(db, "services", input.serviceId))).data()
    if (!service || service.status !== ServiceStatus.active) {
      throw new Error("Dieser Service ist nicht mehr verfügbar.")
    }
    if (service.providerId === user.uid) throw new Error("Eigene Services kann man nicht buchen.")

    const id = newId()
    transaction.set(
      doc(db, "bookings", id),
      withoutUndefined({
        serviceId: input.serviceId,
        serviceTitle: service.title,
        customerId: user.uid,
        customerName: user.displayName,
        customerContact: contactOf(user),
        providerId: service.providerId,
        providerName: service.providerName,
        categoryId: service.categoryId,
        categoryName: service.categoryName,
        pricing: service.pricing,
        priceInCent: input.priceInCent,
        message: input.message.trim(),
        requestedDateText: input.requestedDateText.trim(),
        place: {
          geo: input.place?.geo ?? service.place.geo,
          address: input.place?.address?.trim() || service.place.address,
          city: input.place?.city?.trim() || service.place.city,
        },
        status: BookingStatus.requested,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    )
    return id
  })
}

/**
 * Accepting a booking is the hinge of flow A: the provider confirms the final
 * price, and the job is created and linked back to the booking in one
 * transaction. A job without an agreed price cannot exist.
 */
export async function respondToBooking(
  bookingId: string,
  decision: BookingStatus.accepted | BookingStatus.declined,
  { priceInCent, message = "" }: { priceInCent?: number; message?: string } = {},
) {
  const user = await requireAppUser("provider")

  return runTransaction(db, async (transaction) => {
    const ref = doc(db, "bookings", bookingId)
    const booking = (await transaction.get(ref)).data()
    if (!booking || booking.providerId !== user.uid) throw new Error("Buchung nicht gefunden.")
    if (booking.status !== BookingStatus.requested) throw new Error("Die Buchung wurde bereits beantwortet.")

    if (decision === BookingStatus.declined) {
      transaction.update(ref, {
        status: BookingStatus.declined,
        declineMessage: message.trim(),
        declinedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return null
    }

    if (priceInCent === undefined || priceInCent <= 0) throw new Error("Bitte den vereinbarten Preis angeben.")
    assertMoney(priceInCent)

    const jobId = newId()
    transaction.set(
      doc(db, "jobs", jobId),
      withoutUndefined({
        sourceType: JobSourceType.booking,
        sourceId: bookingId,
        customerId: booking.customerId,
        customerName: booking.customerName,
        customerContact: booking.customerContact,
        providerId: booking.providerId,
        providerName: booking.providerName,
        providerContact: contactOf(user),
        title: booking.serviceTitle,
        description: booking.message,
        categoryId: booking.categoryId,
        categoryName: booking.categoryName,
        pricing: booking.pricing,
        priceInCent,
        place: booking.place,
        scheduledAt: Timestamp.now(),
        dateText: booking.requestedDateText || undefined,
        status: JobStatus.scheduled,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    )

    transaction.update(ref, {
      status: BookingStatus.accepted,
      priceInCent,
      jobId,
      acceptedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return jobId
  })
}

export async function cancelBooking(bookingId: string) {
  const user = await requireAppUser("customer")

  await runTransaction(db, async (transaction) => {
    const ref = doc(db, "bookings", bookingId)
    const booking = (await transaction.get(ref)).data()
    if (!booking || booking.customerId !== user.uid) throw new Error("Buchung nicht gefunden.")
    if (booking.status !== BookingStatus.requested) throw new Error("Nur offene Anfragen können zurückgezogen werden.")
    transaction.update(ref, {
      status: BookingStatus.cancelled,
      cancelledAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  })
}
