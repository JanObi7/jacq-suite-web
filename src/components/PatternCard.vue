<template>
  <v-card
    :to="`/patterns/${pattern.id}`"
    hover
    rounded="lg"
    class="pattern-card h-100"
  >
    <!-- Bild -->
    <v-img
      :src="store.getSymbolUrl(pattern)"
      :alt="pattern.title"
      height="200"
      cover
      class="bg-grey-lighten-3"
    >
      <template #placeholder>
        <div class="d-flex align-center justify-center fill-height">
          <v-progress-circular indeterminate color="primary" />
        </div>
      </template>
    </v-img>

    <v-card-item>
      <v-card-title class="text-body-1 font-weight-bold">{{ pattern.title }}</v-card-title>
    </v-card-item>

    <v-card-text class="pt-0">
      <div class="d-flex align-center ga-1 mb-2 text-caption text-medium-emphasis">
        <v-icon icon="mdi-map-marker-outline" size="14" />
        <span>{{ pattern.origin }}</span>
      </div>
      <div class="d-flex align-center ga-1 mb-2 text-caption text-medium-emphasis">
        <v-icon icon="mdi-identifier" size="14" />
        <span>{{ pattern.inventory }}</span>
      </div>
    </v-card-text>

    <v-card-actions class="pt-0">
      <div class="d-flex align-center ga-1 text-caption text-medium-emphasis">
        <v-icon icon="mdi-account-outline" size="14" />
        <span>{{ pattern.digitized_by }}</span>
      </div>
      <div class="d-flex align-center ga-1 text-caption text-medium-emphasis">
        <v-icon icon="mdi-calendar-check-outline" size="14" />
        <span>{{ formatDate(pattern.digitized_at) }}</span>
      </div>
      <v-spacer />
      <v-icon icon="mdi-chevron-right" color="primary" />
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePatternStore } from '@/stores/patternStore'
import type { Pattern } from '@/types/pattern'

const store = usePatternStore()

const props = defineProps<{
  pattern: Pattern
}>()

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
</script>

<style scoped>
.pattern-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
}
.pattern-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25) !important;
}
</style>
