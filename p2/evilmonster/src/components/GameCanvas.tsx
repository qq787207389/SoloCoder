import { useEffect, useRef, useState } from 'react';
import { getEngine } from '../game/engine';
import { SpellType } from '../types/game';

interface GameCanvasProps {
  selectedSpell: SpellType | null;
  onSpellUsed: () => void;
}

export default function GameCanvas({ selectedSpell, onSpellUsed }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const engine = getEngine();

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const unsubscribe = engine.subscribe(() => {
      engine.render(ctx, dimensions.width, dimensions.height);
    });

    engine.start();

    return unsubscribe;
  }, [engine, dimensions]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (selectedSpell) {
      const success = engine.handleSpellClick(
        selectedSpell,
        x,
        y,
        dimensions.width,
        dimensions.height
      );
      if (success) {
        onSpellUsed();
      }
    } else {
      const worldPos = engine.screenToWorld(x, y, dimensions.width, dimensions.height);
      engine.handleTileClick(worldPos.x, worldPos.y);
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onClick={handleClick}
        className="cursor-crosshair"
        style={{ imageRendering: 'pixelated' }}
      />
      {selectedSpell && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-900/80 px-4 py-2 rounded text-white text-sm">
          点击地图释放 {selectedSpell === 'fireball' ? '火球术' : selectedSpell === 'lightning' ? '闪电链' : '治疗术'}
        </div>
      )}
    </div>
  );
}
