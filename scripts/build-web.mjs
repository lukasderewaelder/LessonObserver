// Kopiert die Web-App nach www/ (Eingabe für Capacitor). sw.js bleibt bewusst draußen:
// In der APK liegt alles lokal im App-Paket, ein Service Worker wird nicht gebraucht.
import { cpSync, rmSync, mkdirSync } from 'node:fs';

const FILES = ['index.html', 'pdf.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];
const DIRS = ['lib'];

rmSync('www', { recursive: true, force: true });
mkdirSync('www', { recursive: true });
for (const f of FILES) cpSync(f, `www/${f}`);
for (const d of DIRS) cpSync(d, `www/${d}`, { recursive: true });
console.log(`www/ erstellt (${FILES.length} Dateien, ${DIRS.length} Ordner)`);
