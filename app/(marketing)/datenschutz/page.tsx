import type { Metadata } from "next"
import LegalPage from "@/components/marketing/LegalPage"

export const metadata: Metadata = { title: "Datenschutz", robots: { index: false } }

// Beschreibt, was die App tatsächlich verarbeitet. Vor dem Livegang rechtlich prüfen lassen.
export default function DatenschutzPage() {
  return (
    <LegalPage title="Datenschutz">
      <section>
        <h2>Verantwortlich</h2>
        <p>[Name und Anschrift wie im Impressum]</p>
      </section>
      <section>
        <h2>Was wir speichern</h2>
        <p>
          Für dein Konto: Name, E-Mail und, wenn du sie angibst, Telefon und Firma. Für Aufträge und Anfragen:
          Beschreibung, Termin, Preis und Adresse. Dienstleister sehen von einem Auftrag nur den Stadtteil. Die genaue
          Adresse sowie Telefon und E-Mail erhält nur, mit wem du einen Job vereinbarst.
        </p>
      </section>
      <section>
        <h2>Dienste, die wir nutzen</h2>
        <p>
          Google Firebase (Anmeldung und Datenbank), Geoapify (Adressvorschläge, nur der eingegebene Suchtext) und, falls
          aktiviert, Google Maps für die Kartenansicht. Schriften werden von uns selbst ausgeliefert. Es gibt keine
          Werbung und kein Tracking.
        </p>
      </section>
      <section>
        <h2>Deine Rechte</h2>
        <p>
          Du kannst Auskunft, Berichtigung und Löschung deiner Daten verlangen. Schreib dafür an [kontakt@…].
        </p>
      </section>
    </LegalPage>
  )
}
