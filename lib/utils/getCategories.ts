import { db } from "@/lib/firebase/firebase"
import { collection, getDocs } from "firebase/firestore"
import { Category } from "../types/category"

export async function getCategories(): Promise<Category[]> {
  const snapshot = await getDocs(collection(db, "categories"))

  return snapshot.docs.map(doc => ({
    id: doc.id,
    name: doc.data().name,
  }))
}