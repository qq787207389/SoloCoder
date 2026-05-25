import { Character, ChanceCard, FortuneCard, GameCell, Property, Utility, Station } from '../types';

export const INITIAL_MONEY = 1500;
export const BOARD_SIZE = 40;
export const CELL_WIDTH = 80;
export const CELL_HEIGHT = 60;
export const BOARD_PADDING = 20;

export const COLOR_GROUPS = {
  red: '#e74c3c',
  orange: '#e67e22',
  yellow: '#f1c40f',
  green: '#27ae60',
  blue: '#3498db',
  purple: '#9b59b6',
  pink: '#ff6b9d',
  brown: '#8b4513',
};

export const CHARACTERS: Character[] = [
  {
    id: 'banker',
    name: '银行家',
    description: '精通金融运作的专家',
    skillName: '利息加成',
    skillDescription: '经过银行格时获得额外50%利息',
    cooldown: 5,
    effect: () => {},
  },
  {
    id: 'architect',
    name: '建筑师',
    description: '建造大师',
    skillName: '成本减半',
    skillDescription: '盖房费用减半',
    cooldown: 4,
    effect: () => {},
  },
  {
    id: 'wanderer',
    name: '流浪者',
    description: '四海为家的旅人',
    skillName: '豁免租金',
    skillDescription: '免交一次租金',
    cooldown: 6,
    effect: () => {},
  },
  {
    id: 'gambler',
    name: '赌徒',
    description: '运气爆棚的冒险者',
    skillName: '幸运骰子',
    skillDescription: '掷骰子时有30%概率额外移动1-3格',
    cooldown: 3,
    effect: () => {},
  },
];

export const CHANCE_CARDS: ChanceCard[] = [
  {
    id: 'chance_1',
    title: '城市改造',
    description: '选定一条街道所有房屋强制升级或降级',
    duration: 1,
    effect: () => {},
  },
  {
    id: 'chance_2',
    title: '做空',
    description: '下一轮某只股票价格减半',
    duration: 1,
    effect: () => {},
  },
  {
    id: 'chance_3',
    title: '慈善晚会',
    description: '捐款100元获得一张免租金牌',
    effect: () => {},
  },
  {
    id: 'chance_4',
    title: '市场繁荣',
    description: '所有股票价格上涨20%',
    duration: 2,
    effect: () => {},
  },
  {
    id: 'chance_5',
    title: '前进三步',
    description: '向前移动3格',
    effect: () => {},
  },
  {
    id: 'chance_6',
    title: '退两步',
    description: '向后移动2格',
    effect: () => {},
  },
  {
    id: 'chance_7',
    title: '意外之财',
    description: '获得200元',
    effect: () => {},
  },
  {
    id: 'chance_8',
    title: '税务稽查',
    description: '支付150元税款',
    effect: () => {},
  },
];

export const FORTUNE_CARDS: FortuneCard[] = [
  {
    id: 'fortune_1',
    title: '遗产继承',
    description: '获得500元遗产',
    effect: () => {},
  },
  {
    id: 'fortune_2',
    title: '股票崩盘',
    description: '所有股票价格下跌30%',
    duration: 2,
    effect: () => {},
  },
  {
    id: 'fortune_3',
    title: '免费出狱',
    description: '获得一张出狱卡',
    effect: () => {},
  },
  {
    id: 'fortune_4',
    title: '租金翻倍',
    description: '下一轮所有租金收入翻倍',
    duration: 1,
    effect: () => {},
  },
  {
    id: 'fortune_5',
    title: '前往监狱',
    description: '直接前往监狱',
    effect: () => {},
  },
  {
    id: 'fortune_6',
    title: '生日祝福',
    description: '每位玩家给你50元',
    effect: () => {},
  },
  {
    id: 'fortune_7',
    title: '投资失败',
    description: '所有股票亏损10%',
    effect: () => {},
  },
  {
    id: 'fortune_8',
    title: '双倍工资',
    description: '下次经过银行获得双倍工资',
    duration: 1,
    effect: () => {},
  },
];

