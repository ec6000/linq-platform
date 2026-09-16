# LiNQ

Next.js-App für lokale Dienstleistungen in Köln. Kunden veröffentlichen Aufträge oder fragen Services an; Anbieter verwalten Services, Angebote, Buchungen und Jobs.

## Lokal starten

Node.js 22 und pnpm 10.34.4 verwenden. Die Prüfungen dieses Durchlaufs liefen lokal mit Node.js 20.17; CI verwendet Node.js 22.

```powershell
pnpm install --frozen-lockfile
Copy-Item .env.local.example .env.local
# Eigene Firebase- und Geoapify-Werte in .env.local eintragen.
pnpm dev
```

Eine bereits vorhandene `.env.local` nicht überschreiben. Secrets und Service-Account-Dateien werden nicht eingecheckt.

| Variable | Verwendung |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase-Web-App; Auth und Firestore müssen im Projekt konfiguriert sein |
| `GEOAPIFY_API_KEY` | Nur auf dem Server; Ortsvorschläge für Köln |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Optional; ohne Schlüssel bleibt die Listenansicht nutzbar |
| `NEXT_PUBLIC_SITE_URL` | Öffentliche Basis-URL für SEO; vor Veröffentlichung auf die tatsächliche Domain setzen |

Browser-Schlüssel sind öffentlich. Den Maps-Schlüssel bei Google auf die eigenen Domains und die Maps JavaScript API einschränken. Firebase-Zugriffe benötigen unabhängig davon Security Rules.

## Prüfen und bauen

```powershell
pnpm check
pnpm build
pnpm audit --prod
pnpm audit
```

`check` führt ESLint ohne tolerierte Warnungen, die Next-Routentypgenerierung, TypeScript und die Regressionstests aus. Der Test-Runner funktioniert unter Windows und Linux ohne Shell-Globs.

Der Build lädt Expletus Sans über `next/font/google`. Für einen frischen Build ist Zugang zu Google Fonts erforderlich; die ausgelieferte Schrift wird von Next.js selbst gehostet. Die zentrale Definition liegt in `lib/fonts.ts`. Für vollständig netzwerkunabhängige Builds muss die Schrift samt Lizenz lokal eingebunden werden.

`.github/workflows/check.yml` führt die Checks und den Build mit Firebase-Demokonfiguration aus. Diese Konfiguration führt keine Cloud-Schreibtests aus.

## Struktur

| Verzeichnis | Verantwortung |
| --- | --- |
| `app/` | Routen, Layouts, Fehlerseiten und serverseitiger Geoapify-Endpunkt |
| `components/` | Darstellung und Formularzustand; gemeinsam genutztes Profil- und Ortsformular |
| `lib/hooks/` | React-Abonnements und UI-Zustand |
| `lib/data/` | Schreibabläufe für Aufträge, Angebote, Jobs, Services und Buchungen |
| `lib/firebase/` | Firebase-Verbindung, Dokument-IDs, Sitzungsprüfung |
| `lib/types/` | Fachliche Typen |
| `lib/utils/` | Validierung, Statusübergänge, Entfernungen und Kategorien |
| `scripts/` | Test-Runner und bewusst auszuführende Testdaten-Seeds |
| `tests/` | Regressionstests ohne Live-Datenbankzugriff |

Abfragen werden in `useFirestoreQuery` abonniert und beim Unmount abgemeldet. Abfragewechsel zeigen keine Ergebnisse des vorherigen Nutzers. Neue Abfragen müssen per `useMemo` stabilisiert werden; Decoder gehören außerhalb des Hooks.

Datenoperationen prüfen Sitzung, Rolle und Eigentümer für konsistente Fehlermeldungen. **Diese Browserprüfungen ersetzen keine Firestore Security Rules.**

## Datenkonventionen

- `users/{firebaseUid}` enthält die eindeutige numerische `id` sowie `role`.
- Aufträge, Services, Buchungen und Jobs verwenden numerische `id`-Felder und dezimale Dokument-IDs. `firestoreId` wird beim Lesen ergänzt.
- Geldbeträge sind ganzzahlige Cent-Beträge. Koordinaten sind Firestore-`GeoPoint`, Zeitpunkte Firestore-`Timestamp`.
- Neue Angebote liegen unter `orders/{orderId}/offers/{providerId}`. Alte zufällige Angebots-IDs bleiben lesbar.
- ID-Zähler und neue Dokumente werden zusammen angelegt. Ein veralteter Zähler verursacht einen Fehler statt Datenverlust.
- Angebotsannahme schreibt Angebot, Auftragsvergabe und neuen Job in einer Transaktion. Die Annahme zweier Angebote für denselben Auftrag wird dadurch verhindert.
- Jobstart, Abschluss und Stornierung aktualisieren bei auftragsbasierten Jobs auch den zugehörigen Auftrag.
- Offene Aufträge werden storniert statt samt Historie gelöscht. Vergebene Aufträge lassen sich nicht mehr über das Auftragsformular bearbeiten.
- Buchungsannahme bestätigt derzeit die Anfrage; Preisverhandlung und Umwandlung einer Servicebuchung in einen Job sind noch kein vollständiger Produktablauf.

Bestehende Daten werden durch die Bereinigung nicht migriert. Vor einem Rollout Zähler, numerische Nutzerzuordnungen, alte `0,0`-Standorte und bereits doppelte Angebote prüfen.

## Firestore-Konfiguration

Die tatsächlich deployed Security Rules liegen diesem Repository nicht bei und wurden nicht verändert. Vor Produktivbetrieb müssen Regeln für Eigentümer, unveränderbare Nutzer-ID/Rolle, zulässige Statusübergänge und atomare Mehrdokumentänderungen versioniert und mit dem Emulator getestet werden.

Für `collectionGroup("offers")` wird ein Gruppenindex auf `providerId` benötigt. `firestore.indexes.json` enthält dessen Definition. Diese Datei in die bestehende Firebase-Deploymentkonfiguration übernehmen und mit vorhandenen Indizes zusammenführen; sie wurde nicht deployed.

Die bisherigen Collections `Categories` und `categories` werden aus Kompatibilitätsgründen weiter unterstützt. Die großgeschriebene Collection hat wie bisher Vorrang. Bei einer späteren Migration einen einzigen Namen festlegen.

## Testdaten

Seeds verwenden Admin-Zugriff und gehören in eine separate, leere Testdatenbank. Für den Emulator:

```powershell
$env:FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080"
$env:GCLOUD_PROJECT = "demo-linq"
pnpm seed:categories
pnpm seed:services
pnpm seed:orders
pnpm seed:jobs
pnpm seed:bookings
```

Der Emulator muss separat laufen. Die Skripte starten ihn nicht und ändern keine Client-Konfiguration. Ohne Emulator ist eine explizite Projektbestätigung erforderlich:

```powershell
pnpm seed:categories --confirm-project mein-testprojekt
```

Dafür muss `serviceAccountKey.json` zu genau diesem Projekt gehören. Die Seeds verwenden Create-Preconditions und überschreiben vorhandene Dokumente oder Zähler nicht. Kategorien werden je Kategorie als Batch geschrieben; bei einem späteren Fehler können frühere Kategorien bereits vorhanden sein. Numerische Seed-Nutzer sind Beispieldaten und müssen zu den Testkonten passen.

## Prüfergebnis und offene Punkte

Details und Grenzen der Bereinigung stehen in [docs/project-audit.md](docs/project-audit.md). Insbesondere Firebase-Autorisierung und vollständige Abläufe mit zwei realen Testkonten sind vor einem Produktivstart zusätzlich zu prüfen.
