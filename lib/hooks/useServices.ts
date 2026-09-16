"use client"

import { useMemo } from "react"
import { collection, doc, orderBy, query, where } from "firebase/firestore"
import { useAuth } from "@/components/auth/AuthProvider"
import { db } from "@/lib/firebase/firebase"
import { decodeDocument } from "@/lib/firebase/documents"
import { useFirestoreDocument, useFirestoreQuery } from "@/lib/hooks/useFirestoreQuery"
import { isValidDocumentId } from "@/lib/utils/validation"
import { ServiceStatus, type Service } from "@/lib/types/service"

const decode = decodeDocument<Service>
const MESSAGE = "Services konnten nicht geladen werden."

/** All active services, newest first — the public search index. */
export function useActiveServices() {
  const source = useMemo(
    () =>
      query(
        collection(db, "services"),
        where("status", "==", ServiceStatus.active),
        orderBy("createdAt", "desc"),
      ),
    [],
  )
  const { data, ...state } = useFirestoreQuery(source, decode, MESSAGE)
  return { services: data, ...state }
}

/** Everything the signed-in provider owns, archived entries excluded. */
export function useMyServices() {
  const { user } = useAuth()
  const uid = user?.uid
  const source = useMemo(
    () =>
      uid
        ? query(
            collection(db, "services"),
            where("providerId", "==", uid),
            orderBy("createdAt", "desc"),
          )
        : null,
    [uid],
  )
  const { data, ...state } = useFirestoreQuery(source, decode, MESSAGE)
  const services = useMemo(
    () => data.filter((service) => service.status !== ServiceStatus.archived),
    [data],
  )
  return { services, ...state }
}

export function useService(serviceId?: string) {
  const source = useMemo(
    () => (isValidDocumentId(serviceId) ? doc(db, "services", serviceId) : null),
    [serviceId],
  )
  const { data, ...state } = useFirestoreDocument<Service>(source, MESSAGE)
  return { service: data, ...state }
}
