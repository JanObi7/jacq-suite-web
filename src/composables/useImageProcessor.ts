/**
 * Composable für clientseitige Bildverarbeitung via Canvas API.
 * Zuschneiden auf quadratisches Format (center-crop), Skalieren auf Zielgröße,
 * Konvertierung in WebP.
 */
export function useImageProcessor() {
  /**
   * Lädt eine Datei als HTMLImageElement.
   */
  function loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Bild konnte nicht geladen werden.'))
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Schneidet ein Bild quadratisch zu (center-crop), skaliert es auf
   * targetSize × targetSize Pixel und gibt es als WebP-Blob zurück.
   *
   * @param file       Quelldatei (beliebiges Bildformat)
   * @param targetSize Zielgröße in Pixeln (Standard: 500)
   * @param quality    WebP-Qualität 0–1 (Standard: 0.88)
   */
  async function cropSquareAndConvert(
    file: File,
    targetSize = 500,
    quality = 0.88,
  ): Promise<Blob> {
    const img = await loadImage(file)

    // Quadratischen Ausschnitt berechnen (center-crop)
    const size = Math.min(img.width, img.height)
    const sx = Math.floor((img.width - size) / 2)
    const sy = Math.floor((img.height - size) / 2)

    // Canvas erstellen und zeichnen
    const canvas = document.createElement('canvas')
    canvas.width = targetSize
    canvas.height = targetSize
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D-Kontext nicht verfügbar.')

    ctx.drawImage(
      img,
      sx, sy,       // Quell-Offset
      size, size,   // Quell-Größe (quadratisch)
      0, 0,         // Ziel-Offset
      targetSize, targetSize, // Ziel-Größe
    )

    // Als WebP-Blob exportieren
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('WebP-Konvertierung fehlgeschlagen.'))
        },
        'image/webp',
        quality,
      )
    })
  }

  /**
   * Verkleinert ein Bild so, dass die längere Seite maximal maxSize Pixel beträgt
   * (Seitenverhältnis bleibt erhalten) und konvertiert es in WebP.
   *
   * @param file     Quelldatei
   * @param maxSize  Maximale Breite oder Höhe in Pixeln (Standard: 500)
   * @param quality  WebP-Qualität 0–1 (Standard: 0.88)
   */
  async function resizeAndConvert(
    file: File,
    maxSize = 500,
    quality = 0.88,
  ): Promise<Blob> {
    const img = await loadImage(file)

    // Zielgröße berechnen: längere Seite = maxSize, Seitenverhältnis erhalten
    let targetW: number
    let targetH: number
    if (img.width >= img.height) {
      targetW = Math.min(img.width, maxSize)
      targetH = Math.round((img.height / img.width) * targetW)
    } else {
      targetH = Math.min(img.height, maxSize)
      targetW = Math.round((img.width / img.height) * targetH)
    }

    const canvas = document.createElement('canvas')
    canvas.width = targetW
    canvas.height = targetH
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D-Kontext nicht verfügbar.')

    ctx.drawImage(img, 0, 0, targetW, targetH)

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('WebP-Konvertierung fehlgeschlagen.'))
        },
        'image/webp',
        quality,
      )
    })
  }

  /**
   * Erstellt eine temporäre Vorschau-URL aus einem Blob/File.
   * Muss nach Verwendung mit URL.revokeObjectURL() freigegeben werden.
   */
  function createPreviewUrl(blob: Blob | File): string {
    return URL.createObjectURL(blob)
  }

  return { cropSquareAndConvert, resizeAndConvert, createPreviewUrl }
}
