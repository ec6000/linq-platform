import { GeoPoint, Timestamp } from "firebase-admin/firestore"
import { CATEGORY_NAME, TAXONOMY, slugify, subcategoryOf } from "./taxonomy"
import { CUSTOMERS, PROVIDERS, personName, requirePerson } from "./people"
import { addressIn, requireDistrict } from "./places"

/**
 * Builds the whole demo graph in memory before anything is written.
 *
 * Every cross-reference is resolved here rather than hand-written, so an order
 * can never point at a provider who does not exist, an accepted booking always
 * has its job, and `offerCount` always equals the number of pending offers.
 * If the data is inconsistent, `assertDatasetIsCoherent` fails before the
 * first document reaches Firestore.
 */

const DAY = 24 * 60 * 60 * 1000
const HOUR = 60 * 60 * 1000

/** Fixed clock for one run, so all relative dates in a dataset agree. */
const NOW = Date.now()
const at = (offsetDays: number, hour = 9) =>
  Timestamp.fromMillis(new Date(NOW + offsetDays * DAY).setHours(hour, 0, 0, 0))
const ago = (days: number) => Timestamp.fromMillis(NOW - days * DAY)

const image = (id: string) => `https://images.unsplash.com/${id}?w=1200&q=80`

type Pricing = { type: "fixed" | "hourly" | "unit"; unitLabel?: string }

export interface SeedDocument {
  id: string
  data: Record<string, unknown>
}

export interface SeedOffer {
  orderId: string
  providerId: string
  data: Record<string, unknown>
}

export interface Dataset {
  categories: SeedDocument[]
  users: SeedDocument[]
  services: SeedDocument[]
  orders: SeedDocument[]
  offers: SeedOffer[]
  bookings: SeedDocument[]
  jobs: SeedDocument[]
}

// ── Categories and users ─────────────────────────────────────────────────────

function buildCategories(): SeedDocument[] {
  return TAXONOMY.map((category, order) => ({
    id: category.id,
    data: {
      nameDE: category.nameDE,
      nameEN: category.nameEN,
      order,
      isActive: true,
      subcategories: category.subcategories.map((entry) => ({
        slug: slugify(entry.nameDE),
        nameDE: entry.nameDE,
        nameEN: entry.nameEN,
      })),
      createdAt: ago(120),
      updatedAt: ago(120),
    },
  }))
}

function buildUsers(): SeedDocument[] {
  return [...PROVIDERS, ...CUSTOMERS].map((person, index) => ({
    id: person.id,
    data: {
      role: person.role,
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email,
      phone: person.phone,
      company: person.company,
      notificationsEnabled: true,
      createdAt: ago(90 - index),
      updatedAt: ago(90 - index),
    },
  }))
}

// ── Services ─────────────────────────────────────────────────────────────────

interface ServiceSpec {
  key: string
  provider: string
  district: string
  addressIndex: number
  title: string
  description: string
  categoryId: string
  subcategory: string
  pricing: Pricing
  minPriceInCent: number
  maxPriceInCent: number
  radiusKm: number
  status: "active" | "paused"
  image?: string
  createdDaysAgo: number
}