export const PROPERTIES: (Property | Utility | Station)[] = [
  { id: 'prop_1', name: '中山路', type: 'property', colorGroup: 'brown', color: COLOR_GROUPS.brown, price: 60, rent: [2, 10, 30, 90, 160, 250], buildingCost: 50, mortgageValue: 30, ownerId: null, buildingLevel: 0, isMortgaged: false },
  { id: 'prop_2', name: '文化路', type: 'property', colorGroup: 'brown', color: COLOR_GROUPS.brown, price: 60, rent: [4, 20, 60, 180, 320, 450], buildingCost: 50, mortgageValue: 30, ownerId: null, buildingLevel: 0, isMortgaged: false },
  
  { id: 'util_1', name: '自来水厂', type: 'utility', price: 150, baseRent: 4, mortgageValue: 75, ownerId: null, isMortgaged: false },
  
  { id: 'prop_3', name: '南京路', type: 'property', colorGroup: 'lightblue', color: '#87CEEB', price: 100, rent: [6, 30, 90, 270, 400, 550], buildingCost: 50, mortgageValue: 50, ownerId: null, buildingLevel: 0, isMortgaged: false },
  { id: 'prop_4', name: '淮海路', type: 'property', colorGroup: 'lightblue', color: '#87CEEB', price: 100, rent: [6, 30, 90, 270, 400, 550], buildingCost: 50, mortgageValue: 50, ownerId: null, buildingLevel: 0, isMortgaged: false },
  { id: 'prop_5', name: '北京路', type: 'property', colorGroup: 'lightblue', color: '#87CEEB', price: 120, rent: [8, 40, 100, 300, 450, 600], buildingCost: 50, mortgageValue: 60, ownerId: null, buildingLevel: 0, isMortgaged: false },
  
  { id: 'stat_1', name: '中央车站', type: 'station', price: 200, rentPerStation: 25, mortgageValue: 100, ownerId: null, isMortgaged: false },
  
  { id: 'prop_6', name: '长安街', type: 'property', colorGroup: 'pink', color: COLOR_GROUPS.pink, price: 140, rent: [10, 50, 150, 450, 625, 750], buildingCost: 100, mortgageValue: 70, ownerId: null, buildingLevel: 0, isMortgaged: false },
  { id: 'prop_7', name: '建国路', type: 'property', colorGroup: 'pink', color: COLOR_GROUPS.pink, price: 140, rent: [10, 50, 150, 450, 625, 750], buildingCost: 100, mortgageValue: 70, ownerId: null, buildingLevel: 0, isMortgaged: false },
  { id: 'prop_8', name: '复兴路', type: 'property', colorGroup: 'pink', color: COLOR_GROUPS.pink, price: 160, rent: [12, 60, 180, 500, 700, 900], buildingCost: 100, mortgageValue: 80, ownerId: null, buildingLevel: 0, isMortgaged: false },
  
  { id: 'prop_9', name: '王府井', type: 'property', colorGroup: 'orange', color: COLOR_GROUPS.orange, price: 180, rent: [14, 70, 200, 550, 750, 950], buildingCost: 100, mortgageValue: 90, ownerId: null, buildingLevel: 0, isMortgaged: false },
  { id: 'prop_10', name: '西单', type: 'property', colorGroup: 'orange', color: COLOR_GROUPS.orange, price: 180, rent: [14, 70, 200, 550, 750, 950], buildingCost: 100, mortgageValue: 90, ownerId: null, buildingLevel: 0, isMortgaged: false },
  { id: 'prop_11', name: '东单', type: 'property', colorGroup: 'orange', color: COLOR_GROUPS.orange, price: 200, rent: [16, 80, 220, 600, 800, 1000], buildingCost: 100, mortgageValue: 100, ownerId: null, buildingLevel: 0, isMortgaged: false },
  
  { id: 'util_2', name: '电力公司', type: 'utility', price: 150, baseRent: 4, mortgageValue: 75, ownerId: null, isMortgaged: false },
  
  { id: 'prop_12', name: '金融街', type: 'property', colorGroup: 'red', color: COLOR_GROUPS.red, price: 220, rent: [18, 90, 250, 700, 875, 1050], buildingCost: 150, mortgageValue: 110, ownerId: null, buildingLevel: 0, isMortgaged: false },
  { id: 'prop_13', name: '国贸中心', type: 'property', colorGroup: 'red', color: COLOR_GROUPS.red, price: 220, rent: [18, 90, 250, 700, 875, 1050], buildingCost: 150, mortgageValue: 110, ownerId: null, buildingLevel: 0, isMortgaged: false },
  { id: 'prop_14', name: '三里屯', type: 'property', colorGroup: 'red', color: COLOR_GROUPS.red, price: 240, rent: [20, 100, 300, 750, 925, 1100], buildingCost: 150, mortgageValue: 120, ownerId: null, buildingLevel: 0, isMortgaged: false },
  
  { id: 'stat_2', name: '东站', type: 'station', price: 200, rentPerStation: 25, mortgageValue: 100, ownerId: null, isMortgaged: false },
  
  { id: 'prop_15', name: '中关村', type: 'property', colorGroup: 'yellow', color: COLOR_GROUPS.yellow, price: 260, rent: [22, 110, 330, 800, 975, 1150], buildingCost: 150, mortgageValue: 130, ownerId: null, buildingLevel: 0, isMortgaged: false },
  { id: 'prop_16', name: '五道口', type: 'property', colorGroup: 'yellow', color: COLOR_GROUPS.yellow, price: 260, rent: [22, 110, 330, 800, 975, 1150], buildingCost: 150, mortgageValue: 130, ownerId: null, buildingLevel: 0, isMortgaged: false },
  { id: 'prop_17', name: '知春路', type: 'property', colorGroup: 'yellow', color: COLOR_GROUPS.yellow, price: 280, rent: [24, 120, 360, 850, 1025, 1200], buildingCost: 150, mortgageValue: 140, ownerId: null, buildingLevel: 0, isMortgaged: false },
  
  { id: 'prop_18', name: '颐和园路', type: 'property', colorGroup: 'green', color: COLOR_GROUPS.green, price: 300, rent: [26, 130, 390, 900, 1100, 1275], buildingCost: 200, mortgageValue: 150, ownerId: null, buildingLevel: 0, isMortgaged: false },
  { id: 'prop_19', name: '圆明园路', type: 'property', colorGroup: 'green', color: COLOR_GROUPS.green, price: 300, rent: [26, 130, 390, 900, 1100, 1275], buildingCost: 200, mortgageValue: 150, ownerId: null, buildingLevel: 0, isMortgaged: false },
  { id: 'prop_20', name: '清华路', type: 'property', colorGroup: 'green', color: COLOR_GROUPS.green, price: 320, rent: [28, 140, 420, 950, 1150, 1300], buildingCost: 200, mortgageValue: 160, ownerId: null, buildingLevel: 0, isMortgaged: false },
  
  { id: 'stat_3', name: '西站', type: 'station', price: 200, rentPerStation: 25, mortgageValue: 100, ownerId: null, isMortgaged: false },
  
  { id: 'prop_21', name: '外滩', type: 'property', colorGroup: 'blue', color: COLOR_GROUPS.blue, price: 350, rent: [35, 175, 500, 1100, 1300, 1500], buildingCost: 200, mortgageValue: 175, ownerId: null, buildingLevel: 0, isMortgaged: false },
  { id: 'prop_22', name: '陆家嘴', type: 'property', colorGroup: 'blue', color: COLOR_GROUPS.blue, price: 350, rent: [35, 175, 500, 1100, 1300, 1500], buildingCost: 200, mortgageValue: 175, ownerId: null, buildingLevel: 0, isMortgaged: false },
  { id: 'prop_23', name: '南京路步行街', type: 'property', colorGroup: 'blue', color: COLOR_GROUPS.blue, price: 400, rent: [50, 200, 600, 1400, 1700, 2000], buildingCost: 200, mortgageValue: 200, ownerId: null, buildingLevel: 0, isMortgaged: false },
  
  { id: 'prop_24', name: '紫禁城', type: 'property', colorGroup: 'purple', color: COLOR_GROUPS.purple, price: 400, rent: [50, 200, 600, 1400, 1700, 2000], buildingCost: 200, mortgageValue: 200, ownerId: null, buildingLevel: 0, isMortgaged: false },
  { id: 'prop_25', name: '天安门广场', type: 'property', colorGroup: 'purple', color: COLOR_GROUPS.purple, price: 400, rent: [50, 200, 600, 1400, 1700, 2000], buildingCost: 200, mortgageValue: 200, ownerId: null, buildingLevel: 0, isMortgaged: false },
  { id: 'prop_26', name: '人民广场', type: 'property', colorGroup: 'purple', color: COLOR_GROUPS.purple, price: 450, rent: [60, 250, 700, 1500, 1800, 2100], buildingCost: 200, mortgageValue: 225, ownerId: null, buildingLevel: 0, isMortgaged: false },
  
  { id: 'util_3', name: '通讯塔', type: 'utility', price: 150, baseRent: 4, mortgageValue: 75, ownerId: null, isMortgaged: false },
  
  { id: 'stat_4', name: '南站', type: 'station', price: 200, rentPerStation: 25, mortgageValue: 100, ownerId: null, isMortgaged: false },
  
  // 补充属性以填满棋盘
  { id: 'prop_27', name: '学院路', type: 'property', colorGroup: 'lightblue', color: '#87CEEB', price: 130, rent: [9, 45, 120, 360, 520, 680], buildingCost: 50, mortgageValue: 65, ownerId: null, buildingLevel: 0, isMortgaged: false },
  { id: 'prop_28', name: '中关村大街', type: 'property', colorGroup: 'yellow', color: COLOR_GROUPS.yellow, price: 300, rent: [26, 130, 390, 900, 1100, 1275], buildingCost: 150, mortgageValue: 150, ownerId: null, buildingLevel: 0, isMortgaged: false },
  { id: 'prop_29', name: 'CBD', type: 'property', colorGroup: 'blue', color: COLOR_GROUPS.blue, price: 380, rent: [45, 225, 650, 1400, 1700, 2000], buildingCost: 200, mortgageValue: 190, ownerId: null, buildingLevel: 0, isMortgaged: false },
  { id: 'prop_30', name: '奥体中心', type: 'property', colorGroup: 'purple', color: COLOR_GROUPS.purple, price: 420, rent: [55, 275, 750, 1600, 1900, 2200], buildingCost: 200, mortgageValue: 210, ownerId: null, buildingLevel: 0, isMortgaged: false },
];

