"use client"

import { addDoc, collection, serverTimestamp, GeoPoint } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"
import { PricingType, ServiceStatus } from "@/lib/types/service"

export interface CreateServiceInput {
  providerId: string
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
}

export async function createService(input: CreateServiceInput) {
  await addDoc(collection(db, "services"), {
    ...input,
    location: new GeoPoint(0, 0),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}
