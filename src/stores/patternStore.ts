import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/stores/supabase'

import type { Pattern, PatternImage, ImageRole } from '@/types/pattern'

export const usePatternStore = defineStore('patterns', () => {
  const imagebase = "https://udqxjkmnrefvkeuueoce.supabase.co/storage/v1/object/public/jacqsuite-images/"

  const patterns = ref<Pattern[]>([])
  const isLoading = ref(false)
  const loadError = ref<string | null>(null)
  const searchQuery = ref('')
  const filterDesigner = ref('')
  const filterTechnique = ref('')
  const filterYearFrom = ref<number | null>(null)
  const filterYearTo = ref<number | null>(null)
  const filterLabels = ref<string[]>([])

  // load all patterns
  async function loadPatterns() {
    isLoading.value = true
    loadError.value = null
    try {
      let query = supabase
        .from('patterns')
        .select(`id, title, description, inventory_number, year, location, technique,designer,
          digitized_at, digitized_by, thumbnail_url,labels,
          images:pattern_images(*)`)
        .order('year', { ascending: false })

      // if (filters.value.year) query = query.eq('year', filters.value.year)
      // if (filters.value.location) query = query.eq('location', filters.value.location)
      // if (filters.value.technique) query = query.eq('technique', filters.value.technique)

      const { data, error: err } = await query
      if (err) throw err
      patterns.value = data ?? []
    } catch (e) {
      loadError.value = e instanceof Error ? e.message : String(e)
    } finally {
      isLoading.value = false
    }
  }

  // Alle verfügbaren Designer (für Filter-Dropdown)
  const allDesigners = computed(() =>
    [...new Set(patterns.value.map((p) => p.designer))].sort(),
  )

  // Alle verfügbaren Techniken (für Filter-Dropdown)
  const allTechniques = computed(() =>
    [...new Set(patterns.value.map((p) => p.technique))].sort(),
  )

  // Alle verfügbaren Tags (für Filter-Chips)
  const allLabels = computed(() =>
    [...new Set(patterns.value.flatMap((p) => p.labels))].sort(),
  )

  // Gefilterte Muster
  const filteredPatterns = computed(() => {
    return patterns.value.filter((p) => {
      const q = searchQuery.value.toLowerCase()
      if (
        q &&
        !p.title.toLowerCase().includes(q) &&
        !p.description.toLowerCase().includes(q) &&
        !p.designer.toLowerCase().includes(q) &&
        !p.location.toLowerCase().includes(q) &&
        !p.labels.some((t) => t.toLowerCase().includes(q))
      ) {
        return false
      }
      if (filterDesigner.value && p.designer !== filterDesigner.value) return false
      if (filterTechnique.value && p.technique !== filterTechnique.value) return false
      if (filterYearFrom.value !== null && p.year < filterYearFrom.value) return false
      if (filterYearTo.value !== null && p.year > filterYearTo.value) return false
      if (
        filterLabels.value.length > 0 &&
        !filterLabels.value.every((t) => p.labels.includes(t))
      ) {
        return false
      }
      return true
    })
  })

  // Die 5 zuletzt digitalisierten Muster (nach digitizedAt sortiert)
  const latestPatterns = computed(() => {
    return [...patterns.value]
      .sort((a, b) => new Date(b.digitized_at).getTime() - new Date(a.digitized_at).getTime())
      .slice(0, 5)
  })

  function getPatternById(id: string): Pattern | undefined {
    return patterns.value.find((p) => p.id === id)
  }

  function getThumbnailUrl(pattern: Pattern): string {
    const thumbImage = pattern.images?.find((img) => img.role === 'thumbnail')
    const url = thumbImage?.thumbnailUrl || ''
    return url ? imagebase+url : ''
  }

  function getImageUrl(image: PatternImage): string {
    const url = image?.url || ''
    return url ? imagebase+url : ''
  }

  function getImageThumbnailUrl(image: PatternImage): string {
    const url = image?.thumbnailUrl || ''
    return url ? imagebase+url : ''
  }


  function resetFilters() {
    searchQuery.value = ''
    filterDesigner.value = ''
    filterTechnique.value = ''
    filterYearFrom.value = null
    filterYearTo.value = null
    filterLabels.value = []
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
    data: Pick<Pattern, 'title' | 'description' | 'inventory_number' | 'year' | 'designer' | 'location' | 'technique' | 'labels' | 'digitized_at' | 'digitized_by'>,
  ): Promise<Pattern> {
    const { data: created, error } = await supabase
      .from('patterns')
      .insert({ ...data, thumbnail_url: '' })
      .select(`id, title, description, inventory_number, year, location, technique, designer,
        digitized_at, digitized_by, thumbnail_url, labels,
        images:pattern_images(*)`)
      .single()
    if (error) throw error
    const newPattern = created as Pattern
    patterns.value.unshift(newPattern)
    return newPattern
  }

  async function uploadPatternImage(
    patternId: string,
    file: File,
    meta: { role: ImageRole; label: string },
  ): Promise<void> {
    // 1) Datei in Supabase Storage hochladen
    const filePath = `${patternId}/${Date.now()}_${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('jacqsuite-images')
      .upload(filePath, file)
    if (uploadError) throw uploadError

    // 2) (Optional) Bildgröße bestimmen - hier ggf. noch per Image() / Backend lösen
    let width: number | undefined
    let height: number | undefined
    await new Promise<void>((resolve) => {
      const img = new Image()
      img.onload = () => {
        width = img.width
        height = img.height
        resolve()
      }
      img.onerror = () => resolve()
      img.src = URL.createObjectURL(file)
    })

    const highres = !!(width && height && width > 15000 && height > 10000)

    // 3) Datensatz in pattern_images anlegen
    const { data, error } = await supabase
      .from('pattern_images')
      .insert({
        pattern_id: patternId,
        url: filePath,
        thumbnailUrl: filePath, // TODO: echte Thumbnail-Generierung, falls vorhanden
        role: meta.role,
        label: meta.label,
        width,
        height,
        highres,
      })
      .select('*')
      .single()
    if (error) throw error

    const newImage = data as PatternImage

    // 4) Lokalen Store aktualisieren
    const pattern = patterns.value.find((p) => p.id === patternId)
    if (pattern) {
      pattern.images = [...(pattern.images ?? []), newImage]
    }
  }

  async function updatePatternImage(
    imageId: string,
    updates: Partial<Pick<PatternImage, 'role' | 'label' | 'highres' | 'width' | 'height'>>,
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
        pattern.images[idx] = { ...pattern.images[idx], ...updates }
        break
      }
    }
  }

  async function deletePatternImage(imageId: string): Promise<void> {
    // zuerst Bildpfad finden
    let target: { patternId: string; url: string } | null = null
    for (const p of patterns.value) {
      const img = p.images?.find((i) => i.id === imageId)
      if (img) {
        target = { patternId: p.id, url: img.url }
        break
      }
    }

    // DB-Eintrag löschen
    const { error } = await supabase
      .from('pattern_images')
      .delete()
      .eq('id', imageId)
    if (error) throw error

    // Storage-Datei löschen (falls gefunden)
    if (target) {
      await supabase.storage
        .from('jacqsuite-images')
        .remove([target.url])
    }

    // Lokalen Store aktualisieren
    patterns.value = patterns.value.map((p) => ({
      ...p,
      images: p.images?.filter((img) => img.id !== imageId),
    }))
  }

  // Muster-Metadaten in Supabase aktualisieren
  async function updatePattern(
    id: string,
    updates: Partial<Pick<Pattern, 'title' | 'description' | 'year' | 'designer' | 'location' | 'technique' | 'labels' | 'digitized_at' | 'digitized_by'>>,
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
    filterDesigner,
    filterTechnique,
    filterYearFrom,
    filterYearTo,
    filterLabels,
    allDesigners,
    allTechniques,
    allLabels,
    filteredPatterns,
    latestPatterns,
    loadPatterns,
    getPatternById,
    getThumbnailUrl,
    getImageUrl,
    getImageThumbnailUrl,

    resetFilters,
    createPattern,
    updatePattern,
    deletePattern,
    uploadPatternImage,
    updatePatternImage,
    deletePatternImage,
  }
})
