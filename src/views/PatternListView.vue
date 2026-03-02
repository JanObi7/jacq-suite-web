<template>
  <v-container fluid class="pa-0">
    <!-- Page Header -->
    <v-sheet color="primary" class="py-6 px-4 text-white">
      <v-container>
        <h1 class="text-h4 font-weight-bold mb-1">Alle Muster</h1>
        <p class="text-body-2 opacity-80">
          {{ store.filteredPatterns.length }} von {{ store.patterns.length }} Mustern
        </p>
      </v-container>
    </v-sheet>

    <v-container class="py-6">
      <v-row>
        <!-- Filter Panel -->
        <v-col cols="12" md="3">
          <v-card rounded="lg" class="mb-4">
            <v-card-title class="d-flex align-center justify-space-between">
              <span class="text-body-1 font-weight-bold">
                <v-icon icon="mdi-filter-variant" class="mr-1" />
                Filter
              </span>
              <span class="text-body-1 font-weight-bold">
              <v-icon
                v-if="hasActiveFilters"
                icon="mdi-filter-off"
                color="error"
                @click="store.resetFilters()"
              />
              </span>
            </v-card-title>
            <v-divider />
            <v-card-text>
              <!-- Suche -->
              <v-text-field
                v-model="store.searchQuery"
                label="Suche"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                clearable
                class="mb-4"
                hide-details
              />

              <!-- Designer Filter -->
              <v-select
                v-model="store.filterDesigner"
                :items="store.allDesigners"
                label="Designer"
                prepend-inner-icon="mdi-account-outline"
                variant="outlined"
                density="compact"
                clearable
                class="mb-4"
                hide-details
              />

              <!-- Technik Filter -->
              <v-select
                v-model="store.filterTechnique"
                :items="store.allTechniques"
                label="Technik"
                prepend-inner-icon="mdi-cog-outline"
                variant="outlined"
                density="compact"
                clearable
                class="mb-4"
                hide-details
              />

              <!-- Jahr von/bis -->
              <div class="text-caption text-medium-emphasis mb-2">Entstehungsjahr</div>
              <v-row dense class="mb-4">
                <v-col cols="6">
                  <v-text-field
                    v-model.number="store.filterYearFrom"
                    label="Von"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model.number="store.filterYearTo"
                    label="Bis"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details
                  />
                </v-col>
              </v-row>

              <!-- Tags Filter -->
              <div class="text-caption text-medium-emphasis mb-2">Labels</div>
              <div class="d-flex flex-wrap ga-1">
                <v-chip
                  v-for="tag in store.allLabels"
                  :key="tag"
                  size="small"
                  :variant="store.filterLabels.includes(tag) ? 'elevated' : 'tonal'"
                  :color="store.filterLabels.includes(tag) ? 'primary' : 'default'"
                  class="cursor-pointer"
                  @click="toggleTag(tag)"
                >
                  {{ tag }}
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Results -->
        <v-col cols="12" md="9">
          <!-- Toolbar: Sortierung + View Toggle -->
          <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-2">
            <div class="text-body-2 text-medium-emphasis">
              <strong>{{ store.filteredPatterns.length }}</strong> Muster gefunden
            </div>
            <div class="d-flex align-center ga-2">
              <!-- Sortierung -->
              <v-select
                v-model="sortBy"
                :items="sortOptions"
                item-title="label"
                item-value="value"
                variant="outlined"
                density="compact"
                hide-details
                style="min-width: 180px"
              />
              <!-- View Toggle -->
              <v-btn-toggle v-model="viewMode" mandatory density="compact" color="primary">
                <v-btn value="grid" icon="mdi-view-grid" />
                <v-btn value="list" icon="mdi-view-list" />
              </v-btn-toggle>
            </div>
          </div>

          <!-- Keine Ergebnisse -->
          <v-alert
            v-if="sortedPatterns.length === 0"
            type="info"
            variant="tonal"
            icon="mdi-magnify-remove-outline"
          >
            Keine Muster gefunden. Bitte passen Sie Ihre Filterkriterien an.
          </v-alert>

          <!-- Grid View -->
          <v-row v-else-if="viewMode === 'grid'">
            <v-col
              v-for="pattern in sortedPatterns"
              :key="pattern.id"
              cols="12"
              sm="6"
              lg="4"
            >
              <PatternCard :pattern="pattern" />
            </v-col>
          </v-row>

          <!-- List View -->
          <div v-else class="d-flex flex-column ga-3">
            <PatternListItem
              v-for="pattern in sortedPatterns"
              :key="pattern.id"
              :pattern="pattern"
            />
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePatternStore } from '@/stores/patternStore'
import PatternCard from '@/components/PatternCard.vue'
import PatternListItem from '@/components/PatternListItem.vue'

const store = usePatternStore()
const viewMode = ref<'grid' | 'list'>('list')
const sortBy = ref('digitizedAt_desc')

// Daten beim Mounten laden
onMounted(() => {
  store.loadPatterns()
})

const sortOptions = [
  { label: 'Neueste zuerst', value: 'digitizedAt_desc' },
  { label: 'Älteste zuerst', value: 'digitizedAt_asc' },
  { label: 'Name A–Z', value: 'name_asc' },
  { label: 'Name Z–A', value: 'name_desc' },
  { label: 'Jahr aufsteigend', value: 'year_asc' },
  { label: 'Jahr absteigend', value: 'year_desc' },
]

const hasActiveFilters = computed(
  () =>
    store.searchQuery !== '' ||
    store.filterDesigner !== '' ||
    store.filterTechnique !== '' ||
    store.filterYearFrom !== null ||
    store.filterYearTo !== null ||
    store.filterLabels.length > 0,
)

const sortedPatterns = computed(() => {
  const list = [...store.filteredPatterns]
  switch (sortBy.value) {
    case 'digitizedAt_desc':
      return list.sort(
        (a, b) => new Date(b.digitized_at).getTime() - new Date(a.digitized_at).getTime(),
      )
    case 'digitizedAt_asc':
      return list.sort(
        (a, b) => new Date(a.digitized_at).getTime() - new Date(b.digitized_at).getTime(),
      )
    case 'name_asc':
      return list.sort((a, b) => a.title.localeCompare(b.title, 'de'))
    case 'name_desc':
      return list.sort((a, b) => b.title.localeCompare(a.title, 'de'))
    case 'year_asc':
      return list.sort((a, b) => a.year - b.year)
    case 'year_desc':
      return list.sort((a, b) => b.year - a.year)
    default:
      return list
  }
})

function toggleTag(tag: string) {
  const idx = store.filterLabels.indexOf(tag)
  if (idx === -1) {
    store.filterLabels.push(tag)
  } else {
    store.filterLabels.splice(idx, 1)
  }
}
</script>
