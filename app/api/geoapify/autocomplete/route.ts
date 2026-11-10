import { NextRequest, NextResponse } from "next/server"

/**
 * Address suggestions for Cologne, proxied so the Geoapify key stays on the server.
 *
 * The endpoint is public, so three cheap guards keep it from becoming someone
 * else's free geocoder: browsers must call it from this site, each client gets
 * a small budget per minute, and identical queries are answered from the CDN.
 */

type GeoapifyProperties = {
  formatted?: string
  lat?: number
  lon?: number
  city?: string
  county?: string
  suburb?: string
  district?: string
}

const COLOGNE_CENTER = { lat: 50.9375, lon: 6.9603 }
const COLOGNE_FILTER_RADIUS_METERS = 30000
const LIMIT = 5

const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 40
const hits = new Map<string, { count: number; resetAt: number }>()

/** Per-instance and therefore approximate, which is all it has to be. */
function rateLimited(client: string, now = Date.now()) {
  const entry = hits.get(client)
  if (!entry || entry.resetAt <= now) {
    if (hits.size > 5000) hits.clear()
    hits.set(client, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }
  entry.count += 1
  return entry.count > MAX_PER_WINDOW
}

function inCologne(properties: GeoapifyProperties) {
  const place = `${properties.city ?? ""} ${properties.county ?? ""}`.toLowerCase()
  return place.includes("köln") || place.includes("koeln")
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.GEOAPIFY_API_KEY
  if (!apiKey) return NextResponse.json({ error: "Ortssuche ist nicht konfiguriert." }, { status: 500 })

  // Browsers always send this header; another site's page cannot fake it.
  const site = request.headers.get("sec-fetch-site")
  if (site && site !== "same-origin") return NextResponse.json({ error: "Nicht erlaubt." }, { status: 403 })

  const client = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local"
  if (rateLimited(client)) return NextResponse.json({ error: "Zu viele Anfragen." }, { status: 429 })

  const text = request.nextUrl.searchParams.get("text")?.trim()
  if (!text || text.length < 2) return NextResponse.json({ results: [] })
  if (text.length > 200) return NextResponse.json({ error: "Suchtext ist zu lang." }, { status: 400 })

  const url = new URL("https://api.geoapify.com/v1/geocode/autocomplete")
  url.searchParams.set("text", text)
  url.searchParams.set("limit", String(LIMIT))
  url.searchParams.set("lang", "de")
  url.searchParams.set("bias", `proximity:${COLOGNE_CENTER.lon},${COLOGNE_CENTER.lat}`)
  url.searchParams.set(
    "filter",
    `countrycode:de|circle:${COLOGNE_CENTER.lon},${COLOGNE_CENTER.lat},${COLOGNE_FILTER_RADIUS_METERS}`,
  )
  url.searchParams.set("apiKey", apiKey)

  try {
    const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) })
    if (!response.ok) return NextResponse.json({ error: "Ortsvorschläge sind gerade nicht verfügbar." }, { status: 502 })

    const data = (await response.json()) as { features?: Array<{ properties?: GeoapifyProperties }> }
    const results = (Array.isArray(data.features) ? data.features : []).flatMap(({ properties: p = {} }) => {
      const valid =
        typeof p.formatted === "string" && p.formatted &&
        typeof p.lat === "number" && Math.abs(p.lat) <= 90 &&
        typeof p.lon === "number" && Math.abs(p.lon) <= 180
      if (!valid || !inCologne(p)) return []
      const quarter = p.suburb ?? p.district
      const city = p.city ?? "Köln"
      return [{ label: p.formatted!, lat: p.lat!, lon: p.lon!, area: quarter ? `${city} ${quarter}` : city }]
    })

    // Addresses do not move: let the CDN answer the same query for a day.
    return NextResponse.json(
      { results },
      { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } },
    )
  } catch {
    return NextResponse.json({ error: "Ortsvorschläge sind gerade nicht verfügbar." }, { status: 502 })
  }
}
