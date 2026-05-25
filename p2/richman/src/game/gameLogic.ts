import { GameState, Player, GameCell, Property, Utility, Station, BuildingLevel, Stock, ActionType } from '../types';
import { INITIAL_MONEY, generateBoard, GO_MONEY, TAX_AMOUNT, LOAN_INTEREST, MAX_LOAN, PROPERTIES, CHARACTERS, CHANCE_CARDS, FORTUNE_CARDS } from '../constants';

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createInitialState(playerNames: string[], aiCount: number): GameState {
  const players: Player[] = [];
  const usedColors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22'];
  
  for (let i = 0; i < playerNames.length; i++) {
    players.push({
      id: `player_${i}`,
      name: playerNames[i],
      color: usedColors[i % usedColors.length],
      position: 0,
      money: INITIAL_MONEY,
      isAI: false,
      character: CHARACTERS[i % CHARACTERS.length],
      skillCooldown: 0,
      ownedProperties: [],
      stocks: {},
      loans: 0,
      mortgagedProperties: [],
      getOutOfJailCards: 0,
      isInJail: false,
      jailTurns: 0,
    });
  }
  
  for (let i = 0; i < aiCount; i++) {
    const aiIndex = playerNames.length + i;
    players.push({
      id: `player_${aiIndex}`,
      name: `AI ${i + 1}`,
      color: usedColors[aiIndex % usedColors.length],
      position: 0,
      money: INITIAL_MONEY,
      isAI: true,
      character: CHARACTERS[aiIndex % CHARACTERS.length],
      skillCooldown: 0,
      ownedProperties: [],
      stocks: {},
      loans: 0,
      mortgagedProperties: [],
      getOutOfJailCards: 0,
      isInJail: false,
      jailTurns: 0,
    });
  }
  
  const cells = generateBoard();
  const stocks: Record<string, Stock> = {};
  
  PROPERTIES.forEach((prop) => {
    stocks[prop.id] = {
      propertyId: prop.id,
      basePrice: prop.price,
      currentPrice: prop.price,
      priceHistory: [prop.price],
      volume: 0,
    };
  });
  
  return {
    players,
    currentPlayerIndex: 0,
    phase: 'waiting',
    dice: [],
    cells,
    stocks,
    chanceDeck: shuffleArray([...CHANCE_CARDS]),
    fortuneDeck: shuffleArray([...FORTUNE_CARDS]),
    turn: 1,
    log: ['游戏开始！'],
    selectedCell: null,
    selectedPlayer: null,
    pendingAction: null,
    auctioningProperty: null,
    currentEvent: null,
  };
}

export function rollDice(): number[] {
  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;
  return [die1, die2];
}

export function movePlayer(state: GameState, playerId: string, steps: number): GameState {
  const playerIndex = state.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return state;
  
  const player = state.players[playerIndex];
  let newPosition = (player.position + steps) % 40;
  
  const passedGo = newPosition < player.position;
  
  const newPlayers = [...state.players];
  newPlayers[playerIndex] = { ...player, position: newPosition };
  
  let newState = { ...state, players: newPlayers };
  
  if (passedGo) {
    newState = giveMoney(newState, playerId, GO_MONEY);
    newState.log.push(`${player.name} 经过起点，获得 ${GO_MONEY} 元`);
  }
  
  return newState;
}

export function giveMoney(state: GameState, playerId: string, amount: number): GameState {
  const playerIndex = state.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return state;
  
  const newPlayers = [...state.players];
  newPlayers[playerIndex] = { ...newPlayers[playerIndex], money: newPlayers[playerIndex].money + amount };
  
  return { ...state, players: newPlayers };
}

export function takeMoney(state: GameState, playerId: string, amount: number): GameState {
  const playerIndex = state.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return state;
  
  const newPlayers = [...state.players];
  newPlayers[playerIndex] = { ...newPlayers[playerIndex], money: newPlayers[playerIndex].money - amount };
  
  return { ...state, players: newPlayers };
}

