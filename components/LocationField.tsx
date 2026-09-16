"use client"

import { useEffect, useId, useState } from "react"
import { MapPin } from "lucide-react"
import type { Coordinates } from "@/lib/utils/geo"

type Suggestion = Coordinates & { label: string }

export default function LocationField({ value, onChange, onSelect }: {
  value: string
  onChange: (value: string) => void
  onSelect: (value: Suggestion) => void
}) {
  const id = useId()
  const [focused, setFocused] = useState(false)
  const [state, setState] = useState<{ query: string; results: Suggestion[]; error: string | null } | null>(null)

  useEffect(() => {
    if (!focused || value.trim().length < 2) return
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/geoapify/autocomplete?text=${encodeURIComponent(value.trim())}`, { signal: controller.signal })
        if (!response.ok) throw new Error("Ortsvorschläge konnten nicht geladen werden.")
        const data = await response.json() as { results: Suggestion[] }
        if (!controller.signal.aborted) setState({ query: value, results: data.results, error: null })
      } catch {
        if (!controller.signal.aborted) setState({ query: value, results: [], error: "Ortsvorschläge konnten nicht geladen werden." })
      }
    }, 300)
    return () => { clearTimeout(timer); controller.abort() }
  }, [value, focused])

  const current = state?.query === value ? state : null
  const open = focused && value.trim().length >= 2

  return (
    <div className="relative">
      <label htmlFor={id} className="field-label">Ort / Adresse in Köln</label>

      <div className="field-group field-h">
        <MapPin size={15} strokeWidth={1.8} className="flex-none text-text/30" aria-hidden />
        <input
          id={id}
          required
          autoComplete="off"
          value={value}
          onFocus={() => setFocused(true)}
          onChange={(event) => { setFocused(true); onChange(event.target.value) }}
          placeholder="z. B. Ehrenfeld, Köln"
        />
      </div>

      {open && (
        <div className="sheet absolute left-0 right-0 z-30 mt-2 overflow-hidden p-1">
          {!current && <p className="px-3 py-2.5 text-[13px] text-text/50">Ortsvorschläge werden geladen…</p>}
          {current?.error && <p role="alert" className="px-3 py-2.5 text-[13px] text-error">{current.error}</p>}
          {current && !current.error && current.results.length === 0 && (
            <p className="px-3 py-2.5 text-[13px] text-text/50">Keine passenden Orte gefunden.</p>
          )}
          {current?.results.map((suggestion) => (
            <button
              type="button"
              key={`${suggestion.lat}-${suggestion.lon}-${suggestion.label}`}
              onClick={() => { onSelect(suggestion); setFocused(false) }}
              className="block w-full rounded-sm px-3 py-2.5 text-left text-[13.5px] text-text transition-colors hover:bg-muted"
            >
              {suggestion.label}
            </button>
          ))}
        </div>
      )}

      <p className="field-hint mt-2">Bitte einen Vorschlag auswählen, damit der Standort korrekt gespeichert wird.</p>
    </div>
  )
}
