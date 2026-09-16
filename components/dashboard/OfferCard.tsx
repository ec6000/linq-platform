"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { OFFER_STATUS_LABEL, OfferStatus, type Offer } from "@/lib/types/offer"
import { formatEuro } from "@/lib/utils/format"

const statusStyles: Record<OfferStatus, string> = {
  [OfferStatus.pending]: "pill-accent",
  [OfferStatus.accepted]: "pill-success",
  [OfferStatus.declined]: "pill-muted",
}

export default function OfferCard({ offer }: { offer: Offer }) {
  return (
    <article className="card card-interactive p-6">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h2 className="text-[16px] font-semibold leading-snug text-text">{offer.orderTitle}</h2>
        <span className={`pill ${statusStyles[offer.status] ?? "pill-muted"}`}>
          {OFFER_STATUS_LABEL[offer.status] ?? offer.status}
        </span>
      </div>

      <p className="num text-[22px] font-semibold text-text">{formatEuro(offer.priceInCent)} €</p>

      {offer.message && (
        <p className="mt-3 line-clamp-2 text-[13.5px] leading-relaxed text-text/60">{offer.message}</p>
      )}

      {offer.customerComment && (
        <p className="card-sunken mt-4 px-3.5 py-2.5 text-[13px] text-text/65">
          Rückmeldung: {offer.customerComment}
        </p>
      )}

      <div className="mt-6 flex items-center justify-end border-t border-secondary pt-5">
        <Link href={`/find-jobs/${offer.orderId}`} className="link-arrow text-[13px]">
          Auftrag öffnen
          <ArrowRight size={14} strokeWidth={2.2} aria-hidden />
        </Link>
      </div>
    </article>
  )
}
