<template>
  <v-container fluid class="pa-0">
    <!-- Muster nicht gefunden -->
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
          <div class="d-flex align-center justify-space-between mb-3">
            <v-btn
              :to="`/patterns/${pattern.id}`"
              variant="text"
              color="white"
              prepend-icon="mdi-arrow-left"
              size="small"
              class="opacity-80"
            >
              Zurück zur Detailansicht
            </v-btn>
            <v-chip color="white" variant="tonal" prepend-icon="mdi-pencil" size="small">
              Bearbeitungsmodus
            </v-chip>
          </div>
          <h1 class="text-h4 font-weight-bold mb-1">{{ pattern.title }}</h1>
          <div class="text-body-2 opacity-80">
            <v-icon icon="mdi-identifier" size="16" class="mr-1" />
            {{ pattern.inventory }}
          </div>
        </v-container>
      </v-sheet>

      <v-container class="py-6">
        <!-- Erfolgs- / Fehlermeldung -->
        <v-alert
          v-if="successMsg"
          type="success"
          variant="tonal"
          class="mb-6"
          closable
          prepend-icon="mdi-check-circle-outline"
          @click:close="successMsg = ''"
        >
          {{ successMsg }}
        </v-alert>
        <v-alert
          v-if="errorMsg"
          type="error"
          variant="tonal"
          class="mb-6"
          closable
          prepend-icon="mdi-alert-circle-outline"
          @click:close="errorMsg = ''"
        >
          {{ errorMsg }}
        </v-alert>

        <v-form ref="formRef" @submit.prevent="handleSave">
          <v-row>
            <!-- Linke Spalte: Hauptfelder -->
            <v-col cols="12" md="8">

              <!-- Basisdaten -->
              <v-card rounded="lg" class="mb-6">
                <v-card-title class="text-body-1 font-weight-bold">
                  <v-icon icon="mdi-information-outline" class="mr-2" />
                  Basisdaten
                </v-card-title>
                <v-divider />
                <v-card-text>
                  <v-row>
                    <v-col cols="12" sm="8">
                      <v-text-field
                        v-model="form.title"
                        label="Titel"
                        prepend-inner-icon="mdi-format-title"
                        variant="outlined"
                        density="comfortable"
                        :rules="[rules.required]"
                        :disabled="saving"
                      />
                    </v-col>
                    <v-col cols="12" sm="4">
                      <v-text-field
                        v-model="form.inventory"
                        label="Inventarnummer"
                        prepend-inner-icon="mdi-identifier"
                        variant="outlined"
                        density="comfortable"
                        :rules="[rules.required]"
                        :disabled="saving"
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model.number="form.year"
                        label="Entstehungsjahr"
                        type="number"
                        prepend-inner-icon="mdi-calendar-outline"
                        variant="outlined"
                        density="comfortable"
                        :rules="[rules.required, rules.validYear]"
                        :disabled="saving"
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="form.technique"
                        label="Technik"
                        prepend-inner-icon="mdi-cog-outline"
                        variant="outlined"
                        density="comfortable"
                        :rules="[rules.required]"
                        :disabled="saving"
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="form.designer"
                        label="Designer"
                        prepend-inner-icon="mdi-account-outline"
                        variant="outlined"
                        density="comfortable"
                        :rules="[rules.required]"
                        :disabled="saving"
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="form.location"
                        label="Herkunft"
                        prepend-inner-icon="mdi-map-marker-outline"
                        variant="outlined"
                        density="comfortable"
                        :rules="[rules.required]"
                        :disabled="saving"
                      />
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>

              <!-- Beschreibung -->
              <v-card rounded="lg" class="mb-6">
                <v-card-title class="text-body-1 font-weight-bold">
                  <v-icon icon="mdi-text-box-outline" class="mr-2" />
                  Beschreibung
                </v-card-title>
                <v-divider />
                <v-card-text>
                  <v-textarea
                    v-model="form.description"
                    label="Beschreibung"
                    prepend-inner-icon="mdi-text"
                    variant="outlined"
                    density="comfortable"
                    rows="5"
                    auto-grow
                    :disabled="saving"
                  />
                </v-card-text>
              </v-card>

              <!-- Digitalisierung -->
              <v-card rounded="lg" class="mb-6">
                <v-card-title class="text-body-1 font-weight-bold">
                  <v-icon icon="mdi-image-edit-outline" class="mr-2" />
                  Digitalisierung
                </v-card-title>
                <v-divider />
                <v-card-text>
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="form.digitized_by"
                        label="Digitalisiert von"
                        prepend-inner-icon="mdi-account-outline"
                        variant="outlined"
                        density="comfortable"
                        :rules="[rules.required]"
                        :disabled="saving"
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="form.digitized_at"
                        label="Digitalisiert am"
                        type="date"
                        prepend-inner-icon="mdi-calendar-check-outline"
                        variant="outlined"
                        density="comfortable"
                        :rules="[rules.required]"
                        :disabled="saving"
                      />
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>

              <!-- Bilder & Medien -->
              <v-card rounded="lg" class="mb-6">
                <v-card-title class="text-body-1 font-weight-bold">
                  <v-icon icon="mdi-image-multiple-outline" class="mr-2" />
                  Bilder & Medien
                </v-card-title>
                <v-divider />
                <v-card-text>
                  <PatternImagesEditor v-if="pattern" :pattern="pattern" />
                </v-card-text>
              </v-card>

            </v-col>

            <!-- Rechte Spalte: Labels + Vorschau -->
            <v-col cols="12" md="4">

              <!-- Labels -->
              <v-card rounded="lg" class="mb-6">
                <v-card-title class="text-body-1 font-weight-bold">
                  <v-icon icon="mdi-tag-multiple-outline" class="mr-2" />
                  Labels
                </v-card-title>
                <v-divider />
                <v-card-text>
                  <v-combobox
                    v-model="form.labels"
                    :items="store.allLabels"
                    label="Labels hinzufügen"
                    prepend-inner-icon="mdi-tag-outline"
                    variant="outlined"
                    density="comfortable"
                    multiple
                    chips
                    closable-chips
                    clearable
                    hint="Bestehende Labels auswählen oder neue eingeben"
                    persistent-hint
                    :disabled="saving"
                  />
                </v-card-text>
              </v-card>

              <!-- Symbolbild -->
              <v-card rounded="lg" class="mb-6">
                <v-card-title class="text-body-1 font-weight-bold">
                  <v-icon icon="mdi-image-outline" class="mr-2" />
                  Symbolbild
                </v-card-title>
                <v-divider />
                <v-card-text class="text-center">

                  <!-- Vorschau: neues Bild oder bestehendes -->
                  <v-img
                    :src="symbolPreviewUrl || store.getSymbolUrl(pattern)"
                    :alt="pattern.title"
                    height="180"
                    cover
                    rounded="lg"
                    class="bg-grey-lighten-3 mb-3"
                  >
                    <template #placeholder>
                      <div class="d-flex align-center justify-center fill-height">
                        <v-icon icon="mdi-image-off-outline" size="48" color="grey" />
                      </div>
                    </template>
                    <!-- Badge: neues Bild ausgewählt -->
                    <v-chip
                      v-if="symbolPreviewUrl"
                      color="success"
                      size="x-small"
                      variant="flat"
                      class="position-absolute ma-2"
                      style="top: 0; right: 0"
                      prepend-icon="mdi-check"
                    >
                      Neu
                    </v-chip>
                  </v-img>

                  <!-- Info zum verarbeiteten Bild -->
                  <div v-if="symbolPreviewUrl" class="text-caption text-medium-emphasis mb-3">
                    500 × 500 px · WebP · quadratisch zugeschnitten
                  </div>

                  <!-- Datei-Auswahl -->
                  <v-file-input
                    v-model="symbolFile"
                    label="Bild auswählen"
                    accept="image/*"
                    prepend-icon=""
                    prepend-inner-icon="mdi-image-plus-outline"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="mb-3"
                    :disabled="symbolUploading"
                    @update:model-value="onSymbolFileSelected"
                  />

                  <!-- Fehler bei Verarbeitung -->
                  <v-alert
                    v-if="symbolProcessError"
                    type="error"
                    variant="tonal"
                    density="compact"
                    class="mb-3 text-left"
                    closable
                    @click:close="symbolProcessError = ''"
                  >
                    {{ symbolProcessError }}
                  </v-alert>

                  <!-- Upload-Button -->
                  <v-btn
                    v-if="symbolBlob"
                    color="primary"
                    variant="tonal"
                    prepend-icon="mdi-cloud-upload-outline"
                    block
                    :loading="symbolUploading"
                    @click="uploadSymbol"
                  >
                    Symbolbild hochladen
                  </v-btn>

                  <!-- Erfolg -->
                  <v-alert
                    v-if="symbolUploadSuccess"
                    type="success"
                    variant="tonal"
                    density="compact"
                    class="mt-3 text-left"
                  >
                    Symbolbild erfolgreich gespeichert.
                  </v-alert>

                </v-card-text>
              </v-card>

              <!-- Änderungsübersicht -->
              <v-card v-if="isDirty" rounded="lg" class="mb-6" color="warning" variant="tonal">
                <v-card-text class="d-flex align-center ga-2">
                  <v-icon icon="mdi-pencil-circle-outline" color="warning" />
                  <span class="text-body-2">
                    Es gibt ungespeicherte Änderungen.
                  </span>
                </v-card-text>
              </v-card>

            </v-col>
          </v-row>

          <!-- Aktionsleiste -->
          <v-card rounded="lg">
            <v-card-text class="d-flex align-center justify-space-between flex-wrap ga-3">
              <div class="text-body-2 text-medium-emphasis">
                <v-icon icon="mdi-shield-account-outline" size="16" class="mr-1" />
                Bearbeitung als <strong>{{ auth.profile?.display_name ?? auth.user?.email }}</strong>
                ({{ roleLabel }})
              </div>
              <div class="d-flex ga-3">
                <v-btn
                  :to="`/patterns/${pattern.id}`"
                  variant="tonal"
                  color="secondary"
                  prepend-icon="mdi-close"
                  :disabled="saving"
                >
                  Abbrechen
                </v-btn>
                <v-btn
                  type="submit"
                  color="primary"
                  prepend-icon="mdi-content-save-outline"
                  :loading="saving"
                  :disabled="!isDirty"
                >
                  Speichern
                </v-btn>
              </div>
            </v-card-text>
          </v-card>

        </v-form>
      </v-container>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePatternStore } from '@/stores/patternStore'
