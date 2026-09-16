import { strict as assert } from "node:assert"
import { test } from "node:test"
import { assertDatasetIsCoherent, buildDataset } from "../scripts/data/catalog"
import { TAXONOMY, slugify, subcategoryOf } from "../scripts/data/taxonomy"
import { PEOPLE } from "../scripts/data/people"
import { DISTRICTS } from "../scripts/data/places"

test("the seed dataset is internally consistent", () => {
  assertDatasetIsCoherent(buildDataset())
})

test("the seed dataset covers every state the interface can render", () => {
  const dataset = buildDataset()
  const statuses = (documents: Array<{ data: Record<string, unknown> }>) =>
    new Set(documents.map((entry) => String(entry.data.status)))

  assert.deepEqual(statuses(dataset.services), new Set(["active", "paused"]))
  assert.deepEqual(statuses(dataset.orders), new Set(["open", "assigned", "completed", "cancelled"]))
  assert.deepEqual(statuses(dataset.offers.map((offer) => ({ data: offer.data }))), new Set(["pending", "accepted", "declined"]))
  assert.deepEqual(statuses(dataset.bookings), new Set(["requested", "accepted", "declined", "cancelled"]))
  assert.deepEqual(statuses(dataset.jobs), new Set(["scheduled", "inProgress", "completed", "cancelled"]))
})

test("both flows produce jobs, so neither path is left untested", () => {
  const dataset = buildDataset()
  const sources = dataset.jobs.map((job) => job.data.sourceType)
  assert.ok(sources.includes("order"), "kein Job aus einem Auftrag")
  assert.ok(sources.includes("booking"), "kein Job aus einer Buchung")
})

test("document IDs are unique within every collection", () => {
  const dataset = buildDataset()
  for (const [name, documents] of Object.entries(dataset)) {
    if (name === "offers") continue
    const ids = (documents as Array<{ id: string }>).map((entry) => entry.id)
    assert.equal(new Set(ids).size, ids.length, `${name} enthält doppelte IDs`)
  }
  const offerKeys = dataset.offers.map((offer) => `${offer.orderId}/${offer.providerId}`)
  assert.equal(new Set(offerKeys).size, offerKeys.length, "ein Anbieter hat zweimal auf denselben Auftrag geboten")
})

test("seed people and districts are unique and well formed", () => {
  const ids = PEOPLE.map((person) => person.id)
  assert.equal(new Set(ids).size, ids.length)
  for (const person of PEOPLE) assert.match(person.id, /^seed-[pc]-[a-z]+$/)

  const keys = DISTRICTS.map((district) => district.key)
  assert.equal(new Set(keys).size, keys.length)
  for (const district of DISTRICTS) {
    assert.ok(district.lat > 50.8 && district.lat < 51.1, `${district.key} liegt nicht in Köln`)
    assert.ok(district.lon > 6.7 && district.lon < 7.2, `${district.key} liegt nicht in Köln`)
    assert.ok(district.streets.length > 0)
  }
})

test("subcategory slugs are unique per category and survive German characters", () => {
  assert.equal(slugify("Möbel tragen"), "moebel-tragen")
  assert.equal(slugify("Auto & Fahrzeugpflege"), "auto-und-fahrzeugpflege")
  assert.equal(slugify("Wäsche bügeln"), "waesche-buegeln")

  for (const category of TAXONOMY) {
    const slugs = category.subcategories.map((entry) => slugify(entry.nameDE))
    assert.equal(new Set(slugs).size, slugs.length, `${category.id} hat doppelte Unterkategorie-Slugs`)
    for (const slug of slugs) assert.match(slug, /^[a-z0-9]+(-[a-z0-9]+)*$/)
  }
})

test("looking up an unknown subcategory fails loudly instead of writing a dangling reference", () => {
  assert.deepEqual(subcategoryOf("moving", "Umzugshilfe"), { id: "umzugshilfe", name: "Umzugshilfe" })
  assert.throws(() => subcategoryOf("moving", "Gibt es nicht"))
  assert.throws(() => subcategoryOf("nope", "Umzugshilfe"))
})
