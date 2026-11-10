import { collection, getDocs, orderBy, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"
import { decodeDocument } from "@/lib/firebase/documents"
import type { Category } from "@/lib/types/category"

let cached: Promise<Category[]> | undefined

/**
 * The whole taxonomy in a single query, asked once per visit.
 *
 * Subcategories are embedded in the category document, so this is one round
 * trip instead of one per category. Every form and filter shares the same
 * promise; a failed attempt is forgotten so the next page can try again.
 */
export function getCategories(): Promise<Category[]> {
  return (cached ??= load().catch((error) => {
    cached = undefined
    throw error
  }))
}

async function load(): Promise<Category[]> {
  const snapshot = await getDocs(
    query(collection(db, "categories"), where("isActive", "==", true), orderBy("order")),
  )

  return snapshot.docs.map((doc) => {
    const category = decodeDocument<Category>(doc)
    return { ...category, subcategories: category.subcategories ?? [] }
  })
}
