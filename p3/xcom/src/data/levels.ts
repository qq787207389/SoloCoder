import type { LevelData, Tile, TileType } from '@/types'
import { generateId } from '@/utils/math'
import { TILE_PROPERTIES } from '@/config/constants'

const createTile = (x: number, y: number, type: TileType, height: number = 0): Tile => {
  const props = TILE_PROPERTIES[type]
  return {
    id: generateId(),
    type,
    position: { x, y },
    height,
    destructible: props.destructible,
    hp: props.hp,
    maxHp: props.hp,
  }
}

const generateCityRuinsLevel = (): LevelData => {
  const width = 16
  const height = 12
  const tiles: Tile[] = []

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let type: TileType = 'ground'
      let heightLevel = 0

      if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
        type = 'wall'
      } else if (x >= 3 && x <= 5 && y >= 2 && y <= 4) {
        if (x === 3 || x === 5 || y === 2 || y === 4) {
          type = 'wall'
        } else {
          type = 'ground'
        }
      } else if (x >= 10 && x <= 12 && y >= 2 && y <= 4) {
        if (x === 10 || x === 12 || y === 2 || y === 4) {
          type = 'wall'
        } else {
          type = 'ground'
        }
      } else if (x >= 3 && x <= 5 && y >= 7 && y <= 9) {
        if (x === 3 || x === 5 || y === 7 || y === 9) {
          type = 'wall'
        } else {
          type = 'ground'
        }
      } else if (x >= 10 && x <= 12 && y >= 7 && y <= 9) {
        if (x === 10 || x === 12 || y === 7 || y === 9) {
          type = 'wall'
        } else {
          type = 'ground'
        }
      } else if (x === 7 && y >= 0 && y <= 3) {
        type = 'high_ground'
        heightLevel = 1
      } else if (x === 8 && y >= 8 && y <= 11) {
        type = 'high_ground'
        heightLevel = 1
      } else if (x === 7 && y === 5) {
        type = 'half_cover'
      } else if (x === 8 && y === 6) {
        type = 'half_cover'
      } else if (x === 6 && y === 5) {
        type = 'full_cover'
      } else if (x === 9 && y === 6) {
        type = 'full_cover'
      } else if (x === 4 && y === 6) {
        type = 'rubble'
      } else if (x === 11 && y === 5) {
        type = 'rubble'
      } else if (x === 5 && y === 1) {
        type = 'door'
      } else if (x === 3 && y === 3) {
        type = 'window'
      } else if (x === 5 && y === 3) {
        type = 'window'
      } else if (x === 10 && y === 3) {
        type = 'window'
      } else if (x === 12 && y === 3) {
        type = 'window'
      } else if ((x === 4 && y === 2) || (x === 11 && y === 9)) {
        type = 'door'
      }

      tiles.push(createTile(x, y, type, heightLevel))
    }
  }

  return {
    id: 'city_ruins_01',
    name: '城市废墟 - 第一区',
    description: '在被摧毁的城市街区中与敌军交火。利用建筑残骸作为掩体，肃清所有敌人。',
    width,
    height,
    tiles,
    playerStartPositions: [
      { x: 2, y: 10 },
      { x: 3, y: 10 },
      { x: 2, y: 9 },
      { x: 3, y: 9 },
    ],
    enemySpawns: [
      { x: 13, y: 1 },
      { x: 12, y: 2 },
      { x: 10, y: 1 },
      { x: 11, y: 8 },
      { x: 12, y: 7 },
    ],
    enemyTypes: ['assault', 'sniper', 'assault', 'medic', 'engineer'],
    objective: '消灭所有敌军',
  }
}

