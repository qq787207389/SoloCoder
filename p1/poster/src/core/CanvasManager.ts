import * as fabric from 'fabric';
import type { CanvasElement, CanvasSize, TextElement, ImageElement, ShapeElement, LineElement, BlendMode } from '@/types';
import { SnapManager } from './SnapManager';

export class CanvasManager {
  private fabricCanvas: fabric.Canvas | null = null;
  private containerEl: HTMLElement | null = null;
  private snapManager: SnapManager;
  private gridSize: number = 10;
  private snapEnabled: boolean = true;
  private zoom: number = 1;
  private canvasSize: CanvasSize;
  private backgroundColor: string = '#ffffff';
  private elementMap: Map<string, fabric.FabricObject> = new Map();
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();

  constructor(initialSize: CanvasSize) {
    this.canvasSize = initialSize;
    this.snapManager = new SnapManager(initialSize.width, initialSize.height);
  }

  initialize(container: HTMLElement): void {
    this.containerEl = container;
    
    this.fabricCanvas = new Canvas(undefined, {
      width: this.canvasSize.width,
      height: this.canvasSize.height,
      backgroundColor: this.backgroundColor,
      preserveObjectStacking: true,
      selection: true,
    });

    container.appendChild(this.fabricCanvas.getElement());
    this.bindEvents();
    this.resizeCanvas();
  }

  private bindEvents(): void {
    if (!this.fabricCanvas) return;

    this.fabricCanvas.on('object:modified', (e: any) => {
      this.emit('elementModified', e.target?.id);
    });

    this.fabricCanvas.on('selection:created', (e: any) => {
      const selectedIds = e.selected?.map((obj: any) => obj.id) || [];
      this.emit('selectionChanged', selectedIds);
    });

    this.fabricCanvas.on('selection:updated', (e: any) => {
      const selectedIds = e.selected?.map((obj: any) => obj.id) || [];
      this.emit('selectionChanged', selectedIds);
    });

    this.fabricCanvas.on('selection:cleared', () => {
      this.emit('selectionChanged', []);
    });

    window.addEventListener('resize', this.resizeCanvas.bind(this));
  }

  private resizeCanvas(): void {
    if (!this.fabricCanvas || !this.containerEl) return;

    const containerRect = this.containerEl.getBoundingClientRect();
    const scaleX = (containerRect.width - 80) / this.canvasSize.width;
    const scaleY = (containerRect.height - 80) / this.canvasSize.height;
    const newZoom = Math.min(scaleX, scaleY, 1);

    this.setZoom(newZoom);
  }

  on(event: string, handler: (...args: any[]) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return () => this.listeners.get(event)!.delete(handler);
  }

  private emit(event: string, ...args: any[]): void {
    this.listeners.get(event)?.forEach(handler => handler(...args));
  }

  setZoom(zoom: number): void {
    if (!this.fabricCanvas) return;
    
    this.zoom = Math.max(0.25, Math.min(4, zoom));
    this.fabricCanvas.setZoom(this.zoom);
    this.fabricCanvas.setWidth(this.canvasSize.width * this.zoom);
    this.fabricCanvas.setHeight(this.canvasSize.height * this.zoom);
    this.emit('zoomChanged', this.zoom);
  }

  getZoom(): number {
    return this.zoom;
  }

  setCanvasSize(size: CanvasSize): void {
    this.canvasSize = size;
    this.snapManager.setCanvasSize(size.width, size.height);
    
    if (this.fabricCanvas) {
      this.fabricCanvas.setWidth(size.width);
      this.fabricCanvas.setHeight(size.height);
      this.resizeCanvas();
    }
    
    this.emit('canvasSizeChanged', size);
  }

  getCanvasSize(): CanvasSize {
    return this.canvasSize;
  }

  setBackgroundColor(color: string): void {
    this.backgroundColor = color;
    if (this.fabricCanvas) {
      this.fabricCanvas.setBackgroundColor(color, () => {
        this.fabricCanvas?.renderAll();
      });
    }
    this.emit('backgroundColorChanged', color);
  }

  getBackgroundColor(): string {
    return this.backgroundColor;
  }

  setSnapEnabled(enabled: boolean): void {
    this.snapEnabled = enabled;
  }

  isSnapEnabled(): boolean {
    return this.snapEnabled;
  }

  setGridSize(size: number): void {
    this.gridSize = size;
  }

  getGridSize(): number {
    return this.gridSize;
  }

  addElement(element: CanvasElement): void {
    const fabricObj = this.createElementFromData(element);
    if (fabricObj && this.fabricCanvas) {
      this.fabricCanvas.add(fabricObj);
      this.elementMap.set(element.id, fabricObj);
      this.emit('elementAdded', element.id);
    }
  }

