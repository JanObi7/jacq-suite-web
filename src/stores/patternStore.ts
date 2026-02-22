import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
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

  // Dynamisches Laden der Pattern-Daten
  async function loadPatterns() {
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
    [...new Set(patterns.value.flatMap((p) => p.tags))].sort(),
  )

  // Gefilterte Muster
  const filteredPatterns = computed(() => {
    return patterns.value.filter((p) => {
      const q = searchQuery.value.toLowerCase()
      if (
        q &&
        !p.name.toLowerCase().includes(q) &&
        !p.description.toLowerCase().includes(q) &&
        !p.designer.toLowerCase().includes(q) &&
        !p.origin.toLowerCase().includes(q) &&
        !p.tags.some((t) => t.toLowerCase().includes(q))
      ) {
        return false
      }
      if (filterDesigner.value && p.designer !== filterDesigner.value) return false
      if (filterTechnique.value && p.technique !== filterTechnique.value) return false
      if (filterYearFrom.value !== null && p.year < filterYearFrom.value) return false
      if (filterYearTo.value !== null && p.year > filterYearTo.value) return false
      if (
        filterTags.value.length > 0 &&
        !filterTags.value.every((t) => p.tags.includes(t))
      ) {
        return false
      }
      return true
    })
  })

  // Die 5 zuletzt digitalisierten Muster (nach digitizedAt sortiert)
  const latestPatterns = computed(() => {
    return [...patterns.value]
      .sort((a, b) => new Date(b.digitizedAt).getTime() - new Date(a.digitizedAt).getTime())
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
