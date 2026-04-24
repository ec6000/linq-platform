import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"
import type { Category } from "../types/category"

export async function getCategories(): Promise<Category[]> {
  const preferredSnapshot = await getDocs(collection(db, "Categories"))
  const fallbackSnapshot =
    preferredSnapshot.empty
      ? await getDocs(collection(db, "categories"))
      : preferredSnapshot

  return fallbackSnapshot.docs
    .filter((doc) => {
      const raw = doc.data() as { isActive?: boolean }
      return raw.isActive !== false
    })
    .map((doc) => {
      const raw = doc.data() as { id?: string; categoryId?: string; nameDE?: string; name?: string }
      return {
        id: raw.id ?? raw.categoryId ?? doc.id,
        firestoreId: doc.id,
        nameDE: raw.nameDE ?? raw.name ?? doc.id,
        subcategories: [],
      }
    })
}