export function generateBoard(): GameCell[] {
  const cells: GameCell[] = [];
  
  // 棋盘是一个11x11的环形路径
  // 坐标: (0,10) = 起点, 逆时针排列
  // 
  // 布局:
  // [30][31][32][33][34][35][36][37][38][39][...]
  // [..][                          ][..]
  // [..][                          ][..]
  // [..][                          ][..]
  // [..][                          ][..]
  // [..][                          ][..]
  // [..][                          ][..]
  // [..][                          ][..]
  // [..][                          ][..]
  // [10][11][12][13][14][15][16][17][18][19][20]
  // [0 ][1 ][2 ][3 ][4 ][5 ][6 ][7 ][8 ][9 ]
  
  const cellPositions = [
    { x: 0, y: 10 },  // 0: 起点
    { x: 1, y: 10 },  // 1
    { x: 2, y: 10 },  // 2
    { x: 3, y: 10 },  // 3
    { x: 4, y: 10 },  // 4
    { x: 5, y: 10 },  // 5
    { x: 6, y: 10 },  // 6
    { x: 7, y: 10 },  // 7
    { x: 8, y: 10 },  // 8
    { x: 9, y: 10 },  // 9
    { x: 10, y: 10 }, // 10: 监狱
    { x: 10, y: 9 },  // 11
    { x: 10, y: 8 },  // 12
    { x: 10, y: 7 },  // 13
    { x: 10, y: 6 },  // 14
    { x: 10, y: 5 },  // 15
    { x: 10, y: 4 },  // 16
    { x: 10, y: 3 },  // 17
    { x: 10, y: 2 },  // 18
    { x: 10, y: 1 },  // 19
    { x: 10, y: 0 },  // 20: 免费停车
    { x: 9, y: 0 },   // 21
    { x: 8, y: 0 },   // 22
    { x: 7, y: 0 },   // 23
    { x: 6, y: 0 },   // 24
    { x: 5, y: 0 },   // 25
    { x: 4, y: 0 },   // 26
    { x: 3, y: 0 },   // 27
    { x: 2, y: 0 },   // 28
    { x: 1, y: 0 },   // 29
    { x: 0, y: 0 },   // 30: 机会
    { x: 0, y: 1 },   // 31
    { x: 0, y: 2 },   // 32
    { x: 0, y: 3 },   // 33: 命运
    { x: 0, y: 4 },   // 34
    { x: 0, y: 5 },   // 35: 税金
    { x: 0, y: 6 },   // 36
    { x: 0, y: 7 },   // 37
    { x: 0, y: 8 },   // 38
    { x: 0, y: 9 },   // 39
  ];
  
  let propertyIndex = 0;
  
  // 确保所有40个格子都被生成
  for (let i = 0; i < 40; i++) {
    const pos = cellPositions[i];
    
    if (i === 0) {
      cells.push({ id: 'go', type: 'go', name: '起点', data: null, position: pos });
    } else if (i === 10) {
      cells.push({ id: 'jail', type: 'jail', name: '监狱', data: null, position: pos });
    } else if (i === 20) {
      cells.push({ id: 'free_parking', type: 'free_parking', name: '免费停车', data: null, position: pos });
    } else if (i === 30) {
      cells.push({ id: 'chance', type: 'chance', name: '机会', data: null, position: pos });
    } else if (i === 33) {
      cells.push({ id: 'fortune', type: 'fortune', name: '命运', data: null, position: pos });
    } else if (i === 35) {
      cells.push({ id: 'tax', type: 'tax', name: '税金', data: null, position: pos });
    } else {
      // 即使属性用完了，也添加一个临时格子
      if (propertyIndex < PROPERTIES.length) {
        cells.push({ 
          id: PROPERTIES[propertyIndex].id, 
          type: PROPERTIES[propertyIndex].type, 
          name: PROPERTIES[propertyIndex].name, 
          data: PROPERTIES[propertyIndex], 
          position: pos 
        });
        propertyIndex++;
      } else {
        // 添加一个备用格子（使用最后一个属性的副本）
        const lastProp = PROPERTIES[PROPERTIES.length - 1];
        cells.push({ 
          id: `extra_cell_${i}`, 
          type: 'property', 
          name: `空${i}`, 
          data: { ...lastProp, id: `extra_${i}` }, 
          position: pos 
        });
      }
    }
  }
  
  return cells;
}

export const TAX_AMOUNT = 200;
export const GO_MONEY = 200;
export const LOAN_INTEREST = 0.1;
export const MAX_LOAN = 1000;
