"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import { LayoutGrid, Map as MapIcon, MapPin, Search, Tag, X } from "lucide-react"
import { haversineDistanceInKm } from "@/lib/utils/geo"
import { useOpenOrders } from "@/lib/hooks/useOrders"
import { useLocationSuggestions } from "@/lib/hooks/useLocationSuggestions"
import { useCategories } from "@/lib/hooks/useCategories"
import { useGoogleMaps } from "@/lib/hooks/useGoogleMaps"
import { DetailPanel, MapView, type RankedOrder } from "@/components/find-jobs/OrderMap"
import OrderCard from "@/components/find-jobs/OrderCard"
import { formatEuro, formatDate } from "@/lib/utils/format"

type LocationSuggestion = { lat: number; lon: number; label: string }

const RADIUS_OPTIONS = [5, 10, 15, 20, 30]
const ORDERS_PER_PAGE = 10

/**
 * Scores how well an order fits the current filters, 0–100.
 * Text and category matches weigh most; proximity breaks the tie.
 */
function scoreOrder(order: RankedOrder, hasQuery: boolean, titleHit: boolean, hasCategory: boolean) {
  const text = hasQuery ? (titleHit ? 40 : 25) : 30
  const category = hasCategory ? 30 : 25
  const proximity =
    order.distanceKm === null ? 20 : Math.max(0, Math.round(25 - order.distanceKm))
  const freshness = order.offerCount === 0 ? 15 : Math.max(0, 15 - order.offerCount * 3)
  return Math.min(100, text + category + proximity + freshness)
}

