import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { Offer } from "@/lib/types/offer"
import { formatEuro } from "@/lib/utils/format"
import StatusPill from "@/components/StatusPill"

export default function OfferCard({ offer }: { offer: Offer }) {
  return (
    <article className="card p-6">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h2 className="text-[16px] font-semibold leading-snug text-text">{offer.orderTitle}</h2>
        <StatusPill status={offer.status} />
      </div>

      <p className="num text-[22px] font-semibold text-text">{formatEuro(offer.priceInCent)} €</p>
      {offer.message && <p className="mt-3 line-clamp-2 text-[13.5px] leading-relaxed text-text/60">{offer.message}</p>}

      <div className="mt-5 flex justify-end">
        <Link href={`/find-jobs/${offer.orderId}`} className="link-arrow text-[13px]">
          Auftrag öffnen
          <ArrowRight size={14} strokeWidth={2.2} aria-hidden />
        </Link>
      </div>
    </article>
  )
}
