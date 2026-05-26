import { MapData, Tile, TerrainType, ResourceType, ResourceNode } from '../types/game'

class SimplexNoise {
  private perm: number[] = []

  constructor(seed: number) {
    const p: number[] = []
    for (let i = 0; i < 256; i++) p[i] = i
    for (let i = 255; i > 0; i--) {
      seed = (seed * 16807) % 2147483647
      const j = seed % (i + 1)
      ;[p[i], p[j]] = [p[j], p[i]]
    }
    for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255]
  }

  noise2D(x: number, y: number): number {
    const X = Math.floor(x) & 255
    const Y = Math.floor(y) & 255
    x -= Math.floor(x)
    y -= Math.floor(y)
    const u = this.fade(x)
    const v = this.fade(y)
    const A = this.perm[X] + Y
    const B = this.perm[X + 1] + Y
    return this.lerp(
      v,
      this.lerp(u, this.grad(this.perm[A], x, y), this.grad(this.perm[B], x - 1, y)),
      this.lerp(u, this.grad(this.perm[A + 1], x, y - 1), this.grad(this.perm[B + 1], x - 1, y - 1))
    )
  }

  private fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }

  private lerp(t: number, a: number, b: number) {
    return a + t * (b - a)
  }

  private grad(hash: number, x: number, y: number) {
    const h = hash & 3
    const u = h < 2 ? x : y
    const v = h < 2 ? y : x
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
  }
}

export function generateMap(width: number, height: number, seed: number): MapData {
  const noise = new SimplexNoise(seed)
  const tiles: Tile[][] = []

  for (let y = 0; y < height; y++) {
    tiles[y] = []
    for (let x = 0; x < width; x++) {
      const depthNoise = noise.noise2D(x * 0.02, y * 0.02) * 0.5 + noise.noise2D(x * 0.05, y * 0.05) * 0.3 + noise.noise2D(x * 0.1, y * 0.1) * 0.2
      const depth = Math.floor(50 + Math.abs(depthNoise) * 450 + y * 3)

      const terrainNoise = noise.noise2D(x * 0.03 + 100, y * 0.03 + 100)
      let terrain: TerrainType = 'sand'

      if (terrainNoise > 0.6 && depth > 200) terrain = 'vent'
      else if (terrainNoise > 0.4 && depth > 300) terrain = 'trench'
      else if (terrainNoise > 0.3) terrain = 'mountain'
      else if (terrainNoise < -0.5 && depth > 250) terrain = 'whalefall'
      else if (terrainNoise < -0.3 && depth > 150) terrain = 'wreck'
      else if (terrainNoise < -0.2) terrain = 'cave'
      else if (terrainNoise > 0.1) terrain = 'rock'

      const resources: ResourceNode[] = generateResources(x, y, terrain, depth, noise, seed)
      const discovered = y < 15 && Math.abs(x - width / 2) < 15

      tiles[y][x] = { x, y, terrain, depth, discovered, resources }
    }
  }

  return { width, height, tiles, seed }
}

function generateResources(x: number, y: number, terrain: TerrainType, depth: number, noise: SimplexNoise, seed: number): ResourceNode[] {
  const resources: ResourceNode[] = []
  const resourceNoise = noise.noise2D(x * 0.1 + seed * 0.001, y * 0.1 + seed * 0.001)

  if (resourceNoise > 0.3) {
    let type: ResourceType = 'ore'
    let amount = Math.floor(Math.random() * 50) + 20

    switch (terrain) {
      case 'vent':
        type = depth > 300 ? 'crystal' : 'rare_ore'
        amount = Math.floor(Math.random() * 80) + 40
        break
      case 'wreck':
        type = Math.random() > 0.5 ? 'fuel' : 'electronics' as ResourceType
        amount = Math.floor(Math.random() * 60) + 30
        break
      case 'whalefall':
        type = 'biomass'
        amount = Math.floor(Math.random() * 100) + 50
        break
      case 'cave':
        type = depth > 250 ? 'rare_ore' : 'ore'
        amount = Math.floor(Math.random() * 70) + 30
        break
      case 'mountain':
        type = 'ore'
        amount = Math.floor(Math.random() * 40) + 15
        break
      default:
        if (depth < 150) {
          type = Math.random() > 0.5 ? 'organic' : 'ore'
        }
    }

    resources.push({
      id: `res_${x}_${y}_0`,
      type,
      amount,
      position: { x, y },
      discovered: false
    })
  }

  return resources
}

export function getTerrainColor(terrain: TerrainType, depth: number): string {
  const darkness = Math.min(depth / 500, 0.6)
  const baseColors: Record<TerrainType, string> = {
    sand: '#8b7355',
    rock: '#5a5a6a',
    mountain: '#4a4a5a',
    vent: '#ff6b35',
    cave: '#2a2a4a',
    wreck: '#6a5a4a',
    trench: '#1a1a3a',
    whalefall: '#5a4a3a'
  }
  const base = baseColors[terrain]
  return darkenColor(base, darkness)
}

function darkenColor(color: string, amount: number): string {
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)
  const factor = 1 - amount
  return `rgb(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)})`
}

export function getResourceColor(type: ResourceType): string {
  const colors: Record<ResourceType, string> = {
    ore: '#c0a080',
    organic: '#40c060',
    rare_ore: '#80a0ff',
    crystal: '#c080ff',
    fuel: '#ffc040',
    biomass: '#80ff80'
  }
  return colors[type] || '#ffffff'
}
