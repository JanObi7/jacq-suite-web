# Projektanalyse: jacq-suite-web

## Überblick

**jacq-suite-web** ist eine Single-Page-Anwendung auf Basis von **Vue 3**, **Vite** und **TypeScript**. Die App stellt eine digitale Sammlung historischer Jacquard-Webmuster dar. Nutzer können Muster durchsuchen, filtern und im Detail betrachten, inklusive hochauflösender Bildansichten.

---

## Tech-Stack

- **Build-Tool:** Vite
- **Framework:** Vue 3 (Composition API, `<script setup>`)
- **Sprache:** TypeScript
- **State-Management:** Pinia
- **Routing:** vue-router
- **UI-Framework:** Vuetify 3
- **Icons:** Material Design Icons (`@mdi/font`)
- **Bild-Viewer:** OpenSeadragon (für hochauflösende/zoombare Bilder)

---

## Projektstruktur (Auszug)

- `index.html` – Einstiegspunkt der SPA
- `src/`
  - `main.ts` – Bootstrap von Vue, Pinia, Router und Vuetify
  - `App.vue` – Root-Komponente (Layout: App-Bar, Navigation, Footer)
  - `router/`
    - `index.ts` – Routen-Definitionen
      - `/` – `HomeView`
      - `/patterns` – `PatternListView`
      - `/patterns/:id` – `PatternDetailView`
  - `stores/`
    - `patternStore.ts` – zentraler Store für Muster inkl. Filterlogik
    - `auth.js` – vorbereitetes Auth-Store (derzeit nicht im Fokus des Patterns-Teils)
  - `types/`
    - `pattern.ts` – Typdefinitionen für Muster und zugehörige Bilder
  - `views/`
    - `HomeView.vue` – Startseite mit Hero-Section, Statistiken und „Zuletzt digitalisiert“
    - `PatternListView.vue` – Filter- und Listenansicht aller Muster
    - `PatternDetailView.vue` – Detailansicht eines Musters mit Bildgalerie und Metadaten
  - `components/`
    - `PatternCard.vue` – Kartenansicht eines Musters (für Grid/Startseite)
    - `PatternListItem.vue` – Listenansicht eines Musters
    - `ImageViewer.vue` – Wrapper für Bildanzeige (inkl. Interaktion/OpenSeadragon)
  - `assets/`
    - `banner.png` – Hintergrundbild für Hero-Section
- `public/`
  - `patterns/` – statische Daten & Bilder zu den Mustern
    - `index.json` – Liste aller Pattern-IDs
    - `<ID>/metadata.json` – Metadaten je Muster
    - `<ID>/design.full.png`, `*.thumb.jpg`, `symbol.png`, ggf. weitere Bilder
  - `openseadragon/` – statische Ressourcen (Buttons, Icons) für OpenSeadragon

---

## Zentrale Funktionalität

### 1. Bootstrap (`src/main.ts`)

- Initialisiert die Vue-App und bindet:
  - Pinia-Store
  - Vue-Router
  - Vuetify mit definierter Light/Dark-Theme-Konfiguration
- Aktiviert Material Design Icons für Vuetify.

### 2. Layout & Navigation (`App.vue`)

- **`<v-app>`** als Root-Layout mit Vuetify-Themewechsel (light/dark) per Button.
- **App-Bar:**
  - Brand „JacqSuite“ (Link zur Startseite)
  - Navigation zu Startseite (`/`) und Musterübersicht (`/patterns`) – sowohl als Textbuttons (Desktop) als auch Icon-Only (Mobile).
  - Theme-Toggle (Sonne/Mond-Icon).
- **Navigation Drawer (mobil):**
  - Einträge für Startseite und „Alle Muster“.
- **Main-Content:**
  - `router-view` rendert aktuelle View.
- **Footer:**
  - Dynamisches Jahr
  - Beschreibung „Digitale Jacquard-Muster Datenbank“.

### 3. Pattern-Store (`src/stores/patternStore.ts`)

- **State:**
  - `patterns: Pattern[]` – alle geladenen Muster
  - `isLoading`, `loadError`
  - Filterzustände: `searchQuery`, `filterDesigner`, `filterTechnique`, `filterYearFrom`, `filterYearTo`, `filterTags: string[]`

- **Datenladen:**
  - `loadPatterns()`
    - Lädt `/jacq-suite-web/patterns/index.json` (Liste von Pattern-IDs).
    - Lädt für jede ID parallel `metadata.json`.
    - Filtert fehlgeschlagene Ladevorgänge heraus.
    - Setzt `patterns` und Logging der Anzahl geladener Muster.

- **Berechnete Eigenschaften:**
  - `allDesigners` – sortierte Liste aller Designer
  - `allTechniques` – sortierte Liste aller Techniken
  - `allTags` – sortierte Liste aller vorkommenden Tags
  - `filteredPatterns` – Ergebnis nach Anwendung aller Filter:
    - Volltextsuche über `name`, `description`, `designer`, `origin` und `tags` (fallunabhängig)
    - Filter nach Designer, Technik
    - Filter nach Jahr von/bis
    - Filter nach Tags (alle ausgewählten Tags müssen enthalten sein)
  - `latestPatterns` – 5 zuletzt digitalisierte Muster, sortiert nach `digitizedAt` absteigend

- **Funktionen:**
  - `getPatternById(id)` – Lookup eines Musters
  - `resetFilters()` – setzt alle Filter zurück

### 4. Views

#### HomeView

