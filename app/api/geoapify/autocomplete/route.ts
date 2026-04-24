import { NextRequest, NextResponse } from "next/server"

type GeoapifyFeature = {
  properties?: {
    formatted?: string
    lat?: number
    lon?: number
  }
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.GEOAPIFY_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: "GEOAPIFY_API_KEY is not configured." }, { status: 500 })
  }

  const text = request.nextUrl.searchParams.get("text")?.trim()
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "5")

  if (!text || text.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 10) : 5

  const url = new URL("https://api.geoapify.com/v1/geocode/autocomplete")
  url.searchParams.set("text", text)
  url.searchParams.set("limit", String(safeLimit))
  url.searchParams.set("lang", "de")
  url.searchParams.set("apiKey", apiKey)

  const response = await fetch(url.toString(), { cache: "no-store" })

  if (!response.ok) {
    return NextResponse.json({ error: "Geoapify autocomplete request failed." }, { status: 502 })
  }

  const data = (await response.json()) as { features?: GeoapifyFeature[] }

  const results = (data.features ?? [])
    .map((feature) => ({
      label: feature.properties?.formatted,
      lat: feature.properties?.lat,
      lon: feature.properties?.lon,
    }))
    .filter((item): item is { label: string; lat: number; lon: number } => {
      return Boolean(item.label) && typeof item.lat === "number" && typeof item.lon === "number"
    })

  return NextResponse.json({ results })
}
