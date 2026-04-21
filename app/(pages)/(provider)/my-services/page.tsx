"use client"
import { Layers } from "lucide-react";
import { useServices } from "@/lib/hooks/useServices"
import ServiceCard from "@/components/my-services/ServiceCard";

export default function ServicesPage() {
  const { services, loading, error } = useServices();

  return (
    <main className="mx-auto max-w-[1600px] px-6 py-10">
      <div className="mb-8 flex items-center gap-3">
        <Layers size={22} className="text-primary" strokeWidth={1.8} />
        <h1 className="text-[22px] font-semibold tracking-tight text-text">
          Meine Services
        </h1>
      </div>

      {loading && (
        <p className="text-sm text-text/40">Services werden geladen…</p>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {!loading && !error && services.length === 0 && (
        <p className="text-sm text-text/40">Keine Services gefunden.</p>
      )}

      <div className="flex flex-col gap-3">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </main>
  );
}