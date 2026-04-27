"use client"

import { useMemo, useState } from "react"
import { Briefcase, CalendarClock } from "lucide-react"
import { useJobs } from "@/lib/hooks/useJobs"
import { useBookings } from "@/lib/hooks/useBookings"
import JobCard from "@/components/dashboard/JobCard"
import BookingCard from "@/components/dashboard/BookingCard"
import { useAuth } from "@/components/auth/AuthProvider"

type DashboardTab = "jobs" | "bookings"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("jobs")
  const { user } = useAuth()

  const { jobs, loading: jobsLoading, error: jobsError } = useJobs()
  const { bookings, loading: bookingsLoading, error: bookingsError } = useBookings()

  const visibleJobs = useMemo(() => jobs, [jobs])

  const providerBookings = useMemo(
    () => bookings.filter((booking) => !user || booking.providerId === user.uid),
    [bookings, user],
  )

  return (
    <main className="mx-auto max-w-[1600px] px-6 py-10">
      <div className="mb-6 flex items-center gap-3">
        <Briefcase size={22} className="text-primary" strokeWidth={1.8} />
        <h1 className="text-[22px] font-semibold tracking-tight text-text">Dashboard</h1>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("jobs")}
          className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition ${
            activeTab === "jobs"
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-secondary text-text/65 hover:bg-secondary"
          }`}
        >
          Jobs
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("bookings")}
          className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition ${
            activeTab === "bookings"
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-secondary text-text/65 hover:bg-secondary"
          }`}
        >
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock size={14} />
            Service-Bookings
          </span>
        </button>
      </div>

      {activeTab === "jobs" && (
        <section className="flex flex-col gap-3">
          {jobsLoading && <p className="text-sm text-text/40">Jobs werden geladen…</p>}
          {jobsError && <p className="text-sm text-red-500">{jobsError}</p>}

          {!jobsLoading && !jobsError && visibleJobs.length === 0 && (
            <p className="text-sm text-text/40">Keine Jobs gefunden.</p>
          )}

          {visibleJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </section>
      )}

      {activeTab === "bookings" && (
        <section className="flex flex-col gap-3">
          {bookingsLoading && <p className="text-sm text-text/40">Bookings werden geladen…</p>}
          {bookingsError && <p className="text-sm text-red-500">{bookingsError}</p>}

          {!bookingsLoading && !bookingsError && providerBookings.length === 0 && (
            <p className="text-sm text-text/40">Keine Service-Bookings gefunden.</p>
          )}

          {providerBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </section>
      )}
    </main>
  )
}
