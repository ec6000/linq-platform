# LiNQ

Umzugshilfe in Köln, direkt von Helfern aus dem Veedel. Kunden beschreiben, was ansteht, Dienstleister schicken ihren Preis, und mit der Zusage tauschen beide ihre Kontaktdaten aus.

Next.js (App Router), Firebase Auth und Firestore. Kein eigener Server außer einem Endpunkt für Adressvorschläge.

## Die zwei Wege zu einem Job

```
Weg A   Service → Anfrage → Job     Der Kunde fragt einen veröffentlichten Service an,
                                    der Anbieter nimmt an und nennt den Preis.
Weg B   Auftrag → Angebot → Job     Der Kunde schreibt einen Auftrag aus,
                                    Anbieter bieten, der Kunde nimmt ein Angebot an.
```

Beide Seiten haben dieselbe **Übersicht** mit ihren Jobs, Anfragen und Erledigtem. Der Anbieter startet und beendet einen Job, der Kunde kann ihn stornieren, solange er nicht begonnen hat.

## Lokal starten

Node.js 22 und pnpm 10.

```bash
pnpm install --frozen-lockfile
cp .env.local.example .env.local   # eigene Werte eintragen
pnpm dev
```

| Variable | Verwendung |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase-Web-App mit Auth (E-Mail, Google) und Firestore |
| `GEOAPIFY_API_KEY` | Nur auf dem Server: Adressvorschläge für Köln |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Optional. Ohne Schlüssel bleibt die Listenansicht der Aufträge nutzbar |
| `NEXT_PUBLIC_SITE_URL` | Öffentliche Basis-URL für SEO |
| `NEXT_PUBLIC_FIREBASE_EMULATOR` | `true` verbindet die App mit dem lokalen Emulator statt mit der Cloud |

### Ohne Cloud-Projekt ausprobieren

```bash
firebase emulators:start --project demo-linq                    # Terminal 1
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 \
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 \
GCLOUD_PROJECT=demo-linq pnpm db:seed                            # Terminal 2
NEXT_PUBLIC_FIREBASE_EMULATOR=true pnpm dev
```

Der Seed legt zwölf Demo-Konten an (sechs Kunden, sechs Anbieter) und gibt das gemeinsame Passwort am Ende aus. Mehr dazu in [docs/data-model.md](docs/data-model.md).

## Prüfen

```bash
pnpm check        # ESLint, TypeScript, Tests
pnpm test:rules   # dieselben Tests plus die Firestore-Regeln im Emulator (braucht Java)
pnpm build
```

`.github/workflows/check.yml` führt `check`, `build` und `pnpm audit` bei jedem Push aus.

## Struktur

| Verzeichnis | Verantwortung |
| --- | --- |
| `app/` | Routen, Layouts, das Designsystem (`globals.css`) und der Geoapify-Endpunkt |
| `components/` | Darstellung und Formularzustand |
| `lib/data/` | Alle Schreibabläufe. Jeder mehrteilige Schritt ist eine Transaktion |
| `lib/hooks/` | Echtzeit-Abos auf Firestore (`useFirestoreQuery`) und UI-Zustand |
| `lib/types/` | Fachliche Typen |
| `lib/utils/` | Validierung, Statusübergänge, Formatierung, Entfernungen |
| `scripts/` | Demo-Daten und Test-Runner |
| `tests/` | Regressionstests, darunter `rules.test.ts` für die Security Rules |

Ein paar Bausteine tragen die ganze Oberfläche, und neue Seiten sollten sie wiederverwenden statt eigene zu bauen:

- `StatusPill` kennt jeden Status aller vier Dokumentarten und seine deutsche Bezeichnung.
- `ListState` zeigt Laden, Fehler und Leerzustand für jede Liste.
- `Overview` ist die Übersicht für beide Rollen; `JobCard` und `BookingCard` bekommen nur die Rolle mitgeteilt.
- `LocationField` ist das einzige Adressfeld, `CategoryFields` die einzige Kategorieauswahl.
- `ConfirmationModal` ist der einzige Bestätigungsdialog und nimmt bei Bedarf ein Eingabefeld auf.

## Sicherheit in drei Sätzen

Der Browser prüft Eingaben nur für gute Fehlermeldungen. Die eigentliche Grenze sind die [Firestore-Regeln](firestore.rules): Sie binden zusammengehörige Schreibvorgänge aneinander, sodass ein Job nur aus einer echten Zusage entstehen kann und niemand einen Status, einen Preis oder einen Zähler frei setzen kann. Die genaue Adresse eines Auftrags liegt in einem eigenen, privaten Dokument und erreicht den Anbieter erst mit der Zusage.

Regeln und Indizes ausrollen:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

## Vor dem Livegang

- **Impressum und Datenschutz** enthalten Platzhalter in eckigen Klammern. Beide Seiten brauchen die echten Angaben und eine rechtliche Prüfung.
- **Bestehende Daten** aus der Zeit vor der Trennung von Adresse und Stadtteil enthalten noch volle Adressen in öffentlichen Dokumenten. Am einfachsten `pnpm db:seed` auf einer frischen Datenbank, sonst Aufträge und Services einmal neu speichern.
- **Schlüssel einschränken:** Den Google-Maps-Schlüssel auf die eigene Domain begrenzen und für die Firebase-Web-App App Check erwägen.

Der vollständige Befund der letzten Durchsicht steht in [docs/project-audit.md](docs/project-audit.md).
