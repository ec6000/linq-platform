// scripts/seedJobs.ts
import { initializeApp, cert } from "firebase-admin/app"
import { getFirestore, Timestamp, GeoPoint } from "firebase-admin/firestore"
import { readFileSync } from "fs"

// Service Account laden – Pfad anpassen
const serviceAccount = JSON.parse(
  readFileSync("./serviceAccountKey.json", "utf-8")
)

initializeApp({
  credential: cert(serviceAccount),
})

const db = getFirestore()

// ────────────────────────────────────────────────────────────
// Hilfsfunktionen
// ────────────────────────────────────────────────────────────
const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min

const daysFromNow = (days: number, hours = 0): Timestamp => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(date.getHours() + hours)
  return Timestamp.fromDate(date)
}

const daysAgo = (days: number, hours = 0): Timestamp => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(date.getHours() - hours)
  return Timestamp.fromDate(date)
}

// ────────────────────────────────────────────────────────────
// Job-Definitionen: handverlesen, jeder Job individuell
// ────────────────────────────────────────────────────────────
type JobStatusSeed = "pending" | "inProgress" | "completed" | "cancelled"
type JobSourceTypeSeed = "order" | "service"
type PricingTypeSeed = "Gesamt" | "/ Stunde" | "pro Einheit"

interface JobSeed {
  // Herkunft
  sourceType: JobSourceTypeSeed

  // Snapshot
  title: string
  description: string
  categoryId: string
  pricingType: PricingTypeSeed
  priceInCent?: number
  minBudgetInCent?: number
  maxBudgetInCent?: number

  // Ort & Zeit
  location: { lat: number; lng: number; address: string }
  scheduledInDays: number // negativ = Vergangenheit
  scheduledDateText: string

  // Status
  status: JobStatusSeed
  createdDaysAgo: number

  // Bewertung (optional, nur bei completed)
  customerRating?: number
  providerRating?: number
}

