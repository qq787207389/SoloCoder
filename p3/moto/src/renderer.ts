import { CANVAS_W, CANVAS_H, TERRAIN_PROPS, TerrainType, ObstacleType, TrackTheme, THEME_NAME, GameState, PickupType, TRACK_TOTAL_SEGMENTS, TRACK_WIDTH } from './types';
import { Track } from './track';
import { MotoState } from './motorcycle';
import { clamp } from './utils';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export class Renderer {
  ctx: CanvasRenderingContext2D;
  buffer: HTMLCanvasElement;
  bufCtx: CanvasRenderingContext2D;
  camX = 0;
  camY = 0;
  camShakeX = 0;
  camShakeY = 0;
  shakeIntensity = 0;
  particles: Particle[] = [];
  frameCount = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.buffer = document.createElement('canvas');
    this.buffer.width = CANVAS_W;
    this.buffer.height = CANVAS_H;
    this.bufCtx = this.buffer.getContext('2d')!;
    this.bufCtx.imageSmoothingEnabled = false;
  }

  shake(intensity: number) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
  }

  updateCamera(target: MotoState, dt: number) {
    const lookAhead = 80 + target.speed * 20;
    const targetX = target.x + Math.cos(target.angle) * lookAhead;
    const targetY = target.y + Math.sin(target.angle) * lookAhead;
    this.camX += (targetX - this.camX) * 0.06 * dt;
    this.camY += (targetY - this.camY) * 0.06 * dt;

    if (this.shakeIntensity > 0) {
      this.camShakeX = (Math.random() - 0.5) * this.shakeIntensity * 2;
      this.camShakeY = (Math.random() - 0.5) * this.shakeIntensity * 2;
      this.shakeIntensity *= 0.88;
      if (this.shakeIntensity < 0.3) this.shakeIntensity = 0;
    } else {
      this.camShakeX = 0;
      this.camShakeY = 0;
    }
  }

  worldToScreen(wx: number, wy: number, jumpHeight: number = 0): [number, number] {
    const sx = wx - this.camX + CANVAS_W / 2 + this.camShakeX;
    const sy = wy - this.camY + CANVAS_H / 2 + this.camShakeY - jumpHeight;
    return [sx, sy];
  }

  beginFrame() {
    this.bufCtx.fillStyle = '#2a3a1a';
    this.bufCtx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }

  drawTrack(track: Track) {
    const ctx = this.bufCtx;
    const centerIdx = track.getSegmentIndex(this.camX, this.camY);
    const viewRange = 60;

    for (let i = Math.max(1, centerIdx - viewRange); i < Math.min(track.points.length, centerIdx + viewRange); i++) {
      const p = track.points[i];
      const prev = track.points[i - 1];
      const [sx, sy] = this.worldToScreen(p.x, p.y);
      const [psx, psy] = this.worldToScreen(prev.x, prev.y);

      if (sx < -200 || sx > CANVAS_W + 200 || sy < -200 || sy > CANVAS_H + 200) continue;

      const props = TERRAIN_PROPS[p.terrain];
      const perpAngle = p.angle + Math.PI / 2;
      const prevPerp = prev.angle + Math.PI / 2;
      const halfW = p.width / 2;
      const prevHalfW = prev.width / 2;

      const lx0 = psx - Math.cos(prevPerp) * prevHalfW;
      const ly0 = psy - Math.sin(prevPerp) * prevHalfW;
      const rx0 = psx + Math.cos(prevPerp) * prevHalfW;
      const ry0 = psy + Math.sin(prevPerp) * prevHalfW;
      const lx1 = sx - Math.cos(perpAngle) * halfW;
      const ly1 = sy - Math.sin(perpAngle) * halfW;
      const rx1 = sx + Math.cos(perpAngle) * halfW;
      const ry1 = sy + Math.sin(perpAngle) * halfW;

      ctx.fillStyle = (i % 2 === 0) ? props.color1 : props.color2;
      ctx.beginPath();
      ctx.moveTo(lx0, ly0);
      ctx.lineTo(lx1, ly1);
      ctx.lineTo(rx1, ry1);
      ctx.lineTo(rx0, ry0);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = props.edgeColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(lx0, ly0);
      ctx.lineTo(lx1, ly1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(rx0, ry0);
      ctx.lineTo(rx1, ry1);
      ctx.stroke();

      if (i % 8 === 0) {
        ctx.fillStyle = props.edgeColor;
        ctx.fillRect(lx1 - 1, ly1 - 1, 3, 3);
        ctx.fillRect(rx1 - 1, ry1 - 1, 3, 3);
      }

      if (p.terrain === TerrainType.BRIDGE) {
        ctx.strokeStyle = '#6B4F10';
        ctx.lineWidth = 1;
        const numPlanks = 6;
        for (let j = 0; j <= numPlanks; j++) {
          const t = j / numPlanks;
          const bx0 = lx0 + (rx0 - lx0) * t;
          const by0 = ly0 + (ry0 - ly0) * t;
          const bx1 = lx1 + (rx1 - lx1) * t;
          const by1 = ly1 + (ry1 - ly1) * t;
          ctx.beginPath();
          ctx.moveTo(bx0, by0);
          ctx.lineTo(bx1, by1);
          ctx.stroke();
        }
      }

      if (p.terrain === TerrainType.DIRT && i % 5 === 0) {
        ctx.fillStyle = 'rgba(90,60,20,0.3)';
        const dirtX = lx1 + (rx1 - lx1) * (0.2 + (i % 7) * 0.1);
        const dirtY = ly1 + (ry1 - ly1) * (0.2 + (i % 7) * 0.1);
        ctx.fillRect(dirtX, dirtY, 2, 1);
      }

      if (p.isStart) {
        ctx.fillStyle = '#FFD700';
        const checkSize = 4;
        const numChecks = Math.floor(halfW * 2 / checkSize);
        for (let c = 0; c < numChecks; c++) {
          const t = c / numChecks;
          const cx = lx1 + (rx1 - lx1) * t;
          const cy = ly1 + (ry1 - ly1) * t;
          ctx.fillStyle = c % 2 === 0 ? '#FFD700' : '#333';
          ctx.fillRect(cx, cy - 2, checkSize, 4);
        }
      }

      if (p.isFinish) {
        ctx.fillStyle = '#FFF';
        const checkSize = 4;
        const numChecks = Math.floor(halfW * 2 / checkSize);
        for (let c = 0; c < numChecks; c++) {
          const t = c / numChecks;
          const cx = lx1 + (rx1 - lx1) * t;
          const cy = ly1 + (ry1 - ly1) * t;
          ctx.fillStyle = c % 2 === 0 ? '#FFF' : '#111';
          ctx.fillRect(cx, cy - 2, checkSize, 4);
        }
      }

      for (const obs of p.obstacles) {
        const perpA = p.angle + Math.PI / 2;
        const owx = p.x + Math.cos(perpA) * obs.relX;
        const owy = p.y + Math.sin(perpA) * obs.relX;
        const [osx, osy] = this.worldToScreen(owx, owy);
        this.drawObstacle(ctx, obs, osx, osy);
      }

      for (const pickup of p.pickups) {
        if (pickup.collected) continue;
        const [ppx, ppy] = this.worldToScreen(pickup.x, pickup.y);
        const bob = Math.sin(this.frameCount * 0.08 + pickup.x * 0.1) * 2;
        if (pickup.type === PickupType.WRENCH) {
          ctx.fillStyle = '#C0C0C0';
          ctx.fillRect(ppx - 2, ppy - 3 + bob, 4, 6);
          ctx.fillStyle = '#909090';
          ctx.fillRect(ppx - 3, ppy - 1 + bob, 6, 2);
        } else {
          ctx.fillStyle = '#E03030';
          ctx.fillRect(ppx - 2, ppy - 3 + bob, 4, 6);
          ctx.fillStyle = '#FF6030';
          ctx.fillRect(ppx - 1, ppy - 2 + bob, 2, 2);
          ctx.fillStyle = '#FFD030';
          ctx.fillRect(ppx - 1, ppy + 3 + bob, 2, 2);
        }
      }
    }
  }

  drawObstacle(ctx: CanvasRenderingContext2D, obs: import('./types').Obstacle, sx: number, sy: number) {
    switch (obs.type) {
      case ObstacleType.MUD: {
        ctx.fillStyle = '#5C3A0A';
        ctx.beginPath();
        ctx.ellipse(sx, sy, obs.w / 2, obs.h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#4A2E08';
        for (let i = 0; i < 4; i++) {
          const px = sx + Math.sin(i * 2.1) * obs.w * 0.3;
          const py = sy + Math.cos(i * 1.7) * obs.h * 0.3;
          ctx.fillRect(px, py, 2, 2);
        }
        break;
      }
      case ObstacleType.PUDDLE: {
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#3878B8';
        ctx.beginPath();
        ctx.ellipse(sx, sy, obs.w / 2, obs.h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#80B8E8';
        ctx.beginPath();
        ctx.ellipse(sx - 2, sy - 1, obs.w / 4, obs.h / 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;
      }
      case ObstacleType.BUMP: {
        ctx.fillStyle = '#A08030';
        ctx.beginPath();
        ctx.ellipse(sx, sy - 3, obs.w / 2, obs.h / 2, 0, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#907020';
        ctx.fillRect(sx - obs.w / 2, sy - 1, obs.w, 2);
        break;
      }
      case ObstacleType.RAMP: {
        ctx.fillStyle = '#B09030';
        ctx.beginPath();
        ctx.moveTo(sx - obs.w / 2, sy + obs.h / 2);
        ctx.lineTo(sx, sy - obs.h / 2);
        ctx.lineTo(sx + obs.w / 2, sy + obs.h / 2);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#806020';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = '#C0A040';
        ctx.beginPath();
        ctx.moveTo(sx - obs.w / 3, sy + obs.h / 4);
        ctx.lineTo(sx, sy - obs.h / 3);
        ctx.lineTo(sx + obs.w / 3, sy + obs.h / 4);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case ObstacleType.WASHBOARD: {
        ctx.fillStyle = '#7A5C10';
        ctx.fillRect(sx - obs.w / 2, sy - obs.h / 2, obs.w, obs.h);
        ctx.strokeStyle = '#5C4409';
        ctx.lineWidth = 1;
        for (let r = 0; r < obs.h; r += 3) {
          ctx.beginPath();
          ctx.moveTo(sx - obs.w / 2, sy - obs.h / 2 + r);
          ctx.lineTo(sx + obs.w / 2, sy - obs.h / 2 + r);
          ctx.stroke();
        }
        ctx.strokeStyle = '#9A7B30';
        for (let r = 1; r < obs.h; r += 6) {
          ctx.beginPath();
          ctx.moveTo(sx - obs.w / 2, sy - obs.h / 2 + r);
          ctx.lineTo(sx + obs.w / 2, sy - obs.h / 2 + r);
          ctx.stroke();
        }
        break;
      }
      case ObstacleType.ROCK: {
        ctx.fillStyle = '#707070';
        ctx.beginPath();
        ctx.ellipse(sx, sy, obs.w / 2, obs.h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#888';
        ctx.fillRect(sx - obs.w / 4, sy - obs.h / 3, obs.w / 3, obs.h / 4);
        break;
      }
    }
  }

  drawScenery(track: Track) {
    const ctx = this.bufCtx;
    const centerIdx = track.getSegmentIndex(this.camX, this.camY);
    const viewRange = 60;

    for (let i = Math.max(0, centerIdx - viewRange); i < Math.min(track.points.length, centerIdx + viewRange); i += 2) {
      const p = track.points[i];
      const perpAngle = p.angle + Math.PI / 2;

      for (let side = -1; side <= 1; side += 2) {
        const treeDist = p.width / 2 + 12 + ((i * 7 + side * 13) % 20);
        const wx = p.x + Math.cos(perpAngle) * treeDist * side;
        const wy = p.y + Math.sin(perpAngle) * treeDist * side;
        const [sx, sy] = this.worldToScreen(wx, wy);

        if (sx < -20 || sx > CANVAS_W + 20 || sy < -25 || sy > CANVAS_H + 15) continue;

        const variant = (i * 3 + side * 5 + 7) % 7;

        if (variant === 0) {
          ctx.fillStyle = '#3D2810';
          ctx.fillRect(sx - 1, sy - 4, 2, 5);
          ctx.fillStyle = '#1A4010';
          ctx.beginPath();
          ctx.arc(sx, sy - 7, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#245018';
          ctx.beginPath();
          ctx.arc(sx + 2, sy - 8, 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (variant === 1) {
          ctx.fillStyle = '#3D2810';
          ctx.fillRect(sx - 1, sy - 3, 2, 4);
          ctx.fillStyle = '#1A3010';
          ctx.beginPath();
          ctx.moveTo(sx, sy - 12);
          ctx.lineTo(sx - 4, sy - 4);
          ctx.lineTo(sx + 4, sy - 4);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#1A3815';
          ctx.beginPath();
          ctx.moveTo(sx, sy - 9);
          ctx.lineTo(sx - 3, sy - 3);
          ctx.lineTo(sx + 3, sy - 3);
          ctx.closePath();
          ctx.fill();
        } else if (variant === 2) {
          ctx.fillStyle = '#2A5818';
          const bushSize = 3 + (i % 3);
          ctx.beginPath();
          ctx.arc(sx, sy, bushSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#1A4010';
          ctx.beginPath();
          ctx.arc(sx + 1, sy - 1, bushSize - 1, 0, Math.PI * 2);
          ctx.fill();
        } else if (variant === 3) {
          ctx.fillStyle = '#E04040';
          ctx.fillRect(sx - 1, sy - 2, 2, 3);
          ctx.fillStyle = '#FFD0D0';
          ctx.fillRect(sx - 1, sy - 3, 2, 1);
        } else if (variant === 4) {
          if (i % 12 < 3) {
            ctx.fillStyle = '#4488CC';
            ctx.beginPath();
            ctx.ellipse(sx, sy, 8 + (i % 5), 4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#5599DD';
            ctx.beginPath();
            ctx.ellipse(sx - 2, sy, 5, 3, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (variant === 5 || variant === 6) {
          const personColors = ['#E04040', '#4080E0', '#40C040', '#E0A020', '#A040C0', '#E06080'];
          const cIdx = (i * 11 + side * 7) % personColors.length;
          const bounce = Math.sin(this.frameCount * 0.06 + i * 0.5) * 1.5;

          ctx.fillStyle = personColors[cIdx];
          ctx.fillRect(sx - 1, sy - 5 + bounce, 2, 4);
          ctx.fillStyle = '#FFD0A0';
          ctx.fillRect(sx - 1, sy - 7 + bounce, 2, 2);

          if (variant === 6) {
            ctx.fillStyle = '#FFF';
            ctx.fillRect(sx + 1, sy - 4 + bounce, 2, 2);
          }
        }
      }
    }
  }

  drawTireTracks(moto: MotoState) {
    const ctx = this.bufCtx;
    for (const t of moto.tireTracks) {
      const [sx, sy] = this.worldToScreen(t.x, t.y);
      if (sx < -5 || sx > CANVAS_W + 5 || sy < -5 || sy > CANVAS_H + 5) continue;
      const alpha = clamp(1 - t.age / 400, 0, 0.3);
      if (alpha < 0.02) continue;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#3A2A10';
      ctx.fillRect(sx - 1, sy - 1, 2, 2);
    }
    ctx.globalAlpha = 1;
  }

  drawMoto(moto: MotoState) {
    const ctx = this.bufCtx;
    const jumpH = moto.height;
    const [sx, sy] = this.worldToScreen(moto.x, moto.y, jumpH);

    if (sx < -25 || sx > CANVAS_W + 25 || sy < -35 || sy > CANVAS_H + 25) return;

    if (jumpH > 0) {
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      const shadowScale = 1 + jumpH * 0.02;
      ctx.ellipse(sx, sy + jumpH + 2, 5 * shadowScale, 3 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(moto.angle + Math.PI / 2);

    if (moto.crashed) {
      const crashPhase = ((CRASH_RECOVERY_TIME - moto.crashTimer) / CRASH_RECOVERY_TIME) * Math.PI * 6;
      ctx.rotate(crashPhase * 0.3);
      ctx.globalAlpha = 0.5 + Math.sin(crashPhase) * 0.3;
    }

    const scale = jumpH > 0 ? 1 + jumpH * 0.015 : 1;
    ctx.scale(scale, scale);

    ctx.fillStyle = '#222';
    ctx.fillRect(-1, 5, 2, 3);
    ctx.fillRect(-1, -7, 2, 2);

    ctx.fillStyle = moto.color;
    ctx.fillRect(-3, -5, 6, 10);

    ctx.fillStyle = '#DDD';
    ctx.fillRect(-1, -8, 2, 2);

    ctx.fillStyle = '#333';
    ctx.fillRect(-4, -2, 1, 5);
    ctx.fillRect(3, -2, 1, 5);

    if (moto.isPlayer) {
      ctx.fillStyle = '#FFF';
      ctx.fillRect(-1, -1, 2, 1);
    }

    if (moto.speedBoost > 0) {
      ctx.fillStyle = '#FF4020';
      const flameLen = 3 + Math.random() * 4;
      ctx.fillRect(-2, 7, 4, flameLen);
      ctx.fillStyle = '#FFD020';
      ctx.fillRect(-1, 7, 2, flameLen - 2);
    }

    if (moto.washboardShake > 0) {
      ctx.translate((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2);
    }

    ctx.restore();

    if (moto.crashed) {
      ctx.save();
      const cx = sx + Math.sin(this.frameCount * 0.3) * 3;
      const cy = sy + Math.cos(this.frameCount * 0.2) * 2;
      ctx.fillStyle = '#FFC890';
      ctx.fillRect(cx - 2, cy - 3, 4, 5);
      ctx.fillStyle = '#E08050';
      ctx.fillRect(cx - 1, cy - 4, 2, 1);
      ctx.restore();
    }
  }

  addDustParticle(x: number, y: number, intensity: number) {
    if (this.particles.length > 300) return;
    const count = Math.floor(intensity * 1.5);
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5 - 0.5,
        life: 15 + Math.random() * 25,
        maxLife: 40,
        color: ['#C0A060', '#A08040', '#806020', '#B09050'][Math.floor(Math.random() * 4)],
        size: 1 + Math.random() * 2,
      });
    }
  }

  addCrashParticles(x: number, y: number) {
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        life: 25 + Math.random() * 25,
        maxLife: 50,
        color: ['#FFC890', '#E08050', '#C0A060', '#806020', '#FF4040'][Math.floor(Math.random() * 5)],
        size: 1 + Math.random() * 3,
      });
    }
  }

  addLandingParticles(x: number, y: number) {
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4 - 1,
        life: 12 + Math.random() * 18,
        maxLife: 30,
        color: ['#C0A060', '#A08040', '#806020'][Math.floor(Math.random() * 3)],
        size: 2 + Math.random() * 2,
      });
    }
  }

  addBoostParticles(x: number, y: number) {
    if (this.particles.length > 300) return;
    this.particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      life: 8 + Math.random() * 8,
      maxLife: 16,
      color: Math.random() > 0.5 ? '#FF4020' : '#FFD020',
      size: 1 + Math.random(),
    });
  }

  updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  drawParticles() {
    const ctx = this.bufCtx;
    for (const p of this.particles) {
      const [sx, sy] = this.worldToScreen(p.x, p.y);
      if (sx < -5 || sx > CANVAS_W + 5 || sy < -5 || sy > CANVAS_H + 5) continue;
      ctx.globalAlpha = clamp(p.life / p.maxLife, 0, 0.8);
      ctx.fillStyle = p.color;
      ctx.fillRect(sx - p.size / 2, sy - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  drawHUD(motos: MotoState[], playerIdx: number, raceTime: number, gameState: GameState) {
    const ctx = this.bufCtx;
    const player = motos[playerIdx];
    if (!player) return;

    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(0, 0, CANVAS_W, 20);

    const sorted = [...motos].sort((a, b) => b.distance - a.distance);
    const playerPos = sorted.indexOf(player) + 1;
    const posColors = ['#FFD700', '#C0C0C0', '#CD7F32', '#888', '#888', '#888'];
    ctx.fillStyle = posColors[Math.min(playerPos - 1, 5)];
    ctx.font = 'bold 12px monospace';
    const posTexts = ['1ST', '2ND', '3RD', '4TH', '5TH', '6TH'];
    ctx.fillText(posTexts[playerPos - 1] || `${playerPos}`, 5, 15);

    const speedPct = clamp(Math.abs(player.speed) / 3.2, 0, 1);
    ctx.fillStyle = '#222';
    ctx.fillRect(55, 3, 90, 14);
    const barColor = speedPct > 0.8 ? '#FF3030' : speedPct > 0.5 ? '#FFD030' : '#30FF30';
    ctx.fillStyle = barColor;
    ctx.fillRect(56, 4, 88 * speedPct, 12);
    ctx.fillStyle = '#FFF';
    ctx.font = '10px monospace';
    ctx.fillText(`${Math.floor(speedPct * 200)} km/h`, 58, 15);

    const progress = clamp(player.distance / (TRACK_TOTAL_SEGMENTS * 16), 0, 1);
    ctx.fillStyle = '#222';
    ctx.fillRect(155, 3, 110, 14);
    ctx.fillStyle = '#4080FF';
    ctx.fillRect(156, 4, 108 * progress, 12);
    ctx.fillStyle = '#FFF';
    ctx.fillText(`${Math.floor(progress * 100)}%`, 158, 15);

    const totalFrames = Math.floor(raceTime);
    const secs = Math.floor(totalFrames / 60);
    const frames = totalFrames % 60;
    ctx.fillStyle = '#FFF';
    ctx.font = '11px monospace';
    ctx.fillText(`${secs}.${frames.toString().padStart(2, '0')}s`, 280, 15);

    if (player.damage > 0) {
      ctx.fillStyle = '#222';
      ctx.fillRect(350, 3, 60, 14);
      const dmgColor = player.damage > 60 ? '#FF2020' : player.damage > 30 ? '#FF8020' : '#30C030';
      ctx.fillStyle = dmgColor;
      ctx.fillRect(351, 4, 58 * (player.damage / 100), 12);
      ctx.fillStyle = '#CCC';
      ctx.font = '8px monospace';
      ctx.fillText('DAMAGE', 352, 15);
    }

    if (player.speedBoost > 0) {
      ctx.fillStyle = '#FF4020';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('🔥 BOOST!', 420, 15);
    }

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(CANVAS_W - 70, CANVAS_H - 70, 66, 62);
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    ctx.strokeRect(CANVAS_W - 70, CANVAS_H - 70, 66, 62);

    for (let i = 0; i < Math.min(sorted.length, 6); i++) {
      const m = sorted[i];
      ctx.fillStyle = m === player ? '#FFD700' : m.color;
      ctx.fillRect(CANVAS_W - 65, CANVAS_H - 64 + i * 10, 6, 6);
      ctx.fillStyle = m === player ? '#FFD700' : '#AAA';
      ctx.font = '8px monospace';
      ctx.fillText(`${i + 1}`, CANVAS_W - 55, CANVAS_H - 58 + i * 10);
    }

    if (player.crashed) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FF2020';
      ctx.font = 'bold 22px monospace';
      ctx.fillText('💥 CRASH!', CANVAS_W / 2, CANVAS_H / 2 - 10);
      const recovery = Math.ceil(player.crashTimer / 60);
      ctx.fillStyle = '#FFF';
      ctx.font = '14px monospace';
      ctx.fillText(`恢复中... ${recovery}`, CANVAS_W / 2, CANVAS_H / 2 + 15);
      ctx.restore();
    }

    if (!player.onGround && player.height > 2) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`✈ AIR ${Math.floor(player.height)}ft`, CANVAS_W / 2, CANVAS_H - 25);
      ctx.restore();
    }
  }

  drawTitle(selectedTheme: TrackTheme) {
    const ctx = this.bufCtx;
    ctx.fillStyle = '#0a0a1e';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    for (let i = 0; i < 50; i++) {
      const sx = (i * 47 + this.frameCount * 0.3) % CANVAS_W;
      const sy = (i * 29 + this.frameCount * 0.2) % CANVAS_H;
      ctx.fillStyle = `rgba(255,200,60,${0.1 + Math.sin(this.frameCount * 0.02 + i) * 0.1})`;
      ctx.fillRect(sx, sy, 3, 3);
    }

    ctx.save();
    ctx.textAlign = 'center';

    const titleY = 60 + Math.sin(this.frameCount * 0.03) * 3;
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 32px monospace';
    ctx.fillText('越野摩托', CANVAS_W / 2, titleY);

    ctx.fillStyle = '#C0A060';
    ctx.font = '12px monospace';
    ctx.fillText('🚵 OFF-ROAD MOTO', CANVAS_W / 2, titleY + 25);

    const themes = [TrackTheme.GRASSLAND, TrackTheme.DESERT, TrackTheme.SNOW];
    const themeDescs = ['松软泥地 摩擦力小', '沙地阻力 加速较慢', '极滑路面 需反打方向'];
    const themeIcons = ['🌿', '🏜', '❄'];

    for (let i = 0; i < themes.length; i++) {
      const y = 130 + i * 45;
      const isSelected = themes[i] === selectedTheme;

      if (isSelected) {
        ctx.fillStyle = 'rgba(255,215,0,0.18)';
        ctx.fillRect(CANVAS_W / 2 - 140, y - 20, 280, 35);
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeRect(CANVAS_W / 2 - 140, y - 20, 280, 35);
      }

      ctx.fillStyle = isSelected ? '#FFD700' : '#777';
      ctx.font = isSelected ? 'bold 18px monospace' : '14px monospace';
      ctx.fillText(`${isSelected ? '► ' : '  '} ${themeIcons[i]} ${THEME_NAME[themes[i]]}`, CANVAS_W / 2, y);

      ctx.fillStyle = isSelected ? '#CCC' : '#555';
      ctx.font = '10px monospace';
      ctx.fillText(themeDescs[i], CANVAS_W / 2, y + 18);
    }

    ctx.fillStyle = '#999';
    ctx.font = '12px monospace';
    ctx.fillText('↑↓ 选择赛道   SPACE/ENTER 开始游戏', CANVAS_W / 2, 275);

    ctx.fillStyle = '#666';
    ctx.font = '10px monospace';
    ctx.fillText('🎮 ↑加速  ↓刹车  ←→转向', CANVAS_W / 2, 305);
    ctx.fillText('🎮 Q前倾  E后仰(空中调整姿态)', CANVAS_W / 2, 320);
    ctx.fillText('🚀 踩土坡起飞 调整姿态安全着陆', CANVAS_W / 2, 335);

    ctx.fillStyle = '#444';
    ctx.font = '9px monospace';
    ctx.fillText('v1.0', CANVAS_W / 2, 355);

    ctx.restore();
  }

  drawCountdown(count: number) {
    const ctx = this.bufCtx;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (count > 0) {
      const sec = Math.ceil(count);
      const scale = 1 + (count % 1) * 0.4;
      ctx.fillStyle = sec <= 1 ? '#FF4040' : '#FFD700';
      ctx.font = `bold ${Math.floor(60 * scale)}px monospace`;
      ctx.fillText(`${sec}`, CANVAS_W / 2, CANVAS_H / 2);
    } else {
      ctx.fillStyle = '#40FF40';
      ctx.font = 'bold 56px monospace';
      ctx.fillText('GO!', CANVAS_W / 2, CANVAS_H / 2);
    }

    ctx.restore();
  }

  drawFinish(motos: MotoState[], playerIdx: number, raceTime: number) {
    const ctx = this.bufCtx;

    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    const sorted = [...motos].sort((a, b) => {
      if (a.finished && b.finished) return a.finishTime - b.finishTime;
      if (a.finished) return -1;
      if (b.finished) return 1;
      return b.distance - a.distance;
    });
    const playerPos = sorted.indexOf(motos[playerIdx]) + 1;

    ctx.save();
    ctx.textAlign = 'center';

    if (playerPos === 1) {
      const flash = Math.sin(this.frameCount * 0.12) > 0;
      ctx.fillStyle = flash ? '#FFD700' : '#FFA000';
      ctx.font = 'bold 36px monospace';
      ctx.fillText('🏆 胜利!', CANVAS_W / 2, 55);
    } else {
      ctx.fillStyle = '#CCC';
      ctx.font = 'bold 28px monospace';
      ctx.fillText('比赛结束', CANVAS_W / 2, 55);
      ctx.fillStyle = '#FFD700';
      ctx.font = '20px monospace';
      ctx.fillText(`第 ${playerPos} 名`, CANVAS_W / 2, 85);
    }

    ctx.fillStyle = '#FFF';
    ctx.font = '14px monospace';
    ctx.fillText('━━━━━━ 排名榜 ━━━━━━', CANVAS_W / 2, 125);

    const medals = ['🥇', '🥈', '🥉', '  ', '  ', '  '];
    for (let i = 0; i < sorted.length; i++) {
      const m = sorted[i];
      const y = 155 + i * 28;
      const isPlayer = m === motos[playerIdx];

      if (isPlayer) {
        ctx.fillStyle = 'rgba(255,215,0,0.2)';
        ctx.fillRect(CANVAS_W / 2 - 200, y - 18, 400, 25);
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeRect(CANVAS_W / 2 - 200, y - 18, 400, 25);
      }

      ctx.fillStyle = isPlayer ? '#FFD700' : '#CCC';
      ctx.font = `${isPlayer ? 'bold ' : ''}16px monospace`;
      const posStr = `${medals[i]}${i + 1}. ${m.name}`;
      ctx.textAlign = 'left';
      ctx.fillText(posStr, CANVAS_W / 2 - 180, y);

      ctx.textAlign = 'right';
      if (m.finished && m.finishTime > 0) {
        const secs = Math.floor(m.finishTime / 60);
        const frames = Math.floor(m.finishTime % 60);
        ctx.fillText(`${secs}.${frames.toString().padStart(2, '0')}s`, CANVAS_W / 2 + 180, y);
      } else {
        ctx.fillStyle = '#666';
        ctx.fillText('未完成', CANVAS_W / 2 + 180, y);
      }
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#888';
    ctx.font = '12px monospace';
    ctx.fillText('按 SPACE / ENTER 返回主菜单', CANVAS_W / 2, CANVAS_H - 25);

    ctx.restore();
  }

  private lastScale = 0;

  endFrame() {
    this.ctx.imageSmoothingEnabled = false;
    const scaleX = Math.floor(window.innerWidth / CANVAS_W);
    const scaleY = Math.floor(window.innerHeight / CANVAS_H);
    const scale = Math.max(1, Math.min(scaleX, scaleY));
    if (scale !== this.lastScale) {
      this.ctx.canvas.width = CANVAS_W * scale;
      this.ctx.canvas.height = CANVAS_H * scale;
      this.lastScale = scale;
    }
    this.ctx.drawImage(this.buffer, 0, 0, CANVAS_W, CANVAS_H, 0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }
}

const CRASH_RECOVERY_TIME = 90;
