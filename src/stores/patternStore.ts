import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Pattern } from '@/types/pattern'
import { mockPatterns } from '@/data/mockPatterns'

export const usePatternStore = defineStore('patterns', () => {
  const patterns = ref<Pattern[]>(mockPatterns)
  const searchQuery = ref('')
  const filterDesigner = ref('')
  const filterTechnique = ref('')
  const filterYearFrom = ref<number | null>(null)
  const filterYearTo = ref<number | null>(null)
  const filterTags = ref<string[]>([])

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
    getPatternById,
    resetFilters,
  }
})
