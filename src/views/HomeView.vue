<template>
  <v-container fluid class="pa-0">
    <!-- Hero Section -->
    <div class="hero-section py-5 px-4 text-center text-white">
      <v-container>
        <div class="d-flex align-center justify-center ga-3 mb-2">
          <h1 class="text-h5 font-weight-bold">JacqSuite - Datenbank</h1>
        </div>
        <p class="text-body-2 mb-3 mx-auto hero-subtitle" style="max-width: 560px">
          Eine Sammlung historischer Webmuster – digitalisiert und für die Nachwelt bewahrt.
        </p>
        <v-btn
          to="/patterns"
          color="white"
          variant="elevated"
          size="small"
          prepend-icon="mdi-view-grid"
          class="text-primary"
        >
          Alle Muster entdecken
        </v-btn>
      </v-container>
    </div>

    <!-- Stats Bar -->
    <v-sheet color="secondary" class="py-2">
      <v-container>
        <v-row justify="center" class="text-white text-center">
          <v-col cols="4" sm="3" class="py-1">
            <div class="text-body-1 font-weight-bold">{{ store.patterns.length }}</div>
            <div class="text-caption opacity-80">Muster</div>
          </v-col>
          <v-col cols="4" sm="3" class="py-1">
            <div class="text-body-1 font-weight-bold">{{ store.allOrigins.length }}</div>
            <div class="text-caption opacity-80">Quellen</div>
          </v-col>
          <v-col cols="4" sm="3" class="py-1">
            <div class="text-body-1 font-weight-bold">{{ store.allEditors.length }}</div>
            <div class="text-caption opacity-80">Bearbeiter</div>
          </v-col>
        </v-row>
      </v-container>
    </v-sheet>

    <!-- Latest Patterns Section -->
    <v-container class="py-8">
      <div class="d-flex align-center justify-space-between mb-6">
        <div>
          <h2 class="text-h5 font-weight-bold">Zuletzt digitalisiert</h2>
          <p class="text-body-2 text-medium-emphasis mt-1">
            Die 5 neuesten Ergänzungen der Sammlung
          </p>
        </div>
        <v-btn to="/patterns" variant="tonal" color="primary" prepend-icon="mdi-arrow-right">
          Alle anzeigen
        </v-btn>
      </div>

      <v-row>
        <v-col
          v-for="pattern in store.latestPatterns"
          :key="pattern.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
          xl="2"
        >
          <PatternCard :pattern="pattern" />
        </v-col>
      </v-row>
    </v-container>

    <!-- Info Section -->
    <v-sheet color="secondary">
      <v-container>
        <v-row>
          <v-col cols="12" md="4">
            <div class="d-flex flex-column align-center text-center pa-2">
              <v-icon icon="mdi-magnify-scan" size="32" color="white" class="mb-3" />
              <h4 class="text-h6 font-weight-bold mb-2">Hochauflösende Bilder</h4>
              <p class="text-body-2 text-medium-emphasis">
                Interaktive Detailansicht für Bilder mit über 15.000 × 10.000 Pixeln – zoomen und
                erkunden Sie jedes Detail.
              </p>
            </div>
          </v-col>
          <v-col cols="12" md="4">
            <div class="d-flex flex-column align-center text-center pa-2">
              <v-icon icon="mdi-filter-variant" size="32" color="white" class="mb-3" />
              <h4 class="text-h6 font-weight-bold mb-2">Umfangreiche Filter</h4>
              <p class="text-body-2 text-medium-emphasis">
                Durchsuchen Sie die Sammlung und finden Sie genau das
                Muster, das Sie suchen.
              </p>
            </div>
          </v-col>
          <v-col cols="12" md="4">
            <div class="d-flex flex-column align-center text-center pa-2">
              <v-icon icon="mdi-information-outline" size="32" color="white" class="mb-3" />
              <h4 class="text-h6 font-weight-bold mb-2">Vollständige Metadaten</h4>
              <p class="text-body-2 text-medium-emphasis">
                Jedes Muster enthält umfangreiche Metainformationen: Quelle, Bearbeiter,
                Digitalisierungsdatum und mehr.
              </p>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-sheet>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { usePatternStore } from '@/stores/patternStore'
import PatternCard from '@/components/PatternCard.vue'

const store = usePatternStore()

// Daten beim Mounten laden
onMounted(() => {
  store.loadPatterns()
})
</script>

<style scoped>
.hero-section {
  position: relative;
  background-image: url('@/assets/banner.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.hero-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(var(--v-theme-primary), 0.82) 0%,
    rgba(var(--v-theme-secondary), 0.75) 100%
  );
}

.hero-section > * {
  position: relative;
  z-index: 1;
}

.hero-subtitle {
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}
</style>
