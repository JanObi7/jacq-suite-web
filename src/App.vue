<template>
  <v-app :theme="theme">
    <!-- Navigation Bar -->
    <v-app-bar elevation="2" color="primary">
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-app-bar-title>
        <router-link to="/" class="text-decoration-none text-white d-flex align-center ga-2">
          <v-icon icon="mdi-loom" size="28" />
          <span class="font-weight-bold">JacqSuite</span>
        </router-link>
      </v-app-bar-title>

      <v-spacer />

      <v-btn to="/" variant="text" color="white" prepend-icon="mdi-home">
        Startseite
      </v-btn>
      <v-btn to="/patterns" variant="text" color="white" prepend-icon="mdi-view-grid">
        Alle Muster
      </v-btn>

      <v-btn
        :icon="theme === 'dark' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
        variant="text"
        color="white"
        @click="toggleTheme"
      />
    </v-app-bar>

    <!-- Navigation Drawer (Mobile) -->
    <v-navigation-drawer v-model="drawer" temporary>
      <v-list-item
        prepend-icon="mdi-loom"
        title="JacqSuite"
        subtitle="Digitale Webmuster"
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
import { ref } from 'vue'

const drawer = ref(false)
const theme = ref<'light' | 'dark'>('dark')

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}
</script>
