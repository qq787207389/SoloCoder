export class BackgroundRenderer {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  bgCanvas: HTMLCanvasElement;
  bgCtx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.bgCanvas = document.createElement('canvas');
    this.bgCanvas.width = width;
    this.bgCtx = this.bgCanvas.getContext('2d')!;
  }

  generateBackground(levelHeight: number): void {
    this.bgCanvas.height = levelHeight + this.height;

    const gradient = this.bgCtx.createLinearGradient(0, levelHeight, 0, 0);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.5, '#4A90D9');
    gradient.addColorStop(1, '#1a1a3e');
    this.bgCtx.fillStyle = gradient;
    this.bgCtx.fillRect(0, 0, this.width, levelHeight + this.height);

    const seaGradient = this.bgCtx.createLinearGradient(0, levelHeight - 30, 0, levelHeight + this.height);
    seaGradient.addColorStop(0, '#1E90FF');
    seaGradient.addColorStop(0.5, '#0066CC');
    seaGradient.addColorStop(1, '#003366');
    this.bgCtx.fillStyle = seaGradient;
    this.bgCtx.fillRect(0, levelHeight - 30, this.width, this.height + 30);

    for (let i = 0; i < 20; i++) {
      const waveY = levelHeight - 20 + Math.sin(i * 0.5) * 3;
      const waveX = (i / 20) * this.width;
      this.bgCtx.fillStyle = '#4169E1';
      this.bgCtx.beginPath();
      this.bgCtx.arc(waveX, waveY, 8, 0, Math.PI * 2);
      this.bgCtx.fill();
    }

    for (let i = 0; i < 15; i++) {
      const cloudX = Math.random() * this.width;
      const cloudY = Math.random() * (levelHeight * 0.6) + levelHeight * 0.2;
      const cloudSize = 15 + Math.random() * 20;

      this.bgCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      this.bgCtx.beginPath();
      this.bgCtx.arc(cloudX, cloudY, cloudSize, 0, Math.PI * 2);
      this.bgCtx.arc(cloudX + cloudSize * 0.6, cloudY - 5, cloudSize * 0.7, 0, Math.PI * 2);
      this.bgCtx.arc(cloudX - cloudSize * 0.6, cloudY, cloudSize * 0.6, 0, Math.PI * 2);
      this.bgCtx.fill();

      this.bgCtx.fillStyle = 'rgba(200, 200, 200, 0.6)';
      this.bgCtx.beginPath();
      this.bgCtx.arc(cloudX, cloudY + cloudSize * 0.3, cloudSize * 0.8, 0, Math.PI * 2);
      this.bgCtx.fill();
    }

    for (let i = 0; i < 100; i++) {
      const starX = Math.random() * this.width;
      const starY = Math.random() * (levelHeight * 0.3);
      const starSize = Math.random() > 0.8 ? 2 : 1;
      this.bgCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      this.bgCtx.fillRect(Math.floor(starX), Math.floor(starY), starSize, starSize);
    }
  }

  render(cameraY: number, currentHeight: number, alpha: number = 1): void {
    const parallaxY = cameraY * 0.95;
    const sourceY = Math.max(0, Math.min(this.bgCanvas.height - this.height, parallaxY));

    this.ctx.save();
    this.ctx.globalAlpha = alpha;

    this.ctx.drawImage(
      this.bgCanvas,
      0,
      sourceY,
      this.width,
      this.height,
      0,
      0,
      this.width,
      this.height
    );

    const cloudParallaxY = cameraY * 0.5;
    const cloudOffset = (Date.now() * 0.01) % this.width;

    for (let i = 0; i < 5; i++) {
      const cloudX = ((i * 120 + cloudOffset) % (this.width + 100)) - 50;
      const cloudY = ((i * 80 + cloudParallaxY * 0.2) % (this.height * 0.6)) + 20;
      const cloudSize = 12 + (i % 3) * 6;

      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      this.ctx.beginPath();
      this.ctx.arc(cloudX, cloudY, cloudSize, 0, Math.PI * 2);
      this.ctx.arc(cloudX + cloudSize * 0.5, cloudY - 3, cloudSize * 0.6, 0, Math.PI * 2);
      this.ctx.arc(cloudX - cloudSize * 0.5, cloudY + 2, cloudSize * 0.5, 0, Math.PI * 2);
      this.ctx.fill();
    }

    const glowIntensity = 0.1 + Math.sin(Date.now() * 0.002) * 0.05;
    const glowGradient = this.ctx.createRadialGradient(
      this.width / 2,
      this.height * 0.3,
      0,
      this.width / 2,
      this.height * 0.3,
      this.width * 0.6
    );
    glowGradient.addColorStop(0, `rgba(255, 200, 150, ${glowIntensity})`);
    glowGradient.addColorStop(1, 'rgba(255, 200, 150, 0)');
    this.ctx.fillStyle = glowGradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.restore();
  }
}
