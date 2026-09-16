import { notFound } from "next/navigation"
import OrderFormPage from "@/components/customer/OrderFormPage"
import { parseDocumentId } from "@/lib/utils/validation"

export default async function EditOrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params
  const id = parseDocumentId(orderId)
  if (!id) notFound()

  return <OrderFormPage orderId={id} />
}
