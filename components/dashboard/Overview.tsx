"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Plus } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { useJobs } from "@/lib/hooks/useJobs"
import { useBookings } from "@/lib/hooks/useBookings"
import { useProviderOffers } from "@/lib/hooks/useOffers"
import JobCard from "@/components/dashboard/JobCard"
import BookingCard from "@/components/dashboard/BookingCard"
import OfferCard from "@/components/dashboard/OfferCard"
import ListState from "@/components/ListState"
import PageHeader from "@/components/layout/PageHeader"
import { isTerminalJobStatus } from "@/lib/utils/jobStatus"
import { BookingStatus } from "@/lib/types/booking"
import { OfferStatus } from "@/lib/types/offer"

type Tab = "jobs" | "requests" | "offers" | "done"

/**
 * The same overview for both sides. Each tab answers one question — what is
 * agreed, who asked, what am I waiting for, what is behind me — and its
 * number counts only what still needs someone to act.
 */
export default function Overview() {
  const { user } = useAuth()
  const role = user?.role ?? "customer"
  const jobs = useJobs()
  const bookings = useBookings()
  const offers = useProviderOffers()
  const [tab, setTab] = useState<Tab>("jobs")

  const lists = useMemo(
    () => ({
      jobs: jobs.jobs.filter((job) => !isTerminalJobStatus(job.status)),
      // Accepted requests live on as jobs.
      requests: bookings.bookings.filter((booking) => booking.status !== BookingStatus.accepted),
      offers: offers.offers,
      done: jobs.jobs.filter((job) => isTerminalJobStatus(job.status)),
    }),
    [jobs.jobs, bookings.bookings, offers.offers],
  )

  const tabs = [
    { key: "jobs" as const, label: "Jobs", count: lists.jobs.length },
    {
      key: "requests" as const,
      label: "Anfragen",
      count: lists.requests.filter((booking) => booking.status === BookingStatus.requested).length,
    },
    ...(role === "provider"
      ? [{
          key: "offers" as const,
          label: "Angebote",
          count: lists.offers.filter((offer) => offer.status === OfferStatus.pending).length,
        }]
      : []),
    { key: "done" as const, label: "Erledigt", count: 0 },
  ]

  const state = tab === "requests" ? bookings : tab === "offers" ? offers : jobs
  const empty = {
    jobs:
      role === "provider"
        ? "Noch keine vereinbarten Jobs. Passende Aufträge findest du unter „Aufträge“."
        : "Noch keine vereinbarten Jobs. Sobald du ein Angebot annimmst, steht er hier — mit Kontakt.",
    requests: role === "provider" ? "Keine Anfragen zu deinen Services." : "Du hast noch keinen Service angefragt.",
    offers: "Du hast noch keine Angebote abgegeben.",
    done: "Noch nichts abgeschlossen.",
  }[tab]

  return (
    <main id="main" className="shell-wide py-10 md:py-12">
      <PageHeader
        title="Übersicht"
        actions={
          role === "customer" && (
            <Link href="/my-orders/create" className="btn btn-primary">
              <Plus size={16} strokeWidth={2} aria-hidden />
              Auftrag erstellen
            </Link>
          )
        }
      />

      <div role="tablist" aria-label="Bereiche" className="scrollbar-none -mx-4 mb-7 flex gap-1 overflow-x-auto border-b border-secondary px-4 sm:mx-0 sm:px-0">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            data-active={tab === key}
            className="-mb-px flex min-h-12 shrink-0 items-center gap-2 border-b-2 border-transparent px-3.5 text-[14px] font-medium text-text/50 transition-colors hover:text-text data-[active=true]:border-primary data-[active=true]:text-primary"
          >
            {label}
            {count > 0 && <span className="pill pill-accent num px-2 py-0 text-[11.5px]">{count}</span>}
          </button>
        ))}
      </div>

      <section role="tabpanel" className="flex flex-col gap-4">
        <ListState loading={state.loading} error={state.error} empty={lists[tab].length === 0} emptyText={empty} />
        {(tab === "jobs" || tab === "done") && lists[tab].map((job) => <JobCard key={job.id} job={job} role={role} />)}
        {tab === "requests" && lists.requests.map((booking) => <BookingCard key={booking.id} booking={booking} role={role} />)}
        {tab === "offers" && lists.offers.map((offer) => <OfferCard key={offer.orderId} offer={offer} />)}
      </section>
    </main>
  )
}
