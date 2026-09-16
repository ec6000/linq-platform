import { MAX_MONEY_IN_CENT } from "@/lib/types/common"

export function parseEuroInCent(value: string): number {
  const normalized = value.trim().replace(",", ".")
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    throw new Error("Bitte einen gültigen Betrag mit höchstens zwei Nachkommastellen eingeben.")
  }
  const cents = Math.round(Number(normalized) * 100)
  assertMoney(cents)
  return cents
}

export function assertMoney(value: number): void {
  if (!Number.isSafeInteger(value) || value < 0 || value > MAX_MONEY_IN_CENT) {
    throw new Error("Der Betrag muss eine gültige, nicht negative Cent-Summe sein.")
  }
}

export function withoutUndefined<T extends object>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as T
}

/**
 * Document IDs arrive from route parameters, so they are untrusted input.
 * Firestore rejects empty segments, `.`, `..` and anything containing a slash;
 * rejecting those here turns a thrown SDK error into a clean 404.
 */
export function isValidDocumentId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 1500 &&
    !value.includes("/") &&
    value !== "." &&
    value !== ".." &&
    !value.startsWith("__")
  )
}

export function parseDocumentId(value: string | undefined): string | null {
  return isValidDocumentId(value) ? value : null
}

const ID_ALPHABET = "0123456789abcdefghjkmnpqrstvwxyz" // Crockford-style: no i, l, o, u

/**
 * A short, URL-safe document ID.
 *
 * Firestore's own auto-IDs are 20 characters; 12 of a 32-symbol alphabet is
 * 60 bits, which keeps collisions negligible while leaving readable URLs.
 * Generating the ID up front also lets a write build its own reference, so
 * creating a document needs no round trip and no counter.
 */
export function newId(length = 12): string {
  const bytes = new Uint8Array(length)
  globalThis.crypto.getRandomValues(bytes)
  let id = ""
  for (const byte of bytes) id += ID_ALPHABET[byte % ID_ALPHABET.length]
  return id
}
