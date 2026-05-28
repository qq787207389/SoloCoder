import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/constants';
import { Particle, Vector2 } from '../utils/types';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private camera: Vector2 = { x: 0, y: 0 };

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;
  }

  public clear(color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  public setCamera(x: number, y: number, levelWidth: number, levelHeight: number): void {
    this.camera.x = Math.max(0, Math.min(x - CANVAS_WIDTH / 2, levelWidth - CANVAS_WIDTH));
    this.camera.y = Math.max(0, Math.min(y - CANVAS_HEIGHT / 2, levelHeight - CANVAS_HEIGHT));
  }

  public getCamera(): Vector2 {
    return { ...this.camera };
  }

  public drawRect(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    useCamera: boolean = true
  ): void {
    const drawX = useCamera ? x - this.camera.x : x;
    const drawY = useCamera ? y - this.camera.y : y;
    
    this.ctx.fillStyle = color;
    this.ctx.fillRect(Math.floor(drawX), Math.floor(drawY), width, height);
  }

  public drawSprite(
    x: number,
    y: number,
    width: number,
    _height: number,
    spriteData: number[][],
    colorMap: string[],
    flipped: boolean = false,
    useCamera: boolean = true
  ): void {
    const drawX = useCamera ? x - this.camera.x : x;
    const drawY = useCamera ? y - this.camera.y : y;

    for (let row = 0; row < spriteData.length; row++) {
      for (let col = 0; col < spriteData[row].length; col++) {
        const colorIndex = spriteData[row][flipped ? spriteData[row].length - 1 - col : col];
        if (colorIndex >= 0 && colorIndex < colorMap.length) {
          this.ctx.fillStyle = colorMap[colorIndex];
          const pixelSize = Math.max(1, Math.floor(width / spriteData[0].length));
          this.ctx.fillRect(
            Math.floor(drawX + col * pixelSize),
            Math.floor(drawY + row * pixelSize),
            pixelSize,
            pixelSize
          );
        }
      }
    }
  }

  public drawText(
    text: string,
    x: number,
    y: number,
    color: string = '#ffffff',
    size: number = 16,
    useCamera: boolean = false
  ): void {
    const drawX = useCamera ? x - this.camera.x : x;
    const drawY = useCamera ? y - this.camera.y : y;
    
    this.ctx.fillStyle = color;
    this.ctx.font = `bold ${size}px 'Courier New', monospace`;
    this.ctx.fillText(text, Math.floor(drawX), Math.floor(drawY));
  }

  public drawParticle(particle: Particle, useCamera: boolean = true): void {
    const alpha = particle.lifetime / particle.maxLifetime;
    const drawX = useCamera ? particle.x - this.camera.x : particle.x;
    const drawY = useCamera ? particle.y - this.camera.y : particle.y;
    
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = particle.color;
    this.ctx.fillRect(Math.floor(drawX), Math.floor(drawY), particle.size, particle.size);
    this.ctx.globalAlpha = 1;
  }

  public drawLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    width: number = 1,
    useCamera: boolean = true
  ): void {
    const drawX1 = useCamera ? x1 - this.camera.x : x1;
    const drawY1 = useCamera ? y1 - this.camera.y : y1;
    const drawX2 = useCamera ? x2 - this.camera.x : x2;
    const drawY2 = useCamera ? y2 - this.camera.y : y2;

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.beginPath();
    this.ctx.moveTo(drawX1, drawY1);
    this.ctx.lineTo(drawX2, drawY2);
    this.ctx.stroke();
  }

  public getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }
}
