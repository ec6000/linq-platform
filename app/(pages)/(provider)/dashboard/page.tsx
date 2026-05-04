"use client"

import { useMemo, useState } from "react"
import { Briefcase, CalendarClock, HandCoins } from "lucide-react"
import { useJobs } from "@/lib/hooks/useJobs"
import { useBookings } from "@/lib/hooks/useBookings"
import { useCategories } from "@/lib/hooks/useCategory"
import JobCard from "@/components/dashboard/JobCard"
import BookingCard from "@/components/dashboard/BookingCard"
import { JobStatus } from "@/lib/types/job"
import { useAuth } from "@/components/auth/AuthProvider"
import { useProviderOffers } from "@/lib/hooks/useProviderOffers"
import OfferCard from "@/components/dashboard/OfferCard"

type DashboardTab = "jobs" | "offers" | "bookings"
type JobFilter = "all" | JobStatus.pending | JobStatus.inProgress | JobStatus.completed | JobStatus.accepted | JobStatus.cancelled

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("jobs")
  const [activeJobFilter, setActiveJobFilter] = useState<JobFilter>("all")
  const { user } = useAuth()
  const { jobs, loading: jobsLoading, error: jobsError } = useJobs()
  const { bookings, loading: bookingsLoading, error: bookingsError } = useBookings()
  const { offers, loading: offersLoading, error: offersError } = useProviderOffers(user?.uid)
  const { categories } = useCategories()

  const categoryLookup = useMemo(() => {
    const byCategoryId = new Map<string, string>()
    const bySubcategoryId = new Map<string, string>()

    categories.forEach((category) => {
      byCategoryId.set(category.id, category.nameDE)
      category.subcategories.forEach((subcategory) => bySubcategoryId.set(subcategory.id, subcategory.nameDE))
    })

    return { byCategoryId, bySubcategoryId }
  }, [categories])

  const visibleJobs = useMemo(() => (activeJobFilter === "all" ? jobs : jobs.filter((job) => job.status === activeJobFilter)), [activeJobFilter, jobs])

  return (
    <main className="mx-auto max-w-[1600px] px-6 py-10">
      <div className="mb-6 flex items-center gap-3">
        <Briefcase size={22} className="text-primary" strokeWidth={1.8} />
        <h1 className="text-[22px] font-semibold tracking-tight text-text">Dashboard</h1>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setActiveTab("jobs")} className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition ${activeTab === "jobs" ? "border-primary/30 bg-primary/10 text-primary" : "border-secondary text-text/65 hover:bg-secondary"}`}>
          Jobs
        </button>
        <button type="button" onClick={() => setActiveTab("offers")} className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition ${activeTab === "offers" ? "border-primary/30 bg-primary/10 text-primary" : "border-secondary text-text/65 hover:bg-secondary"}`}>
          <span className="inline-flex items-center gap-1.5"><HandCoins size={14} />Preisangebote</span>
        </button>
        <button type="button" onClick={() => setActiveTab("bookings")} className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition ${activeTab === "bookings" ? "border-primary/30 bg-primary/10 text-primary" : "border-secondary text-text/65 hover:bg-secondary"}`}>
          <span className="inline-flex items-center gap-1.5"><CalendarClock size={14} />Service-Bookings</span>
        </button>
      </div>

      {activeTab === "jobs" && <section className="flex flex-col gap-3">{/* same */}
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {([{ key: "all", label: "Alle" }, { key: JobStatus.pending, label: "Ausstehend" }, { key: JobStatus.inProgress, label: "In Arbeit" }, { key: JobStatus.completed, label: "Abgeschlossen" }, { key: JobStatus.accepted, label: "Bestätigt" }, { key: JobStatus.cancelled, label: "Storniert" }] as const).map((chip) => {
            const selected = activeJobFilter === chip.key
            return <button key={chip.key} type="button" onClick={() => setActiveJobFilter(chip.key)} className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition ${selected ? "border-primary/30 bg-primary/10 text-primary" : "border-secondary text-text/65 hover:bg-secondary"}`}>{chip.label}</button>
          })}
        </div>
        {jobsLoading && <p className="text-sm text-text/40">Jobs werden geladen…</p>}
        {jobsError && <p className="text-sm text-red-500">{jobsError}</p>}
        {!jobsLoading && !jobsError && visibleJobs.length === 0 && <p className="text-sm text-text/40">Keine Jobs gefunden.</p>}
        {visibleJobs.map((job) => <JobCard key={job.id} job={job} categoryName={categoryLookup.byCategoryId.get(job.categoryId)} subcategoryName={job.subcategoryId ? categoryLookup.bySubcategoryId.get(job.subcategoryId) : undefined} />)}
      </section>}

      {activeTab === "offers" && <section className="flex flex-col gap-3">
        {offersLoading && <p className="text-sm text-text/40">Preisangebote werden geladen…</p>}
        {offersError && <p className="text-sm text-red-500">{offersError}</p>}
        {!offersLoading && !offersError && offers.length === 0 && <p className="text-sm text-text/40">Noch keine Preisangebote gesendet.</p>}
        {offers.map((offer) => <OfferCard key={`${offer.orderId}-${offer.id}`} offer={offer} />)}
      </section>}

      {activeTab === "bookings" && <section className="flex flex-col gap-3">
        {bookingsLoading && <p className="text-sm text-text/40">Bookings werden geladen…</p>}
        {bookingsError && <p className="text-sm text-red-500">{bookingsError}</p>}
        {!bookingsLoading && !bookingsError && bookings.length === 0 && <p className="text-sm text-text/40">Keine Service-Bookings gefunden.</p>}
        {bookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)}
      </section>}
    </main>
  )
}