- **Hero-Section**
  - Hintergrund mit `banner.png` + Farbverlauf.
  - Titel „Digitale Jacquard-Muster“ und Untertitel.
  - Call-to-Action-Button zu `/patterns`.

- **Stats-Bar**
  - Anzahl Muster, Designer, Techniken (aus dem Store).

- **Section „Zuletzt digitalisiert“**
  - Fünf neueste Muster (`store.latestPatterns`) als `PatternCard`-Grid.

- **Info-Section**
  - Drei Kacheln zu Features: Hochauflösende Bilder, Filtermöglichkeiten, Metadaten.

#### PatternListView

- **Header** – zeigt Anzahl gefilterter Muster vs. Gesamtanzahl.

- **Filter-Panel (linke Spalte)**
  - Suche (Volltext über mehrere Felder)
  - Designer-Select (aus `store.allDesigners`)
  - Technik-Select (aus `store.allTechniques`)
  - Jahresfilter „von/bis“ (Number-Inputs)
  - Tag-Auswahl über Chips (aus `store.allTags`)
  - „Zurücksetzen“-Button, wenn Filter aktiv sind.

- **Ergebnisbereich (rechte Spalte)**
  - Toolbar mit:
    - Sortierung (`sortBy`) nach Datum, Name und Jahr (auf/absteigend)
    - View-Toggle (Grid vs. List)
  - Leere-State-Alert, wenn keine Muster gefunden wurden.
  - **Grid-View:** `PatternCard`-Karten.
  - **List-View:** `PatternListItem`-Komponenten.

#### PatternDetailView

- Ermittelt das Muster über `route.params.id` und `store.getPatternById`.
- **Fehlerfall:** Zeigt „Muster nicht gefunden“ mit Link zurück zur Übersicht.

- **Header**
  - Zurück-Button zur Liste
  - Name des Musters
  - Jahr, Designer, Herkunft

- **Layout:**
  - Links: Bildbereich
    - Hauptbild (aktiv ausgewähltes Bild), eingebettet in `ImageViewer` für Interaktion.
    - Badges für Rolle des Bildes (`thumbnail`, `paper_template`, `digital_pattern`, `other`) und HD-Angabe.
    - Thumbnail-Galerie aller Bilder; Klick wechselt `activeImage`.
  - Rechts: Detailkarten
    - Beschreibung
    - Metadaten (Jahr, Designer, Herkunft, Technik, Größe, Anzahl Bilder inkl. HD-Anteil)
    - Farben (als Chips)
    - Tags (als Chips, mit Link zurück zur Liste mit vorgewähltem Tag-Query)
    - Digitalisierung (Person + Datum, via `digitizedBy` und `digitizedAt`)

- **Bildübersicht-Tabelle**
  - Zeigt alle Bilder mit:
    - Vorschau-Thumbnail
    - Bezeichnung
    - Rolle (mit farbigem Chip und Icon)
    - Auflösung und HD-Flag
    - Button für interaktive Ansicht/Vollbild über `ImageViewer`.

---

## Datenmodell (aus `types/pattern.ts`, metadata.json)

Ein `Pattern` enthält typischerweise:

- Stammdaten:
  - `id: string`
  - `name: string`
  - `description: string`
  - `designer: string`
  - `origin: string` (Herkunft)
  - `technique: string`
  - `year: number`
  - `colors: string[]`
  - `tags: string[]`
- Digitalisierung:
  - `digitizedAt: string` (ISO-Datum)
  - `digitizedBy: string`
- Maße:
  - `width: number`
  - `height: number`
- Bilder (`PatternImage[]`):
  - `id: string`
  - `url: string`
  - `thumbnailUrl: string`
  - `label: string`
  - `role: 'thumbnail' | 'paper_template' | 'digital_pattern' | 'other'`
  - optional `width: number`, `height: number`, `isHighResolution: boolean`

---

## Datenquelle & Ablage

- Alle Muster-Daten liegen statisch im `public/patterns`-Verzeichnis.
- `index.json` enthält eine Liste aller Muster-IDs (z.B. `D1003`, `D1084`, `TH918`, ...).
- Zu jeder ID existiert ein Ordner mit:
  - `metadata.json` – strukturierte Metadaten
  - mehreren Bilddateien (`design.full.png`, Thumbnails, Symbolbilder, ggf. Scan der Papiervorlage).
- Die App lädt diese Daten clientseitig via `fetch`.

---

## Routing & UX-Aspekte

- Klare URL-Struktur für Muster: `/patterns/:id`.
- Scroll-Reset beim Routenwechsel (`scrollBehavior` → `{ top: 0 }`).
- Responsive Layout (Vuetify-Grids, unterschiedliche Darstellung für Mobile/Desktop).
- Light/Dark-Theme-Umschaltung auf App-Ebene.

---

## Mögliche Erweiterungen

- Persistenz der Filter- und View-Settings in der URL oder im LocalStorage.
- Direkte Auswertung von Query-Parametern (z. B. `?tag=...`) in `PatternListView`, damit Tag-Chips aus der Detailansicht die Liste direkt filtern.
- Lazy-Loading/Chunk-Splitting ist bereits für Views aktiv; könnte für weitere Komponenten weiter optimiert werden.
- Integration einer echten Backend-API anstelle statischer JSON-Dateien, falls die Sammlung stark wächst.

---

## Setup & Entwicklung

- Installation:
  - `npm install`
- Entwicklung:
  - `npm run dev`
- Build (inkl. Type-Check):
  - `npm run build`

(Weitere Details siehe `README.md` im Projekt.)