const SERVICE_SPECS: ServiceSpec[] = [
  {
    key: "svc-umzug-lehmann",
    provider: "seed-p-lehmann",
    district: "nippes",
    addressIndex: 0,
    title: "Umzugshilfe & Möbeltransport mit eigenem Transporter",
    description:
      "Erfahrener Helfer mit eigenem Sprinter (Ladefläche 3,5 m). Ich packe an, sichere die Ladung und stelle Möbel auf Wunsch am Zielort wieder auf. Decken, Gurte und Sackkarre bringe ich mit.",
    categoryId: "moving",
    subcategory: "Umzugshilfe",
    pricing: { type: "hourly" },
    minPriceInCent: 3500,
    maxPriceInCent: 4500,
    radiusKm: 25,
    status: "active",
    image: image("photo-1600518464441-9154a4dea21b"),
    createdDaysAgo: 64,
  },
  {
    key: "svc-entruempelung-lehmann",
    provider: "seed-p-lehmann",
    district: "nippes",
    addressIndex: 1,
    title: "Entrümpelung von Keller, Dachboden und Garage",
    description:
      "Wir räumen aus, sortieren Verwertbares aus und fahren den Rest zur Entsorgungsstelle. Abrechnung nach Aufwand, Entsorgungsgebühren transparent und getrennt ausgewiesen.",
    categoryId: "moving",
    subcategory: "Entrümpelung",
    pricing: { type: "fixed" },
    minPriceInCent: 18000,
    maxPriceInCent: 45000,
    radiusKm: 30,
    status: "active",
    createdDaysAgo: 51,
  },
  {
    key: "svc-wohnung-yilmaz",
    provider: "seed-p-yilmaz",
    district: "ehrenfeld",
    addressIndex: 0,
    title: "Wohnungsreinigung mit eigenen Öko-Mitteln",
    description:
      "Gründliche Unterhaltsreinigung für Wohnungen bis 120 qm. Bad und Küche sind immer inklusive. Ich arbeite ausschließlich mit biologisch abbaubaren Mitteln und bringe alles selbst mit.",
    categoryId: "cleaning",
    subcategory: "Wohnungsreinigung",
    pricing: { type: "hourly" },
    minPriceInCent: 2600,
    maxPriceInCent: 3200,
    radiusKm: 15,
    status: "active",
    image: image("photo-1581578731548-c64695cc6952"),
    createdDaysAgo: 58,
  },
  {
    key: "svc-fenster-yilmaz",
    provider: "seed-p-yilmaz",
    district: "ehrenfeld",
    addressIndex: 1,
    title: "Fensterreinigung inklusive Rahmen und Fensterbank",
    description:
      "Streifenfreie Reinigung mit entmineralisiertem Wasser. Abrechnung pro Fensterflügel, Dachfenster und Wintergärten nach Absprache.",
    categoryId: "cleaning",
    subcategory: "Fensterreinigung",
    pricing: { type: "unit", unitLabel: "Fenster" },
    minPriceInCent: 600,
    maxPriceInCent: 1200,
    radiusKm: 20,
    status: "active",
    createdDaysAgo: 44,
  },
  {
    key: "svc-endreinigung-yilmaz",
    provider: "seed-p-yilmaz",
    district: "ehrenfeld",
    addressIndex: 2,
    title: "Endreinigung nach Umzug, übergabefertig",
    description:
      "Besenrein reicht dem Vermieter selten. Ich reinige die leere Wohnung inklusive Schränke, Fenster, Heizkörper und Bad, damit die Übergabe ohne Diskussion läuft.",
    categoryId: "cleaning",
    subcategory: "Endreinigung nach Umzug",
    pricing: { type: "fixed" },
    minPriceInCent: 14000,
    maxPriceInCent: 32000,
    radiusKm: 20,
    status: "paused",
    createdDaysAgo: 38,
  },
  {
    key: "svc-moebel-becker",
    provider: "seed-p-becker",
    district: "suelz",
    addressIndex: 0,
    title: "Möbelaufbau IKEA, Maßmöbel und Einbauküchen",
    description:
      "PAX, METOD, BESTÅ und alles, was sonst noch flach geliefert wird. Eigenes Werkzeug, saubere Wandmontage mit passenden Dübeln, Verpackung nehme ich auf Wunsch mit.",
    categoryId: "handyman",
    subcategory: "Möbelaufbau",
    pricing: { type: "hourly" },
    minPriceInCent: 3000,
    maxPriceInCent: 3800,
    radiusKm: 18,
    status: "active",
    image: image("photo-1558997519-83ea9252edf8"),
    createdDaysAgo: 47,
  },
  {
    key: "svc-reparatur-becker",
    provider: "seed-p-becker",
    district: "suelz",
    addressIndex: 1,
    title: "Kleine Reparaturen rund um die Wohnung",
    description:
      "Tropfender Wasserhahn, klemmende Tür, lose Steckdose, quietschendes Scharnier. Einzelne kleine Aufgaben, die nie den Aufwand eines Handwerkerbesuchs wert schienen.",
    categoryId: "handyman",
    subcategory: "Kleine Reparaturen",
    pricing: { type: "hourly" },
    minPriceInCent: 3200,
    maxPriceInCent: 4000,
    radiusKm: 15,
    status: "active",
    createdDaysAgo: 29,
  },
  {
    key: "svc-maler-haddad",
    provider: "seed-p-haddad",
    district: "kalk",
    addressIndex: 0,
    title: "Malerarbeiten: streichen, tapezieren, ausbessern",
    description:
      "Wände und Decken in einem oder mehreren Räumen. Abkleben, Abdecken und Grundierung gehören dazu, Farbe rechne ich zum Einkaufspreis ab.",
    categoryId: "handyman",
    subcategory: "Malerarbeiten",
    pricing: { type: "fixed" },
    minPriceInCent: 22000,
    maxPriceInCent: 68000,
    radiusKm: 25,
    status: "active",
    image: image("photo-1562259949-e8e7689d7828"),
    createdDaysAgo: 41,
  },
  {
    key: "svc-silikon-haddad",
    provider: "seed-p-haddad",
    district: "kalk",
    addressIndex: 1,
    title: "Silikonfugen in Bad und Küche erneuern",
    description:
      "Alte Fugen entfernen, Untergrund reinigen und desinfizieren, neu verfugen. Gegen Schimmel in der Dusche hilft nichts anderes dauerhaft.",
    categoryId: "handyman",
    subcategory: "Silikonfugen erneuern",
    pricing: { type: "unit", unitLabel: "lfd. Meter" },
    minPriceInCent: 1400,
    maxPriceInCent: 2200,
    radiusKm: 22,
    status: "active",
    createdDaysAgo: 22,
  },
  {
    key: "svc-garten-novak",
    provider: "seed-p-novak",
    district: "lindenthal",
    addressIndex: 0,
    title: "Gartenpflege: Rasen, Hecke, Beete",
    description:
      "Regelmäßige Pflege oder einmalige Aktion. Rasen mähen und kanten, Hecke in Form bringen, Beete jäten und mulchen. Grünschnitt entsorge ich mit.",
    categoryId: "gardening",
    subcategory: "Gartenpflege allgemein",
    pricing: { type: "hourly" },
    minPriceInCent: 2800,
    maxPriceInCent: 3600,
    radiusKm: 20,
    status: "active",
    image: image("photo-1416879595882-3373a0480b5b"),
    createdDaysAgo: 35,
  },
  {
    key: "svc-hochdruck-novak",
    provider: "seed-p-novak",
    district: "lindenthal",
    addressIndex: 1,
    title: "Terrasse und Einfahrt mit Hochdruck reinigen",
    description:
      "Moos, Grünbelag und Flechten von Platten, Pflaster und Holzdielen. Eigener Hochdruckreiniger mit Flächenreiniger, kein Spritzwasser an der Hauswand.",
    categoryId: "gardening",
    subcategory: "Hochdruckreinigung",
    pricing: { type: "unit", unitLabel: "qm" },
    minPriceInCent: 350,
    maxPriceInCent: 650,
    radiusKm: 25,
    status: "active",
    createdDaysAgo: 18,
  },
  {
    key: "svc-haushalt-weber",
    provider: "seed-p-weber",
    district: "deutz",
    addressIndex: 0,
    title: "Haushaltshilfe: Einkauf, Wäsche, Ordnung",
    description:
      "Feste Termine pro Woche oder kurzfristige Unterstützung. Einkauf nach Liste, Wäsche waschen und legen, Küche und Bad in Ordnung halten.",
    categoryId: "household",
    subcategory: "Hilfe bei Erledigungen",
    pricing: { type: "hourly" },
    minPriceInCent: 2200,
    maxPriceInCent: 2800,
    radiusKm: 12,
    status: "active",
    createdDaysAgo: 26,
  },
  {
    key: "svc-senioren-weber",
    provider: "seed-p-weber",
    district: "deutz",
    addressIndex: 1,
    title: "Alltagsbegleitung für Seniorinnen und Senioren",
    description:
      "Begleitung zu Arztterminen, Hilfe bei Formularen, gemeinsamer Einkauf, ein Gespräch. Ruhig, geduldig und zuverlässig zur vereinbarten Zeit.",
    categoryId: "household",
    subcategory: "Seniorenhilfe im Alltag",
    pricing: { type: "hourly" },
    minPriceInCent: 2400,
    maxPriceInCent: 3000,
    radiusKm: 15,
    status: "active",
    createdDaysAgo: 12,
  },
  {
    key: "svc-auto-weber",
    provider: "seed-p-weber",
    district: "deutz",
    addressIndex: 2,
    title: "Autoaufbereitung innen und außen",
    description:
      "Handwäsche, Felgen, Innenraum saugen, Armaturen pflegen, Scheiben innen. Für Leasingrückgaben zusätzlich Polster- und Lederreinigung.",
    categoryId: "automotive",
    subcategory: "Fahrzeugpflege",
    pricing: { type: "fixed" },
    minPriceInCent: 7900,
    maxPriceInCent: 16900,
    radiusKm: 20,
    status: "active",
    createdDaysAgo: 8,
  },
  {
    key: "svc-technik-becker",
    provider: "seed-p-becker",
    district: "suelz",
    addressIndex: 2,
    title: "Hilfe bei Technik, Computer und Smartphone",
    description:
      "Neues Gerät einrichten, Daten übertragen, WLAN und Drucker zum Laufen bringen, Backups erklären. Ich zeige es so, dass es beim nächsten Mal allein klappt.",
    categoryId: "other",
    subcategory: "Hilfe bei Technik",
    pricing: { type: "hourly" },
    minPriceInCent: 3500,
    maxPriceInCent: 4500,
    radiusKm: 18,
    status: "active",
    createdDaysAgo: 5,
  },
]

