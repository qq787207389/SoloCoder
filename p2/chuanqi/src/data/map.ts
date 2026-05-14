import { MapCell } from '../types'

export const MAP_WIDTH = 20
export const MAP_HEIGHT = 20
export const CELL_SIZE = 32

export function generateMap(): MapCell[][] {
  const map: MapCell[][] = []
  
  for (let y = 0; y < MAP_HEIGHT; y++) {
    map[y] = []
    for (let x = 0; x < MAP_WIDTH; x++) {
      let walkable = true
      let terrain = 'grass'
      
      if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
        walkable = false
        terrain = 'stone'
      }
      
      if ((x === 5 && y >= 3 && y <= 8) || (x === 12 && y >= 10 && y <= 16)) {
        walkable = false
        terrain = 'wall'
      }
      
      if ((x >= 8 && x <= 11 && y === 6) || (x >= 15 && x <= 18 && y === 14)) {
        walkable = false
        terrain = 'water'
      }
      
      map[y][x] = { x, y, walkable, terrain }
    }
  }
  
  return map
}

export const terrainColors: Record<string, string> = {
  grass: '#4a7c39',
  stone: '#6b6b6b',
  wall: '#4a4a4a',
  water: '#3498db'
}
