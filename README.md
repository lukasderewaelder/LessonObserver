# LessonObserver – „Mitarbeit“

Mitarbeit im Unterricht erfassen und auswerten. Die App gibt es als Web-App (`www/index.html`, läuft auch offline) und als Android-App (APK).

## Daten und Speicherung

- Alle Daten bleiben **lokal auf dem Gerät**. Es wird nichts übertragen.
- Browser: `localStorage`. Android-App: `localStorage` plus eine Spiegeldatei (`mitarbeit-daten.json`) im App-Ordner. Wird der WebView-Speicher geleert, stellt die App die Daten beim nächsten Start aus der Datei wieder her.
- Die Android-App ist von Googles automatischer Cloud-Sicherung ausgenommen (`allowBackup=false`), weil Schülernamen gespeichert werden. Sicherungen macht man selbst unter **Mehr → Sicherung speichern** (Teilen-Menü: Dateien, Drive, E-Mail …).

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

## Android-APK

Die APK entsteht per GitHub Actions (`.github/workflows/android.yml`): bei jedem Push als Artefakt **Mitarbeit-apk**, bei einem Tag `v*` zusätzlich als Anhang am Release. Es ist eine Debug-signierte APK; zum Installieren auf dem Handy „Apps aus unbekannten Quellen“ erlauben.

Lokal bauen (Node 22, JDK 21, Android SDK):

```
npm ci
npm run apk        # → android/app/build/outputs/apk/debug/app-debug.apk
```

Nach Änderungen an `www/` genügt `npm run sync`; das Android-Projekt kann mit `npx cap open android` in Android Studio geöffnet werden.

## Als Web-App auf dem Handy

`www/` auf einen Webserver legen (z. B. GitHub Pages), im Browser öffnen und „Zum Startbildschirm hinzufügen“ wählen.
