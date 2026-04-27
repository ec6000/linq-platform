// scripts/seedBookings.ts
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
// Booking-Definitionen: handverlesen, jedes Booking individuell
// ────────────────────────────────────────────────────────────
type BookingStatusSeed = "requested" | "accepted" | "declined" | "cancelled"
type PricingTypeSeed = "Gesamt" | "/ Stunde" | "pro Einheit"

interface BookingSeed {
  // Service-Snapshot
  serviceTitle: string
  categoryId: string
  pricingType: PricingTypeSeed
  priceInCent?: number
  minBudgetInCent?: number
  maxBudgetInCent?: number

  // Anfrage
  message: string
  requestedDateText: string
  requestedInDays: number

  // Ort
  location: { lat: number; lng: number; address: string }

  // Status & Zeitlogik
  status: BookingStatusSeed
  createdDaysAgo: number
}

const bookings: BookingSeed[] = [
  {
    serviceTitle: "Umzugshilfe & Möbeltransport mit eigenem Transporter",
    categoryId: "moving",
    pricingType: "/ Stunde",
    minBudgetInCent: 3500,
    maxBudgetInCent: 4500,
    message:
      "Hi Markus, ich ziehe nächsten Samstag von Sülz nach Ehrenfeld. 2-Zimmer-Wohnung, 3. OG ohne Aufzug. Hättest du Zeit? Rechne mit ca. 4-5 Stunden.",
    requestedDateText: "Samstag, 09:00 Uhr",
    requestedInDays: 5,
    location: { lat: 50.9272, lng: 6.9336, address: "Köln Sülz" },
    status: "requested",
    createdDaysAgo: 1,
  },
  {
    serviceTitle: "IKEA & Möbelaufbau – schnell und sauber",
    categoryId: "handyman",
    pricingType: "/ Stunde",
    minBudgetInCent: 3000,
    maxBudgetInCent: 4000,
    message:
      "Hallo, habe einen 3m PAX bekommen. Schiebetüren, komplette Innenausstattung. Wann hättest du Zeit?",
    requestedDateText: "Diese Woche flexibel",
    requestedInDays: 3,
    location: { lat: 50.9576, lng: 6.9741, address: "Köln Nippes" },
    status: "accepted",
    createdDaysAgo: 4,
  },
  {
    serviceTitle: "Gründliche Wohnungsreinigung – auch Endreinigungen",
    categoryId: "cleaning",
    pricingType: "/ Stunde",
    minBudgetInCent: 2500,
    maxBudgetInCent: 3500,
    message:
      "Brauche eine Endreinigung für meine 75qm-Wohnung vor der Übergabe am Freitag. Inkl. Fenster, Küche, Bad. Wäre das in 2 Tagen möglich?",
    requestedDateText: "Donnerstag, ganztags",
    requestedInDays: 2,
    location: { lat: 50.9189, lng: 6.9581, address: "Köln Bayenthal" },
    status: "requested",
    createdDaysAgo: 0,
  },
  {
    serviceTitle: "Fensterreinigung – streifenfrei mit Profi-Equipment",
    categoryId: "cleaning",
    pricingType: "pro Einheit",
    priceInCent: 800,
    message:
      "Einfamilienhaus mit 14 Fenstern, davon 3 große Panoramafenster. Innen und außen, Rahmen mit. Geht das nächste Woche?",
    requestedDateText: "Nächste Woche, vormittags",
    requestedInDays: 8,
    location: { lat: 50.9667, lng: 7.0167, address: "Köln Mülheim" },
    status: "accepted",
    createdDaysAgo: 6,
  },
  {
    serviceTitle: "Garten- und Heckenpflege im Kölner Süden",
    categoryId: "gardening",
    pricingType: "/ Stunde",
    minBudgetInCent: 2500,
    maxBudgetInCent: 3500,
    message:
      "Kleiner Reihenhausgarten, Hecke ca. 15m und 1,80m hoch, Rasen 60qm. Grünschnitt entsorge ich selbst. Hast du Zeit am Wochenende?",
    requestedDateText: "Sonntag nachmittags",
    requestedInDays: 6,
    location: { lat: 50.9089, lng: 6.8756, address: "Köln Rodenkirchen" },
    status: "declined",
    createdDaysAgo: 3,
  },
  {
    serviceTitle: "Autoaufbereitung – innen & außen wie neu",
    categoryId: "automotive",
    pricingType: "Gesamt",
    minBudgetInCent: 8000,
    maxBudgetInCent: 18000,
    message:
      "BMW 3er, 4 Jahre alt. Komplette Aufbereitung innen und außen. Wann könntest du kommen?",
    requestedDateText: "Flexibel diese Woche",
    requestedInDays: 4,
    location: { lat: 50.9511, lng: 7.0089, address: "Köln Deutz" },
    status: "requested",
    createdDaysAgo: 2,
  },
  {
    serviceTitle: "Mathe-Nachhilfe Klasse 5–13 (Studentin TH Köln)",
    categoryId: "other",
    pricingType: "/ Stunde",
    minBudgetInCent: 2500,
    maxBudgetInCent: 3500,
    message:
      "Hallo Lea, mein Sohn (10. Klasse Gymnasium) hat Probleme mit quadratischen Funktionen, Klassenarbeit nächste Woche. 2-3 Sitzungen?",
    requestedDateText: "Ab morgen, nachmittags",
    requestedInDays: 1,
    location: { lat: 50.9375, lng: 6.9603, address: "Köln Innenstadt" },
    status: "accepted",
    createdDaysAgo: 2,
  },
  {
    serviceTitle: "Hunde-Sitting & Gassi-Service mit Herz",
    categoryId: "household",
    pricingType: "/ Stunde",
    minBudgetInCent: 1500,
    maxBudgetInCent: 2000,
    message:
      "Hi Sophie, suche jemanden für meinen Golden Retriever (4) von Fr-So. 2x täglich Gassi, füttern. Übernachtung möglich.",
    requestedDateText: "Fr-So nächste Woche",
    requestedInDays: 9,
    location: { lat: 50.9413, lng: 6.9583, address: "Köln Altstadt-Nord" },
    status: "requested",
    createdDaysAgo: 1,
  },
  {
    serviceTitle: "Kleinreparaturen, Bohren, Lampen, Regale",
    categoryId: "handyman",
    pricingType: "/ Stunde",
    minBudgetInCent: 3500,
    maxBudgetInCent: 4500,
    message:
      "Brauche Hilfe bei: 2 Lampen anschließen, TV an die Wand, 1 Wandregal. Sollte in ca. 2h machbar sein.",
    requestedDateText: "Samstag vormittag",
    requestedInDays: 5,
    location: { lat: 50.9272, lng: 6.9336, address: "Köln Sülz" },
    status: "cancelled",
    createdDaysAgo: 7,
  },
  {
    serviceTitle: "Smartphone- und Computerhilfe für Senioren",
    categoryId: "other",
    pricingType: "/ Stunde",
    minBudgetInCent: 2500,
    maxBudgetInCent: 3000,
    message:
      "Meine Oma (78) hat ein neues Samsung. WhatsApp, Fotos, Kontakte einrichten. Hausbesuch wäre super.",
    requestedDateText: "Nächste Woche, flexibel",
    requestedInDays: 8,
    location: { lat: 50.9667, lng: 7.0167, address: "Köln Mülheim" },
    status: "accepted",
    createdDaysAgo: 5,
  },
  {
    serviceTitle: "Wocheneinkauf & Erledigungen für Senioren",
    categoryId: "household",
    pricingType: "Gesamt",
    minBudgetInCent: 2000,
    maxBudgetInCent: 4000,
    message:
      "Mein Vater (82) braucht regelmäßig Hilfe beim Einkauf. 1x pro Woche fest. Können wir uns vorher kennenlernen?",
    requestedDateText: "Wöchentlich, ab nächster Woche",
    requestedInDays: 4,
    location: { lat: 50.9375, lng: 6.9603, address: "Köln Innenstadt" },
    status: "requested",
    createdDaysAgo: 0,
  },
  {
    serviceTitle: "Maler- & Streicharbeiten – sauber und schnell",
    categoryId: "handyman",
    pricingType: "pro Einheit",
    priceInCent: 1200,
    message:
      "Wohnzimmer und Flur, ca. 45qm Wandfläche, weiß auf weiß. Material besorge ich. Wann frühestens möglich?",
    requestedDateText: "In 1-2 Wochen",
    requestedInDays: 11,
    location: { lat: 50.9413, lng: 6.9583, address: "Köln Altstadt-Nord" },
    status: "declined",
    createdDaysAgo: 4,
  },
  {
    serviceTitle: "Pflanzen gießen & Briefkasten leeren bei Urlaub",
    categoryId: "gardening",
    pricingType: "Gesamt",
    minBudgetInCent: 4000,
    maxBudgetInCent: 8000,
    message:
      "Bin vom 15. bis 29. weg. Ca. 20 Zimmerpflanzen, Balkonkästen, Briefkasten. 2-3 Besuche pro Woche.",
    requestedDateText: "15.–29., flexibel",
    requestedInDays: 12,
    location: { lat: 50.9189, lng: 6.9581, address: "Köln Bayenthal" },
    status: "accepted",
    createdDaysAgo: 8,
  },
  {
    serviceTitle: "Umzugshilfe & Möbeltransport mit eigenem Transporter",
    categoryId: "moving",
    pricingType: "/ Stunde",
    minBudgetInCent: 3500,
    maxBudgetInCent: 4500,
    message:
      "Brauche kurzfristig Hilfe: Waschmaschine in den 4. Stock, kein Aufzug. 2 Personen, ca. 1h.",
    requestedDateText: "Übermorgen vormittag",
    requestedInDays: 2,
    location: { lat: 50.9089, lng: 6.8756, address: "Köln Rodenkirchen" },
    status: "cancelled",
    createdDaysAgo: 3,
  },
  {
    serviceTitle: "Gründliche Wohnungsreinigung – auch Endreinigungen",
    categoryId: "cleaning",
    pricingType: "/ Stunde",
    minBudgetInCent: 2500,
    maxBudgetInCent: 3500,
    message:
      "Suche jemanden für regelmäßige Reinigung alle 2 Wochen, ca. 90qm. Erste Reinigung ggf. gründlicher.",
    requestedDateText: "Ab nächster Woche, regelmäßig",
    requestedInDays: 7,
    location: { lat: 50.9576, lng: 6.9741, address: "Köln Nippes" },
    status: "requested",
    createdDaysAgo: 0,
  },
]

