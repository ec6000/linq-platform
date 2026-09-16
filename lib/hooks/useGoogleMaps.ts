"use client"

import { useEffect, useState } from "react"

const SCRIPT_ID = "google-maps-api"
let mapsPromise: Promise<void> | undefined

declare global {
  interface Window {
    linqGoogleMapsReady?: () => void
  }
}

function loadMaps(): Promise<void> {
  if (typeof window.google?.maps?.Map === "function") return Promise.resolve()
  if (mapsPromise) return mapsPromise
  mapsPromise = new Promise<void>((resolve, reject) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      reject(new Error("Die Karte ist noch nicht konfiguriert. Bitte die Listenansicht verwenden."))
      return
    }
    const script = document.createElement("script")
    script.id = SCRIPT_ID
    const timeout = window.setTimeout(() => fail(), 15000)
    function fail() {
      clearTimeout(timeout)
      script.remove()
      delete window.linqGoogleMapsReady
      reject(new Error("Die Karte konnte nicht geladen werden. Bitte die Listenansicht verwenden."))
    }
    window.linqGoogleMapsReady = () => {
      clearTimeout(timeout)
      delete window.linqGoogleMapsReady
      if (typeof window.google?.maps?.Map !== "function") {
        fail()
        return
      }
      resolve()
    }
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&loading=async&callback=linqGoogleMapsReady&v=quarterly`
    script.async = true
    script.onerror = fail
    document.head.appendChild(script)
  }).catch((error) => {
    mapsPromise = undefined
    throw error
  })
  return mapsPromise
}

export function useGoogleMaps(enabled = true) {
  const [state, setState] = useState<{ ready: boolean; error: string | null }>({ ready: false, error: null })
  useEffect(() => {
    if (!enabled) return
    let active = true
    loadMaps().then(
      () => { if (active) setState({ ready: true, error: null }) },
      (error: Error) => { if (active) setState({ ready: false, error: error.message }) },
    )
    return () => { active = false }
  }, [enabled])
  return state
}
