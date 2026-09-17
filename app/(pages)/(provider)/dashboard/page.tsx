"use client"

import { useMemo, useState } from "react"
import { CalendarClock, HandCoins, Layers } from "lucide-react"
import { useJobs } from "@/lib/hooks/useJobs"
import { useBookings } from "@/lib/hooks/useBookings"
import { useProviderOffers } from "@/lib/hooks/useOffers"
import JobCard from "@/components/dashboard/JobCard"
import BookingCard from "@/components/dashboard/BookingCard"
import OfferCard from "@/components/dashboard/OfferCard"
import PageHeader from "@/components/layout/PageHeader"
import { JOB_STATUS_LABEL, JobStatus } from "@/lib/types/job"

type DashboardTab = "jobs" | "offers" | "bookings"
type JobFilter = "all" | JobStatus

const tabs = [
  { key: "jobs" as const, label: "Jobs", icon: Layers },
  { key: "offers" as const, label: "Preisangebote", icon: HandCoins },
  { key: "bookings" as const, label: "Service-Bookings", icon: CalendarClock },
]

const jobFilters: Array<{ key: JobFilter; label: string }> = [
  { key: "all", label: "Alle" },
  ...Object.values(JobStatus).map((status) => ({ key: status, label: JOB_STATUS_LABEL[status] })),
]

/** One loading / error / empty treatment for all three tabs. */
function ListState({
  loading,
  error,
  empty,
  emptyText,
}: {
  loading: boolean
  error: string | null
  empty: boolean
  emptyText: string
}) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-40 rounded-xl" />
        ))}
      </div>
    )
  }
  if (error) {
    return (
      <p role="alert" className="notice notice-error">
        {error}
      </p>
    )
  }
  if (empty) {
    return (
      <div className="empty">
        <p className="text-[15px] text-text/50">{emptyText}</p>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("jobs")
  const [activeJobFilter, setActiveJobFilter] = useState<JobFilter>("all")
  const { jobs, loading: jobsLoading, error: jobsError } = useJobs()
  const { bookings, loading: bookingsLoading, error: bookingsError } = useBookings()
  const { offers, loading: offersLoading, error: offersError } = useProviderOffers()

  const visibleJobs = useMemo(
    () => (activeJobFilter === "all" ? jobs : jobs.filter((job) => job.status === activeJobFilter)),
    [activeJobFilter, jobs],
  )

  return (
    <main id="main" className="shell-wide py-10 md:py-12">
      <PageHeader title="Dashboard" description="Deine Jobs, Angebote und Buchungsanfragen." />

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Dashboard-Bereiche"
        className="scrollbar-none -mx-4 mb-7 flex snap-x items-center gap-1 overflow-x-auto border-b border-secondary px-4 sm:mx-0 sm:px-0"
      >
        {tabs.map(({ key, label, icon: Icon }) => {
          const selected = activeTab === key
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveTab(key)}
              data-active={selected ? "true" : "false"}
              className="-mb-px flex min-h-12 shrink-0 snap-start items-center gap-2 border-b-2 border-transparent px-3.5 py-3 text-[14px] font-medium text-text/50 transition-colors hover:text-text data-[active=true]:border-primary data-[active=true]:text-primary"
            >
              <Icon size={15} strokeWidth={1.9} aria-hidden />
              {label}
            </button>
          )
        })}
      </div>

      {activeTab === "jobs" && (
        <section className="flex flex-col gap-4">
          <div className="sm:hidden">
            <label
              htmlFor="job-status-filter"
              className="mb-1.5 block text-[12px] font-medium text-text/50"
            >
              Job-Status
            </label>
            <select
              id="job-status-filter"
              value={activeJobFilter}
              onChange={(event) => setActiveJobFilter(event.target.value as JobFilter)}
              className="field field-select w-full"
            >
              {jobFilters.map((filter) => (
                <option key={filter.key} value={filter.key}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
          <div className="hidden flex-wrap items-center gap-2 sm:flex">
            {jobFilters.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => setActiveJobFilter(chip.key)}
                data-active={activeJobFilter === chip.key ? "true" : "false"}
                className="chip"
              >
                {chip.label}
              </button>
            ))}
          </div>

          <ListState
            loading={jobsLoading}
            error={jobsError}
            empty={visibleJobs.length === 0}
            emptyText="Keine Jobs mit diesem Filter."
          />

          {visibleJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </section>
      )}

      {activeTab === "offers" && (
        <section className="flex flex-col gap-4">
          <ListState
            loading={offersLoading}
            error={offersError}
            empty={offers.length === 0}
            emptyText="Noch keine Preisangebote gesendet."
          />
          {offers.map((offer) => (
            <OfferCard key={`${offer.orderId}-${offer.providerId}`} offer={offer} />
          ))}
        </section>
      )}

      {activeTab === "bookings" && (
        <section className="flex flex-col gap-4">
          <ListState
            loading={bookingsLoading}
            error={bookingsError}
            empty={bookings.length === 0}
            emptyText="Keine Service-Bookings gefunden."
          />
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </section>
      )}
    </main>
  )
}
