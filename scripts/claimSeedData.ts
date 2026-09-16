import { getAuth } from "firebase-admin/auth"
import type { Firestore, WriteBatch } from "firebase-admin/firestore"
import { describeTarget, getAdminDb } from "./lib/admin"
import { authTargetUnavailable } from "./lib/authAccounts"
import { CUSTOMERS, PROVIDERS, personName, requirePerson, type PersonSeed } from "./data/people"

/**
 * Hands one demo persona's data to a real account.
 *
 * Seeded documents belong to personas, and every personal list in the app
 * filters by the signed-in UID — so your own account sees the public search and
 * two empty dashboards. This rewrites the ownership so the data is yours.
 *
 *   pnpm db:claim --email me@example.com
 *   pnpm db:claim --email me@example.com --role customer
 *   pnpm db:claim --uid <firebase-uid> --persona seed-p-lehmann
 *   pnpm db:claim --email me@example.com --again   (take a second persona too)
 *
 * Add --confirm-project <id> when the target is a real project.
 *
 * Ownership moves, it is not copied. Without --persona the script picks the
 * persona with the most data; a second run would therefore pick the *next* one
 * and quietly pile more data onto the same account, so it stops instead unless
 * --again says that is what you want.
 */

const OWNER_FIELDS = {
  services: ["providerId"],
  orders: ["customerId", "assignedProviderId"],
  bookings: ["customerId", "providerId"],
  jobs: ["customerId", "providerId"],
} as const

/** The denormalised name that travels with each owner field. */
const NAME_FIELD: Record<string, string> = {
  providerId: "providerName",
  customerId: "customerName",
  assignedProviderId: "assignedProviderName",
}

function argValue(flag: string) {
  const index = process.argv.indexOf(flag)
  const value = index >= 0 ? process.argv[index + 1] : undefined
  return value && !value.startsWith("--") ? value : undefined
}

/** Picks the persona that owns the most documents, so the takeover is worthwhile. */
async function busiestPersona(db: Firestore, candidates: PersonSeed[]) {
  const counts = await Promise.all(
    candidates.map(async (person) => {
      let total = 0
      for (const [collection, fields] of Object.entries(OWNER_FIELDS)) {
        for (const field of fields) {
          const snapshot = await db.collection(collection).where(field, "==", person.id).count().get()
          total += snapshot.data().count
        }
      }
      return { person, total }
    }),
  )

  counts.sort((a, b) => b.total - a.total)
  return counts[0]
}

class Rewriter {
  private batch: WriteBatch
  private pending = 0
  private committed = 0

  constructor(private readonly db: Firestore) {
    this.batch = db.batch()
  }

  async set(ref: FirebaseFirestore.DocumentReference, data: Record<string, unknown>, merge = true) {
    this.batch.set(ref, data, { merge })
    this.pending += 1
    if (this.pending >= 400) await this.flush()
  }

  async delete(ref: FirebaseFirestore.DocumentReference) {
    this.batch.delete(ref)
    this.pending += 1
    if (this.pending >= 400) await this.flush()
  }

  async flush() {
    if (this.pending === 0) return
    await this.batch.commit()
    this.committed += this.pending
    this.pending = 0
    this.batch = this.db.batch()
  }

  get total() {
    return this.committed + this.pending
  }
}

