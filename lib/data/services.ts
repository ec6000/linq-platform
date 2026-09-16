"use client"

import { doc, runTransaction, serverTimestamp, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"
import { requireAppUser } from "@/lib/firebase/currentUser"
import { assertMoney, newId, withoutUndefined } from "@/lib/utils/validation"
import { ServiceStatus } from "@/lib/types/service"
import type { Place, Pricing } from "@/lib/types/common"

export interface ServiceInput {
  title: string
  description: string
  imageUrl?: string
  status: ServiceStatus
  pricing: Pricing
  minPriceInCent: number
  maxPriceInCent: number
  place: Place
  radiusKm: number
  categoryId: string
  categoryName: string
  subcategoryId?: string
  subcategoryName?: string
}

export function validateService(input: ServiceInput) {
  assertMoney(input.minPriceInCent)
  assertMoney(input.maxPriceInCent)
  if (!input.title.trim() || !input.description.trim()) throw new Error("Titel und Beschreibung fehlen.")
  if (input.maxPriceInCent < input.minPriceInCent) throw new Error("Der Höchstpreis darf nicht unter dem Mindestpreis liegen.")
  if (!Number.isFinite(input.radiusKm) || input.radiusKm <= 0) throw new Error("Ungültiger Radius.")
  if (!input.categoryId) throw new Error("Bitte eine Kategorie auswählen.")
  if (!input.place?.geo || (input.place.geo.latitude === 0 && input.place.geo.longitude === 0)) {
    throw new Error("Bitte einen gültigen Standort auswählen.")
  }
}

/**
 * The document ID is generated here, so creating a service is a single write
 * with no counter to contend on and no transaction to serialise providers
 * against each other.
 */
export async function createService(input: ServiceInput) {
  const user = await requireAppUser("provider")
  validateService(input)

  const id = newId()
  await setDoc(
    doc(db, "services", id),
    withoutUndefined({
      ...input,
      providerId: user.uid,
      providerName: user.displayName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  )
  return id
}

export async function updateService(serviceId: string, input: ServiceInput) {
  const user = await requireAppUser("provider")
  validateService(input)

  await runTransaction(db, async (transaction) => {
    const ref = doc(db, "services", serviceId)
    const snapshot = await transaction.get(ref)
    const service = snapshot.data()
    if (!service || service.providerId !== user.uid || service.status === ServiceStatus.archived) {
      throw new Error("Service nicht gefunden.")
    }
    transaction.update(ref, { ...withoutUndefined(input), updatedAt: serverTimestamp() })
  })
}

export async function setServiceStatus(serviceId: string, status: ServiceStatus) {
  const user = await requireAppUser("provider")

  await runTransaction(db, async (transaction) => {
    const ref = doc(db, "services", serviceId)
    const snapshot = await transaction.get(ref)
    const service = snapshot.data()
    if (!service || service.providerId !== user.uid || service.status === ServiceStatus.archived) {
      throw new Error("Service ist nicht mehr verfügbar.")
    }
    transaction.update(ref, {
      status,
      updatedAt: serverTimestamp(),
      ...(status === ServiceStatus.archived ? { archivedAt: serverTimestamp() } : {}),
    })
  })
}
