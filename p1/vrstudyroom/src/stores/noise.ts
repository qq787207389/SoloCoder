import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { WhiteNoise, NoiseId } from '@/types'

const STORAGE_KEY = 'tongzhuo-noise'

const defaultNoises: WhiteNoise[] = [
  { id: 'rain', name: '雨声', icon: 'cloud-rain', active: false, volume: 0.5 },
  { id: 'library', name: '图书馆', icon: 'book-open', active: false, volume: 0.5 },
  { id: 'fire', name: '篝火', icon: 'flame', active: false, volume: 0.5 },
  { id: 'cafe', name: '咖啡馆', icon: 'coffee', active: false, volume: 0.5 }
]

function loadNoises(): WhiteNoise[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const storedNoises = JSON.parse(stored) as WhiteNoise[]
      return defaultNoises.map(dn => {
        const sn = storedNoises.find(n => n.id === dn.id)
        return sn ? { ...dn, active: false, volume: sn.volume } : dn
      })
    }
  } catch (e) {
    console.error('Failed to load noise settings:', e)
  }
  return defaultNoises
}

function saveNoises(noises: WhiteNoise[]) {
  try {
    const toSave = noises.map(n => ({ id: n.id, volume: n.volume }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  } catch (e) {
    console.error('Failed to save noise settings:', e)
  }
}

export const useNoiseStore = defineStore('noise', () => {
  const noises = ref<WhiteNoise[]>(loadNoises())
  const audioElements = ref<Map<NoiseId, HTMLAudioElement>>(new Map())
  const globalVolume = ref(0.5)

  function toggleNoise(id: NoiseId) {
    const noise = noises.value.find(n => n.id === id)
    if (!noise) return

    noise.active = !noise.active
    
    if (noise.active) {
      playNoise(id)
    } else {
      stopNoise(id)
    }
  }

  function setVolume(id: NoiseId, volume: number) {
    const noise = noises.value.find(n => n.id === id)
    if (!noise) return

    noise.volume = volume
    const audio = audioElements.value.get(id)
    if (audio) {
      audio.volume = volume * globalVolume.value
    }
    saveNoises(noises.value)
  }

  function setGlobalVolume(volume: number) {
    globalVolume.value = volume
    audioElements.value.forEach((audio, id) => {
      const noise = noises.value.find(n => n.id === id)
      if (noise && noise.active) {
        audio.volume = noise.volume * volume
      }
    })
  }

  function getNoiseSrc(id: NoiseId): string {
    const noiseUrls: Record<NoiseId, string> = {
      rain: 'https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3',
      library: 'https://assets.mixkit.co/active_storage/sfx/547/547-preview.mp3',
      fire: 'https://assets.mixkit.co/active_storage/sfx/804/804-preview.mp3',
      cafe: 'https://assets.mixkit.co/active_storage/sfx/151/151-preview.mp3'
    }
    return noiseUrls[id]
  }

  function playNoise(id: NoiseId) {
    let audio = audioElements.value.get(id)
    const noise = noises.value.find(n => n.id === id)
    
    if (!audio && noise) {
      audio = new Audio()
      audio.loop = true
      audio.volume = noise.volume * globalVolume.value
      audioElements.value.set(id, audio)
    }

    if (audio) {
      audio.src = getNoiseSrc(id)
      audio.play().catch(e => {
        console.error('Failed to play noise:', e)
        if (noise) noise.active = false
      })
    }
  }

  function stopNoise(id: NoiseId) {
    const audio = audioElements.value.get(id)
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
  }

  function stopAllNoises() {
    noises.value.forEach(noise => {
      noise.active = false
      stopNoise(noise.id)
    })
  }

  function pauseAllNoises() {
    audioElements.value.forEach(audio => {
      audio.pause()
    })
  }

  function resumeAllNoises() {
    noises.value.forEach(noise => {
      if (noise.active) {
        const audio = audioElements.value.get(noise.id)
        if (audio) {
          audio.play().catch(e => console.error('Failed to resume noise:', e))
        }
      }
    })
  }

  return {
    noises,
    globalVolume,
    toggleNoise,
    setVolume,
    setGlobalVolume,
    stopAllNoises,
    pauseAllNoises,
    resumeAllNoises
  }
})
