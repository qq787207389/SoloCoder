import { useRef, useEffect, useState, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Stage, Layer, Image, Transformer } from 'react-konva';
import useImage from 'use-image';
import Konva from 'konva';
import { useEditorStore } from '@/store/useEditorStore';
import { useToolStore } from '@/store/useToolStore';
import { Layer as LayerType } from '@/types/layer';

interface CanvasViewProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

interface LayerImageProps {
  layer: LayerType;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (attrs: any) => void;
}

function LayerImage({ layer, isSelected, onSelect, onChange }: LayerImageProps) {
  const shapeRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const [image] = useImage(layer.imageSource || '', 'anonymous');

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  if (!layer.visible || !image) return null;

  const applyFilters = (filters: any[]) => {
    if (shapeRef.current && filters.length > 0) {
      filters.forEach(f => {
        if (f.enabled) {
          if (f.type === 'brightness') {
            // Konva filters implementation
          }
        }
      });
    }
  };

  return (
    <>
      <Image
        ref={shapeRef}
        image={image}
        x={layer.x}
        y={layer.y}
        width={layer.width}
        height={layer.height}
        scaleX={layer.scaleX}
        scaleY={layer.scaleY}
        rotation={layer.rotation}
        opacity={layer.opacity}
        draggable={!layer.locked}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onChange({
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          if (!node) return;
          
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          
          node.scaleX(1);
          node.scaleY(1);
          
          onChange({
            x: node.x(),
            y: node.y(),
            scaleX,
            scaleY,
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && !layer.locked && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
}

export default function CanvasView({ containerRef }: CanvasViewProps) {
  const { project, canvas, setZoom, setPan, updateLayer, setActiveLayer } = useEditorStore(
    useShallow((state) => ({
      project: state.project,
      canvas: state.canvas,
      setZoom: state.setZoom,
      setPan: state.setPan,
      updateLayer: state.updateLayer,
      setActiveLayer: state.setActiveLayer,
    }))
  );
  const { currentTool } = useToolStore(
    useShallow((state) => ({
      currentTool: state.currentTool,
    }))
  );
  const stageRef = useRef<Konva.Stage>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [containerRef]);

  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    if (!stage || !project) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const oldScale = canvas.zoom;
    const delta = e.evt.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(10, oldScale * delta));
    
    const oldStageWidth = project.width * oldScale;
    const oldStageHeight = project.height * oldScale;
    const oldCenterX = (containerSize.width - oldStageWidth) / 2 + canvas.panX;
    const oldCenterY = (containerSize.height - oldStageHeight) / 2 + canvas.panY;
    
    const newStageWidth = project.width * newScale;
    const newStageHeight = project.height * newScale;
    const newCenterX = (containerSize.width - newStageWidth) / 2;
    const newCenterY = (containerSize.height - newStageHeight) / 2;
    
    const mouseRelX = (pointer.x - oldCenterX) / oldScale;
    const mouseRelY = (pointer.y - oldCenterY) / oldScale;
    
    const newStageX = pointer.x - mouseRelX * newScale;
    const newStageY = pointer.y - mouseRelY * newScale;
    
    let newPanX = newStageX - newCenterX;
    let newPanY = newStageY - newCenterY;
    
    const maxPanX = Math.max(0, (newStageWidth - containerSize.width) / 2 + 100);
    const maxPanY = Math.max(0, (newStageHeight - containerSize.height) / 2 + 100);
    newPanX = Math.max(-maxPanX, Math.min(maxPanX, newPanX));
    newPanY = Math.max(-maxPanY, Math.min(maxPanY, newPanY));

    setZoom(newScale);
    setPan(newPanX, newPanY);
  }, [setZoom, setPan, canvas.zoom, canvas.panX, canvas.panY, containerSize, project]);

  const handleStageMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      setActiveLayer('');
    }
  }, [setActiveLayer]);

  const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (currentTool === 'select' && e.target === e.target.getStage()) {
      setActiveLayer('');
    }
  }, [currentTool, setActiveLayer]);

  const handleDragEnd = useCallback(() => {
    if (!stageRef.current || !project) return;
    
    const stage = stageRef.current;
    const stageWidth = project.width * canvas.zoom;
    const stageHeight = project.height * canvas.zoom;
    const centerX = (containerSize.width - stageWidth) / 2;
    const centerY = (containerSize.height - stageHeight) / 2;
    
    let newPanX = stage.x() - centerX;
    let newPanY = stage.y() - centerY;
    
    const maxPanX = Math.max(0, (stageWidth - containerSize.width) / 2 + 100);
    const maxPanY = Math.max(0, (stageHeight - containerSize.height) / 2 + 100);
    newPanX = Math.max(-maxPanX, Math.min(maxPanX, newPanX));
    newPanY = Math.max(-maxPanY, Math.min(maxPanY, newPanY));
    
    setPan(newPanX, newPanY);
  }, [project, canvas.zoom, containerSize, setPan]);

  const handleDragMove = useCallback(() => {
    if (!stageRef.current || !project) return;
    
    const stage = stageRef.current;
    const stageWidth = project.width * canvas.zoom;
    const stageHeight = project.height * canvas.zoom;
    const centerX = (containerSize.width - stageWidth) / 2;
    const centerY = (containerSize.height - stageHeight) / 2;
    
    let newPanX = stage.x() - centerX;
    let newPanY = stage.y() - centerY;
    
    const maxPanX = Math.max(0, (stageWidth - containerSize.width) / 2 + 100);
    const maxPanY = Math.max(0, (stageHeight - containerSize.height) / 2 + 100);
    
    if (newPanX < -maxPanX || newPanX > maxPanX || newPanY < -maxPanY || newPanY > maxPanY) {
      newPanX = Math.max(-maxPanX, Math.min(maxPanX, newPanX));
      newPanY = Math.max(-maxPanY, Math.min(maxPanY, newPanY));
      stage.x(centerX + newPanX);
      stage.y(centerY + newPanY);
    }
  }, [project, canvas.zoom, containerSize]);

  const handleLayerChange = useCallback((layerId: string, attrs: any) => {
    updateLayer(layerId, attrs);
  }, [updateLayer]);

  if (!project) return null;

  const stageWidth = project.width * canvas.zoom;
  const stageHeight = project.height * canvas.zoom;
  const offsetX = (containerSize.width - stageWidth) / 2 + canvas.panX;
  const offsetY = (containerSize.height - stageHeight) / 2 + canvas.panY;

  return (
    <div className="w-full h-full relative">
      <div className="absolute inset-0 canvas-checkerboard overflow-hidden">
        <Stage
          ref={stageRef}
          width={containerSize.width}
          height={containerSize.height}
          scaleX={canvas.zoom}
          scaleY={canvas.zoom}
          x={offsetX}
          y={offsetY}
          onWheel={handleWheel}
          onMouseDown={handleStageMouseDown}
          onClick={handleStageClick}
          onDragEnd={handleDragEnd}
          onDragMove={handleDragMove}
          draggable={currentTool === 'hand'}
          dragDistance={0}
          style={{ cursor: currentTool === 'hand' ? 'grab' : 'default' }}
        >
          <Layer>
            {project.layers.map((layer, index) => (
              <LayerImage
                key={layer.id}
                layer={layer}
                isSelected={layer.id === project.activeLayerId}
                onSelect={() => setActiveLayer(layer.id)}
                onChange={(attrs) => handleLayerChange(layer.id, attrs)}
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}
