import { readdirSync } from "node:fs"
import { spawnSync } from "node:child_process"

const files = readdirSync(new URL("../tests/", import.meta.url))
  .filter((name) => name.endsWith(".test.ts"))
  .sort()
  .map((name) => `tests/${name}`)

if (files.length === 0) throw new Error("No tests found")
const result = spawnSync(process.execPath, ["--import", "tsx", "--test", ...files], { stdio: "inherit" })
if (result.error) throw result.error
process.exitCode = result.status ?? 1