function buildServices(): SeedDocument[] {
  return SERVICE_SPECS.map((spec) => {
    const provider = requirePerson(spec.provider)
    const district = requireDistrict(spec.district)
    const { address, city } = addressIn(spec.district, spec.addressIndex)
    const subcategory = subcategoryOf(spec.categoryId, spec.subcategory)
    const created = ago(spec.createdDaysAgo)

    return {
      id: spec.key,
      data: {
        providerId: provider.id,
        providerName: personName(provider),
        title: spec.title,
        description: spec.description,
        ...(spec.image ? { imageUrl: spec.image } : {}),
        status: spec.status,
        pricing: spec.pricing,
        minPriceInCent: spec.minPriceInCent,
        maxPriceInCent: spec.maxPriceInCent,
        place: { geo: new GeoPoint(district.lat, district.lon), address, city },
        radiusKm: spec.radiusKm,
        categoryId: spec.categoryId,
        categoryName: CATEGORY_NAME.get(spec.categoryId),
        subcategoryId: subcategory.id,
        subcategoryName: subcategory.name,
        createdAt: created,
        updatedAt: created,
      },
    }
  })
}

// ── Orders, offers and the jobs they produce ─────────────────────────────────

interface OfferSpec {
  provider: string
  priceInCent: number
  message: string
  daysAgo: number
  /** Exactly one accepted offer turns its order into an assigned order plus a job. */
  accepted?: boolean
  declined?: boolean
}

interface OrderSpec {
  key: string
  customer: string
  district: string
  addressIndex: number
  title: string
  description: string
  categoryId: string
  subcategory: string
  budgetInCent: number
  radiusKm: number
  priority: "low" | "normal" | "high" | "urgent"
  startInDays: number
  durationHours: number
  isFlexible: boolean
  createdDaysAgo: number
  imageUrls?: string[]
  offers?: OfferSpec[]
  /** Terminal orders carry no open bidding. */
  outcome?: "completed" | "cancelled"
}

