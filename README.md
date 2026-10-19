# LessonObserver – „Mitarbeit“

Mitarbeit im Unterricht erfassen und auswerten. Web-App (`index.html`), läuft auch offline. Eine Android-APK ist aktuell nicht Teil des Projekts (sie steht noch in der Git-Historie).

## Daten und Speicherung

- Alle Daten bleiben **lokal im Browser des Geräts** (`localStorage`). Es wird nichts übertragen.
- **Automatische Sicherungen:** Nach jeder Änderung legt die App einen Stand in IndexedDB ab (die letzten 20 plus je einer pro Tag der letzten 14 Tage). Unter Mehr → Automatische Sicherungen lässt sich ein Stand wiederherstellen. Ist der normale Speicher einmal leer, holt die App den letzten Stand automatisch zurück. „Alle Daten löschen“ entfernt auch diese Sicherungen.
- Diese Sicherungen liegen im selben Browser-Speicher: Löschst du die Website-Daten oder deinstallierst die App, sind sie weg. Deshalb **Mehr → Sicherung speichern** (Teilen → Drive, Dateien, E-Mail); eine Erinnerung erscheint nach 7 Tagen.

## Android

- **Als App installieren:** Chrome zeigt unter Mehr (und einmalig im Tab „Unterricht“) einen Knopf „Installieren“. Die installierte App hat ein eigenes Symbol, läuft im Vollbild und auch ohne Netz. Beim langen Drücken auf das Symbol gibt es die Kurzbefehle „Nachtragen“ und „Zufallsauswahl“.
- **Zurück-Taste:** schließt zuerst Fenster und Auswahl, dann geht es zurück zu „Unterricht“, erst dann verlässt sie die App.
- **Mehrere Namen:** Kachel gedrückt halten, weitere antippen, Wertung wählen – sie gilt für alle.
- **Vibration** beim Stempeln und **Bildschirm anlassen** lassen sich unter Mehr → Anzeige ein- und ausschalten.
- **Neue Version:** Ist eine neue Version da, erscheint „Neue Version geladen – Neu laden“.

## Daten nachtragen

- **Ohne Datum eintragen:** Oben rechts das Datum antippen und „Ohne Datum (Nachtragen)“ wählen. Alles, was du danach stempelst, bekommt kein Datum, bis du wieder auf „Heute“ zurückschaltest. Ein Banner erinnert daran.
- **Mehrere auf einmal:** In „Unterricht“ den Knopf **Nachtragen** (auch unter Mehr → Daten nachtragen) öffnen. Pro Person und Wertung tippst du so oft, wie der Eintrag vorkam (`−1` schaltet auf Korrigieren). Das Datum ist leer vorbelegt (= ohne Datum), du kannst eins wählen. Mit „Eintragen“ werden alle Zählungen gespeichert, mit „Rückgängig“ wieder entfernt.
- Neue Einträge im Unterricht bekommen automatisch das aktuelle Datum und lassen sich im Verlauf der Person (Kalender-Symbol am Eintrag) nachträglich ändern.

## Text einfügen (alte Daten)

**Mehr → Text einfügen.** Zwei Formen, jeweils mit Vorschau und „Rückgängig“ nach dem Import:

**Einzelne Einträge** – eine Zeile pro Person, dahinter die Wertungen:

```
12.09.2026
Anna Beispiel ++
Müller, Ben + + ○
Clara Schmidt 2x+ ★ F
15.09. Ben −
```

Wertungen: `++` `+` `○`/`o`/`0` `−` `−−`, Noten `1`–`5`, Wörter wie „gut“, `★`/`J` = Joker-Punkt, Kürzel oder Name der eigenen Marker, `2x+` = zweimal.

**Summen je Person** – Zahlen aus einer Strichliste oder Excel (Tabulator oder Semikolon):

```
Name;++;+;○;−;−−;Joker
Anna Beispiel;3;5;2;1;0;4;1;0
```

Ohne Kopfzeile gilt die Reihenfolge `++ · + · ○ · − · −− · Joker-Punkte`, danach die eigenen Marker.

**Datum:** Steht in einer Zeile ein Datum (`12.09.2026`, `12.09.`, `2026-09-12`), gilt dieses. Eine Zeile nur mit Datum gilt für alle Zeilen darunter. Alles ohne Datum **bleibt ohne Datum** (optional lässt sich oben ein gemeinsames Datum eintragen). Einträge ohne Datum zählen in der Auswertung bei „Alles“ und in der Joker-Zählung; das Datum kann im Verlauf der Person (Kalender-Symbol am Eintrag) jederzeit nachgetragen oder geändert werden.

Unbekannte Namen werden auf Wunsch als neue Schüler:innen angelegt. Importierte Einträge haben keine Uhrzeit.

## Als Web-App auf dem Handy (ohne Installation)

Die Dateien aus dem Hauptverzeichnis auf einen Webserver legen (z. B. GitHub Pages, Quelle: Branch `main`, Ordner `/ (root)`), im Browser öffnen und „Zum Startbildschirm hinzufügen“ wählen.

## Bedienung am PC

Auf großen Bildschirmen passt sich das Layout an (mehr Kacheln pro Zeile, Stempelleiste in einer Zeile, Mehr zweispaltig). Tastenkürzel im Tab „Unterricht“: `1`–`5` Wertung (`++` bis `−−`), `J` Joker, `Z` Zufallsauswahl, `/` Namen suchen, `Esc` beendet den Stempelmodus bzw. leert die Auswahl.

