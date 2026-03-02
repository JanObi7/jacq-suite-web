<template>
  <v-container fluid class="pa-0">
    <!-- Nicht gefunden -->
    <v-container v-if="!pattern" class="py-12 text-center">
      <v-icon icon="mdi-alert-circle-outline" size="64" color="error" class="mb-4" />
      <h2 class="text-h5 mb-2">Muster nicht gefunden</h2>
      <p class="text-medium-emphasis mb-4">Das gesuchte Muster existiert nicht.</p>
      <v-btn to="/patterns" color="primary" prepend-icon="mdi-arrow-left">
        Zurück zur Übersicht
      </v-btn>
    </v-container>

    <template v-else>
      <!-- Header -->
      <v-sheet color="primary" class="py-6 px-4 text-white">
        <v-container>
          <v-btn
            to="/patterns"
            variant="text"
            color="white"
            prepend-icon="mdi-arrow-left"
            class="mb-3 opacity-80"
            size="small"
          >
            Alle Muster
          </v-btn>
          <h1 class="text-h4 font-weight-bold mb-1">{{ pattern.title }}</h1>
          <div class="d-flex align-center ga-3 flex-wrap opacity-80 text-body-2">
            <span>
              <v-icon icon="mdi-calendar-outline" size="16" class="mr-1" />
              {{ pattern.year }}
            </span>
            <span>
              <v-icon icon="mdi-account-outline" size="16" class="mr-1" />
              {{ pattern.designer }}
            </span>
            <span>
              <v-icon icon="mdi-map-marker-outline" size="16" class="mr-1" />
              {{ pattern.location }}
            </span>
          </div>
        </v-container>
      </v-sheet>

      <v-container class="py-6">
        <v-row>
          <!-- Linke Spalte: Bilder -->
          <v-col cols="12" md="7" lg="8">
            <!-- Hauptbild -->
            <v-card rounded="lg" class="mb-4 overflow-hidden">
              <ImageViewer :image="activeImage">
                <v-img
                  :src="'https://udqxjkmnrefvkeuueoce.supabase.co/storage/v1/object/public/jacqsuite-images/'+activeImage.thumbnailUrl"
                  :alt="activeImage.label"
                  height="420"
                  cover
                  class="bg-grey-lighten-3"
                >
                  <template #placeholder>
                    <div class="d-flex align-center justify-center fill-height">
                      <v-progress-circular indeterminate color="primary" />
                    </div>
                  </template>
                  <!-- Rolle Badge -->
                  <v-chip
                    :color="roleColor(activeImage.role)"
                    size="small"
                    variant="flat"
                    class="position-absolute ma-3"
                    style="bottom: 0; left: 0"
                    :prepend-icon="roleIcon(activeImage.role)"
                  >
                    {{ activeImage.label }}
                  </v-chip>
                  <!-- HD Badge -->
                  <v-chip
                    v-if="activeImage.highres"
                    color="accent"
                    size="small"
                    variant="flat"
                    class="position-absolute ma-3"
                    style="bottom: 0; right: 0"
                    prepend-icon="mdi-magnify-plus"
                  >
                    HD · {{ activeImage.width?.toLocaleString('de-DE') }} ×
                    {{ activeImage.height?.toLocaleString('de-DE') }} px
                  </v-chip>
                </v-img>
              </ImageViewer>
              <v-card-text class="py-2 text-caption text-medium-emphasis text-center">
                <v-icon icon="mdi-cursor-pointer" size="14" class="mr-1" />
                Klicken für
                {{ activeImage.highres ? 'interaktive Hochauflösungs-Ansicht' : 'Vollbildansicht' }}
              </v-card-text>
            </v-card>

            <!-- Bildergalerie (Thumbnails) -->
            <div class="d-flex flex-wrap ga-2">
              <v-card
                v-for="img in pattern.images"
                :key="img.id"
                :class="['image-thumb cursor-pointer', { 'thumb-active': activeImage.id === img.id }]"
                rounded="md"
                :elevation="activeImage.id === img.id ? 4 : 1"
                @click="activeImage = img"
              >
                <v-img
                  :src="'https://udqxjkmnrefvkeuueoce.supabase.co/storage/v1/object/public/jacqsuite-images/'+img.thumbnailUrl"
                  :alt="img.label"
                  width="90"
                  height="68"
                  cover
                  class="bg-grey-lighten-3"
                />
                <div class="text-center pa-1">
                  <span class="text-caption" style="font-size: 10px; line-height: 1.2">
                    {{ img.label }}
                  </span>
                  <v-icon
                    v-if="img.highres"
                    icon="mdi-magnify-plus"
                    size="10"
                    color="accent"
                    class="ml-1"
                  />
                </div>
              </v-card>
            </div>
          </v-col>

          <!-- Rechte Spalte: Metadaten -->
          <v-col cols="12" md="5" lg="4">
            <!-- Beschreibung -->
            <v-card rounded="lg" class="mb-4">
              <v-card-title class="text-body-1 font-weight-bold">
                <v-icon icon="mdi-text-box-outline" class="mr-2" />
                Beschreibung
              </v-card-title>
              <v-divider />
              <v-card-text>
                <p class="text-body-2">{{ pattern.description }}</p>
              </v-card-text>
            </v-card>

            <!-- Metadaten -->
            <v-card rounded="lg" class="mb-4">
              <v-card-title class="text-body-1 font-weight-bold">
                <v-icon icon="mdi-information-outline" class="mr-2" />
                Metadaten
              </v-card-title>
              <v-divider />
              <v-list density="compact">
                <v-list-item>
                  <template #prepend>
                    <v-icon icon="mdi-calendar-outline" color="primary" size="20" />
                  </template>
                  <v-list-item-title class="text-caption text-medium-emphasis">Entstehungsjahr</v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 font-weight-medium">{{ pattern.year }}</v-list-item-subtitle>
                </v-list-item>
                <v-divider inset />
                <v-list-item>
                  <template #prepend>
                    <v-icon icon="mdi-account-outline" color="primary" size="20" />
                  </template>
                  <v-list-item-title class="text-caption text-medium-emphasis">Designer</v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 font-weight-medium">{{ pattern.designer }}</v-list-item-subtitle>
                </v-list-item>
                <v-divider inset />
                <v-list-item>
                  <template #prepend>
                    <v-icon icon="mdi-map-marker-outline" color="primary" size="20" />
                  </template>
                  <v-list-item-title class="text-caption text-medium-emphasis">Herkunft</v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 font-weight-medium">{{ pattern.location }}</v-list-item-subtitle>
                </v-list-item>
                <v-divider inset />
                <v-list-item>
                  <template #prepend>
                    <v-icon icon="mdi-cog-outline" color="primary" size="20" />
                  </template>
                  <v-list-item-title class="text-caption text-medium-emphasis">Technik</v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 font-weight-medium">{{ pattern.technique }}</v-list-item-subtitle>
                </v-list-item>
                <v-divider inset />
                <!-- <v-list-item>
                  <template #prepend>
                    <v-icon icon="mdi-arrow-all" color="primary" size="20" />
                  </template>
                  <v-list-item-title class="text-caption text-medium-emphasis">Größe</v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 font-weight-medium">{{ pattern.width.toLocaleString('de-DE') }} × {{ pattern.height.toLocaleString('de-DE') }}</v-list-item-subtitle>
                </v-list-item> -->
                
              </v-list>
            </v-card>

            <!-- Farben -->
            <!-- <v-card rounded="lg" class="mb-4">
              <v-card-title class="text-body-1 font-weight-bold">
                <v-icon icon="mdi-palette-outline" class="mr-2" />
                Farben
              </v-card-title>
              <v-divider />
              <v-card-text>
                <div class="d-flex flex-wrap ga-2">
                  <v-chip
                    v-for="color in pattern.colors"
                    :key="color"
                    size="small"
                    variant="tonal"
                    prepend-icon="mdi-circle"
                  >
                    {{ color }}
                  </v-chip>
                </div>
              </v-card-text>
            </v-card> -->

            <!-- Tags -->
            <v-card rounded="lg" class="mb-4">
              <v-card-title class="text-body-1 font-weight-bold">
                <v-icon icon="mdi-tag-multiple-outline" class="mr-2" />
                Tags
              </v-card-title>
              <v-divider />
              <v-card-text>
                <div class="d-flex flex-wrap ga-2">
                  <v-chip
                    v-for="label in pattern.labels"
                    :key="label"
                    size="small"
                    variant="tonal"
                    color="primary"
                    :to="`/patterns?label=${label}`"
                  >
                    {{ label }}
                  </v-chip>
                </div>
              </v-card-text>
            </v-card>

            <!-- Digitalisierung -->
            <v-card rounded="lg" class="mb-4">
              <v-card-title class="text-body-1 font-weight-bold">
                <v-icon icon="mdi-image-edit-outline" class="mr-2" />
                Digitalisierung
              </v-card-title>
              <v-divider />
              <v-list density="compact">
                <v-list-item>
                  <template #prepend>
                    <v-icon icon="mdi-account-outline" color="primary" size="20" />
                  </template>
                  <v-list-item-title class="text-caption text-medium-emphasis">Digitalisiert von</v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 font-weight-medium">
                    {{ pattern.digitized_by }}
                  </v-list-item-subtitle>
                </v-list-item>
                <v-divider inset />
                <v-list-item>
                  <template #prepend>
                    <v-icon icon="mdi-calendar-check-outline" color="primary" size="20" />
                  </template>
                  <v-list-item-title class="text-caption text-medium-emphasis">Digitalisiert am</v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 font-weight-medium">
                    {{ formatDate(pattern.digitized_at) }}
                  </v-list-item-subtitle>
                </v-list-item>
                <v-divider inset />
                <v-list-item>
                  <template #prepend>
                    <v-icon icon="mdi-image-multiple-outline" color="primary" size="20" />
                  </template>
                  <v-list-item-title class="text-caption text-medium-emphasis">Bilder</v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 font-weight-medium">
                    {{ pattern.images?.length }} Bild{{ pattern.images?.length !== 1 ? 'er' : '' }}
                    <span v-if="highResCount > 0" class="text-accent">
                      ({{ highResCount }} HD)
                    </span>
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>

        <!-- Bildübersicht Tabelle -->
        <v-card rounded="lg">
          <v-card-title class="text-body-1 font-weight-bold">
            <v-icon icon="mdi-image-multiple-outline" class="mr-2" />
            Alle Bilder dieses Musters
          </v-card-title>
          <v-divider />
          <v-table density="compact">
            <thead>
              <tr>
                <th>Vorschau</th>
                <th>Bezeichnung</th>
                <th>Rolle</th>
                <th>Auflösung</th>
                <th>Aktion</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="img in pattern.images" :key="img.id">
                <td class="py-2">
                  <v-img
                    :src="'https://udqxjkmnrefvkeuueoce.supabase.co/storage/v1/object/public/jacqsuite-images/'+img.thumbnailUrl"
                    width="60"
                    height="45"
                    cover
                    rounded="sm"
                    class="bg-grey-lighten-3"
                  />
                </td>
                <td>{{ img.label }}</td>
                <td>
                  <v-chip :color="roleColor(img.role)" size="x-small" :prepend-icon="roleIcon(img.role)">
                    {{ roleLabel(img.role) }}
                  </v-chip>
                </td>
                <td class="text-caption">
                  <span v-if="img.width && img.height">
                    {{ img.width.toLocaleString('de-DE') }} × {{ img.height.toLocaleString('de-DE') }} px
                    <v-chip v-if="img.highres" size="x-small" color="accent" class="ml-1">HD</v-chip>
                  </span>
                  <span v-else class="text-medium-emphasis">–</span>
                </td>
                <td>
                  <ImageViewer :image="img">
                    <v-btn
                      size="x-small"
                      variant="tonal"
                      :color="img.highres ? 'accent' : 'primary'"
                      :prepend-icon="img.highres ? 'mdi-magnify-scan' : 'mdi-fullscreen'"
                    >
                      {{ img.highres ? 'Interaktiv' : 'Ansehen' }}
                    </v-btn>
                  </ImageViewer>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-container>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePatternStore } from '@/stores/patternStore'
