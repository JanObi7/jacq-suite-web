# Projektanalyse: jacq-suite-web

> Letzte Aktualisierung: März 2026

---

## Überblick

**jacq-suite-web** ist eine Single-Page-Anwendung (SPA) auf Basis von **Vue 3**, **Vite** und **TypeScript**. Die App stellt eine digitale Sammlung historischer Jacquard-Webmuster dar. Nutzer können Muster durchsuchen, filtern und im Detail betrachten – inklusive hochauflösender, interaktiver Bildansichten via OpenSeadragon.

Die Datenhaltung erfolgt **nicht mehr statisch** (kein `/public/patterns`-Fetch), sondern über **Supabase** als Backend-as-a-Service (PostgreSQL + Storage).

---

## Tech-Stack

| Bereich | Technologie |
|---|---|
| Build-Tool | Vite 7 |
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Sprache | TypeScript 5.9 |
| State-Management | Pinia 3 |
| Routing | Vue Router 5 |
| UI-Framework | Vuetify 3.12 |
| Icons | Material Design Icons (`@mdi/font`) |
| Bild-Viewer | OpenSeadragon 5 (für hochauflösende/zoombare Bilder) |
| Backend / Auth | Supabase (`@supabase/supabase-js`) |

---

## Projektstruktur

```
jacq-suite-web/
├── index.html                    # SPA-Einstiegspunkt
├── vite.config.ts                # Vite-Konfiguration
├── package.json
├── tsconfig*.json
├── public/
│   ├── favicon.ico
│   ├── openseadragon/images/     # Statische Button-Assets für OSD
│   └── patterns/                 # Lokale Beispieldaten (nicht mehr aktiv genutzt)
│       ├── index.json
│       └── <ID>/
│           ├── metadata.json
│           ├── design.full.png / design.thumb.png
│           ├── symbol.png
│           └── *.tif.original.jpg / *.tif.thumb.jpg
└── src/
    ├── main.ts                   # App-Bootstrap
    ├── App.vue                   # Root-Layout
    ├── assets/
    │   └── banner.png            # Hero-Hintergrundbild
    ├── router/
    │   └── index.ts              # Routen-Definitionen
    ├── stores/
    │   ├── supabase.ts           # Supabase-Client-Singleton
    │   ├── patternStore.ts       # Muster-Daten, Filter, Computed
    │   └── authStore.ts          # Authentifizierung & Benutzerprofil
    ├── types/
    │   ├── pattern.ts            # Pattern & PatternImage Interfaces
    │   └── user.ts               # Profile Interface
    ├── views/
    │   ├── HomeView.vue          # Startseite
    │   ├── PatternListView.vue   # Musterübersicht mit Filter
    │   ├── PatternDetailView.vue # Muster-Detailansicht
    │   └── LoginView.vue         # Anmelden / Registrieren
    └── components/
        ├── PatternCard.vue       # Karten-Darstellung (Grid)
        ├── PatternListItem.vue   # Zeilen-Darstellung (Liste)
        └── ImageViewer.vue       # Vollbild- / OSD-Viewer (Dialog)
```

---

## Routing

Definiert in `src/router/index.ts` mit `createWebHistory`:

| Pfad | Name | Komponente | Lazy? |
|---|---|---|---|
| `/` | `home` | `HomeView` | Nein |
| `/login` | `login` | `LoginView` | Ja |
| `/patterns` | `patterns` | `PatternListView` | Ja |
| `/patterns/:id` | `pattern-detail` | `PatternDetailView` | Ja |

- `scrollBehavior` setzt beim Routenwechsel immer auf `{ top: 0 }`.
- Kein Route-Guard implementiert (Auth-Schutz liegt derzeit nur im UI).

---

## Backend: Supabase

### Verbindung (`src/stores/supabase.ts`)

- Supabase-Client wird als **Singleton** exportiert.
- Konfiguration über Umgebungsvariablen:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Fehlt eine Variable, wird eine Warnung in der Konsole ausgegeben und ein Placeholder-Client erstellt (verhindert Crash beim Build).
- `persistSession: true`, `autoRefreshToken: true` aktiviert.

### Datenbank-Tabellen (abgeleitet aus Queries)

