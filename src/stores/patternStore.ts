import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/stores/supabase'

import type { Pattern, PatternImage, ImageRole } from '@/types/pattern'

export const usePatternStore = defineStore('patterns', () => {
  const patterns = ref<Pattern[]>([])
  const isLoading = ref(false)
  const loadError = ref<string | null>(null)
  const searchQuery = ref('')
  const filterOrigin = ref('')

  // load all patterns
  async function loadPatterns() {
    isLoading.value = true
    loadError.value = null
    try {
      let query = supabase
        .from('patterns')
        .select(`id, title, description, inventory, origin,
          digitized_at, digitized_by,
          images:pattern_images(*)`)
        .order('digitized_at', { ascending: false })

      const { data, error: err } = await query
      if (err) throw err
      patterns.value = data ?? []
    } catch (e) {
      loadError.value = e instanceof Error ? e.message : String(e)
    } finally {
      isLoading.value = false
    }
  }

  // Alle verfügbaren Quellenangaben (für Filter-Dropdown)
  const allOrigins = computed(() =>
    [...new Set(patterns.value.map((p) => p.origin))].sort(),
  )

  // Alle verfügbaren Bearbeiterangaben (für Filter-Dropdown)
  const allEditors = computed(() =>
    [...new Set(patterns.value.map((p) => p.digitized_by))].sort(),
  )

  // Gefilterte Muster
  const filteredPatterns = computed(() => {
    return patterns.value.filter((p) => {
      const q = searchQuery.value?.toLowerCase()
      return !(q &&
        !p.title?.toLowerCase().includes(q) &&
        !p.description?.toLowerCase().includes(q) &&
        !p.origin?.toLowerCase().includes(q) &&
        !p.digitized_by?.toLowerCase().includes(q))
    })
  })

  // Die 5 zuletzt digitalisierten Muster (nach digitizedAt sortiert)
  const latestPatterns = computed(() => {
    return [...patterns.value]
      .sort((a, b) => new Date(b.digitized_at).getTime() - new Date(a.digitized_at).getTime())
      .slice(0, 6)
  })

  function getPatternById(id: string): Pattern | undefined {
    return patterns.value.find((p) => p.id === id)
  }

  function getSymbolUrl(pattern: Pattern): string {
    return supabase.storage.from('jacqsuite-images').getPublicUrl(`${pattern.id}/symbol.webp`).data.publicUrl
  }

  function getImageUrl(image: PatternImage): string {
    if (!image.filename || !image.pattern_id) return ''
    return supabase.storage
      .from('jacqsuite-images')
      .getPublicUrl(`${image.pattern_id}/${image.filename}`).data.publicUrl
  }

  function getThumbnailUrl(image: PatternImage): string {
    if (!image.filename || !image.pattern_id) return ''
    return supabase.storage
      .from('jacqsuite-images')
      .getPublicUrl(`${image.pattern_id}/${image.filename}.webp`).data.publicUrl
  }


  function resetFilters() {
    searchQuery.value = ''
    filterOrigin.value = ''
  }

  // Muster und alle zugehörigen Bilder aus Supabase löschen
  async function deletePattern(id: string): Promise<void> {
    // pattern_images werden via ON DELETE CASCADE automatisch mitgelöscht
    // (sofern in der DB so konfiguriert), alternativ explizit vorher löschen:
    const { error: imgError } = await supabase
      .from('pattern_images')
      .delete()
      .eq('pattern_id', id)
    if (imgError) throw imgError

    const { error } = await supabase
      .from('patterns')
      .delete()
      .eq('id', id)
    if (error) throw error

    // Lokalen Store-State aktualisieren
    patterns.value = patterns.value.filter((p) => p.id !== id)
  }

  // Neues Muster in Supabase anlegen
  async function createPattern(
    data: Pick<Pattern, 'title' | 'description' | 'inventory' | 'origin' | 'digitized_at' | 'digitized_by'>,
  ): Promise<Pattern> {
    const { data: created, error } = await supabase
      .from('patterns')
      .insert(data)
      .select(`id, title, description, inventory, origin,
        digitized_at, digitized_by,
        images:pattern_images(*)`)
      .single()
    if (error) throw error
    const newPattern = created as Pattern
    patterns.value.unshift(newPattern)
    return newPattern
  }

  /**
   * Hilfsfunktion: Bild auf max. maxSize px (längere Seite) verkleinern,
   * Seitenverhältnis erhalten, als WebP-Blob zurückgeben.
   */
  function _resizeToWebP(file: File, maxSize = 500, quality = 0.88): Promise<{ blob: Blob; width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onerror = () => reject(new Error('Bild konnte nicht geladen werden.'))
      img.onload = () => {
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
        if (!ctx) { reject(new Error('Canvas nicht verfügbar.')); return }
        ctx.drawImage(img, 0, 0, targetW, targetH)
        canvas.toBlob(
          (blob) => {
            if (blob) resolve({ blob, width: targetW, height: targetH })
            else reject(new Error('WebP-Konvertierung fehlgeschlagen.'))
          },
          'image/webp',
          quality,
        )
      }
      img.src = URL.createObjectURL(file)
    })
  }

  async function uploadPatternImage(
    patternId: string,
    file: File,
    meta: { role: ImageRole; label: string },
  ): Promise<void> {
    // Dateiname ohne Sonderzeichen
    const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const originalPath = `${patternId}/${safeFilename}`
    const thumbnailPath = `${patternId}/${safeFilename}.webp`

    // 1) Originalgröße bestimmen
    const origSize = await new Promise<{ width: number; height: number }>((resolve) => {
      const img = new Image()
      img.onload = () => resolve({ width: img.width, height: img.height })
      img.onerror = () => resolve({ width: 0, height: 0 })
      img.src = URL.createObjectURL(file)
    })

    // 2) Original-Datei hochladen
    const { error: origError } = await supabase.storage
      .from('jacqsuite-images')
      .upload(originalPath, file, { upsert: true })
    if (origError) throw origError

    // 3) WebP-Thumbnail erzeugen und hochladen
    const { blob: thumbBlob } = await _resizeToWebP(file, 500, 0.88)
    const { error: thumbError } = await supabase.storage
      .from('jacqsuite-images')
      .upload(thumbnailPath, thumbBlob, { contentType: 'image/webp', upsert: true })
    if (thumbError) throw thumbError

    // 4) Datensatz in pattern_images anlegen
    const { data, error } = await supabase
      .from('pattern_images')
      .insert({
        pattern_id: patternId,
        filename: safeFilename,
        role: meta.role,
        label: meta.label,
        width: origSize.width,
        height: origSize.height,
      })
      .select('*')
      .single()
    if (error) throw error

    const newImage = data as PatternImage

    // 5) Lokalen Store aktualisieren
    const pattern = patterns.value.find((p) => p.id === patternId)
    if (pattern) {
      pattern.images = [...(pattern.images ?? []), newImage]
    }
  }

  async function updatePatternImage(
    imageId: string,
    updates: Partial<Pick<PatternImage, 'role' | 'label' | 'width' | 'height'>>,
  ): Promise<void> {
    const { error } = await supabase
      .from('pattern_images')
      .update(updates)
      .eq('id', imageId)
    if (error) throw error

    // lokalen State aktualisieren
    for (const pattern of patterns.value) {
      const idx = pattern.images?.findIndex((img) => img.id === imageId) ?? -1
      if (idx !== -1 && pattern.images) {
        pattern.images[idx] = { ...pattern.images[idx], ...updates } as PatternImage
        break
      }
    }
  }

  async function deletePatternImage(imageId: string): Promise<void> {
    // Bildpfad und patternId finden
    let target: { patternId: string; filename: string } | null = null
    for (const p of patterns.value) {
      const img = p.images?.find((i) => i.id === imageId)
      if (img) {
        target = { patternId: p.id, filename: img.filename }
        break
      }
    }

    // DB-Eintrag löschen
    const { error } = await supabase
      .from('pattern_images')
      .delete()
      .eq('id', imageId)
    if (error) throw error

    // Storage-Dateien löschen (Original + WebP-Thumbnail)
    if (target) {
      const originalPath = `${target.patternId}/${target.filename}`
      const thumbnailPath = `${target.patternId}/${target.filename}.webp`
      await supabase.storage
        .from('jacqsuite-images')
        .remove([originalPath, thumbnailPath])
    }

    // Lokalen Store aktualisieren
    patterns.value = patterns.value.map((p) => ({
      ...p,
      images: p.images?.filter((img) => img.id !== imageId),
    }))
  }

  // Symbolbild hochladen: bereits verarbeiteter WebP-Blob → Storage unter <patternId>/symbol.webp
  async function uploadSymbolImage(patternId: string, blob: Blob): Promise<void> {
    const filePath = `${patternId}/symbol.webp`

    // upsert: überschreibt vorhandene Datei
    const { error: uploadError } = await supabase.storage
      .from('jacqsuite-images')
      .upload(filePath, blob, {
        contentType: 'image/webp',
        upsert: true,
      })
    if (uploadError) throw uploadError
  }

  // Muster-Metadaten in Supabase aktualisieren
  async function updatePattern(
    id: string,
    updates: Partial<Pick<Pattern, 'title' | 'inventory' | 'description' | 'origin' | 'digitized_at' | 'digitized_by'>>,
  ): Promise<void> {
    const { error } = await supabase
      .from('patterns')
      .update(updates)
      .eq('id', id)
    if (error) throw error

    // Lokalen Store-State aktualisieren
    const idx = patterns.value.findIndex((p) => p.id === id)
    if (idx !== -1) {
      patterns.value[idx] = { ...patterns.value[idx], ...updates } as Pattern
    }
  }

  return {
    patterns,
    isLoading,
    loadError,
    searchQuery,
    filterOrigin,
    allOrigins,
    allEditors,
    filteredPatterns,
    latestPatterns,
    loadPatterns,
    getPatternById,
    getSymbolUrl,
    getImageUrl,
    getThumbnailUrl,

    resetFilters,
    createPattern,
    updatePattern,
    deletePattern,
    uploadPatternImage,
    updatePatternImage,
    deletePatternImage,
    uploadSymbolImage,
  }
})
