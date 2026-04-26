// scripts/seedServices.ts
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

// ────────────────────────────────────────────────────────────
// Service-Definitionen: handverlesen, je Service individuell
// ────────────────────────────────────────────────────────────
type ServiceStatusSeed = "active" | "inactive" | "deleted"
type PricingTypeSeed = "Gesamt" | "/ Stunde" | "pro Einheit"

interface ServiceSeed {
  title: string
  description: string
  providerName: string
  categoryId: string
  status: ServiceStatusSeed
  pricingType: PricingTypeSeed
  minBudgetInCent: number
  maxBudgetInCent: number
  unitName?: string
  radius: number // in km (entsprechend Service-Type)
  location: { lat: number; lng: number; city: string }
  imageUrl?: string
}

const services: ServiceSeed[] = [
  {
    title: "Umzugshilfe & Möbeltransport mit eigenem Transporter",
    description:
      "Erfahrener Helfer mit eigenem Sprinter (12m³). Ich packe an, schleppe Treppen rauf/runter und fahre auch quer durch Köln. Stundenbasis oder Pauschale für komplette Umzüge möglich. Decken, Gurte und Sackkarre sind dabei.",
    providerName: "Markus Lehmann",
    categoryId: "moving",
    status: "active",
    pricingType: "/ Stunde",
    minBudgetInCent: 3500,
    maxBudgetInCent: 4500,
    radius: 25,
    location: { lat: 50.9576, lng: 6.9741, city: "Köln Nippes" },
    imageUrl:
      "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=800",
  },
  {
    title: "IKEA & Möbelaufbau – schnell und sauber",
    description:
      "Seit über 5 Jahren baue ich IKEA-Möbel auf. PAX, BESTÅ, KALLAX, Küchen – egal was. Eigenes Werkzeug, Akkuschrauber, Wasserwaage. Auch komplette Wohnungseinrichtungen an einem Tag.",
    providerName: "Daniel Krause",
    categoryId: "handyman",
    status: "active",
    pricingType: "/ Stunde",
    minBudgetInCent: 3000,
    maxBudgetInCent: 4000,
    radius: 15,
    location: { lat: 50.9413, lng: 6.9583, city: "Köln Altstadt-Nord" },
    imageUrl:
      "https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=800",
  },
  {
    title: "Gründliche Wohnungsreinigung – auch Endreinigungen",
    description:
      "Ich reinige Wohnungen mit Liebe zum Detail. Spezialisiert auf Endreinigungen vor Übergabe (inkl. Fenster, Küche entfetten, Bad kalkfrei). Eigene umweltfreundliche Mittel, Maschinen vorhanden.",
    providerName: "Elena Petrova",
    categoryId: "cleaning",
    status: "active",
    pricingType: "/ Stunde",
    minBudgetInCent: 2500,
    maxBudgetInCent: 3500,
    radius: 12,
    location: { lat: 50.9189, lng: 6.9581, city: "Köln Bayenthal" },
    imageUrl:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800",
  },
  {
    title: "Fensterreinigung – streifenfrei mit Profi-Equipment",
    description:
      "Fenster innen & außen, Rahmen und Fensterbänke. Mit Teleskopstange auch hohe Fenster ohne Leiter. Pauschalpreis pro Fenster oder Stundensatz. Privat und Büro.",
    providerName: "Tobias Walter",
    categoryId: "cleaning",
    status: "active",
    pricingType: "pro Einheit",
    minBudgetInCent: 500,
    maxBudgetInCent: 1200,
    unitName: "Fenster",
    radius: 20,
    location: { lat: 50.9667, lng: 7.0167, city: "Köln Mülheim" },
    imageUrl:
      "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800",
  },
  {
    title: "Garten- und Heckenpflege im Kölner Süden",
    description:
      "Hobbygärtner mit eigenem Equipment (Rasenmäher, Heckenschere, Häcksler). Mähen, Hecke schneiden, Unkraut, Laub. Grünschnitt nehme ich auf Wunsch mit zur Entsorgung. Saisonale Pakete möglich.",
    providerName: "Bernd Schäfer",
    categoryId: "gardening",
    status: "active",
    pricingType: "/ Stunde",
    minBudgetInCent: 2500,
    maxBudgetInCent: 3500,
    radius: 18,
    location: { lat: 50.9089, lng: 6.8756, city: "Köln Rodenkirchen" },
    imageUrl:
      "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800",
  },
  {
    title: "Autoaufbereitung – innen & außen wie neu",
    description:
      "Komplette Aufbereitung: Außenwäsche, Politur, Innenraum saugen, Polster shampoonieren, Lederpflege, Armaturen. Mobiler Service – ich komme zu dir mit Wasser und Strom (oder Anschluss vor Ort).",
    providerName: "Kemal Yıldız",
    categoryId: "automotive",
    status: "active",
    pricingType: "Gesamt",
    minBudgetInCent: 8000,
    maxBudgetInCent: 18000,
    radius: 20,
    location: { lat: 50.9511, lng: 7.0089, city: "Köln Deutz" },
    imageUrl:
      "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800",
  },
  {
    title: "Mathe-Nachhilfe Klasse 5–13 (Studentin TH Köln)",
    description:
      "Mathestudentin im 5. Semester, gebe seit 3 Jahren Nachhilfe. Spezialgebiet Mittel- & Oberstufe (Analysis, Stochastik, Geometrie). Geduldig und strukturiert. Bei dir zuhause oder per Video.",
    providerName: "Lea Bachmann",
    categoryId: "other",
    status: "active",
    pricingType: "/ Stunde",
    minBudgetInCent: 2500,
    maxBudgetInCent: 3500,
    radius: 10,
    location: { lat: 50.9375, lng: 6.9603, city: "Köln Innenstadt" },
    imageUrl:
      "https://images.unsplash.com/photo-1509869175650-a1d97972541a?w=800",
  },
  {
    title: "Hunde-Sitting & Gassi-Service mit Herz",
    description:
      "Tierliebende Studentin, eigene Erfahrung mit Hunden. Tagesbetreuung, Übernachtungen oder regelmäßige Gassi-Runden. Auch für ältere Hunde geeignet. Kennenlernen vorab selbstverständlich kostenlos.",
    providerName: "Sophie Berger",
    categoryId: "household",
    status: "active",
    pricingType: "/ Stunde",
    minBudgetInCent: 1500,
    maxBudgetInCent: 2000,
    radius: 8,
    location: { lat: 50.9413, lng: 6.9583, city: "Köln Altstadt-Nord" },
    imageUrl:
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800",
  },
  {
    title: "Kleinreparaturen, Bohren, Lampen, Regale",
    description:
      "Der Allrounder für die kleinen Sachen, für die kein Handwerker kommt. Lampen anschließen, Regale und TVs montieren, Bilder aufhängen, Schubladen reparieren. Werkzeug komplett vorhanden.",
    providerName: "Andreas Wolf",
    categoryId: "handyman",
    status: "active",
    pricingType: "/ Stunde",
    minBudgetInCent: 3500,
    maxBudgetInCent: 4500,
    radius: 15,
    location: { lat: 50.9272, lng: 6.9336, city: "Köln Sülz" },
    imageUrl:
      "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=800",
  },
  {
    title: "Entrümpelung & Sperrmüll-Service",
    description:
      "Keller, Dachboden, ganze Wohnungen – ich räume aus, sortiere und entsorge fachgerecht. Eigener Anhänger, Kontakte zu Wertstoffhöfen. Pauschalangebot nach Besichtigung möglich.",
    providerName: "Markus Lehmann",
    categoryId: "moving",
    status: "inactive",
    pricingType: "Gesamt",
    minBudgetInCent: 15000,
    maxBudgetInCent: 60000,
    radius: 25,
    location: { lat: 50.9576, lng: 6.9741, city: "Köln Nippes" },
    imageUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
  },
  {
    title: "Smartphone- und Computerhilfe für Senioren",
    description:
      "Ich nehme mir Zeit. WhatsApp einrichten, Fotos sortieren, Email, Drucker, WLAN-Probleme. Geduldig erklärt, Schritt für Schritt. Auch Hausbesuche im ganzen Stadtgebiet.",
    providerName: "Tobias Walter",
    categoryId: "other",
    status: "active",
    pricingType: "/ Stunde",
    minBudgetInCent: 2500,
    maxBudgetInCent: 3000,
    radius: 20,
    location: { lat: 50.9667, lng: 7.0167, city: "Köln Mülheim" },
    imageUrl:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
  },
  {
    title: "Wocheneinkauf & Erledigungen für Senioren",
    description:
      "Zuverlässiger Einkaufsservice nach Liste, auch Apotheken- und Postgänge. Feste Termine pro Woche möglich. Quittungen werden mitgebracht, Abrechnung transparent.",
    providerName: "Sophie Berger",
    categoryId: "household",
    status: "active",
    pricingType: "Gesamt",
    minBudgetInCent: 2000,
    maxBudgetInCent: 4000,
    radius: 8,
    location: { lat: 50.9413, lng: 6.9583, city: "Köln Altstadt-Nord" },
    imageUrl:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800",
  },
  {
    title: "Maler- & Streicharbeiten – sauber und schnell",
    description:
      "Wände, Decken, Türrahmen. Sauberes Abkleben, gleichmäßiger Farbauftrag. Auch kleine Spachtelarbeiten und Tapete entfernen. Material kann mitgebracht oder gestellt werden.",
    providerName: "Daniel Krause",
    categoryId: "handyman",
    status: "active",
    pricingType: "pro Einheit",
    minBudgetInCent: 800,
    maxBudgetInCent: 1500,
    unitName: "qm",
    radius: 15,
    location: { lat: 50.9413, lng: 6.9583, city: "Köln Altstadt-Nord" },
    imageUrl:
      "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800",
  },
  {
    title: "Pflanzen gießen & Briefkasten leeren bei Urlaub",
    description:
      "Während du im Urlaub bist, kümmere ich mich um deine Wohnung: Pflanzen, Briefkasten, kurz lüften. Vertrauenswürdig (Referenzen vorhanden). Schlüsselübergabe persönlich.",
    providerName: "Elena Petrova",
    categoryId: "gardening",
    status: "active",
    pricingType: "Gesamt",
    minBudgetInCent: 4000,
    maxBudgetInCent: 8000,
    radius: 10,
    location: { lat: 50.9189, lng: 6.9581, city: "Köln Bayenthal" },
    imageUrl:
      "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=800",
  },
  {
    title: "Silikonfugen & kleine Badreparaturen",
    description:
      "Schimmlige Silikonfugen raus, neue rein – sauber gezogen. Auch undichte Wasserhähne, lockere WC-Brillen, Dichtungen tauschen. Material auf Wunsch im Festpreis enthalten.",
    providerName: "Andreas Wolf",
    categoryId: "handyman",
    status: "inactive",
    pricingType: "Gesamt",
    minBudgetInCent: 6000,
    maxBudgetInCent: 12000,
    radius: 15,
    location: { lat: 50.9272, lng: 6.9336, city: "Köln Sülz" },
    imageUrl:
      "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800",
  },
]