**`patterns`**
- `id`, `title`, `description`, `inventory_number`
- `year`, `location`, `technique`, `designer`
- `digitized_at`, `digitized_by`
- `thumbnail_url`, `labels` (Array)

**`pattern_images`** (1:n zu `patterns`)
- Wird via Supabase-Join (`images:pattern_images(*)`) geladen
- Felder entsprechen `PatternImage`-Interface

**`profiles`**
- `id` (= Supabase Auth User ID)
- `display_name`, `role`

### Storage

- Bucket: `jacqsuite-images`
- Basis-URL: `https://udqxjkmnrefvkeuueoce.supabase.co/storage/v1/object/public/jacqsuite-images/`
- Bilder werden über relative Pfade in `thumbnailUrl` / `url` referenziert und im Frontend mit der Basis-URL zusammengesetzt.
- **Hinweis:** Die Basis-URL ist derzeit **hardcodiert** in mehreren Komponenten (PatternCard, PatternListItem, PatternDetailView, ImageViewer) – kein zentraler Konfigurationspunkt.

---

## Datenmodell (`src/types/`)

### `Pattern`

```typescript
interface Pattern {
  id: string
  title: string
  description: string
  inventory_number: string
  year: number
  designer: string
  location: string
  technique: string
  digitized_at: string       // ISO-Datum
  digitized_by: string
  thumbnail_url: string
  labels: string[]
  images?: PatternImage[]
}
```

### `PatternImage`

```typescript
type ImageRole = 'thumbnail' | 'paper_template' | 'digital_pattern' | 'other'

interface PatternImage {
  id: string
  url: string                // relativer Pfad im Storage-Bucket
  thumbnailUrl: string       // relativer Pfad im Storage-Bucket
  role: ImageRole
  label: string
  width?: number
  height?: number
  highres?: boolean          // true wenn > 15.000 × 10.000 px
}
```

### `Profile`

```typescript
interface Profile {
  id: string
  display_name: string
  role: string               // z.B. 'admin' | 'user'
}
```

---

## Stores

### `patternStore` (`src/stores/patternStore.ts`)

**State:**
| Feld | Typ | Beschreibung |
|---|---|---|
| `patterns` | `Pattern[]` | Alle geladenen Muster |
| `isLoading` | `boolean` | Ladezustand |
| `loadError` | `string \| null` | Fehlermeldung |
| `searchQuery` | `string` | Volltextsuche |
| `filterDesigner` | `string` | Filter nach Designer |
| `filterTechnique` | `string` | Filter nach Technik |
| `filterYearFrom` | `number \| null` | Jahresfilter von |
| `filterYearTo` | `number \| null` | Jahresfilter bis |
| `filterLabels` | `string[]` | Aktive Label-Filter |

**Datenladen (`loadPatterns`):**
- Supabase-Query auf Tabelle `patterns` mit Join auf `pattern_images`.
- Sortierung nach `year` absteigend.
- Fehlerzustand wird in `loadError` gespeichert.
- Wird in jeder View via `onMounted` aufgerufen (idempotent durch Pinia-Singleton).

**Computed:**
- `allDesigners` – sortierte, deduplizierte Designer-Liste
- `allTechniques` – sortierte, deduplizierte Techniken-Liste
- `allLabels` – sortierte, deduplizierte Labels aus allen Mustern
- `filteredPatterns` – Volltext + alle aktiven Filter kombiniert (AND-Logik)
- `latestPatterns` – Top 5 nach `digitized_at` absteigend

**Funktionen:**
- `getPatternById(id)` – Lookup im lokalen Array
- `resetFilters()` – setzt alle Filter auf Initialwerte

### `authStore` (`src/stores/authStore.ts`)

**State:**
- `user: User | null` – Supabase Auth User
- `profile: Profile | null` – Profil aus `profiles`-Tabelle
- `initialized: boolean`

**Computed:**
- `isAdmin` – `true` wenn `profile.role === 'admin'`

**Funktionen:**
- `init()` – liest aktuelle Session, registriert `onAuthStateChange`-Listener
- `fetchProfile()` – lädt Profil aus Supabase nach Login
- `signIn(email, password)` – Supabase Email/Password Login
- `signUp(email, password)` – Supabase Registrierung
- `signOut()` – Abmelden, State leeren

