import { fbm, valueNoise2D } from "./rng";
import { Island, WorldState } from "./types";

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  camX: number;
  camY: number;
  scale: number;
  time: number;
}

export function render(ctx: CanvasRenderingContext2D, w: WorldState, width: number, height: number, t: number) {
  const scale = 1;
  const camX = w.ship.x;
  const camY = w.ship.y;
  const rc: RenderContext = { ctx, width, height, camX, camY, scale, time: t };

  drawOcean(rc, w);
  drawFloats(rc, w);
  drawIslands(rc, w);
  drawWhales(rc, w);
  drawPirates(rc, w);
  drawShip(rc, w);
  drawWeatherOverlay(rc, w);
  drawSunOverlay(rc, w);
  drawMinimap(rc, w);
}

function worldToScreen(rc: RenderContext, x: number, y: number) {
  return {
    x: (x - rc.camX) * rc.scale + rc.width / 2,
    y: (y - rc.camY) * rc.scale + rc.height / 2,
  };
}

function drawOcean(rc: RenderContext, w: WorldState) {
  const { ctx, width, height, time } = rc;
  const deep = "#082f49";
  const mid = "#0e4c78";
  const foam = "#4cc9f0";
  ctx.fillStyle = deep;
  ctx.fillRect(0, 0, width, height);

  const weatherType = w.weather.type;
  const baseColor =
    weatherType === "storm" ? "#071a2e" :
    weatherType === "fog" ? "#2b4257" :
    weatherType === "rain" ? "#0a2d45" : mid;

  const gridSize = 60;
  const ox = -((w.ship.x % gridSize) + gridSize) % gridSize;
  const oy = -((w.ship.y % gridSize) + gridSize) % gridSize;

  const time2 = time * 0.001;

  ctx.save();
  for (let y = -gridSize; y < height + gridSize; y += gridSize) {
    for (let x = -gridSize; x < width + gridSize; x += gridSize) {
      const wx = (x + ox + w.ship.x);
      const wy = (y + oy + w.ship.y);
      const n = fbm(wx * 0.002 + time2 * 0.02, wy * 0.002, w.seed, 3);
      const tint = 60 + n * 60;
      ctx.fillStyle = shade(baseColor, tint - 100);
      ctx.fillRect(x, y, gridSize + 1, gridSize + 1);
    }
  }
  ctx.restore();

  const waveCount = 30;
  for (let i = 0; i < waveCount; i++) {
    const seed = i * 31.17;
    const baseX = (valueNoise2D(seed, time2 * 0.3, w.seed) - 0.5) * width * 2;
    const baseY = (valueNoise2D(time2 * 0.3, seed, w.seed + 7) - 0.5) * height * 2;
    const waveX = (baseX - w.ship.x) + width / 2;
    const waveY = (baseY - w.ship.y) + height / 2;
    const size = 18 + valueNoise2D(seed, seed, w.seed + 3) * 30;
    ctx.strokeStyle = `rgba(76,201,240,${0.15 + valueNoise2D(seed, time2, w.seed) * 0.2})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(waveX, waveY, size * (0.6 + w.weather.waveHeight * 0.6), 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = foam + "22";
  for (let i = 0; i < 40; i++) {
    const seed = i * 9.7 + Math.floor(time2 * 2);
    const x = (valueNoise2D(seed, time2, w.seed) - 0.5) * width;
    const y = (valueNoise2D(time2, seed, w.seed + 2) - 0.5) * height;
    ctx.fillRect(width / 2 + x, height / 2 + y, 2, 2);
  }
}

function shade(hex: string, pct: number): string {
  const h = hex.replace("#", "");
  const num = parseInt(h, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.max(0, Math.min(255, r + pct));
  g = Math.max(0, Math.min(255, g + pct));
  b = Math.max(0, Math.min(255, b + pct));
  return `rgb(${r},${g},${b})`;
}

function drawIslands(rc: RenderContext, w: WorldState) {
  for (const isl of w.islands) {
    const p = worldToScreen(rc, isl.x, isl.y);
    if (p.x + isl.radius < 0 || p.x - isl.radius > rc.width) continue;
    if (p.y + isl.radius < 0 || p.y - isl.radius > rc.height) continue;
    drawIsland(rc, isl, p.x, p.y);
  }
}

function drawIsland(rc: RenderContext, isl: Island, cx: number, cy: number) {
  const { ctx } = rc;
  ctx.save();
  ctx.translate(cx, cy);

  const sandColor = "#d9b382";
  const grassColor = "#4f9d69";
  const rockColor = "#5a5a5a";
  const iceColor = "#d9eeff";

  const ringR = isl.radius + 18;
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.beginPath();
  ctx.arc(0, 0, ringR, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  const segments = 36;
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    const r = isl.radius * (0.85 + valueNoise2D(Math.cos(a) * 2 + isl.seed, Math.sin(a) * 2 + isl.seed, isl.seed) * 0.3);
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();

  let fill = grassColor;
  if (isl.biome === "volcano") fill = "#3b2a2a";
  else if (isl.biome === "reef") fill = "#8bbfa6";
  else if (isl.biome === "iceberg") fill = iceColor;
  else if (isl.biome === "wreck") fill = "#474747";
  else if (isl.biome === "tower") fill = "#9a8b7c";
  else if (isl.biome === "lagoon") fill = "#5db5a5";
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = sandColor;
  ctx.lineWidth = 6;
  ctx.stroke();

  if (isl.biome === "palm") {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + isl.seed;
      const rr = isl.radius * 0.5;
      drawPalm(ctx, Math.cos(a) * rr, Math.sin(a) * rr, 14 + (i % 3) * 3);
    }
  } else if (isl.biome === "volcano") {
    ctx.fillStyle = "#1a0a0a";
    ctx.beginPath();
    ctx.moveTo(-20, -10);
    ctx.lineTo(0, -40);
    ctx.lineTo(20, -10);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ef476f";
    ctx.beginPath();
    ctx.arc(0, -40, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (isl.biome === "iceberg") {
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + isl.seed;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * isl.radius * 0.4, Math.sin(a) * isl.radius * 0.4, 12, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (isl.biome === "tower") {
    ctx.fillStyle = "#3b2f2a";
    ctx.fillRect(-6, -30, 12, 30);
    ctx.fillStyle = "#6c5a4d";
    ctx.fillRect(-12, -36, 24, 6);
  } else if (isl.biome === "wreck") {
    ctx.strokeStyle = "#2a2a2a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-25, 5);
    ctx.lineTo(25, 10);
    ctx.moveTo(-20, -5);
    ctx.lineTo(20, 0);
    ctx.stroke();
  } else if (isl.biome === "reef") {
    ctx.fillStyle = "#ff8c42";
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + isl.seed;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * isl.radius * 0.6, Math.sin(a) * isl.radius * 0.6, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (isl.hasClue) {
    ctx.fillStyle = "#ffd166";
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawPalm(ctx: CanvasRenderingContext2D, x: number, y: number, h: number) {
  ctx.strokeStyle = "#6b4a2b";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - 2, y - h);
  ctx.stroke();
  ctx.fillStyle = "#4f9d69";
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(x + Math.cos(a) * 6 - 2, y - h + Math.sin(a) * 3, 8, 3, a, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawShip(rc: RenderContext, w: WorldState) {
  const { ctx } = rc;
  const { x, y } = worldToScreen(rc, w.ship.x, w.ship.y);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(w.ship.heading);

  const hullColor = w.ship.upgrades.hull_plate ? "#707070" : "#8b5a2b";
  ctx.fillStyle = hullColor;
  ctx.beginPath();
  ctx.moveTo(28, 0);
  ctx.lineTo(10, -12);
  ctx.lineTo(-22, -14);
  ctx.lineTo(-22, 14);
  ctx.lineTo(10, 12);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#2a1810";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  if (w.ship.upgrades.mast && w.ship.sail > 0.1) {
    ctx.fillStyle = "#f5e9c8";
    ctx.beginPath();
    ctx.moveTo(0, -2);
    ctx.lineTo(0, -30 * w.ship.sail);
    ctx.lineTo(20 * w.ship.sail, -2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#8a7a3a";
    ctx.stroke();
  }

  if (w.ship.upgrades.engine) {
    ctx.fillStyle = "#333";
    ctx.fillRect(-26, -5, 6, 10);
  }
  ctx.restore();

  if (w.ship.hull < w.ship.maxHull * 0.5) {
    ctx.fillStyle = "rgba(239,71,111,0.4)";
    ctx.beginPath();
    ctx.arc(x, y, 40, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFloats(rc: RenderContext, w: WorldState) {
  const { ctx } = rc;
  for (const f of w.floats) {
    const p = worldToScreen(rc, f.x, f.y);
    if (p.x < -20 || p.x > rc.width + 20 || p.y < -20 || p.y > rc.height + 20) continue;
    ctx.fillStyle = "#c78b56";
    ctx.fillRect(p.x - 3, p.y - 2, 6, 4);
  }
}

function drawWhales(rc: RenderContext, w: WorldState) {
  const { ctx } = rc;
  for (const wh of w.whales) {
    const p = worldToScreen(rc, wh.x, wh.y);
    if (p.x < -50 || p.x > rc.width + 50 || p.y < -50 || p.y > rc.height + 50) continue;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(wh.heading);
    ctx.fillStyle = "#3b4a5a";
    ctx.beginPath();
    ctx.ellipse(0, 0, 24, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-22, 0);
    ctx.lineTo(-32, -10);
    ctx.lineTo(-32, 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function drawPirates(rc: RenderContext, w: WorldState) {
  const { ctx } = rc;
  for (const p of w.pirates) {
    const sp = worldToScreen(rc, p.x, p.y);
    if (sp.x < -50 || sp.x > rc.width + 50 || sp.y < -50 || sp.y > rc.height + 50) continue;
    ctx.save();
    ctx.translate(sp.x, sp.y);
    ctx.rotate(p.heading);
    ctx.fillStyle = "#2a2a2a";
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(6, -10);
    ctx.lineTo(-16, -12);
    ctx.lineTo(-16, 12);
    ctx.lineTo(6, 10);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#7a1a1a";
    ctx.fillRect(-6, -16, 3, 16);
    ctx.fillRect(-6, -16, 10, 6);
    ctx.restore();
  }
}

function drawWeatherOverlay(rc: RenderContext, w: WorldState) {
  const { ctx, width, height, time } = rc;
  if (w.weather.type === "rain" || w.weather.type === "storm") {
    const intensity = w.weather.type === "storm" ? 200 : 120;
    ctx.strokeStyle = "rgba(180,220,255,0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < intensity; i++) {
      const x = (Math.sin(i * 12.9898 + time * 0.001) * 43758.5453 % 1 + 1) % 1 * width;
      const y = (Math.cos(i * 78.233 + time * 0.0008) * 43758.5453 % 1 + 1) % 1 * height;
      ctx.moveTo(x, y);
      ctx.lineTo(x - 6, y + 14);
    }
    ctx.stroke();
  }
  if (w.weather.fogDensity > 0.01) {
    ctx.fillStyle = `rgba(200,215,225,${w.weather.fogDensity * 0.7})`;
    ctx.fillRect(0, 0, width, height);
  }
}

function drawSunOverlay(rc: RenderContext, w: WorldState) {
  const { ctx, width, height } = rc;
  const t = w.timeOfDay;
  let overlay = "rgba(0,0,0,0)";
  if (t < 0.2) overlay = `rgba(5,10,40,${(0.2 - t) * 3})`;
  else if (t > 0.8) overlay = `rgba(30,10,10,${(t - 0.8) * 3})`;
  else if (t > 0.65) overlay = `rgba(255,140,66,${(t - 0.65) * 0.6})`;
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, width, height);
}

function drawMinimap(rc: RenderContext, w: WorldState) {
  const { ctx } = rc;
  const size = 180;
  const x = rc.width - size - 20;
  const y = 20;
  ctx.save();
  ctx.fillStyle = "rgba(10,30,50,0.6)";
  ctx.fillRect(x, y, size, size);
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.strokeRect(x, y, size, size);
  const range = 3500;
  const cx = x + size / 2;
  const cy = y + size / 2;
  for (const isl of w.islands) {
    if (!isl.discovered) continue;
    const dx = isl.x - w.ship.x;
    const dy = isl.y - w.ship.y;
    const mx = cx + (dx / range) * (size / 2);
    const my = cy + (dy / range) * (size / 2);
    if (mx < x || mx > x + size || my < y || my > y + size) continue;
    let c = "#9ad5a5";
    if (isl.biome === "volcano") c = "#ef476f";
    else if (isl.biome === "iceberg") c = "#d9eeff";
    else if (isl.biome === "wreck") c = "#888";
    else if (isl.biome === "tower") c = "#ffd166";
    ctx.fillStyle = c;
    ctx.fillRect(mx - 2, my - 2, 4, 4);
  }
  for (const p of w.pirates) {
    const dx = p.x - w.ship.x;
    const dy = p.y - w.ship.y;
    const mx = cx + (dx / range) * (size / 2);
    const my = cy + (dy / range) * (size / 2);
    if (mx < x || mx > x + size || my < y || my > y + size) continue;
    ctx.fillStyle = "#ef476f";
    ctx.fillRect(mx - 2, my - 2, 4, 4);
  }
  if (w.rescueSignal) {
    const dx = w.rescueX - w.ship.x;
    const dy = w.rescueY - w.ship.y;
    const mx = cx + (dx / range) * (size / 2);
    const my = cy + (dy / range) * (size / 2);
    ctx.strokeStyle = "#ffd166";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(mx, my, 6, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = "#4cc9f0";
  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
