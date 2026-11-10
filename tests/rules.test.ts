import { readFileSync } from "node:fs"
import { after, before, beforeEach, test } from "node:test"
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing"
import firebase from "firebase/compat/app"
import "firebase/compat/firestore"

/**
 * Runs firestore.rules against the emulator. Skipped without one, so
 * `pnpm test` stays offline; `pnpm test:rules` starts the emulator and runs it.
 */
const skip = !process.env.FIRESTORE_EMULATOR_HOST && "FIRESTORE_EMULATOR_HOST ist nicht gesetzt"

type Db = firebase.firestore.Firestore
const { FieldValue } = firebase.firestore
const now = FieldValue.serverTimestamp()

firebase.firestore.setLogLevel("silent")

let env: RulesTestEnvironment
const as = (uid: string) => env.authenticatedContext(uid).firestore() as unknown as Db

const service = {
  providerId: "anna",
  providerName: "Anna",
  title: "Umzugshilfe",
  description: "Zwei Helfer",
  status: "active",
  pricing: { type: "hourly" },
  minPriceInCent: 3000,
  maxPriceInCent: 4000,
}

const order = {
  customerId: "kim",
  customerName: "Kim",
  title: "Umzug Sülz",
  description: "2 Zimmer, 3. OG",
  status: "open",
  budgetInCent: 30000,
  place: { address: "Köln Sülz", city: "Köln Sülz" },
  categoryId: "moving",
  categoryName: "Umzug",
  subcategoryId: "umzugshilfe",
  offerCount: 0,
}

const offer = (providerId: string, priceInCent: number) => ({
  orderId: "o1",
  orderTitle: order.title,
  providerId,
  providerName: providerId,
  priceInCent,
  message: "",
  status: "pending",
})

before(async () => {
  if (skip) return
  const [host, port] = process.env.FIRESTORE_EMULATOR_HOST!.split(":")
  env = await initializeTestEnvironment({
    projectId: "demo-linq-rules",
    firestore: { rules: readFileSync("firestore.rules", "utf8"), host, port: Number(port) },
  })
})

after(async () => {
  if (!skip) await env.cleanup()
})

beforeEach(async () => {
  if (skip) return
  await env.clearFirestore()
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore()
    await db.doc("users/kim").set({ role: "customer", email: "kim@x.de", phone: "1" })
    await db.doc("users/lea").set({ role: "customer", email: "lea@x.de", phone: "2" })
    for (const provider of ["anna", "ben", "cem", "dirk"]) await db.doc(`users/${provider}`).set({ role: "provider" })
    await db.doc("services/s1").set(service)
    await db.doc("orders/o1").set({ ...order, offerCount: 3 })
    await db.doc("orders/o1/private/address").set({ address: "Zülpicher Str. 1" })
    await db.doc("orders/o1/offers/anna").set(offer("anna", 28000))
    await db.doc("orders/o1/offers/ben").set(offer("ben", 31000))
    await db.doc("orders/o1/offers/cem").set(offer("cem", 33000))
  })
})

/** The customer's accept transaction, as lib/data/offers.ts runs it. */
function accept(db: Db, winner: string, rivals: string[], job: Record<string, unknown> = {}) {
  return db.runTransaction(async (tx) => {
    const orderRef = db.doc("orders/o1")
    const won = (await tx.get(db.doc(`orders/o1/offers/${winner}`))).data()!
    for (const rival of rivals) await tx.get(db.doc(`orders/o1/offers/${rival}`))
    tx.set(db.doc("jobs/j1"), {
      sourceType: "order",
      sourceId: "o1",
      customerId: "kim",
      providerId: winner,
      priceInCent: won.priceInCent,
      status: "scheduled",
      ...job,
    })
    tx.update(db.doc(`orders/o1/offers/${winner}`), { status: "accepted", decidedAt: now, updatedAt: now })
    for (const rival of rivals) {
      tx.update(db.doc(`orders/o1/offers/${rival}`), { status: "declined", decidedAt: now, updatedAt: now })
    }
    tx.update(orderRef, {
      status: "assigned",
      assignedProviderId: winner,
      assignedProviderName: winner,
      jobId: "j1",
      assignedAt: now,
      offerCount: 0,
      updatedAt: now,
    })
  })
}

test("the exact address stays with the customer", { skip }, async () => {
  await assertSucceeds(as("kim").doc("orders/o1/private/address").get())
  await assertFails(as("anna").doc("orders/o1/private/address").get())
  await assertSucceeds(as("anna").doc("orders/o1").get())
})