## Kursfarben

Jeder Kurs hat eine Farbe (Kurs bearbeiten → Farbe). Sie erscheint als Balken im Kopf, am aktiven Tab und in den Kurslisten.

## Namen suchen und mehrere auf einmal wählen (PC)

- **Unterricht:** Über der Kachelliste steht ein Suchfeld (Taste `/`). Tippe einen Namensanfang, wähle per `Enter` oder Klick aus dem Drop-Down (Pfeiltasten gehen auch; `▾` zeigt alle Namen). Mehrere Namen auf einmal: nacheinander wählen oder `Anna, Ben, Clara` tippen/einfügen und `Enter`. Auch `Strg`/`Shift` + Klick auf eine Kachel wählt aus. Bei gewählten Personen gilt die nächste Wertung (Stempelleiste oder Tasten `1`–`5`, `J`) sofort für alle, danach wird die Auswahl geleert. „Rückgängig“ macht es für alle zusammen rückgängig.
- **Nachtragen:** Gleiches Suchfeld. Die Wertungsknöpfe darunter („Für Auswahl“) zählen für alle gewählten Personen: **Linksklick +1, Rechtsklick −1**. Das gilt auch für die einzelnen Felder der Tabelle (am Handy: lang drücken für −1).

„Fehlt“ und „Spät“ gibt es nicht mehr; alte Einträge dieser Art werden beim Laden entfernt.

## Layout (Handy, Tablet, PC)

- **Navigation:** Unterricht | Auswertung | Mehr. Kursverwaltung, Einstellungen, Sicherung und Halbjahre liegen unter „Mehr“. Oben links wechselt der Kurs, oben rechts das Datum für neue Einträge.
- **Unterricht:** Suchfeld (Filter nach Namen) und Sortier-Knopf (Sortierung, Kacheln pro Reihe, Nachtragen). Standard sind 2 Kacheln pro Reihe, kompakt 3. Unten fest: fünf große Wertungsknöpfe und darunter Joker | Marker | Zufall. Wertung wählen → Schüler:in antippen.
- **Schüler:in-Fenster:** Name, Kurs, Wertungen, Status, dazu einklappbar „Joker & Marker“ und „Bemerkung hinzufügen“, „Verlauf ansehen“, „PDF-Bericht“. Mit ‹ Zurück / Weiter › wechselst du durch die Liste.
- **Nachtragen (Handy):** Eingabemaske: Person wählen → Datum → Wertungen mit −/+ erfassen. Am PC bleibt die Tabelle.
- **Auswertung (Handy):** schlanke Liste (Name, Ø Tendenz, Anzahl, Verteilung). Antippen öffnet Verteilung, Verlauf, Joker/Marker, Notizen und alle Einträge. Der Zeitraumfilter (Heute, 7 Tage, 30 Tage, 1. Halbjahr, 2. Halbjahr, Alles, Zeitraum …) gilt auch für das PDF.
- **Halbjahre** sind unter Mehr einstellbar. Vorgeschlagen wird ein Schuljahr ab 1. August; bitte an dein Bundesland anpassen.

## PDF-Export

In **Auswertung → PDF exportieren** (oder im Schüler:in-Fenster → PDF-Bericht):

- **Schülerbericht** (A4 hoch): pro Person eigene Seiten mit Zusammenfassung, Verteilung, Verlauf, Joker/Marker, Bemerkungen und optional allen Ereignissen.
- **Kursübersicht** (A4 quer): Tabelle aller Schüler:innen mit Anzahl, Ø Tendenz, Verteilung, Joker/Marker; Tabellenkopf auf jeder Seite.
- **Beobachtungsprotokoll** (A4 hoch): chronologische Einträge mit Datum, Wertung und Bemerkung, optional nach Person gruppiert.

Auswahl von Kurs, Personen, Zeitraum und Inhalten; danach Speichern/Teilen oder Vorschau öffnen. Das PDF entsteht **ausschließlich im Browser** (jsPDF und AutoTable liegen unter `lib/`, MIT-Lizenz); es werden keine Daten gesendet. Es funktioniert auch offline. „Ø Tendenz“ ist in jedem Bericht als Orientierung, nicht als Zeugnisnote gekennzeichnet. Zeichen, die die PDF-Schrift nicht kann (z. B. Emoji), werden durch „?“ ersetzt und dir angezeigt.

## Updates

- Die App lädt beim Öffnen zuerst die neueste Version aus dem Netz und nutzt nur ohne Netz (oder bei sehr langsamem Netz) die gespeicherte Kopie. Nach einer Veröffentlichung auf GitHub Pages dauert es etwa 1–10 Minuten, bis die neue Version ausgeliefert wird.
- **Ziehen zum Aktualisieren:** Am Seitenanfang nach unten ziehen prüft sofort auf eine neue Version; gibt es eine, erscheint „Neu laden“.
- Kommt die App aus dem Hintergrund zurück, prüft sie im Hintergrund (höchstens alle 5 Minuten) und zeigt „Neue Version verfügbar“.
- Deine Daten bleiben bei Updates erhalten.
- Für Entwickler:innen: Bei jeder Änderung `app-version` in `index.html` erhöhen, damit die Versionsprüfung die neue Version erkennt.
