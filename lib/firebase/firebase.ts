import { initializeApp, getApps, getApp } from "firebase/app"
import { connectAuthEmulator, getAuth, GoogleAuthProvider } from "firebase/auth"
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const firstLoad = getApps().length === 0
const app = firstLoad ? initializeApp(firebaseConfig) : getApp()

export const db = getFirestore(app)
export const auth = getAuth(app)

// Local development against `firebase emulators:start`, with the seed data from `pnpm db:seed`.
if (firstLoad && process.env.NEXT_PUBLIC_FIREBASE_EMULATOR === "true") {
  connectFirestoreEmulator(db, "127.0.0.1", 8080)
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true })
}
export const googleProvider = new GoogleAuthProvider()
