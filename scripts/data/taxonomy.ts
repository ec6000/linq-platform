/**
 * The service taxonomy.
 *
 * Subcategory slugs are derived from the German name, so the source of truth
 * stays readable and the IDs stay stable as long as the wording does.
 */

export interface CategorySeed {
  id: string
  nameDE: string
  nameEN: string
  subcategories: Array<{ nameDE: string; nameEN: string }>
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/&/g, "und")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

const sub = (nameDE: string, nameEN: string) => ({ nameDE, nameEN })

export const TAXONOMY: CategorySeed[] = [
  {
    id: "cleaning",
    nameDE: "Reinigung",
    nameEN: "Cleaning",
    subcategories: [
      sub("Wohnungsreinigung", "Apartment cleaning"),
      sub("Hausreinigung", "House cleaning"),
      sub("Grundreinigung", "Deep cleaning"),
      sub("Fensterreinigung", "Window cleaning"),
      sub("Treppenhausreinigung", "Stairwell cleaning"),
      sub("Büroreinigung", "Office cleaning"),
      sub("Endreinigung nach Umzug", "Move-out cleaning"),
      sub("Teppichreinigung", "Carpet cleaning"),
      sub("Polsterreinigung", "Upholstery cleaning"),
      sub("Sonstige Reinigung", "Other cleaning"),
    ],
  },
  {
    id: "moving",
    nameDE: "Umzug & Transport",
    nameEN: "Moving",
    subcategories: [
      sub("Umzugshilfe", "Moving help"),
      sub("Möbel tragen", "Furniture carrying"),
      sub("Möbeltransport", "Furniture transport"),
      sub("Kleintransport", "Small transport"),
      sub("Entrümpelung", "Clearance"),
      sub("Sperrmüll rausbringen", "Bulky waste removal"),
      sub("Keller ausräumen", "Basement clearing"),
      sub("Küchen- oder Möbelabbau", "Furniture disassembly"),
      sub("Sonstiger Transport", "Other transport"),
    ],
  },
  {
    id: "handyman",
    nameDE: "Handwerk",
    nameEN: "Handyman",
    subcategories: [
      sub("Möbelaufbau", "Furniture assembly"),
      sub("Kleine Reparaturen", "Small repairs"),
      sub("Bohren & Montieren", "Drilling and mounting"),
      sub("Lampen anbringen", "Light fitting"),
      sub("Regale anbringen", "Shelf mounting"),
      sub("Malerarbeiten", "Painting"),
      sub("Silikonfugen erneuern", "Silicone joint renewal"),
      sub("Tür- & Schrankreparaturen", "Door and cabinet repairs"),
      sub("Sonstige Handwerksarbeiten", "Other handyman work"),
    ],
  },
  {
    id: "gardening",
    nameDE: "Garten & Außenbereich",
    nameEN: "Gardening",
    subcategories: [
      sub("Rasen mähen", "Lawn mowing"),
      sub("Hecke schneiden", "Hedge trimming"),
      sub("Unkraut entfernen", "Weeding"),
      sub("Laub entfernen", "Leaf removal"),
      sub("Gartenpflege allgemein", "General garden care"),
      sub("Terrasse reinigen", "Patio cleaning"),
      sub("Hochdruckreinigung", "Pressure washing"),
      sub("Gießen bei Abwesenheit", "Plant watering"),
      sub("Winterdienst", "Winter service"),
      sub("Sonstige Gartenarbeit", "Other garden work"),
    ],
  },
  {
    id: "household",
    nameDE: "Haushaltshilfe",
    nameEN: "Household",
    subcategories: [
      sub("Einkaufen", "Grocery shopping"),
      sub("Wäsche waschen", "Laundry"),
      sub("Wäsche bügeln", "Ironing"),
      sub("Aufräumen", "Tidying up"),
      sub("Haustierbetreuung", "Pet sitting"),
      sub("Pflanzen gießen", "Plant care"),
      sub("Seniorenhilfe im Alltag", "Senior daily help"),
      sub("Hilfe bei Erledigungen", "Errand help"),
      sub("Sonstige Haushaltshilfe", "Other household help"),
    ],
  },
  {
    id: "automotive",
    nameDE: "Auto & Fahrzeugpflege",
    nameEN: "Automotive",
    subcategories: [
      sub("Autowäsche außen", "Exterior car wash"),
      sub("Autoreinigung innen", "Interior car cleaning"),
      sub("Innenraum-Tiefenreinigung", "Interior deep clean"),
      sub("Polsterreinigung Auto", "Car upholstery cleaning"),
      sub("Felgenreinigung", "Wheel cleaning"),
      sub("Fahrzeugpflege", "Vehicle care"),
      sub("Fahrradreinigung", "Bicycle cleaning"),
      sub("Sonstige Fahrzeugreinigung", "Other vehicle cleaning"),
    ],
  },
  {
    id: "other",
    nameDE: "Sonstiges",
    nameEN: "Other",
    subcategories: [
      sub("Eventhilfe", "Event help"),
      sub("Aufbauhilfe", "Setup help"),
      sub("Botengänge", "Errands"),
      sub("Hilfe bei Technik", "Tech help"),
      sub("Computerhilfe", "Computer help"),
      sub("Nachhilfe", "Tutoring"),
      sub("Unterstützung bei Formularen", "Paperwork help"),
      sub("Begleitung zu Terminen", "Appointment companion"),
      sub("Sonstige Hilfe", "Other help"),
    ],
  },
]

/** Category name by ID, for the denormalised `categoryName` fields. */
export const CATEGORY_NAME = new Map(TAXONOMY.map((category) => [category.id, category.nameDE]))

/** Looks up a subcategory by its German name and returns slug plus name. */
export function subcategoryOf(categoryId: string, nameDE: string) {
  const category = TAXONOMY.find((entry) => entry.id === categoryId)
  const match = category?.subcategories.find((entry) => entry.nameDE === nameDE)
  if (!match) {
    throw new Error(`Unterkategorie "${nameDE}" existiert nicht in Kategorie "${categoryId}".`)
  }
  return { id: slugify(match.nameDE), name: match.nameDE }
}
