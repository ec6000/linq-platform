"use client"

import Link from "next/link"
import { ProviderOffer } from "@/lib/hooks/useProviderOffers"

const statusLabel: Record<string, string> = {
  pending: "Offen",
  accepted: "Angenommen",
  declined: "Abgelehnt",
}

const statusStyles: Record<string, string> = {
  pending: "bg-accent/10 text-accent",
  accepted: "bg-primary/10 text-primary",
  declined: "bg-secondary text-text/50",
}

export default function OfferCard({ offer }: { offer: ProviderOffer }) {
  return (
    <article className="rounded-2xl border border-secondary bg-background p-5 transition hover:border-primary/30 hover:shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h2 className="text-[16px] font-semibold text-text">{offer.orderTitle || "Auftrag"}</h2>
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusStyles[offer.status] ?? statusStyles.pending}`}>
          {statusLabel[offer.status] ?? offer.status}
        </span>
      </div>
      <p className="text-[22px] font-semibold tracking-tight text-text mb-3">{(offer.priceInCent / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</p>
      {offer.comment && <p className="mb-4 line-clamp-2 text-[13px] leading-relaxed text-text/65">{offer.comment}</p>}
      <div className="flex items-center justify-end">
        <Link href={`/find-jobs/${offer.orderId}`} className="rounded-lg border border-secondary px-3 py-1.5 text-[12px] font-medium text-text/70 transition hover:bg-secondary">
          Auftrag öffnen
        </Link>
      </div>
    </article>
  )
}