const jobs: JobSeed[] = [
  // ── Aktive Jobs (pending) ─────────────────────────────────
  {
    sourceType: "service",
    title: "IKEA PAX Kleiderschrank aufbauen (3m)",
    description:
      "PAX mit 3 Elementen, Schiebetüren, komplette Innenausstattung. Ca. 3 Stunden eingeplant.",
    categoryId: "handyman",
    pricingType: "/ Stunde",
    minBudgetInCent: 3000,
    maxBudgetInCent: 4000,
    location: { lat: 50.9576, lng: 6.9741, address: "Köln Nippes" },
    scheduledInDays: 3,
    scheduledDateText: "Donnerstag, 14:00 Uhr",
    status: "pending",
    createdDaysAgo: 2,
  },
  {
    sourceType: "order",
    title: "Wohnungsreinigung nach Auszug (75qm)",
    description:
      "Endreinigung vor Übergabe. Inkl. Fenster, Küche entfetten, Bad, Böden. Material wird gestellt.",
    categoryId: "cleaning",
    pricingType: "Gesamt",
    priceInCent: 22000,
    location: { lat: 50.9189, lng: 6.9581, address: "Köln Bayenthal" },
    scheduledInDays: 2,
    scheduledDateText: "Mittwoch, 09:00 Uhr",
    status: "pending",
    createdDaysAgo: 1,
  },
  {
    sourceType: "service",
    title: "Mathe-Nachhilfe Klasse 10",
    description:
      "Quadratische Funktionen, Vorbereitung auf Klassenarbeit. 2-3 Sitzungen à 90 Min.",
    categoryId: "other",
    pricingType: "/ Stunde",
    minBudgetInCent: 2500,
    maxBudgetInCent: 3500,
    location: { lat: 50.9375, lng: 6.9603, address: "Köln Innenstadt" },
    scheduledInDays: 1,
    scheduledDateText: "Morgen, 16:00 Uhr",
    status: "pending",
    createdDaysAgo: 2,
  },

  // ── Laufende Jobs (inProgress) ────────────────────────────
  {
    sourceType: "order",
    title: "Umzug 2-Zimmer-Wohnung",
    description:
      "Umzug von Sülz nach Ehrenfeld. 3. OG ohne Aufzug, 2 Helfer, Transporter dabei.",
    categoryId: "moving",
    pricingType: "Gesamt",
    priceInCent: 18000,
    location: { lat: 50.9272, lng: 6.9336, address: "Köln Sülz" },
    scheduledInDays: 0,
    scheduledDateText: "Heute, 09:00 Uhr",
    status: "inProgress",
    createdDaysAgo: 4,
  },
  {
    sourceType: "service",
    title: "Hunde-Sitting (Wochenende)",
    description:
      "Golden Retriever, 4 Jahre. 2x täglich Gassi, Füttern, Übernachtung beim Sitter.",
    categoryId: "household",
    pricingType: "Gesamt",
    priceInCent: 15000,
    location: { lat: 50.9413, lng: 6.9583, address: "Köln Altstadt-Nord" },
    scheduledInDays: 0,
    scheduledDateText: "Fr-So, läuft",
    status: "inProgress",
    createdDaysAgo: 6,
  },
  {
    sourceType: "service",
    title: "Pflanzen gießen während Urlaub",
    description:
      "Ca. 20 Zimmerpflanzen + Balkonkästen. 2-3 Besuche pro Woche, Briefkasten leeren.",
    categoryId: "gardening",
    pricingType: "Gesamt",
    priceInCent: 6000,
    location: { lat: 50.9189, lng: 6.9581, address: "Köln Bayenthal" },
    scheduledInDays: 0,
    scheduledDateText: "15.–29., laufend",
    status: "inProgress",
    createdDaysAgo: 9,
  },

  // ── Abgeschlossene Jobs (completed) ───────────────────────
  {
    sourceType: "order",
    title: "Hecke schneiden und Rasen mähen",
    description:
      "Reihenhausgarten, Hecke 15m, Rasen 60qm. Häcksler und Mäher vorhanden.",
    categoryId: "gardening",
    pricingType: "Gesamt",
    priceInCent: 8000,
    location: { lat: 50.9089, lng: 6.8756, address: "Köln Rodenkirchen" },
    scheduledInDays: -3,
    scheduledDateText: "Vor 3 Tagen",
    status: "completed",
    createdDaysAgo: 7,
    customerRating: 5,
    providerRating: 5,
  },
  {
    sourceType: "service",
    title: "Fensterreinigung Einfamilienhaus",
    description:
      "14 Fenster innen und außen, Rahmen mit. Streifenfrei, mit Profi-Equipment.",
    categoryId: "cleaning",
    pricingType: "pro Einheit",
    priceInCent: 800,
    location: { lat: 50.9667, lng: 7.0167, address: "Köln Mülheim" },
    scheduledInDays: -7,
    scheduledDateText: "Vor 1 Woche",
    status: "completed",
    createdDaysAgo: 10,
    customerRating: 5,
    providerRating: 4,
  },
  {
    sourceType: "order",
    title: "Auto-Innenraum Tiefenreinigung",
    description:
      "BMW 3er, 4 Jahre alt. Saugen, Polster shampoonieren, Armaturen pflegen.",
    categoryId: "automotive",
    pricingType: "Gesamt",
    priceInCent: 11000,
    location: { lat: 50.9511, lng: 7.0089, address: "Köln Deutz" },
    scheduledInDays: -5,
    scheduledDateText: "Vor 5 Tagen",
    status: "completed",
    createdDaysAgo: 12,
    customerRating: 4,
    providerRating: 5,
  },
  {
    sourceType: "service",
    title: "Smartphone-Einrichtung für Senior",
    description:
      "Samsung-Einrichtung: WhatsApp, Fotos, Kontakte. Geduldig erklärt.",
    categoryId: "other",
    pricingType: "/ Stunde",
    minBudgetInCent: 2500,
    maxBudgetInCent: 3000,
    location: { lat: 50.9667, lng: 7.0167, address: "Köln Mülheim" },
    scheduledInDays: -10,
    scheduledDateText: "Vor 10 Tagen",
    status: "completed",
    createdDaysAgo: 14,
    customerRating: 5,
    // providerRating bewusst weggelassen – noch nicht bewertet
  },
  {
    sourceType: "order",
    title: "Silikonfugen Bad erneuern",
    description: "Dusche und Wanne, ca. 6m gesamt. Material vom Kunden.",
    categoryId: "handyman",
    pricingType: "Gesamt",
    priceInCent: 7500,
    location: { lat: 50.9576, lng: 6.9741, address: "Köln Nippes" },
    scheduledInDays: -14,
    scheduledDateText: "Vor 2 Wochen",
    status: "completed",
    createdDaysAgo: 18,
    customerRating: 4,
    providerRating: 5,
  },
  {
    sourceType: "service",
    title: "Wocheneinkauf für Senior",
    description:
      "Wöchentlicher Einkauf nach Liste, inkl. Lieferung in die Wohnung.",
    categoryId: "household",
    pricingType: "Gesamt",
    priceInCent: 3500,
    location: { lat: 50.9375, lng: 6.9603, address: "Köln Innenstadt" },
    scheduledInDays: -2,
    scheduledDateText: "Vor 2 Tagen",
    status: "completed",
    createdDaysAgo: 16,
    customerRating: 5,
    providerRating: 5,
  },

  // ── Abgebrochene Jobs (cancelled) ─────────────────────────
  {
    sourceType: "order",
    title: "Waschmaschine in 4. Stock tragen",
    description:
      "Lieferung nur bis Haustür, Treppenhaus eng, kein Aufzug. Anschluss vorhanden.",
    categoryId: "moving",
    pricingType: "Gesamt",
    priceInCent: 10000,
    location: { lat: 50.9089, lng: 6.8756, address: "Köln Rodenkirchen" },
    scheduledInDays: -1,
    scheduledDateText: "War für gestern geplant",
    status: "cancelled",
    createdDaysAgo: 5,
  },
  {
    sourceType: "service",
    title: "Wohnzimmer und Flur streichen",
    description:
      "Ca. 45qm Wandfläche, weiß auf weiß. Decke nicht. Material vom Kunden.",
    categoryId: "handyman",
    pricingType: "pro Einheit",
    priceInCent: 1200,
    location: { lat: 50.9413, lng: 6.9583, address: "Köln Altstadt-Nord" },
    scheduledInDays: -4,
    scheduledDateText: "War für letzte Woche",
    status: "cancelled",
    createdDaysAgo: 11,
  },
  {
    sourceType: "order",
    title: "Keller entrümpeln",
    description:
      "15qm Kellerraum, Sortieren und Wertstoffhof. Anhänger vorhanden.",
    categoryId: "moving",
    pricingType: "Gesamt",
    priceInCent: 20000,
    location: { lat: 50.9272, lng: 6.9336, address: "Köln Sülz" },
    scheduledInDays: -6,
    scheduledDateText: "War für vor 6 Tagen",
    status: "cancelled",
    createdDaysAgo: 13,
  },
]

