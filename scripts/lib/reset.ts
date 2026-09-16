import type { DocumentReference, Firestore } from "firebase-admin/firestore"

/** Every top-level collection the platform owns. */
export const COLLECTIONS = ["users", "categories", "services", "orders", "bookings", "jobs"] as const

/**
 * Counts a document and everything nested beneath it.
 *
 * Subcollections are invisible to a plain `.get()` on the parent collection, so
 * without this walk the reset would report fewer documents than it removes —
 * the offers under each order would vanish silently.
 */
async function countDeep(ref: DocumentReference): Promise<number> {
  const subcollections = await ref.listCollections()
  let total = 1
  for (const subcollection of subcollections) {
    const snapshot = await subcollection.get()
    for (const doc of snapshot.docs) total += await countDeep(doc.ref)
  }
  return total
}

/**
 * Deletes a collection and everything beneath it.
 *
 * `recursiveDelete` walks subcollections too, which is what makes the offers
 * under each order go away with their order instead of becoming orphans that
 * still answer collection-group queries.
 */
export async function clearCollection(db: Firestore, name: string) {
  const snapshot = await db.collection(name).get()
  if (snapshot.empty) return 0

  let total = 0
  for (const doc of snapshot.docs) total += await countDeep(doc.ref)

  await db.recursiveDelete(db.collection(name))
  return total
}

export async function clearDatabase(db: Firestore, log: (line: string) => void = console.log) {
  let total = 0
  for (const name of COLLECTIONS) {
    const removed = await clearCollection(db, name)
    total += removed
    log(`  ${name.padEnd(12)} ${removed} Dokument(e) gelöscht`)
  }
  return total
}
