import type { Planet, PlanetGood, GoodType, PlanetEvent } from '../types';
import { GOODS } from '../data/goods';

export function calculatePrice(planetGood: PlanetGood, events: PlanetEvent[]): number {
  let supply = planetGood.supply;
  let demand = planetGood.demand;
  for (const event of events) {
    if (event.affectedGood === planetGood.type) {
      if (event.supplyMultiplier) supply *= event.supplyMultiplier;
      if (event.demandMultiplier) demand *= event.demandMultiplier;
    }
  }
  const baseGood = GOODS[planetGood.type];
  const priceRatio = Math.max(0.3, Math.min(3, demand / supply));
  return Math.round(baseGood.basePrice * priceRatio);
}

export function updatePlanetPrices(planet: Planet): void {
  for (const good of planet.goods) {
    good.currentPrice = calculatePrice(good, planet.activeEvents);
    good.priceHistory.push(good.currentPrice);
    if (good.priceHistory.length > 10) {
      good.priceHistory.shift();
    }
  }
}

export function buyGood(planet: Planet, goodType: GoodType, quantity: number): number {
  const planetGood = planet.goods.find(g => g.type === goodType);
  if (!planetGood) return 0;
  const unitPrice = planetGood.currentPrice;
  const totalCost = unitPrice * quantity;
  planetGood.supply -= quantity;
  planetGood.demand += quantity * 0.1;
  updatePlanetPrices(planet);
  return totalCost;
}

export function sellGood(planet: Planet, goodType: GoodType, quantity: number): number {
  const planetGood = planet.goods.find(g => g.type === goodType);
  if (!planetGood) return 0;
  const unitPrice = planetGood.currentPrice;
  const totalRevenue = unitPrice * quantity;
  planetGood.supply += quantity;
  planetGood.demand -= quantity * 0.1;
  updatePlanetPrices(planet);
  return totalRevenue;
}

export function advanceDay(planets: Planet[]): void {
  for (const planet of planets) {
    planet.activeEvents = planet.activeEvents.filter(event => {
      event.remainingDays--;
      return event.remainingDays > 0;
    });
    for (const good of planet.goods) {
      const supplyChange = (Math.random() - 0.45) * 10;
      const demandChange = (Math.random() - 0.5) * 8;
      good.supply = Math.max(10, Math.min(200, good.supply + supplyChange));
      good.demand = Math.max(10, Math.min(200, good.demand + demandChange));
    }
    updatePlanetPrices(planet);
  }
}

export function getProfitMargin(planet: Planet, goodType: GoodType, buyPrice: number): number {
  const planetGood = planet.goods.find(g => g.type === goodType);
  if (!planetGood) return 0;
  return planetGood.currentPrice - buyPrice;
}

export function getPriceTrend(planetGood: PlanetGood): 'rising' | 'falling' | 'stable' {
  if (planetGood.priceHistory.length < 3) return 'stable';
  const recent = planetGood.priceHistory.slice(-3);
  const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const diff = avg - planetGood.currentPrice;
  if (Math.abs(diff) < 5) return 'stable';
  return diff > 0 ? 'falling' : 'rising';
}
