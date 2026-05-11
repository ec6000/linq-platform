"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowRight, BadgeCheck, Filter, MapPin, Search, SlidersHorizontal, Sparkles, Star } from "lucide-react"
import { useCategories } from "@/lib/hooks/useCategory"
import { useServices } from "@/lib/hooks/useServices"
import { PricingType, Service, ServiceStatus } from "@/lib/types/service"

type SortKey = "recommended" | "priceAsc" | "priceDesc" | "radiusAsc"

const pricingLabel: Record<PricingType, string> = {
  [PricingType.fixed]: "Festpreis",
  [PricingType.perHour]: "pro Stunde",
  [PricingType.perUnit]: "pro Einheit",
}

function formatBudget(service: Service) {
  const min = (service.minBudgetInCent / 100).toLocaleString("de-DE")
  const max = (service.maxBudgetInCent / 100).toLocaleString("de-DE")
  const suffix = service.pricingType === PricingType.perUnit && service.unitName ? ` / ${service.unitName}` : service.pricingType === PricingType.perHour ? " / Std." : ""

  return `${min}–${max} €${suffix}`
}

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

export default function ServiceSearchPage() {
  const { services, loading, error } = useServices()
  const { categories } = useCategories()
  const [query, setQuery] = useState("")
  const [categoryId, setCategoryId] = useState("all")
  const [pricingType, setPricingType] = useState("all")
  const [city, setCity] = useState("")
  const [maxBudget, setMaxBudget] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("recommended")

  const citySuggestions = useMemo(() => {
    return Array.from(new Set(services.map((service) => service.city).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b, "de"))
  }, [services])

  const activeServices = useMemo(() => services.filter((service) => service.status === ServiceStatus.active), [services])

  const filteredServices = useMemo(() => {
    const search = normalize(query.trim())
    const citySearch = normalize(city.trim())
    const maxBudgetInCent = maxBudget ? Number(maxBudget) * 100 : null

    return activeServices
      .filter((service) => {
        const haystack = normalize([service.title, service.description, service.providerName, service.city, service.categoryName, service.categoryId].filter(Boolean).join(" "))
        const matchesSearch = !search || haystack.includes(search)
        const matchesCategory = categoryId === "all" || service.categoryId === categoryId
        const matchesPricing = pricingType === "all" || service.pricingType === pricingType
        const matchesCity = !citySearch || normalize(service.city ?? "").includes(citySearch)
        const matchesBudget = maxBudgetInCent === null || service.minBudgetInCent <= maxBudgetInCent

        return matchesSearch && matchesCategory && matchesPricing && matchesCity && matchesBudget
      })
      .sort((a, b) => {
        if (sortKey === "priceAsc") return a.minBudgetInCent - b.minBudgetInCent
        if (sortKey === "priceDesc") return b.maxBudgetInCent - a.maxBudgetInCent
        if (sortKey === "radiusAsc") return a.radius - b.radius
        return b.id - a.id
      })
  }, [activeServices, categoryId, city, maxBudget, pricingType, query, sortKey])

  const hasFilters = query || categoryId !== "all" || pricingType !== "all" || city || maxBudget

  function resetFilters() {
    setQuery("")
    setCategoryId("all")
    setPricingType("all")
    setCity("")
    setMaxBudget("")
    setSortKey("recommended")
  }

  return (
    <main className="mx-auto max-w-[1600px] px-6 py-8 md:px-10">
      <section className="overflow-hidden rounded-[2rem] border border-secondary bg-gradient-to-br from-primary/10 via-background to-accent/10 p-6 md:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/70 px-3 py-1 text-[13px] font-medium text-primary">
              <Sparkles size={14} /> Service finden
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-text md:text-5xl">Finde genau den Service, der zu deinem Auftrag passt.</h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-text/65">Suche nach Tätigkeit, Anbieter, Kategorie oder Ort. Feine Filter helfen dir, Budget, Einsatzgebiet und Abrechnungsmodell sofort passend einzugrenzen.</p>
          </div>
          <div className="grid min-w-[220px] grid-cols-3 gap-3 rounded-2xl border border-secondary bg-background/80 p-4 text-center shadow-sm">
            <div><p className="text-2xl font-semibold text-text">{activeServices.length}</p><p className="text-xs text-text/45">aktive Services</p></div>
            <div><p className="text-2xl font-semibold text-text">{categories.length}</p><p className="text-xs text-text/45">Kategorien</p></div>
            <div><p className="text-2xl font-semibold text-text">24h</p><p className="text-xs text-text/45">Ø Antwort</p></div>
          </div>
        </div>
      </section>

      <section className="sticky top-20 z-20 mt-6 rounded-3xl border border-secondary bg-background/95 p-4 shadow-sm backdrop-blur">
        <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_0.8fr_0.8fr_1fr]">
          <label className="relative block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text/35" size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Was brauchst du? z.B. Umzug, Fenster, Nachhilfe…" className="h-12 w-full rounded-2xl border border-secondary bg-background pl-11 pr-4 text-sm outline-none transition focus:border-primary/40" />
          </label>

          <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="h-12 rounded-2xl border border-secondary bg-background px-4 text-sm text-text outline-none transition focus:border-primary/40">
            <option value="all">Alle Kategorien</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.nameDE}</option>)}
          </select>

          <input value={city} onChange={(event) => setCity(event.target.value)} list="service-cities" placeholder="Ort / Stadtteil" className="h-12 rounded-2xl border border-secondary bg-background px-4 text-sm outline-none transition focus:border-primary/40" />
          <datalist id="service-cities">{citySuggestions.map((suggestion) => <option key={suggestion} value={suggestion} />)}</datalist>

          <select value={pricingType} onChange={(event) => setPricingType(event.target.value)} className="h-12 rounded-2xl border border-secondary bg-background px-4 text-sm text-text outline-none transition focus:border-primary/40">
            <option value="all">Preisart</option>
            {Object.values(PricingType).map((value) => <option key={value} value={value}>{pricingLabel[value]}</option>)}
          </select>

          <input value={maxBudget} onChange={(event) => setMaxBudget(event.target.value)} inputMode="numeric" placeholder="Max. €" className="h-12 rounded-2xl border border-secondary bg-background px-4 text-sm outline-none transition focus:border-primary/40" />

          <select value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)} className="h-12 rounded-2xl border border-secondary bg-background px-4 text-sm text-text outline-none transition focus:border-primary/40">
            <option value="recommended">Empfohlen</option>
            <option value="priceAsc">Preis aufsteigend</option>
            <option value="priceDesc">Preis absteigend</option>
            <option value="radiusAsc">Nächste zuerst</option>
          </select>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-text/55">
          <div className="flex items-center gap-2"><SlidersHorizontal size={15} /> {filteredServices.length} passende Services gefunden</div>
          {hasFilters && <button type="button" onClick={resetFilters} className="rounded-full px-3 py-1.5 text-primary transition hover:bg-primary/10">Filter zurücksetzen</button>}
        </div>
      </section>

      <section className="mt-6">
        {loading && <p className="rounded-2xl border border-secondary p-6 text-sm text-text/50">Services werden geladen…</p>}
        {error && <p className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">{error}</p>}
        {!loading && !error && filteredServices.length === 0 && <div className="rounded-3xl border border-secondary p-10 text-center"><Filter className="mx-auto mb-3 text-text/30" /><h2 className="text-lg font-semibold text-text">Keine Services gefunden</h2><p className="mt-1 text-sm text-text/55">Passe deine Filter an oder suche nach einem allgemeineren Begriff.</p></div>}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredServices.map((service) => (
            <article key={service.id} className="group overflow-hidden rounded-3xl border border-secondary bg-background transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg">
              <div className="relative h-48 bg-secondary">
                {service.imageUrl ? <Image src={service.imageUrl} alt={service.title} fill sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover transition duration-300 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-text/30">Kein Bild</div>}
                <div className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-text shadow-sm">#{service.id}</div>
              </div>
              <div className="p-5">
                <div className="mb-2 flex items-center justify-between gap-3"><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{service.categoryName || service.categoryId}</span><span className="flex items-center gap-1 text-xs text-text/45"><Star size={13} className="fill-accent text-accent" /> 4,9</span></div>
                <h2 className="line-clamp-2 text-lg font-semibold leading-snug text-text">{service.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-text/58">{service.description}</p>
                <div className="mt-4 flex items-center gap-2 text-sm text-text/60"><BadgeCheck size={16} className="text-primary" /> {service.providerName}</div>
                {service.city && <div className="mt-2 flex items-center gap-2 text-sm text-text/55"><MapPin size={16} /> {service.city} · {service.radius} km Radius</div>}
                <div className="mt-5 flex items-end justify-between gap-3"><div><p className="text-xs text-text/40">Budget</p><p className="text-xl font-semibold text-text">{formatBudget(service)}</p></div><Link href={`/service-finden/${service.id}`} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">Details <ArrowRight size={15} /></Link></div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
