# Datenmodell

Stand: 10.11.2026.

## Grundregeln

**Die Firestore-Dokument-ID ist die einzige Identität.** Es gibt kein zweites
numerisches `id`-Feld mehr und keine `counter`-Dokumente. Jede Referenz
(`customerId`, `providerId`, `serviceId`, `assignedProviderId`) enthält die
Dokument-ID des Ziels. Bei Nutzern ist das die Firebase-Auth-UID.

Daraus folgt dreierlei:

- Eine Detailseite ist ein `doc()`-Read statt einer `where("id","==",x)`-Query.
- Ein Insert ist ein einzelner Write. Vorher musste jeder Insert eine
  Transaktion auf ein gemeinsames Zähler-Dokument fahren, was alle Schreibzugriffe
  einer Collection auf etwa einen pro Sekunde serialisiert hat.
- Security Rules können `request.auth.uid` mit der gespeicherten Referenz
  vergleichen. Mit numerischen IDs war das unmöglich.

**Geld** liegt immer als Integer in Cent vor, Obergrenze 100.000.000 (1 Mio. €).

**Orte** haben überall dieselbe Form: `place: { geo: GeoPoint, address, city }`.
In öffentlichen Dokumenten (Aufträge, Services) steht darin nur der Stadtteil,
und die Koordinaten sind auf zwei Nachkommastellen gerundet, also auf etwa einen
Kilometer. `publicPlace()` in `lib/utils/place.ts` ist die einzige Stelle, die
das tut. Die genaue Adresse eines Auftrags liegt getrennt, siehe unten.

**Kontaktdaten** wandern nie über das Profil. Wer sich festlegt, legt seine
eigenen `{ email, phone }` als Schnappschuss ins Dokument: der Anbieter ins
Angebot, der Kunde in die Anfrage. Der Job bekommt beide. So braucht niemand
Leserechte auf fremde Profile, und Kontaktdaten gibt es erst mit der Zusage.

**Radien** heißen überall `radiusKm` und sind Kilometer.

**Enum-Werte sind Codes, keine Anzeigetexte.** Alle deutschen Statusnamen und
ihre Farben stehen in einer einzigen Tabelle in `components/StatusPill.tsx`.

## Collections

```
users/{uid}
categories/{slug}
services/{id}
orders/{id}
orders/{id}/offers/{providerUid}
orders/{id}/private/address
bookings/{id}
jobs/{id}
```

### users

Dokument-ID ist die Auth-UID. Das Profil ist privat; Namen, die andere sehen,
stehen denormalisiert in den jeweiligen Dokumenten. Die Rolle wird bei der
Registrierung gewählt und lässt sich danach nicht mehr ändern.

### categories

Unterkategorien sind als Array **im** Kategorie-Dokument eingebettet, nicht in
einer Subcollection. Die Taxonomie ist klein, statisch und wird auf fast jeder
Seite gelesen: so kostet sie eine Query statt acht.

### services

Angebote eines Dienstleisters. Status: `active`, `paused`, `archived`.
Archiviert wird per Statuswechsel, nie gelöscht, damit Buchungen und Jobs ihren
Snapshot behalten.

### orders

Ausschreibungen eines Kunden. Status: `open`, `assigned`, `inProgress`,
`completed`, `cancelled`.

`offerCount` zählt die offenen Angebote und wird bei jedem Angebots-Write
mitgeführt. Dadurch braucht eine Auftragsliste keinen Subcollection-Read, nur um
„3 Angebote" anzuzeigen. Die Regeln koppeln den Zähler an das Angebot: er kann
sich nur um eins ändern, und nur zusammen mit dem eigenen Angebot.

Bearbeiten lässt sich ein Auftrag nur, solange kein Angebot offen ist. Ein
Angebot antwortet auf den Auftrag, wie er dastand; danach bleibt dem Kunden das
Stornieren. Aufträge mit festem Termin verschwinden aus der Suche der Anbieter,
sobald der Termin vorbei ist (`hasExpired`), flexible bleiben stehen.

