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

// ────────────────────────────────────────────────────────────
// Order-Definitionen: handverlesen, jede Order individuell
// ────────────────────────────────────────────────────────────
interface OrderSeed {
  title: string
  description: string
  customerName: string
  categoryId: string
  subcategoryId: string
  priority: "low" | "normal" | "high" | "urgent"
  status: "available" | "assigned"
  budgetInCent: number
  startInDays: number
  windowHours: number
  isFlexible: boolean
  radiusInMeters: number
  location: { lat: number; lng: number; address: string }
  imageUrls: string[]
}

const orders: OrderSeed[] = [
  {
    title: "Umzug 2-Zimmer-Wohnung, 2 Helfer gesucht",
    description:
      "Samstagvormittag ziehe ich von Sülz nach Ehrenfeld. Wohnung ist im 3. OG ohne Aufzug, alles ist schon gepackt. Transporter ist organisiert, ich brauche nur zwei kräftige Hände. Couch, Bett, Schrank und ca. 20 Kartons.",
    customerName: "Maria Schmidt",
    categoryId: "moving",
    subcategoryId: "umzugshilfe",
    priority: "high",
    status: "available",
    budgetInCent: 18000,
    startInDays: 3,
    windowHours: 6,
    isFlexible: false,
    radiusInMeters: 10000,
    location: { lat: 50.9272, lng: 6.9336, address: "Köln Sülz" },
    imageUrls: [
      "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=800",
    ],
  },
  {
    title: "IKEA PAX Kleiderschrank aufbauen (3m)",
    description:
      "Habe gestern einen großen PAX mit 3 Elementen geliefert bekommen. Schiebetüren, Innenausstattung komplett. Alle Teile und Anleitung da. Rechne mit ca. 3 Stunden.",
    customerName: "Thomas Müller",
    categoryId: "handyman",
    subcategoryId: "moebelaufbau",
    priority: "normal",
    status: "available",
    budgetInCent: 12000,
    startInDays: 5,
    windowHours: 24,
    isFlexible: true,
    radiusInMeters: 5000,
    location: { lat: 50.9576, lng: 6.9741, address: "Köln Nippes" },
    imageUrls: [
      "https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=800",
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800",
    ],
  },
  {
    title: "Wohnungsreinigung nach Auszug (75qm)",
    description:
      "Die Wohnung ist leer, aber ich brauche eine gründliche Endreinigung für die Übergabe. Inkl. Fenster, Küche entfetten, Bad, Böden. Material kann gestellt werden.",
    customerName: "Sarah Weber",
    categoryId: "cleaning",
    subcategoryId: "endreinigung-nach-umzug",
    priority: "urgent",
    status: "available",
    budgetInCent: 22000,
    startInDays: 2,
    windowHours: 8,
    isFlexible: false,
    radiusInMeters: 8000,
    location: { lat: 50.9189, lng: 6.9581, address: "Köln Bayenthal" },
    imageUrls: [
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800",
    ],
  },
  {
    title: "Hecke schneiden und Rasen mähen",
    description:
      "Kleiner Reihenhausgarten, Hecke ca. 15m lang und 1,80m hoch. Rasen etwa 60qm. Häcksler und Mäher sind vorhanden, Grünschnitt kommt in die Biotonne.",
    customerName: "Jan Hoffmann",
    categoryId: "gardening",
    subcategoryId: "hecke-schneiden",
    priority: "normal",
    status: "available",
    budgetInCent: 8000,
    startInDays: 7,
    windowHours: 48,
    isFlexible: true,
    radiusInMeters: 15000,
    location: { lat: 50.9089, lng: 6.8756, address: "Köln Rodenkirchen" },
    imageUrls: [
      "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800",
    ],
  },
  {
    title: "Fenster putzen – Einfamilienhaus",
    description:
      "EFH mit 14 Fenstern (davon 3 große Panoramafenster im EG). Innen und außen, Rahmen mit abwischen. Leiter ist da. Suche jemanden mit Erfahrung.",
    customerName: "Lisa Becker",
    categoryId: "cleaning",
    subcategoryId: "fensterreinigung",
    priority: "low",
    status: "available",
    budgetInCent: 9000,
    startInDays: 10,
    windowHours: 72,
    isFlexible: true,
    radiusInMeters: 10000,
    location: { lat: 50.9667, lng: 7.0167, address: "Köln Mülheim" },
    imageUrls: [
      "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800",
    ],
  },
  {
    title: "Hundesitter für verlängertes Wochenende",
    description:
      "Ich bin Fr-So unterwegs und suche jemanden, der sich um meinen Golden Retriever (4 Jahre, sehr lieb) kümmert. 2x am Tag Gassi, Füttern, Beschäftigung. Übernachtung bei mir möglich oder Besuche.",
    customerName: "Michael Wagner",
    categoryId: "household",
    subcategoryId: "haustierbetreuung",
    priority: "high",
    status: "assigned",
    budgetInCent: 15000,
    startInDays: 4,
    windowHours: 72,
    isFlexible: false,
    radiusInMeters: 5000,
    location: { lat: 50.9413, lng: 6.9583, address: "Köln Altstadt-Nord" },
    imageUrls: [
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800",
      "https://images.unsplash.com/photo-1552053831-71594a27632d?w=800",
    ],
  },
  {
    title: "Mathe-Nachhilfe 10. Klasse Gymnasium",
    description:
      "Mein Sohn (15) hat Probleme mit quadratischen Funktionen und steht kurz vor der Klassenarbeit. Suche jemanden für 2-3 Sitzungen à 90 Min, bevorzugt am Nachmittag.",
    customerName: "Anna Schulz",
    categoryId: "other",
    subcategoryId: "nachhilfe",
    priority: "high",
    status: "available",
    budgetInCent: 9000,
    startInDays: 1,
    windowHours: 24,
    isFlexible: false,
    radiusInMeters: 5000,
    location: { lat: 50.9375, lng: 6.9603, address: "Köln Innenstadt" },
    imageUrls: [],
  },
  {
    title: "Auto komplett aufbereiten (innen & außen)",
    description:
      "BMW 3er, 4 Jahre alt. Außen waschen und polieren, innen gründlich saugen, Polster reinigen, Armaturenbrett pflegen. Wagen ist in normalem Zustand, keine extremen Flecken.",
    customerName: "Felix Richter",
    categoryId: "automotive",
    subcategoryId: "innenraum-tiefenreinigung",
    priority: "normal",
    status: "available",
    budgetInCent: 11000,
    startInDays: 6,
    windowHours: 24,
    isFlexible: true,
    radiusInMeters: 10000,
    location: { lat: 50.9511, lng: 7.0089, address: "Köln Deutz" },
    imageUrls: [
      "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800",
    ],
  },
  {
    title: "Keller entrümpeln – ca. 15qm",
    description:
      "Alter Kellerraum voll mit Krempel von meinen Eltern. Das meiste kann weg. Suche jemanden zum Sortieren, Raustragen und zur Entsorgungshalle fahren. Anhänger vorhanden, Kombi auch.",
    customerName: "Maria Schmidt",
    categoryId: "moving",
    subcategoryId: "entruempelung",
    priority: "normal",
    status: "available",
    budgetInCent: 20000,
    startInDays: 9,
    windowHours: 12,
    isFlexible: true,
    radiusInMeters: 12000,
    location: { lat: 50.9272, lng: 6.9336, address: "Köln Sülz" },
    imageUrls: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    ],
  },
  {
    title: "Silikonfugen im Badezimmer erneuern",
    description:
      "Duschbereich und Badewanne haben Schimmel in den Fugen. Alte raus, neue rein. Ca. 6 Meter gesamt. Material kann ich besorgen.",
    customerName: "Thomas Müller",
    categoryId: "handyman",
    subcategoryId: "silikonfugen-erneuern",
    priority: "normal",
    status: "available",
    budgetInCent: 7500,
    startInDays: 5,
    windowHours: 48,
    isFlexible: true,
    radiusInMeters: 8000,
    location: { lat: 50.9576, lng: 6.9741, address: "Köln Nippes" },
    imageUrls: [
      "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800",
    ],
  },
  {
    title: "Pflanzen gießen während 2-wöchigem Urlaub",
    description:
      "Ich bin vom 15. bis 29. weg. Habe ca. 20 Zimmerpflanzen und Balkonkästen. 2-3 Besuche pro Woche wären super. Schlüsselübergabe vorher.",
    customerName: "Sarah Weber",
    categoryId: "gardening",
    subcategoryId: "giessen-bei-abwesenheit",
    priority: "low",
    status: "available",
    budgetInCent: 6000,
    startInDays: 12,
    windowHours: 336,
    isFlexible: true,
    radiusInMeters: 3000,
    location: { lat: 50.9189, lng: 6.9581, address: "Köln Bayenthal" },
    imageUrls: [
      "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=800",
    ],
  },
  {
    title: "Waschmaschine in den 4. Stock tragen & anschließen",
    description:
      "Neue Waschmaschine wird geliefert, aber nur bis vor die Haustür. Treppenhaus ist eng, kein Aufzug. Brauche 2 Leute zum Hochtragen und jemanden, der den Anschluss macht (Wasser/Strom vorhanden).",
    customerName: "Jan Hoffmann",
    categoryId: "moving",
    subcategoryId: "waschmaschine-transportieren",
    priority: "high",
    status: "assigned",
    budgetInCent: 10000,
    startInDays: 2,
    windowHours: 4,
    isFlexible: false,
    radiusInMeters: 8000,
    location: { lat: 50.9089, lng: 6.8756, address: "Köln Rodenkirchen" },
    imageUrls: [],
  },
  {
    title: "Smartphone-Einrichtung für meine Oma",
    description:
      "Meine 78-jährige Oma hat ein neues Samsung bekommen. Brauche jemanden Geduldigen, der ihr alles einrichtet (WhatsApp, Fotos, Kontakte) und in Ruhe erklärt. Vor-Ort-Termin bei ihr zuhause.",
    customerName: "Lisa Becker",
    categoryId: "other",
    subcategoryId: "smartphone-hilfe",
    priority: "normal",
    status: "available",
    budgetInCent: 5000,
    startInDays: 8,
    windowHours: 96,
    isFlexible: true,
    radiusInMeters: 15000,
    location: { lat: 50.9667, lng: 7.0167, address: "Köln Mülheim" },
    imageUrls: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
    ],
  },
  {
    title: "Wohnzimmer und Flur streichen",
    description:
      "Ca. 45qm Wandfläche, alles weiß auf weiß (Refresh). Decke muss nicht gemacht werden. Möbel sind teilweise schon weggeräumt. Farbe und Material besorge ich.",
    customerName: "Michael Wagner",
    categoryId: "handyman",
    subcategoryId: "malerarbeiten",
    priority: "normal",
    status: "available",
    budgetInCent: 28000,
    startInDays: 11,
    windowHours: 24,
    isFlexible: true,
    radiusInMeters: 10000,
    location: { lat: 50.9413, lng: 6.9583, address: "Köln Altstadt-Nord" },
    imageUrls: [
      "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800",
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800",
    ],
  },
  {
    title: "Wocheneinkauf für Senior",
    description:
      "Mein Vater (82) kann nicht mehr gut einkaufen gehen. Suche jemanden zuverlässigen, der einmal pro Woche nach Liste einkauft und alles bis in die Wohnung bringt. Kosten werden natürlich erstattet.",
    customerName: "Anna Schulz",
    categoryId: "household",
    subcategoryId: "einkaufen",
    priority: "normal",
    status: "available",
    budgetInCent: 3500,
    startInDays: 4,
    windowHours: 24,
    isFlexible: true,
    radiusInMeters: 5000,
    location: { lat: 50.9375, lng: 6.9603, address: "Köln Innenstadt" },
    imageUrls: [
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800",
    ],
  },
]