// ────────────────────────────────────────────────────────────
// Seeding
// ────────────────────────────────────────────────────────────
async function seedServices() {
  console.log(`🌱 Seede ${services.length} Test-Services...\n`)

  const batch = db.batch()
  const servicesRef = db.collection("services")

  for (const [i, s] of services.entries()) {
    const docRef = servicesRef.doc()
    const now = Timestamp.now()

    const serviceDoc: Record<string, unknown> = {
      providerId: `test-provider-${randomInt(1, 5)}`,
      providerName: s.providerName,
      title: s.title,
      description: s.description,
      status: s.status,
      pricingType: s.pricingType,
      minBudgetInCent: s.minBudgetInCent,
      maxBudgetInCent: s.maxBudgetInCent,
      location: new GeoPoint(s.location.lat, s.location.lng),
      radius: s.radius,
      city: s.location.city,
      categoryId: s.categoryId,
      createdAt: now,
      updatedAt: now,
    }

    if (s.unitName) serviceDoc.unitName = s.unitName
    if (s.imageUrl) serviceDoc.imageUrl = s.imageUrl

    batch.set(docRef, serviceDoc)

    const priceLabel =
      s.pricingType === "Gesamt"
        ? `${(s.minBudgetInCent / 100).toFixed(0)}–${(s.maxBudgetInCent / 100).toFixed(0)}€`
        : `${(s.minBudgetInCent / 100).toFixed(0)}–${(s.maxBudgetInCent / 100).toFixed(0)}€ ${s.pricingType}`

    console.log(
      `  ${String(i + 1).padStart(2, " ")}. ${s.title}` +
        `\n      [${s.categoryId}] · ${s.location.city} · ${priceLabel} · ${s.status}`
    )
  }

  await batch.commit()
  console.log(
    `\n✅ Fertig! ${services.length} Services in Firestore geschrieben.`
  )
  process.exit(0)
}

seedServices().catch((err) => {
  console.error("❌ Fehler beim Seeden:", err)
  process.exit(1)
})