  removeElement(id: string): void {
    const fabricObj = this.elementMap.get(id);
    if (fabricObj && this.fabricCanvas) {
      this.fabricCanvas.remove(fabricObj);
      this.elementMap.delete(id);
      this.emit('elementRemoved', id);
    }
  }

  updateElement(id: string, updates: Partial<CanvasElement>): void {
    const fabricObj = this.elementMap.get(id);
    if (!fabricObj) return;

    if (updates.left !== undefined) fabricObj.set('left', updates.left);
    if (updates.top !== undefined) fabricObj.set('top', updates.top);
    if (updates.width !== undefined) fabricObj.set('width', updates.width);
    if (updates.height !== undefined) fabricObj.set('height', updates.height);
    if (updates.rotation !== undefined) fabricObj.set('angle', updates.rotation);
    if (updates.scaleX !== undefined) fabricObj.set('scaleX', updates.scaleX);
    if (updates.scaleY !== undefined) fabricObj.set('scaleY', updates.scaleY);
    if (updates.opacity !== undefined) fabricObj.set('opacity', updates.opacity);
    if (updates.visible !== undefined) fabricObj.set('visible', updates.visible);
    if (updates.locked !== undefined) {
      fabricObj.set('selectable', !updates.locked);
      fabricObj.set('evented', !updates.locked);
    }
    if (updates.blendMode !== undefined) {
      fabricObj.set('globalCompositeOperation', this.convertBlendMode(updates.blendMode));
    }
    if (updates.zIndex !== undefined) {
      fabricObj.moveTo(updates.zIndex);
    }

    fabricObj.setCoords();
    this.fabricCanvas?.renderAll();
    this.emit('elementUpdated', id);
  }

  private convertBlendMode(mode: BlendMode): string {
    const map: Record<BlendMode, string> = {
      'normal': 'source-over',
      'multiply': 'multiply',
      'screen': 'screen',
      'overlay': 'overlay',
      'darken': 'darken',
      'lighten': 'lighten',
      'color-dodge': 'color-dodge',
      'color-burn': 'color-burn',
    };
    return map[mode] || 'source-over';
  }

  private createElementFromData(element: CanvasElement): fabric.FabricObject | null {
    let fabricObj: fabric.FabricObject | null = null;

    switch (element.type) {
      case 'text':
        fabricObj = this.createTextElement(element as TextElement);
        break;
      case 'image':
        fabricObj = this.createImageElement(element as ImageElement);
        break;
      case 'shape':
        fabricObj = this.createShapeElement(element as ShapeElement);
        break;
      case 'line':
        fabricObj = this.createLineElement(element as LineElement);
        break;
    }

    if (fabricObj) {
      fabricObj.set({
        id: element.id,
        left: element.left,
        top: element.top,
        angle: element.rotation,
        scaleX: element.scaleX,
        scaleY: element.scaleY,
        opacity: element.opacity,
        visible: element.visible,
        selectable: !element.locked,
        evented: !element.locked,
        globalCompositeOperation: this.convertBlendMode(element.blendMode),
      });
      fabricObj.moveTo(element.zIndex);
    }

    return fabricObj;
  }

  private createTextElement(element: TextElement): fabric.Text {
    const text = new fabric.Text(element.text, {
      fontFamily: element.fontFamily,
      fontSize: element.fontSize,
      fontWeight: element.fontWeight,
      fontStyle: element.fontStyle,
      lineHeight: element.lineHeight,
      charSpacing: element.letterSpacing,
      textAlign: element.textAlign,
      fill: element.fill,
      stroke: element.stroke,
      strokeWidth: element.strokeWidth,
      underline: element.textDecoration === 'underline',
      linethrough: element.textDecoration === 'line-through',
    });

    if (element.shadows.length > 0) {
      const shadow = element.shadows[0];
      text.set('shadow', new fabric.Shadow({
        color: shadow.color,
        blur: shadow.blur,
        offsetX: shadow.offsetX,
        offsetY: shadow.offsetY,
      }));
    }

    return text;
  }

  private createImageElement(element: ImageElement): fabric.Image {
    const imgElement = new window.Image();
    imgElement.src = element.src;
    imgElement.crossOrigin = element.crossOrigin || 'anonymous';
    
    const fabricImage = new fabric.Image(imgElement);
    
    fabricImage.set({
      width: element.width,
      height: element.height,
      crossOrigin: element.crossOrigin || 'anonymous',
    });

    return fabricImage;
  }