---

## Views

### `HomeView.vue`

- **Hero-Section:** Hintergrundbild (`banner.png`) mit Farbverlauf-Overlay, Titel, Untertitel, CTA-Button zu `/patterns`.
- **Stats-Bar:** Anzahl Muster, Designer, Techniken (reaktiv aus Store).
- **„Zuletzt digitalisiert":** Grid mit `PatternCard` für `store.latestPatterns` (5 Einträge).
- **Info-Section:** Drei Feature-Kacheln (HD-Bilder, Filter, Metadaten).

### `PatternListView.vue`

- **Header:** Anzahl gefilterter vs. Gesamtmuster.
- **Filter-Panel (linke Spalte, md=3):**
  - Volltextsuche (`v-text-field`)
  - Designer-Select (`v-select`)
  - Technik-Select (`v-select`)
  - Jahresfilter von/bis (`v-text-field` type=number)
  - Label-Chips (Toggle-Auswahl, Mehrfachauswahl möglich)
  - Reset-Icon wenn Filter aktiv (`hasActiveFilters`)
- **Ergebnisbereich (rechte Spalte, md=9):**
  - Sortier-Select (6 Optionen: Datum, Name, Jahr je auf/absteigend)
  - View-Toggle (Grid / Liste)
  - Leer-State-Alert
  - Grid: `PatternCard`-Komponenten
  - Liste: `PatternListItem`-Komponenten
- **Sortierung** erfolgt lokal im computed `sortedPatterns` (nicht im Store).

### `PatternDetailView.vue`

- Muster-Lookup via `store.getPatternById(route.params.id)`.
- **Fehlerfall:** Hinweis + Zurück-Button.
- **Header:** Zurück-Link, Titel, Jahr/Designer/Herkunft.
- **Linke Spalte (md=7):**
  - Hauptbild in `ImageViewer` eingebettet (klickbar).
  - Badges: Rolle des Bildes + HD-Auflösung.
  - Thumbnail-Galerie: Klick setzt `activeImage`.
- **Rechte Spalte (md=5):**
  - Beschreibungs-Card
  - Metadaten-Card (Jahr, Designer, Herkunft, Technik)
  - Tags-Card (Chips, verlinkt auf `/patterns?label=...` – **Query-Param wird in PatternListView aktuell nicht ausgewertet!**)
  - Digitalisierungs-Card (Person, Datum, Bildanzahl inkl. HD-Anteil)
- **Bildübersicht-Tabelle:** Alle Bilder mit Vorschau, Bezeichnung, Rolle-Chip, Auflösung, Aktions-Button.
- **Auskommentierte Bereiche:** Größen-Metadaten und Farben-Card sind im Template vorhanden, aber deaktiviert.

### `LoginView.vue`

- Zentriertes Formular mit Tabs (Anmelden / Registrieren).
- **Login:** E-Mail + Passwort, Passwort-Sichtbarkeits-Toggle, Fehleranzeige.
- **Registrierung:** E-Mail, Passwort, Passwort-Bestätigung mit Validierungsregeln, Erfolgsmeldung.
- Nach Login: Redirect zu `route.query.redirect ?? '/'`.
- **Hinweis:** `LoginView` nutzt `<script setup>` **ohne TypeScript** (kein `lang="ts"`).

---

## Komponenten

### `PatternCard.vue`

- Vuetify `v-card` mit `hover` und `:to`-Prop (navigiert zu `/patterns/:id`).
- Zeigt: Thumbnail-Bild, Titel, Jahr, Technik, Designer, Herkunft, Labels (max. 3 + Overflow-Chip), Digitalisierungs-Info.
- HD-Badge wenn `hasHighResImage`.
- Hover-Effekt: `translateY(-4px)` via CSS.

### `PatternListItem.vue`

- Horizontales Layout: Thumbnail links (140px), Inhalt rechts.
- Zeigt: Titel, Jahr/Designer/Technik/Herkunft, Beschreibung (2-zeilig geclampt), Labels (max. 4), Digitalisierungs-Info.
- **Bug:** `hasHighResImage` computed nutzt leeres lokales `images`-Array statt `props.pattern.images` – Badge funktioniert nicht.
- Hover-Effekt: `translateX(4px)` via CSS.