// ────────────────────────────────────────────────────────────
// Seeding
// ────────────────────────────────────────────────────────────
async function seedBookings() {
  console.log(`🌱 Seede ${bookings.length} Test-Bookings...\n`)

  const batch = db.batch()
  const bookingsRef = db.collection("bookings")

  for (const [i, b] of bookings.entries()) {
    const docRef = bookingsRef.doc()
    const createdAt = daysAgo(b.createdDaysAgo)
    const requestedAt = createdAt
    const updatedAt = Timestamp.now()

    const bookingDoc: Record<string, unknown> = {
      // 🔗 Referenzen (Test-IDs wie in den anderen Seed-Scripts)
      serviceId: `test-service-${randomInt(1, 15)}`,
      providerId: `test-provider-${randomInt(1, 5)}`,
      customerId: `test-customer-${randomInt(1, 8)}`,

      // 📄 Mini-Snapshot vom Service
      serviceTitle: b.serviceTitle,
      categoryId: b.categoryId,
      pricingType: b.pricingType,

      // 📝 Anfrage
      message: b.message,
      requestedDateText: b.requestedDateText,
      requestedAt,

      // 📍 Ort
      location: new GeoPoint(b.location.lat, b.location.lng),
      addressText: b.location.address,

      // 🔄 Status
      status: b.status,

      // 🧾 Meta
      createdAt,
      updatedAt,
    }

    // Pricing: entweder Festpreis oder Range
    if (b.priceInCent !== undefined) {
      bookingDoc.priceInCent = b.priceInCent
    }
    if (b.minBudgetInCent !== undefined) {
      bookingDoc.minBudgetInCent = b.minBudgetInCent
    }
    if (b.maxBudgetInCent !== undefined) {
      bookingDoc.maxBudgetInCent = b.maxBudgetInCent
    }

    // Status-spezifische Felder
    if (b.status === "accepted") {
      bookingDoc.acceptedAt = updatedAt
      bookingDoc.jobId = `test-job-${randomInt(1000, 9999)}`
    } else if (b.status === "declined") {
      bookingDoc.declinedAt = updatedAt
    } else if (b.status === "cancelled") {
      bookingDoc.cancelledAt = updatedAt
    }

    batch.set(docRef, bookingDoc)

    const priceLabel =
      b.priceInCent !== undefined
        ? `${(b.priceInCent / 100).toFixed(0)}€ ${b.pricingType}`
        : b.minBudgetInCent !== undefined && b.maxBudgetInCent !== undefined
          ? `${(b.minBudgetInCent / 100).toFixed(0)}–${(b.maxBudgetInCent / 100).toFixed(0)}€ ${b.pricingType}`
          : "—"

    console.log(
      `  ${String(i + 1).padStart(2, " ")}. ${b.serviceTitle}` +
        `\n      [${b.categoryId}] · ${b.location.address} · ${priceLabel} · ${b.status}`
    )
  }

  await batch.commit()
  console.log(
    `\n✅ Fertig! ${bookings.length} Bookings in Firestore geschrieben.`
  )
  process.exit(0)
}

seedBookings().catch((err) => {
  console.error("❌ Fehler beim Seeden:", err)
  process.exit(1)
})