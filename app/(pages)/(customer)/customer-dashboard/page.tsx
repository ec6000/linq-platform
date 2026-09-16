"use client"

import Link from "next/link"
import { ArrowRight, PlusCircle, Search, User } from "lucide-react"
import PageHeader from "@/components/layout/PageHeader"

const cards = [
  {
    icon: PlusCircle,
    title: "Auftrag erstellen",
    text: "Beschreibe in zwei Minuten, was du brauchst – und erhalte Angebote von passenden Dienstleistern.",
    href: "/my-orders/create",
    cta: "Auftrag erstellen",
    primary: true,
  },
  {
    icon: Search,
    title: "Services durchsuchen",
    text: "Stöbere direkt durch aktive Angebote in Köln und frage unverbindlich an.",
    href: "/find-services",
    cta: "Services ansehen",
  },
  {
    icon: User,
    title: "Profil vervollständigen",
    text: "Pflege deine Kontaktdaten, damit Dienstleister dich schneller erreichen.",
    href: "/customer-profile",
    cta: "Zum Profil",
  },
]

export default function CustomerDashboardPage() {
  return (
    <main id="main" className="shell-wide py-10 md:py-12">
      <PageHeader
        title="Willkommen bei LiNQ"
        description="Von hier aus startest du einen Auftrag oder findest direkt den passenden Service."
      />

      <section className="grid gap-4 md:grid-cols-3">
        {cards.map(({ icon: Icon, title, text, href, cta, primary }) => (
          <article key={title} className="card card-interactive flex flex-col p-6">
            <Icon size={20} strokeWidth={1.7} className="mb-5 text-accent-ink" aria-hidden />
            <h2 className="text-[16px] font-semibold text-text">{title}</h2>
            <p className="mt-2 flex-1 text-[14px] leading-relaxed text-text/60">{text}</p>
            <Link
              href={href}
              className={`btn btn-sm mt-6 self-start ${primary ? "btn-primary" : "btn-outline"}`}
            >
              {cta}
              <ArrowRight size={14} strokeWidth={2.2} aria-hidden />
            </Link>
          </article>
        ))}
      </section>
    </main>
  )
}
