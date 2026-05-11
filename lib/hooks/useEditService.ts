"use client"

import { doc, serverTimestamp, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"
import { PricingType, ServiceStatus } from "@/lib/types/service"

export interface EditServiceInput {
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

export async function editService(serviceId: number, input: EditServiceInput) {
  await updateDoc(doc(db, "services", String(serviceId)), {
    ...input,
    updatedAt: serverTimestamp(),
  })
}
