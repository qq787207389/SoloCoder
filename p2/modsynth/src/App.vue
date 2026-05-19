<template>
  <div class="app">
    <div class="header">
      <h1>🎛️ ModSynth</h1>
      <div class="header-controls">
        <button v-if="!synth.isInitialized" class="init-btn" @click="synth.initAudio()">
          Click to Start Audio
        </button>
        <template v-else>
          <button class="record-btn" :class="{ recording: synth.isRecording }" @click="toggleRecording">
            {{ synth.isRecording ? '⏹ Stop' : '⏺ Record' }}
          </button>
          <button class="preset-btn" @click="savePreset">💾 Save</button>
          <button class="preset-btn" @click="loadPreset">📂 Load</button>
        </template>
      </div>
    </div>

    <div class="main-content">
      <div class="left-panel">
        <ModuleCanvas
          :modules="synth.modules"
          :connections="synth.connections"
          :onModuleCreate="synth.createModule"
          :onModuleRemove="synth.removeModule"
          :onModuleMove="handleModuleMove"
          :onConnectionCreate="synth.createConnection"
          :onConnectionRemove="synth.removeConnection"
          :onParamUpdate="synth.updateModuleParam"
        />
      </div>

      <div class="right-panel">
        <div class="panel-section visualizer-section">
          <Visualizer :analyser="synth.getAnalyser()" />
        </div>
        <div class="panel-section sequencer-section">
          <Sequencer
            :tracks="synth.tracks"
            :bpm="synth.bpm"
            :isPlaying="synth.isPlaying"
            :currentStep="synth.currentStep"
            @togglePlay="synth.togglePlay"
            @updateBpm="synth.bpm = $event"
            @addTrack="synth.addTrack"
            @removeTrack="synth.removeTrack"
            @setStep="synth.setStep"
          />
        </div>
      </div>
    </div>

    <div class="keyboard-hint" v-if="synth.isInitialized">
      <span>🎹 Keyboard: A W S E D F T G Y H U J K O L (C3 to C4)</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useSynth } from './composables/useSynth'
import ModuleCanvas from './components/ModuleCanvas.vue'
import Visualizer from './components/Visualizer.vue'
import Sequencer from './components/Sequencer.vue'
import { downloadJSON, loadJSON } from './utils/helpers'
import type { Preset } from './types'

const synth = useSynth()
const mediaChunks: Blob[] = []

function handleModuleMove(id: string, x: number, y: number) {
  const module = synth.modules.get(id)
  if (module) {
    module.x = x
    module.y = y
  }
}

function toggleRecording() {
  if (synth.isRecording) {
    const blob = synth.stopRecording()
    if (blob) {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `modsynth-recording-${Date.now()}.wav`
      a.click()
      URL.revokeObjectURL(url)
    }
  } else {
    synth.startRecording()
  }
}

function savePreset() {
  const preset: Preset = synth.savePreset('My Preset')
  downloadJSON(preset, `modsynth-preset-${Date.now()}.json`)
}

async function loadPreset() {
  const preset = await loadJSON<Preset>()
  if (preset) {
    synth.loadPreset(preset)
  }
}

function handleKeyDown(e: KeyboardEvent) {
  synth.handleKeyDown(e)
}

function handleKeyUp(e: KeyboardEvent) {
  synth.handleKeyUp(e)
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: #0a0a0f;
  color: #e0e0e0;
  overflow: hidden;
}

.app {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-bottom: 1px solid rgba(99, 102, 241, 0.3);
}

.header h1 {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-controls {
  display: flex;
  gap: 8px;
}

.init-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.init-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.record-btn, .preset-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.record-btn:hover, .preset-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.record-btn.recording {
  background: #ef4444;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.left-panel {
  flex: 1;
  position: relative;
}

.right-panel {
  width: 400px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
}

.panel-section {
  border-radius: 8px;
  overflow: hidden;
}

.visualizer-section {
  height: 200px;
}

.sequencer-section {
  flex: 1;
  min-height: 0;
}

.keyboard-hint {
  padding: 8px 20px;
  background: rgba(99, 102, 241, 0.2);
  text-align: center;
  font-size: 12px;
  color: #a5b4fc;
  border-top: 1px solid rgba(99, 102, 241, 0.3);
}
</style>