const ORDER_SPECS: OrderSpec[] = [
  {
    key: "ord-umzug-suelz",
    customer: "seed-c-schmidt",
    district: "suelz",
    addressIndex: 0,
    title: "Umzug 2-Zimmer-Wohnung, zwei Helfer gesucht",
    description:
      "Samstagvormittag ziehe ich von Sülz nach Ehrenfeld, etwa 2,5 km. Dritter Stock ohne Aufzug, neue Wohnung erster Stock. Kartons sind gepackt, es geht um Schrank, Bett, Sofa, Waschmaschine und rund 25 Kartons. Transporter ist gemietet.",
    categoryId: "moving",
    subcategory: "Umzugshilfe",
    budgetInCent: 18000,
    radiusKm: 15,
    priority: "high",
    startInDays: 6,
    durationHours: 4,
    isFlexible: false,
    createdDaysAgo: 3,
    imageUrls: [image("photo-1600518464441-9154a4dea21b")],
    offers: [
      { provider: "seed-p-lehmann", priceInCent: 17000, message: "Samstag ab 9 Uhr frei, komme mit Kollege und Sackkarre.", daysAgo: 2 },
      { provider: "seed-p-becker", priceInCent: 19500, message: "Kann ab 10 Uhr, bringe Spanngurte und Decken mit.", daysAgo: 2 },
      { provider: "seed-p-haddad", priceInCent: 15500, message: "Zu zweit, wir schaffen das in etwa vier Stunden.", daysAgo: 1 },
    ],
  },
  {
    key: "ord-fenster-lindenthal",
    customer: "seed-c-koch",
    district: "lindenthal",
    addressIndex: 0,
    title: "Fensterreinigung Reihenhaus, 14 Fenster",
    description:
      "Einfamilienhaus mit 14 Fenstern auf zwei Etagen, dazu zwei Dachfenster und eine Terrassentür. Außen ist alles gut mit der Leiter erreichbar. Gern ein fester Termin alle drei Monate.",
    categoryId: "cleaning",
    subcategory: "Fensterreinigung",
    budgetInCent: 12000,
    radiusKm: 20,
    priority: "normal",
    startInDays: 9,
    durationHours: 3,
    isFlexible: true,
    createdDaysAgo: 5,
    offers: [
      { provider: "seed-p-yilmaz", priceInCent: 11000, message: "Mit entmineralisiertem Wasser, streifenfrei. Dachfenster inklusive.", daysAgo: 4 },
      { provider: "seed-p-weber", priceInCent: 12500, message: "Kann kommende Woche Dienstag oder Donnerstag.", daysAgo: 3 },
    ],
  },
  {
    key: "ord-hecke-rodenkirchen",
    customer: "seed-c-richter",
    district: "rodenkirchen",
    addressIndex: 0,
    title: "Hecke schneiden, etwa 18 Meter Liguster",
    description:
      "Die Hecke ist rund 2,20 m hoch und seit zwei Jahren nicht geschnitten. Sie soll auf etwa 1,80 m zurück und seitlich in Form. Grünschnitt bitte mitnehmen, Zugang über die Einfahrt.",
    categoryId: "gardening",
    subcategory: "Hecke schneiden",
    budgetInCent: 26000,
    radiusKm: 25,
    priority: "normal",
    startInDays: 12,
    durationHours: 5,
    isFlexible: true,
    createdDaysAgo: 7,
    imageUrls: [image("photo-1416879595882-3373a0480b5b")],
    offers: [
      { provider: "seed-p-novak", priceInCent: 24000, message: "Mit Teleskopschere und Häcksler, Abfuhr ist drin.", daysAgo: 6 },
    ],
  },
  {
    key: "ord-kueche-nippes",
    customer: "seed-c-aydin",
    district: "nippes",
    addressIndex: 2,
    title: "Einbauküche abbauen und entsorgen",
    description:
      "Alte Einbauküche aus den Neunzigern, etwa 3,20 m Zeile mit Hängeschränken. Geräte sind bereits abgeklemmt. Alles soll raus und fachgerecht entsorgt werden.",
    categoryId: "moving",
    subcategory: "Küchen- oder Möbelabbau",
    budgetInCent: 34000,
    radiusKm: 20,
    priority: "normal",
    startInDays: 4,
    durationHours: 6,
    isFlexible: false,
    createdDaysAgo: 11,
    offers: [
      { provider: "seed-p-lehmann", priceInCent: 32000, message: "Abbau und Abfuhr am selben Tag, Entsorgung inklusive.", daysAgo: 10, accepted: true },
      { provider: "seed-p-haddad", priceInCent: 36000, message: "Könnte Donnerstag, inklusive Entsorgungsnachweis.", daysAgo: 9 },
    ],
  },
  {
    key: "ord-streichen-ehrenfeld",
    customer: "seed-c-fischer",
    district: "ehrenfeld",
    addressIndex: 1,
    title: "Schlafzimmer streichen, 16 qm",
    description:
      "Ein Raum, Wände und Decke. Aktuell kräftiges Blau, soll hell und neutral werden, also vermutlich zweimal deckend. Möbel räume ich vorher raus.",
    categoryId: "handyman",
    subcategory: "Malerarbeiten",
    budgetInCent: 28000,
    radiusKm: 15,
    priority: "low",
    startInDays: 18,
    durationHours: 6,
    isFlexible: true,
    createdDaysAgo: 2,
    offers: [
      { provider: "seed-p-haddad", priceInCent: 26500, message: "Grundierung gegen das Blau ist eingerechnet.", daysAgo: 1 },
      { provider: "seed-p-becker", priceInCent: 29000, message: "Zwei Tage à halber Tag, Farbe nach Absprache.", daysAgo: 1 },
    ],
  },
  {
    key: "ord-pax-bayenthal",
    customer: "seed-c-bauer",
    district: "bayenthal",
    addressIndex: 0,
    title: "IKEA PAX Kleiderschrank aufbauen, 3 Elemente",
    description:
      "PAX mit drei Elementen und Schiebetüren, dazu Innenausstattung mit Schubladen. Teile liegen seit zwei Wochen im Flur. Wandbefestigung ist wichtig, Altbau mit Gipswand.",
    categoryId: "handyman",
    subcategory: "Möbelaufbau",
    budgetInCent: 15000,
    radiusKm: 15,
    priority: "urgent",
    startInDays: 2,
    durationHours: 4,
    isFlexible: false,
    createdDaysAgo: 14,
    offers: [
      { provider: "seed-p-becker", priceInCent: 14000, message: "PAX mit Schiebetüren mache ich regelmäßig, passende Dübel bringe ich mit.", daysAgo: 13, accepted: true },
    ],
  },
  {
    key: "ord-terrasse-porz",
    customer: "seed-c-koch",
    district: "porz",
    addressIndex: 0,
    title: "Terrassenplatten reinigen, circa 40 qm",
    description:
      "Betonplatten mit deutlichem Grünbelag nach dem Winter. Wasseranschluss und Strom sind auf der Terrasse vorhanden.",
    categoryId: "gardening",
    subcategory: "Hochdruckreinigung",
    budgetInCent: 20000,
    radiusKm: 30,
    priority: "normal",
    startInDays: 15,
    durationHours: 4,
    isFlexible: true,
    createdDaysAgo: 1,
  },
  {
    key: "ord-einkauf-muelheim",
    customer: "seed-c-richter",
    district: "muelheim",
    addressIndex: 0,
    title: "Wöchentlicher Einkauf für meine Mutter",
    description:
      "Meine Mutter wohnt in Mülheim und kommt nach einer Operation gerade schlecht aus dem Haus. Einmal pro Woche Einkauf nach Liste und Sachen in die Küche stellen.",
    categoryId: "household",
    subcategory: "Hilfe bei Erledigungen",
    budgetInCent: 6000,
    radiusKm: 10,
    priority: "high",
    startInDays: 3,
    durationHours: 2,
    isFlexible: true,
    createdDaysAgo: 4,
    offers: [
      { provider: "seed-p-weber", priceInCent: 5500, message: "Mache ich gern, jeden Mittwoch vormittags.", daysAgo: 3 },
      { provider: "seed-p-yilmaz", priceInCent: 6000, message: "Dienstags oder freitags möglich.", daysAgo: 2, declined: true },
    ],
  },
  {
    key: "ord-keller-kalk",
    customer: "seed-c-fischer",
    district: "kalk",
    addressIndex: 2,
    title: "Keller ausräumen und Sperrmüll rausbringen",
    description:
      "Kellerabteil im Mehrfamilienhaus, etwa 8 qm, voll mit alten Möbeln und Kartons. Alles kann weg, Sperrmüllabholung ist angemeldet.",
    categoryId: "moving",
    subcategory: "Keller ausräumen",
    budgetInCent: 22000,
    radiusKm: 20,
    priority: "normal",
    startInDays: -9,
    durationHours: 4,
    isFlexible: false,
    createdDaysAgo: 30,
    outcome: "completed",
    offers: [
      { provider: "seed-p-lehmann", priceInCent: 21000, message: "Mit Transporter, zwei Fahrten sollten reichen.", daysAgo: 29, accepted: true },
    ],
  },
  {
    key: "ord-nachhilfe-innenstadt",
    customer: "seed-c-bauer",
    district: "innenstadt",
    addressIndex: 1,
    title: "Nachhilfe Mathematik, 9. Klasse",
    description:
      "Mein Sohn braucht Unterstützung in Algebra, zweimal pro Woche für je 90 Minuten. Gern bei uns zu Hause in der Innenstadt.",
    categoryId: "other",
    subcategory: "Nachhilfe",
    budgetInCent: 4500,
    radiusKm: 8,
    priority: "normal",
    startInDays: -20,
    durationHours: 2,
    isFlexible: true,
    createdDaysAgo: 25,
    outcome: "cancelled",
    offers: [
      {
        provider: "seed-p-becker",
        priceInCent: 4200,
        message: "Zweimal pro Woche 90 Minuten, Algebra ist mein Schwerpunkt.",
        daysAgo: 24,
        accepted: true,
      },
    ],
  },
]

