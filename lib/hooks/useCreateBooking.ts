"use client"

import { doc, GeoPoint, serverTimestamp, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"
import { getNextNumericId } from "@/lib/firebase/counters"
import { BookingStatus } from "@/lib/types/booking"
import type { PricingType } from "@/lib/types/service"

export interface CreateBookingInput {
  serviceId: number
  providerId: number
  customerId: number
  serviceTitle: string
  categoryId: string
  pricingType: PricingType
  priceInCent?: number
  unitName?: string
  message?: string
  requestedDateText?: string
  addressText?: string
  city?: string
}

export async function createBooking(input: CreateBookingInput) {
  const id = await getNextNumericId("bookings")

  await setDoc(doc(db, "bookings", String(id)), {
    id,
    serviceId: input.serviceId,
    providerId: input.providerId,
    customerId: input.customerId,
    serviceTitle: input.serviceTitle,
    categoryId: input.categoryId,
    pricingType: input.pricingType,
    priceInCent: input.priceInCent ?? null,
    unitName: input.unitName ?? null,
    message: input.message?.trim() || null,
    requestedDateText: input.requestedDateText?.trim() || null,
    addressText: input.addressText?.trim() || input.city || null,
    location: new GeoPoint(0, 0),
    status: BookingStatus.requested,
    requestedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return id
}
