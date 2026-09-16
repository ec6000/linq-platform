import Link from "next/link"
import Logo from "@/components/brand/Logo"

interface AuthCardProps {
  title: string
  subtitle: string
  footerText: string
  footerLinkText: string
  footerHref: string
  children: React.ReactNode
}

export default function AuthCard({
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerHref,
  children,
}: AuthCardProps) {
  return (
    <main
      id="main"
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-6 py-12"
    >
      {/* The same glow that opens the landing page, so signing in feels like the same product. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-48 h-[520px] aurora"
        style={{
          background:
            "radial-gradient(48% 50% at 50% 40%, color-mix(in srgb, var(--accent) 14%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-[440px]">
        <Link href="/" className="mb-10 flex justify-center" aria-label="LiNQ Startseite">
          <Logo size="lg" />
        </Link>

        <section className="card bg-background p-7 shadow-sm md:p-8">
          <h1 className="text-[24px] font-semibold tracking-tight text-text">{title}</h1>
          <p className="mt-1.5 text-[14px] leading-relaxed text-text/55">{subtitle}</p>

          <div className="mt-7">{children}</div>
        </section>

        <p className="mt-6 text-center text-[14px] text-text/55">
          {footerText}{" "}
          <Link href={footerHref} className="font-semibold text-primary hover:underline">
            {footerLinkText}
          </Link>
        </p>
      </div>
    </main>
  )
}
