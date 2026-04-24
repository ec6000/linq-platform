"use client"

import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"
import type { Category, Subcategory } from "@/lib/types/category"

type CategoryDoc = {
  id?: string
  categoryId?: string
  nameDE?: string
  name?: string
}

type SubcategoryDoc = {
  id?: string
  subcategoryId?: string
  categoryId?: string
  nameDE?: string
  name?: string
}

async function loadSubcategories(categoryId: string, collectionName: "categories" | "Categories"): Promise<Subcategory[]> {
  const subcategoriesSnapshot = await getDocs(
    collection(db, collectionName, categoryId, "subcategories")
  )

  return subcategoriesSnapshot.docs.map((subcategoryDoc) => {
    const rawSubcategory = subcategoryDoc.data() as SubcategoryDoc

    return {
      id: rawSubcategory.id ?? rawSubcategory.subcategoryId ?? subcategoryDoc.id,
      categoryId: rawSubcategory.categoryId ?? categoryId,
      nameDE: rawSubcategory.nameDE ?? rawSubcategory.name ?? subcategoryDoc.id,
    }
  })
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCategories() {
      try {
        const preferredSnapshot = await getDocs(collection(db, "Categories"))
        const fallbackSnapshot =
          preferredSnapshot.empty
            ? await getDocs(collection(db, "categories"))
            : preferredSnapshot

        const collectionName: "categories" | "Categories" =
          preferredSnapshot.empty ? "categories" : "Categories"

        const categoryDocs = fallbackSnapshot.docs.filter((doc) => {
          const rawCategory = doc.data() as { isActive?: boolean }
          return rawCategory.isActive !== false
        })

        const data = await Promise.all(
          categoryDocs.map(async (doc) => {
            const rawCategory = doc.data() as CategoryDoc
            const categoryId = rawCategory.id ?? rawCategory.categoryId ?? doc.id

            return {
              id: categoryId,
              firestoreId: doc.id,
              nameDE: rawCategory.nameDE ?? rawCategory.name ?? doc.id,
              subcategories: await loadSubcategories(categoryId, collectionName),
            }
          })
        )

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
