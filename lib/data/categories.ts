import { collection, getDocs, orderBy, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"
import { decodeDocument } from "@/lib/firebase/documents"
import type { Category } from "@/lib/types/category"

/**
 * The whole taxonomy in a single query.
 *
 * Subcategories are embedded in the category document, so this is one round
 * trip instead of one per category.
 */
export async function getCategories(): Promise<Category[]> {
  const snapshot = await getDocs(
    query(collection(db, "categories"), where("isActive", "==", true), orderBy("order")),
  )

  return snapshot.docs.map((doc) => {
    const category = decodeDocument<Category>(doc)
    return { ...category, subcategories: category.subcategories ?? [] }
  })
}
