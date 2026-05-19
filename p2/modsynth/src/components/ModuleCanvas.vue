<template>
  <div class="canvas-container" ref="containerRef">
    <svg class="canvas-svg" @wheel="handleZoom" @mousedown="handlePanStart">
      <g :transform="`translate(${panX}, ${panY}) scale(${zoom})`">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1a1a2e" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect width="10000" height="10000" fill="url(#grid)"/>

        <g class="connections">
          <path
            v-for="conn in connections.values()"
            :key="conn.id"
            :d="getConnectionPath(conn)"
            stroke="#6366f1"
            stroke-width="3"
            fill="none"
            @click="removeConnection(conn.id)"
            class="connection-path"
          />
        </g>

        <g
          v-for="module in modules.values()"
          :key="module.id"
          :transform="`translate(${module.x}, ${module.y})`"
          class="module"
          @mousedown.stop="(e) => handleModuleDrag(e, module)"
        >
          <rect
            :width="module.width"
            :height="module.height"
            :fill="MODULE_COLORS[module.type] || '#444'"
            rx="8"
            stroke="#fff"
            stroke-width="1"
            class="module-body"
          />
          <text
            :x="module.width / 2"
            y="22"
            text-anchor="middle"
            fill="#fff"
            font-size="12"
            font-weight="bold"
          >{{ module.name }}</text>

          <g class="ports">
            <g
              v-for="(port, i) in module.inputs"
              :key="port.id"
              class="port input-port"
              @mousedown.stop="(e) => startConnection(e, module.id, port.id, 'input')"
            >
              <circle
                cx="10"
                :cy="50 + i * 30"
                r="6"
                fill="#10b981"
                stroke="#fff"
                stroke-width="2"
              />
              <text
                x="22"
                :y="54 + i * 30"
                fill="#fff"
                font-size="10"
              >{{ port.name }}</text>
            </g>

            <g
              v-for="(port, i) in module.outputs"
              :key="port.id"
              class="port output-port"
              @mousedown.stop="(e) => startConnection(e, module.id, port.id, 'output')"
            >
              <circle
                :cx="module.width - 10"
                :cy="50 + i * 30"
                r="6"
                fill="#f59e0b"
                stroke="#fff"
                stroke-width="2"
              />
              <text
                :x="module.width - 22"
                :y="54 + i * 30"
                text-anchor="end"
                fill="#fff"
                font-size="10"
              >{{ port.name }}</text>
            </g>
          </g>

          <g class="params" transform="translate(15, 75)">
            <template v-if="module.type === 'oscillator'">
              <foreignObject width="150" height="100">
                <div class="params-container">
                  <select
                    :value="module.params.waveform"
                    @change="(e) => updateParam(module.id, 'waveform', (e.target as HTMLSelectElement).value)"
                    class="param-select"
                  >
                    <option value="sine">Sine</option>
                    <option value="sawtooth">Saw</option>
                    <option value="square">Square</option>
                    <option value="triangle">Triangle</option>
                  </select>
                  <div class="param-row">
                    <label>Freq</label>
                    <input
                      type="range"
                      min="20"
                      max="2000"
                      :value="module.params.frequency"
                      @input="(e) => updateParam(module.id, 'frequency', Number((e.target as HTMLInputElement).value))"
                      class="param-slider"
                    />
                  </div>
                  <div class="param-row">
                    <label>Gain</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      :value="module.params.gain"
                      @input="(e) => updateParam(module.id, 'gain', Number((e.target as HTMLInputElement).value))"
                      class="param-slider"
                    />
                  </div>
                </div>
              </foreignObject>
            </template>

            <template v-else-if="module.type === 'filter'">
              <foreignObject width="150" height="80">
                <div class="params-container">
                  <select
                    :value="module.params.type"
                    @change="(e) => updateParam(module.id, 'type', (e.target as HTMLSelectElement).value)"
                    class="param-select"
                  >
                    <option value="lowpass">Low Pass</option>
                    <option value="highpass">High Pass</option>
                    <option value="bandpass">Band Pass</option>
                  </select>
                  <div class="param-row">
                    <label>Freq</label>
                    <input
                      type="range"
                      min="20"
                      max="10000"
                      :value="module.params.frequency"
                      @input="(e) => updateParam(module.id, 'frequency', Number((e.target as HTMLInputElement).value))"
                      class="param-slider"
                    />
                  </div>
                  <div class="param-row">
                    <label>Res</label>
                    <input
                      type="range"
                      min="0.1"
                      max="20"
                      step="0.1"
                      :value="module.params.resonance"
                      @input="(e) => updateParam(module.id, 'resonance', Number((e.target as HTMLInputElement).value))"
                      class="param-slider"
                    />
                  </div>
                </div>
              </foreignObject>
            </template>

            <template v-else-if="module.type === 'envelope'">
              <foreignObject width="150" height="110">
                <div class="params-container">
                  <div class="param-row">
                    <label>Attack</label>
                    <input
                      type="range"
                      min="0.001"
                      max="1"
                      step="0.001"
                      :value="module.params.attack"
                      @input="(e) => updateParam(module.id, 'attack', Number((e.target as HTMLInputElement).value))"
                      class="param-slider"
                    />
                  </div>
                  <div class="param-row">
                    <label>Decay</label>
                    <input
                      type="range"
                      min="0.01"
                      max="2"
                      step="0.01"
                      :value="module.params.decay"
                      @input="(e) => updateParam(module.id, 'decay', Number((e.target as HTMLInputElement).value))"
                      class="param-slider"
                    />
                  </div>
                  <div class="param-row">
                    <label>Sustain</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      :value="module.params.sustain"
                      @input="(e) => updateParam(module.id, 'sustain', Number((e.target as HTMLInputElement).value))"
                      class="param-slider"
                    />
                  </div>
                  <div class="param-row">
                    <label>Release</label>
                    <input
                      type="range"
                      min="0.01"
                      max="3"
                      step="0.01"
                      :value="module.params.release"
                      @input="(e) => updateParam(module.id, 'release', Number((e.target as HTMLInputElement).value))"
                      class="param-slider"
                    />
                  </div>
                </div>
              </foreignObject>
            </template>

            <template v-else-if="module.type === 'gain'">
              <foreignObject width="150" height="30">
                <div class="params-container">
                  <div class="param-row">
                    <label>Gain</label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.01"
                      :value="module.params.gain"
                      @input="(e) => updateParam(module.id, 'gain', Number((e.target as HTMLInputElement).value))"
                      class="param-slider"
                    />
                  </div>
                </div>
              </foreignObject>
            </template>

            <template v-else-if="module.type === 'reverb'">
              <foreignObject width="150" height="50">
                <div class="params-container">
                  <div class="param-row">
                    <label>Wet</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      :value="module.params.wet"
                      @input="(e) => updateParam(module.id, 'wet', Number((e.target as HTMLInputElement).value))"
                      class="param-slider"
                    />
                  </div>
                </div>
              </foreignObject>
            </template>

            <template v-else-if="module.type === 'delay'">
              <foreignObject width="150" height="80">
                <div class="params-container">
                  <div class="param-row">
                    <label>Time</label>
                    <input
                      type="range"
                      min="0.01"
                      max="2"
                      step="0.01"
                      :value="module.params.time"
                      @input="(e) => updateParam(module.id, 'time', Number((e.target as HTMLInputElement).value))"
                      class="param-slider"
                    />
                  </div>
                  <div class="param-row">
                    <label>Feedback</label>
                    <input
                      type="range"
                      min="0"
                      max="0.9"
                      step="0.01"
                      :value="module.params.feedback"
                      @input="(e) => updateParam(module.id, 'feedback', Number((e.target as HTMLInputElement).value))"
                      class="param-slider"
                    />
                  </div>
                  <div class="param-row">
                    <label>Wet</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      :value="module.params.wet"
                      @input="(e) => updateParam(module.id, 'wet', Number((e.target as HTMLInputElement).value))"
                      class="param-slider"
                    />
                  </div>
                </div>
              </foreignObject>
            </template>

            <template v-else-if="module.type === 'output'">
              <foreignObject width="150" height="30">
                <div class="params-container">
                  <div class="param-row">
                    <label>Volume</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      :value="module.params.volume"
                      @input="(e) => updateParam(module.id, 'volume', Number((e.target as HTMLInputElement).value))"
                      class="param-slider"
                    />
                  </div>
                </div>
              </foreignObject>
            </template>
          </g>

          <g
            class="delete-btn"
            @click.stop="removeModule(module.id)"
          >
            <circle
              :cx="module.width - 15"
              cy="15"
              r="10"
              fill="#ef4444"
            />
            <text
              :x="module.width - 15"
              y="19"
              text-anchor="middle"
              fill="#fff"
              font-size="12"
            >×</text>
          </g>
        </g>

        <path
          v-if="tempConnection"
          :d="tempConnection.path"
          stroke="#6366f1"
          stroke-width="3"
          stroke-dasharray="5,5"
          fill="none"
        />
      </g>
    </svg>

    <div class="toolbar">
      <button
        v-for="type in moduleTypes"
        :key="type"
        class="module-btn"
        :style="{ background: MODULE_COLORS[type] }"
        @click="addModule(type)"
      >{{ type.charAt(0).toUpperCase() + type.slice(1) }}</button>
    </div>

    <div class="zoom-controls">
      <button @click="zoomIn">+</button>
      <span>{{ Math.round(zoom * 100) }}%</span>
      <button @click="zoomOut">-</button>
      <button @click="resetView">⌂</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { MODULE_COLORS } from '../utils/helpers'
import type { ModuleBase, Connection } from '../types'

interface Props {
  modules: Map<string, ModuleBase>
  connections: Map<string, Connection>
  onModuleCreate: (type: ModuleBase['type'], x: number, y: number) => Promise<void>
  onModuleRemove: (id: string) => void
  onModuleMove: (id: string, x: number, y: number) => void
  onConnectionCreate: (from: string, fromPort: string, to: string, toPort: string) => void
  onConnectionRemove: (id: string) => void
  onParamUpdate: (moduleId: string, param: string, value: number | string) => void
}

const props = defineProps<Props>()

const containerRef = ref<HTMLDivElement | null>(null)
const zoom = ref(1)
const panX = ref(0)
const panY = ref(0)
const isPanning = ref(false)
const lastMousePos = ref({ x: 0, y: 0 })
const draggingModule = ref<{ id: string; offsetX: number; offsetY: number } | null>(null)
const tempConnection = ref<{ path: string; startX: number; startY: number; type: string } | null>(null)
const connectionStart = ref<{ moduleId: string; portId: string; type: string } | null>(null)

const moduleTypes: ModuleBase['type'][] = ['oscillator', 'filter', 'envelope', 'gain', 'reverb', 'delay', 'output']

async function addModule(type: ModuleBase['type']) {
  const x = (500 - panX.value) / zoom.value
  const y = (300 - panY.value) / zoom.value
  await props.onModuleCreate(type, x, y)
}

function removeModule(id: string) {
  props.onModuleRemove(id)
}

function updateParam(moduleId: string, param: string, value: number | string) {
  props.onParamUpdate(moduleId, param, value)
}

function handleZoom(e: WheelEvent) {
  e.preventDefault()
  const delta = e.deltaY > 0 ? 0.9 : 1.1
  zoom.value = Math.max(0.2, Math.min(2, zoom.value * delta))
}

function zoomIn() {
  zoom.value = Math.min(2, zoom.value * 1.2)
}

function zoomOut() {
  zoom.value = Math.max(0.2, zoom.value / 1.2)
}

function resetView() {
  zoom.value = 1
  panX.value = 0
  panY.value = 0
}

function handlePanStart(e: MouseEvent) {
  if (e.button === 0 && !e.defaultPrevented) {
    isPanning.value = true
    lastMousePos.value = { x: e.clientX, y: e.clientY }
  }
}

function handleModuleDrag(e: MouseEvent, module: ModuleBase) {
  draggingModule.value = {
    id: module.id,
    offsetX: (e.clientX - panX.value) / zoom.value - module.x,
    offsetY: (e.clientY - panY.value) / zoom.value - module.y
  }
}

function startConnection(e: MouseEvent, moduleId: string, portId: string, type: string) {
  const module = props.modules.get(moduleId)
  if (!module) return

  const portIndex = type === 'input'
    ? module.inputs.findIndex(p => p.id === portId)
    : module.outputs.findIndex(p => p.id === portId)

  const x = module.x + (type === 'input' ? 10 : module.width - 10)
  const y = module.y + 50 + portIndex * 30

  connectionStart.value = { moduleId, portId, type }
  tempConnection.value = {
    path: `M ${x} ${y} L ${x} ${y}`,
    startX: x,
    startY: y,
    type
  }
}

function getConnectionPath(conn: Connection): string {
  const fromModule = props.modules.get(conn.from.moduleId)
  const toModule = props.modules.get(conn.to.moduleId)
  if (!fromModule || !toModule) return ''

  const fromPortIndex = fromModule.outputs.findIndex(p => p.id === conn.from.portId)
  const toPortIndex = toModule.inputs.findIndex(p => p.id === conn.to.portId)

  const x1 = fromModule.x + fromModule.width - 10
  const y1 = fromModule.y + 50 + fromPortIndex * 30
  const x2 = toModule.x + 10
  const y2 = toModule.y + 50 + toPortIndex * 30

  const midX = (x1 + x2) / 2
  return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`
}

function removeConnection(id: string) {
  props.onConnectionRemove(id)
}

function handleMouseMove(e: MouseEvent) {
  if (isPanning.value) {
    panX.value += e.clientX - lastMousePos.value.x
    panY.value += e.clientY - lastMousePos.value.y
    lastMousePos.value = { x: e.clientX, y: e.clientY }
  }

  if (draggingModule.value) {
    const x = (e.clientX - panX.value) / zoom.value - draggingModule.value.offsetX
    const y = (e.clientY - panY.value) / zoom.value - draggingModule.value.offsetY
    props.onModuleMove(draggingModule.value.id, x, y)
  }

  if (tempConnection.value) {
    const x = (e.clientX - panX.value) / zoom.value
    const y = (e.clientY - panY.value) / zoom.value
    const { startX, startY } = tempConnection.value
    const midX = (startX + x) / 2
    tempConnection.value.path = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${y}, ${x} ${y}`
  }
}

