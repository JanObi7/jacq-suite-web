<template>
  <v-app :theme="theme">
    <!-- Navigation Bar -->
    <v-app-bar elevation="2" color="primary">
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-app-bar-title>
        <router-link to="/" class="text-decoration-none text-white d-flex align-center ga-2">
          <span class="font-weight-bold">JacqSuite</span>
        </router-link>
      </v-app-bar-title>

      <v-spacer />

      <!-- Desktop: Buttons mit Text -->
      <v-btn 
        to="/" 
        variant="text" 
        color="white" 
        prepend-icon="mdi-home"
        class="d-none d-md-flex"
      >
        Startseite
      </v-btn>
      <v-btn 
        to="/patterns" 
        variant="text" 
        color="white" 
        prepend-icon="mdi-view-grid"
        class="d-none d-md-flex"
      >
        Alle Muster
      </v-btn>

      <!-- Mobile: Nur Icons -->
      <v-btn 
        to="/" 
        icon="mdi-home"
        variant="text" 
        color="white"
        class="d-md-none"
      />
      <v-btn 
        to="/patterns" 
        icon="mdi-view-grid"
        variant="text" 
        color="white"
        class="d-md-none"
      />

      <v-btn
        :icon="theme === 'dark' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
        variant="text"
        color="white"
        @click="toggleTheme"
      />
      <!-- Auth -->
      <template v-if="auth.user">
        <v-menu>
          <template #activator="{ props }">
            <v-btn v-bind="props" variant="text" class="ml-2" color="white">
              <v-avatar size="32" color="white">
                <span class="text-caption font-weight-bold">{{ initials }}</span>
              </v-avatar>
            </v-btn>
          </template>
          <v-list min-width="180" density="compact">
            <v-list-item
              prepend-icon="mdi-account"
              :title="auth.profile?.display_name ?? auth.user.email"
            />
            <v-divider />
            <v-list-item
              prepend-icon="mdi-shield-account"
              :title="roleLabel"
              density="compact"
            />
            <v-divider />
            <v-list-item
              prepend-icon="mdi-logout"
              title="Abmelden"
              @click="auth.signOut()"
            />
          </v-list>
        </v-menu>
      </template>
      <template v-else>
        <v-btn to="/login" prepend-icon="mdi-login" variant="tonal" color="white" class="ml-2">
          Anmelden
        </v-btn>
      </template>
    </v-app-bar>

    <!-- Navigation Drawer (Mobile) -->
    <v-navigation-drawer v-model="drawer" temporary>
      <v-list-item
        prepend-icon="mdi-loom"
        title="JacqSuite"
        subtitle="Digitale Jacquard-Muster"
        nav
      />
      <v-divider />
      <v-list density="compact" nav>
        <v-list-item
          prepend-icon="mdi-home"
          title="Startseite"
          to="/"
          @click="drawer = false"
        />
        <v-list-item
          prepend-icon="mdi-view-grid"
          title="Alle Muster"
          to="/patterns"
          @click="drawer = false"
        />
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <router-view />
    </v-main>

    <!-- Footer -->
    <v-footer color="primary" class="text-center d-flex flex-column">
      <div class="text-caption text-white opacity-70 py-1">
        © {{ new Date().getFullYear() }} JacqSuite – Digitale Jacquard-Muster Datenbank
      </div>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
auth.init()

const drawer = ref(false)
const theme = ref<'light' | 'dark'>('light')

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

const initials = computed(() => {
  const name = auth.profile?.display_name ?? auth.user?.email ?? ''
  return name.slice(0, 2).toUpperCase()
})

const roleLabel = computed(() => {
  return auth.profile?.role == 'admin' ? 'Administrator' : 'Benutzer'
})

</script>
