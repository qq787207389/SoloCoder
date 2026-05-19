<template>
  <div class="sequencer-container">
    <div class="sequencer-header">
      <span>Sequencer</span>
      <div class="controls">
        <button class="play-btn" :class="{ playing: isPlaying }" @click="$emit('togglePlay')">
          {{ isPlaying ? '⏸' : '▶' }}
        </button>
        <div class="bpm-control">
          <label>BPM:</label>
          <input type="number" v-model.number="localBpm" min="40" max="300" @change="$emit('updateBpm', localBpm)" />
        </div>
        <button class="add-track-btn" @click="$emit('addTrack')">+ Track</button>
      </div>
    </div>

    <div class="tracks-container">
      <div v-for="track in tracks" :key="track.id" class="track">
        <div class="track-header">
          <span class="track-name">{{ track.name }}</span>
          <button class="delete-track-btn" @click="$emit('removeTrack', track.id)">×</button>
        </div>
        <div class="steps">
          <div
            v-for="(step, i) in track.steps"
            :key="i"
            class="step"
            :class="{
              active: !!step,
              current: i === currentStep && isPlaying,
              beat: i % 4 === 0
            }"
            @click="toggleStep(track.id, i)"
          >
            <div v-if="step" class="step-indicator" :style="{ height: `${step.velocity * 100}%` }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { SequencerTrack, Note } from '../types'

interface Props {
  tracks: SequencerTrack[]
  bpm: number
  isPlaying: boolean
  currentStep: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  togglePlay: []
  updateBpm: [bpm: number]
  addTrack: []
  removeTrack: [id: string]
  setStep: [trackId: string, stepIndex: number, note: Note | null]
}>()

const localBpm = ref(props.bpm)

watch(() => props.bpm, (newBpm) => {
  localBpm.value = newBpm
})

const notes = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4']
let noteIndex = 0

function toggleStep(trackId: string, stepIndex: number) {
  const track = props.tracks.find(t => t.id === trackId)
  if (!track) return

  if (track.steps[stepIndex]) {
    emit('setStep', trackId, stepIndex, null)
  } else {
    const noteName = notes[noteIndex % notes.length]
    noteIndex++
    
    const freq = 440 * Math.pow(2, (noteToSemitone(noteName) - 69) / 12)
    emit('setStep', trackId, stepIndex, {
      frequency: freq,
      duration: 0.5,
      velocity: 0.7 + Math.random() * 0.3
    })
  }
}

function noteToSemitone(note: string): number {
  const noteMap: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
  const match = note.match(/([A-G])(\d)/)
  if (!match) return 60
  return noteMap[match[1]] + (parseInt(match[2]) + 1) * 12
}
</script>

<style scoped>
.sequencer-container {
  background: #0a0a0f;
  border-radius: 8px;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sequencer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.3);
  color: white;
  font-weight: 600;
}

.controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.play-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: #6366f1;
  color: white;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.play-btn.playing {
  background: #ef4444;
}

.bpm-control {
  display: flex;
  align-items: center;
  gap: 6px;
}

.bpm-control label {
  font-size: 12px;
  color: #999;
}

.bpm-control input {
  width: 50px;
  padding: 4px 6px;
  border: none;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 12px;
  text-align: center;
}

.add-track-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  background: #10b981;
  color: white;
  font-size: 12px;
  cursor: pointer;
}

.tracks-container {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.track {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  gap: 12px;
}

.track-header {
  width: 100px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.track-name {
  color: white;
  font-size: 12px;
  font-weight: 500;
}

.delete-track-btn {
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.3);
  color: #ef4444;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-track-btn:hover {
  background: #ef4444;
  color: white;
}

.steps {
  flex: 1;
  display: flex;
  gap: 4px;
}

.step {
  flex: 1;
  height: 40px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.1s;
  position: relative;
  overflow: hidden;
}

.step.beat {
  background: rgba(255, 255, 255, 0.1);
}

.step:hover {
  background: rgba(255, 255, 255, 0.15);
}

.step.active {
  background: rgba(99, 102, 241, 0.4);
}

.step.current {
  box-shadow: 0 0 0 2px #6366f1;
}

.step-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #6366f1;
  border-radius: 0 0 4px 4px;
}
</style>
