<template>
  <v-dialog v-model="dialog" fullscreen transition="dialog-bottom-transition">
    <template #activator="{ props: activatorProps }">
      <div v-bind="activatorProps" class="image-viewer-trigger cursor-pointer">
        <slot />
        <div class="image-overlay d-flex align-center justify-center">
          <v-icon
            :icon="image.isHighResolution ? 'mdi-magnify-scan' : 'mdi-fullscreen'"
            color="white"
            size="32"
          />
          <span class="text-white text-caption ml-1">
            {{ image.isHighResolution ? 'Interaktive Ansicht' : 'Vollbild' }}
          </span>
        </div>
      </div>
    </template>

    <v-card>
      <!-- Toolbar -->
      <v-toolbar color="primary" density="compact">
        <v-toolbar-title class="text-body-1">
          {{ image.label }}
          <span v-if="image.isHighResolution" class="text-caption opacity-70 ml-2">
            ({{ image.width?.toLocaleString('de-DE') }} × {{ image.height?.toLocaleString('de-DE') }} px)
          </span>
        </v-toolbar-title>
        <v-spacer />
        <v-btn icon="mdi-close" @click="dialog = false" />
      </v-toolbar>

      <!-- OpenSeadragon Viewer für hochauflösende Bilder -->
      <div v-if="image.isHighResolution" ref="osdContainer" class="osd-container" />

      <!-- Normaler Bild-Viewer -->
      <div v-else class="normal-viewer d-flex align-center justify-center bg-black">
        <v-img
          :src="image.url"
          :alt="image.label"
          max-height="calc(100vh - 48px)"
          contain
        />
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onUnmounted } from 'vue'
import type { PatternImage } from '@/types/pattern'
import OpenSeadragon from 'openseadragon'

const props = defineProps<{
  image: PatternImage
}>()

const dialog = ref(false)
const osdContainer = ref<HTMLElement | null>(null)
let viewer: OpenSeadragon.Viewer | null = null

watch(dialog, async (open) => {
  if (open && props.image.isHighResolution) {
    await nextTick()
    if (osdContainer.value && !viewer) {
      viewer = OpenSeadragon({
        element: osdContainer.value,
        prefixUrl: "/jacq-suite-web/openseadragon/images/",
        tileSources: props.image.url.endsWith(".dzi") ? props.image.url : {type: 'image', url: props.image.url },
        showNavigationControl: true,
        showNavigator: true,
        navigatorPosition: 'BOTTOM_RIGHT',
        animationTime: 0.5,
        blendTime: 0.1,
        constrainDuringPan: true,
        maxZoomPixelRatio: 4,
        minZoomImageRatio: 0.8,
        visibilityRatio: 1,
        defaultZoomLevel: 0,
        gestureSettingsMouse: {
          scrollToZoom: true,
          clickToZoom: false,
          dblClickToZoom: true,
          pinchToZoom: true,
        },
      })
    }
  } else if (!open && viewer) {
    viewer.destroy()
    viewer = null
  }
})

onUnmounted(() => {
  if (viewer) {
    viewer.destroy()
    viewer = null
  }
})
</script>

<style scoped>
.image-viewer-trigger {
  position: relative;
  overflow: hidden;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0);
  transition: background 0.2s ease;
  opacity: 0;
}

.image-viewer-trigger:hover .image-overlay {
  background: rgba(0, 0, 0, 0.45);
  opacity: 1;
}

.osd-container {
  width: 100%;
  height: calc(100vh - 48px);
  background: #111;
}

.normal-viewer {
  width: 100%;
  height: calc(100vh - 48px);
}
</style>
