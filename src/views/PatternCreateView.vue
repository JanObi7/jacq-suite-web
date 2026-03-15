<template>
  <v-container fluid class="pa-0">
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
          <v-chip color="white" variant="tonal" prepend-icon="mdi-plus" size="small">
            Neues Muster
          </v-chip>
        </div>
        <h1 class="text-h4 font-weight-bold mb-1">Neues Muster anlegen</h1>
        <div class="text-body-2 opacity-80">
          Alle Pflichtfelder müssen ausgefüllt sein, bevor gespeichert werden kann.
        </div>
      </v-container>
    </v-sheet>

    <v-container class="py-6">
      <!-- Fehlermeldung -->
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
                      label="Titel *"
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
                      label="Inventarnummer *"
                      prepend-inner-icon="mdi-identifier"
                      variant="outlined"
                      density="comfortable"
                      :rules="[rules.required]"
                      :disabled="saving"
                      hint="z.B. D1234 oder TH001"
                      persistent-hint
                    />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                        v-model="form.origin"
                        label="Quelle *"
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
                      label="Digitalisiert von *"
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
                      label="Digitalisiert am *"
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

          </v-col>

          <!-- Rechte Spalte: Labels + Hinweis -->
          <v-col cols="12" md="4">

            <!-- Hinweis Bilder -->
            <v-card rounded="lg" class="mb-6" color="info" variant="tonal">
              <v-card-text>
                <div class="d-flex align-start ga-3">
                  <v-icon icon="mdi-information-outline" color="info" class="mt-1 flex-shrink-0" />
                  <div class="text-body-2">
                    <strong>Bilder</strong> können nach dem Anlegen des Musters in der
                    Detailansicht hinzugefügt werden.
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <!-- Pflichtfelder-Hinweis -->
            <v-card rounded="lg" class="mb-6" variant="tonal">
              <v-card-text class="text-caption text-medium-emphasis">
                <v-icon icon="mdi-asterisk" size="12" color="error" class="mr-1" />
                Pflichtfelder müssen ausgefüllt sein.
              </v-card-text>
            </v-card>

          </v-col>
        </v-row>

        <!-- Aktionsleiste -->
        <v-card rounded="lg">
          <v-card-text class="d-flex align-center justify-space-between flex-wrap ga-3">
            <div class="text-body-2 text-medium-emphasis">
              <v-icon icon="mdi-shield-account-outline" size="16" class="mr-1" />
              Anlegen als <strong>{{ auth.profile?.display_name ?? auth.user?.email }}</strong>
              (Administrator)
            </div>
            <div class="d-flex ga-3">
              <v-btn
                to="/patterns"
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
              >
                Muster anlegen
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

      </v-form>
    </v-container>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePatternStore } from '@/stores/patternStore'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const store = usePatternStore()
const auth = useAuthStore()

// Bestehende Labels für Combobox laden
onMounted(() => {
  store.loadPatterns()
})

// Formular-State
const form = reactive({
  title: '',
  inventory: '',
  description: '',
  origin: '',
  digitized_by: auth.profile?.display_name ?? auth.user?.email ?? '',
  digitized_at: new Date().toISOString().slice(0, 10), // Heute als Standardwert
})

// Validierungsregeln
const rules = {
  required: (v: unknown) => (v !== null && v !== undefined && v !== '') || 'Pflichtfeld',
}

// Formular-Ref für Validierung
const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null)

// Status
const saving = ref(false)
const errorMsg = ref('')

async function handleSave() {
  const { valid } = await formRef.value!.validate()
  if (!valid) return

  saving.value = true
  errorMsg.value = ''

  try {
    const newPattern = await store.createPattern({
      title: form.title,
      inventory: form.inventory,
      description: form.description,
      origin: form.origin,
      digitized_by: form.digitized_by,
      digitized_at: form.digitized_at,
    })
    // Nach dem Anlegen direkt zur Detailansicht des neuen Musters
    router.push({ name: 'pattern-detail', params: { id: newPattern.id } })
  } catch (e) {
    errorMsg.value =
      e instanceof Error ? e.message : 'Anlegen fehlgeschlagen. Bitte erneut versuchen.'
  } finally {
    saving.value = false
  }
}
</script>
