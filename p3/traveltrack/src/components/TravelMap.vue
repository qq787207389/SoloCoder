<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import maplibregl from 'maplibre-gl'
import type { TravelDiary, Location } from '../types'
import { useTravelStore } from '../stores/travel'

interface Props {
  enableClick?: boolean
  showWishlist?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  enableClick: true,
  showWishlist: true
})

const emit = defineEmits<{
  (e: 'mapClick', location: Location): void
  (e: 'diaryClick', diary: TravelDiary): void
}>()

const mapContainer = ref<HTMLDivElement | null>(null)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const map = ref<any>(null)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const markers = ref<any[]>([])
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const wishlistMarkers = ref<any[]>([])
const store = useTravelStore()

const initMap = () => {
  if (!mapContainer.value) return

  map.value = new maplibregl.Map({
    container: mapContainer.value,
    style: 'https://demotiles.maplibre.org/style.json',
    center: [104.1954, 35.8617],
    zoom: 3
  })

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  map.value.addControl(new maplibregl.NavigationControl(), 'top-right')

  map.value.on('load', () => {
    addMarkers()
    if (props.showWishlist) {
      addWishlistMarkers()
    }
  })

  if (props.enableClick) {
    map.value.on('click', handleMapClick)
  }
}

const handleMapClick = (e: maplibregl.MapMouseEvent) => {
  const { lng, lat } = e.lngLat
  emit('mapClick', {
    id: '',
    name: '',
    country: '',
    city: '',
    lat,
    lng
  })
}

const createMarkerElement = (isWishlist: boolean): HTMLDivElement => {
  const el = document.createElement('div')
  el.style.width = '32px'
  el.style.height = '40px'
  el.style.backgroundSize = 'contain'
  el.style.backgroundRepeat = 'no-repeat'
  el.style.cursor = 'pointer'
  
  if (isWishlist) {
    el.innerHTML = `
      <svg viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24C32 7.163 24.837 0 16 0z" fill="#9CA3AF" stroke="#6B7280" stroke-width="2" stroke-dasharray="4 2"/>
        <circle cx="16" cy="16" r="6" fill="#F3F4F6" stroke="#6B7280" stroke-width="2" stroke-dasharray="4 2"/>
      </svg>
    `
  } else {
    el.innerHTML = `
      <svg viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24C32 7.163 24.837 0 16 0z" fill="#EF4444" stroke="#DC2626" stroke-width="2"/>
        <circle cx="16" cy="16" r="6" fill="#FEE2E2" stroke="#DC2626" stroke-width="2"/>
      </svg>
    `
  }
  
  return el
}

const addMarkers = () => {
  if (!map.value) return

  markers.value.forEach(m => m.remove())
  markers.value = []

  store.diaries.forEach(diary => {
    const el = createMarkerElement(false)
    const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
      <div style="min-width: 200px; padding: 8px;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${diary.location.name}</h3>
        <p style="margin: 0 0 4px 0; font-size: 14px; color: #666;">${diary.location.city}, ${diary.location.country}</p>
        <p style="margin: 0 0 8px 0; font-size: 12px; color: #999;">${diary.date}</p>
        <p style="margin: 0; font-size: 14px;">${diary.description.substring(0, 100)}${diary.description.length > 100 ? '...' : ''}</p>
      </div>
    `)

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([diary.location.lng, diary.location.lat])
      .setPopup(popup)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      .addTo(map.value)

    el.addEventListener('click', () => {
      emit('diaryClick', diary)
    })

    markers.value.push(marker)
  })
}

const addWishlistMarkers = () => {
  if (!map.value) return

  wishlistMarkers.value.forEach(m => m.remove())
  wishlistMarkers.value = []

  store.activeWishlist.forEach(item => {
    const el = createMarkerElement(true)
    const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
      <div style="min-width: 200px; padding: 8px;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">📍 ${item.location.name}</h3>
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">${item.location.city}, ${item.location.country}</p>
        <p style="margin: 0; font-size: 12px; color: #999;">心愿目的地</p>
      </div>
    `)

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([item.location.lng, item.location.lat])
      .setPopup(popup)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      .addTo(map.value)

    wishlistMarkers.value.push(marker)
  })
}

const flyTo = (lng: number, lat: number, zoom: number = 12) => {
  if (!map.value) return
  map.value.flyTo({ center: [lng, lat], zoom, essential: true })
}

watch(() => store.diaries.length, () => {
  addMarkers()
})

watch(() => store.activeWishlist.length, () => {
  if (props.showWishlist) {
    addWishlistMarkers()
  }
})

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  if (map.value) {
    map.value.remove()
  }
})

defineExpose({ flyTo })
</script>

<template>
  <div class="travel-map">
    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<style scoped>
.travel-map {
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.map-container {
  width: 100%;
  height: 100%;
}
</style>
