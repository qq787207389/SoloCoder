import { useRef, useEffect, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import type { Room, DungeonFloor, TreasureData } from '@/game/types';
import { getConnectedRooms, getRoomById } from '@/game/dungeon';
import { generateEnemyLoot } from '@/game/combat';
import { createItemInstance } from '@/game/items';
import { createCombatState, executePlayerAction, executeEnemyTurn } from '@/game/combat';
import './DungeonView.css';

const ROOM_COLORS: Record<string, string> = {
  start: '#52b788',
  empty: '#3f3f60',
  enemy: '#e63946',
  shop: '#c9a227',
  altar: '#9d4edd',
  boss: '#dc2626',
  exit: '#48cae4',
  treasure: '#f97316',
};

const ROOM_ICONS: Record<string, string> = {
  start: '🚪',
  empty: '',
  enemy: '👹',
  shop: '💰',
  altar: '⛪',
  boss: '💀',
  exit: '⬆️',
  treasure: '📦',
};

export default function DungeonView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { dungeon, player, setScreen, enterCombat, setLoot, moveToRoom, updatePlayer, goToNextFloor } = useGameStore();

  const drawDungeon = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !dungeon) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const padding = 60;
    const scale = 20;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const room of dungeon.rooms) {
      minX = Math.min(minX, room.x);
      maxX = Math.max(maxX, room.x + room.width);
      minY = Math.min(minY, room.y);
      maxY = Math.max(maxY, room.y + room.height);
    }

    const mapWidth = (maxX - minX) * scale + padding * 2;
    const mapHeight = (maxY - minY) * scale + padding * 2;

    canvas.width = mapWidth;
    canvas.height = mapHeight;

    ctx.fillStyle = '#0d0d1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 1;
    for (let x = 0; x <= maxX - minX + 4; x++) {
      ctx.beginPath();
      ctx.moveTo(padding + x * scale, padding - 20);
      ctx.lineTo(padding + x * scale, mapHeight - padding + 20);
      ctx.stroke();
    }
    for (let y = 0; y <= maxY - minY + 4; y++) {
      ctx.beginPath();
      ctx.moveTo(padding - 20, padding + y * scale);
      ctx.lineTo(mapWidth - padding + 20, padding + y * scale);
      ctx.stroke();
    }

    for (const conn of dungeon.connections) {
      const roomA = getRoomById(dungeon, conn.from);
      const roomB = getRoomById(dungeon, conn.to);
      if (!roomA || !roomB) continue;

      const ax = padding + (roomA.x + roomA.width / 2 - minX) * scale;
      const ay = padding + (roomA.y + roomA.height / 2 - minY) * scale;
      const bx = padding + (roomB.x + roomB.width / 2 - minX) * scale;
      const by = padding + (roomB.y + roomB.height / 2 - minY) * scale;

      ctx.strokeStyle = '#3f3f60';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }

    for (const room of dungeon.rooms) {
      const rx = padding + (room.x - minX) * scale;
      const ry = padding + (room.y - minY) * scale;
      const rw = room.width * scale;
      const rh = room.height * scale;

      const isCurrentRoom = room.id === dungeon.playerRoomId;
      const isDiscovered = room.discovered;

      ctx.fillStyle = isDiscovered ? ROOM_COLORS[room.type] || '#3f3f60' : '#1a1a2e';
      ctx.globalAlpha = isDiscovered ? 1 : 0.5;
      ctx.strokeStyle = isCurrentRoom ? '#c9a227' : '#52527a';
      ctx.lineWidth = isCurrentRoom ? 3 : 2;

      roundRect(ctx, rx, ry, rw, rh, 4);
      ctx.fill();
      ctx.stroke();
      ctx.globalAlpha = 1;

      if (isDiscovered || isCurrentRoom) {
        const icon = ROOM_ICONS[room.type] || '';
        if (icon) {
          ctx.font = '16px serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#fff';
          ctx.fillText(icon, rx + rw / 2, ry + rh / 2);
        }

        if (room.type === 'enemy' && !room.cleared) {
          ctx.fillStyle = '#e63946';
          ctx.font = '10px serif';
          ctx.fillText('⚠️', rx + rw - 8, ry + 12);
        }
      }

      if (isCurrentRoom) {
        ctx.fillStyle = '#c9a227';
        ctx.beginPath();
        ctx.arc(rx + rw / 2, ry + rh / 2, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = '12px serif';
        ctx.fillStyle = '#fff';
        ctx.fillText('🧙', rx + rw / 2, ry + rh / 2);
      }
    }
  }, [dungeon]);

  useEffect(() => {
    drawDungeon();
  }, [drawDungeon]);

  const handleRoomClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !dungeon) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const padding = 60;
    const scale = 20;

    let minX = Infinity, minY = Infinity;
    for (const room of dungeon.rooms) {
      minX = Math.min(minX, room.x);
      minY = Math.min(minY, room.y);
    }

    const currentRoom = getRoomById(dungeon, dungeon.playerRoomId);
    if (!currentRoom) return;

    const connected = getConnectedRooms(dungeon, dungeon.playerRoomId);

    for (const room of connected) {
      const rx = padding + (room.x - minX) * scale;
      const ry = padding + (room.y - minY) * scale;
      const rw = room.width * scale;
      const rh = room.height * scale;

      if (x >= rx && x <= rx + rw && y >= ry && y <= ry + rh) {
        handleRoomInteraction(room);
        break;
      }
    }
  }, [dungeon]);

  const handleRoomInteraction = useCallback((room: Room) => {
    if (!dungeon) return;

    if (player.stamina <= 0) {
      setScreen('gameover');
      return;
    }

    moveToRoom(room.id);
    updatePlayer({ stamina: Math.max(0, player.stamina - 1) });

    if (room.type === 'enemy' && !room.cleared && room.content && 'skills' in room.content) {
      const enemy = room.content;
      const grid = useGameStore.getState().inventoryGrid;
      if (grid) {
        const combatState = createCombatState({ player, enemy, grid });
        enterCombat(combatState);
      }
    } else if (room.type === 'boss' && !room.cleared && room.content && 'skills' in room.content) {
      const enemy = room.content;
      const grid = useGameStore.getState().inventoryGrid;
      if (grid) {
        const combatState = createCombatState({ player, enemy, grid });
        enterCombat(combatState);
      }
    } else if (room.type === 'shop') {
      setScreen('shop');
    } else if (room.type === 'altar') {
      setScreen('altar');
    } else if (room.type === 'treasure' && room.content && 'items' in room.content) {
      const treasure = room.content as TreasureData;
      if (!treasure.opened) {
        const items = treasure.items
          .map((id) => createItemInstance(id))
          .filter((item): item is NonNullable<typeof item> => item !== null);
        treasure.opened = true;
        setLoot(items);
      }
    }
  }, [dungeon, player, moveToRoom, updatePlayer, enterCombat, setScreen, setLoot]);

  if (!dungeon) {
    return <div className="dungeon-view">加载地牢中...</div>;
  }

  const currentRoom = getRoomById(dungeon, dungeon.playerRoomId);
  const connectedRooms = currentRoom ? getConnectedRooms(dungeon, currentRoom.id) : [];

  return (
    <div className="dungeon-view">
      <div className="dungeon-header">
        <h2>地牢 第 {dungeon.level} 层</h2>
        <span className="dungeon-theme">{dungeon.theme}</span>
      </div>

      <div className="dungeon-canvas-container">
        <canvas
          ref={canvasRef}
          onClick={handleRoomClick}
          className="dungeon-canvas"
        />
      </div>

      <div className="dungeon-info">
        <div className="current-room">
          <h3>当前房间</h3>
          {currentRoom && (
            <div className="room-details">
              <span className={`room-type room-${currentRoom.type}`}>
                {ROOM_ICONS[currentRoom.type]} {getRoomTypeName(currentRoom.type)}
              </span>
              {currentRoom.type === 'enemy' && !currentRoom.cleared && (
                <span className="room-warning">⚠️ 有敌人！</span>
              )}
            </div>
          )}
        </div>

        <div className="connected-rooms">
          <h3>可前往</h3>
          <div className="room-list">
            {connectedRooms.map((room) => (
              <button
                key={room.id}
                className={`room-button room-${room.type}`}
                onClick={() => handleRoomInteraction(room)}
              >
                {ROOM_ICONS[room.type]} {getRoomTypeName(room.type)}
                {room.type === 'enemy' && !room.cleared && ' ⚠️'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="dungeon-actions">
        <button className="btn btn-secondary" onClick={() => setScreen('inventory')}>
          📦 打开背包
        </button>
        <button className="btn btn-secondary" onClick={() => setScreen('camp')}>
          🏕️ 前往营地
        </button>
      </div>
    </div>
  );
}

function getRoomTypeName(type: string): string {
  const names: Record<string, string> = {
    start: '入口',
    empty: '空房间',
    enemy: '敌人',
    shop: '商店',
    altar: '祭坛',
    boss: 'Boss',
    exit: '出口',
    treasure: '宝箱',
  };
  return names[type] || type;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
