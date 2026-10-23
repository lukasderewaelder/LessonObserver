# LessonObserver – „Mitarbeit“

Mitarbeit im Unterricht erfassen und auswerten. Web-App (`index.html`), läuft auch offline – und zusätzlich als Android-APK (Capacitor, siehe unten) aus derselben Codebasis.

## Android-APK (LessonObserver)

Die APK ist ein Capacitor-Rahmen um dieselbe `index.html`; alles liegt lokal im App-Paket, es werden keine Daten übertragen. Mindestens Android 10.

**Installieren:** Die Datei `LessonObserver.apk` vom neuesten [Release](../../releases) aufs Gerät laden und öffnen (einmalig „Installation aus dieser Quelle“ erlauben). Neue Versionen einfach über die alte installieren – die Daten bleiben erhalten (Voraussetzung: gleiche Signatur, siehe unten).

**Daten aus der Web-App übernehmen:** Die APK hat einen eigenen Speicher und sieht die Daten der installierten Web-App nicht. In der Web-App **Mehr → Sicherung speichern**, die Datei aufs Gerät legen und in der APK **Mehr → Sicherung laden** wählen.

**Unterschiede zur Web-App:** „Speichern / Teilen“ (PDF, CSV, Sicherung) öffnet das Android-Teilen-Fenster (Drive, Dateien, E-Mail …). „Vorschau öffnen“ nutzt ebenfalls dieses Fenster („Öffnen mit“). Service Worker, Versionsprüfung und „Ziehen zum Aktualisieren“ entfallen; Updates kommen über eine neue APK. Beim Deinstallieren gehen Daten **und** automatische Sicherungen verloren – vorher eine Sicherung speichern.

### Bauen und veröffentlichen (für Entwickler:innen)

Das Bauen übernimmt GitHub Actions (`.github/workflows/android.yml`): Tag `v1.0.0` pushen → signierte APK hängt am Release. Manuell: Actions → „Android APK“ → Run workflow (Artifact).

**Einmalig einrichten:** Keystore erzeugen (gut aufbewahren – geht er verloren, lassen sich installierte Apps nicht mehr aktualisieren; niemals ins Repo einchecken):

```
keytool -genkeypair -v -keystore lessonobserver.jks -alias lessonobserver -keyalg RSA -keysize 2048 -validity 10000
base64 -w0 lessonobserver.jks    # Ausgabe als Secret ANDROID_KEYSTORE_BASE64 hinterlegen
```

