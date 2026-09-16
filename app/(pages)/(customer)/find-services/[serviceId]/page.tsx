import { notFound } from "next/navigation"
import ServiceDetailPage from "@/components/customer/ServiceDetailPage"
import { parseDocumentId } from "@/lib/utils/validation"

export default async function Page({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = await params
  const id = parseDocumentId(serviceId)
  if (!id) notFound()

  return <ServiceDetailPage serviceId={id} />
}
