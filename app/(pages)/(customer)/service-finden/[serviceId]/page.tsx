import { redirect } from "next/navigation"

/** Legacy German URL. The page itself lives at /find-services/[serviceId]. */
export default async function Page({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = await params
  redirect(`/find-services/${serviceId}`)
}
