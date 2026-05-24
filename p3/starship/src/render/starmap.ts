import type { GameState, Planet } from '../types';
import { getCurrentPlanet, getDistance } from '../game/gameState';
export function renderStarmap(ctx: CanvasRenderingContext2D, gameState: GameState, width: number, height: number) {
 ctx.fillStyle = '#0a0a1a';
 ctx.fillRect(0, 0, width, height);
 drawStarfield(ctx, width, height);
 const currentPlanet = getCurrentPlanet(gameState);
 if (gameState.fleet.targetPlanetId) {
 const targetPlanet = gameState.planets.find(p => p.id === gameState.fleet.targetPlanetId);
 if (currentPlanet && targetPlanet) {
 const progress = gameState.fleet.travelProgress;
 const startX = currentPlanet.x;
 const startY = currentPlanet.y;
 const endX = targetPlanet.x;
 const endY = targetPlanet.y;
 ctx.strokeStyle = 'rgba(100, 200, 255, 0.5)';
 ctx.lineWidth = 2;
 ctx.setLineDash([5, 5]);
 ctx.beginPath();
 ctx.moveTo(startX, startY);
 ctx.lineTo(endX, endY);
 ctx.stroke();
 ctx.setLineDash([]);
 const shipX = startX + (endX - startX) * progress;
 const shipY = startY + (endY - startY) * progress;
 drawSpaceship(ctx, shipX, shipY, Math.atan2(endY - startY, endX - startX));
 }
 }
 else {
 gameState.planets.forEach(planet => {
 if (planet.id !== gameState.fleet.currentPlanetId) {
 const dist = currentPlanet ? getDistance(currentPlanet, planet) : 0;
 const isNearby = dist < 250;
 ctx.strokeStyle = isNearby ? 'rgba(100, 150, 100, 0.3)' : 'rgba(80, 80, 100, 0.15)';
 ctx.lineWidth = 1;
 ctx.setLineDash([3, 3]);
 ctx.beginPath();
 ctx.moveTo(currentPlanet?.x || 0, currentPlanet?.y || 0);
 ctx.lineTo(planet.x, planet.y);
 ctx.stroke();
 ctx.setLineDash([]);
 }
 });
 }
 gameState.planets.forEach(planet => {
 const isCurrent = planet.id === gameState.fleet.currentPlanetId;
 drawPlanet(ctx, planet, isCurrent);
 });
 if (currentPlanet && !gameState.fleet.targetPlanetId) {
 drawSpaceship(ctx, currentPlanet.x - 30, currentPlanet.y - 30, 0);
 }
}
function drawStarfield(ctx: CanvasRenderingContext2D, width: number, height: number) {
 ctx.fillStyle = 'white';
 for (let i = 0; i < 200; i++) {
 const x = (i * 7919) % width;
 const y = (i * 6271) % height;
 const size = ((i * 17) % 3) * 0.5 + 0.5;
 const opacity = ((i * 31) % 100) / 100 * 0.5 + 0.3;
 ctx.globalAlpha = opacity;
 ctx.beginPath();
 ctx.arc(x, y, size, 0, Math.PI * 2);
 ctx.fill();
 }
 ctx.globalAlpha = 1;
}
function drawPlanet(ctx: CanvasRenderingContext2D, planet: Planet, isCurrent: boolean) {
 const gradient = ctx.createRadialGradient(planet.x, planet.y, 0, planet.x, planet.y, planet.size * 2);
 gradient.addColorStop(0, planet.color + '80');
 gradient.addColorStop(0.5, planet.color + '40');
 gradient.addColorStop(1, 'transparent');
 ctx.fillStyle = gradient;
 ctx.beginPath();
 ctx.arc(planet.x, planet.y, planet.size * 2, 0, Math.PI * 2);
 ctx.fill();
 ctx.fillStyle = planet.color;
 ctx.beginPath();
 ctx.arc(planet.x, planet.y, planet.size, 0, Math.PI * 2);
 ctx.fill();
 const highlightGradient = ctx.createRadialGradient(planet.x - planet.size * 0.3, planet.y - planet.size * 0.3, 0, planet.x, planet.y, planet.size);
 highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
 highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
 highlightGradient.addColorStop(1, 'transparent');
 ctx.fillStyle = highlightGradient;
 ctx.beginPath();
 ctx.arc(planet.x, planet.y, planet.size, 0, Math.PI * 2);
 ctx.fill();
 if (isCurrent) {
 ctx.strokeStyle = '#fbbf24';
 ctx.lineWidth = 3;
 ctx.beginPath();
 ctx.arc(planet.x, planet.y, planet.size + 8, 0, Math.PI * 2);
 ctx.stroke();
 }
 if (planet.activeEvents.length > 0) {
 ctx.fillStyle = '#ef4444';
 ctx.font = '16px sans-serif';
 ctx.textAlign = 'center';
 ctx.fillText('⚠️', planet.x + planet.size, planet.y - planet.size);
 }
 ctx.fillStyle = isCurrent ? '#fbbf24' : '#e2e8f0';
 ctx.font = 'bold 12px sans-serif';
 ctx.textAlign = 'center';
 ctx.fillText(planet.name, planet.x, planet.y + planet.size + 18);
 const typeLabels: Record<string, string> = {
 agricultural: '🌾 农业',
 mining: '⛏️ 矿业',
 tech: '🔬 科技',
 industrial: '🏭 工业',
 trade: '🏪 贸易'
 };
 ctx.fillStyle = '#94a3b8';
 ctx.font = '10px sans-serif';
 ctx.fillText(typeLabels[planet.type] || '', planet.x, planet.y + planet.size + 32);
}
function drawSpaceship(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) {
 ctx.save();
 ctx.translate(x, y);
 ctx.rotate(angle);
 ctx.fillStyle = '#64748b';
 ctx.beginPath();
 ctx.moveTo(15, 0);
 ctx.lineTo(-10, -8);
 ctx.lineTo(-5, 0);
 ctx.lineTo(-10, 8);
 ctx.closePath();
 ctx.fill();
 ctx.fillStyle = '#38bdf8';
 ctx.beginPath();
 ctx.moveTo(-5, 0);
 ctx.lineTo(-12, -4);
 ctx.lineTo(-12, 4);
 ctx.closePath();
 ctx.fill();
 ctx.fillStyle = '#60a5fa';
 ctx.beginPath();
 ctx.arc(5, 0, 4, 0, Math.PI * 2);
 ctx.fill();
 ctx.restore();
}
export function renderCombat(ctx: CanvasRenderingContext2D, gameState: GameState, width: number, height: number) {
 if (!gameState.combatState)
 return;
 const combat = gameState.combatState;
 ctx.fillStyle = '#0f0f23';
 ctx.fillRect(0, 0, width, height);
 drawStarfield(ctx, width, height);
 ctx.strokeStyle = 'rgba(100, 150, 255, 0.1)';
 ctx.lineWidth = 1;
 for (let x = 0; x < width; x += 40) {
 ctx.beginPath();
 ctx.moveTo(x, 0);
 ctx.lineTo(x, height);
 ctx.stroke();
 }
 for (let y = 0; y < height; y += 40) {
 ctx.beginPath();
 ctx.moveTo(0, y);
 ctx.lineTo(width, y);
 ctx.stroke();
 }
 combat.playerUnits.forEach(unit => {
 if (unit.hp > 0) {
 drawCombatUnit(ctx, unit, true);
 }
 });
 combat.enemyUnits.forEach(unit => {
 if (unit.hp > 0) {
 drawCombatUnit(ctx, unit, false);
 }
 });
}
function drawCombatUnit(ctx: CanvasRenderingContext2D, unit: {
 id: string;
 name: string;
 hp: number;
 maxHp: number;
 shield: number;
 maxShield: number;
 isPlayer: boolean;
 x: number;
 y: number;
}, isPlayer: boolean) {
 const baseColor = isPlayer ? '#3b82f6' : '#ef4444';
 const accentColor = isPlayer ? '#60a5fa' : '#f87171';
 ctx.save();
 ctx.translate(unit.x, unit.y);
 if (isPlayer) {
 ctx.fillStyle = baseColor;
 ctx.beginPath();
 ctx.moveTo(25, 0);
 ctx.lineTo(-15, -15);
 ctx.lineTo(-5, 0);
 ctx.lineTo(-15, 15);
 ctx.closePath();
 ctx.fill();
 ctx.fillStyle = accentColor;
 ctx.beginPath();
 ctx.arc(5, 0, 6, 0, Math.PI * 2);
 ctx.fill();
 }
 else {
 ctx.fillStyle = baseColor;
 ctx.beginPath();
 ctx.moveTo(-25, 0);
 ctx.lineTo(15, -15);
 ctx.lineTo(5, 0);
 ctx.lineTo(15, 15);
 ctx.closePath();
 ctx.fill();
 ctx.fillStyle = accentColor;
 ctx.beginPath();
 ctx.arc(-5, 0, 6, 0, Math.PI * 2);
 ctx.fill();
 }
 ctx.restore();
 const barWidth = 40;
 const barHeight = 4;
 const barX = unit.x - barWidth / 2;
 const barY = unit.y - 30;
 if (unit.maxShield > 0 && unit.shield > 0) {
 ctx.fillStyle = '#1e293b';
 ctx.fillRect(barX, barY - 8, barWidth, barHeight);
 ctx.fillStyle = '#38bdf8';
 ctx.fillRect(barX, barY - 8, barWidth * (unit.shield / unit.maxShield), barHeight);
 }
 ctx.fillStyle = '#1e293b';
 ctx.fillRect(barX, barY, barWidth, barHeight);
 const hpPercent = unit.hp / unit.maxHp;
 ctx.fillStyle = hpPercent > 0.5 ? '#22c55e' : hpPercent > 0.25 ? '#eab308' : '#ef4444';
 ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);
 ctx.fillStyle = '#e2e8f0';
 ctx.font = '10px sans-serif';
 ctx.textAlign = 'center';
 ctx.fillText(unit.name, unit.x, unit.y + 25);
}
