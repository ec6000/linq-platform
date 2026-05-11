import ServiceDetailPage from "@/components/customer/ServiceDetailPage"

export default async function Page({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = await params

  return <ServiceDetailPage serviceId={Number(serviceId)} />
}
