import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/stores/supabase'

import type { Pattern } from '@/types/pattern'

export const usePatternStore = defineStore('patterns', () => {
  const patterns = ref<Pattern[]>([])
  const isLoading = ref(false)
  const loadError = ref<string | null>(null)
  const searchQuery = ref('')
  const filterDesigner = ref('')
  const filterTechnique = ref('')
  const filterYearFrom = ref<number | null>(null)
  const filterYearTo = ref<number | null>(null)
  const filterTags = ref<string[]>([])

  // load all patterns
  async function loadPatterns() {
    // loading.value = true
    // error.value = null
    try {
      let query = supabase
        .from('patterns')
        .select('id, title, description, inventory_number, year, location, technique, designer, digitized_at, digitized_by, thumbnail_url')
        .order('year', { ascending: false })

      // if (filters.value.year) query = query.eq('year', filters.value.year)
      // if (filters.value.location) query = query.eq('location', filters.value.location)
      // if (filters.value.technique) query = query.eq('technique', filters.value.technique)

      const { data, error: err } = await query
      if (err) throw err
      patterns.value = data ?? []
    } catch (e) {
      // error.value = e.message
    } finally {
      // loading.value = false
    }
  }

  // Dynamisches Laden der Pattern-Daten
  async function _loadPatterns() {
    if (patterns.value.length > 0) return // Bereits geladen
    
    isLoading.value = true
    loadError.value = null
    
    try {
      // 1. Index-Datei laden
      const indexResponse = await fetch('/jacq-suite-web/patterns/index.json')
      if (!indexResponse.ok) {
        throw new Error('Konnte Pattern-Index nicht laden')
      }
      const indexData = await indexResponse.json()
      const patternIds: string[] = indexData.patterns
      
      // 2. Alle Pattern-Metadaten parallel laden
      const patternPromises = patternIds.map(async (id) => {
        try {
          const response = await fetch(`/jacq-suite-web/patterns/${id}/metadata.json`)
          if (!response.ok) {
            console.warn(`Konnte Metadaten für Pattern ${id} nicht laden`)
            return null
          }
          return await response.json()
        } catch (error) {
          console.warn(`Fehler beim Laden von Pattern ${id}:`, error)
          return null
        }
      })
      
      const loadedPatterns = await Promise.all(patternPromises)
      patterns.value = loadedPatterns.filter((p): p is Pattern => p !== null)
      
      console.log(`${patterns.value.length} Muster erfolgreich geladen`)
    } catch (error) {
      loadError.value = error instanceof Error ? error.message : 'Unbekannter Fehler'
      console.error('Fehler beim Laden der Muster:', error)
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
  const allTags = computed(() =>
    // [...new Set(patterns.value.flatMap((p) => p.tags))].sort(),
    [],
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
        !p.location.toLowerCase().includes(q) //&&
        // !p.tags.some((t) => t.toLowerCase().includes(q))
      ) {
        return false
      }
      if (filterDesigner.value && p.designer !== filterDesigner.value) return false
      if (filterTechnique.value && p.technique !== filterTechnique.value) return false
      if (filterYearFrom.value !== null && p.year < filterYearFrom.value) return false
      if (filterYearTo.value !== null && p.year > filterYearTo.value) return false
      if (
        filterTags.value.length > 0 // &&
        // !filterTags.value.every((t) => p.tags.includes(t))
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

  function resetFilters() {
    searchQuery.value = ''
    filterDesigner.value = ''
    filterTechnique.value = ''
    filterYearFrom.value = null
    filterYearTo.value = null
    filterTags.value = []
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
    filterTags,
    allDesigners,
    allTechniques,
    allTags,
    filteredPatterns,
    latestPatterns,
    loadPatterns,
    getPatternById,
    resetFilters,
  }
})