interface OrderBuildResult {
  orders: SeedDocument[]
  offers: SeedOffer[]
  jobs: SeedDocument[]
}

function buildOrders(): OrderBuildResult {
  const orders: SeedDocument[] = []
  const offers: SeedOffer[] = []
  const jobs: SeedDocument[] = []

  for (const spec of ORDER_SPECS) {
    const customer = requirePerson(spec.customer)
    const district = requireDistrict(spec.district)
    const { address, city } = addressIn(spec.district, spec.addressIndex)
    const subcategory = subcategoryOf(spec.categoryId, spec.subcategory)
    const created = ago(spec.createdDaysAgo)
    const start = at(spec.startInDays)
    const end = Timestamp.fromMillis(start.toMillis() + spec.durationHours * HOUR)

    const specOffers = spec.offers ?? []
    const accepted = specOffers.find((offer) => offer.accepted)
    const pendingCount = specOffers.filter((offer) => !offer.accepted && !offer.declined).length

    const status = spec.outcome ?? (accepted ? "assigned" : "open")
    const acceptedProvider = accepted ? requirePerson(accepted.provider) : null

    orders.push({
      id: spec.key,
      data: {
        customerId: customer.id,
        customerName: personName(customer),
        title: spec.title,
        description: spec.description,
        status,
        priority: spec.priority,
        timeWindow: { start, end, isFlexible: spec.isFlexible },
        budgetInCent: spec.budgetInCent,
        place: { geo: new GeoPoint(district.lat, district.lon), address, city },
        radiusKm: spec.radiusKm,
        categoryId: spec.categoryId,
        categoryName: CATEGORY_NAME.get(spec.categoryId),
        subcategoryId: subcategory.id,
        subcategoryName: subcategory.name,
        imageUrls: spec.imageUrls ?? [],
        // Bidding closes the moment an offer is accepted.
        offerCount: status === "open" ? pendingCount : 0,
        ...(acceptedProvider
          ? {
              assignedProviderId: acceptedProvider.id,
              assignedProviderName: personName(acceptedProvider),
              assignedAt: ago(accepted!.daysAgo),
            }
          : {}),
        ...(spec.outcome === "completed" ? { completedAt: ago(9) } : {}),
        ...(spec.outcome === "cancelled" ? { cancelledAt: ago(20) } : {}),
        createdAt: created,
        updatedAt: created,
      },
    })

    for (const offer of specOffers) {
      const provider = requirePerson(offer.provider)
      const offerStatus = offer.accepted ? "accepted" : offer.declined ? "declined" : "pending"
      offers.push({
        orderId: spec.key,
        providerId: provider.id,
        data: {
          orderId: spec.key,
          orderTitle: spec.title,
          providerId: provider.id,
          providerName: personName(provider),
          priceInCent: offer.priceInCent,
          message: offer.message,
          status: offerStatus,
          ...(offerStatus === "pending" ? {} : { decidedAt: ago(offer.daysAgo) }),
          ...(offer.declined ? { customerComment: "Danke, ein anderes Angebot passte zeitlich besser." } : {}),
          createdAt: ago(offer.daysAgo),
          updatedAt: ago(offer.daysAgo),
        },
      })
    }

    // An accepted offer always produced a job. Its state follows the order's.
    if (accepted && acceptedProvider) {
      const jobStatus =
        spec.outcome === "completed" ? "completed" : spec.outcome === "cancelled" ? "cancelled" : "scheduled"
      jobs.push({
        id: `job-${spec.key}`,
        data: {
          sourceType: "order",
          sourceId: spec.key,
          customerId: customer.id,
          customerName: personName(customer),
          providerId: acceptedProvider.id,
          providerName: personName(acceptedProvider),
          title: spec.title,
          description: spec.description,
          categoryId: spec.categoryId,
          categoryName: CATEGORY_NAME.get(spec.categoryId),
          subcategoryId: subcategory.id,
          subcategoryName: subcategory.name,
          pricing: { type: "fixed" },
          priceInCent: accepted.priceInCent,
          place: { geo: new GeoPoint(district.lat, district.lon), address, city },
          scheduledAt: start,
          status: jobStatus,
          ...(jobStatus === "completed" ? { startedAt: ago(10), completedAt: ago(9) } : {}),
          createdAt: ago(accepted.daysAgo),
          updatedAt: ago(accepted.daysAgo),
        },
      })
    }
  }

  return { orders, offers, jobs }
}