  private createShapeElement(element: ShapeElement): fabric.FabricObject {
    let shape: fabric.FabricObject;

    switch (element.shapeType) {
      case 'rect':
        shape = new fabric.Rect({
          width: element.width,
          height: element.height,
          fill: element.fill,
          stroke: element.stroke,
          strokeWidth: element.strokeWidth,
          strokeDashArray: element.strokeDashArray,
          strokeLineCap: element.strokeLineCap,
          rx: typeof element.cornerRadius === 'number' ? element.cornerRadius : 0,
          ry: typeof element.cornerRadius === 'number' ? element.cornerRadius : 0,
        });
        break;
      case 'circle':
        shape = new fabric.Circle({
          radius: element.width / 2,
          fill: element.fill,
          stroke: element.stroke,
          strokeWidth: element.strokeWidth,
          strokeDashArray: element.strokeDashArray,
          strokeLineCap: element.strokeLineCap,
        });
        break;
      case 'triangle':
        shape = new fabric.Polygon([
          { x: element.width / 2, y: 0 },
          { x: element.width, y: element.height },
          { x: 0, y: element.height },
        ], {
          fill: element.fill,
          stroke: element.stroke,
          strokeWidth: element.strokeWidth,
          strokeDashArray: element.strokeDashArray,
          strokeLineCap: element.strokeLineCap,
        });
        break;
      case 'star':
        const points = this.createStarPoints(5, element.width / 2, element.width / 4);
        shape = new fabric.Polygon(points, {
          fill: element.fill,
          stroke: element.stroke,
          strokeWidth: element.strokeWidth,
          strokeDashArray: element.strokeDashArray,
          strokeLineCap: element.strokeLineCap,
        });
        break;
      default:
        shape = new fabric.Rect({
          width: element.width,
          height: element.height,
          fill: element.fill,
          stroke: element.stroke,
          strokeWidth: element.strokeWidth,
        });
    }

    return shape;
  }

  private createStarPoints(spikes: number, outerRadius: number, innerRadius: number): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];
    const step = Math.PI / spikes;

    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = i * step - Math.PI / 2;
      points.push({
        x: outerRadius + Math.cos(angle) * radius,
        y: outerRadius + Math.sin(angle) * radius,
      });
    }

    return points;
  }

  private createLineElement(element: LineElement): fabric.Line {
    return new fabric.Line([element.x1, element.y1, element.x2, element.y2], {
      stroke: element.stroke,
      strokeWidth: element.strokeWidth,
      strokeDashArray: element.strokeDashArray,
      strokeLineCap: element.strokeLineCap,
    });
  }

  selectElements(ids: string[]): void {
    if (!this.fabricCanvas) return;

    const objects = ids.map(id => this.elementMap.get(id)).filter(Boolean) as fabric.FabricObject[];
    
    if (objects.length === 1) {
      this.fabricCanvas.setActiveObject(objects[0]);
    }
    
    this.fabricCanvas.renderAll();
  }

  getSelectedIds(): string[] {
    if (!this.fabricCanvas) return [];

    const activeObj = this.fabricCanvas.getActiveObject();
    if (!activeObj) return [];

    if (activeObj.type === 'activeSelection') {
      return (activeObj as any).getObjects().map((obj: any) => obj.id);
    }

    return [(activeObj as any).id];
  }

  clear(): void {
    if (!this.fabricCanvas) return;
    this.fabricCanvas.clear();
    this.elementMap.clear();
    this.fabricCanvas.setBackgroundColor(this.backgroundColor, () => {});
  }

  loadElements(elements: CanvasElement[]): void {
    this.clear();
    elements.forEach(element => this.addElement(element));
  }

  getElementData(id: string): CanvasElement | null {
    const fabricObj = this.elementMap.get(id);
    if (!fabricObj) return null;

    return this.convertToElementData(fabricObj);
  }

  private convertToElementData(obj: fabric.FabricObject): CanvasElement {
    const base = {
      id: (obj as any).id,
      name: '',
      left: obj.left || 0,
      top: obj.top || 0,
      width: obj.width || 0,
      height: obj.height || 0,
      rotation: obj.angle || 0,
      scaleX: obj.scaleX || 1,
      scaleY: obj.scaleY || 1,
      opacity: obj.opacity ?? 1,
      visible: obj.visible ?? true,
      locked: !obj.selectable,
      zIndex: 0,
      blendMode: 'normal' as BlendMode,
    };

    return base as CanvasElement;
  }

  toDataURL(options?: any): string {
    if (!this.fabricCanvas) return '';
    return this.fabricCanvas.toDataURL(options);
  }

  getFabricCanvas(): fabric.Canvas | null {
    return this.fabricCanvas;
  }

  getSnapManager(): SnapManager {
    return this.snapManager;
  }

  destroy(): void {
    window.removeEventListener('resize', this.resizeCanvas.bind(this));
    this.fabricCanvas?.dispose();
    this.fabricCanvas = null;
    this.elementMap.clear();
    this.listeners.clear();
  }
}
