import { strict as assert } from "node:assert"
import { test } from "node:test"
import {
  assertMoney,
  isValidDocumentId,
  newId,
  parseDocumentId,
  parseEuroInCent,
  withoutUndefined,
} from "../lib/utils/validation"
import { haversineDistanceInKm } from "../lib/utils/geo"
import { canChangeJobStatus, getNextJobStatus, isTerminalJobStatus } from "../lib/utils/jobStatus"
import { JobStatus } from "../lib/types/job"
import { PricingType } from "../lib/types/common"
import { formatPrice, formatPriceRange, pricingSuffix } from "../lib/utils/format"

test("Euro input preserves cents and accepts German decimals", () => {
  assert.equal(parseEuroInCent("12,34"), 1234)
  assert.equal(parseEuroInCent(" 0.29 "), 29)
  assert.equal(parseEuroInCent("10"), 1000)
  assert.equal(parseEuroInCent("0"), 0)
})

test("malformed and unsafe amounts cannot reach Firestore", () => {
  for (const input of ["", "-1", "12abc", "Infinity", "NaN", "1e3", "1,234", "1.234,56", "9007199254740992"]) {
    assert.throws(() => parseEuroInCent(input), input)
  }
  for (const value of [NaN, Infinity, -1, 0.5, Number.MAX_SAFE_INTEGER, 100_000_001]) {
    assert.throws(() => assertMoney(value))
  }
  assert.doesNotThrow(() => assertMoney(100_000_000))
})

test("route parameters cannot become Firestore path traversals", () => {
  assert.equal(parseDocumentId("k7m2p9x4qd8n"), "k7m2p9x4qd8n")
  assert.equal(parseDocumentId("seed-p-lehmann"), "seed-p-lehmann")
  for (const value of ["", ".", "..", "a/b", "__proto__", undefined]) {
    assert.equal(parseDocumentId(value as string | undefined), null, String(value))
  }
  assert.equal(isValidDocumentId(42), false)
})

test("generated IDs are URL safe, unique and free of ambiguous characters", () => {
  const ids = Array.from({ length: 2000 }, () => newId())
  assert.equal(new Set(ids).size, ids.length, "collision in 2000 generated IDs")
  for (const id of ids.slice(0, 50)) {
    assert.equal(id.length, 12)
    assert.match(id, /^[0-9abcdefghjkmnpqrstvwxyz]+$/)
    assert.ok(isValidDocumentId(id))
  }
})

test("optional Firestore fields are omitted without losing false, zero or timestamps", () => {
  const date = new Date()
  assert.deepEqual(withoutUndefined({ absent: undefined, zero: 0, no: false, date }), { zero: 0, no: false, date })
})

test("a job moves forward one step at a time and never backwards", () => {
  assert.equal(getNextJobStatus(JobStatus.scheduled), JobStatus.inProgress)
  assert.equal(getNextJobStatus(JobStatus.inProgress), JobStatus.completed)
  assert.equal(getNextJobStatus(JobStatus.completed), null)
  assert.equal(getNextJobStatus(JobStatus.cancelled), null)

  assert.equal(canChangeJobStatus(JobStatus.scheduled, JobStatus.inProgress), true)
  assert.equal(canChangeJobStatus(JobStatus.scheduled, JobStatus.completed), false)
  assert.equal(canChangeJobStatus(JobStatus.inProgress, JobStatus.scheduled), false)
  assert.equal(canChangeJobStatus(JobStatus.scheduled, JobStatus.scheduled), false)
})

test("completed and cancelled jobs are terminal, repeated or backwards writes fail", () => {
  for (const terminal of [JobStatus.completed, JobStatus.cancelled]) {
    assert.equal(isTerminalJobStatus(terminal), true)
    for (const next of Object.values(JobStatus)) assert.equal(canChangeJobStatus(terminal, next), false)
  }
  assert.equal(canChangeJobStatus(JobStatus.scheduled, JobStatus.cancelled), true)
  assert.equal(canChangeJobStatus(JobStatus.inProgress, JobStatus.cancelled), true)
})

test("prices render with the suffix their pricing type implies", () => {
  assert.equal(formatPrice(4000, { type: PricingType.fixed }), "40,00 €")
  assert.equal(formatPrice(4000, { type: PricingType.hourly }), "40,00 € / Std.")
  assert.equal(formatPrice(600, { type: PricingType.unit, unitLabel: "Fenster" }), "6,00 € / Fenster")
  assert.equal(pricingSuffix({ type: PricingType.unit }), " / Einheit")

  assert.equal(formatPriceRange(3500, 4500, { type: PricingType.hourly }), "35–45 € / Std.")
  assert.equal(formatPriceRange(4000, 4000, { type: PricingType.fixed }), "40 €")
})

test("distance calculation is symmetric and handles identical and antipodal points", () => {
  const cologne = { lat: 50.9375, lon: 6.9603 }
  const berlin = { lat: 52.52, lon: 13.405 }
  const distance = haversineDistanceInKm(cologne, berlin)
  assert.ok(distance > 470 && distance < 490)
  assert.equal(distance, haversineDistanceInKm(berlin, cologne))
  assert.equal(haversineDistanceInKm(cologne, cologne), 0)
  assert.ok(Number.isFinite(haversineDistanceInKm(cologne, { lat: -cologne.lat, lon: cologne.lon - 180 })))
})