// ── Bookings and the jobs they produce ───────────────────────────────────────

interface BookingSpec {
  key: string
  service: string
  customer: string
  district: string
  addressIndex: number
  message: string
  requestedDateText: string
  priceInCent?: number
  daysAgo: number
  status: "requested" | "accepted" | "declined" | "cancelled"
  declineMessage?: string
  /** Only for accepted bookings: how the resulting job is doing. */
  jobStatus?: "scheduled" | "inProgress" | "completed"
  scheduledInDays?: number
}

const BOOKING_SPECS: BookingSpec[] = [
  {
    key: "bkg-umzug-schmidt",
    service: "svc-umzug-lehmann",
    customer: "seed-c-schmidt",
    district: "suelz",
    addressIndex: 1,
    message:
      "Hallo Markus, ich ziehe am Samstag von Sülz nach Ehrenfeld. Dritter Stock ohne Aufzug. Wärst du ab 9 Uhr für etwa vier Stunden verfügbar?",
    requestedDateText: "Samstag, 09:00 Uhr",
    priceInCent: 4000,
    daysAgo: 2,
    status: "requested",
  },
  {
    key: "bkg-reinigung-koch",
    service: "svc-wohnung-yilmaz",
    customer: "seed-c-koch",
    district: "lindenthal",
    addressIndex: 1,
    message:
      "Guten Tag, wir suchen jemanden für eine 95-qm-Wohnung, alle zwei Wochen. Bad und Küche sind uns am wichtigsten. Wäre Freitag vormittags möglich?",
    requestedDateText: "Freitags vormittags, alle zwei Wochen",
    priceInCent: 2900,
    daysAgo: 6,
    status: "accepted",
    jobStatus: "inProgress",
    scheduledInDays: -1,
  },
  {
    key: "bkg-moebel-aydin",
    service: "svc-moebel-becker",
    customer: "seed-c-aydin",
    district: "nippes",
    addressIndex: 0,
    message:
      "Hi, ich habe eine METOD-Küchenzeile von 2,40 m zu montieren, Unterschränke und Hängeschränke. Arbeitsplatte ist zugeschnitten. Wie lange brauchst du ungefähr?",
    requestedDateText: "Nächste Woche, flexibel",
    priceInCent: 3400,
    daysAgo: 12,
    status: "accepted",
    jobStatus: "completed",
    scheduledInDays: -7,
  },
  {
    key: "bkg-garten-richter",
    service: "svc-garten-novak",
    customer: "seed-c-richter",
    district: "rodenkirchen",
    addressIndex: 1,
    message:
      "Hallo Frau Novak, unser Garten ist etwa 200 qm und braucht nach dem Winter einmal alles: Rasen, Beete, Hecke. Danach gern regelmäßig alle drei Wochen.",
    requestedDateText: "Nächsten Samstag oder Sonntag",
    priceInCent: 3200,
    daysAgo: 9,
    status: "accepted",
    jobStatus: "scheduled",
    scheduledInDays: 5,
  },
  {
    key: "bkg-auto-fischer",
    service: "svc-auto-weber",
    customer: "seed-c-fischer",
    district: "ehrenfeld",
    addressIndex: 2,
    message:
      "Leasingrückgabe in drei Wochen, Kombi mit heller Stoffpolsterung und zwei Kindersitzen. Was kostet die komplette Aufbereitung?",
    requestedDateText: "In den nächsten zwei Wochen",
    daysAgo: 4,
    status: "requested",
  },
  {
    key: "bkg-silikon-bauer",
    service: "svc-silikon-haddad",
    customer: "seed-c-bauer",
    district: "bayenthal",
    addressIndex: 2,
    message:
      "In der Dusche sind die Fugen schwarz, insgesamt etwa 6 laufende Meter inklusive Wanne. Können Sie das kurzfristig machen?",
    requestedDateText: "So bald wie möglich",
    priceInCent: 1800,
    daysAgo: 8,
    status: "declined",
    declineMessage: "Diese Woche bin ich ausgebucht. Ab dem 20. hätte ich wieder Termine frei.",
  },
  {
    key: "bkg-senioren-koch",
    service: "svc-senioren-weber",
    customer: "seed-c-koch",
    district: "muelheim",
    addressIndex: 1,
    message:
      "Für meinen Vater, 81, zweimal pro Woche Begleitung zum Einkauf und gelegentlich zu Arztterminen in Mülheim.",
    requestedDateText: "Dienstags und donnerstags",
    priceInCent: 2600,
    daysAgo: 16,
    status: "cancelled",
  },
]

