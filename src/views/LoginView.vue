<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="5" lg="4">

        <!-- Logo / Titel -->
        <div class="text-center mb-8">
          <v-icon icon="mdi-texture-box" color="primary" size="48" class="mb-3" />
          <h1 class="text-h5 font-weight-bold">Jacquard Archive</h1>
        </div>

        <v-card>
          <!-- Tabs -->
          <v-tabs v-model="tab" grow color="primary">
            <v-tab value="login">Anmelden</v-tab>
            <v-tab value="register">Registrieren</v-tab>
          </v-tabs>
          <v-divider />

          <v-card-text class="pa-6">

            <!-- Fehlermeldung -->
            <v-alert
              v-if="errorMsg"
              type="error"
              variant="tonal"
              class="mb-4"
              closable
              @click:close="errorMsg = ''"
            >
              {{ errorMsg }}
            </v-alert>

            <!-- Erfolgsmeldung (nach Registrierung) -->
            <v-alert
              v-if="successMsg"
              type="success"
              variant="tonal"
              class="mb-4"
              closable
              @click:close="successMsg = ''"
            >
              {{ successMsg }}
            </v-alert>

            <v-tabs-window v-model="tab">

              <!-- ── Anmelden ── -->
              <v-tabs-window-item value="login">
                <v-form @submit.prevent="handleLogin">
                  <v-text-field
                    v-model="email"
                    label="E-Mail"
                    type="email"
                    prepend-inner-icon="mdi-email-outline"
                    autocomplete="email"
                    class="mb-3"
                    :disabled="loading"
                  />
                  <v-text-field
                    v-model="password"
                    label="Passwort"
                    :type="showPassword ? 'text' : 'password'"
                    prepend-inner-icon="mdi-lock-outline"
                    :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                    autocomplete="current-password"
                    class="mb-4"
                    :disabled="loading"
                    @click:append-inner="showPassword = !showPassword"
                  />
                  <v-btn
                    type="submit"
                    color="primary"
                    block
                    size="large"
                    :loading="loading"
                    prepend-icon="mdi-login"
                  >
                    Anmelden
                  </v-btn>
                </v-form>
              </v-tabs-window-item>

              <!-- ── Registrieren ── -->
              <v-tabs-window-item value="register">
                <v-form ref="registerForm" @submit.prevent="handleRegister">
                  <v-text-field
                    v-model="regEmail"
                    label="E-Mail"
                    type="email"
                    prepend-inner-icon="mdi-email-outline"
                    autocomplete="email"
                    class="mb-3"
                    :disabled="loading"
                    :rules="[rules.required, rules.email]"
                  />
                  <v-text-field
                    v-model="regPassword"
                    label="Passwort"
                    :type="showRegPassword ? 'text' : 'password'"
                    prepend-inner-icon="mdi-lock-outline"
                    :append-inner-icon="showRegPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                    autocomplete="new-password"
                    class="mb-3"
                    :disabled="loading"
                    :rules="[rules.required, rules.minLength]"
                    @click:append-inner="showRegPassword = !showRegPassword"
                  />
                  <v-text-field
                    v-model="regPasswordConfirm"
                    label="Passwort wiederholen"
                    :type="showRegPassword ? 'text' : 'password'"
                    prepend-inner-icon="mdi-lock-check-outline"
                    autocomplete="new-password"
                    class="mb-4"
                    :disabled="loading"
                    :rules="[rules.required, rules.passwordMatch]"
                  />
                  <v-btn
                    type="submit"
                    color="primary"
                    block
                    size="large"
                    :loading="loading"
                    prepend-icon="mdi-account-plus-outline"
                  >
                    Konto erstellen
                  </v-btn>
                </v-form>
              </v-tabs-window-item>

            </v-tabs-window>
          </v-card-text>
        </v-card>

        <p class="text-center text-caption text-medium-emphasis mt-4">
          Nur autorisierte Benutzer erhalten Bearbeitungsrechte.
        </p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

// Tab
const tab = ref('login')

// Shared
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const showPassword = ref(false)
const showRegPassword = ref(false)

// Login fields
const email = ref('')
const password = ref('')

// Register fields
const regEmail = ref('')
const regPassword = ref('')
const regPasswordConfirm = ref('')
const registerForm = ref(null)

// Validierungsregeln
const rules = {
  required: (v) => !!v || 'Pflichtfeld',
  email: (v) => /.+@.+\..+/.test(v) || 'Ungültige E-Mail-Adresse',
  minLength: (v) => v?.length >= 8 || 'Mindestens 8 Zeichen',
  passwordMatch: (v) => v === regPassword.value || 'Passwörter stimmen nicht überein',
}

async function handleLogin() {
  if (!email.value || !password.value) return
  loading.value = true
  errorMsg.value = ''
  try {
    await auth.signIn(email.value, password.value)
    const redirect = route.query.redirect ?? '/'
    router.push(redirect)
  } catch (e) {
    errorMsg.value = e.message ?? 'Anmeldung fehlgeschlagen.'
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  const { valid } = await registerForm.value.validate()
  if (!valid) return

  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await auth.signUp(regEmail.value, regPassword.value)
    successMsg.value = 'Konto erstellt! Bitte bestätige deine E-Mail-Adresse, dann kannst du dich anmelden.'
    tab.value = 'login'
    email.value = regEmail.value
    regEmail.value = ''
    regPassword.value = ''
    regPasswordConfirm.value = ''
    registerForm.value.reset()
  } catch (e) {
    errorMsg.value = e.message ?? 'Registrierung fehlgeschlagen.'
  } finally {
    loading.value = false
  }
}
</script>