export function triggerCellEffect(state: GameState, playerId: string): GameState {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return state;
  
  const cell = state.cells[player.position];
  
  switch (cell.type) {
    case 'go':
      return state;
    
    case 'jail':
      return {
        ...state,
        players: state.players.map(p => 
          p.id === playerId ? { ...p, isInJail: true, jailTurns: 0 } : p
        ),
        log: [...state.log, `${player.name} 进入监狱`],
      };
    
    case 'tax':
      return takeMoney(state, playerId, TAX_AMOUNT);
    
    case 'chance': {
      const card = state.chanceDeck[0];
      const newDeck = state.chanceDeck.slice(1);
      newDeck.push(card);
      return { ...state, chanceDeck: newDeck, log: [...state.log, `${player.name} 抽到机会卡: ${card.title}`] };
    }
    
    case 'fortune': {
      const card = state.fortuneDeck[0];
      const newDeck = state.fortuneDeck.slice(1);
      newDeck.push(card);
      return { ...state, fortuneDeck: newDeck, log: [...state.log, `${player.name} 抽到命运卡: ${card.title}`] };
    }
    
    case 'property':
    case 'utility':
    case 'station': {
      const data = cell.data as Property | Utility | Station;
      if (!data) return state;
      
      if (!data.ownerId) {
        return { ...state, pendingAction: 'buy', selectedCell: cell.id };
      }
      
      if (data.ownerId !== playerId && !data.isMortgaged) {
        const rent = calculateRent(state, cell);
        return payRent(state, playerId, data.ownerId, rent);
      }
      
      if (data.ownerId === playerId) {
        return { ...state, pendingAction: 'build', selectedCell: cell.id };
      }
      
      return state;
    }
    
    default:
      return state;
  }
}

export function calculateRent(state: GameState, cell: GameCell): number {
  const data = cell.data;
  if (!data) return 0;
  
  if (data.type === 'property') {
    const prop = data as Property;
    const buildingLevel = prop.buildingLevel === 'landmark' ? 5 : prop.buildingLevel;
    let rent = prop.rent[buildingLevel];
    
    const sameColorProps = state.cells.filter(
      c => c.data?.type === 'property' && 
           (c.data as Property).colorGroup === prop.colorGroup && 
           (c.data as Property).ownerId === prop.ownerId
    );
    
    const allColorProps = state.cells.filter(
      c => c.data?.type === 'property' && 
           (c.data as Property).colorGroup === prop.colorGroup
    );
    
    if (sameColorProps.length === allColorProps.length) {
      rent *= 2;
    }
    
    return rent;
  }
  
  if (data.type === 'utility') {
    const util = data as Utility;
    const ownerUtilities = state.cells.filter(
      c => c.data?.type === 'utility' && c.data?.ownerId === util.ownerId
    );
    return util.baseRent * ownerUtilities.length * 10;
  }
  
  if (data.type === 'station') {
    const station = data as Station;
    const ownerStations = state.cells.filter(
      c => c.data?.type === 'station' && c.data?.ownerId === station.ownerId
    );
    return station.rentPerStation * Math.pow(2, ownerStations.length - 1);
  }
  
  return 0;
}

export function payRent(state: GameState, payerId: string, receiverId: string, amount: number): GameState {
  let newState = takeMoney(state, payerId, amount);
  newState = giveMoney(newState, receiverId, amount);
  
  const payer = state.players.find(p => p.id === payerId);
  const receiver = state.players.find(p => p.id === receiverId);
  
  const stockHolders = state.players.filter(p => p.stocks[receiverId] > 0);
  const totalStock = stockHolders.reduce((sum, p) => sum + p.stocks[receiverId], 0);
  
  if (totalStock > 0) {
    const dividendPerStock = amount * 0.1 / totalStock;
    stockHolders.forEach(holder => {
      const dividend = Math.floor(holder.stocks[receiverId] * dividendPerStock);
      newState = giveMoney(newState, holder.id, dividend);
    });
  }
  
  if (payer && receiver) {
    newState.log.push(`${payer.name} 向 ${receiver.name} 支付 ${amount} 元租金`);
  }
  
  return checkBankruptcy(newState, payerId);
}

