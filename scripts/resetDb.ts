import { describeTarget, getAdminDb } from "./lib/admin"
import { clearDatabase } from "./lib/reset"
import { deleteDemoAccounts } from "./lib/authAccounts"

/**
 * Wipes every platform collection and the demo login accounts that belong to it.
 * Nothing is written back — use `seed` for that.
 *
 *   pnpm db:reset                                   (against the emulator)
 *   pnpm db:reset --confirm-project my-project-id   (against a real project)
 *   pnpm db:reset --keep-auth                       (leave the accounts alone)
 */
async function main() {
  const db = getAdminDb()
  console.log(`\nDatenbank leeren · ${describeTarget()}\n`)

  const total = await clearDatabase(db)

  if (!process.argv.includes("--keep-auth")) {
    console.log("")
    await deleteDemoAccounts()
  }

  console.log(`\nFertig. ${total} Dokument(e) entfernt.\n`)
}

main().catch((error) => {
  console.error("\nFehler beim Leeren der Datenbank:\n", error instanceof Error ? error.message : error, "\n")
  process.exit(1)
})
