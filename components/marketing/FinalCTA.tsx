import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/motion/Reveal";

/**
 * The close. The one dark moment on the page, so the last thing you see
 * is the one thing we want you to do.
 */
export default function FinalCTA() {
  return (
    <section aria-labelledby="final-cta-heading" className="section">
      <div className="shell">
        <Reveal>
          <div
            className="relative overflow-hidden rounded-2xl px-6 py-20 text-center md:px-16 md:py-28"
            style={{ background: "var(--primary-deep)" }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 aurora"
              style={{
                background:
                  "radial-gradient(55% 60% at 50% 0%, color-mix(in srgb, var(--accent) 22%, transparent) 0%, transparent 68%)",
              }}
            />

            <div className="relative mx-auto flex max-w-2xl flex-col items-center">
              <h2
                id="final-cta-heading"
                className="display text-[36px] leading-[1.08] text-white md:text-[52px]"
              >
                Der nächste Auftrag ist
                <br />
                <span className="text-accent">zwei Minuten entfernt.</span>
              </h2>

              <p className="mt-7 max-w-lg text-[16px] leading-relaxed text-white/65 md:text-[17px]">
                Registrierung kostenlos, kein Abo, keine Vermittlungsgebühr für den Start.
                Egal ob du Hilfe suchst oder anbietest.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="btn btn-lg bg-white text-primary hover:bg-white/90"
                >
                  Kostenlos registrieren
                  <ArrowRight size={17} strokeWidth={2.2} aria-hidden />
                </Link>
                <Link
                  href="/login"
                  className="btn btn-lg border-white/20 bg-transparent text-white hover:border-white/40 hover:bg-white/8"
                >
                  Anmelden
                </Link>
              </div>

              <p className="mt-8 text-[13px] text-white/40">Gestartet in Köln. Made in Köln.</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