### `ImageViewer.vue`

- Wrapper-Komponente mit `<slot>` als Trigger (Activator für `v-dialog`).
- Öffnet Vollbild-Dialog (`fullscreen`).
- **Normaler Viewer:** `v-img` mit `contain` für Bilder ohne HD-Flag.
- **OpenSeadragon-Viewer:** Für `image.highres === true`:
  - Initialisiert OSD in `watch(dialog)` nach `nextTick`.
  - Unterstützt `.dzi`-Kacheln (Deep Zoom Image) und normale Bilder.
  - `prefixUrl` zeigt auf `/jacq-suite-web/openseadragon/images/` (Deployment-Pfad hardcodiert).
  - Viewer wird beim Schließen des Dialogs und beim `onUnmounted` zerstört.
- Hover-Overlay mit Icon (Lupe/Vollbild) über dem Trigger-Slot.

---

## Bekannte Probleme & Verbesserungspotenzial

### Bugs

1. **`PatternListItem.vue` – `hasHighResImage`:** Nutzt ein leeres lokales Array `const images = <PatternImage[]>[]` statt `props.pattern.images`. Das HD-Badge wird nie angezeigt (auskommentiert, aber Logik ist trotzdem falsch).

2. **Tag-Links in `PatternDetailView`:** Tags verlinken auf `/patterns?label=...`, aber `PatternListView` wertet `route.query.label` nicht aus – der Filter wird nicht gesetzt.

3. **`activeImage` Initialisierung in `PatternDetailView`:** Wenn `pattern` beim ersten Render noch `undefined` ist (Daten noch nicht geladen), wird `activeImage` mit einem leeren Dummy-Objekt initialisiert. Der `watch(pattern, ...)` korrigiert das, aber es gibt einen kurzen Moment mit ungültigem State.

4. **`LoginView.vue` ohne TypeScript:** Einzige View ohne `lang="ts"` – inkonsistent mit dem Rest des Projekts.

### Hardcodierte Werte

- Supabase Storage-Basis-URL (`https://udqxjkmnrefvkeuueoce.supabase.co/...`) ist in **4 Dateien** dupliziert: `PatternCard.vue`, `PatternListItem.vue`, `PatternDetailView.vue`, `ImageViewer.vue`. Sollte in eine zentrale Konstante oder Composable ausgelagert werden.
- OpenSeadragon `prefixUrl` (`/jacq-suite-web/openseadragon/images/`) enthält den Deployment-Pfad hardcodiert.

### Fehlende Features

- **Route Guards:** Kein Schutz für geschützte Routen (z.B. Admin-Bereich).
- **URL-Persistenz der Filter:** Filter-State geht beim Navigieren verloren.
- **Query-Parameter-Auswertung:** `PatternListView` ignoriert URL-Query-Parameter beim Laden.
- **Loading-State in Views:** `isLoading` und `loadError` aus dem Store werden in keiner View angezeigt (kein Skeleton/Spinner/Fehler-Alert).
- **`isAdmin`-Flag** im AuthStore ist definiert, wird aber nirgendwo genutzt.

### Architektur-Anmerkungen

- `loadPatterns()` wird in jeder View einzeln via `onMounted` aufgerufen. Da Pinia ein Singleton ist, ist das funktional korrekt (zweiter Aufruf überschreibt), aber es gibt keine Prüfung ob Daten bereits geladen sind (kein `if (patterns.value.length > 0) return`).
- Die `public/patterns/`-Ordner mit lokalen Metadaten und Bildern sind noch vorhanden, werden aber nicht mehr genutzt (Daten kommen aus Supabase).

---

## Setup & Entwicklung

```bash
# Abhängigkeiten installieren
npm install

# .env.local anlegen (Supabase-Credentials)
# VITE_SUPABASE_URL=https://...supabase.co
# VITE_SUPABASE_ANON_KEY=...

# Entwicklungsserver starten
npm run dev

# Build (inkl. TypeScript-Check)
npm run build

# Build-Vorschau
npm run preview
```

**Node.js-Anforderung:** `^20.19.0` oder `>=22.12.0`
