"use client"

import { useEffect, useState } from "react"
import type { Coordinates } from "@/lib/utils/geo"

export type LocationSuggestion = Coordinates & { label: string }
const EMPTY: LocationSuggestion[] = []

export function useLocationSuggestions(query: string, selected: LocationSuggestion | null) {
  const text = query.trim()
  const enabled = text.length >= 2 && selected?.label !== text
  const [state, setState] = useState<{ text: string; suggestions: LocationSuggestion[]; error: string | null } | null>(null)
  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(`/api/geoapify/autocomplete?text=${encodeURIComponent(text)}&limit=5`, { signal: controller.signal })
        if (!response.ok) throw new Error("Autocomplete failed")
        const data = await response.json() as { results?: LocationSuggestion[] }
        if (!controller.signal.aborted) setState({ text, suggestions: data.results ?? EMPTY, error: null })
      } catch {
        if (!controller.signal.aborted) setState({ text, suggestions: EMPTY, error: "Ortsvorschläge konnten nicht geladen werden." })
      }
    }, 300)
    return () => { clearTimeout(timeout); controller.abort() }
  }, [enabled, text])
  const current = enabled && state?.text === text ? state : null
  return { suggestions: current?.suggestions ?? EMPTY, loading: enabled && !current, error: current?.error ?? null }
}
