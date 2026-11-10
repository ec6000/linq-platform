import type { Metadata } from "next"
import LegalPage from "@/components/marketing/LegalPage"

export const metadata: Metadata = { title: "Impressum", robots: { index: false } }

// Platzhalter in eckigen Klammern vor dem Livegang ersetzen (§ 5 DDG).
export default function ImpressumPage() {
  return (
    <LegalPage title="Impressum">
      <section>
        <h2>Anbieter</h2>
        <p>
          [Vor- und Nachname bzw. Firma]
          <br />
          [Straße und Hausnummer]
          <br />
          [PLZ] Köln
        </p>
      </section>
      <section>
        <h2>Kontakt</h2>
        <p>
          E-Mail: [kontakt@…]
          <br />
          Telefon: [optional]
        </p>
      </section>
      <section>
        <h2>Verantwortlich für den Inhalt</h2>
        <p>[Name, Anschrift wie oben]</p>
      </section>
    </LegalPage>
  )
}
