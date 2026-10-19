# LessonObserver – „Mitarbeit“

Mitarbeit im Unterricht erfassen und auswerten. Web-App (`index.html`), läuft auch offline. Eine Android-APK ist aktuell nicht Teil des Projekts (sie steht noch in der Git-Historie).

## Daten und Speicherung

- Alle Daten bleiben **lokal im Browser des Geräts** (`localStorage`). Es wird nichts übertragen.
- Sicherungen macht man selbst unter **Mehr → Sicherung speichern** und lädt sie dort wieder.

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

Wertungen: `++` `+` `○`/`o`/`0` `−` `−−`, Noten `1`–`5`, Wörter wie „gut“, `★`/`J` = Joker-Punkt, `F` = fehlt, `S` = spät, Kürzel oder Name der eigenen Marker, `2x+` = zweimal.

**Summen je Person** – Zahlen aus einer Strichliste oder Excel (Tabulator oder Semikolon):

```
Name;++;+;○;−;−−;Joker;Fehlt;Spät
Anna Beispiel;3;5;2;1;0;4;1;0
```

Ohne Kopfzeile gilt die Reihenfolge `++ · + · ○ · − · −− · Joker-Punkte · Fehlt · Spät`, danach die eigenen Marker.

**Datum:** Steht in einer Zeile ein Datum (`12.09.2026`, `12.09.`, `2026-09-12`), gilt dieses. Eine Zeile nur mit Datum gilt für alle Zeilen darunter. Alles ohne Datum **bleibt ohne Datum** (optional lässt sich oben ein gemeinsames Datum eintragen). Einträge ohne Datum zählen in der Auswertung bei „Alles“ und in der Joker-Zählung; das Datum kann im Verlauf der Person (Kalender-Symbol am Eintrag) jederzeit nachgetragen oder geändert werden.

Unbekannte Namen werden auf Wunsch als neue Schüler:innen angelegt. Importierte Einträge haben keine Uhrzeit.

## Als Web-App auf dem Handy

Die Dateien aus dem Hauptverzeichnis auf einen Webserver legen (z. B. GitHub Pages, Quelle: Branch `main`, Ordner `/ (root)`), im Browser öffnen und „Zum Startbildschirm hinzufügen“ wählen.

## Bedienung am PC

Auf großen Bildschirmen passt sich das Layout an (mehr Kacheln pro Zeile, Stempelleiste in einer Zeile, Mehr zweispaltig). Tastenkürzel im Tab „Unterricht“: `1`–`5` Wertung (`++` bis `−−`), `J` Joker, `F` fehlt, `S` spät, `Z` Zufallsauswahl, `Esc` beendet den Stempelmodus.

## Kursfarben

Jeder Kurs hat eine Farbe (Kurs bearbeiten → Farbe). Sie erscheint als Balken im Kopf, am aktiven Tab und in den Kurslisten.