// ────────────────────────────────────────────────────────────
// Seeding
// ────────────────────────────────────────────────────────────
async function seedJobs() {
  console.log(`🌱 Seede ${jobs.length} Test-Jobs...\n`)

  const batch = db.batch()
  const jobsRef = db.collection("jobs")

  for (const [i, j] of jobs.entries()) {
    const docRef = jobsRef.doc()
    const createdAt = daysAgo(j.createdDaysAgo)
    const updatedAt = Timestamp.now()
    const scheduledAt =
      j.scheduledInDays >= 0
        ? daysFromNow(j.scheduledInDays)
        : daysAgo(Math.abs(j.scheduledInDays))

    const jobDoc: Record<string, unknown> = {
      // Herkunft
      sourceType: j.sourceType,
      sourceId:
        j.sourceType === "order"
          ? `test-order-${randomInt(1, 15)}`
          : `test-service-${randomInt(1, 15)}`,

      // Beteiligte
      customerId: `test-customer-${randomInt(1, 8)}`,
      providerId: `test-provider-${randomInt(1, 5)}`,

      // Snapshot
      title: j.title,
      description: j.description,
      categoryId: j.categoryId,
      pricingType: j.pricingType,

      // Ort & Zeit
      location: new GeoPoint(j.location.lat, j.location.lng),
      addressText: j.location.address,
      scheduledAt,
      scheduledDateText: j.scheduledDateText,

      // Status
      status: j.status,

      // Meta
      createdAt,
      updatedAt,
    }

    // Pricing: entweder Festpreis oder Range
    if (j.priceInCent !== undefined) {
      jobDoc.priceInCent = j.priceInCent
    }
    if (j.minBudgetInCent !== undefined) {
      jobDoc.minBudgetInCent = j.minBudgetInCent
    }
    if (j.maxBudgetInCent !== undefined) {
      jobDoc.maxBudgetInCent = j.maxBudgetInCent
    }

    // Source-spezifische Felder
    if (j.sourceType === "order") {
      jobDoc.offerId = `test-offer-${randomInt(1000, 9999)}`
    } else {
      jobDoc.bookingId = `test-booking-${randomInt(1000, 9999)}`
    }

    // Status-spezifische Zeitstempel
    if (j.status === "inProgress") {
      jobDoc.startedAt = daysAgo(randomInt(0, 1))
    } else if (j.status === "completed") {
      // gestartet vor scheduledAt, abgeschlossen kurz danach
      jobDoc.startedAt = daysAgo(Math.abs(j.scheduledInDays))
      jobDoc.completedAt = daysAgo(Math.max(0, Math.abs(j.scheduledInDays) - 1))
    } else if (j.status === "cancelled") {
      jobDoc.cancelledAt = daysAgo(Math.max(0, Math.abs(j.scheduledInDays) - 1))
    }

    // Bewertungen (nur bei completed)
    if (j.customerRating !== undefined) {
      jobDoc.customerRating = j.customerRating
    }
    if (j.providerRating !== undefined) {
      jobDoc.providerRating = j.providerRating
    }

    batch.set(docRef, jobDoc)

    const priceLabel =
      j.priceInCent !== undefined
        ? `${(j.priceInCent / 100).toFixed(0)}€ ${j.pricingType}`
        : j.minBudgetInCent !== undefined && j.maxBudgetInCent !== undefined
          ? `${(j.minBudgetInCent / 100).toFixed(0)}–${(j.maxBudgetInCent / 100).toFixed(0)}€ ${j.pricingType}`
          : "—"

    const ratingLabel =
      j.customerRating || j.providerRating
        ? ` · ⭐ ${j.customerRating ?? "–"}/${j.providerRating ?? "–"}`
        : ""

    console.log(
      `  ${String(i + 1).padStart(2, " ")}. ${j.title}` +
        `\n      [${j.sourceType}/${j.categoryId}] · ${j.location.address} · ${priceLabel} · ${j.status}${ratingLabel}`
    )
  }

  await batch.commit()
  console.log(`\n✅ Fertig! ${jobs.length} Jobs in Firestore geschrieben.`)
  process.exit(0)
}

seedJobs().catch((err) => {
  console.error("❌ Fehler beim Seeden:", err)
  process.exit(1)
})