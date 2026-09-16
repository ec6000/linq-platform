# Projektprüfung vom 16.09.2026

## Ausgangslage

Das Repository enthielt noch keine Tests, keinen gemeinsamen Prüfcommand und nur die generische Next.js-README. Die bereits vorhandene Änderung an der Auftragssuche verwendete Felder, die das Auftragsmodell nicht kennt. Die Baseline ergab 17 TypeScript-Fehler sowie einen ESLint-Fehler und eine Warnung.

Vorhandene Arbeitsänderungen an Auftragssuche, Google-Maps-Hook, package.json und Lockfile wurden in die Bereinigung einbezogen. Es wurden keine bestehenden Änderungen zurückgesetzt, keine Commits erstellt und keine Datenbank-Seeds ausgeführt.

## Behobene Befunde

| Bereich | Vorher | Änderung |
| --- | --- | --- |
| Kartenansicht | Nicht vorhandene Budget-, Datums- und Ortsfelder; falscher Marker-ID-Typ | Verwendet budgetInCent, timeWindow, address und numerische IDs |
| Maps-Laden | Script-load fälschlich als API-Bereitschaft; Endlospolling; kein Fehlerzustand | Gemeinsames Promise, API-Callback, Timeout, Fehleranzeige und Abmeldung |
| Kartenkomponente | Marker ohne vollständige Bereinigung; veraltete Klickdaten; wirkungsloser CTA | Marker werden aktualisiert und entfernt; Detail-Link; separate Komponente |
| Benutzerzuordnung | Eigene Übersichten lasen sämtliche Aufträge, Services, Jobs und Buchungen | Nutzerbezogene Firestore-Abfragen; Detailansichten fragen nach ID |
| Eigene Angebote | Erstes beliebiges Angebot statt eigenem Angebot | Anbieterfilter, Listenerfehler und kontrolliertes Zurückziehen |
| Registrierung | Profil und Zähler in mehreren Schritten; konkurrierende Rollenanlage | Transaktionale Profilanlage; gewählte Rolle und Name schon beim Auth-Callback verfügbar |
| Sitzung | Verspätete Profildaten konnten eine neuere Sitzung überschreiben | Generation-Prüfung und sichtbarer Profilfehler |
| Auftragsbearbeitung | Initialzustand vor Datenladung; ungültige Route öffnete Erstellen-Formular | Formular erst nach Datenladung; ungültige IDs führen in den Not-found-Zweig |
| ID-Vergabe | Neue Order-ID aus clientseitigem Maximum | Zähler und Create in Transaktion mit Kollisionsprüfung |
| Angebot annehmen | Nur Angebotsstatus geändert; Auftrag weiterhin verfügbar | Atomare Vergabe samt Job; konkurrierende Entscheidungen geprüft |
| Statusänderungen | Fehler wurden verschluckt; UI prüfte veralteten Fehler-State | Explizites Ergebnis; kein fingierter Erfolg; Statusvalidierung und Zeitstempel |
| Standorte | Neu angelegte Services bei 0,0; Aufträge pauschal in Köln-Mitte | Ortsauswahl mit tatsächlichen Koordinaten; keine fiktiven Buchungskoordinaten |
| Datenzustand | Duplizierte Ladehooks und veraltete Ergebnisse nach Nutzerwechsel | Gemeinsame Echtzeitabfragen mit Cleanup und leerem Zustand bei Abfragewechsel |
| Kategorien | Unterschiedliche Loader; Unterkategorien teilweise über fachliche statt Dokument-ID geladen | Gemeinsamer Loader, korrekte Untercollection-Pfade |
| Geoapify | Ungefangene Netzwerk-/JSON-Fehler; kein Timeout | Begrenzte Eingabe, Integer-Limit, Timeout, kontrollierte 502-Antworten |
| Profile | Kundenprofil nur Platzhalter; Save-Fehler als unbehandelte Promise | Gemeinsames Profilformular; Fehlerbehandlung; Kontakt-E-Mail eindeutig beschriftet |
| Navigation/SEO | Footer verlinkte nicht vorhandene Seiten; SEO auf fehlende Bilder/Suchroute | Tote Footerlinks und fehlende Asset-Verweise entfernt; Basis-URL konfigurierbar |
| Seeds | Fester Admin-Key, ungeschütztes Überschreiben inklusive Zähler | Projektbestätigung oder Emulator; Create-Preconditions |
| Wartung | Reine Mutationsfunktionen als Hooks bezeichnet; ungenutzte Statushelfer | lib/data für Mutationen; veraltete Helfer entfernt; gemeinsame Validierung |
| Abhängigkeiten | Next.js 16.1.6 mit bekannten kritischen Meldungen | Next.js/ESLint-Konfiguration 16.3.3, Firebase 12.19.0, kompatible direkte und indirekte Updates |
| Qualität | Keine Regressionstests oder CI | Plattformübergreifender Test-Runner, Prüfcommands, GitHub-Workflow, Editor-/Zeilenendkonventionen |
| Designvariablen | Warning/Error nicht als Tailwind-Farben registriert; ungesetzte Geist-Schriften; Kartenfarben abweichend | Theme-Zuordnung ergänzt, gültige Schrift-Fallbacks, Karte liest die bestehenden CSS-Farben |

