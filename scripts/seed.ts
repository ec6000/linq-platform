import type { Firestore, WriteBatch } from "firebase-admin/firestore"
import { describeTarget, getAdminDb } from "./lib/admin"
import { clearDatabase } from "./lib/reset"
import { assertDatasetIsCoherent, buildDataset, type Dataset } from "./data/catalog"
import { DEMO_PASSWORD, createDemoAccounts } from "./lib/authAccounts"
import { CUSTOMERS, PROVIDERS } from "./data/people"

/**
 * Wipes the database and writes one coherent demo dataset.
 *
 *   pnpm db:seed                                   (against the emulator)
 *   pnpm db:seed --confirm-project my-project-id   (against a real project)
 *   pnpm db:seed --keep                            (skip the wipe)
 *   pnpm db:seed --no-auth                         (data only, no login accounts)
 *
 * The dataset is assembled and checked in memory first, so either the whole
 * graph lands or nothing does.
 *
 * Unless --no-auth is passed, each persona also gets a Firebase Auth account
 * whose UID equals its user document ID. Without that the seeded data is
 * invisible from inside the app: every personal list filters by the signed-in
 * UID, so a real account would only ever see the public search.
 */

const BATCH_LIMIT = 450 // Firestore allows 500 writes per batch; leave headroom.

/** Commits writes in chunks, so a dataset larger than one batch still works. */
class BatchWriter {
  private batch: WriteBatch
  private pending = 0
  private committed = 0

  constructor(private readonly db: Firestore) {
    this.batch = db.batch()
  }

  set(path: [string, ...string[]], data: Record<string, unknown>) {
    const [collection, ...rest] = path
    let ref = this.db.collection(collection).doc(rest[0])
    for (let index = 1; index < rest.length; index += 2) {
      ref = ref.collection(rest[index]).doc(rest[index + 1])
    }
    this.batch.set(ref, data)
    this.pending += 1
    return this.pending >= BATCH_LIMIT ? this.flush() : Promise.resolve()
  }

  async flush() {
    if (this.pending === 0) return
    await this.batch.commit()
    this.committed += this.pending
    this.pending = 0
    this.batch = this.db.batch()
  }

  get total() {
    return this.committed + this.pending
  }
}

async function writeDataset(db: Firestore, dataset: Dataset) {
  const writer = new BatchWriter(db)

  for (const category of dataset.categories) await writer.set(["categories", category.id], category.data)
  for (const user of dataset.users) await writer.set(["users", user.id], user.data)
  for (const service of dataset.services) await writer.set(["services", service.id], service.data)
  for (const order of dataset.orders) await writer.set(["orders", order.id], order.data)
  for (const offer of dataset.offers) {
    await writer.set(["orders", offer.orderId, "offers", offer.providerId], offer.data)
  }
  for (const booking of dataset.bookings) await writer.set(["bookings", booking.id], booking.data)
  for (const job of dataset.jobs) await writer.set(["jobs", job.id], job.data)

  await writer.flush()
  return writer.total
}

function summarise(dataset: Dataset) {
  const byStatus = (documents: Array<{ data: Record<string, unknown> }>) => {
    const counts = new Map<string, number>()
    for (const document of documents) {
      const status = String(document.data.status ?? "–")
      counts.set(status, (counts.get(status) ?? 0) + 1)
    }
    return [...counts.entries()].map(([status, count]) => `${status} ${count}`).join(", ")
  }

  const subcategories = dataset.categories.reduce(
    (total, category) => total + (category.data.subcategories as unknown[]).length,
    0,
  )

  return [
    `  categories   ${dataset.categories.length} (${subcategories} Unterkategorien)`,
    `  users        ${dataset.users.length}`,
    `  services     ${dataset.services.length} · ${byStatus(dataset.services)}`,
    `  orders       ${dataset.orders.length} · ${byStatus(dataset.orders)}`,
    `  offers       ${dataset.offers.length} · ${byStatus(dataset.offers.map((offer) => ({ data: offer.data })))}`,
    `  bookings     ${dataset.bookings.length} · ${byStatus(dataset.bookings)}`,
    `  jobs         ${dataset.jobs.length} · ${byStatus(dataset.jobs)}`,
  ].join("\n")
}

/** The persona with the fullest dashboard, so the first look is not an empty page. */
function busiestPersona(dataset: Dataset, people: typeof PROVIDERS) {
  const owned = (id: string) =>
    [dataset.services, dataset.orders, dataset.bookings, dataset.jobs]
      .flat()
      .filter((entry) => entry.data.providerId === id || entry.data.customerId === id).length +
    dataset.offers.filter((offer) => offer.providerId === id).length

  return [...people].sort((a, b) => owned(b.id) - owned(a.id))[0]
}

function loginHint(dataset: Dataset) {
  return [
    "Zum Anschauen anmelden als:",
    `  Dienstleister   ${busiestPersona(dataset, PROVIDERS).email}`,
    `  Kunde           ${busiestPersona(dataset, CUSTOMERS).email}`,
    `  Passwort        ${DEMO_PASSWORD}`,
    "",
    "Alle Demo-Konten teilen dieses Passwort, die übrigen Adressen stehen in",
    "scripts/data/people.ts.",
    "",
    "Wenn stattdessen dein eigenes Konto die Daten besitzen soll:",
    "  pnpm db:claim --email <deine-adresse>",
  ].join("\n")
}

async function main() {
  const db = getAdminDb()
  const keepExisting = process.argv.includes("--keep")
  const withAuth = !process.argv.includes("--no-auth")

  console.log(`\nDatenbank befüllen · ${describeTarget()}\n`)

  const dataset = buildDataset()
  assertDatasetIsCoherent(dataset)
  console.log("Datensatz geprüft:\n" + summarise(dataset) + "\n")

  if (keepExisting) {
    console.log("Bestehende Daten bleiben erhalten (--keep).\n")
  } else {
    console.log("Bestehende Daten entfernen:")
    await clearDatabase(db)
    console.log("")
  }

  const written = await writeDataset(db, dataset)
  console.log(`${written} Dokument(e) geschrieben.\n`)

  if (!withAuth) {
    console.log("Login-Konten übersprungen (--no-auth).")
    console.log("Ohne sie erscheinen die Daten nur in der Suche, nicht in den eigenen Listen.\n")
    return
  }

  console.log("Login-Konten für die Demo-Personen:")
  const accounts = await createDemoAccounts()
  console.log("")

  if (accounts.created + accounts.updated > 0) console.log(loginHint(dataset) + "\n")
}

main().catch((error) => {
  console.error("\nFehler beim Befüllen:\n", error instanceof Error ? error.message : error, "\n")
  process.exit(1)
})
