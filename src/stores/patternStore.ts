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

  function resetFilters() {
    searchQuery.value = ''
    filterDesigner.value = ''
    filterTechnique.value = ''
    filterYearFrom.value = null
    filterYearTo.value = null
    filterLabels.value = []
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
    resetFilters,
  }
})
