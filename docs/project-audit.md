# Projektprüfung vom 10.11.2026

Durchsicht der gesamten Plattform auf Design, Logik und Sicherheit, danach die
Überarbeitung. Leitlinie: die DNA bleibt (viel Weißraum, ruhige Typografie,
dieselben Bausteine), aber jede Funktion soll auf einen Blick verständlich sein
und der Code so klein wie möglich.

## Sicherheit

| Befund | Lösung |
| --- | --- |
| Jeder Angemeldete konnte Jobs mit beliebigem Inhalt anlegen | Ein Job entsteht nur, wenn Auftrag oder Anfrage nach derselben Transaktion auf ihn zeigen und der Preis zum angenommenen Angebot passt |
| Kunden konnten den Status ihres Auftrags und `offerCount` frei setzen | Jede Statusänderung ist an ihr Gegenstück gebunden (`getAfter`); der Zähler bewegt sich nur zusammen mit einem Angebot |
| Anfragen übernahmen Anbieter, Preis und Titel ungeprüft vom Client | Die Regeln vergleichen jede Anfrage mit dem Service, auf den sie zeigt |
| Volle Adresse und voller Name des Kunden standen in öffentlich lesbaren Aufträgen | Öffentlich sind nur Stadtteil, gerundete Koordinaten und „Kim M."; die Adresse liegt in `orders/{id}/private/address` |
| Anmeldungen ohne gespeicherte Rolle wurden als Anbieter behandelt | Standard ist Kunde; die Rolle bleibt wie bisher unveränderlich |
| Der Geoapify-Endpunkt war für jede fremde Website nutzbar und unbegrenzt | Nur gleiche Herkunft, 40 Anfragen pro Minute und Adresse, Antworten werden zwischengespeichert |
| Keine Sicherheits-Header | `nosniff`, `frame-ancestors 'none'`, HSTS, Referrer- und Permissions-Policy in `next.config.ts` |
| Bild-URLs von Anbietern ungeprüft | Nur `https://`; ein kaputtes Bild zeigt den Platzhalter |
| Die Abfrage „meine Angebote" hatte keine passende Regel und wäre mit ausgerollten Regeln gescheitert | Eigene Collection-Group-Regel |

Die Regeln sind mit zehn Szenarien im Emulator getestet, darunter die Angriffe
aus dieser Tabelle.

## Logik

| Befund | Lösung |
| --- | --- |
| Nach einer Zusage gab es keinen Weg, einander zu erreichen | Beide Seiten hinterlegen ihre Kontaktdaten als Schnappschuss; der Job zeigt Telefon und E-Mail, solange er läuft |
| Angenommene Anfragen ohne Preisvorschlag ergaben Jobs über 0 € | Der Anbieter nennt beim Annehmen den Preis |
| Jobs aus Anfragen zeigten den Zeitpunkt der Zusage als Termin | Der Wunschtermin des Kunden wird übernommen |
| Unterlegene Angebote blieben für immer „offen" | Sie werden mit der Zusage abgelehnt |
| `offerCount` konnte negativ werden | Zurückziehen nur bei offenem Auftrag, Zähler an das Angebot gekoppelt |
| Kunden sahen weder ihre Jobs noch ihre Anfragen und konnten nichts stornieren | Dieselbe Übersicht für beide Rollen |
| Das Annehmen eines Angebots war ein einzelner, unumkehrbarer Klick | Zweiter, ausdrücklicher Klick „Verbindlich annehmen" |
| Als Ort wurde „Deutschland" gespeichert (letzter Teil der Adresse) | Der Endpunkt liefert den Stadtteil mit |

## Design und Ehrlichkeit

| Befund | Lösung |
| --- | --- |
| Dialoge deckten nur den Seiteninhalt ab und saßen nicht mittig | Die Einblend-Animation der Seite hinterlässt keine Transformation mehr |
| Glocke ohne Funktion, erfundener „Match"-Wert, Platzhalterseite „Rechnungen" | Entfernt |
| Die Startseite versprach geprüfte Anbieter, Bewertungen, Chat und Antwort in 24 Stunden | Vier Zusagen, die der Ablauf tatsächlich hält; alles auf Umzugshilfe in Köln ausgerichtet |
| Status hießen je nach Seite anders und hatten andere Farben | Eine Tabelle in `StatusPill` |
| Jede Liste baute Laden, Fehler und Leerzustand selbst | `ListState` |
| Drei verschiedene Adressfelder, zwei Service-Suchen | `LocationField`, eine Suche; die alte Route leitet weiter |
| Die Service-Suche verlangte einen Umkreis | Ein Service erscheint, wenn die Adresse des Kunden im Einsatzradius des Anbieters liegt |
| Kein Impressum, keine Datenschutzerklärung | Beide Seiten angelegt, mit Platzhaltern für die Betreiberdaten |

## Feinschliff

| Befund | Lösung |
| --- | --- |
| Die öffentlichen Seiten luden das komplette Firebase-SDK mit | Anmeldung und Firebase starten erst im Layout der App; das JavaScript der Startseite ist halb so groß |
| Jede Seite mit Kategorieauswahl fragte die Kategorien neu ab | Eine Abfrage pro Besuch |
| Suche und Auftragsliste lasen jeweils die ganze Sammlung | Auf die 200 neuesten Einträge begrenzt |
| Kein Weg zurück bei vergessenem Passwort | „Vergessen?" auf der Anmeldeseite |
| Kein Icon, kein Web-App-Manifest, keine `robots.txt`, keine Sitemap | Angelegt; die App hinter der Anmeldung ist `noindex` |
| Ohne Benachrichtigungen erfuhr der Kunde nicht von neuen Angeboten | Die Übersicht nennt wartende Angebote und eine fehlende Telefonnummer |
| Ein Auftrag ließ sich ändern, nachdem Angebote eingegangen waren | Gesperrt, in der Oberfläche und in den Regeln |
| Aufträge mit vergangenem Termin blieben in der Suche | Ausgeblendet; der Kunde sieht den Hinweis in seiner Liste |

## Offen

- Impressum und Datenschutz brauchen die echten Angaben und eine rechtliche Prüfung.
- Bestehende Daten enthalten noch volle Adressen in öffentlichen Dokumenten und
  keine Kontaktdaten in älteren Angeboten. Frisch einspielen oder neu speichern.
- Die Begrenzung des Adress-Endpunkts zählt pro Serverinstanz. Für hohe Last
  gehört sie an die vorgelagerte Plattform.
- Die E-Mail zum Zurücksetzen des Passworts verschickt Firebase. Absender und
  Text lassen sich in der Firebase-Konsole unter Authentication, Templates anpassen.
- Zahlungen, Bewertungen und Benachrichtigungen gibt es bewusst nicht.
  Absprachen laufen nach der Zusage direkt zwischen beiden Seiten.
- App Check für Firebase und eine Domain-Beschränkung des Maps-Schlüssels sind
  vor dem Livegang sinnvoll.
