import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getFirestore, type Firestore } from "firebase-admin/firestore"
import { readFileSync } from "node:fs"

/**
 * Admin Firestore handle for the seed and reset scripts.
 *
 * These scripts delete everything, so pointing them at the wrong project would
 * be unrecoverable. Two guards stand in the way:
 *   - the emulator is always allowed,
 *   - a real project requires `--confirm-project <id>` AND a service account
 *     key whose own project ID matches what was typed.
 */
export function getAdminDb(): Firestore {
  if (getApps().length) return getFirestore()

  if (process.env.FIRESTORE_EMULATOR_HOST) {
    const projectId = process.env.GCLOUD_PROJECT ?? "demo-linq"
    return getFirestore(initializeApp({ projectId }))
  }

  const index = process.argv.indexOf("--confirm-project")
  const projectId = index >= 0 ? process.argv[index + 1] : undefined
  if (!projectId || projectId.startsWith("--")) {
    throw new Error(
      "Dieses Skript schreibt und löscht Daten.\n" +
        "Starte es entweder gegen den Emulator (FIRESTORE_EMULATOR_HOST) oder\n" +
        "bestätige das Zielprojekt explizit: --confirm-project <project-id>",
    )
  }

  const account = JSON.parse(readFileSync("./serviceAccountKey.json", "utf8"))
  if (account.project_id !== projectId) {
    throw new Error(
      `Service-Account gehört zu "${account.project_id}", bestätigt wurde "${projectId}". Abbruch.`,
    )
  }

  return getFirestore(initializeApp({ projectId, credential: cert(account) }))
}

export function describeTarget() {
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    return `Emulator ${process.env.FIRESTORE_EMULATOR_HOST}`
  }
  const index = process.argv.indexOf("--confirm-project")
  return `Projekt ${process.argv[index + 1]}`
}