test("a customer publishes an order with its private address in one batch", { skip }, async () => {
  const db = as("lea")
  const batch = db.batch()
  batch.set(db.doc("orders/o2"), { ...order, customerId: "lea" })
  batch.set(db.doc("orders/o2/private/address"), { address: "Venloer Str. 2" })
  await assertSucceeds(batch.commit())

  const forged = db.batch()
  forged.set(db.doc("orders/o3"), { ...order, customerId: "lea", status: "assigned" })
  await assertFails(forged.commit())
})

test("an offer and the order's counter move together", { skip }, async () => {
  const db = as("dirk")
  await assertSucceeds(
    db.runTransaction(async (tx) => {
      tx.set(db.doc("orders/o1/offers/dirk"), offer("dirk", 25000))
      tx.update(db.doc("orders/o1"), { offerCount: FieldValue.increment(1), updatedAt: now })
    }),
  )
  // A counter bump with no offer behind it is refused.
  await assertFails(as("dirk").doc("orders/o1").update({ offerCount: 10 }))
  // Bidding twice is impossible: the offer ID is the provider's UID.
  await assertFails(
    db.runTransaction(async (tx) => {
      tx.set(db.doc("orders/o1/offers/dirk"), offer("dirk", 1))
      tx.update(db.doc("orders/o1"), { offerCount: FieldValue.increment(1), updatedAt: now })
    }),
  )
})

test("accepting an offer closes all rivals in one transaction", { skip }, async () => {
  await assertSucceeds(accept(as("kim"), "anna", ["ben", "cem"]))
})

test("a job cannot be forged around the accept transaction", { skip }, async () => {
  // A price the provider never offered.
  await assertFails(accept(as("kim"), "anna", ["ben", "cem"], { priceInCent: 100 }))
  // A job on its own, without the order pointing at it.
  await assertFails(
    as("kim").doc("jobs/j9").set({
      sourceType: "order",
      sourceId: "o1",
      customerId: "kim",
      providerId: "anna",
      priceInCent: 28000,
      status: "scheduled",
    }),
  )
  // Someone else's order.
  await assertFails(accept(as("lea"), "anna", ["ben", "cem"]))
})

test("a customer cannot jump their order's status", { skip }, async () => {
  await assertFails(as("kim").doc("orders/o1").update({ status: "completed" }))
  await assertFails(as("kim").doc("orders/o1").update({ assignedProviderId: "anna" }))
  await assertSucceeds(as("kim").doc("orders/o1").update({ status: "cancelled", cancelledAt: now, updatedAt: now }))
})

test("a booking copies its service and the provider names the final price", { skip }, async () => {
  const booking = {
    serviceId: "s1",
    serviceTitle: service.title,
    customerId: "kim",
    providerId: "anna",
    pricing: service.pricing,
    message: "Samstag?",
    status: "requested",
  }
  await assertFails(as("kim").doc("bookings/b0").set({ ...booking, providerId: "ben" }))
  await assertFails(as("kim").doc("bookings/b0").set({ ...booking, serviceTitle: "Gratis" }))
  await assertSucceeds(as("kim").doc("bookings/b1").set(booking))

  const anna = as("anna")
  await assertSucceeds(
    anna.runTransaction(async (tx) => {
      tx.set(anna.doc("jobs/j2"), {
        sourceType: "booking",
        sourceId: "b1",
        customerId: "kim",
        providerId: "anna",
        priceInCent: 12000,
        status: "scheduled",
      })
      tx.update(anna.doc("bookings/b1"), {
        status: "accepted",
        priceInCent: 12000,
        jobId: "j2",
        acceptedAt: now,
        updatedAt: now,
      })
    }),
  )
})

test("the provider runs a job; the customer can only call it off before it starts", { skip }, async () => {
  await env.withSecurityRulesDisabled(async (context) => {
    await context.firestore().doc("jobs/j3").set({ customerId: "kim", providerId: "anna", status: "scheduled" })
  })
  await assertFails(as("kim").doc("jobs/j3").update({ status: "completed" }))
  await assertFails(as("anna").doc("jobs/j3").update({ status: "completed" }))
  await assertSucceeds(as("anna").doc("jobs/j3").update({ status: "inProgress", startedAt: now }))
  await assertFails(as("kim").doc("jobs/j3").update({ status: "cancelled" }))
  await assertSucceeds(as("anna").doc("jobs/j3").update({ status: "completed", completedAt: now }))
})

test("providers list their own offers across orders, and only those", { skip }, async () => {
  const anna = as("anna")
  await assertSucceeds(anna.collectionGroup("offers").where("providerId", "==", "anna").get())
  await assertFails(anna.collectionGroup("offers").get())
})

test("the role chosen at sign-up is final", { skip }, async () => {
  await assertFails(as("kim").doc("users/kim").update({ role: "provider" }))
  await assertSucceeds(as("kim").doc("users/kim").update({ phone: "0221" }))
})
