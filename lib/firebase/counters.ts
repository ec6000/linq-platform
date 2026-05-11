"use client"

import { doc, runTransaction } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"

export async function getNextNumericId(collectionName: string) {
  const counterRef = doc(db, collectionName, "counter")

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(counterRef)
    const currentCount = snapshot.exists() ? Number(snapshot.data().count ?? 0) : 0
    const nextId = currentCount + 1

    transaction.set(counterRef, { count: nextId }, { merge: true })

    return nextId
  })
}