function buildBookings(services: SeedDocument[]): { bookings: SeedDocument[]; jobs: SeedDocument[] } {
  const serviceById = new Map(services.map((service) => [service.id, service.data]))
  const bookings: SeedDocument[] = []
  const jobs: SeedDocument[] = []

  for (const spec of BOOKING_SPECS) {
    const service = serviceById.get(spec.service)
    if (!service) throw new Error(`Buchung "${spec.key}" verweist auf unbekannten Service "${spec.service}".`)

    const customer = requirePerson(spec.customer)
    const district = requireDistrict(spec.district)
    const { address, city } = addressIn(spec.district, spec.addressIndex)
    const created = ago(spec.daysAgo)
    const place = { geo: new GeoPoint(district.lat, district.lon), address, city }
    const jobId = spec.status === "accepted" ? `job-${spec.key}` : undefined

    bookings.push({
      id: spec.key,
      data: {
        serviceId: spec.service,
        serviceTitle: service.title,
        customerId: customer.id,
        customerName: personName(customer),
        providerId: service.providerId,
        providerName: service.providerName,
        categoryId: service.categoryId,
        categoryName: service.categoryName,
        pricing: service.pricing,
        ...(spec.priceInCent !== undefined ? { priceInCent: spec.priceInCent } : {}),
        message: spec.message,
        requestedDateText: spec.requestedDateText,
        place,
        status: spec.status,
        ...(jobId ? { jobId, acceptedAt: ago(spec.daysAgo - 1) } : {}),
        ...(spec.status === "declined"
          ? { declineMessage: spec.declineMessage ?? "", declinedAt: ago(spec.daysAgo - 1) }
          : {}),
        ...(spec.status === "cancelled" ? { cancelledAt: ago(spec.daysAgo - 2) } : {}),
        createdAt: created,
        updatedAt: created,
      },
    })

    if (!jobId) continue

    const scheduledAt = at(spec.scheduledInDays ?? 3)
    const jobStatus = spec.jobStatus ?? "scheduled"
    jobs.push({
      id: jobId,
      data: {
        sourceType: "booking",
        sourceId: spec.key,
        customerId: customer.id,
        customerName: personName(customer),
        providerId: service.providerId,
        providerName: service.providerName,
        title: service.title,
        description: spec.message,
        categoryId: service.categoryId,
        categoryName: service.categoryName,
        subcategoryId: service.subcategoryId,
        subcategoryName: service.subcategoryName,
        pricing: service.pricing,
        priceInCent: spec.priceInCent ?? service.minPriceInCent,
        place,
        scheduledAt,
        status: jobStatus,
        ...(jobStatus === "inProgress" ? { startedAt: ago(1) } : {}),
        ...(jobStatus === "completed" ? { startedAt: ago(8), completedAt: ago(7) } : {}),
        createdAt: ago(spec.daysAgo - 1),
        updatedAt: ago(spec.daysAgo - 1),
      },
    })
  }

  return { bookings, jobs }
}

// ── Assembly and self-check ──────────────────────────────────────────────────

export function buildDataset(): Dataset {
  const services = buildServices()
  const fromOrders = buildOrders()
  const fromBookings = buildBookings(services)

  return {
    categories: buildCategories(),
    users: buildUsers(),
    services,
    orders: fromOrders.orders,
    offers: fromOrders.offers,
    bookings: fromBookings.bookings,
    jobs: [...fromOrders.jobs, ...fromBookings.jobs],
  }
}

/**
 * Refuses to write a dataset that contradicts itself.
 *
 * This is the guard the old per-collection seed scripts never had: they wrote
 * hard-coded numeric IDs independently, so a booking could name a provider who
 * did not own the service it referenced.
 */
