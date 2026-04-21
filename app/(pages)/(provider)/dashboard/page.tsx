"use client"
import { Briefcase } from "lucide-react";
import { useJobs } from "@/lib/hooks/useJobs";
import JobCard from "@/components/dashboard/JobCard";

export default function Dashboard() {
  const { jobs, loading, error } = useJobs();

  return (
    <main className="mx-auto max-w-[1600px] px-6 py-10">
      <div className="mb-8 flex items-center gap-3">
        <Briefcase size={22} className="text-primary" strokeWidth={1.8} />
        <h1 className="text-[22px] font-semibold tracking-tight text-text">
          Meine Jobs
        </h1>
      </div>

      {loading && (
        <p className="text-sm text-text/40">Jobs werden geladen…</p>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {!loading && !error && jobs.length === 0 && (
        <p className="text-sm text-text/40">Keine Jobs gefunden.</p>
      )}

      <div className="flex flex-col gap-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </main>
  );
}