Öffentlich sichtbar sind der Stadtteil und der abgekürzte Kundenname („Kim M.").
Mit der Vergabe bekommt der Auftrag `assignedProviderId` und `jobId`.

### orders/{id}/private/address

Die genaue Adresse `{ address, geo }`. Lesen und schreiben darf nur der Kunde.
Beim Annehmen eines Angebots kopiert die Transaktion sie in den Job, und erst
dort sieht sie der beauftragte Anbieter.

### offers

Liegen unter `orders/{id}/offers/{providerUid}`. Die Anbieter-UID ist die
Dokument-ID, deshalb ist „ein Angebot pro Anbieter pro Auftrag" eine Eigenschaft
des Datenmodells und keine Regel, an die der Code sich erinnern muss.

Nimmt der Kunde ein Angebot an, werden alle anderen offenen Angebote in
derselben Transaktion abgelehnt. Ein Angebot lässt sich nur zurückziehen,
solange der Auftrag offen ist.

### bookings

Anfragen eines Kunden auf einen Service. Alle Snapshot-Felder werden innerhalb
der Transaktion aus dem Service-Dokument kopiert, nicht vom Client übernommen;
die Regeln vergleichen sie mit dem Service. Der Preisvorschlag des Kunden ist
optional. Beim Annehmen nennt der Anbieter den endgültigen Preis, ohne Preis
entsteht kein Job.

### jobs

Vereinbarte Arbeit. Beide Wege münden hier:

```
Flow A   service → booking → job     (sourceType: "booking")
Flow B   order → offer → job         (sourceType: "order")
```

Vier Status statt vorher sechs: `scheduled`, `inProgress`, `completed`,
`cancelled`. Die alten `open`, `pending` und `accepted` bedeuteten alle
„vereinbart, aber nicht begonnen", weshalb jede Übergangstabelle sie wieder
zusammenfassen musste.

Ein Job lässt sich nicht frei anlegen. Die Regeln verlangen, dass der Auftrag
oder die Anfrage nach derselben Transaktion auf genau diesen Job zeigt und der
Preis mit dem angenommenen Angebot übereinstimmt. Der Anbieter führt den Job
(starten, abschließen, stornieren), der Kunde darf nur stornieren, solange er
nicht begonnen hat. Bei Jobs aus Aufträgen folgt der Auftragsstatus dem Job.

Jobs aus Anfragen tragen den Wunschtermin des Kunden als Freitext in `dateText`;
`scheduledAt` ist dann der Zeitpunkt der Zusage und dient nur der Sortierung.

## Skripte

```
pnpm db:seed     leeren und mit einem konsistenten Demo-Datensatz füllen
pnpm db:reset    nur leeren
pnpm db:claim    Demo-Daten einem echten Konto übertragen
```

Ohne `FIRESTORE_EMULATOR_HOST` verlangen alle drei `--confirm-project <id>` und
prüfen zusätzlich, ob der Service-Account zum genannten Projekt gehört.

### Warum die Daten sonst unsichtbar bleiben

Jede persönliche Liste in der App filtert nach der UID des angemeldeten Nutzers.
Gehören die Seed-Daten niemandem, den man sein kann, sieht ein echtes Konto nur
die öffentliche Suche und zwei leere Dashboards.

Dagegen gibt es zwei Wege:

**Als Demo-Person anmelden.** `db:seed` legt zu jeder Person ein
Firebase-Auth-Konto an, dessen UID der Dokument-ID unter `users/` entspricht.
Adressen stehen in `scripts/data/people.ts`, das Passwort ist für alle gleich und
wird am Ende des Seed-Laufs ausgegeben. `--no-auth` überspringt das,
`db:reset` entfernt die Konten wieder.

**Die Daten dem eigenen Konto übertragen.**

```
pnpm db:claim --email <deine-adresse>
pnpm db:claim --email <deine-adresse> --role customer
pnpm db:claim --uid <firebase-uid> --persona seed-p-lehmann
```

Das Eigentum wandert, es wird nicht kopiert: Besitzerfelder, die denormalisierten
Namen und die Rolle im Profil werden umgeschrieben. Angebote liegen unter der
Anbieter-UID als Dokument-ID und werden deshalb neu abgelegt statt aktualisiert.

Ohne `--persona` wählt das Skript die Person mit den meisten Daten. Ein zweiter
Lauf würde deshalb die *nächste* Person nehmen und stillschweigend noch mehr
Daten auf dasselbe Konto häufen, also bricht er stattdessen ab. `--again` erlaubt
es bewusst.

Nach einem Claim einmal neu anmelden, damit die geänderte Rolle greift.

Der Datensatz wird vollständig im Speicher aufgebaut und von
`assertDatasetIsCoherent` geprüft, bevor das erste Dokument geschrieben wird.
Geprüft werden unter anderem: existieren alle referenzierten Nutzer, hat jeder
angenommene Auftrag genau ein angenommenes Angebot, stimmt `offerCount` mit der
Zahl der offenen Angebote überein, hat jede angenommene Buchung ihren Job. Die
Prüfung läuft auch als Test in `tests/seedData.test.ts` mit.

## Rules und Indizes

`firestore.rules` und `firestore.indexes.json` liegen im Projektwurzelverzeichnis,
`firebase.json` verdrahtet beide. `tests/rules.test.ts` spielt die Abläufe und
die naheliegenden Angriffe gegen den Emulator durch (`pnpm test:rules`).

```
firebase deploy --only firestore:rules,firestore:indexes
```

Die Indizes decken genau die Queries ab, die die App fährt: Status plus
`createdAt` für die öffentlichen Listen, Besitzer plus `createdAt` für die
eigenen Listen, und `providerId` plus `createdAt` als Collection-Group-Index für
die Angebote eines Dienstleisters.
