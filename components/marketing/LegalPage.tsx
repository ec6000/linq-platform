/** Plain reading layout for the legal pages: one column, generous spacing, nothing else. */
export default function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="shell max-w-2xl py-16 md:py-24">
      <h1 className="display text-[36px] text-primary md:text-[44px]">{title}</h1>
      <div className="mt-10 flex flex-col gap-8 text-[15px] leading-relaxed text-text/70 [&_h2]:mb-2 [&_h2]:text-[16px] [&_h2]:font-semibold [&_h2]:text-text">
        {children}
      </div>
    </article>
  )
}
