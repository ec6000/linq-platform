import OrderFormPage from "@/components/customer/OrderFormPage"

export default async function EditOrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  const resolved = await params
  const orderId = Number(resolved.orderId)

  return <OrderFormPage orderId={Number.isNaN(orderId) ? undefined : orderId} />
}
