<template>
  <v-card :to="`/patterns/${pattern.id}`" hover rounded="lg" class="pattern-list-item">
    <div class="d-flex align-stretch">
      <!-- Thumbnail -->
      <v-img
        :src="store.getThumbnailUrl(pattern)"
        :alt="pattern.title"
        width="140"
        min-width="140"
        cover
        class="rounded-s-lg bg-grey-lighten-3 flex-shrink-0"
      >
        <template #placeholder>
          <div class="d-flex align-center justify-center fill-height">
            <v-progress-circular indeterminate color="primary" size="24" />
          </div>
        </template>
      </v-img>

      <!-- Content -->
      <div class="flex-grow-1 pa-3 d-flex flex-column justify-space-between">
        <div>
          <div class="d-flex align-start justify-space-between ga-2">
            <div>
              <div class="text-body-1 font-weight-bold">{{ pattern.title }}</div>
              <div class="text-caption text-medium-emphasis">
                {{ pattern.year }} · {{ pattern.designer }} · {{ pattern.technique }} · {{ pattern.location }}
              </div>
            </div>
            <!-- <div class="d-flex flex-column align-end ga-1 flex-shrink-0">
              <v-chip v-if="hasHighResImage" size="x-small" color="accent" prepend-icon="mdi-magnify-plus">
                HD
              </v-chip>
              <v-chip size="x-small" variant="tonal" color="secondary">
                {{ pattern.images.length }} Bild{{ pattern.images.length !== 1 ? 'er' : '' }}
              </v-chip>
            </div> -->
          </div>

          <p class="text-body-2 text-medium-emphasis mt-2 description-clamp">
            {{ pattern.description }}
          </p>
        </div>

        <div class="d-flex align-center justify-space-between mt-2 flex-wrap ga-1">
          <div class="d-flex flex-wrap ga-1">
            <v-chip
              v-for="tag in pattern.labels.slice(0, 4)"
              :key="tag"
              size="x-small"
              variant="tonal"
              color="primary"
            >
              {{ tag }}
            </v-chip>
            <v-chip v-if="pattern.labels.length > 4" size="x-small" variant="tonal" color="secondary">
              +{{ pattern.labels.length - 4 }}
            </v-chip>
          </div>
          <div class="d-flex align-center ga-3 text-caption text-medium-emphasis">
            <span>
              <v-icon icon="mdi-account-outline" size="12" class="mr-1" />
              {{ pattern.digitized_by }}
            </span>
            <span>
              <v-icon icon="mdi-calendar-check-outline" size="12" class="mr-1" />
              {{ formatDate(pattern.digitized_at) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePatternStore } from '@/stores/patternStore'
import type { Pattern, PatternImage } from '@/types/pattern'

const store = usePatternStore()

const props = defineProps<{
  pattern: Pattern
}>()

const images = <PatternImage[]>[]

const hasHighResImage = computed(() => images.some((img) => img.highres))

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
</script>

<style scoped>
.pattern-list-item {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
}
.pattern-list-item:hover {
  transform: translateX(4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25) !important;
}
.description-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
