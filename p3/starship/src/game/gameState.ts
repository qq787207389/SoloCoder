import type { GameState, Planet, GoodType } from '../types';
import { generatePlanets } from '../data/planets';
import { createInitialFleet, getTravelSpeed, getCargoCapacity } from '../data/fleet';
import { buyGood, sellGood, advanceDay } from './economy';
import { generatePlanetEvent } from './events';
export function createNewGame(): GameState {
 const planets = generatePlanets();
 const startingPlanet = planets[4];
 return {
 day: 1,
 phase: 'starmap',
 planets,
 fleet: createInitialFleet(startingPlanet.id),
 messages: ['欢迎来到星际商人！点击星球开始你的贸易之旅。']
 };
}
export function getCurrentPlanet(gameState: GameState): Planet | undefined {
 return gameState.planets.find(p => p.id === gameState.fleet.currentPlanetId);
}
export function getDistance(planet1: Planet, planet2: Planet): number {
 const dx = planet1.x - planet2.x;
 const dy = planet1.y - planet2.y;
 return Math.sqrt(dx * dx + dy * dy);
}
export function getTravelDays(gameState: GameState, targetPlanetId: string): number {
 const currentPlanet = getCurrentPlanet(gameState);
 const targetPlanet = gameState.planets.find(p => p.id === targetPlanetId);
 if (!currentPlanet || !targetPlanet)
 return 0;
 const distance = getDistance(currentPlanet, targetPlanet);
 const speed = getTravelSpeed(gameState.fleet.mothership.engine.level);
 return Math.max(1, Math.ceil(distance / 100 / speed));
}
export function startTravel(gameState: GameState, targetPlanetId: string): void {
 gameState.fleet.targetPlanetId = targetPlanetId;
 gameState.fleet.travelProgress = 0;
 gameState.phase = 'traveling';
}
export function updateTravel(gameState: GameState): boolean {
 if (gameState.phase !== 'traveling' || !gameState.fleet.targetPlanetId)
 return false;
 const speed = getTravelSpeed(gameState.fleet.mothership.engine.level);
 gameState.fleet.travelProgress += speed * 0.05;
 if (gameState.fleet.travelProgress >= 1) {
 gameState.fleet.currentPlanetId = gameState.fleet.targetPlanetId;
 gameState.fleet.targetPlanetId = undefined;
 gameState.fleet.travelProgress = 0;
 gameState.phase = 'starmap';
 gameState.day++;
 advanceDay(gameState.planets);
 for (const planet of gameState.planets) {
 generatePlanetEvent(planet);
 }
 return true;
 }
 return false;
}
export function buyCargo(gameState: GameState, goodType: GoodType, quantity: number): boolean {
 const planet = getCurrentPlanet(gameState);
 if (!planet)
 return false;
 const capacity = getCargoCapacity(gameState.fleet.mothership.engine.level);
 const currentCargo = gameState.fleet.mothership.cargo.reduce((sum, item) => sum + item.quantity, 0);
 if (currentCargo + quantity > capacity)
 return false;
 const planetGood = planet.goods.find(g => g.type === goodType);
 if (!planetGood || planetGood.supply < quantity)
 return false;
 const cost = buyGood(planet, goodType, quantity);
 if (gameState.fleet.credits < cost)
 return false;
 gameState.fleet.credits -= cost;
 const existingItem = gameState.fleet.mothership.cargo.find(c => c.type === goodType);
 if (existingItem) {
 const totalQuantity = existingItem.quantity + quantity;
 const totalCost = existingItem.buyPrice * existingItem.quantity + planetGood.currentPrice * quantity;
 existingItem.buyPrice = Math.round(totalCost / totalQuantity);
 existingItem.quantity = totalQuantity;
 }
 else {
 gameState.fleet.mothership.cargo.push({
 type: goodType,
 quantity,
 buyPrice: planetGood.currentPrice
 });
 }
 gameState.messages.push(`购买了 ${quantity} 单位货物，花费 ${cost} 信用点`);
 return true;
}
export function sellCargo(gameState: GameState, goodType: GoodType, quantity: number): boolean {
 const planet = getCurrentPlanet(gameState);
 if (!planet)
 return false;
 const cargoItem = gameState.fleet.mothership.cargo.find(c => c.type === goodType);
 if (!cargoItem || cargoItem.quantity < quantity)
 return false;
 const revenue = sellGood(planet, goodType, quantity);
 gameState.fleet.credits += revenue;
 cargoItem.quantity -= quantity;
 if (cargoItem.quantity <= 0) {
 gameState.fleet.mothership.cargo = gameState.fleet.mothership.cargo.filter(c => c.type !== goodType);
 }
 const profit = revenue - cargoItem.buyPrice * quantity;
 gameState.messages.push(`出售了 ${quantity} 单位货物，获得 ${revenue} 信用点，利润 ${profit >= 0 ? '+' : ''}${profit}`);
 return true;
}
export function addMessage(gameState: GameState, message: string): void {
 gameState.messages.push(message);
 if (gameState.messages.length > 50) {
 gameState.messages = gameState.messages.slice(-50);
 }
}

