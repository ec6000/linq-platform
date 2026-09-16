"use client"

import { useMemo } from "react"
import { collection, doc, orderBy, query, where } from "firebase/firestore"
import { useAuth } from "@/components/auth/AuthProvider"
import { db } from "@/lib/firebase/firebase"
import { decodeDocument } from "@/lib/firebase/documents"
import { useFirestoreDocument, useFirestoreQuery } from "@/lib/hooks/useFirestoreQuery"
import { isValidDocumentId } from "@/lib/utils/validation"
import { OrderStatus, type Order } from "@/lib/types/order"

const decode = decodeDocument<Order>
const MESSAGE = "Aufträge konnten nicht geladen werden."

/** Every order still collecting offers — the provider's job board. */
export function useOpenOrders() {
  const source = useMemo(
    () =>
      query(
        collection(db, "orders"),
        where("status", "==", OrderStatus.open),
        orderBy("createdAt", "desc"),
      ),
    [],
  )
  const { data, ...state } = useFirestoreQuery(source, decode, MESSAGE)
  return { orders: data, ...state }
}

/** Everything the signed-in customer published, newest first. */
export function useMyOrders() {
  const { user } = useAuth()
  const uid = user?.uid
  const source = useMemo(
    () =>
      uid
        ? query(
            collection(db, "orders"),
            where("customerId", "==", uid),
            orderBy("createdAt", "desc"),
          )
        : null,
    [uid],
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
