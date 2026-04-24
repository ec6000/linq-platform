/**
 * Seed-Script für Firestore: Kategorien & Subkategorien
 *
 * Ausführen mit:
 *   npx tsx scripts/seed-categories.ts
 *
 * Struktur:
 *   categories/{categoryId}
 *     - nameDE: string
 *     - nameEN: string
 *     - slug: string
 *     - order: number
 *     - isActive: boolean
 *     - createdAt: Timestamp
 *     - updatedAt: Timestamp
 *
 *   categories/{categoryId}/subcategories/{subcategoryId}
 *     - nameDE: string
 *     - slug: string
 *     - categoryId: string   (Rückreferenz für Collection-Group-Queries)
 *     - order: number
 *     - isActive: boolean
 *     - createdAt: Timestamp
 *     - updatedAt: Timestamp
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as path from 'path';

// ────────────────────────────────────────────────────────────
// Firebase Admin Init
// ────────────────────────────────────────────────────────────
// Lege deinen Service-Account-Key unter ./serviceAccountKey.json ab
// (Firebase Console → Projekteinstellungen → Dienstkonten → Neuen privaten Schlüssel generieren)
// WICHTIG: Diese Datei in .gitignore aufnehmen!

if (!getApps().length) {
  const serviceAccount = require(path.resolve(
    process.cwd(),
    'serviceAccountKey.json'
  ));
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

// ────────────────────────────────────────────────────────────
// Helper: Slug-Generator für Subkategorien (deutsch → clean)
// ────────────────────────────────────────────────────────────
function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/&/g, 'und')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ────────────────────────────────────────────────────────────
// Kategorien-Daten
// ────────────────────────────────────────────────────────────
interface CategorySeed {
  id: string;        // Firestore Document-ID (englisch, lowercase, ein Wort)
  nameDE: string;
  nameEN: string;
  subcategories: string[];
}

const categories: CategorySeed[] = [
  {
    id: 'automotive',
    nameDE: 'Auto & Reinigung',
    nameEN: 'Automotive',
    subcategories: [
      'Autowäsche außen',
      'Autoreinigung innen',
      'Innenraum-Tiefenreinigung',
      'Polsterreinigung Auto',
      'Felgenreinigung',
      'Scheibenreinigung Auto',
      'Fahrzeugpflege',
      'Fahrradreinigung',
      'Motorrad-Reinigung',
      'Sonstige Fahrzeugreinigung',
    ],
  },
  {
    id: 'cleaning',
    nameDE: 'Reinigung',
    nameEN: 'Cleaning',
    subcategories: [
      'Wohnungsreinigung',
      'Hausreinigung',
      'Grundreinigung',
      'Fensterreinigung',
      'Treppenhausreinigung',
      'Büroreinigung',
      'Endreinigung nach Umzug',
      'Küchenreinigung',
      'Badreinigung',
      'Teppichreinigung',
      'Polsterreinigung',
      'Kellerreinigung',
      'Balkonreinigung',
      'Sonstige Reinigung',
    ],
  },
  {
    id: 'handyman',
    nameDE: 'Handwerk',
    nameEN: 'Handyman',
    subcategories: [
      'Möbelaufbau',
      'Möbelabbau',
      'Kleine Reparaturen',
      'Bohren & Montieren',
      'Lampen anbringen',
      'Regale anbringen',
      'Bilder aufhängen',
      'Malerarbeiten',
      'Silikonfugen erneuern',
      'Bodenarbeiten klein',
      'Tür- & Schrankreparaturen',
      'Fahrradreparatur klein',
      'Sonstige Handwerksarbeiten',
    ],
  },
  {
    id: 'gardening',
    nameDE: 'Garten & Außenbereich',
    nameEN: 'Gardening',
    subcategories: [
      'Rasen mähen',
      'Hecke schneiden',
      'Unkraut entfernen',
      'Laub entfernen',
      'Pflanzen einsetzen',
      'Gartenpflege allgemein',
      'Terrasse reinigen',
      'Balkonpflege',
      'Hochdruckreinigung',
      'Gartenabfälle entsorgen',
      'Beetpflege',
      'Gießen bei Abwesenheit',
      'Winterdienst',
      'Sonstige Gartenarbeit',
    ],
  },
  {
    id: 'household',
    nameDE: 'Haushaltshilfe',
    nameEN: 'Household',
    subcategories: [
      'Einkaufen',
      'Wäsche waschen',
      'Wäsche bügeln',
      'Aufräumen',
      'Kochen vorbereiten',
      'Geschirr & Küche',
      'Müll rausbringen',
      'Haustierbetreuung',
      'Pflanzen gießen',
      'Seniorenhilfe im Alltag',
      'Hilfe bei Erledigungen',
      'Sonstige Haushaltshilfe',
    ],
  },
  {
    id: 'moving',
    nameDE: 'Umzug & Transport',
    nameEN: 'Moving',
    subcategories: [
      'Umzugshilfe',
      'Möbel tragen',
      'Kartons tragen',
      'Möbeltransport',
      'Kleintransport',
      'Sperrmüll rausbringen',
      'Entrümpelung',
      'Keller ausräumen',
      'Dachboden ausräumen',
      'Lieferung abholen',
      'Waschmaschine transportieren',
      'Küchen- oder Möbelabbau',
      'Sonstiger Transport',
    ],
  },
  {
    id: 'other',
    nameDE: 'Sonstiges',
    nameEN: 'Other',
    subcategories: [
      'Eventhilfe',
      'Aufbauhilfe',
      'Abbauhilfe',
      'Warteschlangen-Service',
      'Botengänge',
      'Flyer verteilen',
      'Hilfe bei Technik',
      'Computerhilfe',
      'Smartphone-Hilfe',
      'Nachhilfe',
      'Unterstützung bei Formularen',
      'Begleitung zu Terminen',
      'Sonstige Hilfe',
    ],
  },
];

// ────────────────────────────────────────────────────────────
// Seeding-Logik (mit Batched Writes für Performance & Atomarität)
// ────────────────────────────────────────────────────────────
async function seed() {
  console.log('🌱 Starte Seeding der Kategorien...\n');

  const now = FieldValue.serverTimestamp();
  let totalCategories = 0;
  let totalSubcategories = 0;

  for (const [catIndex, category] of categories.entries()) {
    const batch = db.batch();

    // Hauptkategorie
    const categoryRef = db.collection('categories').doc(category.id);
    batch.set(
      categoryRef,
      {
        nameDE: category.nameDE,
        nameEN: category.nameEN,
        slug: category.id,
        order: catIndex,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true }
    );

    // Subkategorien
    for (const [subIndex, subName] of category.subcategories.entries()) {
      const subId = slugify(subName);
      const subRef = categoryRef.collection('subcategories').doc(subId);

      batch.set(
        subRef,
        {
          nameDE: subName,
          slug: subId,
          categoryId: category.id,
          order: subIndex,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
        { merge: true }
      );

      totalSubcategories++;
    }

    await batch.commit();
    totalCategories++;

    console.log(
      `✅ ${category.nameDE} (${category.id}) – ${category.subcategories.length} Subkategorien`
    );
  }

  console.log(
    `\n🎉 Fertig! ${totalCategories} Kategorien, ${totalSubcategories} Subkategorien geschrieben.`
  );
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Fehler beim Seeding:', err);
    process.exit(1);
  });