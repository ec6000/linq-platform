export default function TrustStrip() {
  return (
    <section
      aria-label="Vertrauensinformationen"
      className="border-y"
      style={{ borderColor: "var(--secondary)" }}
    >
      <div className="mx-auto max-w-[1280px] px-6 md:px-10 py-6">
        <div className="flex flex-wrap items-center justify-center md:justify-between gap-x-10 gap-y-4">
          <div
            className="flex items-center gap-3 text-[13px] md:text-[14px]"
            style={{ color: "var(--text)", opacity: 0.65 }}
          >
            <span
              className="text-[22px] font-semibold leading-none"
              style={{ color: "var(--primary)" }}
            >
              100%
            </span>
            Lokal in Köln
          </div>

          <div
            className="hidden md:block h-4 w-px"
            style={{ background: "var(--secondary)" }}
            aria-hidden
          />

          <div
            className="flex items-center gap-3 text-[13px] md:text-[14px]"
            style={{ color: "var(--text)", opacity: 0.65 }}
          >
            <span
              className="text-[22px] font-semibold leading-none"
              style={{ color: "var(--primary)" }}
            >
              &lt;2&nbsp;Min
            </span>
            Auftrag veröffentlichen
          </div>

          <div
            className="hidden md:block h-4 w-px"
            style={{ background: "var(--secondary)" }}
            aria-hidden
          />

          <div
            className="flex items-center gap-3 text-[13px] md:text-[14px]"
            style={{ color: "var(--text)", opacity: 0.65 }}
          >
            <span
              className="text-[22px] font-semibold leading-none"
              style={{ color: "var(--primary)" }}
            >
              0&nbsp;€
            </span>
            Registrierung
          </div>

          <div
            className="hidden md:block h-4 w-px"
            style={{ background: "var(--secondary)" }}
            aria-hidden
          />

          <div
            className="flex items-center gap-3 text-[13px] md:text-[14px]"
            style={{ color: "var(--text)", opacity: 0.65 }}
          >
            <span
              className="text-[22px] font-semibold leading-none"
              style={{ color: "var(--primary)" }}
            >
              7&nbsp;Tage
            </span>
            Support-Reaktion
          </div>
        </div>
      </div>
    </section>
  );
}