## Lokale Validierung

- ESLint ohne tolerierte Warnungen.
- Next-Routentypgenerierung und strikter TypeScript-Check.
- 13 bestandene Regressionstests für Geld, ID-Zähler, ungültige Routen-IDs, optionale Felder, Statusübergänge, Entfernungen und Geoapify-Fehlerfälle.
- Produktionsbuild mit allen vorhandenen Routen.
- HTTP-Smokecheck am lokalen Produktionsserver: Startseite, Login, Signup, Auftragssuche, Kundenprofil und Kurzabfrage des Ortsendpunkts antworten. Ungültige Bearbeitungs-ID liefert den Next.js-Not-found-Zweig und kein Erstellen-Formular; durch Streaming bleibt der HTTP-Status dabei 200.
- Produktions-Audit: 0 bekannte Schwachstellen.
- Gesamtaudit: 1 mittel eingestufter Befund in der Entwicklungsabhängigkeit `firebase-admin → @google-cloud/firestore → google-gax → uuid@9.0.1`. Kein hoher oder kritischer Restbefund. Der Fix liegt ab uuid 11.1.1 außerhalb des deklarierten Versionsbereichs dieses indirekten Pakets; kein ungeprüfter Major-Override vorgenommen.
- Keine schreibenden Tests gegen Firebase, keine Migration, kein Deployment und kein Test der gesamten Anmeldung/Buchung mit echten Nutzerkonten.

Die API-Tests verwenden kontrollierte Fetch-Antworten. Sie beweisen Fehlerbehandlung, nicht Erreichbarkeit oder Quoten des echten Geoapify-Dienstes. Die Transaktionen wurden typgeprüft und im Code geprüft, aber noch nicht unter konkurrierenden Emulator-Clients ausgeführt.

## Vor Produktivbetrieb noch erforderlich

1. **Firestore-Autorisierung:** Deployed Rules exportieren, versionieren und testen. Aus dem Repository ist nicht feststellbar, ob die Datenbank aktuell offen oder bereits geschützt ist. Clientfilter allein sind kein Zugriffsschutz. Besonders numerische Nutzer-IDs/Rollen müssen unveränderbar sein; Gegenparteien dürfen nur die vorgesehenen Dokumente und Felder ändern. Die neuen Mehrdokumenttransaktionen benötigen passende atomare Regeln.
2. **Bestandsdaten und Indizes:** Benutzer-IDs auf Eindeutigkeit prüfen, Dokument-ID/id-Konvention bestätigen, Zähler mit Beständen abgleichen, alte Standort-Platzhalter korrigieren und doppelte Altangebote behandeln. offers/providerId-Gruppenindex mit vorhandener Konfiguration zusammenführen.
3. **Integrationsprüfung:** Zwei Kunden- und zwei Anbieter-Testkonten verwenden. Fremdzugriffe, gleichzeitige Angebotsannahme, Doppel-Submit, Logout während Ladevorgängen und Netzabbrüche gegen den Emulator prüfen. Die 13 Regressionstests ersetzen diese Prüfung nicht.
4. **Öffentlicher Ortsendpunkt:** Quoten und Rate-Limit/App-Check oder eine serverseitige Authentifizierung passend zur Hosting-Umgebung ergänzen. Die bestehende öffentliche API kann sonst kostenpflichtig von Dritten aufgerufen werden.
5. **Unvollständige Produktbereiche:** Rechnungserstellung ist noch ein Platzhalter. Servicebuchungen bestätigen nur Anfragen; die verbindliche Preisvereinbarung und Jobanlage daraus fehlen. Anbieterbewertungen/Verifikationsaussagen in Teilen der Service-UI sind keine durch einen Bewertungsprozess belegten Daten. Geschäftsdaten, Rechtstexte und Kontaktseiten müssen vor Veröffentlichung bereitgestellt werden; es wurden keine Inhalte erfunden.
6. **Skalierung:** Marktlisten sind weiterhin vollständig innerhalb ihrer Filter abonniert; Ortssuche und Sortierung erfolgen im Browser. Bei wachsendem Bestand serverseitige Pagination/Geoabfragen und aggregierte Angebotszähler einführen. Die Live-Abonnements für Angebotszahlen verwenden weiterhin ein N+1-Muster.
7. **Toolchain:** ESLint 9 ist upstream inzwischen als nicht mehr unterstützt markiert. Eine geplante Migration auf ESLint 10 samt kompatibler Node-Version und Konfiguration ist der nächste Wartungsschritt. Firebase-Admin-Majorupgrade separat prüfen, um den verbleibenden uuid-Befund ohne Versionszwang zu lösen.

## Technische Referenzen

- [Firebase: Abfragen und Sicherheitsregeln](https://firebase.google.com/docs/firestore/security/rules-query)
- [Firebase: Bedingungen und atomare Regeln](https://firebase.google.com/docs/firestore/security/rules-conditions)
- [Google Maps: JavaScript-API laden](https://developers.google.com/maps/documentation/javascript/load-maps-js-api)
- [uuid-Advisory GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq)