function handleMouseUp(e: MouseEvent) {
  isPanning.value = false
  draggingModule.value = null

  if (tempConnection.value && connectionStart.value) {
    const x = (e.clientX - panX.value) / zoom.value
    const y = (e.clientY - panY.value) / zoom.value

    for (const module of props.modules.values()) {
      const ports = connectionStart.value.type === 'output' ? module.inputs : module.outputs

      for (let i = 0; i < ports.length; i++) {
        const portX = module.x + (connectionStart.value.type === 'output' ? 10 : module.width - 10)
        const portY = module.y + 50 + i * 30
        const dist = Math.sqrt((x - portX) ** 2 + (y - portY) ** 2)

        if (dist < 20 && module.id !== connectionStart.value.moduleId) {
          if (connectionStart.value.type === 'output') {
            props.onConnectionCreate(
              connectionStart.value.moduleId,
              connectionStart.value.portId,
              module.id,
              ports[i].id
            )
          } else {
            props.onConnectionCreate(
              module.id,
              ports[i].id,
              connectionStart.value.moduleId,
              connectionStart.value.portId
            )
          }
          break
        }
      }
    }

    tempConnection.value = null
    connectionStart.value = null
  }
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
})
</script>

<style scoped>
.canvas-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #0a0a0f;
}

.canvas-svg {
  width: 100%;
  height: 100%;
}

.module {
  cursor: move;
  user-select: none;
}

.module:hover .module-body {
  filter: brightness(1.1);
}

.connection-path {
  cursor: pointer;
}

.connection-path:hover {
  stroke: #818cf8;
  stroke-width: 4;
}

.delete-btn {
  cursor: pointer;
  opacity: 0.8;
}

.delete-btn:hover {
  opacity: 1;
}

.toolbar {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  max-width: 400px;
}

.module-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.1s;
}

.module-btn:hover {
  transform: scale(1.05);
}

.zoom-controls {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.6);
  padding: 8px;
  border-radius: 8px;
}

.zoom-controls button {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 4px;
  background: #333;
  color: white;
  cursor: pointer;
  font-size: 16px;
}

.zoom-controls span {
  color: white;
  font-size: 12px;
  min-width: 40px;
  text-align: center;
}

.params-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.param-select {
  width: 100%;
  padding: 4px;
  border: none;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 10px;
}

.param-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.param-row label {
  color: white;
  font-size: 10px;
  min-width: 40px;
}

.param-slider {
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.param-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
}
</style>
