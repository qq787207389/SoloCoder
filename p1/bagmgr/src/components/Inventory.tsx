import { useRef, useEffect, useCallback, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import type { Item } from '@/game/types';
import { getItemEffectiveStats, getItemAdjacencyEffects } from '@/game/adjacency';
import { getAccessibleItems, getRotatedShape } from '@/game/inventory';
import { RARITY_COLORS, ELEMENT_COLORS, ITEM_TYPE_COLORS } from '@/game/constants';
import './Inventory.css';

const CELL_SIZE = 48;
const CELL_GAP = 2;
const PADDING = 16;

export default function Inventory() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { inventoryGrid, player, setScreen, selectItem, selectedItemId, moveItem, rotateItem, removeItem } = useGameStore();
  const [hoveredItem, setHoveredItem] = useState<Item | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const drawInventory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !inventoryGrid) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = inventoryGrid.width * (CELL_SIZE + CELL_GAP) + PADDING * 2;
    const height = inventoryGrid.height * (CELL_SIZE + CELL_GAP) + PADDING * 2;

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = '#0d0d1a';
    ctx.fillRect(0, 0, width, height);

    const accessibleItems = inventoryGrid ? getAccessibleItems(inventoryGrid) : [];
    const accessibleIds = new Set(accessibleItems.map((i) => i.id));

    for (let y = 0; y < inventoryGrid.height; y++) {
      for (let x = 0; x < inventoryGrid.width; x++) {
        const cell = inventoryGrid.cells[y][x];
        const px = PADDING + x * (CELL_SIZE + CELL_GAP);
        const py = PADDING + y * (CELL_SIZE + CELL_GAP);

        if (cell.isSpecialSlot) {
          ctx.fillStyle = '#c9a227';
          ctx.globalAlpha = 0.15;
        } else {
          ctx.fillStyle = '#2d2d44';
          ctx.globalAlpha = 1;
        }

        ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);

        ctx.strokeStyle = cell.isSpecialSlot ? '#c9a227' : '#3f3f60';
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, CELL_SIZE, CELL_SIZE);
        ctx.globalAlpha = 1;
      }
    }

    for (const item of inventoryGrid.items.values()) {
      if (!item.position) continue;

      const isAccessible = accessibleIds.has(item.id);
      const isSelected = selectedItemId === item.id;

      const shape = getRotatedShape(item);
      const itemColor = item.color || ITEM_TYPE_COLORS[item.type];
      const rarityColor = RARITY_COLORS[item.rarity];

      for (const cell of shape) {
        const px = PADDING + (item.position.x + cell.dx) * (CELL_SIZE + CELL_GAP);
        const py = PADDING + (item.position.y + cell.dy) * (CELL_SIZE + CELL_GAP);

        const gradient = ctx.createLinearGradient(px, py, px + CELL_SIZE, py + CELL_SIZE);
        gradient.addColorStop(0, itemColor);
        gradient.addColorStop(1, darkenColor(itemColor, 0.3));

        ctx.fillStyle = isAccessible ? gradient : darkenColor(itemColor, 0.5);
        ctx.globalAlpha = isAccessible ? 0.9 : 0.4;
        ctx.fillRect(px + 2, py + 2, CELL_SIZE - 4, CELL_SIZE - 4);

        if (isSelected) {
          ctx.strokeStyle = '#c9a227';
          ctx.lineWidth = 3;
          ctx.strokeRect(px + 2, py + 2, CELL_SIZE - 4, CELL_SIZE - 4);
        } else {
          ctx.strokeStyle = rarityColor;
          ctx.lineWidth = 2;
          ctx.strokeRect(px + 2, py + 2, CELL_SIZE - 4, CELL_SIZE - 4);
        }
      }

      const firstCell = shape[0];
      const px = PADDING + (item.position.x + firstCell.dx) * (CELL_SIZE + CELL_GAP);
      const py = PADDING + (item.position.y + firstCell.dy) * (CELL_SIZE + CELL_GAP);

      ctx.font = `${CELL_SIZE * 0.6}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = isAccessible ? 1 : 0.4;

      const itemWidth = Math.max(...shape.map((c) => c.dx)) + 1;
      const itemHeight = Math.max(...shape.map((c) => c.dy)) + 1;
      const centerX = px + (itemWidth * CELL_SIZE + (itemWidth - 1) * CELL_GAP) / 2;
      const centerY = py + (itemHeight * CELL_SIZE + (itemHeight - 1) * CELL_GAP) / 2;

      ctx.fillText(item.icon, centerX, centerY);
      ctx.globalAlpha = 1;
    }

    if (hoveredItem && hoveredItem.position) {
      const adjacency = getItemAdjacencyEffects(inventoryGrid, hoveredItem);
      if (adjacency.descriptions.length > 0) {
        const shape = getRotatedShape(hoveredItem);
        const itemWidth = Math.max(...shape.map((c) => c.dx)) + 1;
        const px = PADDING + hoveredItem.position.x * (CELL_SIZE + CELL_GAP);
        const py = PADDING + hoveredItem.position.y * (CELL_SIZE + CELL_GAP);

        ctx.fillStyle = 'rgba(82, 183, 136, 0.2)';
        ctx.strokeStyle = '#52b788';
        ctx.lineWidth = 2;
        ctx.fillRect(px - 4, py - 4, itemWidth * (CELL_SIZE + CELL_GAP) + 4, Math.max(...shape.map((c) => c.dy)) * (CELL_SIZE + CELL_GAP) + CELL_SIZE + 4);
        ctx.strokeRect(px - 4, py - 4, itemWidth * (CELL_SIZE + CELL_GAP) + 4, Math.max(...shape.map((c) => c.dy)) * (CELL_SIZE + CELL_GAP) + CELL_SIZE + 4);
      }
    }
  }, [inventoryGrid, selectedItemId, hoveredItem]);

  useEffect(() => {
    drawInventory();
  }, [drawInventory]);

  const getItemAtPosition = useCallback((canvasX: number, canvasY: number): Item | null => {
    if (!inventoryGrid) return null;

    const x = Math.floor((canvasX - PADDING) / (CELL_SIZE + CELL_GAP));
    const y = Math.floor((canvasY - PADDING) / (CELL_SIZE + CELL_GAP));

    if (x < 0 || x >= inventoryGrid.width || y < 0 || y >= inventoryGrid.height) return null;

    const cell = inventoryGrid.cells[y][x];
    if (!cell.itemId) return null;

    return inventoryGrid.items.get(cell.itemId) || null;
  }, [inventoryGrid]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const item = getItemAtPosition(x, y);
    if (item) {
      selectItem(item.id);
    } else {
      selectItem(null);
    }
  }, [getItemAtPosition, selectItem]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !inventoryGrid) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const item = getItemAtPosition(x, y);
    setHoveredItem(item);
  }, [getItemAtPosition, inventoryGrid]);

  const handleCanvasMouseLeave = useCallback(() => {
    setHoveredItem(null);
  }, []);

  const handleRotate = useCallback(() => {
    if (selectedItemId) {
      rotateItem(selectedItemId);
    }
  }, [selectedItemId, rotateItem]);

  const handleDrop = useCallback(() => {
    if (selectedItemId) {
      removeItem(selectedItemId);
      selectItem(null);
    }
  }, [selectedItemId, removeItem, selectItem]);

  const selectedItem = selectedItemId ? inventoryGrid?.items.get(selectedItemId) : null;

  return (
    <div className="inventory-view">
      <div className="inventory-header">
        <h2>背包管理</h2>
        <button className="btn btn-primary" onClick={() => setScreen('dungeon')}>
          返回地牢
        </button>
      </div>

      <div className="inventory-content">
        <div className="inventory-canvas-container">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={handleCanvasMouseLeave}
            className="inventory-canvas"
          />
        </div>

        <div className="inventory-sidebar">
          <div className="item-details">
            <h3>物品详情</h3>
            {selectedItem ? (
              <div className="item-detail-card">
                <div className="item-header">
                  <span className="item-icon">{selectedItem.icon}</span>
                  <span
                    className="item-name"
                    style={{ color: RARITY_COLORS[selectedItem.rarity] }}
                  >
                    {selectedItem.name}
                  </span>
                </div>
                <p className="item-description">{selectedItem.description}</p>

                <div className="item-stats">
                  {selectedItem.stats.attack !== undefined && (
                    <span>⚔️ 攻击: {selectedItem.stats.attack}</span>
                  )}
                  {selectedItem.stats.defense !== undefined && (
                    <span>🛡️ 防御: {selectedItem.stats.defense}</span>
                  )}
                  {selectedItem.stats.hp !== undefined && (
                    <span>❤️ 生命: {selectedItem.stats.hp}</span>
                  )}
                  {selectedItem.stats.stamina !== undefined && (
                    <span>⚡ 体力: {selectedItem.stats.stamina}</span>
                  )}
                </div>

                {inventoryGrid && (
                  <div className="effective-stats">
                    <h4>实际效果（含邻接）</h4>
                    {(() => {
                      const effective = getItemEffectiveStats(inventoryGrid, selectedItem);
                      return (
                        <>
                          {effective.attack !== 0 && <span>⚔️ +{effective.attack}</span>}
                          {effective.defense !== 0 && <span>🛡️ +{effective.defense}</span>}
                          {effective.hp !== 0 && <span>❤️ +{effective.hp}</span>}
                          {effective.stamina !== 0 && <span>⚡ +{effective.stamina}</span>}
                        </>
                      );
                    })()}
                  </div>
                )}

                {selectedItem.adjacencyEffects && selectedItem.adjacencyEffects.length > 0 && (
                  <div className="adjacency-info">
                    <h4>邻接效果</h4>
                    {selectedItem.adjacencyEffects.map((effect, i) => (
                      <p key={i}>{effect.description}</p>
                    ))}
                  </div>
                )}

                <div className="item-actions">
                  <button className="btn btn-secondary" onClick={handleRotate}>
                    🔄 旋转
                  </button>
                  <button className="btn btn-danger" onClick={handleDrop}>
                    🗑️ 丢弃
                  </button>
                </div>
              </div>
            ) : (
              <p className="no-item-selected">点击物品查看详情</p>
            )}
          </div>

          {inventoryGrid && (
            <div className="inventory-stats">
              <h3>背包状态</h3>
              <div className="stat-grid">
                <span>已用: {getUsedSlots(inventoryGrid)}</span>
                <span>容量: {inventoryGrid.width * inventoryGrid.height}</span>
                <span>可触及: {getAccessibleItems(inventoryGrid).length}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function darkenColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = Math.max(0, parseInt(hex.substr(0, 2), 16) * (1 - amount));
  const g = Math.max(0, parseInt(hex.substr(2, 2), 16) * (1 - amount));
  const b = Math.max(0, parseInt(hex.substr(4, 2), 16) * (1 - amount));
  return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
}

function getUsedSlots(grid: { cells: { itemId: string | null }[][] }): number {
  let count = 0;
  for (const row of grid.cells) {
    for (const cell of row) {
      if (cell.itemId) count++;
    }
  }
  return count;
}
