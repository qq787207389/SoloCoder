import Matter from 'matter-js';
import { Part } from '../types';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number = 0;
  private height: number = 0;
  private woodPattern: CanvasPattern | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.resize();
    this.createWoodPattern();
    window.addEventListener('resize', () => this.resize());
  }

  private resize(): void {
    const container = this.canvas.parentElement;
    if (container) {
      this.width = container.clientWidth;
      this.height = container.clientHeight;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    }
  }

  private createWoodPattern(): void {
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = 40;
    patternCanvas.height = 40;
    const pctx = patternCanvas.getContext('2d')!;
    
    pctx.fillStyle = '#A0522D';
    pctx.fillRect(0, 0, 40, 40);
    
    pctx.strokeStyle = '#8B4513';
    pctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      pctx.beginPath();
      pctx.moveTo(0, i * 4 + Math.random() * 2);
      pctx.bezierCurveTo(10, i * 4 + 3, 30, i * 4 - 1, 40, i * 4 + Math.random() * 2);
      pctx.stroke();
    }
    
    this.woodPattern = this.ctx.createPattern(patternCanvas, 'repeat') ?? null;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  clear(): void {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    this.drawGrid();
  }

  private drawGrid(): void {
    this.ctx.strokeStyle = 'rgba(135, 206, 235, 0.3)';
    this.ctx.lineWidth = 1;
    
    const gridSize = 50;
    for (let x = 0; x < this.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }
  }

  drawBoundaries(boundaries: { left: number; right: number; top: number; bottom: number }): void {
    this.ctx.strokeStyle = '#654321';
    this.ctx.lineWidth = 4;
    this.ctx.setLineDash([10, 5]);
    this.ctx.strokeRect(
      boundaries.left,
      boundaries.top,
      boundaries.right - boundaries.left,
      boundaries.bottom - boundaries.top
    );
    this.ctx.setLineDash([]);
  }

  drawStartPosition(x: number, y: number): void {
    this.ctx.save();
    this.ctx.translate(x, y);
    
    this.ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 30, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.strokeStyle = '#4CAF50';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 30, 0, Math.PI * 2);
    this.ctx.stroke();
    
    this.ctx.fillStyle = '#4CAF50';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('起点', 0, 5);
    
    this.ctx.restore();
  }

  drawEndPosition(x: number, y: number, width: number, height: number): void {
    this.ctx.save();
    
    this.ctx.fillStyle = 'rgba(255, 193, 7, 0.3)';
    this.ctx.fillRect(x - width / 2, y - height / 2, width, height);
    
    this.ctx.strokeStyle = '#FFC107';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(x - width / 2, y - height / 2, width, height);
    
    this.ctx.fillStyle = '#FFC107';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('终点', x, y + 5);
    
    this.ctx.restore();
  }

  drawPart(part: Part, isRunning: boolean): void {
    part.bodies.forEach(body => {
      this.drawBody(body, part, isRunning);
    });
    
    part.constraints.forEach(constraint => {
      this.drawConstraint(constraint, part);
    });
    
    if (part.isSelected && !isRunning) {
      this.drawSelectionBox(part);
    }
  }

  private drawBody(body: Matter.Body, part: Part, _isRunning: boolean): void {
    this.ctx.save();
    this.ctx.translate(body.position.x, body.position.y);
    this.ctx.rotate(body.angle);

    switch (part.type) {
      case 'wood_plank':
        this.drawWoodPlank(body);
        break;
      case 'spring':
        this.drawSpringBody(body, part);
        break;
      case 'conveyor':
        this.drawConveyor(body);
        break;
      case 'speed_ring':
        this.drawSpeedRing(body);
        break;
      case 'seesaw':
        this.drawSeesawBody(body);
        break;
      case 'balloon':
        this.drawBalloonBody(body);
        break;
      case 'fan':
        this.drawFanBody(body);
        break;
      case 'pin':
        this.drawPinBody(body);
        break;
      default:
        this.drawDefaultBody(body);
    }

    this.ctx.restore();
  }

  private drawWoodPlank(body: Matter.Body): void {
    const width = (body.bounds.max.x - body.bounds.min.x) * 0.8;
    const height = (body.bounds.max.y - body.bounds.min.y) * 0.8;
    
    if (this.woodPattern) {
      this.ctx.fillStyle = this.woodPattern;
    } else {
      this.ctx.fillStyle = '#A0522D';
    }
    
    this.ctx.beginPath();
    this.ctx.roundRect(-width / 2, -height / 2, width, height, 3);
    this.ctx.fill();
    
    this.ctx.strokeStyle = '#654321';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    this.ctx.fillStyle = '#8B4513';
    this.ctx.beginPath();
    this.ctx.arc(-width / 3, 0, 3, 0, Math.PI * 2);
    this.ctx.arc(width / 3, 0, 3, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawSpringBody(_body: Matter.Body, part: Part): void {
    if (part.bodies.length > 0) {
      this.ctx.fillStyle = '#654321';
      this.ctx.fillRect(-25, -5, 50, 10);
      this.ctx.strokeStyle = '#4a3520';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(-25, -5, 50, 10);
    } else {
      this.ctx.fillStyle = '#8B4513';
      this.ctx.fillRect(-20, -4, 40, 8);
    }
  }

  private drawConveyor(_body: Matter.Body): void {
    const width = 100;
    const height = 20;
    
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(-width / 2, -height / 2, width, height);
    
    this.ctx.strokeStyle = '#555';
    this.ctx.lineWidth = 2;
    for (let i = -width / 2 + 10; i < width / 2; i += 15) {
      this.ctx.beginPath();
      this.ctx.moveTo(i, -height / 2 + 3);
      this.ctx.lineTo(i, height / 2 - 3);
      this.ctx.stroke();
    }
    
    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = 'bold 10px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('→→', 0, 4);
  }

  private drawSpeedRing(_body: Matter.Body): void {
    const time = Date.now() / 500;
    const pulse = Math.sin(time) * 0.2 + 0.8;
    
    this.ctx.strokeStyle = `rgba(255, 215, 0, ${pulse})`;
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 25, 0, Math.PI * 2);
    this.ctx.stroke();
    
    this.ctx.strokeStyle = `rgba(255, 215, 0, ${pulse * 0.5})`;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 18, 0, Math.PI * 2);
    this.ctx.stroke();
    
    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('⚡', 0, 6);
  }

  private drawSeesawBody(body: Matter.Body): void {
    if (body.circleRadius) {
      this.ctx.fillStyle = '#654321';
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 10, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.strokeStyle = '#4a3520';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    } else {
      const width = 150;
      const height = 15;
      
      if (this.woodPattern) {
        this.ctx.fillStyle = this.woodPattern;
      } else {
        this.ctx.fillStyle = '#A0522D';
      }
      
      this.ctx.beginPath();
      this.ctx.roundRect(-width / 2, -height / 2, width, height, 2);
      this.ctx.fill();
      
      this.ctx.strokeStyle = '#654321';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
  }

  private drawBalloonBody(_body: Matter.Body): void {
    
    const gradient = this.ctx.createRadialGradient(-5, -5, 0, 0, 0, 25);
    gradient.addColorStop(0, '#FF9999');
    gradient.addColorStop(0.7, '#FF6B6B');
    gradient.addColorStop(1, '#CC5555');
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 25, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.strokeStyle = '#CC5555';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    this.ctx.beginPath();
    this.ctx.ellipse(-8, -8, 6, 8, -0.5, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawFanBody(_body: Matter.Body): void {
    const time = Date.now() / 100;
    
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.beginPath();
    this.ctx.roundRect(-30, -30, 60, 60, 5);
    this.ctx.fill();
    this.ctx.strokeStyle = '#5BA3C6';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    this.ctx.save();
    this.ctx.rotate(time);
    
    this.ctx.fillStyle = '#4FC3F7';
    for (let i = 0; i < 3; i++) {
      this.ctx.rotate((Math.PI * 2) / 3);
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(-5, -20);
      this.ctx.quadraticCurveTo(0, -25, 5, -20);
      this.ctx.lineTo(0, 0);
      this.ctx.fill();
    }
    
    this.ctx.restore();
    
    this.ctx.fillStyle = '#333';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 5, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawPinBody(_body: Matter.Body): void {
    const gradient = this.ctx.createRadialGradient(-2, -2, 0, 0, 0, 8);
    gradient.addColorStop(0, '#E0E0E0');
    gradient.addColorStop(1, '#A0A0A0');
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 8, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.strokeStyle = '#808080';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  }

  private drawDefaultBody(body: Matter.Body): void {
    if (body.render && body.render.visible === false) return;
    
    if (body.circleRadius) {
      this.ctx.fillStyle = body.render.fillStyle || '#888';
      this.ctx.beginPath();
      this.ctx.arc(0, 0, body.circleRadius, 0, Math.PI * 2);
      this.ctx.fill();
    } else {
      const width = body.bounds.max.x - body.bounds.min.x;
      const height = body.bounds.max.y - body.bounds.min.y;
      this.ctx.fillStyle = body.render.fillStyle || '#888';
      this.ctx.fillRect(-width / 2, -height / 2, width, height);
    }
  }

  private drawConstraint(constraint: Matter.Constraint, part: Part): void {
    if (!constraint.render || constraint.render.visible === false) return;
    
    const bodyA = constraint.bodyA;
    const bodyB = constraint.bodyB;
    
    if (!bodyA || !bodyB) return;
    
    const posA = bodyA.position;
    const posB = bodyB.position;
    
    this.ctx.strokeStyle = constraint.render.strokeStyle || '#888';
    this.ctx.lineWidth = constraint.render.lineWidth || 1;
    
    if (part.type === 'spring') {
      this.drawSpring(posA, posB);
    } else {
      this.ctx.beginPath();
      this.ctx.moveTo(posA.x, posA.y);
      this.ctx.lineTo(posB.x, posB.y);
      this.ctx.stroke();
    }
  }

  private drawSpring(posA: Matter.Vector, posB: Matter.Vector): void {
    const dx = posB.x - posA.x;
    const dy = posB.y - posA.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    
    this.ctx.save();
    this.ctx.translate(posA.x, posA.y);
    this.ctx.rotate(angle);
    
    this.ctx.strokeStyle = '#CD853F';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    
    const coils = 8;
    const coilWidth = 8;
    const coilLength = length / coils;
    
    for (let i = 0; i <= coils; i++) {
      const x = i * coilLength;
      const y = (i % 2 === 0 ? -coilWidth : coilWidth);
      if (i === 0) {
        this.ctx.moveTo(x, 0);
      } else if (i === coils) {
        this.ctx.lineTo(x, 0);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    
    this.ctx.stroke();
    this.ctx.restore();
  }

  private drawSelectionBox(part: Part): void {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    part.bodies.forEach(body => {
      if (body.render && body.render.visible === false) return;
      minX = Math.min(minX, body.bounds.min.x);
      minY = Math.min(minY, body.bounds.min.y);
      maxX = Math.max(maxX, body.bounds.max.x);
      maxY = Math.max(maxY, body.bounds.max.y);
    });
    
    const padding = 10;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;
    
    this.ctx.strokeStyle = '#2196F3';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    this.ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
    this.ctx.setLineDash([]);
    
    const handleSize = 8;
    this.ctx.fillStyle = '#2196F3';
    [[minX, minY], [maxX, minY], [minX, maxY], [maxX, maxY]].forEach(([x, y]) => {
      this.ctx.fillRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
    });
  }

  drawMarble(body: Matter.Body): void {
    this.ctx.save();
    this.ctx.translate(body.position.x, body.position.y);
    this.ctx.rotate(body.angle);
    
    const radius = body.circleRadius || 15;
    const gradient = this.ctx.createRadialGradient(-radius / 3, -radius / 3, 0, 0, 0, radius);
    gradient.addColorStop(0, '#E8E8E8');
    gradient.addColorStop(0.5, '#B0B0B0');
    gradient.addColorStop(1, '#707070');
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.strokeStyle = '#505050';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.beginPath();
    this.ctx.ellipse(-radius / 3, -radius / 3, radius / 4, radius / 3, -0.5, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
  }

  drawDragPreview(type: string, x: number, y: number): void {
    this.ctx.save();
    this.ctx.globalAlpha = 0.5;
    this.ctx.translate(x, y);
    
    switch (type) {
      case 'wood_plank':
        this.ctx.fillStyle = '#A0522D';
        this.ctx.fillRect(-60, -10, 120, 20);
        break;
      case 'spring':
        this.ctx.fillStyle = '#654321';
        this.ctx.fillRect(-25, -20, 50, 40);
        break;
      case 'conveyor':
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(-50, -10, 100, 20);
        break;
      case 'speed_ring':
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 25, 0, Math.PI * 2);
        this.ctx.stroke();
        break;
      case 'seesaw':
        this.ctx.fillStyle = '#A0522D';
        this.ctx.fillRect(-75, -7, 150, 15);
        this.ctx.fillStyle = '#654321';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 10, 0, Math.PI * 2);
        this.ctx.fill();
        break;
      case 'balloon':
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 25, 0, Math.PI * 2);
        this.ctx.fill();
        break;
      case 'fan':
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(-30, -30, 60, 60);
        break;
      case 'pin':
        this.ctx.fillStyle = '#C0C0C0';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 8, 0, Math.PI * 2);
        this.ctx.fill();
        break;
    }
    
    this.ctx.restore();
  }

  drawSnapIndicator(x: number, y: number): void {
    this.ctx.save();
    this.ctx.strokeStyle = '#4CAF50';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([3, 3]);
    this.ctx.beginPath();
    this.ctx.arc(x, y, 15, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.restore();
  }
}