Repository → Settings → Secrets and variables → Actions: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` (z. B. `lessonobserver`), `ANDROID_KEY_PASSWORD`. Ohne diese Secrets baut der Workflow nur eine Debug-APK als Artifact.

**Lokal:** Node 22, JDK 21, Android SDK. `npm ci && npm run sync`, danach `android/` in Android Studio öffnen oder `cd android && ./gradlew assembleDebug`. `www/` und die synchronisierten Web-Dateien unter `android/` werden aus dem Repo-Root erzeugt (`scripts/build-web.mjs`) und nicht eingecheckt – nach Änderungen an `index.html` also `npm run sync`.

**Code-Weichen:** In `index.html` erkennt `NATIVE` die App (`Capacitor.isNativePlatform()`) und schaltet Teilen (`nativeShare`), Zurück-Taste, Bildschirm-anlassen sowie Service Worker/Update-Check um. Die Web-Version bleibt unverändert.

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

## Sitzplan

- **Einschalten:** Kurs bearbeiten → **Sitzplan-Ansicht**. Dann stellst du **Reihen** und **Doppelbänke pro Reihe** ein (jede Doppelbank hat 2 Plätze). Die Einstellung gilt pro Kurs und wird gespeichert; ausgeschaltet zeigt der Kurs wieder die Kacheln (der Plan bleibt erhalten).
- **Ansicht:** Wie von der Lehrkraft aus gesehen – die Tafel ist unten, die vorderste Reihe direkt darüber. Beim ersten Einschalten werden die Schüler:innen alphabetisch von vorn links verteilt. Wer keinen Platz hat (zu wenige Plätze, neue Schüler:innen), liegt in der **Ablage** unter dem Plan.
- **Umsetzen:** Im Unterricht **Plan bearbeiten** tippen, Schüler:innen auf einen freien Platz, auf eine andere Person (Plätze tauschen) oder in die Ablage ziehen. Alternativ erst die Person antippen, dann den Zielplatz. Mit **Fertig** bewertest du wieder wie gewohnt per Tippen.
- Ändert man Reihen oder Bänke, bleiben die Plätze (Reihe und Spalte) erhalten; was wegfällt, kommt in die Ablage.

## Nur Vornamen

Unter **Ansicht** (Handy), in der Leiste über den Kacheln (PC) oder unter Mehr → Anzeige wählst du **Nur Vorname** (Standard) oder **Vor- und Nachname**. Gleiche Vornamen werden mit dem Anfangsbuchstaben des Nachnamens ergänzt (Tom M., Tom P.); bei gleichem Anfangsbuchstaben steht der volle Nachname. Das gilt für Kacheln und Sitzplan; Auswertung, Schüler-Fenster, PDF und CSV zeigen weiter die vollen Namen.

## Kursfarben

Jeder Kurs hat eine Farbe (Kurs bearbeiten → Farbe). Sie erscheint als Balken im Kopf, am aktiven Tab und in den Kurslisten.

## Namen suchen und mehrere auf einmal wählen (PC)

- **Unterricht:** Über der Kachelliste steht ein Suchfeld (Taste `/`). Tippe einen Namensanfang, wähle per `Enter` oder Klick aus dem Drop-Down (Pfeiltasten gehen auch; `▾` zeigt alle Namen). Mehrere Namen auf einmal: nacheinander wählen oder `Anna, Ben, Clara` tippen/einfügen und `Enter`. Auch `Strg`/`Shift` + Klick auf eine Kachel wählt aus. Bei gewählten Personen gilt die nächste Wertung (Stempelleiste oder Tasten `1`–`5`, `J`) sofort für alle, danach wird die Auswahl geleert. „Rückgängig“ macht es für alle zusammen rückgängig.
- **Nachtragen:** Gleiches Suchfeld. Die Wertungsknöpfe darunter („Für Auswahl“) zählen für alle gewählten Personen: **Linksklick +1, Rechtsklick −1**. Das gilt auch für die einzelnen Felder der Tabelle (am Handy: lang drücken für −1).

„Fehlt“ und „Spät“ gibt es nicht mehr; alte Einträge dieser Art werden beim Laden entfernt.

## Layout (Handy, Tablet, PC)

- **Navigation:** Unten die Tab-Leiste Unterricht | Auswertung | Mehr, oben der Kursname (Tippen wechselt den Kurs) und das Datum für neue Einträge. „Mehr“ ist ein Menü mit Unterseiten: Kurse · Anzeige · Joker & Marker · Halbjahre · Daten & Sicherung · App & Hilfe; ‹ Mehr bzw. die Zurück-Taste führt zurück.
- **Gestaltung:** ruhig und fast einfarbig (nur die Wertungen sind farbig), durchgehend normale Schrift ohne Fettdruck, überall dieselben Knöpfe: gefüllt = Hauptaktion, Umriss = weitere Aktion, Text = Navigation.
- **Unterricht:** Suchfeld und Ansicht-Knopf (Sortierung, Namen, Kacheln pro Reihe, Nachtragen). Standard sind 2 Kacheln pro Reihe, kompakt 3. Die Kacheln zeigen den Vornamen (gleiche Vornamen mit Kürzel, Tom M.); lange Namen brechen um und werden nie abgeschnitten. Unten fest: fünf Wertungsknöpfe und darunter Joker | Marker | Zufall, darunter die Tab-Leiste. Wertung wählen → Schüler:in antippen.
- **Schüler:in-Fenster:** Name, Kurs, Wertungen, Status, dazu einklappbar „Joker & Marker“ und „Bemerkung hinzufügen“, „Verlauf ansehen“, „PDF-Bericht“. Mit ‹ Zurück / Weiter › wechselst du durch die Liste.
- **Nachtragen (Handy):** Eingabemaske: Person wählen → Datum → Wertungen mit −/+ erfassen. Am PC bleibt die Tabelle.
- **Auswertung (Handy):** schlanke Liste (Name, Ø Tendenz, Anzahl, Verteilung). Antippen öffnet Verteilung, Verlauf, Joker/Marker, Notizen und alle Einträge. Der Zeitraum (Heute, 7 Tage, 30 Tage, 1. Halbjahr, 2. Halbjahr, Alles, eigener Zeitraum) wird über einen Knopf gewählt und gilt auch für das PDF.
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
