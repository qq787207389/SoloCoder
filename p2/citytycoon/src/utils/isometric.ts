import { Position, IsoPosition } from '../types';

export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;

export function gridToIso(gridX: number, gridY: number): IsoPosition {
  const isoX = (gridX - gridY) * (TILE_WIDTH / 2);
  const isoY = (gridX + gridY) * (TILE_HEIGHT / 2);
  return { isoX, isoY };
}

export function isoToGrid(isoX: number, isoY: number): Position {
  const x = (isoX / (TILE_WIDTH / 2) + isoY / (TILE_HEIGHT / 2)) / 2;
  const y = (isoY / (TILE_HEIGHT / 2) - isoX / (TILE_WIDTH / 2)) / 2;
  return { x: Math.floor(x), y: Math.floor(y) };
}

export function screenToIso(
  screenX: number,
  screenY: number,
  cameraX: number,
  cameraY: number,
  zoom: number
): IsoPosition {
  const isoX = (screenX - cameraX) / zoom;
  const isoY = (screenY - cameraY) / zoom;
  return { isoX, isoY };
}

export function isoToScreen(
  isoX: number,
  isoY: number,
  cameraX: number,
  cameraY: number,
  zoom: number
): Position {
  const screenX = isoX * zoom + cameraX;
  const screenY = isoY * zoom + cameraY;
  return { x: screenX, y: screenY };
}

export function gridToScreen(
  gridX: number,
  gridY: number,
  cameraX: number,
  cameraY: number,
  zoom: number
): Position {
  const { isoX, isoY } = gridToIso(gridX, gridY);
  return isoToScreen(isoX, isoY, cameraX, cameraY, zoom);
}

export function screenToGrid(
  screenX: number,
  screenY: number,
  cameraX: number,
  cameraY: number,
  zoom: number
): Position {
  const { isoX, isoY } = screenToIso(screenX, screenY, cameraX, cameraY, zoom);
  return isoToGrid(isoX, isoY);
}

export function getTileDepth(gridX: number, gridY: number): number {
  return gridX + gridY;
}
