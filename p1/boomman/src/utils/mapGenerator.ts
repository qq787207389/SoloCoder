import { TileType } from '../types/game'

export function generateMap(width: number, height: number, boxDensity: number): TileType[][] {
  const map: TileType[][] = []

  for (let y = 0; y < height; y++) {
    map[y] = []
    for (let x = 0; x < width; x++) {
      map[y][x] = TileType.EMPTY
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
        map[y][x] = TileType.WALL
      }
      else if (x % 2 === 0 && y % 2 === 0) {
        map[y][x] = TileType.WALL
      }
    }
  }

  const spawnPositions = getSpawnPositions(width, height)

  spawnPositions.forEach((pos) => {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = pos.x + dx
        const ny = pos.y + dy
        if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1) {
          if (map[ny][nx] !== TileType.WALL) {
            map[ny][nx] = TileType.EMPTY
          }
        }
      }
    }
  })

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (map[y][x] === TileType.EMPTY && Math.random() < boxDensity) {
        const isNearSpawn = spawnPositions.some(
          (pos) => Math.abs(pos.x - x) <= 1 && Math.abs(pos.y - y) <= 1
        )
        if (!isNearSpawn) {
          map[y][x] = TileType.BOX
        }
      }
    }
  }

  const specialTileCount = Math.floor((width * height) * 0.03)
  for (let i = 0; i < specialTileCount; i++) {
    const x = Math.floor(Math.random() * (width - 2)) + 1
    const y = Math.floor(Math.random() * (height - 2)) + 1
    if (map[y][x] === TileType.EMPTY) {
      const conveyorTypes = [
        TileType.CONVEYOR_UP,
        TileType.CONVEYOR_DOWN,
        TileType.CONVEYOR_LEFT,
        TileType.CONVEYOR_RIGHT,
      ]
      map[y][x] = conveyorTypes[Math.floor(Math.random() * conveyorTypes.length)]
    }
  }

  return map
}

export function getSpawnPositions(width: number, height: number): { x: number; y: number }[] {
  return [
    { x: 1, y: 1 },
    { x: width - 2, y: height - 2 },
    { x: width - 2, y: 1 },
    { x: 1, y: height - 2 },
    { x: Math.floor(width / 2), y: 1 },
    { x: Math.floor(width / 2), y: height - 2 },
    { x: 1, y: Math.floor(height / 2) },
    { x: width - 2, y: Math.floor(height / 2) },
  ]
}
