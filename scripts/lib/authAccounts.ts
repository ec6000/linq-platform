import { getAuth } from "firebase-admin/auth"
import { PEOPLE, personName, type PersonSeed } from "../data/people"

/**
 * Firebase Auth accounts for the demo personas.
 *
 * Without these, seeded data is unreachable: every personal list filters by the
 * signed-in UID, so a real account sees the public search and nothing else.
 * Creating each persona with `uid` equal to its `users/{id}` document ID makes
 * the two halves line up, and the persona becomes a real account you can log in
 * to and look around from.
 */

export const DEMO_PASSWORD = "linq-demo-2026"

/** Auth is unavailable when running against the Firestore emulator alone. */
export function authTargetUnavailable(): string | null {
  if (process.env.FIRESTORE_EMULATOR_HOST && !process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    return "Firestore-Emulator ohne Auth-Emulator: Konten werden übersprungen. Starte auch den Auth-Emulator, um sie anzulegen."
  }
  return null
}

function describe(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

/** Creates the persona, or brings an existing one back in line with the seed. */
async function upsertAccount(person: PersonSeed) {
  const auth = getAuth()
  const profile = {
    email: person.email,
    password: DEMO_PASSWORD,
    displayName: personName(person),
    emailVerified: true,
  }

  try {
    await auth.createUser({ uid: person.id, ...profile })
    return "created" as const
  } catch (error) {
    const code = (error as { code?: string }).code
    if (code !== "auth/uid-already-exists" && code !== "auth/email-already-exists") throw error

    // An earlier run left this persona behind, possibly under a different UID.
    const existing = await auth.getUserByEmail(person.email).catch(() => null)
    if (existing && existing.uid !== person.id) await auth.deleteUser(existing.uid)
    if (existing && existing.uid === person.id) {
      await auth.updateUser(person.id, profile)
      return "updated" as const
    }
    await auth.createUser({ uid: person.id, ...profile })
    return "created" as const
  }
}

export async function createDemoAccounts(log: (line: string) => void = console.log) {
  const unavailable = authTargetUnavailable()
  if (unavailable) {
    log(`  ${unavailable}`)
    return { created: 0, updated: 0, skipped: PEOPLE.length }
  }

  let created = 0
  let updated = 0

  for (const person of PEOPLE) {
    try {
      const result = await upsertAccount(person)
      if (result === "created") created += 1
      else updated += 1
    } catch (error) {
      log(`  ${person.email}: ${describe(error)}`)
      return { created, updated, skipped: PEOPLE.length - created - updated, failed: true }
    }
  }

  log(`  ${created} Konto/Konten angelegt, ${updated} aktualisiert`)
  return { created, updated, skipped: 0 }
}

export async function deleteDemoAccounts(log: (line: string) => void = console.log) {
  if (authTargetUnavailable()) return 0

  const auth = getAuth()
  const ids = PEOPLE.map((person) => person.id)

  try {
    const result = await auth.deleteUsers(ids)
    if (result.successCount > 0) log(`  ${result.successCount} Demo-Konto/Konten entfernt`)
    return result.successCount
  } catch (error) {
    log(`  Demo-Konten konnten nicht entfernt werden: ${describe(error)}`)
    return 0
  }
}
