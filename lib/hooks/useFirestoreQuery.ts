"use client"

import { useCallback, useEffect, useState } from "react"
import {
  onSnapshot,
  type DocumentData,
  type DocumentReference,
  type Query,
  type QueryDocumentSnapshot,
} from "firebase/firestore"

const EMPTY_DATA: never[] = []

/**
 * Live list from a query. The query must be memoized by the caller.
 * Switching accounts hides the previous account's data immediately.
 */
export function useFirestoreQuery<T>(
  source: Query<DocumentData> | null,
  decode: (doc: QueryDocumentSnapshot) => T,
  message: string,
) {
  const [revision, setRevision] = useState(0)
  const [state, setState] = useState<{
    source: typeof source
    revision: number
    data: T[]
    error: string | null
  } | null>(null)

  useEffect(() => {
    if (!source) return
    return onSnapshot(
      source,
      (snapshot) => {
        try {
          setState({ source, revision, data: snapshot.docs.map(decode), error: null })
        } catch (error) {
          console.error(message, error)
          setState({ source, revision, data: [], error: message })
        }
      },
      (error) => {
        console.error(message, error)
        setState({ source, revision, data: [], error: message })
      },
    )
  }, [source, decode, message, revision])

  const current = state?.source === source && state.revision === revision ? state : null
  const reload = useCallback(async () => setRevision((value) => value + 1), [])

  return {
    data: current?.data ?? EMPTY_DATA,
    loading: source !== null && !current,
    error: current?.error ?? null,
    reload,
  }
}

/**
 * Live single document.
 *
 * Because document IDs are the only identity in this database, a detail page is
 * a direct document read rather than a `where("id", "==", …)` query — one
 * lookup instead of an index scan, and it works without a composite index.
 */
export function useFirestoreDocument<T extends { id: string }>(
  source: DocumentReference<DocumentData> | null,
  message: string,
) {
  const [state, setState] = useState<{
    source: typeof source
    data: T | null
    error: string | null
  } | null>(null)

  useEffect(() => {
    if (!source) return
    return onSnapshot(
      source,
      (snapshot) => {
        setState({
          source,
          data: snapshot.exists() ? ({ ...snapshot.data(), id: snapshot.id } as T) : null,
          error: null,
        })
      },
      (error) => {
        console.error(message, error)
        setState({ source, data: null, error: message })
      },
    )
  }, [source, message])

  const current = state?.source === source ? state : null
  return {
    data: current?.data ?? null,
    loading: source !== null && !current,
    error: current?.error ?? null,
  }
}
