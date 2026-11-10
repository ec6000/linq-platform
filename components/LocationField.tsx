"use client"

import { useId, useState } from "react"
import { MapPin } from "lucide-react"
import { useLocationSuggestions, type LocationSuggestion } from "@/lib/hooks/useLocationSuggestions"

/**
 * One address input for the whole app: forms, search and the job board.
 * Typing clears the selection; only a picked suggestion carries coordinates.
 */
export default function LocationField({
  value,
  selected,
  onChange,
  onSelect,
  label = "Adresse in Köln",
  placeholder = "z. B. Venloer Str. 12",
  hint,
  required,
}: {
  value: string
  /** The picked suggestion, if any. While it matches the text, no lookup runs. */
  selected: LocationSuggestion | null
  onChange: (value: string) => void
  onSelect: (value: LocationSuggestion) => void
  /** Visible label for forms; search bars pass `null` and keep it for screen readers. */
  label?: string | null
  placeholder?: string
  hint?: string
  required?: boolean
}) {
  const id = useId()
  const [focused, setFocused] = useState(false)
  const { suggestions, loading, error } = useLocationSuggestions(value, selected)
  const open = focused && value.trim().length >= 2 && selected?.label !== value.trim()

  return (
    <div className="relative">
      <label htmlFor={id} className={label ? "field-label" : "sr-only"}>
        {label ?? "Ort"}
      </label>

      <div className="field-group field-h">
        <MapPin size={15} strokeWidth={1.8} className="flex-none text-text/30" aria-hidden />
        <input
          id={id}
          required={required}
          autoComplete="off"
          value={value}
          onFocus={() => setFocused(true)}
          // Delay so a click on a suggestion lands before the list disappears.
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      </div>

      {open && (
        <div className="sheet absolute left-0 right-0 z-30 mt-2 overflow-hidden p-1">
          {loading && <p className="px-3 py-2.5 text-[13px] text-text/50">Suche…</p>}
          {error && <p role="alert" className="px-3 py-2.5 text-[13px] text-error">{error}</p>}
          {!loading && !error && suggestions.length === 0 && (
            <p className="px-3 py-2.5 text-[13px] text-text/50">Keine passenden Orte in Köln.</p>
          )}
          {suggestions.map((suggestion) => (
            <button
              type="button"
              key={`${suggestion.lat}-${suggestion.lon}-${suggestion.label}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onSelect(suggestion)
                setFocused(false)
              }}
              className="block w-full rounded-sm px-3 py-2.5 text-left text-[13.5px] text-text transition-colors hover:bg-muted"
            >
              {suggestion.label}
            </button>
          ))}
        </div>
      )}

      {hint && <p className="field-hint mt-2">{hint}</p>}
    </div>
  )
}
