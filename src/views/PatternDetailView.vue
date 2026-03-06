<template>
  <v-container fluid class="pa-0">

    <!-- Bestätigungsdialog Löschen (außerhalb von v-if/v-else) -->
    <v-dialog v-model="confirmDelete" max-width="480" persistent>
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center ga-2 pt-5 px-6">
          <v-icon icon="mdi-alert-circle-outline" color="error" size="28" />
          <span>Muster unwiderruflich löschen?</span>
        </v-card-title>
        <v-card-text class="px-6">
          <p class="text-body-2 mb-3">
            Das Muster <strong>{{ pattern?.title }}</strong> und alle damit verbundenen
            Bilddatensätze werden <strong>unwiderruflich</strong> aus der Datenbank gelöscht.
          </p>
          <v-alert type="warning" variant="tonal" density="compact" icon="mdi-database-remove-outline">
            Dieser Vorgang kann nicht rückgängig gemacht werden.
          </v-alert>
        </v-card-text>
        <v-card-actions class="px-6 pb-5">
          <v-spacer />
          <v-btn
            variant="tonal"
            color="secondary"
            prepend-icon="mdi-close"
            :disabled="deleting"
            @click="confirmDelete = false"
          >
            Abbrechen
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            prepend-icon="mdi-delete-forever"
            :loading="deleting"
            @click="handleDelete"
          >
            Endgültig löschen
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Nicht gefunden -->
    <v-container v-if="!pattern" class="py-12 text-center">
      <v-icon icon="mdi-alert-circle-outline" size="64" color="error" class="mb-4" />
      <h2 class="text-h5 mb-2">Muster nicht gefunden</h2>
      <p class="text-medium-emphasis mb-4">Das gesuchte Muster existiert nicht.</p>
      <v-btn to="/patterns" color="primary" prepend-icon="mdi-arrow-left">
        Zurück zur Übersicht
      </v-btn>
    </v-container>

    <!-- Detailansicht -->
    <template v-else>
      <!-- Header -->
      <v-sheet color="primary" class="py-6 px-4 text-white">
        <v-container>
          <div class="d-flex align-center justify-space-between mb-3">
            <v-btn
              to="/patterns"
              variant="text"
              color="white"
              prepend-icon="mdi-arrow-left"
              size="small"
              class="opacity-80"
            >
              Alle Muster
            </v-btn>
            <div class="d-flex ga-2">
              <v-btn
                v-if="auth.isEditor"
                :to="`/patterns/${pattern.id}/edit`"
                variant="tonal"
                color="white"
                prepend-icon="mdi-pencil"
                size="small"
              >
                Bearbeiten
              </v-btn>
              <v-btn
                v-if="auth.isAdmin"
                variant="tonal"
                color="error"
                prepend-icon="mdi-delete-outline"
                size="small"
                @click="confirmDelete = true"
              >
                Löschen
              </v-btn>
            </div>
          </div>
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

            <!-- Symbolbild (immer quadratisch 500×500 px) -->
            <v-card rounded="lg" class="mb-4 overflow-hidden">
              <v-card-title class="text-body-1 font-weight-bold">
                <v-icon icon="mdi-image-outline" class="mr-2" />
                Symbolbild
              </v-card-title>
              <v-divider />
              <v-card-text class="pa-3">
                <v-img
                  :src="store.getSymbolUrl(pattern)"
                  :alt="pattern.title"
                  :aspect-ratio="1"
                  cover
                  rounded="md"
                  class="bg-grey-lighten-3"
                  style="max-width: 500px; margin: 0 auto"
                >
                  <template #placeholder>
                    <div class="d-flex align-center justify-center fill-height">
                      <v-progress-circular indeterminate color="primary" />
                    </div>
                  </template>
                  <template #error>
                    <div class="d-flex flex-column align-center justify-center fill-height ga-2">
                      <v-icon icon="mdi-image-off-outline" size="48" color="grey" />
                      <span class="text-caption text-medium-emphasis">Kein Symbolbild vorhanden</span>
                    </div>
                  </template>
                  <!-- Auflösungs-Badge -->
                  <v-chip
                    color="primary"
                    size="x-small"
                    variant="flat"
                    class="position-absolute ma-2"
                    style="bottom: 0; right: 0"
                    prepend-icon="mdi-resize"
                  >
                    500 × 500 px
                  </v-chip>
                </v-img>
              </v-card-text>
            </v-card>

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
              </v-list>
            </v-card>

            <!-- Tags -->
            <v-card rounded="lg" class="mb-4">
              <v-card-title class="text-body-1 font-weight-bold">
                <v-icon icon="mdi-tag-multiple-outline" class="mr-2" />
                Kategorien
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
                    <v-icon icon="mdi-identifier" color="primary" size="20" />
                  </template>
                  <v-list-item-title class="text-caption text-medium-emphasis">Inventarnummer</v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 font-weight-medium">
                    {{ pattern.inventory }}
                  </v-list-item-subtitle>
                </v-list-item>
                <v-divider inset />
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

          <!-- ImageViewer über der Tabelle -->
          <v-card-text class="pa-3">
            <ImageViewer :image="activeImage">
              <v-img
                :src="store.getThumbnailUrl(activeImage)"
                :alt="activeImage.label"
                height="420"
                cover
                class="bg-grey-lighten-3 cursor-pointer rounded-lg"
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
                  color="accent"
                  size="small"
                  variant="flat"
                  class="position-absolute ma-3"
                  style="bottom: 0; right: 0"
                  prepend-icon="mdi-magnify-plus"
                >
                  {{ activeImage.width?.toLocaleString('de-DE') }} ×
                  {{ activeImage.height?.toLocaleString('de-DE') }} px
                </v-chip>
              </v-img>
            </ImageViewer>
            <div class="text-caption text-medium-emphasis text-center mt-1">
              <v-icon icon="mdi-cursor-pointer" size="14" class="mr-1" />
              Klicken für Vollbildansicht
            </div>
          </v-card-text>

          <v-divider />
          <v-table density="compact">
            <thead>
              <tr>
                <th>Vorschau</th>
                <th>Bezeichnung</th>
                <th>Rolle</th>
                <th>Auflösung</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="img in pattern.images"
                :key="img.id"
                class="cursor-pointer"
                :class="{ 'row-active': activeImage.id === img.id }"
                @click="activeImage = img"
              >
                <td class="py-2">
                  <v-img
                    :src="store.getThumbnailUrl(img)"
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
                  </span>
                  <span v-else class="text-medium-emphasis">–</span>
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
import { useAuthStore } from '@/stores/authStore'
import type { PatternImage, ImageRole } from '@/types/pattern'
import ImageViewer from '@/components/ImageViewer.vue'

