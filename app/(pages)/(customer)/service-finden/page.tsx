import { redirect } from "next/navigation"

/** Legacy German URL. The page itself lives at /find-services. */
export default function Page() {
  redirect("/find-services")
}
