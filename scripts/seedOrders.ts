// scripts/seedOrders.ts
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

// Hilfsfunktionen
const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min

const randomFrom = <T>(arr: T[]): T => arr[randomInt(0, arr.length - 1)]

const daysFromNow = (days: number, hours = 0): Timestamp => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(date.getHours() + hours)
  return Timestamp.fromDate(date)
}

// Mock-Daten
const titles = [
  "Umzugshilfe gesucht",
  "Garten winterfest machen",
  "IKEA Schrank aufbauen",
  "Wohnung streichen (2 Zimmer)",
  "Laminat verlegen",
  "Computer einrichten",
  "Hundesitter für Wochenende",
  "Fenster putzen (EFH)",
  "Möbel aus Keller entsorgen",
  "Waschmaschine anschließen",
  "Rasen mähen & Hecke schneiden",
  "Nachhilfe Mathe (10. Klasse)",
  "Fotos von Hochzeit bearbeiten",
  "Küche abbauen und transportieren",
  "Babysitter Freitagabend",
]

const descriptions = [
  "Brauche dringend Unterstützung, bitte mit eigenem Werkzeug.",
  "Sollte zeitnah erledigt werden, Details gerne per Chat.",
  "Kleinere Aufgabe, ca. 2-3 Stunden Aufwand.",
  "Regelmäßig wiederkehrend möglich bei guter Zusammenarbeit.",
  "Muss bis Ende der Woche fertig sein, alles Material vorhanden.",
]

const customerNames = [
  "Maria Schmidt",
  "Thomas Müller",
  "Sarah Weber",
  "Jan Hoffmann",
  "Lisa Becker",
  "Michael Wagner",
  "Anna Schulz",
  "Felix Richter",
]

// Koordinaten rund um Köln
const kolnLocations: Array<{ lat: number; lng: number; address: string }> = [
  { lat: 50.9375, lng: 6.9603, address: "Köln Innenstadt" },
  { lat: 50.9413, lng: 6.9583, address: "Köln Altstadt-Nord" },
  { lat: 50.9272, lng: 6.9336, address: "Köln Sülz" },
  { lat: 50.9576, lng: 6.9741, address: "Köln Nippes" },
  { lat: 50.9189, lng: 6.9581, address: "Köln Bayenthal" },
  { lat: 50.9667, lng: 7.0167, address: "Köln Mülheim" },
  { lat: 50.9089, lng: 6.8756, address: "Köln Rodenkirchen" },
  { lat: 50.9511, lng: 7.0089, address: "Köln Deutz" },
]

const categoryIds = [
  "moving",
  "gardening",
  "furniture",
  "cleaning",
  "tech",
  "petcare",
  "education",
  "handyman",
]

const subcategoryIds = [
  "moving-help",
  "lawn-care",
  "assembly",
  "window-cleaning",
  "pc-setup",
  "dog-sitting",
  "math-tutoring",
  "painting",
]

const priorities = ["low", "normal", "normal", "normal", "high", "urgent"]
const statuses = ["available", "available", "available", "assigned"]

const sampleImages = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64",
  "https://images.unsplash.com/photo-1416879595882-3373a0480b5b",
  "https://images.unsplash.com/photo-1581578731548-c64695cc6952",
]

async function seedOrders() {
  console.log("🌱 Seede 15 Test-Orders...")

  const batch = db.batch()
  const ordersRef = db.collection("orders")

  for (let i = 0; i < 15; i++) {
    const docRef = ordersRef.doc()
    const loc = randomFrom(kolnLocations)
    const startDays = randomInt(1, 14)
    const windowHours = randomInt(2, 48)
    const imageCount = randomInt(0, 3)
    const images = Array.from({ length: imageCount }, () =>
      randomFrom(sampleImages)
    )

    const now = Timestamp.now()
    const status = randomFrom(statuses)

    const order = {
      title: titles[i],
      description: randomFrom(descriptions),
      customerName: randomFrom(customerNames),
      customerId: `test-customer-${randomInt(1, 8)}`,
      status,
      priority: randomFrom(priorities),
      timeWindow: {
        start: daysFromNow(startDays),
        end: daysFromNow(startDays, windowHours),
        isFlexible: Math.random() > 0.5,
      },
      budgetInCent: randomInt(20, 500) * 100,
      location: new GeoPoint(loc.lat, loc.lng),
      address: loc.address,
      radiusInMeters: randomFrom([2000, 5000, 10000, 15000]),
      categoryId: randomFrom(categoryIds),
      subcategoryId: randomFrom(subcategoryIds),
      imageUrls: images,
      thumbnailUrl: images[0] ?? null,
      assignedProviderId:
        status === "assigned" ? `test-provider-${randomInt(1, 5)}` : null,
      assignedAt: status === "assigned" ? now : null,
      createdAt: now,
      updatedAt: now,
    }

    batch.set(docRef, order)
    console.log(`  ✓ ${order.title} (${loc.address})`)
  }

  await batch.commit()
  console.log("✅ Fertig! 15 Orders in Firestore geschrieben.")
  process.exit(0)
}

seedOrders().catch((err) => {
  console.error("❌ Fehler beim Seeden:", err)
  process.exit(1)
})