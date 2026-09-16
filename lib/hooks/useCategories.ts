"use client"

import { useEffect, useState } from "react"
import type { Category } from "@/lib/types/category"
import { getCategories } from "@/lib/data/categories"

/** The taxonomy is static, so one fetch per mount is enough — no live listener. */
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    getCategories().then(
      (data) => {
        if (!active) return
        setCategories(data)
        setLoading(false)
      },
      (err) => {
        if (!active) return
        console.error(err)
        setError("Kategorien konnten nicht geladen werden.")
        setLoading(false)
      },
    )
    return () => {
      active = false
    }
  }, [])

  return { categories, loading, error }
}
