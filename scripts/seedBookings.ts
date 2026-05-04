// scripts/seedBookings.ts
import { initializeApp, cert } from "firebase-admin/app"
import { getFirestore, Timestamp, GeoPoint } from "firebase-admin/firestore"
import { readFileSync } from "fs"
import { BookingStatus } from "@/lib/types/booking"
import { PricingType } from "@/lib/types/service"

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

const daysAgo = (days: number, hours = 0): Timestamp => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(date.getHours() - hours)
  return Timestamp.fromDate(date)
}

// ────────────────────────────────────────────────────────────
// Booking-Definitionen: handverlesen, jedes Booking individuell
// ────────────────────────────────────────────────────────────
interface BookingSeed {
  // Service-Snapshot
  serviceTitle: string
  categoryId: string
  pricingType: PricingType
  priceInCent?: number
  unitName?: string

  // Anfrage
  message?: string
  requestedDateText?: string

  // Antwort Dienstleister (nur bei declined)
  declineMessage?: string

  // Ort
  location: { lat: number; lng: number; address: string }

  // Status & Zeitlogik
  status: BookingStatus
  createdDaysAgo: number
}

const bookings: BookingSeed[] = [
  {
    serviceTitle: "Umzugshilfe & Möbeltransport mit eigenem Transporter",
    categoryId: "moving",
    pricingType: PricingType.perHour,
    priceInCent: 4000,
    message:
      "Hi Markus, ich ziehe nächsten Samstag von Sülz nach Ehrenfeld. 2-Zimmer-Wohnung, 3. OG ohne Aufzug. Hättest du Zeit? Rechne mit ca. 4-5 Stunden.",
    requestedDateText: "Samstag, 09:00 Uhr",
    location: { lat: 50.9272, lng: 6.9336, address: "Köln Sülz" },
    status: BookingStatus.requested,
    createdDaysAgo: 1,
  },
  {
    serviceTitle: "IKEA & Möbelaufbau – schnell und sauber",
    categoryId: "handyman",
    pricingType: PricingType.perHour,
    priceInCent: 3500,
    message:
      "Hallo, habe einen 3m PAX bekommen. Schiebetüren, komplette Innenausstattung. Wann hättest du Zeit?",
    requestedDateText: "Diese Woche flexibel",
    location: { lat: 50.9576, lng: 6.9741, address: "Köln Nippes" },
    status: BookingStatus.accepted,
    createdDaysAgo: 4,
  },
  {
    serviceTitle: "Gründliche Wohnungsreinigung – auch Endreinigungen",
    categoryId: "cleaning",
    pricingType: PricingType.perHour,
    priceInCent: 3000,
    message:
      "Brauche eine Endreinigung für meine 75qm-Wohnung vor der Übergabe am Freitag. Inkl. Fenster, Küche, Bad. Wäre das in 2 Tagen möglich?",
    requestedDateText: "Donnerstag, ganztags",
    location: { lat: 50.9189, lng: 6.9581, address: "Köln Bayenthal" },
    status: BookingStatus.requested,
    createdDaysAgo: 0,
  },
  {
    serviceTitle: "Fensterreinigung – streifenfrei mit Profi-Equipment",
    categoryId: "cleaning",
    pricingType: PricingType.perUnit,
    priceInCent: 800,
    unitName: "Fenster",
    message:
      "Einfamilienhaus mit 14 Fenstern, davon 3 große Panoramafenster. Innen und außen, Rahmen mit. Geht das nächste Woche?",
    requestedDateText: "Nächste Woche, vormittags",
    location: { lat: 50.9667, lng: 7.0167, address: "Köln Mülheim" },
    status: BookingStatus.accepted,
    createdDaysAgo: 6,
  },
  {
    serviceTitle: "Garten- und Heckenpflege im Kölner Süden",
    categoryId: "gardening",
    pricingType: PricingType.perHour,
    priceInCent: 3000,
    message:
      "Kleiner Reihenhausgarten, Hecke ca. 15m und 1,80m hoch, Rasen 60qm. Grünschnitt entsorge ich selbst. Hast du Zeit am Wochenende?",
    requestedDateText: "Sonntag nachmittags",
    declineMessage:
      "Hi, leider bin ich am Wochenende komplett ausgebucht. Probier es gerne in 2 Wochen nochmal!",
    location: { lat: 50.9089, lng: 6.8756, address: "Köln Rodenkirchen" },
    status: BookingStatus.declined,
    createdDaysAgo: 3,
  },
  {
    serviceTitle: "Autoaufbereitung – innen & außen wie neu",
    categoryId: "automotive",
    pricingType: PricingType.fixed,
    priceInCent: 14000,
    message:
      "BMW 3er, 4 Jahre alt. Komplette Aufbereitung innen und außen. Wann könntest du kommen?",
    requestedDateText: "Flexibel diese Woche",
    location: { lat: 50.9511, lng: 7.0089, address: "Köln Deutz" },
    status: BookingStatus.requested,
    createdDaysAgo: 2,
  },
  {
    serviceTitle: "Mathe-Nachhilfe Klasse 5–13 (Studentin TH Köln)",
    categoryId: "other",
    pricingType: PricingType.perHour,
    priceInCent: 3000,
    message:
      "Hallo Lea, mein Sohn (10. Klasse Gymnasium) hat Probleme mit quadratischen Funktionen, Klassenarbeit nächste Woche. 2-3 Sitzungen?",
    requestedDateText: "Ab morgen, nachmittags",
    location: { lat: 50.9375, lng: 6.9603, address: "Köln Innenstadt" },
    status: BookingStatus.accepted,
    createdDaysAgo: 2,
  },
  {
    serviceTitle: "Hunde-Sitting & Gassi-Service mit Herz",
    categoryId: "household",
    pricingType: PricingType.perHour,
    priceInCent: 1800,
    message:
      "Hi Sophie, suche jemanden für meinen Golden Retriever (4) von Fr-So. 2x täglich Gassi, füttern. Übernachtung möglich.",
    requestedDateText: "Fr-So nächste Woche",
    location: { lat: 50.9413, lng: 6.9583, address: "Köln Altstadt-Nord" },
    status: BookingStatus.requested,
    createdDaysAgo: 1,
  },
  {
    serviceTitle: "Kleinreparaturen, Bohren, Lampen, Regale",
    categoryId: "handyman",
    pricingType: PricingType.perHour,
    priceInCent: 4000,
    message:
      "Brauche Hilfe bei: 2 Lampen anschließen, TV an die Wand, 1 Wandregal. Sollte in ca. 2h machbar sein.",
    requestedDateText: "Samstag vormittag",
    location: { lat: 50.9272, lng: 6.9336, address: "Köln Sülz" },
    status: BookingStatus.cancelled,
    createdDaysAgo: 7,
  },
  {
    serviceTitle: "Smartphone- und Computerhilfe für Senioren",
    categoryId: "other",
    pricingType: PricingType.perHour,
    priceInCent: 2800,
    message:
      "Meine Oma (78) hat ein neues Samsung. WhatsApp, Fotos, Kontakte einrichten. Hausbesuch wäre super.",
    requestedDateText: "Nächste Woche, flexibel",
    location: { lat: 50.9667, lng: 7.0167, address: "Köln Mülheim" },
    status: BookingStatus.accepted,
    createdDaysAgo: 5,
  },
  {
    serviceTitle: "Wocheneinkauf & Erledigungen für Senioren",
    categoryId: "household",
    pricingType: PricingType.fixed,
    priceInCent: 3000,
    message:
      "Mein Vater (82) braucht regelmäßig Hilfe beim Einkauf. 1x pro Woche fest. Können wir uns vorher kennenlernen?",
    requestedDateText: "Wöchentlich, ab nächster Woche",
    location: { lat: 50.9375, lng: 6.9603, address: "Köln Innenstadt" },
    status: BookingStatus.requested,
    createdDaysAgo: 0,
  },
  {
    serviceTitle: "Maler- & Streicharbeiten – sauber und schnell",
    categoryId: "handyman",
    pricingType: PricingType.perUnit,
    priceInCent: 1200,
    unitName: "qm",
    message:
      "Wohnzimmer und Flur, ca. 45qm Wandfläche, weiß auf weiß. Material besorge ich. Wann frühestens möglich?",
    requestedDateText: "In 1-2 Wochen",
    declineMessage:
      "Hallo, ich nehme aktuell nur Aufträge ab 80qm an. Sorry – kann dir aber gerne einen Kollegen empfehlen.",
    location: { lat: 50.9413, lng: 6.9583, address: "Köln Altstadt-Nord" },
    status: BookingStatus.declined,
    createdDaysAgo: 4,
  },
  {
    serviceTitle: "Pflanzen gießen & Briefkasten leeren bei Urlaub",
    categoryId: "gardening",
    pricingType: PricingType.fixed,
    priceInCent: 6000,
    message:
      "Bin vom 15. bis 29. weg. Ca. 20 Zimmerpflanzen, Balkonkästen, Briefkasten. 2-3 Besuche pro Woche.",
    requestedDateText: "15.–29., flexibel",
    location: { lat: 50.9189, lng: 6.9581, address: "Köln Bayenthal" },
    status: BookingStatus.accepted,
    createdDaysAgo: 8,
  },
  {
    serviceTitle: "Umzugshilfe & Möbeltransport mit eigenem Transporter",
    categoryId: "moving",
    pricingType: PricingType.perHour,
    priceInCent: 4000,
    message:
      "Brauche kurzfristig Hilfe: Waschmaschine in den 4. Stock, kein Aufzug. 2 Personen, ca. 1h.",
    requestedDateText: "Übermorgen vormittag",
    location: { lat: 50.9089, lng: 6.8756, address: "Köln Rodenkirchen" },
    status: BookingStatus.cancelled,
    createdDaysAgo: 3,
  },
  {
    serviceTitle: "Gründliche Wohnungsreinigung – auch Endreinigungen",
    categoryId: "cleaning",
    pricingType: PricingType.perHour,
    priceInCent: 3000,
    message:
      "Suche jemanden für regelmäßige Reinigung alle 2 Wochen, ca. 90qm. Erste Reinigung ggf. gründlicher.",
    requestedDateText: "Ab nächster Woche, regelmäßig",
    location: { lat: 50.9576, lng: 6.9741, address: "Köln Nippes" },
    status: BookingStatus.requested,
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

    // Optionale Service-Snapshot-Felder
    if (b.priceInCent !== undefined) {
      bookingDoc.priceInCent = b.priceInCent
    }
    if (b.unitName !== undefined) {
      bookingDoc.unitName = b.unitName
    }

    // Optionale Anfrage-Felder
    if (b.message !== undefined) {
      bookingDoc.message = b.message
    }
    if (b.requestedDateText !== undefined) {
      bookingDoc.requestedDateText = b.requestedDateText
    }

    // Status-spezifische Felder
    if (b.status === BookingStatus.accepted) {
      bookingDoc.acceptedAt = updatedAt
      bookingDoc.jobId = `test-job-${randomInt(1000, 9999)}`
    } else if (b.status === BookingStatus.declined) {
      bookingDoc.declinedAt = updatedAt
      if (b.declineMessage !== undefined) {
        bookingDoc.declineMessage = b.declineMessage
      }
    } else if (b.status === BookingStatus.cancelled) {
      bookingDoc.cancelledAt = updatedAt
    }

    batch.set(docRef, bookingDoc)

    const priceLabel =
      b.priceInCent !== undefined
        ? `${(b.priceInCent / 100).toFixed(0)}€ ${b.pricingType}${b.unitName ? ` (${b.unitName})` : ""}`
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