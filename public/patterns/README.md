# Pattern-Daten Struktur

## Übersicht

Die Musterdaten werden dynamisch aus JSON-Dateien im `public/patterns/` Verzeichnis geladen.

## Verzeichnisstruktur

```
public/patterns/
├── index.json              # Index-Datei mit allen Pattern-IDs
├── D913/
│   ├── metadata.json       # Metadaten für Pattern D913
│   ├── thumbnail.png       # Symbolbild
│   ├── design_scan_small.jpg
│   └── design_full_small.png
├── D4145/
│   ├── metadata.json
│   ├── symbol.png
│   ├── design.full.png
│   └── ...
└── ...
```

## Index-Datei (`index.json`)

Die `index.json` Datei im Hauptverzeichnis listet alle verfügbaren Pattern-IDs auf:

```json
{
  "patterns": [
    "D913",
    "D1694",
    "D1723",
    ...
  ]
}
```

## Metadata-Datei (`metadata.json`)

Jedes Pattern-Verzeichnis muss eine `metadata.json` Datei enthalten:

```json
{
  "id": "D913",
  "name": "Rosenmuster D913",
  "year": 1978,
  "digitizedAt": "2026-02-21",
  "designer": "Tannenhauer",
  "origin": "Braunsdorf, Deutschland",
  "technique": "Jacquard-Gewebe",
  "colors": ["Weiß", "Rot"],
  "description": "Elegantes Rosenmuster...",
  "tags": ["Rosen", "Floral"],
  "images": [
    {
      "id": "D913-1",
      "url": "/jacq-suite-web/patterns/D913/thumbnail.png",
      "thumbnailUrl": "/jacq-suite-web/patterns/D913/thumbnail.png",
      "role": "thumbnail",
      "label": "Symbolbild",
      "width": 512,
      "height": 512,
      "isHighResolution": false
    },
    ...
  ]
}
```

### Felder

- **id**: Eindeutige Pattern-ID (muss mit Verzeichnisnamen übereinstimmen)
- **name**: Anzeigename des Musters
- **year**: Entstehungsjahr
- **digitizedAt**: Datum der Digitalisierung (ISO 8601 Format: YYYY-MM-DD)
- **designer**: Name des Designers
- **origin**: Herkunftsort
- **technique**: Webtechnik
- **colors**: Array von Farbnamen
- **description**: Beschreibungstext
- **tags**: Array von Tags für Filterung
- **images**: Array von Bild-Objekten

### Bild-Rollen

- **thumbnail**: Symbolbild (wird auf Kacheln angezeigt)
- **paper_template**: Papiervorlage/Scan
- **digital_pattern**: Digitales Muster (meist hochauflösend)
- **other**: Weitere Bilder (Details, Varianten, etc.)

### Bild-URLs

Alle URLs müssen mit `/jacq-suite-web/patterns/` beginnen (Base-URL beachten!).

## Neues Pattern hinzufügen

1. Erstelle ein neues Verzeichnis unter `public/patterns/` mit der Pattern-ID als Namen
2. Lege die Bilddateien in diesem Verzeichnis ab
3. Erstelle eine `metadata.json` Datei mit allen erforderlichen Feldern
4. Füge die Pattern-ID zur `index.json` Datei hinzu
5. Die Anwendung lädt die Daten automatisch beim nächsten Start

## Hinweise

- Hochauflösende Bilder (>15.000 × 10.000 px) werden mit OpenSeadragon interaktiv angezeigt
- Thumbnails sollten eine moderate Größe haben (ca. 512×512 px)
- Alle Pfade sind relativ zum `public/` Verzeichnis
- Die Daten werden beim ersten Laden der Anwendung gecacht
