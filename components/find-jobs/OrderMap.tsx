"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { ChevronRight, X } from "lucide-react"
import type { Order } from "@/lib/types/order"
import { formatEuro, formatTimeRange } from "@/lib/utils/format"

/** An order enriched with everything the search computed about it. */
export type RankedOrder = Order & {
  distanceKm: number | null
  matchScore: number
}

// Google Maps needs resolved colors rather than CSS var() expressions.
function getMapColors() {
  const styles = getComputedStyle(document.documentElement)
  return {
    primary: styles.getPropertyValue("--primary").trim() || "#1e3a5f",
    accent: styles.getPropertyValue("--accent").trim() || "#38bdf8",
  }
}

// Map style: the city drops back to a quiet base map so the pins carry the colour.
const MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#f4f6f9" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a94a6" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#dfe4ec" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "labels", stylers: [{ visibility: "simplified" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#eef1f6" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#e2e7f0" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#dcecf7" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9dbdd4" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e6eee4" }, { visibility: "on" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
]

interface MapViewProps {
  orders: RankedOrder[]
  selectedOrder: RankedOrder | null
  onOrderSelect: (order: RankedOrder | null) => void
}

export function MapView({ orders, selectedOrder, onOrderSelect }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map())

  // Initialise the map once.
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 50.9333, lng: 6.95 }, // Köln
      zoom: 12,
      styles: MAP_STYLE,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
    })

    mapInstanceRef.current = map
    const markers = markersRef.current
    return () => {
      markers.forEach((marker) => {
        google.maps.event.clearInstanceListeners(marker)
        marker.setMap(null)
      })
      markers.clear()
      google.maps.event.clearInstanceListeners(map)
      mapInstanceRef.current = null
    }
  }, [])

  // Keep markers in sync with the filtered orders.
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return
    const colors = getMapColors()
    const currentIds = new Set(orders.map((order) => order.id))

    markersRef.current.forEach((marker, id) => {
      if (currentIds.has(id)) return
      google.maps.event.clearInstanceListeners(marker)
      marker.setMap(null)
      markersRef.current.delete(id)
    })

    for (const order of orders) {
      const position = { lat: order.place.geo.latitude, lng: order.place.geo.longitude }
      const isSelected = selectedOrder?.id === order.id

      const icon: google.maps.Symbol = {
        path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
        fillColor: isSelected ? colors.accent : colors.primary,
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: isSelected ? 2.5 : 1.5,
        scale: isSelected ? 1.8 : 1.4,
        anchor: new google.maps.Point(12, 22),
      }

      const existing = markersRef.current.get(order.id)
      if (existing) {
        existing.setPosition(position)
        existing.setTitle(order.title)
        existing.setIcon(icon)
        existing.setZIndex(isSelected ? 10 : 1)
        google.maps.event.clearInstanceListeners(existing)
        existing.addListener("click", () => {
          onOrderSelect(order)
          map.panTo(position)
        })
        continue
      }

      const marker = new google.maps.Marker({
        position,
        map,
        icon,
        title: order.title,
        zIndex: isSelected ? 10 : 1,
        animation: google.maps.Animation.DROP,
      })
      marker.addListener("click", () => {
        onOrderSelect(order)
        map.panTo(position)
      })
      markersRef.current.set(order.id, marker)
    }
  }, [orders, selectedOrder, onOrderSelect])

  // Centre on the selected order.
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !selectedOrder) return
    map.panTo({ lat: selectedOrder.place.geo.latitude, lng: selectedOrder.place.geo.longitude })
  }, [selectedOrder])

  return <div ref={mapRef} className="h-full w-full" />
}

export function DetailPanel({ order, onClose }: { order: RankedOrder; onClose: () => void }) {
  const facts = [
    { label: "Zeitfenster", value: formatTimeRange(order.timeWindow.start, order.timeWindow.end) },
    { label: "Adresse", value: order.place.address },
    { label: "Unterkategorie", value: order.subcategoryName },
    {
      label: "Entfernung",
      value: order.distanceKm === null ? null : `${order.distanceKm.toFixed(1)} km`,
    },
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact.value))

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <div className="border-b border-secondary px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <span className="pill pill-primary">{order.categoryName}</span>
          <button
            type="button"
            onClick={onClose}
            className="icon-btn -mr-1.5 -mt-1"
            aria-label="Panel schließen"
          >
            <X size={16} strokeWidth={1.9} aria-hidden />
          </button>
        </div>

        <h2 className="mt-3.5 text-[17px] font-semibold leading-snug text-text">{order.title}</h2>
        <p className="mt-1 text-[13px] text-text/50">{order.customerName}</p>

        <p className="num mt-4 text-[24px] font-semibold text-text">
          {formatEuro(order.budgetInCent, { decimals: false })} €
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <dl className="mb-6 flex flex-col">
          {facts.map((fact) => (
            <div
              key={fact.label}
              className="border-t border-secondary py-3 first:border-t-0 first:pt-0"
            >
              <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text/40">
                {fact.label}
              </dt>
              <dd className="mt-1 text-[14px] text-text/75">{fact.value}</dd>
            </div>
          ))}
        </dl>

        <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-text/40">
          Beschreibung
        </h3>
        <p className="text-[14px] leading-relaxed text-text/75">{order.description}</p>
      </div>

      <div className="border-t border-secondary p-4">
        <Link href={`/find-jobs/${order.id}`} className="btn btn-primary btn-block">
          Auftrag ansehen
          <ChevronRight size={16} strokeWidth={2.2} aria-hidden />
        </Link>
      </div>
    </div>
  )
}
