"use client"

import { useMemo, useState } from "react"
import { collection, doc, limit, orderBy, query, where } from "firebase/firestore"
import { useAuth } from "@/components/auth/AuthProvider"
import { db } from "@/lib/firebase/firebase"
import { decodeDocument } from "@/lib/firebase/documents"
import { useFirestoreDocument, useFirestoreQuery } from "@/lib/hooks/useFirestoreQuery"
import { isValidDocumentId } from "@/lib/utils/validation"
import { OrderStatus, hasExpired, type Order, type PrivateAddress } from "@/lib/types/order"
import { privateAddressRef } from "@/lib/data/orders"

const decode = decodeDocument<Order>
const MESSAGE = "Aufträge konnten nicht geladen werden."

/**
 * The provider's job board: the newest orders still collecting offers, minus
 * those whose fixed date has already passed. The cap keeps one page load from
 * ever reading the whole collection.
 */
export function useOpenOrders() {
  const source = useMemo(
    () =>
      query(
        collection(db, "orders"),
        where("status", "==", OrderStatus.open),
        orderBy("createdAt", "desc"),
        limit(200),
      ),
    [],
  )
  const { data, ...state } = useFirestoreQuery(source, decode, MESSAGE)
  const [now] = useState(() => Date.now())
  const orders = useMemo(
    () => data.filter((order) => !hasExpired(order, now)),
    [data, now],
  )
  return { orders, ...state }
}

/** Everything the signed-in customer published, newest first. Providers publish nothing, so they ask nothing. */
export function useMyOrders() {
  const { user } = useAuth()
  const uid = user?.uid
  const role = user?.role
  const source = useMemo(
    () =>
      uid && role === "customer"
        ? query(
            collection(db, "orders"),
            where("customerId", "==", uid),
            orderBy("createdAt", "desc"),
          )
        : null,
    [uid, role],
  )
  const { data, ...state } = useFirestoreQuery(source, decode, MESSAGE)
  return { orders: data, ...state }
}

export function useOrder(orderId?: string) {
  const source = useMemo(
    () => (isValidDocumentId(orderId) ? doc(db, "orders", orderId) : null),
    [orderId],
  )
  const { data, ...state } = useFirestoreDocument<Order>(source, MESSAGE)
  return { order: data, ...state }
}

/** The exact address. Only the order's customer can read it. */
export function useOrderAddress(orderId?: string) {
  const source = useMemo(() => (isValidDocumentId(orderId) ? privateAddressRef(orderId) : null), [orderId])
  const { data, ...state } = useFirestoreDocument<PrivateAddress & { id: string }>(source, MESSAGE)
  return { address: data, ...state }
}
