# LessonObserver – „Mitarbeit“

Mitarbeit im Unterricht erfassen und auswerten. Web-App (`www/index.html`), läuft auch offline. Eine Android-APK ist aktuell nicht Teil des Projekts (sie steht noch in der Git-Historie).

## Daten und Speicherung

- Alle Daten bleiben **lokal im Browser des Geräts** (`localStorage`). Es wird nichts übertragen.
- Sicherungen macht man selbst unter **Mehr → Sicherung speichern** und lädt sie dort wieder.

## Alte Daten einfügen

**Mehr → Alte Daten einfügen.** Zwei Formen, jeweils mit Vorschau und „Rückgängig“ nach dem Import:

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

**Neue Einträge im Unterricht** bekommen automatisch das aktuelle Datum (oder das im Kopf gewählte Datum) und lassen sich im Verlauf ebenfalls nachträglich ändern.

Unbekannte Namen werden auf Wunsch als neue Schüler:innen angelegt. Importierte Einträge haben keine Uhrzeit.

## Als Web-App auf dem Handy

`www/` auf einen Webserver legen (z. B. GitHub Pages), im Browser öffnen und „Zum Startbildschirm hinzufügen“ wählen.