export function assertDatasetIsCoherent(dataset: Dataset) {
  const problems: string[] = []
  const userIds = new Set(dataset.users.map((user) => user.id))
  const categoryIds = new Set(dataset.categories.map((category) => category.id))
  const serviceIds = new Set(dataset.services.map((service) => service.id))
  const orderIds = new Set(dataset.orders.map((order) => order.id))
  const bookingIds = new Set(dataset.bookings.map((booking) => booking.id))

  const role = new Map(dataset.users.map((user) => [user.id, user.data.role as string]))
  const expect = (condition: boolean, message: string) => {
    if (!condition) problems.push(message)
  }

  for (const service of dataset.services) {
    const providerId = service.data.providerId as string
    expect(userIds.has(providerId), `Service ${service.id}: Anbieter ${providerId} existiert nicht.`)
    expect(role.get(providerId) === "provider", `Service ${service.id}: ${providerId} ist kein Anbieter.`)
    expect(categoryIds.has(service.data.categoryId as string), `Service ${service.id}: unbekannte Kategorie.`)
    expect(
      (service.data.maxPriceInCent as number) >= (service.data.minPriceInCent as number),
      `Service ${service.id}: Höchstpreis liegt unter dem Mindestpreis.`,
    )
  }

  const pendingByOrder = new Map<string, number>()
  const acceptedByOrder = new Map<string, string>()
  for (const offer of dataset.offers) {
    expect(orderIds.has(offer.orderId), `Angebot auf ${offer.orderId}: Auftrag existiert nicht.`)
    expect(userIds.has(offer.providerId), `Angebot auf ${offer.orderId}: Anbieter existiert nicht.`)
    const status = offer.data.status as string
    if (status === "pending") pendingByOrder.set(offer.orderId, (pendingByOrder.get(offer.orderId) ?? 0) + 1)
    if (status === "accepted") {
      expect(
        !acceptedByOrder.has(offer.orderId),
        `Auftrag ${offer.orderId}: mehr als ein angenommenes Angebot.`,
      )
      acceptedByOrder.set(offer.orderId, offer.providerId)
    }
  }

  for (const order of dataset.orders) {
    const customerId = order.data.customerId as string
    expect(userIds.has(customerId), `Auftrag ${order.id}: Kunde ${customerId} existiert nicht.`)
    expect(role.get(customerId) === "customer", `Auftrag ${order.id}: ${customerId} ist kein Kunde.`)
    expect(categoryIds.has(order.data.categoryId as string), `Auftrag ${order.id}: unbekannte Kategorie.`)

    const status = order.data.status as string
    const expectedCount = status === "open" ? (pendingByOrder.get(order.id) ?? 0) : 0
    expect(
      order.data.offerCount === expectedCount,
      `Auftrag ${order.id}: offerCount ist ${order.data.offerCount}, erwartet ${expectedCount}.`,
    )

    const assignedTo = order.data.assignedProviderId as string | undefined
    const acceptedProvider = acceptedByOrder.get(order.id)
    expect(
      assignedTo === acceptedProvider,
      `Auftrag ${order.id}: assignedProviderId (${assignedTo}) passt nicht zum angenommenen Angebot (${acceptedProvider}).`,
    )
    const needsAssignee = status === "assigned" || status === "inProgress" || status === "completed"
    if (status === "open") {
      expect(!assignedTo, `Auftrag ${order.id}: offener Auftrag hat bereits einen Anbieter.`)
    } else if (needsAssignee) {
      expect(Boolean(assignedTo), `Auftrag ${order.id}: Status "${status}" ohne zugeordneten Anbieter.`)
    }
  }

  for (const booking of dataset.bookings) {
    const service = dataset.services.find((entry) => entry.id === booking.data.serviceId)
    expect(Boolean(service), `Buchung ${booking.id}: Service existiert nicht.`)
    expect(
      !service || booking.data.providerId === service.data.providerId,
      `Buchung ${booking.id}: Anbieter weicht vom Anbieter des Service ab.`,
    )
    expect(
      booking.data.customerId !== booking.data.providerId,
      `Buchung ${booking.id}: Kunde und Anbieter sind identisch.`,
    )
    expect(
      (booking.data.status === "accepted") === Boolean(booking.data.jobId),
      `Buchung ${booking.id}: jobId und Status widersprechen sich.`,
    )
  }

  const jobIds = new Set<string>()
  for (const job of dataset.jobs) {
    expect(!jobIds.has(job.id), `Job ${job.id}: doppelte ID.`)
    jobIds.add(job.id)
    expect(userIds.has(job.data.customerId as string), `Job ${job.id}: Kunde existiert nicht.`)
    expect(userIds.has(job.data.providerId as string), `Job ${job.id}: Anbieter existiert nicht.`)
    const sourceId = job.data.sourceId as string
    const known = job.data.sourceType === "order" ? orderIds.has(sourceId) : bookingIds.has(sourceId)
    expect(known, `Job ${job.id}: Quelle ${job.data.sourceType}/${sourceId} existiert nicht.`)
    expect(serviceIds.size > 0, "Keine Services im Datensatz.")
  }

  for (const booking of dataset.bookings) {
    const jobId = booking.data.jobId as string | undefined
    if (jobId) expect(jobIds.has(jobId), `Buchung ${booking.id}: verweist auf fehlenden Job ${jobId}.`)
  }

  if (problems.length > 0) {
    throw new Error(`Der Seed-Datensatz ist nicht konsistent:\n  - ${problems.join("\n  - ")}`)
  }
}
