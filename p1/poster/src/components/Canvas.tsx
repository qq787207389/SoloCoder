import { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { useEditorStore } from '@/stores/useEditorStore';
import type { CanvasElement, TextElement, ImageElement, ShapeElement } from '@/types';

export default function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<any | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    elements,
    canvasSize,
    backgroundColor,
    zoom,
    selectedIds,
    setSelectedIds,
    updateElement,
  } = useEditorStore();

  useEffect(() => {
    if (!containerRef.current) return;

    const canvas = new fabric.Canvas(undefined, {
      width: canvasSize.width,
      height: canvasSize.height,
      backgroundColor,
      preserveObjectStacking: true,
      selection: true,
    });

    containerRef.current.appendChild(canvas.getElement());
    fabricCanvasRef.current = canvas;

    canvas.on('selection:created', (e: any) => {
      const ids = e.selected?.map((obj: any) => obj.id) || [];
      setSelectedIds(ids);
    });

    canvas.on('selection:updated', (e: any) => {
      const ids = e.selected?.map((obj: any) => obj.id) || [];
      setSelectedIds(ids);
    });

    canvas.on('selection:cleared', () => {
      setSelectedIds([]);
    });

    canvas.on('object:modified', (e: any) => {
      const obj = e.target;
      if (!obj?.id) return;

      updateElement(obj.id, {
        left: obj.left,
        top: obj.top,
        width: obj.width * (obj.scaleX || 1),
        height: obj.height * (obj.scaleY || 1),
        rotation: obj.angle || 0,
        scaleX: obj.scaleX || 1,
        scaleY: obj.scaleY || 1,
      });
    });

    setIsInitialized(true);

    return () => {
      try {
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.dispose();
        }
      } catch (e) {
        // Fabric.js dispose 有时会抛出 DOM 操作错误，可以安全忽略
      }
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    fabricCanvasRef.current.backgroundColor = backgroundColor;
    fabricCanvasRef.current.renderAll();
  }, [backgroundColor]);

  useEffect(() => {
    if (!fabricCanvasRef.current || !isInitialized) return;

    const canvas = fabricCanvasRef.current;
    const currentObjects = canvas.getObjects();

    currentObjects.forEach((obj: any) => {
      if (!elements.find((e) => e.id === obj.id)) {
        canvas.remove(obj);
      }
    });

    elements.forEach((element) => {
      const existingObj = currentObjects.find((obj: any) => obj.id === element.id) as any;

      if (existingObj) {
        existingObj.set({
          left: element.left,
          top: element.top,
          angle: element.rotation,
          scaleX: element.scaleX,
          scaleY: element.scaleY,
          opacity: element.opacity,
          visible: element.visible,
          selectable: !element.locked,
          evented: !element.locked,
        });
      } else {
        const newObj = createFabricObject(element);
        if (newObj) {
          canvas.add(newObj);
        }
      }
    });

    const sortedObjects = [...canvas.getObjects()].sort(
      (a: any, b: any) => {
        const elA = elements.find((e) => e.id === a.id);
        const elB = elements.find((e) => e.id === b.id);
        return (elA?.zIndex || 0) - (elB?.zIndex || 0);
      }
    );

    sortedObjects.forEach((obj, index) => {
      canvas.moveObjectTo(obj, index);
    });

    canvas.renderAll();
  }, [elements, isInitialized]);

  useEffect(() => {
    if (!fabricCanvasRef.current || !isInitialized) return;

    const canvas = fabricCanvasRef.current;
    canvas.setDimensions({
      width: canvasSize.width * zoom,
      height: canvasSize.height * zoom,
    });
    canvas.setZoom(zoom);
  }, [canvasSize, zoom, isInitialized]);

  useEffect(() => {
    if (!fabricCanvasRef.current || !isInitialized) return;

    const canvas = fabricCanvasRef.current;
    const objects = canvas.getObjects();

    if (selectedIds.length === 0) {
      canvas.discardActiveObject();
      canvas.renderAll();
      return;
    }

    const selectedObjects = objects.filter((obj: any) => selectedIds.includes(obj.id));

    if (selectedObjects.length === 1) {
      canvas.setActiveObject(selectedObjects[0]);
      canvas.renderAll();
    }
  }, [selectedIds, isInitialized]);

  return (
    <div
      ref={containerRef}
      className="canvas-container flex items-center justify-center overflow-auto"
      style={{
        width: '100%',
        height: '100%',
      }}
    />
  );
}

function createFabricObject(element: CanvasElement): any | null {
  switch (element.type) {
    case 'text':
      return createTextObject(element as TextElement);
    case 'image':
      return createImageObject(element as ImageElement);
    case 'shape':
      return createShapeObject(element as ShapeElement);
    default:
      return null;
  }
}

function createTextObject(element: TextElement): fabric.Text {
  return new fabric.Text(element.text, {
    id: element.id,
    left: element.left,
    top: element.top,
    angle: element.rotation,
    scaleX: element.scaleX,
    scaleY: element.scaleY,
    opacity: element.opacity,
    visible: element.visible,
    selectable: !element.locked,
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
}

function createImageObject(element: ImageElement): fabric.Image {
  const imgElement = document.createElement('img');
  imgElement.src = element.src;
  imgElement.crossOrigin = element.crossOrigin || 'anonymous';

  const fabricImage = new fabric.Image(imgElement, {
    id: element.id,
    left: element.left,
    top: element.top,
    width: element.width,
    height: element.height,
    angle: element.rotation,
    scaleX: element.scaleX,
    scaleY: element.scaleY,
    opacity: element.opacity,
    visible: element.visible,
    selectable: !element.locked,
    crossOrigin: element.crossOrigin || 'anonymous',
  });

  return fabricImage;
}

function createShapeObject(element: ShapeElement): any {
  const commonProps = {
    id: element.id,
    left: element.left,
    top: element.top,
    angle: element.rotation,
    scaleX: element.scaleX,
    scaleY: element.scaleY,
    opacity: element.opacity,
    visible: element.visible,
    selectable: !element.locked,
    fill: element.fill,
    stroke: element.stroke,
    strokeWidth: element.strokeWidth,
    strokeDashArray: element.strokeDashArray,
    strokeLineCap: element.strokeLineCap,
  };

  switch (element.shapeType) {
    case 'rect':
      return new fabric.Rect({
        ...commonProps,
        width: element.width,
        height: element.height,
        rx: typeof element.cornerRadius === 'number' ? element.cornerRadius : 0,
        ry: typeof element.cornerRadius === 'number' ? element.cornerRadius : 0,
      });
    case 'circle':
      return new fabric.Circle({
        ...commonProps,
        radius: element.width / 2,
      });
    case 'triangle':
      return new fabric.Triangle({
        ...commonProps,
        width: element.width,
        height: element.height,
      });
    case 'star':
      return new fabric.Polygon(createStarPoints(5, element.width / 2, element.width / 4), commonProps);
    default:
      return new fabric.Rect({
        ...commonProps,
        width: element.width,
        height: element.height,
      });
  }
}

function createStarPoints(spikes: number, outerRadius: number, innerRadius: number): { x: number; y: number }[] {
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
