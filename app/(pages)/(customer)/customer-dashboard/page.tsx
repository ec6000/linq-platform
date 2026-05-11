"use client"

import { LayoutDashboard, PlusCircle, User } from "lucide-react"
import Link from "next/link"

export default function CustomerDashboardPage() {
  return (
    <main className="mx-auto max-w-[1600px] px-6 py-10">
      <div className="mb-8 flex items-center gap-3">
        <LayoutDashboard size={22} className="text-primary" strokeWidth={1.8} />
        <h1 className="text-[22px] font-semibold tracking-tight text-text">
          Kunden-Dashboard
        </h1>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-secondary bg-background p-5">
          <div className="mb-3 flex items-center gap-2 text-primary">
            <PlusCircle size={18} strokeWidth={1.8} />
            <h2 className="text-sm font-semibold text-text">Neuen Auftrag vorbereiten</h2>
          </div>
          <p className="text-sm leading-6 text-text/70">
            Hier entsteht der Kundenbereich, in dem Kunden künftig Aufträge erstellen und passende Provider finden.
          </p>
        </article>

        <article className="rounded-2xl border border-secondary bg-background p-5">
          <div className="mb-3 flex items-center gap-2 text-primary">
            <User size={18} strokeWidth={1.8} />
            <h2 className="text-sm font-semibold text-text">Profil vervollständigen</h2>
          </div>
          <p className="mb-4 text-sm leading-6 text-text/70">
            Pflege deine Kundendaten, damit Provider dich später schneller erreichen können.
          </p>
          <Link
            href="/customer-profile"
            className="inline-flex rounded-xl border border-secondary px-4 py-2 text-sm font-medium text-text transition hover:bg-secondary/40"
          >
            Zum Kundenprofil
          </Link>
        </article>
      </section>
    </main>
  )
}
