"use client"

import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"
import type { Category } from "@/lib/types/category"

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCategories() {
      try {
        const snapshot = await getDocs(collection(db, "categories"))

        const data: Category[] = snapshot.docs.map((doc) => {
          const raw = doc.data() as Partial<Category> & { categoryId?: string }

          return {
            id: raw.id ?? raw.categoryId ?? doc.id,
            firestoreId: doc.id,
            name: raw.name ?? doc.id,
            subcategories: raw.subcategories ?? [],
          }
        })

        setCategories(data)
      } catch (err) {
        console.error(err)
        setError("Kategorien konnten nicht geladen werden")
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  return { categories, loading, error }
}