import { useAuthStore } from '@/stores/authStore'
import { useImageProcessor } from '@/composables/useImageProcessor'
import PatternImagesEditor from '@/components/PatternImagesEditor.vue'

const route = useRoute()
const router = useRouter()
const store = usePatternStore()
const auth = useAuthStore()

// Daten laden falls noch nicht vorhanden
onMounted(() => {
  store.loadPatterns()
})

const pattern = computed(() => store.getPatternById(route.params.id as string))

// Formular-State (lokale Kopie des Musters)
const form = reactive({
  title: '',
  inventory: '',
  description: '',
  year: 0,
  designer: '',
  location: '',
  technique: '',
  labels: [] as string[],
  digitized_by: '',
  digitized_at: '',  // ISO-Datum-String (YYYY-MM-DD)
})

// Formular mit Muster-Daten befüllen sobald verfügbar
watch(
  pattern,
  (p) => {
    if (p) {
      form.title = p.title
      form.inventory = p.inventory
      form.description = p.description
      form.year = p.year
      form.designer = p.designer
      form.location = p.location
      form.technique = p.technique
      form.labels = [...p.labels]
      form.digitized_by = p.digitized_by
      // ISO-String auf YYYY-MM-DD kürzen für <input type="date">
      form.digitized_at = p.digitized_at ? p.digitized_at.slice(0, 10) : ''
    }
  },
  { immediate: true },
)

