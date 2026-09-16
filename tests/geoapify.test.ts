import { strict as assert } from "node:assert"
import { afterEach, beforeEach, mock, test } from "node:test"
import { NextRequest } from "next/server"
import { GET } from "../app/api/geoapify/autocomplete/route"

const originalKey = process.env.GEOAPIFY_API_KEY
beforeEach(() => { process.env.GEOAPIFY_API_KEY = "test-key" })
afterEach(() => {
  mock.restoreAll()
  if (originalKey === undefined) delete process.env.GEOAPIFY_API_KEY
  else process.env.GEOAPIFY_API_KEY = originalKey
})
const request = (text: string, limit = "5") => new NextRequest(`http://localhost/api/geoapify/autocomplete?text=${encodeURIComponent(text)}&limit=${limit}`)

test("missing API configuration produces a controlled response", async () => {
  delete process.env.GEOAPIFY_API_KEY
  assert.equal((await GET(request("Köln"))).status, 500)
})

test("short and excessive queries never call the upstream service", async () => {
  const fetch = mock.method(globalThis, "fetch", async () => { throw new Error("Unexpected network request") })
  assert.deepEqual(await (await GET(request("k"))).json(), { results: [] })
  assert.equal((await GET(request("a".repeat(201)))).status, 400)
  assert.equal(fetch.mock.callCount(), 0)
})

test("limit is an integer, malformed coordinates and out-of-area results are removed", async () => {
  mock.method(globalThis, "fetch", async (url: string | URL | Request, options?: RequestInit) => {
    assert.equal(new URL(String(url)).searchParams.get("limit"), "3")
    assert.ok(options?.signal)
    return Response.json({ features: [
      { properties: { formatted: "Köln", lat: 50.9, lon: 6.9, city: "Köln" } },
      { properties: { formatted: "Berlin", lat: 52.5, lon: 13.4, city: "Berlin" } },
      { properties: { formatted: "Ungültig", lat: 150, lon: 6.9, city: "Köln" } },
      { properties: { formatted: "Fehlt", city: "Köln" } },
    ] })
  })
  const response = await GET(request("Köln", "3.9"))
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { results: [{ label: "Köln", lat: 50.9, lon: 6.9 }] })
})

test("network failures and timeouts return 502 without leaking upstream URLs or keys", async () => {
  mock.method(globalThis, "fetch", async () => { throw new Error("timeout test-key") })
  const response = await GET(request("Köln"))
  assert.equal(response.status, 502)
  assert.ok(!(await response.text()).includes("test-key"))
})

test("upstream HTTP errors and invalid JSON return 502", async () => {
  const fetch = mock.method(globalThis, "fetch", async () => new Response("rate limit", { status: 429 }))
  assert.equal((await GET(request("Köln"))).status, 502)
  fetch.mock.mockImplementation(async () => new Response("invalid json"))
  assert.equal((await GET(request("Köln"))).status, 502)
})
