
import { useMemo } from 'react';
import { HexTile, HexCoord, TerrainType } from '../types';
import { hexToPixel, hexEquals } from '../utils/hexGrid';

interface HexGridProps {
  grid: HexTile[][];
  highlightedTiles: HexCoord[];
  playerPosition: HexCoord;
  enemyPosition: HexCoord;
  onTileClick: (coord: HexCoord) => void;
  selectedAction: 'move' | 'attack' | null;
}

const HEX_SIZE = 35;

const TERRAIN_COLORS: Record<TerrainType, string> = {
  normal: '#1a1a2e',
  cover: '#2d4a3e',
  highGround: '#4a3d2d',
  explosive: '#4a2d2d',
  obstacle: '#2a2a3a',
};

const TERRAIN_LABELS: Record<TerrainType, string> = {
  normal: '',
  cover: '掩',
  highGround: '高',
  explosive: '爆',
  obstacle: '障',
};

function Hexagon({
  coord,
  terrain,
  isHighlighted,
  isPlayer,
  isEnemy,
  onClick,
  highlightType,
}: {
  coord: HexCoord;
  terrain: TerrainType;
  isHighlighted: boolean;
  isPlayer: boolean;
  isEnemy: boolean;
  onClick: () => void;
  highlightType?: 'move' | 'attack';
}) {
  const { x, y } = hexToPixel(coord, HEX_SIZE);

  const points = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      pts.push(`${HEX_SIZE * Math.cos(angle)},${HEX_SIZE * Math.sin(angle)}`);
    }
    return pts.join(' ');
  }, []);

  let strokeColor = '#2a2a4a';
  let strokeWidth = 1;
  let fillColor = TERRAIN_COLORS[terrain];

  if (isHighlighted) {
    strokeColor = highlightType === 'attack' ? '#f72585' : '#00f5d4';
    strokeWidth = 2;
    fillColor = highlightType === 'attack' ? '#4a2d3e' : '#1a3a3a';
  }

  if (terrain === 'obstacle') {
    fillColor = '#1a1a2a';
  }

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={onClick}
      className="cursor-pointer transition-all duration-200 hover:opacity-80"
    >
      <polygon
        points={points}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      <text
        y="4"
        textAnchor="middle"
        className="text-xs fill-gray-500 pointer-events-none select-none"
        style={{ fontSize: '10px' }}
      >
        {TERRAIN_LABELS[terrain]}
      </text>
      {isPlayer && (
        <g>
          <circle r="18" fill="#00f5d4" opacity={0.3} />
          <circle r="12" fill="#00f5d4" />
          <text y="4" textAnchor="middle" className="fill-black font-bold" style={{ fontSize: '12px' }}>
            我
          </text>
        </g>
      )}
      {isEnemy && (
        <g>
          <circle r="18" fill="#f72585" opacity={0.3} />
          <circle r="12" fill="#f72585" />
          <text y="4" textAnchor="middle" className="fill-black font-bold" style={{ fontSize: '12px' }}>
            敌
          </text>
        </g>
      )}
    </g>
  );
}

export default function HexGrid({
  grid,
  highlightedTiles,
  playerPosition,
  enemyPosition,
  onTileClick,
  selectedAction,
}: HexGridProps) {
  const flatGrid = useMemo(() => grid.flat(), [grid]);

  const isHighlighted = (coord: HexCoord) =>
    highlightedTiles.some((h) => hexEquals(h, coord));

  return (
    <svg
      viewBox="-250 -250 500 500"
      className="w-full h-full"
      style={{ maxHeight: '500px' }}
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {flatGrid.map((tile) => (
        <Hexagon
          key={`${tile.coord.q},${tile.coord.r}`}
          coord={tile.coord}
          terrain={tile.terrain}
          isHighlighted={isHighlighted(tile.coord)}
          isPlayer={hexEquals(tile.coord, playerPosition)}
          isEnemy={hexEquals(tile.coord, enemyPosition)}
          onClick={() => onTileClick(tile.coord)}
          highlightType={isHighlighted(tile.coord) ? selectedAction || undefined : undefined}
        />
      ))}
    </svg>
  );
}
