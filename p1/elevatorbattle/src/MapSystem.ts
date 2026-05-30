import {
  TileType,
  TILE_SIZE,
  MAP_WIDTH,
  MAP_HEIGHT,
  FLOOR_HEIGHT,
  NUM_FLOORS,
  FloorData,
  RoomData,
  Rect,
} from './types';

export class MapSystem {
  private tiles: number[][] = [];
  private floors: FloorData[] = [];
  private solidTiles: Rect[] = [];
  private exitOpen: boolean = false;

  constructor() {
    this.tiles = [];
    for (let y = 0; y < MAP_HEIGHT; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < MAP_WIDTH; x++) {
        this.tiles[y][x] = TileType.EMPTY;
      }
    }
  }

  public generateLevel(level: number): void {
    this.tiles = [];
    for (let y = 0; y < MAP_HEIGHT; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < MAP_WIDTH; x++) {
        this.tiles[y][x] = TileType.EMPTY;
      }
    }

    this.floors = [];
    const numFloors = Math.min(NUM_FLOORS, 3 + Math.floor(level / 2));
    const usableHeight = MAP_HEIGHT - 4;
    const floorHeight = FLOOR_HEIGHT;
    const floorGap = 0;

    for (let i = 0; i < numFloors; i++) {
      const floorY = usableHeight - i * (floorHeight + floorGap) - floorHeight;
      const floorData = this.generateFloor(i, floorY, level, numFloors);
      this.floors.push(floorData);
    }

    this.generateGarage();
    this.buildSolidTiles();
    this.calculateTotalFiles();
  }

  private generateFloor(floorIndex: number, yOffset: number, level: number, numFloors: number): FloorData {
    const floorHeight = FLOOR_HEIGHT;
    const corridorY = yOffset + floorHeight - 2;

    for (let x = 0; x < MAP_WIDTH; x++) {
      this.setTile(x, yOffset, TileType.WALL);
      for (let y = yOffset + 1; y < yOffset + floorHeight - 1; y++) {
        this.setTile(x, y, TileType.EMPTY);
      }
      this.setTile(x, yOffset + floorHeight - 1, TileType.WALL);
      this.setTile(x, corridorY, TileType.FLOOR);
    }

    for (let y = yOffset; y < yOffset + floorHeight; y++) {
      this.setTile(0, y, TileType.WALL);
      this.setTile(MAP_WIDTH - 1, y, TileType.WALL);
    }

    const numRooms = 2 + Math.floor(Math.random() * 2);
    const rooms: RoomData[] = [];
    const roomWidth = 5;
    const roomHeight = 4;
    const spacing = Math.floor((MAP_WIDTH - 4) / numRooms);

    for (let i = 0; i < numRooms; i++) {
      const roomX = 2 + i * spacing + Math.floor(Math.random() * 2);
      const roomY = yOffset + 1;
      const doorX = roomX + Math.floor(roomWidth / 2);

      for (let rx = roomX; rx < roomX + roomWidth; rx++) {
        for (let ry = roomY; ry < roomY + roomHeight; ry++) {
          if (ry === roomY || ry === roomY + roomHeight - 1) {
            this.setTile(rx, ry, TileType.WALL);
          } else if (rx === roomX || rx === roomX + roomWidth - 1) {
            if (rx !== doorX || ry !== roomY + roomHeight - 2) {
              this.setTile(rx, ry, TileType.WALL);
            }
          } else {
            this.setTile(rx, ry, TileType.ROOM_FLOOR);
          }
        }
      }

      this.setTile(doorX, roomY + roomHeight - 2, TileType.DOOR_RED);
      this.setTile(doorX, roomY + roomHeight - 1, TileType.FLOOR);

      const hasFile = Math.random() > 0.2 || i === 0;
      rooms.push({
        x: roomX,
        y: roomY,
        width: roomWidth,
        height: roomHeight,
        hasFile,
        fileCollected: false,
        doorX,
      });
    }

    const elevatorPositions: number[] = [];
    const numElevators = 1 + Math.floor(level / 3);
    for (let i = 0; i < numElevators; i++) {
      const ex = 3 + i * Math.floor((MAP_WIDTH - 6) / numElevators);
      elevatorPositions.push(ex);
      for (let y = yOffset + 1; y < yOffset + floorHeight - 1; y++) {
        this.setTile(ex, y, TileType.ELEVATOR_SHAFT);
      }
    }

    const escalatorPositions: { x: number; direction: 'up' | 'down' }[] = [];
    if (floorIndex > 0) {
      const esX = 8 + Math.floor(Math.random() * 8);
      const direction = floorIndex % 2 === 0 ? 'up' : 'down';
      escalatorPositions.push({ x: esX, direction });
      for (let y = yOffset + 1; y < yOffset + floorHeight - 1; y++) {
        this.setTile(esX, y, direction === 'up' ? TileType.ESCALATOR_UP : TileType.ESCALATOR_DOWN);
      }
    }

    const guardPatrolPaths: { x1: number; x2: number; y: number }[] = [];
    const numGuards = 1 + Math.floor(level / 2) + (floorIndex > 2 ? 1 : 0);
    for (let i = 0; i < numGuards; i++) {
      const gx1 = 1 + Math.floor(Math.random() * (MAP_WIDTH / 3));
      const gx2 = Math.min(MAP_WIDTH - 2, gx1 + 4 + Math.floor(Math.random() * 6));
      guardPatrolPaths.push({ x1: gx1, x2: gx2, y: corridorY });
    }

    const agentPositions: { x: number; y: number }[] = [];
    if (floorIndex >= 2 && level >= 2) {
      const numAgents = 1 + Math.floor((level - 2) / 3);
      for (let i = 0; i < numAgents; i++) {
        agentPositions.push({
          x: 5 + Math.floor(Math.random() * (MAP_WIDTH - 10)),
          y: corridorY,
        });
      }
    }

    const cameraPositions: { x: number; y: number }[] = [];
    if (floorIndex >= 1 && level >= 1) {
      const numCameras = Math.min(2, 1 + Math.floor(level / 3));
      for (let i = 0; i < numCameras; i++) {
        cameraPositions.push({
          x: 4 + i * Math.floor((MAP_WIDTH - 8) / numCameras),
          y: yOffset + 1,
        });
      }
    }

    const itemSpawns: { x: number; y: number; type: any }[] = [];
    if (Math.random() > 0.5) {
      itemSpawns.push({
        x: 2 + Math.floor(Math.random() * (MAP_WIDTH - 4)),
        y: corridorY,
        type: Math.random() > 0.5 ? 'ammo' : 'health',
      });
    }
    if (floorIndex === Math.floor(numFloors / 2) && Math.random() > 0.3) {
      itemSpawns.push({
        x: Math.floor(MAP_WIDTH / 2),
        y: corridorY,
        type: 'smg',
      });
    }
    if (floorIndex === numFloors - 1 && Math.random() > 0.3) {
      itemSpawns.push({
        x: Math.floor(MAP_WIDTH / 2) + 2,
        y: corridorY,
        type: 'armor',
      });
    }

    return {
      floorIndex,
      yOffset,
      rooms,
      elevatorPositions,
      escalatorPositions,
      guardPatrolPaths,
      agentPositions,
      cameraPositions,
      itemSpawns,
    };
  }

  private generateGarage(): void {
    const garageY = MAP_HEIGHT - 4;
    for (let x = 0; x < MAP_WIDTH; x++) {
      this.setTile(x, garageY, TileType.WALL);
      this.setTile(x, garageY + 1, TileType.FLOOR);
      this.setTile(x, garageY + 2, TileType.FLOOR);
      this.setTile(x, garageY + 3, TileType.WALL);
    }

    for (let y = garageY; y < garageY + 4; y++) {
      this.setTile(0, y, TileType.WALL);
      this.setTile(MAP_WIDTH - 1, y, TileType.WALL);
    }

    const exitX = MAP_WIDTH - 3;
    this.setTile(exitX, garageY + 1, TileType.EXIT);
    this.setTile(exitX, garageY + 2, TileType.EXIT);
  }

  private setTile(x: number, y: number, type: TileType): void {
    if (x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT) {
      this.tiles[y][x] = type;
    }
  }

  public getTile(x: number, y: number): TileType {
    const tx = Math.floor(x / TILE_SIZE);
    const ty = Math.floor(y / TILE_SIZE);
    if (tx >= 0 && tx < MAP_WIDTH && ty >= 0 && ty < MAP_HEIGHT) {
      return this.tiles[ty][tx];
    }
    return TileType.WALL;
  }

  public getTileGrid(tx: number, ty: number): TileType {
    if (tx >= 0 && tx < MAP_WIDTH && ty >= 0 && ty < MAP_HEIGHT) {
      return this.tiles[ty][tx];
    }
    return TileType.WALL;
  }

  private buildSolidTiles(): void {
    this.solidTiles = [];
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const tile = this.tiles[y][x];
        if (tile === TileType.WALL || tile === TileType.DOOR_CLOSED) {
          this.solidTiles.push({
            x: x * TILE_SIZE,
            y: y * TILE_SIZE,
            width: TILE_SIZE,
            height: TILE_SIZE,
          });
        }
      }
    }
  }

  public getSolidTiles(): Rect[] {
    return this.solidTiles;
  }

  public getFloors(): FloorData[] {
    return this.floors;
  }

  public isSolid(x: number, y: number): boolean {
    const tile = this.getTile(x, y);
    return tile === TileType.WALL || tile === TileType.DOOR_CLOSED;
  }

  public isWalkable(x: number, y: number): boolean {
    const tile = this.getTile(x, y);
    return (
      tile === TileType.FLOOR ||
      tile === TileType.ROOM_FLOOR ||
      tile === TileType.ELEVATOR_SHAFT ||
      tile === TileType.ESCALATOR_UP ||
      tile === TileType.ESCALATOR_DOWN ||
      tile === TileType.EXIT
    );
  }

  public collectFile(roomX: number, roomY: number): boolean {
    for (const floor of this.floors) {
      for (const room of floor.rooms) {
        if (room.x === roomX && room.y === roomY && room.hasFile && !room.fileCollected) {
          room.fileCollected = true;
          return true;
        }
      }
    }
    return false;
  }

  public getFilesCollected(): number {
    let count = 0;
    for (const floor of this.floors) {
      for (const room of floor.rooms) {
        if (room.fileCollected) count++;
      }
    }
    return count;
  }

  public calculateTotalFiles(): number {
    let count = 0;
    for (const floor of this.floors) {
      for (const room of floor.rooms) {
        if (room.hasFile) count++;
      }
    }
    return count;
  }

  public allFilesCollected(): boolean {
    for (const floor of this.floors) {
      for (const room of floor.rooms) {
        if (room.hasFile && !room.fileCollected) return false;
      }
    }
    return true;
  }

  public setExitOpen(open: boolean): void {
    this.exitOpen = open;
  }

  public isExitOpen(): boolean {
    return this.exitOpen;
  }

  public getFloorForY(y: number): number {
    const ty = Math.floor(y / TILE_SIZE);
    for (let i = 0; i < this.floors.length; i++) {
      const floor = this.floors[i];
      if (ty >= floor.yOffset && ty < floor.yOffset + FLOOR_HEIGHT) {
        return i;
      }
    }
    if (ty >= MAP_HEIGHT - 4) {
      return -1;
    }
    return -1;
  }

  public getGarageY(): number {
    return (MAP_HEIGHT - 3) * TILE_SIZE;
  }
}
