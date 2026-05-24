import { GameMap, Tile, TileType, Room, Point, RoomType } from '../types/game';

export function createMap(width: number, height: number): GameMap {
  const tiles: Tile[][] = [];

  for (let y = 0; y < height; y++) {
    tiles[y] = [];
    for (let x = 0; x < width; x++) {
      tiles[y][x] = {
        type: 'rock',
        passable: false,
        explored: false,
      };
    }
  }

  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);

  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const x = centerX + dx;
      const y = centerY + dy;
      if (x >= 0 && x < width && y >= 0 && y < height) {
        tiles[y][x] = {
          type: 'floor',
          passable: true,
          explored: true,
        };
      }
    }
  }

  tiles[centerY][centerX] = {
    type: 'heart',
    passable: false,
    explored: true,
  };

  const entranceY = Math.floor(height / 2);
  const entranceX = 2;
  tiles[entranceY][entranceX] = {
    type: 'entrance',
    passable: true,
    explored: true,
  };

  for (let x = entranceX + 1; x < centerX - 2; x++) {
    tiles[entranceY][x] = {
      type: 'floor',
      passable: true,
      explored: true,
    };
  }

  return {
    width,
    height,
    tiles,
    rooms: [],
  };
}

export function digTile(map: GameMap, x: number, y: number): boolean {
  if (x < 0 || x >= map.width || y < 0 || y >= map.height) return false;
  if (map.tiles[y][x].type !== 'rock') return false;

  map.tiles[y][x] = {
    type: 'floor',
    passable: true,
    explored: true,
  };

  return true;
}

export function canPlaceRoom(
  map: GameMap,
  x: number,
  y: number,
  width: number,
  height: number
): boolean {
  for (let dy = 0; dy < height; dy++) {
    for (let dx = 0; dx < width; dx++) {
      const tx = x + dx;
      const ty = y + dy;
      if (tx < 0 || tx >= map.width || ty < 0 || ty >= map.height) return false;
      const tile = map.tiles[ty][tx];
      if (tile.type === 'entrance' || tile.type === 'heart' || tile.type === 'room') {
        return false;
      }
    }
  }
  return true;
}

export function placeRoom(
  map: GameMap,
  roomType: RoomType,
  x: number,
  y: number,
  width: number,
  height: number
): Room | null {
  if (!canPlaceRoom(map, x, y, width, height)) return null;

  const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  for (let dy = 0; dy < height; dy++) {
    for (let dx = 0; dx < width; dx++) {
      const tx = x + dx;
      const ty = y + dy;
      map.tiles[ty][tx] = {
        type: 'room',
        roomId,
        passable: true,
        explored: true,
      };
    }
  }

  const room: Room = {
    id: roomId,
    type: roomType,
    x,
    y,
    width,
    height,
  };

  map.rooms.push(room);
  return room;
}

export function getTileAt(map: GameMap, x: number, y: number): Tile | null {
  if (x < 0 || x >= map.width || y < 0 || y >= map.height) return null;
  return map.tiles[y][x];
}

export function findEmptyFloorTile(map: GameMap): Point | null {
  const candidates: Point[] = [];

  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const tile = map.tiles[y][x];
      if (tile.passable && tile.type === 'floor') {
        candidates.push({ x, y });
      }
    }
  }

  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function getHeartPosition(map: GameMap): Point | null {
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      if (map.tiles[y][x].type === 'heart') {
        return { x, y };
      }
    }
  }
  return null;
}

export function getEntrancePosition(map: GameMap): Point | null {
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      if (map.tiles[y][x].type === 'entrance') {
        return { x, y };
      }
    }
  }
  return null;
}