async function main() {
  const db = getAdminDb()
  const email = argValue("--email")
  const explicitUid = argValue("--uid")
  const explicitPersona = argValue("--persona")
  const role = argValue("--role") === "customer" ? "customer" : "provider"

  if (!email && !explicitUid) {
    throw new Error(
      "Wer soll die Daten bekommen?\n" +
        "  pnpm db:claim --email <deine-adresse>\n" +
        "  pnpm db:claim --uid <firebase-uid>",
    )
  }

  console.log(`\nDemo-Daten übertragen · ${describeTarget()}\n`)

  // Resolve the receiving account.
  let uid = explicitUid
  let displayName = ""
  if (email) {
    if (authTargetUnavailable()) {
      throw new Error("Ohne Auth lässt sich keine E-Mail auflösen. Nutze stattdessen --uid <firebase-uid>.")
    }
    const account = await getAuth()
      .getUserByEmail(email)
      .catch(() => null)
    if (!account) {
      throw new Error(`Kein Konto mit der Adresse "${email}". Registriere dich zuerst in der App.`)
    }
    uid = account.uid
    displayName = account.displayName ?? ""
  }
  if (!uid) throw new Error("Konnte keine UID bestimmen.")

  // Resolve the persona whose data moves.
  const persona = explicitPersona
    ? requirePerson(explicitPersona)
    : (await busiestPersona(db, role === "customer" ? CUSTOMERS : PROVIDERS)).person

  if (persona.id === uid) {
    console.log("Ziel und Quelle sind identisch, nichts zu tun.\n")
    return
  }

  // Without this, a second run would silently hand over a second persona.
  if (!explicitPersona && !process.argv.includes("--again")) {
    const alreadyOwns = (await busiestPersona(db, [{ ...persona, id: uid }])).total
    if (alreadyOwns > 0) {
      console.log(`Dieses Konto besitzt bereits ${alreadyOwns} Dokument(e).`)
      console.log("Es ist also schon versorgt. Mit --again übernimmst du zusätzlich eine")
      console.log("weitere Persona, mit --persona <id> eine bestimmte.\n")
      return
    }
  }

  // The receiving user document decides which lists the app shows.
  const userRef = db.collection("users").doc(uid)
  const existing = (await userRef.get()).data()
  const [first = "", ...rest] = (displayName || personName(persona)).trim().split(/\s+/)
  const newName =
    `${existing?.firstName ?? first} ${existing?.lastName ?? rest.join(" ")}`.trim() || personName(persona)

  console.log(`Persona   ${persona.id} (${personName(persona)}, ${persona.role})`)
  console.log(`Ziel      ${uid}${email ? ` (${email})` : ""}`)
  console.log(`Rolle     ${persona.role}\n`)

  const rewriter = new Rewriter(db)
  const moved: string[] = []

  for (const [collection, fields] of Object.entries(OWNER_FIELDS)) {
    let count = 0
    for (const field of fields) {
      const snapshot = await db.collection(collection).where(field, "==", persona.id).get()
      for (const doc of snapshot.docs) {
        await rewriter.set(doc.ref, { [field]: uid, [NAME_FIELD[field]]: newName })
        count += 1
      }
    }
    if (count > 0) moved.push(`  ${collection.padEnd(10)} ${count} Dokument(e)`)
  }

  // Offers are keyed by provider UID, so they are moved rather than updated.
  if (persona.role === "provider") {
    const offers = await db.collectionGroup("offers").where("providerId", "==", persona.id).get()
    for (const doc of offers.docs) {
      const target = doc.ref.parent.doc(uid)
      await rewriter.set(target, { ...doc.data(), providerId: uid, providerName: newName }, false)
      await rewriter.delete(doc.ref)
    }
    if (offers.size > 0) moved.push(`  offers     ${offers.size} Angebot(e) neu abgelegt`)
  }

  // The receiving account must carry the persona's role, or the app routes it
  // to the wrong half of the product and the data stays invisible anyway.
  await rewriter.set(userRef, {
    role: persona.role,
    firstName: existing?.firstName || first,
    lastName: existing?.lastName || rest.join(" "),
    email: email ?? existing?.email ?? persona.email,
    phone: existing?.phone ?? persona.phone,
    company: existing?.company ?? persona.company,
    notificationsEnabled: existing?.notificationsEnabled ?? true,
    updatedAt: new Date(),
  })

  await rewriter.flush()

  console.log(moved.length > 0 ? moved.join("\n") : "  (die Persona besaß nichts)")
  console.log(`\nFertig. ${rewriter.total} Schreibvorgang/-vorgänge.`)
  console.log(`Melde dich neu an, damit die Rolle "${persona.role}" greift.\n`)
}

main().catch((error) => {
  console.error("\nFehler beim Übertragen:\n", error instanceof Error ? error.message : error, "\n")
  process.exit(1)
})
