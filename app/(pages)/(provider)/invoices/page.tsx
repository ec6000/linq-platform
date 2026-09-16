import { Receipt } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

export default function InvoicesPage() {
  return (
    <main id="main" className="shell-wide py-10 md:py-12">
      <PageHeader
        title="Rechnungen"
        description="Alle Abrechnungen zu deinen abgeschlossenen Aufträgen."
      />

      <div className="empty">
        <Receipt size={22} strokeWidth={1.6} className="mx-auto text-text/25" aria-hidden />
        <h2 className="mt-4 text-[16px] font-semibold text-text">Noch keine Rechnungen</h2>
        <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-text/50">
          Sobald du einen Auftrag abgeschlossen hast, findest du die Abrechnung hier.
        </p>
      </div>
    </main>
  );
}
