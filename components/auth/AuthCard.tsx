import Link from "next/link"

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
    <main className="mx-auto flex min-h-screen w-full max-w-[520px] items-center justify-center px-6 py-10">
      <section className="w-full rounded-2xl border border-secondary bg-background p-6 md:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-text">{title}</h1>
        <p className="mt-1 text-sm text-text/55">{subtitle}</p>

        <div className="mt-6">{children}</div>

        <p className="mt-6 text-sm text-text/60">
          {footerText}{" "}
          <Link href={footerHref} className="font-medium text-primary hover:underline">
            {footerLinkText}
          </Link>
        </p>
      </section>
    </main>
  )
}