const route = useRoute()
const router = useRouter()
const store = usePatternStore()
const auth = useAuthStore()

// Daten beim Mounten laden
onMounted(() => {
  store.loadPatterns()
})

const pattern = computed(() => store.getPatternById(route.params.id as string))

const emptyImage: PatternImage = {
  id: '',
  pattern_id: '',
  filename: '',
  role: 'other' as ImageRole,
  label: '',
}

const activeImage = ref<PatternImage>(
  pattern.value?.images?.[0] ?? emptyImage
)

watch(pattern, (newPattern) => {
  activeImage.value = newPattern?.images?.[0] ?? emptyImage
})

// Löschen-State
const confirmDelete = ref(false)
const deleting = ref(false)

async function handleDelete() {
  if (!pattern.value) return
  deleting.value = true
  try {
    await store.deletePattern(pattern.value.id)
    confirmDelete.value = false
    router.push({ name: 'home' })
  } catch (e) {
    console.error('Fehler beim Löschen:', e)
  } finally {
    deleting.value = false
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function roleColor(role: ImageRole): string {
  const map: Record<ImageRole, string> = {
    paper: 'warning',
    digital: 'success',
    other: 'secondary',
  }
  return map[role]
}

function roleIcon(role: ImageRole): string {
  const map: Record<ImageRole, string> = {
    paper: 'mdi-file-document-outline',
    digital: 'mdi-grid',
    other: 'mdi-image-plus-outline',
  }
  return map[role]
}

function roleLabel(role: ImageRole): string {
  const map: Record<ImageRole, string> = {
    paper: 'Papiervorlage',
    digital: 'Digitales Muster',
    other: 'Weiteres Bild',
  }
  return map[role]
}
</script>

<style scoped>
.row-active {
  background-color: rgb(var(--v-theme-primary), 0.08);
}
</style>
