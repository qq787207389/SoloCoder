import { GameState, Property } from '../types';
import { buyProperty, buildHouse, buyStock, sellStock, mortgageProperty, takeLoan, useSkill, endTurn, rollDice, movePlayer, triggerCellEffect } from './gameLogic';

function getBestPropertyToBuy(state: GameState): string | null {
  const player = state.players[state.currentPlayerIndex];
  if (!player) return null;
  
  // 只能购买当前位置的地皮
  const currentCell = state.cells[player.position];
  if (!currentCell?.data || currentCell.data.ownerId || currentCell.data.price > player.money) {
    return null;
  }
  
  // 只有地皮才能购买
  if (currentCell.data.type !== 'property') {
    return null;
  }
  
  return currentCell.id;
}

function getBestPropertyToBuild(state: GameState): string | null {
  const player = state.players[state.currentPlayerIndex];
  if (!player) return null;
  
  let bestProperty = null;
  let bestROI = -Infinity;
  
  player.ownedProperties.forEach(propId => {
    const cell = state.cells.find(c => c.id === propId);
    if (!cell || !cell.data || cell.data.type !== 'property') return;
    
    const prop = cell.data as Property;
    if (prop.buildingLevel === 'landmark') return;
    if (prop.isMortgaged) return;
    
    const sameColorProps = state.cells.filter(
      c => c.data?.type === 'property' && (c.data as Property).colorGroup === prop.colorGroup
    );
    
    const allOwned = sameColorProps.every(c => c.data?.ownerId === player.id);
    if (!allOwned) return;
    
    const buildingCost = player.character.id === 'architect' ? Math.floor(prop.buildingCost / 2) : prop.buildingCost;
    if (player.money < buildingCost) return;
    
    const level = prop.buildingLevel as string | number;
    const currentLevel = (level === 'landmark') ? 5 : (level as number);
    const nextLevel = currentLevel === 4 ? 5 : currentLevel + 1;
    const rentIncrease = prop.rent[nextLevel] - prop.rent[currentLevel];
    const roi = rentIncrease / buildingCost;
    
    if (roi > bestROI) {
      bestROI = roi;
      bestProperty = propId;
    }
  });
  
  return bestProperty;
}

function getBestStockToBuy(state: GameState): { propertyId: string; quantity: number } | null {
  const player = state.players[state.currentPlayerIndex];
  if (!player) return null;
  
  let bestStock = null;
  let bestPotential = -Infinity;
  
  Object.entries(state.stocks).forEach(([propertyId, stock]) => {
    const cell = state.cells.find(c => c.id === propertyId);
    if (!cell?.data) return;
    
    const data = cell.data;
    let potential = 0;
    
    if (data.type === 'property') {
      const prop = data as Property;
      if ((prop.buildingLevel as number) > 0) {
        potential += 0.1;
      }
      if (prop.ownerId) {
        potential += 0.05;
      }
    }
    
    const priceHistory = stock.priceHistory;
    if (priceHistory.length > 1) {
      const recentChange = (stock.currentPrice - priceHistory[priceHistory.length - 2]) / priceHistory[priceHistory.length - 2];
      potential += recentChange * 0.5;
    }
    
    potential -= stock.currentPrice / stock.basePrice - 1;
    
    if (potential > bestPotential && player.money >= stock.currentPrice) {
      bestPotential = potential;
      bestStock = propertyId;
    }
  });
  
  if (!bestStock) return null;
  
  const stock = state.stocks[bestStock];
  const quantity = Math.floor(player.money / (2 * stock.currentPrice));
  
  return quantity > 0 ? { propertyId: bestStock, quantity } : null;
}

function getBestStockToSell(state: GameState): { propertyId: string; quantity: number } | null {
  const player = state.players[state.currentPlayerIndex];
  if (!player) return null;
  
  let worstStock = null;
  let worstPotential = Infinity;
  
  Object.entries(player.stocks).forEach(([propertyId, quantity]) => {
    if (quantity === 0) return;
    
    const stock = state.stocks[propertyId];
    let potential = 0;
    
    const priceHistory = stock.priceHistory;
    if (priceHistory.length > 1) {
      const recentChange = (stock.currentPrice - priceHistory[priceHistory.length - 2]) / priceHistory[priceHistory.length - 2];
      potential += recentChange;
    }
    
    const profit = (stock.currentPrice - stock.basePrice) / stock.basePrice;
    if (profit > 0.3) {
      potential -= 0.5;
    }
    
    if (potential < worstPotential) {
      worstPotential = potential;
      worstStock = propertyId;
    }
  });
  
  if (!worstStock) return null;
  
  return { propertyId: worstStock, quantity: player.stocks[worstStock] };
}

export async function aiTurn(state: GameState): Promise<GameState> {
  const player = state.players[state.currentPlayerIndex];
  if (!player || !player.isAI) return state;
  
  let newState = state;
  
  if (player.isInJail) {
    if (player.jailTurns >= 3 || Math.random() < 0.5) {
      newState = {
        ...newState,
        players: newState.players.map(p => 
          p.id === player.id ? { ...p, isInJail: false, jailTurns: 0 } : p
        ),
      };
    } else {
      return endTurn(newState);
    }
  }
  
  const dice = rollDice();
  newState = { ...newState, dice, phase: 'rolling' };
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  newState = movePlayer(newState, player.id, dice[0] + dice[1]);
  newState = { ...newState, phase: 'moving' };
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  newState = triggerCellEffect(newState, player.id);
  newState = { ...newState, phase: 'triggering' };
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (player.money < 200 && player.loans < 1000) {
    const loanAmount = Math.min(500, 1000 - player.loans);
    newState = takeLoan(newState, player.id, loanAmount);
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  const bestProperty = getBestPropertyToBuy(newState);
  if (bestProperty) {
    newState = buyProperty(newState, player.id, bestProperty);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  const bestBuild = getBestPropertyToBuild(newState);
  if (bestBuild) {
    newState = buildHouse(newState, player.id, bestBuild);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  if (player.money > 500) {
    const bestStockBuy = getBestStockToBuy(newState);
    if (bestStockBuy) {
      newState = buyStock(newState, player.id, bestStockBuy.propertyId, bestStockBuy.quantity);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  
  const bestStockSell = getBestStockToSell(newState);
  if (bestStockSell) {
    newState = sellStock(newState, player.id, bestStockSell.propertyId, bestStockSell.quantity);
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  if (player.skillCooldown === 0 && Math.random() < 0.3) {
    newState = useSkill(newState, player.id);
  }
  
  if (player.money < 100 && player.mortgagedProperties.length === 0) {
    const unmortgagedProps = player.ownedProperties.filter(id => {
      const cell = newState.cells.find(c => c.id === id);
      return cell?.data && !cell.data.isMortgaged;
    });
    
    if (unmortgagedProps.length > 0) {
      newState = mortgageProperty(newState, player.id, unmortgagedProps[0]);
    }
  }
  
  return endTurn(newState);
}