export default function FindOrders() {
  const { orders, loading, error } = useOpenOrders()
  const { categories } = useCategories()

  const [query, setQuery] = useState("")
  const [locationQuery, setLocationQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null)
  const {
    suggestions: locationSuggestions,
    loading: locationLoading,
    error: locationError,
  } = useLocationSuggestions(locationQuery, selectedLocation)
  const [radiusKm, setRadiusKm] = useState(10)
  const [categoryId, setCategoryId] = useState("")
  const [subcategoryId, setSubcategoryId] = useState("")

  const [selectedOrder, setSelectedOrder] = useState<RankedOrder | null>(null)
  const [viewMode, setViewMode] = useState<"map" | "list">("map")
  const { ready: mapsReady, error: mapsError } = useGoogleMaps(viewMode === "map")
  const [page, setPage] = useState(1)
  const listRef = useRef<HTMLDivElement>(null)

  const category = useMemo(
    () => categories.find((entry) => entry.id === categoryId),
    [categories, categoryId],
  )
  const subcategories = category?.subcategories ?? []
  const locationActive = Boolean(selectedLocation)

  const filtered = useMemo<RankedOrder[]>(() => {
    const search = query.trim().toLowerCase()

    return orders
      .map((order) => ({
        ...order,
        distanceKm: selectedLocation
          ? haversineDistanceInKm(selectedLocation, {
              lat: order.place.geo.latitude,
              lon: order.place.geo.longitude,
            })
          : null,
        matchScore: 0,
      }))
      .filter((order) => {
        if (categoryId && order.categoryId !== categoryId) return false
        if (subcategoryId && order.subcategoryId !== subcategoryId) return false
        if (selectedLocation && (order.distanceKm ?? Infinity) > radiusKm) return false
        if (!search) return true
        return (
          order.title.toLowerCase().includes(search) ||
          order.customerName.toLowerCase().includes(search) ||
          order.description.toLowerCase().includes(search)
        )
      })
      .map((order) => ({
        ...order,
        matchScore: scoreOrder(
          order,
          Boolean(search),
          Boolean(search) && order.title.toLowerCase().includes(search),
          Boolean(categoryId),
        ),
      }))
      .sort((a, b) => b.matchScore - a.matchScore)
  }, [categoryId, orders, query, radiusKm, selectedLocation, subcategoryId])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ORDERS_PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * ORDERS_PER_PAGE, currentPage * ORDERS_PER_PAGE),
    [currentPage, filtered],
  )

  const visibleSelectedOrder = filtered.find((order) => order.id === selectedOrder?.id) ?? null

  const locationHint = useMemo(() => {
    if (!locationQuery.trim()) return null
    if (!selectedLocation) return "Bitte einen Ort aus den Vorschlägen auswählen, damit der Radiusfilter greift."
    return `Radius wird zu "${selectedLocation.label}" berechnet.`
  }, [locationQuery, selectedLocation])

  function resetFilters() {
    setQuery("")
    setLocationQuery("")
    setSelectedLocation(null)
    setRadiusKm(10)
    setCategoryId("")
    setSubcategoryId("")
    setSelectedOrder(null)
    setPage(1)
  }

  const handleOrderSelect = useCallback((order: RankedOrder | null) => {
    setSelectedOrder(order)
    if (order && listRef.current) {
      listRef.current
        .querySelector(`[data-order-id="${order.id}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
  }, [])

  return (
    <main id="main" className="flex h-[calc(100dvh-var(--nav-h))] min-h-[600px] flex-col overflow-hidden">
      <div className="flex-none border-b border-secondary bg-background px-6 py-5 md:px-10">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <h1 className="page-title">Aufträge finden</h1>
            {!loading && <span className="pill pill-primary num">{filtered.length}</span>}
          </div>

          <div className="flex flex-none items-center gap-1 rounded-md border border-secondary p-1">
            {(
              [
                { key: "map" as const, label: "Karte", icon: MapIcon },
                { key: "list" as const, label: "Liste", icon: LayoutGrid },
              ]
            ).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setViewMode(key)}
                data-active={viewMode === key ? "true" : "false"}
                className="flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-[13px] font-medium text-text/55 transition-colors hover:text-text data-[active=true]:bg-primary data-[active=true]:text-white"
              >
                <Icon size={14} strokeWidth={1.9} aria-hidden />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto_auto]">
          <div className="field-group field-h">
            <Search size={15} strokeWidth={1.8} className="flex-none text-text/30" aria-hidden />
            <input
              type="text"
              placeholder="Titel, Beschreibung oder Kunde…"
              aria-label="Suche"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setPage(1)
              }}
            />
          </div>

          <div className="relative">
            <div className="field-group field-h">
              <MapPin size={15} strokeWidth={1.8} className="flex-none text-text/30" aria-hidden />
              <input
                type="text"
                placeholder="Ort oder Straße in Köln…"
                aria-label="Ort"
                value={locationQuery}
                onChange={(event) => {
                  setLocationQuery(event.target.value)
                  setSelectedLocation(null)
                }}
              />
            </div>
            {locationQuery.trim().length >= 2 && !selectedLocation && (
              <div className="sheet absolute left-0 right-0 z-30 mt-2 overflow-hidden p-1">
                {locationLoading && (
                  <p className="px-3 py-2.5 text-[13px] text-text/50">Vorschläge werden geladen…</p>
                )}
                {!locationLoading && locationSuggestions.length === 0 && !locationError && (
                  <p className="px-3 py-2.5 text-[13px] text-text/50">Keine Vorschläge gefunden.</p>
                )}
                {!locationLoading &&
                  locationSuggestions.map((suggestion) => (
                    <button
                      key={`${suggestion.label}-${suggestion.lat}-${suggestion.lon}`}
                      type="button"
                      onClick={() => {
                        setLocationQuery(suggestion.label)
                        setSelectedLocation(suggestion)
                        setPage(1)
                      }}
                      className="block w-full rounded-sm px-3 py-2.5 text-left text-[13.5px] text-text transition-colors hover:bg-muted"
                    >
                      {suggestion.label}
                    </button>
                  ))}
              </div>
            )}
          </div>

          <select
            aria-label="Radius"
            value={radiusKm}
            onChange={(event) => setRadiusKm(Number(event.target.value))}
            disabled={!locationActive}
            className="field field-h field-select"
          >
            {RADIUS_OPTIONS.map((radius) => (
              <option key={radius} value={radius}>
                {radius} km Radius
              </option>
            ))}
          </select>

          <button type="button" onClick={resetFilters} className="btn btn-outline">
            <X size={14} strokeWidth={2} aria-hidden />
            Zurücksetzen
          </button>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <Tag size={14} strokeWidth={1.8} className="text-text/30" aria-hidden />
          <select
            aria-label="Kategorie"
            value={categoryId}
            onChange={(event) => {
              setCategoryId(event.target.value)
              setSubcategoryId("")
              setPage(1)
            }}
            className="field field-select w-auto py-2 text-[13px]"
          >
            <option value="">Alle Kategorien</option>
            {categories.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.nameDE}
              </option>
            ))}
          </select>

          <select
            aria-label="Unterkategorie"
            value={subcategoryId}
            onChange={(event) => {
              setSubcategoryId(event.target.value)
              setPage(1)
            }}
            disabled={!category}
            className="field field-select w-auto py-2 text-[13px]"
          >
            <option value="">Alle Unterkategorien</option>
            {subcategories.map((entry) => (
              <option key={entry.slug} value={entry.slug}>
                {entry.nameDE}
              </option>
            ))}
          </select>
        </div>

        {(locationHint || locationError) && (
          <p className="mt-2.5 text-[12px] text-text/40">{locationError ?? locationHint}</p>
        )}
      </div>

      {loading && (
        <div className="flex flex-1 items-center justify-center">
          <span className="flex items-center gap-2.5 text-[13px] text-text/40">
            <span className="dot-live text-accent" aria-hidden />
            Aufträge werden geladen
          </span>
        </div>
      )}

      {error && (
        <div className="flex flex-1 items-center justify-center px-6">
          <p role="alert" className="notice notice-error">
            {error}
          </p>
        </div>
      )}

      {!loading && !error && viewMode === "list" && (
        <div className="flex-1 overflow-y-auto px-6 py-6 md:px-10">
          {filtered.length === 0 ? (
            <div className="empty">
              <p className="text-[15px] text-text/50">
                Keine Aufträge mit den gewählten Filtern gefunden.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4">
                {paginated.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    matchScore={order.matchScore}
                    distanceKm={order.distanceKm}
                  />
                ))}
              </div>

              {filtered.length > ORDERS_PER_PAGE && (
                <div className="mt-8 flex items-center justify-between gap-3 border-t border-secondary pt-6 text-[13.5px] text-text/60">
                  <p className="num">
                    Seite {currentPage} von {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="btn btn-outline btn-sm"
                    >
                      Zurück
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="btn btn-outline btn-sm"
                    >
                      Weiter
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {!loading && !error && viewMode === "map" && (
        <div className="relative flex min-h-0 flex-1 flex-col">
          <div className="relative" style={{ height: "58%" }}>
            {mapsReady ? (
              <MapView
                orders={filtered}
                selectedOrder={visibleSelectedOrder}
                onOrderSelect={handleOrderSelect}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted">
                <p className="text-[13px] text-text/40">{mapsError ?? "Karte wird geladen…"}</p>
              </div>
            )}

            <div className="num pointer-events-none absolute left-4 top-4 rounded-full border border-secondary bg-background/90 px-3.5 py-1.5 text-[12.5px] font-semibold text-primary shadow-sm backdrop-blur-md">
              {filtered.length} {filtered.length === 1 ? "Auftrag" : "Aufträge"}
            </div>
          </div>

          <div className="flex min-h-0 flex-1 border-t border-secondary">
            <div
              className={`flex-none overflow-hidden border-r border-secondary transition-all duration-300 ${
                visibleSelectedOrder ? "w-full sm:w-[340px]" : "w-0"
              }`}
            >
              {visibleSelectedOrder && (
                <DetailPanel order={visibleSelectedOrder} onClose={() => setSelectedOrder(null)} />
              )}
            </div>

            <div ref={listRef} className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-[13px] text-text/40">Keine Aufträge gefunden.</p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-secondary">
                  {filtered.map((order) => (
                    <button
                      key={order.id}
                      type="button"
                      data-order-id={order.id}
                      onClick={() => handleOrderSelect(selectedOrder?.id === order.id ? null : order)}
                      data-active={selectedOrder?.id === order.id ? "true" : "false"}
                      className="w-full border-l-2 border-l-transparent px-4 py-3.5 text-left transition-colors duration-150 hover:bg-muted data-[active=true]:border-l-accent data-[active=true]:bg-accent/6"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-medium leading-snug text-text">
                            {order.title}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-[11.5px] text-text/45">{order.categoryName}</span>
                            <span aria-hidden className="text-text/20">
                              ·
                            </span>
                            <span className="flex items-center gap-1 truncate text-[11.5px] text-text/45">
                              <MapPin size={10} strokeWidth={1.8} aria-hidden />
                              {order.place.city}
                            </span>
                          </div>
                        </div>
                        <div className="flex-none text-right">
                          <p className="num text-[13.5px] font-semibold text-primary">
                            {formatEuro(order.budgetInCent, { decimals: false })} €
                          </p>
                          <p className="mt-0.5 text-[11.5px] text-text/40">
                            {formatDate(order.timeWindow.start)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
