"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { MapPin, Search } from "lucide-react"
import { haversineDistanceInKm } from "@/lib/utils/geo"
import { useCategories } from "@/lib/hooks/useCategories"
import { useActiveServices } from "@/lib/hooks/useServices"
import type { LocationSuggestion } from "@/lib/hooks/useLocationSuggestions"
import { formatDistance, formatPriceRange } from "@/lib/utils/format"
import LocationField from "@/components/LocationField"
import ListState from "@/components/ListState"
import ServiceImage from "@/components/ServiceImage"
import PageHeader from "@/components/layout/PageHeader"

type Sort = "newest" | "price" | "distance"

const normalize = (value: string) => value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")

/**
 * Three questions: what, where, which kind. "Where" does the clever part — a
 * service only shows up if the customer's address lies inside the radius its
 * provider is willing to travel, so there is no radius to pick.
 */
export default function ServiceSearchPage() {
  const { services, loading, error } = useActiveServices()
  const { categories } = useCategories()

  const [query, setQuery] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [placeText, setPlaceText] = useState("")
  const [place, setPlace] = useState<LocationSuggestion | null>(null)
  const [sort, setSort] = useState<Sort>("newest")

  const results = useMemo(() => {
    const search = normalize(query.trim())
    return services
      .map((service) => ({
        ...service,
        distanceKm: place
          ? haversineDistanceInKm(place, { lat: service.place.geo.latitude, lon: service.place.geo.longitude })
          : null,
      }))
      .filter((service) => {
        if (categoryId && service.categoryId !== categoryId) return false
        if (service.distanceKm !== null && service.distanceKm > service.radiusKm) return false
        if (!search) return true
        return normalize([service.title, service.description, service.providerName, service.subcategoryName].join(" ")).includes(search)
      })
      .sort((a, b) => {
        if (sort === "price") return a.minPriceInCent - b.minPriceInCent
        if (sort === "distance") return (a.distanceKm ?? 0) - (b.distanceKm ?? 0)
        return b.createdAt.toMillis() - a.createdAt.toMillis()
      })
  }, [categoryId, place, query, services, sort])

  const filtered = Boolean(query || categoryId || place)

  function reset() {
    setQuery("")
    setCategoryId("")
    setPlaceText("")
    setPlace(null)
    setSort("newest")
  }

  return (
    <main id="main" className="shell-wide py-10 md:py-12">
      <PageHeader title="Services in Köln" count={loading ? undefined : results.length} />

      <section className="mb-8 grid gap-2.5 md:grid-cols-[1.3fr_1.3fr_1fr_0.8fr]">
        <div className="field-group field-h">
          <Search size={15} strokeWidth={1.8} className="flex-none text-text/30" aria-hidden />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Was brauchst du?"
            aria-label="Suche"
          />
        </div>

        <LocationField
          label={null}
          placeholder="Deine Adresse"
          value={placeText}
          selected={place}
          onChange={(value) => {
            setPlaceText(value)
            setPlace(null)
            if (sort === "distance") setSort("newest")
          }}
          onSelect={(suggestion) => {
            setPlaceText(suggestion.label)
            setPlace(suggestion)
            setSort("distance")
          }}
        />

        <select
          aria-label="Kategorie"
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          className="field field-h field-select"
        >
          <option value="">Alle Kategorien</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.nameDE}
            </option>
          ))}
        </select>

        <select
          aria-label="Sortierung"
          value={sort}
          onChange={(event) => setSort(event.target.value as Sort)}
          className="field field-h field-select"
        >
          <option value="newest">Neueste</option>
          <option value="price">Günstigste</option>
          <option value="distance" disabled={!place}>
            Nächste
          </option>
        </select>
      </section>

      <ListState
        loading={loading}
        error={error}
        empty={results.length === 0}
        emptyText={place ? "Für diese Adresse fährt gerade niemand raus. Erstell einen Auftrag, dann kommen die Angebote zu dir." : "Nichts gefunden."}
      >
        <div className="flex justify-center gap-2">
          {filtered && (
            <button type="button" onClick={reset} className="btn btn-outline">
              Filter zurücksetzen
            </button>
          )}
          <Link href="/my-orders/create" className="btn btn-primary">
            Auftrag erstellen
          </Link>
        </div>
      </ListState>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {results.map((service) => (
          <Link
            key={service.id}
            href={`/find-services/${service.id}`}
            className="card card-interactive group flex flex-col overflow-hidden"
          >
            <ServiceImage
              src={service.imageUrl}
              sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="h-44"
            />

            <div className="flex flex-1 flex-col p-5">
              <p className="text-[12.5px] text-text/50">{service.subcategoryName ?? service.categoryName}</p>
              <h2 className="mt-1 line-clamp-2 text-[17px] font-semibold leading-snug text-text">{service.title}</h2>
              <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-text/55">{service.description}</p>

              <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                <p className="flex min-w-0 items-center gap-1.5 text-[12.5px] text-text/50">
                  <MapPin size={13} strokeWidth={1.8} className="flex-none text-text/35" aria-hidden />
                  <span className="truncate">
                    {service.providerName} · {service.distanceKm === null ? service.place.city : formatDistance(service.distanceKm)}
                  </span>
                </p>
                <p className="num flex-none text-[16px] font-semibold text-text">
                  {formatPriceRange(service.minPriceInCent, service.maxPriceInCent, service.pricing)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
