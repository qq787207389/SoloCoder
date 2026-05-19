<template>
  <div class="visualizer-container">
    <div class="visualizer-header">
      <span>Visualizer</span>
      <div class="mode-selector">
        <button
          v-for="mode in modes"
          :key="mode"
          :class="{ active: currentMode === mode }"
          @click="currentMode = mode"
        >{{ mode }}</button>
      </div>
    </div>
    <canvas ref="canvasRef" class="visualizer-canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

interface Props {
  analyser: AnalyserNode | null
}

const props = defineProps<Props>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const currentMode = ref<'spectrum' | 'waveform' | 'particles'>('spectrum')
const modes = ['spectrum', 'waveform', 'particles'] as const

let animationId: number | null = null
let particles: Particle[] = []

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
}

const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#a8dadc', '#6366f1']

function initParticles(width: number, height: number) {
  particles = []
  for (let i = 0; i < 100; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0,
      life: Math.random() * 100,
      maxLife: 100 + Math.random() * 100,
      size: 2 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)]
    })
  }
}

function drawSpectrum(ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) {
  const barWidth = width / dataArray.length
  let x = 0

  for (let i = 0; i < dataArray.length; i++) {
    const barHeight = (dataArray[i] / 255) * height
    const hue = (i / dataArray.length) * 360
    ctx.fillStyle = `hsl(${hue}, 80%, 60%)`
    ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight)
    x += barWidth
  }
}

function drawWaveform(ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) {
  ctx.lineWidth = 2
  ctx.strokeStyle = '#4ecdc4'
  ctx.beginPath()

  const sliceWidth = width / dataArray.length
  let x = 0

  for (let i = 0; i < dataArray.length; i++) {
    const v = dataArray[i] / 128.0
    const y = (v * height) / 2

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
    x += sliceWidth
  }

  ctx.lineTo(width, height / 2)
  ctx.stroke()

  ctx.strokeStyle = '#ff6b6b80'
  ctx.beginPath()
  x = 0
  for (let i = 0; i < dataArray.length; i++) {
    const v = dataArray[i] / 128.0
    const y = height - (v * height) / 2

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
    x += sliceWidth
  }
  ctx.lineTo(width, height / 2)
  ctx.stroke()
}

function drawParticles(ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) {
  const avgValue = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
  const intensity = avgValue / 255

  ctx.globalCompositeOperation = 'screen'

  particles.forEach((particle, index) => {
    const dataIndex = Math.floor((index / particles.length) * dataArray.length)
    const value = dataArray[dataIndex] / 255

    particle.vx += (Math.random() - 0.5) * intensity * 2
    particle.vy += (Math.random() - 0.5) * intensity * 2
    particle.vx *= 0.98
    particle.vy *= 0.98

    particle.x += particle.vx + value * 2
    particle.y += particle.vy + value * 2

    particle.life--
    if (particle.life <= 0 || particle.x < 0 || particle.x > width || particle.y < 0 || particle.y > height) {
      particle.x = width / 2 + (Math.random() - 0.5) * 100
      particle.y = height / 2 + (Math.random() - 0.5) * 100
      particle.life = particle.maxLife
      particle.vx = 0
      particle.vy = 0
    }

    const alpha = particle.life / particle.maxLife
    const size = particle.size + value * 5

    ctx.beginPath()
    ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2)
    ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0')
    ctx.fill()
  })

  ctx.globalCompositeOperation = 'source-over'
}

function animate() {
  const canvas = canvasRef.value
  if (!canvas || !props.analyser) {
    animationId = requestAnimationFrame(animate)
    return
  }

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const bufferLength = props.analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)

  if (currentMode.value === 'waveform') {
    props.analyser.getByteTimeDomainData(dataArray)
  } else {
    props.analyser.getByteFrequencyData(dataArray)
  }

  ctx.fillStyle = '#0a0a0f'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  switch (currentMode.value) {
    case 'spectrum':
      drawSpectrum(ctx, dataArray, canvas.width, canvas.height)
      break
    case 'waveform':
      drawWaveform(ctx, dataArray, canvas.width, canvas.height)
      break
    case 'particles':
      drawParticles(ctx, dataArray, canvas.width, canvas.height)
      break
  }

  animationId = requestAnimationFrame(animate)
}

function resize() {
  const canvas = canvasRef.value
  if (canvas) {
    const rect = canvas.parentElement?.getBoundingClientRect()
    if (rect) {
      canvas.width = rect.width
      canvas.height = rect.height - 40
      initParticles(canvas.width, canvas.height)
    }
  }
}

onMounted(() => {
  resize()
  window.addEventListener('resize', resize)
  animate()
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<style scoped>
.visualizer-container {
  width: 100%;
  height: 100%;
  background: #0a0a0f;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.visualizer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.3);
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.mode-selector {
  display: flex;
  gap: 4px;
}

.mode-selector button {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: #999;
  font-size: 10px;
  cursor: pointer;
  text-transform: capitalize;
}

.mode-selector button.active {
  background: #6366f1;
  color: white;
}

.visualizer-canvas {
  flex: 1;
  width: 100%;
}
</style>