// Prüfen ob es ungespeicherte Änderungen gibt
const isDirty = computed(() => {
  if (!pattern.value) return false
  return (
    form.title !== pattern.value.title ||
    form.inventory !== pattern.value.inventory ||
    form.description !== pattern.value.description ||
    form.year !== pattern.value.year ||
    form.designer !== pattern.value.designer ||
    form.location !== pattern.value.location ||
    form.technique !== pattern.value.technique ||
    JSON.stringify([...form.labels].sort()) !== JSON.stringify([...pattern.value.labels].sort()) ||
    form.digitized_by !== pattern.value.digitized_by ||
    form.digitized_at !== pattern.value.digitized_at.slice(0, 10)
  )
})

// Rollen-Label für Anzeige
const roleLabel = computed(() => {
  const role = auth.profile?.role
  if (role === 'admin') return 'Administrator'
  if (role === 'editor') return 'Editor'
  return 'Benutzer'
})

// Validierungsregeln
const rules = {
  required: (v: unknown) => (v !== null && v !== undefined && v !== '') || 'Pflichtfeld',
  validYear: (v: number) =>
    (v >= 1800 && v <= new Date().getFullYear()) || `Jahr muss zwischen 1800 und ${new Date().getFullYear()} liegen`,
}

// Formular-Ref für Validierung
const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null)

