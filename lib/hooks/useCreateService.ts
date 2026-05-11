"use client"

import { doc, serverTimestamp, setDoc, GeoPoint } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"
import { getNextNumericId } from "@/lib/firebase/counters"
import { PricingType, ServiceStatus } from "@/lib/types/service"

export interface CreateServiceInput {
  providerId: number
  providerName: string
  title: string
  description: string
  imageUrl?: string
  status: ServiceStatus
  pricingType: PricingType
  minBudgetInCent: number
  maxBudgetInCent: number
  unitName?: string
  radius: number
  city?: string
  categoryId: string
  categoryName?: string
  subcategoryId?: string
  subcategoryName?: string
}

export async function createService(input: CreateServiceInput) {
  const id = await getNextNumericId("services")

  await setDoc(doc(db, "services", String(id)), {
    id,
    ...input,
    location: new GeoPoint(0, 0),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return id
}
