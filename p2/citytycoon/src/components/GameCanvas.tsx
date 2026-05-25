import { useRef, useEffect, useState, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { IsometricRenderer } from '../game/IsometricRenderer';
import { screenToGrid } from '../utils/isometric';
import { Position } from '../types';

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<IsometricRenderer | null>(null);
  const { state, dispatch, handleTileClick } = useGame();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position | null>(null);
  const lastMousePos = useRef<Position | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (rendererRef.current) {
        rendererRef.current.resize(canvas.width, canvas.height);
      }
    };

    resizeCanvas();
    rendererRef.current = new IsometricRenderer(ctx, canvas.width, canvas.height);

    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.render(state);
    }
  }, [state]);

  const getGridPosition = useCallback((e: React.MouseEvent): Position | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const gridPos = screenToGrid(
      mouseX,
      mouseY,
      state.camera.x + canvas.width / 2,
      state.camera.y + canvas.height / 3,
      state.camera.zoom
    );

    if (
      gridPos.x >= 0 &&
      gridPos.x < state.mapSize.width &&
      gridPos.y >= 0 &&
      gridPos.y < state.mapSize.height
    ) {
      return gridPos;
    }
    return null;
  }, [state.camera, state.mapSize]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 2 || e.button === 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (e.button === 0) {
      const gridPos = getGridPosition(e);
      if (gridPos) {
        handleTileClick(gridPos);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const gridPos = getGridPosition(e);
    
    if (gridPos && (lastMousePos.current?.x !== gridPos.x || lastMousePos.current?.y !== gridPos.y)) {
      lastMousePos.current = gridPos;
      dispatch({ type: 'SELECT_POSITION', payload: gridPos });
    }

    if (isDragging && dragStart) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      dispatch({
        type: 'UPDATE_CAMERA',
        payload: {
          x: state.camera.x + dx,
          y: state.camera.y + dy,
          zoom: state.camera.zoom
        }
      });
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.5, Math.min(2, state.camera.zoom * delta));
    dispatch({
      type: 'UPDATE_CAMERA',
      payload: {
        x: state.camera.x,
        y: state.camera.y,
        zoom: newZoom
      }
    });
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onContextMenu={handleContextMenu}
    />
  );
}