export function checkBankruptcy(state: GameState, playerId: string): GameState {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return state;
  
  const totalAssets = player.money + 
    player.ownedProperties.reduce((sum, propId) => {
      const cell = state.cells.find(c => c.id === propId);
      return sum + (cell?.data?.type === 'property' ? (cell.data as Property).mortgageValue : 0);
    }, 0);
  
  const totalDebts = player.loans;
  
  if (totalAssets < totalDebts) {
    return {
      ...state,
      players: state.players.filter(p => p.id !== playerId),
      log: [...state.log, `${player.name} 破产了！`],
      phase: state.players.length <= 1 ? 'ended' : state.phase,
    };
  }
  
  return state;
}

export function buyProperty(state: GameState, playerId: string, cellId: string): GameState {
  const cell = state.cells.find(c => c.id === cellId);
  const player = state.players.find(p => p.id === playerId);
  
  if (!cell || !player || !cell.data) return state;
  
  const price = cell.data.price;
  if (player.money < price) return state;
  
  let newState = takeMoney(state, playerId, price);
  
  const newCells = state.cells.map(c => {
    if (c.id === cellId && c.data) {
      return { ...c, data: { ...c.data, ownerId: playerId } };
    }
    return c;
  }) as GameCell[];
  
  const newPlayers = newState.players.map(p => 
    p.id === playerId ? { ...p, ownedProperties: [...p.ownedProperties, cellId] } : p
  );
  
  return {
    ...newState,
    cells: newCells,
    players: newPlayers,
    pendingAction: null,
    selectedCell: null,
    log: [...newState.log, `${player.name} 购买了 ${cell.name}`],
  };
}

export function buildHouse(state: GameState, playerId: string, cellId: string): GameState {
  const cell = state.cells.find(c => c.id === cellId);
  const player = state.players.find(p => p.id === playerId);
  
  if (!cell || !player || !cell.data || cell.data.type !== 'property') return state;
  
  const prop = cell.data as Property;
  
  if (prop.ownerId !== playerId) return state;
  if (prop.buildingLevel === 'landmark') return state;
  
  const sameColorProps = state.cells.filter(
    c => c.data?.type === 'property' && (c.data as Property).colorGroup === prop.colorGroup
  );
  
  const allOwned = sameColorProps.every(c => c.data?.ownerId === playerId);
  if (!allOwned) return state;
  
  const buildingCost = player.character.id === 'architect' ? Math.floor(prop.buildingCost / 2) : prop.buildingCost;
  
  if (player.money < buildingCost) return state;
  
  let newLevel: BuildingLevel;
  if (prop.buildingLevel === 4) {
    newLevel = 'landmark';
  } else {
    newLevel = (prop.buildingLevel + 1) as BuildingLevel;
  }
  
  let newState = takeMoney(state, playerId, buildingCost);
  
  const newCells = state.cells.map(c => {
    if (c.id === cellId && c.data) {
      return { ...c, data: { ...c.data, buildingLevel: newLevel } };
    }
    return c;
  }) as GameCell[];
  
  const buildingText = newLevel === 'landmark' ? '地标' : `房屋等级 ${newLevel}`;
  return {
    ...newState,
    cells: newCells,
    pendingAction: null,
    selectedCell: null,
    log: [...newState.log, `${player.name} 在 ${cell.name} 建造了 ${buildingText}`],
  };
}

export function mortgageProperty(state: GameState, playerId: string, cellId: string): GameState {
  const cell = state.cells.find(c => c.id === cellId);
  const player = state.players.find(p => p.id === playerId);
  
  if (!cell || !player || !cell.data) return state;
  
  const data = cell.data;
  if (data.ownerId !== playerId) return state;
  if (data.isMortgaged) return state;
  
  if (data.type === 'property') {
    const prop = data as Property;
    if ((prop.buildingLevel as number) > 0) return state;
  }
  
  let newState = giveMoney(state, playerId, data.mortgageValue);
  
  const newCells = state.cells.map(c => {
    if (c.id === cellId && c.data) {
      return { ...c, data: { ...c.data, isMortgaged: true } };
    }
    return c;
  }) as GameCell[];
  
  const newPlayers = newState.players.map(p => 
    p.id === playerId ? { ...p, mortgagedProperties: [...p.mortgagedProperties, cellId] } : p
  );
  
  return {
    ...newState,
    cells: newCells,
    players: newPlayers,
    log: [...newState.log, `${player.name} 抵押了 ${cell.name}`],
  };
}

