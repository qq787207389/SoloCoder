import type { SelectionBox, Camera, Unit, Building, BuildingType, ResourceNode } from '../types';

export class InputManager {
  private canvas: HTMLCanvasElement;
  private camera: Camera;
  private tileSize: number;
  private selectionBox: SelectionBox;
  private isDragging: boolean = false;
  private onSelectCallback: ((x: number, y: number, additive: boolean) => void) | null = null;
  private onBoxSelectCallback: ((x1: number, y1: number, x2: number, y2: number, additive: boolean) => void) | null = null;
  private onRightClickCallback: ((x: number, y: number) => void) | null = null;
  private onCameraMoveCallback: ((dx: number, dy: number) => void) | null = null;
  private onZoomCallback: ((delta: number, x: number, y: number) => void) | null = null;
  private onGroupCallback: ((group: number, set: boolean) => void) | null = null;
  private onPlaceBuildingCallback: ((buildingType: BuildingType | null) => void) | null = null;

  constructor(canvas: HTMLCanvasElement, camera: Camera, tileSize: number) {
    this.canvas = canvas;
    this.camera = camera;
    this.tileSize = tileSize;
    this.selectionBox = { startX: 0, startY: 0, endX: 0, endY: 0, visible: false };
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  private handleMouseDown(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    if (e.button === 0) {
      this.isDragging = true;
      this.selectionBox.startX = screenX;
      this.selectionBox.startY = screenY;
      this.selectionBox.endX = screenX;
      this.selectionBox.endY = screenY;
      this.selectionBox.visible = false;
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    if (this.isDragging) {
      this.selectionBox.endX = screenX;
      this.selectionBox.endY = screenY;
      const dx = Math.abs(this.selectionBox.endX - this.selectionBox.startX);
      const dy = Math.abs(this.selectionBox.endY - this.selectionBox.startY);
      this.selectionBox.visible = dx > 5 || dy > 5;
    }

    const edgeSize = 20;
    let camDx = 0;
    let camDy = 0;

    if (screenX < edgeSize) camDx = -10;
    if (screenX > rect.width - edgeSize) camDx = 10;
    if (screenY < edgeSize) camDy = -10;
    if (screenY > rect.height - edgeSize) camDy = 10;

    if (camDx !== 0 || camDy !== 0) {
      this.onCameraMoveCallback?.(camDx, camDy);
    }
  }

  private handleMouseUp(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    if (e.button === 0) {
      if (this.selectionBox.visible) {
        const x1 = Math.min(this.selectionBox.startX, this.selectionBox.endX);
        const y1 = Math.min(this.selectionBox.startY, this.selectionBox.endY);
        const x2 = Math.max(this.selectionBox.startX, this.selectionBox.endX);
        const y2 = Math.max(this.selectionBox.startY, this.selectionBox.endY);
        this.onBoxSelectCallback?.(x1, y1, x2, y2, e.shiftKey);
      } else {
        const worldPos = this.screenToWorld(screenX, screenY);
        this.onSelectCallback?.(worldPos.x, worldPos.y, e.shiftKey);
      }
      this.isDragging = false;
      this.selectionBox.visible = false;
    } else if (e.button === 2) {
      const worldPos = this.screenToWorld(screenX, screenY);
      this.onRightClickCallback?.(worldPos.x, worldPos.y);
    }
  }

  private handleWheel(e: WheelEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    this.onZoomCallback?.(e.deltaY > 0 ? -0.1 : 0.1, screenX, screenY);
    e.preventDefault();
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key >= '0' && e.key <= '9') {
      const group = parseInt(e.key);
      this.onGroupCallback?.(group, e.shiftKey);
    }

    if (e.key === 'Escape') {
      this.onPlaceBuildingCallback?.(null);
    }

    const keys: Record<string, [number, number]> = {
      'w': [0, -10],
      's': [0, 10],
      'a': [-10, 0],
      'd': [10, 0],
      'ArrowUp': [0, -10],
      'ArrowDown': [0, 10],
      'ArrowLeft': [-10, 0],
      'ArrowRight': [10, 0],
    };

    if (keys[e.key]) {
      const [dx, dy] = keys[e.key];
      this.onCameraMoveCallback?.(dx, dy);
    }
  }

  screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: screenX / this.camera.zoom + this.camera.x,
      y: screenY / this.camera.zoom + this.camera.y
    };
  }

  worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: (worldX - this.camera.x) * this.camera.zoom,
      y: (worldY - this.camera.y) * this.camera.zoom
    };
  }

  getSelectionBox(): SelectionBox {
    return this.selectionBox;
  }

  onSelect(callback: (x: number, y: number, additive: boolean) => void): void {
    this.onSelectCallback = callback;
  }

  onBoxSelect(callback: (x1: number, y1: number, x2: number, y2: number, additive: boolean) => void): void {
    this.onBoxSelectCallback = callback;
  }

  onRightClick(callback: (x: number, y: number) => void): void {
    this.onRightClickCallback = callback;
  }

  onCameraMove(callback: (dx: number, dy: number) => void): void {
    this.onCameraMoveCallback = callback;
  }

  onZoom(callback: (delta: number, x: number, y: number) => void): void {
    this.onZoomCallback = callback;
  }

  onGroup(callback: (group: number, set: boolean) => void): void {
    this.onGroupCallback = callback;
  }

  onPlaceBuilding(callback: (buildingType: BuildingType | null) => void): void {
    this.onPlaceBuildingCallback = callback;
  }

  updateCamera(camera: Camera): void {
    this.camera = camera;
  }
}
