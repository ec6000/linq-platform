"use client"

import Logo from "@/components/brand/Logo"

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md text-center">
        <Logo size="md" className="mb-12" />

        <p className="eyebrow eyebrow-plain justify-center">Etwas ist schiefgelaufen</p>

        <h1 className="display mt-4 text-[34px] leading-tight text-primary md:text-[40px]">
          Die Seite konnte nicht geladen werden.
        </h1>

        <p className="mt-4 text-[15px] leading-relaxed text-text/55">
          Meist hilft ein zweiter Versuch. Bleibt der Fehler bestehen, melde dich kurz bei uns.
        </p>

        <button type="button" onClick={reset} className="btn btn-primary btn-lg mt-9">
          Erneut versuchen
        </button>
      </div>
    </main>
  )
}
