import type { CanvasElement } from '@/types';

export interface SnapGuide {
  type: 'horizontal' | 'vertical';
  position: number;
  guideType: 'center' | 'edge' | 'canvas';
}

export class SnapManager {
  private snapThreshold: number = 8;
  private canvasWidth: number;
  private canvasHeight: number;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  setCanvasSize(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  setThreshold(threshold: number): void {
    this.snapThreshold = threshold;
  }

  getElementGuides(element: CanvasElement): { horizontal: number[]; vertical: number[] } {
    const horizontal = [
      element.top,
      element.top + element.height / 2,
      element.top + element.height,
    ];
    const vertical = [
      element.left,
      element.left + element.width / 2,
      element.left + element.width,
    ];
    return { horizontal, vertical };
  }

  getCanvasGuides(): { horizontal: number[]; vertical: number[] } {
    const horizontal = [0, this.canvasHeight / 2, this.canvasHeight];
    const vertical = [0, this.canvasWidth / 2, this.canvasWidth];
    return { horizontal, vertical };
  }

  findSnapGuides(
    movingElement: CanvasElement,
    otherElements: CanvasElement[],
    deltaX: number,
    deltaY: number
  ): { guides: SnapGuide[]; snapX: number | null; snapY: number | null } {
    const guides: SnapGuide[] = [];
    let snapX: number | null = null;
    let snapY: number | null = null;

    const predictedElement: CanvasElement = {
      ...movingElement,
      left: movingElement.left + deltaX,
      top: movingElement.top + deltaY,
    };

    const { horizontal: movingHGuides, vertical: movingVGuides } = this.getElementGuides(predictedElement);

    otherElements.forEach(other => {
      if (other.id === movingElement.id || other.locked) return;

      const { horizontal: otherHGuides, vertical: otherVGuides } = this.getElementGuides(other);

      for (let i = 0; i < movingHGuides.length; i++) {
        for (let j = 0; j < otherHGuides.length; j++) {
          const diff = Math.abs(movingHGuides[i] - otherHGuides[j]);
          if (diff < this.snapThreshold) {
            guides.push({
              type: 'horizontal',
              position: otherHGuides[j],
              guideType: i === 1 ? 'center' : 'edge',
            });
            if (snapY === null || Math.abs(snapY) > diff) {
              snapY = otherHGuides[j] - movingHGuides[i];
            }
          }
        }
      }

      for (let i = 0; i < movingVGuides.length; i++) {
        for (let j = 0; j < otherVGuides.length; j++) {
          const diff = Math.abs(movingVGuides[i] - otherVGuides[j]);
          if (diff < this.snapThreshold) {
            guides.push({
              type: 'vertical',
              position: otherVGuides[j],
              guideType: i === 1 ? 'center' : 'edge',
            });
            if (snapX === null || Math.abs(snapX) > diff) {
              snapX = otherVGuides[j] - movingVGuides[i];
            }
          }
        }
      }
    });

    const { horizontal: canvasHGuides, vertical: canvasVGuides } = this.getCanvasGuides();

    for (let i = 0; i < movingHGuides.length; i++) {
      for (const guide of canvasHGuides) {
        const diff = Math.abs(movingHGuides[i] - guide);
        if (diff < this.snapThreshold) {
          guides.push({
            type: 'horizontal',
            position: guide,
            guideType: 'canvas',
          });
          if (snapY === null || Math.abs(snapY) > diff) {
            snapY = guide - movingHGuides[i];
          }
        }
      }
    }

    for (let i = 0; i < movingVGuides.length; i++) {
      for (const guide of canvasVGuides) {
        const diff = Math.abs(movingVGuides[i] - guide);
        if (diff < this.snapThreshold) {
          guides.push({
            type: 'vertical',
            position: guide,
            guideType: 'canvas',
          });
          if (snapX === null || Math.abs(snapX) > diff) {
            snapX = guide - movingVGuides[i];
          }
        }
      }
    }

    return { guides, snapX, snapY };
  }

  snapToGrid(x: number, y: number, gridSize: number): { x: number; y: number } {
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize,
    };
  }
}
