import { Level } from '../types';

export const levels: Level[] = [
  {
    id: 'level_1',
    name: '第一关：简单斜坡',
    description: '使用木板让弹珠滚到终点',
    startPosition: { x: 150, y: 100 },
    endPosition: { x: 700, y: 500 },
    endSize: { width: 80, height: 60 },
    boundaries: {
      left: 50,
      right: 900,
      top: 50,
      bottom: 600
    },
    fixedParts: [],
    availableTools: ['wood_plank'],
    hint: '放置一块木板，让弹珠从起点滚下来'
  },
  {
    id: 'level_2',
    name: '第二关：双重斜坡',
    description: '使用多块木板创建连续路径',
    startPosition: { x: 100, y: 80 },
    endPosition: { x: 800, y: 500 },
    endSize: { width: 80, height: 60 },
    boundaries: {
      left: 50,
      right: 900,
      top: 50,
      bottom: 600
    },
    fixedParts: [
      {
        id: 'fixed_1',
        type: 'wood_plank',
        x: 200,
        y: 200,
        rotation: 0.3,
        isStatic: true
      }
    ],
    availableTools: ['wood_plank'],
    hint: '在固定木板下方再放一块，连接到终点'
  },
  {
    id: 'level_3',
    name: '第三关：弹簧跳跃',
    description: '使用弹簧让弹珠跳过障碍',
    startPosition: { x: 150, y: 100 },
    endPosition: { x: 750, y: 150 },
    endSize: { width: 80, height: 60 },
    boundaries: {
      left: 50,
      right: 900,
      top: 50,
      bottom: 600
    },
    fixedParts: [
      {
        id: 'wall_1',
        type: 'wood_plank',
        x: 450,
        y: 400,
        rotation: 0,
        isStatic: true
      }
    ],
    availableTools: ['wood_plank', 'spring'],
    hint: '用木板引导弹珠到弹簧上'
  },
  {
    id: 'level_4',
    name: '第四关：传送带',
    description: '利用传送带改变弹珠方向',
    startPosition: { x: 150, y: 80 },
    endPosition: { x: 800, y: 300 },
    endSize: { width: 80, height: 60 },
    boundaries: {
      left: 50,
      right: 900,
      top: 50,
      bottom: 600
    },
    fixedParts: [],
    availableTools: ['wood_plank', 'conveyor'],
    hint: '传送带可以把弹珠向上输送'
  },
  {
    id: 'level_5',
    name: '第五关：加速冲刺',
    description: '使用加速环让弹珠获得额外速度',
    startPosition: { x: 100, y: 100 },
    endPosition: { x: 850, y: 500 },
    endSize: { width: 80, height: 60 },
    boundaries: {
      left: 50,
      right: 900,
      top: 50,
      bottom: 600
    },
    fixedParts: [
      {
        id: 'ramp_1',
        type: 'wood_plank',
        x: 250,
        y: 250,
        rotation: 0.4,
        isStatic: true
      }
    ],
    availableTools: ['wood_plank', 'speed_ring'],
    hint: '在斜坡下方放置加速环'
  },
  {
    id: 'level_6',
    name: '第六关：跷跷板',
    description: '利用跷跷板的杠杆原理',
    startPosition: { x: 200, y: 80 },
    endPosition: { x: 700, y: 200 },
    endSize: { width: 80, height: 60 },
    boundaries: {
      left: 50,
      right: 900,
      top: 50,
      bottom: 600
    },
    fixedParts: [],
    availableTools: ['wood_plank', 'seesaw', 'spring'],
    hint: '让弹珠从高处落到跷跷板一端'
  },
  {
    id: 'level_7',
    name: '第七关：气球升起',
    description: '使用气球带着弹珠上升',
    startPosition: { x: 150, y: 500 },
    endPosition: { x: 750, y: 100 },
    endSize: { width: 80, height: 60 },
    boundaries: {
      left: 50,
      right: 900,
      top: 50,
      bottom: 600
    },
    fixedParts: [],
    availableTools: ['wood_plank', 'balloon'],
    hint: '让气球接住下落的弹珠'
  },
  {
    id: 'level_8',
    name: '第八关：风扇吹送',
    description: '使用风扇改变弹珠的运动轨迹',
    startPosition: { x: 150, y: 100 },
    endPosition: { x: 800, y: 400 },
    endSize: { width: 80, height: 60 },
    boundaries: {
      left: 50,
      right: 900,
      top: 50,
      bottom: 600
    },
    fixedParts: [
      {
        id: 'gap_wall',
        type: 'wood_plank',
        x: 500,
        y: 300,
        rotation: 0,
        isStatic: true
      }
    ],
    availableTools: ['wood_plank', 'fan'],
    hint: '用风扇把弹珠吹过缺口'
  },
  {
    id: 'level_9',
    name: '第九关：综合挑战',
    description: '组合使用多种零件',
    startPosition: { x: 100, y: 80 },
    endPosition: { x: 850, y: 550 },
    endSize: { width: 80, height: 60 },
    boundaries: {
      left: 50,
      right: 900,
      top: 50,
      bottom: 600
    },
    fixedParts: [
      {
        id: 'obstacle_1',
        type: 'wood_plank',
        x: 400,
        y: 350,
        rotation: 0.2,
        isStatic: true
      }
    ],
    availableTools: ['wood_plank', 'spring', 'conveyor', 'speed_ring'],
    hint: '灵活运用各种零件'
  },
  {
    id: 'level_10',
    name: '第十关：终极挑战',
    description: '运用所有技巧完成关卡',
    startPosition: { x: 100, y: 80 },
    endPosition: { x: 850, y: 100 },
    endSize: { width: 80, height: 60 },
    boundaries: {
      left: 50,
      right: 900,
      top: 50,
      bottom: 600
    },
    fixedParts: [
      {
        id: 'wall_middle',
        type: 'wood_plank',
        x: 500,
        y: 300,
        rotation: 0,
        isStatic: true
      },
      {
        id: 'wall_left',
        type: 'wood_plank',
        x: 300,
        y: 450,
        rotation: -0.3,
        isStatic: true
      }
    ],
    availableTools: ['wood_plank', 'spring', 'conveyor', 'speed_ring', 'seesaw', 'balloon', 'fan'],
    hint: '这需要精确的设计！'
  }
];

export const toolDefinitions = [
  { type: 'wood_plank', name: '木板', icon: '🪵', width: 120, height: 20, isStatic: true },
  { type: 'spring', name: '弹簧', icon: '🔩', width: 50, height: 40, isStatic: true },
  { type: 'conveyor', name: '传送带', icon: '🔄', width: 100, height: 20, isStatic: true },
  { type: 'speed_ring', name: '加速环', icon: '⚡', width: 50, height: 50, isStatic: true },
  { type: 'seesaw', name: '跷跷板', icon: '⚖️', width: 150, height: 30, isStatic: false },
  { type: 'balloon', name: '气球', icon: '🎈', width: 50, height: 50, isStatic: false },
  { type: 'fan', name: '风扇', icon: '🌀', width: 60, height: 60, isStatic: true }
];