// ── Symbolbild-Upload ──────────────────────────────────────────────────────
const { cropSquareAndConvert, createPreviewUrl } = useImageProcessor()

const symbolFile = ref<File | File[] | null>(null)
const symbolBlob = ref<Blob | null>(null)
const symbolPreviewUrl = ref<string>('')
const symbolUploading = ref(false)
const symbolProcessError = ref('')
const symbolUploadSuccess = ref(false)

// Vorschau-URL beim Verlassen der Seite freigeben
onUnmounted(() => {
  if (symbolPreviewUrl.value) URL.revokeObjectURL(symbolPreviewUrl.value)
})

async function onSymbolFileSelected(value: File | File[] | null) {
  // Alte Vorschau freigeben
  if (symbolPreviewUrl.value) {
    URL.revokeObjectURL(symbolPreviewUrl.value)
    symbolPreviewUrl.value = ''
  }
  symbolBlob.value = null
  symbolProcessError.value = ''
  symbolUploadSuccess.value = false

  const file = Array.isArray(value) ? value[0] : value
  if (!file) return

  try {
    // Bild verarbeiten: center-crop → 500×500 → WebP
    const blob = await cropSquareAndConvert(file, 500, 0.88)
    symbolBlob.value = blob
    symbolPreviewUrl.value = createPreviewUrl(blob)
  } catch (e) {
    symbolProcessError.value = e instanceof Error ? e.message : 'Bildverarbeitung fehlgeschlagen.'
  }
}

async function uploadSymbol() {
  if (!symbolBlob.value || !pattern.value) return
  symbolUploading.value = true
  symbolProcessError.value = ''
  symbolUploadSuccess.value = false
  try {
    await store.uploadSymbolImage(pattern.value.id, symbolBlob.value)
    symbolUploadSuccess.value = true
    // Dateiauswahl zurücksetzen, Vorschau bleibt sichtbar
    symbolFile.value = null
    symbolBlob.value = null
  } catch (e) {
    symbolProcessError.value = e instanceof Error ? e.message : 'Upload fehlgeschlagen.'
  } finally {
    symbolUploading.value = false
  }
}

// ── Metadaten speichern ────────────────────────────────────────────────────
const saving = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

async function handleSave() {
  if (!pattern.value) return

  const { valid } = await formRef.value!.validate()
  if (!valid) return

  saving.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    await store.updatePattern(pattern.value.id, {
      title: form.title,
      inventory: form.inventory,
      description: form.description,
      year: form.year,
      designer: form.designer,
      location: form.location,
      technique: form.technique,
      labels: form.labels,
      digitized_by: form.digitized_by,
      digitized_at: form.digitized_at,
    })
    successMsg.value = 'Änderungen wurden erfolgreich gespeichert.'
    // Nach kurzem Delay zurück zur Detailansicht
    setTimeout(() => {
      router.push({ name: 'pattern-detail', params: { id: pattern.value!.id } })
    }, 1200)
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : 'Speichern fehlgeschlagen. Bitte erneut versuchen.'
  } finally {
    saving.value = false
  }
}
</script>
