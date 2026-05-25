import React, { useRef, useEffect } from 'react';
import { GameState, GameCell, Property } from '../types';

interface GameBoardProps {
  state: GameState;
  onCellClick: (cellId: string) => void;
}

const CELL_WIDTH = 75;
const CELL_HEIGHT = 60;

export const GameBoard: React.FC<GameBoardProps> = ({ state, onCellClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 计算格子在棋盘上的位置 (0-39)
  // 棋盘布局: 起点在 (0,10)，逆时针排列
  function getCellPosition(index: number): { gridX: number; gridY: number } {
    // 使用与 generateBoard 相同的坐标
    const positions: Array<{ gridX: number; gridY: number }> = [
      { gridX: 0, gridY: 10 },  // 0: 起点
      { gridX: 1, gridY: 10 },  // 1
      { gridX: 2, gridY: 10 },  // 2
      { gridX: 3, gridY: 10 },  // 3
      { gridX: 4, gridY: 10 },  // 4
      { gridX: 5, gridY: 10 },  // 5
      { gridX: 6, gridY: 10 },  // 6
      { gridX: 7, gridY: 10 },  // 7
      { gridX: 8, gridY: 10 },  // 8
      { gridX: 9, gridY: 10 },  // 9
      { gridX: 10, gridY: 10 }, // 10: 监狱
      { gridX: 10, gridY: 9 },  // 11
      { gridX: 10, gridY: 8 },  // 12
      { gridX: 10, gridY: 7 },  // 13
      { gridX: 10, gridY: 6 },  // 14
      { gridX: 10, gridY: 5 },  // 15
      { gridX: 10, gridY: 4 },  // 16
      { gridX: 10, gridY: 3 },  // 17
      { gridX: 10, gridY: 2 },  // 18
      { gridX: 10, gridY: 1 },  // 19
      { gridX: 10, gridY: 0 },  // 20: 免费停车
      { gridX: 9, gridY: 0 },   // 21
      { gridX: 8, gridY: 0 },   // 22
      { gridX: 7, gridY: 0 },   // 23
      { gridX: 6, gridY: 0 },   // 24
      { gridX: 5, gridY: 0 },   // 25
      { gridX: 4, gridY: 0 },   // 26
      { gridX: 3, gridY: 0 },   // 27
      { gridX: 2, gridY: 0 },   // 28
      { gridX: 1, gridY: 0 },   // 29
      { gridX: 0, gridY: 0 },   // 30: 机会
      { gridX: 0, gridY: 1 },   // 31
      { gridX: 0, gridY: 2 },   // 32
      { gridX: 0, gridY: 3 },   // 33: 命运
      { gridX: 0, gridY: 4 },   // 34
      { gridX: 0, gridY: 5 },   // 35: 税金
      { gridX: 0, gridY: 6 },   // 36
      { gridX: 0, gridY: 7 },   // 37
      { gridX: 0, gridY: 8 },   // 38
      { gridX: 0, gridY: 9 },   // 39
    ];
    
    if (index >= 0 && index < positions.length) {
      return positions[index];
    }
    return { gridX: 0, gridY: 0 };
  }
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制背景
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 计算偏移量使棋盘居中 (11x11 格子)
    const offsetX = (canvas.width - (11 * CELL_WIDTH)) / 2;
    const offsetY = (canvas.height - (11 * CELL_HEIGHT)) / 2;
    
    // 绘制所有格子
    state.cells.forEach((cell: GameCell, index: number) => {
      const pos = getCellPosition(index);
      const x = offsetX + pos.gridX * CELL_WIDTH;
      const y = offsetY + pos.gridY * CELL_HEIGHT;
      
      drawCell(ctx, cell, x, y, state);
    });
    
    // 绘制玩家
    state.players.forEach((player, pIndex) => {
      const pos = getCellPosition(player.position);
      const cellX = offsetX + pos.gridX * CELL_WIDTH;
      const cellY = offsetY + pos.gridY * CELL_HEIGHT;
      const isActive = pIndex === state.currentPlayerIndex;
      
      drawPlayer(ctx, cellX, cellY, player.color, isActive, pIndex, state.players.length);
    });
    
  }, [state]);
  
  function drawCell(ctx: CanvasRenderingContext2D, cell: GameCell, x: number, y: number, state: GameState) {
    // 绘制格子背景
    let bgColor = '#34495e';
    
    if (cell.type === 'go') bgColor = '#27ae60';
    else if (cell.type === 'jail') bgColor = '#c0392b';
    else if (cell.type === 'free_parking') bgColor = '#2980b9';
    else if (cell.type === 'chance') bgColor = '#8e44ad';
    else if (cell.type === 'fortune') bgColor = '#f39c12';
    else if (cell.type === 'tax') bgColor = '#d35400';
    else if (cell.data) {
      if (cell.data.type === 'property') {
        bgColor = (cell.data as Property).color;
      } else if (cell.data.type === 'utility') {
        bgColor = '#7f8c8d';
      } else if (cell.data.type === 'station') {
        bgColor = '#2c3e50';
      }
    }
    
    ctx.fillStyle = bgColor;
    ctx.fillRect(x, y, CELL_WIDTH, CELL_HEIGHT);
    
    // 抵押效果
    if (cell.data?.isMortgaged) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(x, y, CELL_WIDTH, CELL_HEIGHT);
    }
    
    // 边框
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, CELL_WIDTH, CELL_HEIGHT);
    
    // 绘制所有者标记
    if (cell.data?.ownerId) {
      const owner = state.players.find(p => p.id === cell.data?.ownerId);
      if (owner) {
        ctx.fillStyle = owner.color;
        ctx.fillRect(x + 2, y + 2, 8, 8);
      }
    }
    
    // 绘制文字
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    let displayName = cell.name;
    if (displayName.length > 4) {
      displayName = displayName.substring(0, 3) + '..';
    }
    
    ctx.fillText(displayName, x + CELL_WIDTH / 2, y + CELL_HEIGHT / 2 - 8);
    
    // 显示价格或等级
    if (cell.data) {
      ctx.font = '10px Arial';
      if (cell.data.type === 'property') {
        const prop = cell.data as Property;
        if (prop.buildingLevel === 'landmark') {
          ctx.fillStyle = '#ffd700';
          ctx.fillText('地标', x + CELL_WIDTH / 2, y + CELL_HEIGHT / 2 + 6);
        } else if ((prop.buildingLevel as number) > 0) {
          ctx.fillStyle = '#ffd700';
          ctx.fillText(`Lv${prop.buildingLevel}`, x + CELL_WIDTH / 2, y + CELL_HEIGHT / 2 + 6);
        } else {
          ctx.fillStyle = '#cccccc';
          ctx.fillText(`$${prop.price}`, x + CELL_WIDTH / 2, y + CELL_HEIGHT / 2 + 6);
        }
      } else {
        ctx.fillStyle = '#cccccc';
        ctx.fillText(`$${cell.data.price}`, x + CELL_WIDTH / 2, y + CELL_HEIGHT / 2 + 6);
      }
    }
  }
  
  function drawPlayer(ctx: CanvasRenderingContext2D, cellX: number, cellY: number, color: string, isActive: boolean, playerIndex: number, totalPlayers: number) {
    // 计算玩家图标位置
    let offsetX = 0;
    let offsetY = 0;
    
    if (totalPlayers > 1) {
      const cols = Math.ceil(Math.sqrt(totalPlayers));
      const row = Math.floor(playerIndex / cols);
      const col = playerIndex % cols;
      offsetX = (col - (cols - 1) / 2) * 10;
      offsetY = (row - 0.5) * 10;
    }
    
    const centerX = cellX + CELL_WIDTH / 2 + offsetX;
    const centerY = cellY + CELL_HEIGHT / 2 + offsetY;
    
    // 外圈 - 活动玩家高亮
    if (isActive) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fill();
    }
    
    // 玩家圆圈
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = isActive ? '#ffffff' : '#000000';
    ctx.lineWidth = isActive ? 2 : 1;
    ctx.stroke();
    
    // 玩家编号
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(playerIndex + 1), centerX, centerY);
  }
  
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const offsetX = (canvas.width - (11 * CELL_WIDTH)) / 2;
    const offsetY = (canvas.height - (11 * CELL_HEIGHT)) / 2;
    
    for (let i = 0; i < state.cells.length; i++) {
      const pos = getCellPosition(i);
      const cellX = offsetX + pos.gridX * CELL_WIDTH;
      const cellY = offsetY + pos.gridY * CELL_HEIGHT;
      
      if (clickX >= cellX && clickX <= cellX + CELL_WIDTH &&
          clickY >= cellY && clickY <= cellY + CELL_HEIGHT) {
        onCellClick(state.cells[i].id);
        return;
      }
    }
  };
  
  return (
    <canvas
      ref={canvasRef}
      width={900}
      height={750}
      onClick={handleClick}
      className="rounded-lg shadow-2xl cursor-pointer"
      style={{ border: '2px solid #2c3e50' }}
    />
  );
};