export function unmortgageProperty(state: GameState, playerId: string, cellId: string): GameState {
  const cell = state.cells.find(c => c.id === cellId);
  const player = state.players.find(p => p.id === playerId);
  
  if (!cell || !player || !cell.data) return state;
  
  const data = cell.data;
  if (data.ownerId !== playerId) return state;
  if (!data.isMortgaged) return state;
  
  const cost = Math.floor(data.mortgageValue * (1 + LOAN_INTEREST));
  if (player.money < cost) return state;
  
  let newState = takeMoney(state, playerId, cost);
  
  const newCells = state.cells.map(c => {
    if (c.id === cellId && c.data) {
      return { ...c, data: { ...c.data, isMortgaged: false } };
    }
    return c;
  }) as GameCell[];
  
  const newPlayers = newState.players.map(p => 
    p.id === playerId ? { ...p, mortgagedProperties: p.mortgagedProperties.filter(id => id !== cellId) } : p
  );
  
  return {
    ...newState,
    cells: newCells,
    players: newPlayers,
    log: [...newState.log, `${player.name} 赎回了 ${cell.name}`],
  };
}

export function takeLoan(state: GameState, playerId: string, amount: number): GameState {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return state;
  
  if (amount > MAX_LOAN - player.loans) return state;
  
  let newState = giveMoney(state, playerId, amount);
  
  const newPlayers = newState.players.map(p => 
    p.id === playerId ? { ...p, loans: p.loans + amount } : p
  );
  
  return {
    ...newState,
    players: newPlayers,
    log: [...newState.log, `${player.name} 贷款 ${amount} 元`],
  };
}

export function repayLoan(state: GameState, playerId: string, amount: number): GameState {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return state;
  
  if (amount > player.loans) return state;
  if (player.money < amount) return state;
  
  let newState = takeMoney(state, playerId, amount);
  
  const newPlayers = newState.players.map(p => 
    p.id === playerId ? { ...p, loans: p.loans - amount } : p
  );
  
  return {
    ...newState,
    players: newPlayers,
    log: [...newState.log, `${player.name} 偿还了 ${amount} 元贷款`],
  };
}

export function buyStock(state: GameState, playerId: string, propertyId: string, quantity: number): GameState {
  const player = state.players.find(p => p.id === playerId);
  const stock = state.stocks[propertyId];
  
  if (!player || !stock) return state;
  
  const totalCost = stock.currentPrice * quantity;
  if (player.money < totalCost) return state;
  
  let newState = takeMoney(state, playerId, totalCost);
  
  const newStocks = { ...state.stocks };
  newStocks[propertyId] = {
    ...stock,
    volume: stock.volume + quantity,
    priceHistory: [...stock.priceHistory, stock.currentPrice],
  };
  
  const newPlayers = newState.players.map(p => {
    if (p.id === playerId) {
      return { ...p, stocks: { ...p.stocks, [propertyId]: (p.stocks[propertyId] || 0) + quantity } };
    }
    return p;
  });
  
  newState = updateStockPrices(newState, propertyId);
  
  return {
    ...newState,
    stocks: newStocks,
    players: newPlayers,
    log: [...newState.log, `${player.name} 购买了 ${quantity} 股 ${propertyId} 股票`],
  };
}