const generateParkLevel = (): LevelData => {
  const width = 18
  const height = 14
  const tiles: Tile[] = []

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let type: TileType = 'ground'
      let heightLevel = 0

      if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
        type = 'wall'
      } else if (x >= 7 && x <= 10 && y >= 5 && y <= 8) {
        type = 'water'
      } else if ((x === 6 && y >= 4 && y <= 9) || (x === 11 && y >= 4 && y <= 9)) {
        type = 'half_cover'
      } else if ((y === 4 && x >= 6 && x <= 11) || (y === 9 && x >= 6 && x <= 11)) {
        type = 'half_cover'
      } else if (x === 3 && y >= 3 && y <= 5) {
        type = 'high_ground'
        heightLevel = 1
      } else if (x === 14 && y >= 8 && y <= 10) {
        type = 'high_ground'
        heightLevel = 1
      } else if ((x === 5 && y === 2) || (x === 12 && y === 11)) {
        type = 'full_cover'
      } else if ((x === 2 && y === 7) || (x === 15 && y === 6)) {
        type = 'full_cover'
      } else if ((x === 8 && y === 2) || (x === 9 && y === 11)) {
        type = 'rubble'
      } else if ((x === 4 && y === 10) || (x === 13 && y === 3)) {
        type = 'rubble'
      }

      tiles.push(createTile(x, y, type, heightLevel))
    }
  }

  return {
    id: 'park_01',
    name: '城市公园',
    description: '公园中央的喷泉区域成为了交火的焦点。注意水面无法通行，利用周围的掩体进行战术移动。',
    width,
    height,
    tiles,
    playerStartPositions: [
      { x: 2, y: 12 },
      { x: 3, y: 12 },
      { x: 2, y: 11 },
      { x: 4, y: 12 },
    ],
    enemySpawns: [
      { x: 15, y: 1 },
      { x: 16, y: 2 },
      { x: 14, y: 2 },
      { x: 16, y: 11 },
      { x: 15, y: 12 },
      { x: 8, y: 3 },
    ],
    enemyTypes: ['sniper', 'assault', 'assault', 'medic', 'engineer', 'sniper'],
    objective: '消灭所有敌军，控制公园区域',
  }
}

const generateUnderpassLevel = (): LevelData => {
  const width = 14
  const height = 16
  const tiles: Tile[] = []

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let type: TileType = 'ground'
      let heightLevel = 0

      if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
        type = 'wall'
      } else if (x >= 2 && x <= 11) {
        if (y === 5 || y === 10) {
          type = 'wall'
        } else if ((y === 5 && x >= 5 && x <= 8) || (y === 10 && x >= 5 && x <= 8)) {
          type = 'door'
        }
      } else if (x === 1 || x === 12) {
        if (y >= 6 && y <= 9) {
          type = 'half_cover'
        }
      } else if (x >= 4 && x <= 9) {
        if (y === 3 || y === 12) {
          type = 'full_cover'
        }
      } else if (x === 6 && y === 7) {
        type = 'high_ground'
        heightLevel = 1
      } else if (x === 7 && y === 8) {
        type = 'high_ground'
        heightLevel = 1
      } else if ((x === 3 && y === 7) || (x === 10 && y === 8)) {
        type = 'rubble'
      } else if ((x === 5 && y === 13) || (x === 8 && y === 2)) {
        type = 'rubble'
      }

      tiles.push(createTile(x, y, type, heightLevel))
    }
  }

  return {
    id: 'underpass_01',
    name: '地下通道',
    description: '狭窄的地下通道中，敌人占据了有利位置。利用通道的结构进行侧翼包抄，注意拐角处的埋伏。',
    width,
    height,
    tiles,
    playerStartPositions: [
      { x: 3, y: 14 },
      { x: 4, y: 14 },
      { x: 5, y: 14 },
      { x: 6, y: 14 },
    ],
    enemySpawns: [
      { x: 3, y: 1 },
      { x: 5, y: 2 },
      { x: 8, y: 1 },
      { x: 10, y: 2 },
      { x: 6, y: 7 },
      { x: 7, y: 8 },
    ],
    enemyTypes: ['assault', 'sniper', 'assault', 'engineer', 'medic', 'assault'],
    objective: '清除地下通道中的所有敌人',
  }
}

export const LEVELS: LevelData[] = [
  generateCityRuinsLevel(),
  generateParkLevel(),
  generateUnderpassLevel(),
]

export const getLevelById = (id: string): LevelData | undefined => {
  return LEVELS.find((l) => l.id === id)
}