import type { PatternImage, ImageRole } from '@/types/pattern'
import ImageViewer from '@/components/ImageViewer.vue'

const route = useRoute()
const router = useRouter()
const store = usePatternStore()

// Daten beim Mounten laden
onMounted(() => {
  store.loadPatterns()
})

const pattern = computed(() => store.getPatternById(route.params.id as string))

const activeImage = ref<PatternImage>(
  <PatternImage>pattern.value?.images?.find((img) => img.role === 'thumbnail') ?? {
      id: '',
      url: '',
      thumbnailUrl: '',
      role: 'other',
      label: '',
    },
)

watch(pattern, async (newPattern, oldPattern) => {
  activeImage.value = <PatternImage>pattern.value?.images?.find((img) => img.role === 'thumbnail') ?? {
    id: '',
    url: '',
    thumbnailUrl: '',
    role: 'other',
    label: '',
  }
})

const highResCount = computed(
  () => pattern.value?.images?.filter((img) => img.highres).length ?? 0,
)

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function roleColor(role: ImageRole): string {
  const map: Record<ImageRole, string> = {
    thumbnail: 'primary',
    paper_template: 'warning',
    digital_pattern: 'success',
    other: 'secondary',
  }
  return map[role]
}

function roleIcon(role: ImageRole): string {
  const map: Record<ImageRole, string> = {
    thumbnail: 'mdi-image-outline',
    paper_template: 'mdi-file-document-outline',
    digital_pattern: 'mdi-grid',
    other: 'mdi-image-plus-outline',
  }
  return map[role]
}

function roleLabel(role: ImageRole): string {
  const map: Record<ImageRole, string> = {
    thumbnail: 'Symbolbild',
    paper_template: 'Papiervorlage',
    digital_pattern: 'Digitales Muster',
    other: 'Weiteres Bild',
  }
  return map[role]
}
</script>

<style scoped>
.image-thumb {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  overflow: hidden;
}
.image-thumb:hover {
  transform: scale(1.05);
}
.thumb-active {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}
</style>