export function sellStock(state: GameState, playerId: string, propertyId: string, quantity: number): GameState {
  const player = state.players.find(p => p.id === playerId);
  const stock = state.stocks[propertyId];
  
  if (!player || !stock) return state;
  if ((player.stocks[propertyId] || 0) < quantity) return state;
  
  const totalValue = stock.currentPrice * quantity;
  let newState = giveMoney(state, playerId, totalValue);
  
  const newStocks = { ...state.stocks };
  newStocks[propertyId] = {
    ...stock,
    volume: stock.volume - quantity,
    priceHistory: [...stock.priceHistory, stock.currentPrice],
  };
  
  const newPlayers = newState.players.map(p => {
    if (p.id === playerId) {
      return { ...p, stocks: { ...p.stocks, [propertyId]: p.stocks[propertyId] - quantity } };
    }
    return p;
  });
  
  newState = updateStockPrices(newState, propertyId);
  
  return {
    ...newState,
    stocks: newStocks,
    players: newPlayers,
    log: [...newState.log, `${player.name} 卖出了 ${quantity} 股 ${propertyId} 股票`],
  };
}

export function updateStockPrices(state: GameState, propertyId: string): GameState {
  const stock = state.stocks[propertyId];
  if (!stock) return state;
  
  const cell = state.cells.find(c => c.id === propertyId);
  const data = cell?.data;
  
  let priceChange = 0;
  
  if (data?.type === 'property') {
    const prop = data as Property;
    if ((prop.buildingLevel as number) > 0) {
      priceChange += 0.05;
    }
    if (prop.ownerId) {
      priceChange += 0.02;
    }
  }
  
  const volumeChange = stock.volume - (stock.priceHistory.length > 1 ? stock.priceHistory.length : 0);
  if (volumeChange > 0) {
    priceChange += volumeChange * 0.01;
  } else {
    priceChange += volumeChange * 0.005;
  }
  
  priceChange += (Math.random() - 0.5) * 0.08;
  
  const newPrice = Math.max(
    stock.basePrice * 0.5,
    Math.min(stock.basePrice * 2, stock.currentPrice * (1 + priceChange))
  );
  
  const newStocks = { ...state.stocks };
  newStocks[propertyId] = {
    ...stock,
    currentPrice: Math.floor(newPrice),
    priceHistory: [...stock.priceHistory.slice(-19), Math.floor(newPrice)],
  };
  
  return { ...state, stocks: newStocks };
}

export function useSkill(state: GameState, playerId: string): GameState {
  const player = state.players.find(p => p.id === playerId);
  if (!player || player.skillCooldown > 0) return state;
  
  const newPlayers = state.players.map(p => 
    p.id === playerId ? { ...p, skillCooldown: player.character.cooldown } : p
  );
  
  return {
    ...state,
    players: newPlayers,
    log: [...state.log, `${player.name} 使用了技能: ${player.character.skillName}`],
  };
}

export function endTurn(state: GameState): GameState {
  const newPlayers = state.players.map(p => ({
    ...p,
    skillCooldown: Math.max(0, p.skillCooldown - 1),
    jailTurns: p.isInJail ? p.jailTurns + 1 : 0,
  }));
  
  let nextPlayerIndex = (state.currentPlayerIndex + 1) % newPlayers.length;
  
  while (newPlayers[nextPlayerIndex].isInJail && newPlayers[nextPlayerIndex].jailTurns < 3) {
    nextPlayerIndex = (nextPlayerIndex + 1) % newPlayers.length;
    if (nextPlayerIndex === state.currentPlayerIndex) break;
  }
  
  return {
    ...state,
    players: newPlayers,
    currentPlayerIndex: nextPlayerIndex,
    phase: 'waiting',
    dice: [],
    pendingAction: null,
    selectedCell: null,
    turn: nextPlayerIndex === 0 ? state.turn + 1 : state.turn,
  };
}

export function getCurrentPlayer(state: GameState): Player | undefined {
  return state.players[state.currentPlayerIndex];
}

export function canPerformAction(state: GameState, action: ActionType): boolean {
  const player = getCurrentPlayer(state);
  if (!player || player.isAI) return false;
  
  switch (action) {
    case 'buy':
      return state.pendingAction === 'buy' && !!state.selectedCell;
    case 'build':
      return state.pendingAction === 'build' && !!state.selectedCell;
    case 'mortgage':
    case 'unmortgage':
      return !!state.selectedCell && player.ownedProperties.includes(state.selectedCell);
    case 'useSkill':
      return player.skillCooldown === 0;
    default:
      return false;
  }
}
