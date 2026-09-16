import Link from "next/link"
import { ArrowRight } from "lucide-react"
import Logo from "@/components/brand/Logo"

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="mb-12 inline-flex" aria-label="LiNQ Startseite">
          <Logo size="md" />
        </Link>

        <p className="eyebrow eyebrow-plain num justify-center">404</p>

        <h1 className="display mt-4 text-[34px] leading-tight text-primary md:text-[40px]">
          Diese Seite gibt es nicht.
        </h1>

        <p className="mt-4 text-[15px] leading-relaxed text-text/55">
          Vielleicht wurde sie verschoben, vielleicht war der Link nur einen Tick daneben.
        </p>

        <Link href="/" className="btn btn-primary btn-lg mt-9">
          Zur Startseite
          <ArrowRight size={16} strokeWidth={2.2} aria-hidden />
        </Link>
      </div>
    </main>
  )
}