// ────────────────────────────────────────────────────────────
// Seeding
// ────────────────────────────────────────────────────────────
async function seedOrders() {
  console.log(`🌱 Seede ${orders.length} Test-Orders...\n`)

  const batch = db.batch()
  const ordersRef = db.collection("orders")

  for (const [i, o] of orders.entries()) {
    const docRef = ordersRef.doc()
    const now = Timestamp.now()

    const orderDoc = {
      title: o.title,
      description: o.description,
      customerName: o.customerName,
      customerId: `test-customer-${randomInt(1, 8)}`,
      status: o.status,
      priority: o.priority,
      timeWindow: {
        start: daysFromNow(o.startInDays),
        end: daysFromNow(o.startInDays, o.windowHours),
        isFlexible: o.isFlexible,
      },
      budgetInCent: o.budgetInCent,
      location: new GeoPoint(o.location.lat, o.location.lng),
      address: o.location.address,
      radiusInMeters: o.radiusInMeters,
      categoryId: o.categoryId,
      subcategoryId: o.subcategoryId,
      imageUrls: o.imageUrls,
      thumbnailUrl: o.imageUrls[0] ?? null,
      assignedProviderId:
        o.status === "assigned" ? `test-provider-${randomInt(1, 5)}` : null,
      assignedAt: o.status === "assigned" ? now : null,
      createdAt: now,
      updatedAt: now,
    }

    batch.set(docRef, orderDoc)
    console.log(
      `  ${String(i + 1).padStart(2, " ")}. ${o.title}` +
        `\n      [${o.categoryId}/${o.subcategoryId}] · ${o.location.address} · ${(o.budgetInCent / 100).toFixed(0)}€ · ${o.status}`
    )
  }

  await batch.commit()
  console.log(`\n✅ Fertig! ${orders.length} Orders in Firestore geschrieben.`)
  process.exit(0)
}

seedOrders().catch((err) => {
  console.error("❌ Fehler beim Seeden:", err)
  process.exit(1)
})