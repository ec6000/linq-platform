import type { DocumentSnapshot, QueryDocumentSnapshot } from "firebase/firestore"

/**
 * Every document's identity is its Firestore document ID. There is no second
 * numeric key to reconcile, so decoding is just "attach the ID".
 */
export function decodeDocument<T extends { id: string }>(snapshot: QueryDocumentSnapshot): T {
  return { ...snapshot.data(), id: snapshot.id } as T
}

export function decodeOptionalDocument<T extends { id: string }>(snapshot: DocumentSnapshot): T | null {
  if (!snapshot.exists()) return null
  return { ...snapshot.data(), id: snapshot.id } as T
}
