import { ref, reactive, onUnmounted, computed } from 'vue'
import { AudioEngine } from '../audio/AudioEngine'
import { generateId, noteToFrequency, KEYBOARD_MAP } from '../utils/helpers'
import type { ModuleBase, Connection, SequencerTrack, Note, Preset } from '../types'

export function useSynth() {
  const audioEngine = AudioEngine.getInstance()
  const isInitialized = ref(false)

  const modules = reactive<Map<string, ModuleBase>>(new Map())
  const connections = reactive<Map<string, Connection>>(new Map())
  const tracks = reactive<SequencerTrack[]>([])
  const bpm = ref(120)
  const isPlaying = ref(false)
  const currentStep = ref(0)
  const activeNotes = reactive<Set<string>>(new Set())

  let sequencerInterval: number | null = null
  const mediaRecorder = ref<MediaRecorder | null>(null)
  const recordedChunks = ref<Blob[]>([])

  async function initAudio() {
    if (!isInitialized.value) {
      await audioEngine.init()
      isInitialized.value = true
    }
  }

  async function createModule(type: ModuleBase['type'], x: number, y: number): Promise<ModuleBase | null> {
    if (!isInitialized.value) {
      await initAudio()
    }
    
    const id = generateId()
    const module: ModuleBase = {
      id,
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${modules.size + 1}`,
      x,
      y,
      width: 180,
      height: getModuleHeight(type),
      inputs: getModulePorts(type).inputs,
      outputs: getModulePorts(type).outputs,
      params: getDefaultParams(type)
    }

    modules.set(id, module)
    audioEngine.createModule(type, id)

    return module
  }

  function getModuleHeight(type: ModuleBase['type']): number {
    const heights: Record<string, number> = {
      oscillator: 160,
      filter: 140,
      envelope: 180,
      gain: 100,
      reverb: 120,
      delay: 140,
      output: 100
    }
    return heights[type] || 120
  }

  function getModulePorts(type: ModuleBase['type']) {
    const ports: Record<string, { inputs: any[], outputs: any[] }> = {
      oscillator: {
        inputs: [
          { id: 'fm', name: 'FM', type: 'control' },
          { id: 'detune', name: 'Detune', type: 'control' }
        ],
        outputs: [{ id: 'out', name: 'Out', type: 'audio' }]
      },
      filter: {
        inputs: [
          { id: 'in', name: 'In', type: 'audio' },
          { id: 'fm', name: 'FM', type: 'control' }
        ],
        outputs: [{ id: 'out', name: 'Out', type: 'audio' }]
      },
      envelope: {
        inputs: [
          { id: 'in', name: 'In', type: 'audio' },
          { id: 'gate', name: 'Gate', type: 'gate' }
        ],
        outputs: [{ id: 'out', name: 'Out', type: 'audio' }]
      },
      gain: {
        inputs: [{ id: 'in', name: 'In', type: 'audio' }],
        outputs: [{ id: 'out', name: 'Out', type: 'audio' }]
      },
      reverb: {
        inputs: [{ id: 'in', name: 'In', type: 'audio' }],
        outputs: [{ id: 'out', name: 'Out', type: 'audio' }]
      },
      delay: {
        inputs: [{ id: 'in', name: 'In', type: 'audio' }],
        outputs: [{ id: 'out', name: 'Out', type: 'audio' }]
      },
      output: {
        inputs: [{ id: 'in', name: 'In', type: 'audio' }],
        outputs: []
      }
    }
    return ports[type] || { inputs: [], outputs: [] }
  }

  function getDefaultParams(type: ModuleBase['type']): Record<string, any> {
    const params: Record<string, Record<string, any>> = {
      oscillator: { waveform: 'sawtooth', frequency: 440, detune: 0, gain: 0.3 },
      filter: { type: 'lowpass', frequency: 2000, resonance: 1, gain: 0 },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.3 },
      gain: { gain: 0.5 },
      reverb: { wet: 0.3, decay: 2 },
      delay: { time: 0.3, feedback: 0.4, wet: 0.5 },
      output: { volume: 0.8 }
    }
    return { ...params[type] } || {}
  }

  function removeModule(id: string) {
    modules.delete(id)
    audioEngine.destroyModule(id)
    Array.from(connections.entries()).forEach(([connId, conn]) => {
      if (conn.from.moduleId === id || conn.to.moduleId === id) {
        connections.delete(connId)
      }
    })
  }

  function createConnection(
    fromModuleId: string,
    fromPortId: string,
    toModuleId: string,
    toPortId: string
  ): Connection | null {
    const exists = Array.from(connections.values()).some(
      c => c.from.moduleId === fromModuleId &&
           c.from.portId === fromPortId &&
           c.to.moduleId === toModuleId &&
           c.to.portId === toPortId
    )
    if (exists) return null

    const connection: Connection = {
      id: generateId(),
      from: { moduleId: fromModuleId, portId: fromPortId },
      to: { moduleId: toModuleId, portId: toPortId }
    }

    connections.set(connection.id, connection)
    audioEngine.connectModules(fromModuleId, fromPortId, toModuleId, toPortId)

    return connection
  }

  function removeConnection(id: string) {
    const conn = connections.get(id)
    if (conn) {
      audioEngine.disconnectModules(
        conn.from.moduleId, conn.from.portId,
        conn.to.moduleId, conn.to.portId
      )
      connections.delete(id)
    }
  }

  function updateModuleParam(moduleId: string, param: string, value: number | string) {
    const module = modules.get(moduleId)
    if (module) {
      module.params[param] = value
    }

    const audioModule = audioEngine.getModule(moduleId)
    if (audioModule) {
        if (audioModule.type === 'oscillator' && param === 'waveform') {
          (audioModule.node as OscillatorNode).type = value as OscillatorType
        } else if (audioModule.type === 'filter' && param === 'type') {
          (audioModule.node as BiquadFilterNode).type = value as BiquadFilterType
        } else if (audioModule.type === 'envelope') {
          if (param === 'release') {
            (audioModule as any).releaseTime = value
          } else {
            (audioModule as any)[param] = value
          }
        } else {
          const audioParam = audioModule.params[param]
          if (audioParam instanceof AudioParam) {
            audioParam.value = value as number
          }
        }
      }
  }

  function noteOn(note: string, velocity: number = 1) {
    if (activeNotes.has(note)) return
    activeNotes.add(note)
    const freq = noteToFrequency(note)

    modules.forEach((module, id) => {
      if (module.type === 'oscillator') {
        updateModuleParam(id, 'frequency', freq)
      }
      if (module.type === 'envelope') {
        const audioModule = audioEngine.getModule(id)
        if (audioModule && 'trigger' in audioModule) {
          (audioModule as any).trigger(velocity)
        }
      }
    })
  }

  function noteOff(note: string) {
    if (!activeNotes.has(note)) return
    activeNotes.delete(note)

    modules.forEach((module, id) => {
      if (module.type === 'envelope') {
        const audioModule = audioEngine.getModule(id)
        if (audioModule && 'releaseGate' in audioModule) {
          (audioModule as any).releaseGate()
        }
      }
    })
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.repeat) return
    const note = KEYBOARD_MAP[e.key.toLowerCase()]
    if (note) noteOn(note)
  }

  function handleKeyUp(e: KeyboardEvent) {
    const note = KEYBOARD_MAP[e.key.toLowerCase()]
    if (note) noteOff(note)
  }

  function addTrack() {
    const track: SequencerTrack = {
      id: generateId(),
      name: `Track ${tracks.length + 1}`,
      steps: new Array(16).fill(null),
      stepCount: 16
    }
    tracks.push(track)
  }

  function removeTrack(id: string) {
    const index = tracks.findIndex(t => t.id === id)
    if (index > -1) tracks.splice(index, 1)
  }

  function setStep(trackId: string, stepIndex: number, note: Note | null) {
    const track = tracks.find(t => t.id === trackId)
    if (track && stepIndex < track.steps.length) {
      track.steps[stepIndex] = note
    }
  }

  function togglePlay() {
    if (isPlaying.value) {
      stopSequencer()
    } else {
      startSequencer()
    }
  }

  function startSequencer() {
    isPlaying.value = true
    const stepDuration = (60 / bpm.value) * 1000 / 4

    sequencerInterval = window.setInterval(() => {
      tracks.forEach(track => {
        const note = track.steps[currentStep.value]
        if (note) {
          noteOnWithFreq(note.frequency, note.velocity)
        }
      })

      setTimeout(() => {
        tracks.forEach(track => {
          const note = track.steps[currentStep.value]
          if (note) {
            noteOffAll()
          }
        })
      }, stepDuration * 0.8)

      currentStep.value = (currentStep.value + 1) % 16
    }, stepDuration)
  }

  function noteOnWithFreq(freq: number, velocity: number = 1) {
    modules.forEach((module, id) => {
      if (module.type === 'envelope') {
        const audioModule = audioEngine.getModule(id)
        if (audioModule && 'trigger' in audioModule) {
          (audioModule as any).trigger(velocity)
        }
      }
    })
  }

  function noteOffAll() {
    modules.forEach((module, id) => {
      if (module.type === 'envelope') {
        const audioModule = audioEngine.getModule(id)
        if (audioModule && 'releaseGate' in audioModule) {
          (audioModule as any).releaseGate()
        }
      }
    })
  }

  function stopSequencer() {
    isPlaying.value = false
    currentStep.value = 0
    if (sequencerInterval) {
      clearInterval(sequencerInterval)
      sequencerInterval = null
    }
  }

  function startRecording() {
    const stream = audioEngine.getStream()
    if (stream) {
      mediaRecorder.value = new MediaRecorder(stream)
      recordedChunks.value = []

      mediaRecorder.value.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunks.value.push(e.data)
        }
      }

      mediaRecorder.value.start()
    }
  }

  function stopRecording(): Blob | null {
    if (mediaRecorder.value) {
      mediaRecorder.value.stop()
      return new Blob(recordedChunks.value, { type: 'audio/wav' })
    }
    return null
  }

  function savePreset(name: string): Preset {
    return {
      name,
      modules: Array.from(modules.values()),
      connections: Array.from(connections.values()),
      tracks: [...tracks],
      bpm: bpm.value
    }
  }

  function loadPreset(preset: Preset) {
    stopSequencer()
    modules.forEach((_, id) => audioEngine.destroyModule(id))
    modules.clear()
    connections.clear()
    tracks.length = 0

    preset.modules.forEach(m => {
      modules.set(m.id, m)
      audioEngine.createModule(m.type, m.id)
      Object.entries(m.params).forEach(([key, value]) => {
        updateModuleParam(m.id, key, value)
      })
    })

    preset.connections.forEach(c => {
      connections.set(c.id, c)
      audioEngine.connectModules(c.from.moduleId, c.from.portId, c.to.moduleId, c.to.portId)
    })

    tracks.push(...preset.tracks)
    bpm.value = preset.bpm
  }

  onUnmounted(() => {
    stopSequencer()
    if (isInitialized.value) {
      audioEngine.destroy()
    }
  })

  return {
    isInitialized,
    modules,
    connections,
    tracks,
    bpm,
    isPlaying,
    currentStep,
    activeNotes,
    isRecording: computed(() => mediaRecorder.value?.state === 'recording'),
    initAudio,
    createModule,
    removeModule,
    createConnection,
    removeConnection,
    updateModuleParam,
    noteOn,
    noteOff,
    handleKeyDown,
    handleKeyUp,
    addTrack,
    removeTrack,
    setStep,
    togglePlay,
    startRecording,
    stopRecording,
    savePreset,
    loadPreset,
    getAnalyser: () => audioEngine.getAnalyser()
  }
}
