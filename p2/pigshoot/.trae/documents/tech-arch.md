# 《猪小弟》射击游戏 技术架构文档

## 1. 技术选型

### 1.1 核心技术栈
- **构建工具**：Vite 5.x
- **编程语言**：TypeScript 5.x
- **渲染引擎**：原生 Canvas 2D API
- **包管理器**：npm

### 1.2 为什么选择这个栈
- **Vite**：快速的开发体验，热更新，开箱即用的TypeScript支持
- **TypeScript**：类型安全，更好的代码提示和重构能力
- **Canvas 2D**：像素游戏的最佳选择，性能优秀，API简单直接

---

## 2. 项目结构

```
pigshoot/
├── src/
│   ├── main.ts              # 入口文件
│   ├── game/
│   │   ├── Game.ts          # 游戏主控制器
│   │   ├── Input.ts         # 输入管理
│   │   ├── Audio.ts         # 音效管理
│   │   └── State.ts         # 状态管理
│   ├── entities/
│   │   ├── Player.ts        # 玩家（猪妈妈）
│   │   ├── Wolf.ts          # 狼实体
│   │   ├── Arrow.ts         # 箭矢实体
│   │   ├── Meat.ts          # 肉棒骨道具
│   │   ├── Rock.ts          # 岩石/石块
│   │   ├── BonusItem.ts     # 奖励道具
│   │   └── HiddenItem.ts    # 隐藏道具
│   ├── levels/
│   │   ├── Level1.ts        # 第一关：绿叶崖壁
│   │   ├── Level2.ts        # 第二关：黄土崖壁
│   │   └── Level3.ts        # 第三关：奖励关
│   ├── rendering/
│   │   ├── Renderer.ts      # 渲染器
│   │   ├── Sprite.ts        # 精灵绘制
│   │   └── Particle.ts      # 粒子系统
│   └── utils/
│       ├── math.ts          # 数学工具
│       ├── collision.ts     # 碰撞检测
│       └── constants.ts     # 常量定义
├── public/
│   └── assets/              # 静态资源（音效等）
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 3. 核心架构设计

### 3.1 游戏循环 (Game Loop)

```typescript
class Game {
  private lastTime: number = 0;
  private accumulator: number = 0;
  private fixedTimeStep: number = 1000 / 60; // 60 FPS

  public start(): void {
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private gameLoop(currentTime: number): void {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.accumulator += deltaTime;

    // 固定时间步长更新
    while (this.accumulator >= this.fixedTimeStep) {
      this.update(this.fixedTimeStep);
      this.accumulator -= this.fixedTimeStep;
    }

    this.render();
    requestAnimationFrame(this.gameLoop.bind(this));
  }
}
```

### 3.2 实体组件系统

**基础实体接口**：
```typescript
interface IEntity {
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
  update(deltaTime: number): void;
  render(ctx: CanvasRenderingContext2D): void;
}
```

**实体管理器**：
```typescript
class EntityManager {
  private entities: IEntity[] = [];

  public add(entity: IEntity): void {
    this.entities.push(entity);
  }

  public update(deltaTime: number): void {
    this.entities.forEach(e => e.active && e.update(deltaTime));
    this.entities = this.entities.filter(e => e.active);
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.entities.forEach(e => e.active && e.render(ctx));
  }
}
```

---

## 4. 核心模块设计

### 4.1 玩家 (Player)

```typescript
class Player implements IEntity {
  public x: number;
  public y: number;
  public width: number = 48;
  public height: number = 64;
  public active: boolean = true;
  
  private speed: number = 200; // 像素/秒
  private minY: number;
  private maxY: number;
  private arrows: Arrow[] = [];
  private maxArrows: number = 2;
  private shootCooldown: number = 0;
  private baseShootDelay: number = 300; // 毫秒

  public moveUp(deltaTime: number): void;
  public moveDown(deltaTime: number): void;
  public shoot(): boolean;
  public update(deltaTime: number): void;
  public render(ctx: CanvasRenderingContext2D): void;
}
```

### 4.2 狼 (Wolf)

**状态枚举**：
```typescript
enum WolfState {
  BALLOONING,  // 乘气球
  FALLING,     // 坠落中
  CLIMBING,    // 爬梯子
  ATTACKING,   // 攻击中
  ASCENDING,   // 向上飞（第二关）
  REACHED_TOP, // 到达顶部
  DEAD         // 死亡
}
```

```typescript
class Wolf implements IEntity {
  public x: number;
  public y: number;
  public width: number = 32;
  public height: number = 40;
  public active: boolean = true;
  
  public state: WolfState;
  public isPink: boolean = false; // 粉红狼
  public balloonColor: string;
  public hasBalloon: boolean = true;
  public velocityY: number = 0;
  
  // 行为
  public update(deltaTime: number): void;
  public popBalloon(): void;      // 气球被击破
  public grabMeat(): void;         // 抓肉
  public throwRock(): Rock | null; // 扔石头
  public dropBonus(): BonusItem | null; // 掉落奖励（粉红狼）
}
```

### 4.3 箭矢 (Arrow)

```typescript
class Arrow implements IEntity {
  public x: number;
  public y: number;
  public width: number = 24;
  public height: number = 6;
  public active: boolean = true;
  
  private speed: number = 500;
  private direction: 1 | -1 = 1; // 向右
  
  public update(deltaTime: number): void;
  public checkCollision(target: IEntity): boolean;
}
```

### 4.4 肉棒骨 (Meat)

```typescript
class Meat implements IEntity {
  public x: number;
  public y: number;
  public width: number = 24;
  public height: number = 16;
  public active: boolean = true;
  
  private velocityX: number;
  private velocityY: number;
  private gravity: number = 500;
  private isSnake: boolean = false; // 蛇形下落
  private snakeTime: number = 0;
  
  public update(deltaTime: number): void;
  // 抛物线运动
  // 蛇形运动效果
}
```

### 4.5 隐藏道具系统

```typescript
class HiddenItemSystem {
  // 触发条件追踪
  private rapidMoveCount: number = 0;      // 快速移动计数
  private emptyShotCount: number = 0;      // 空射计数
  private emptyShotHeight: number | null = null;
  private reboundHitCount: number = 0;     // 反弹石块击中计数
  private consecutiveHits: number = 0;     // 连续命中计数
  private leftBalloonHits: number = 0;     // 左方气球命中计数

  // 检查触发条件
  public checkTriggers(): HiddenItemType | null;
  
  // 应用效果
  public applyEffect(type: HiddenItemType): void;
}
```

---

## 5. 关卡系统

### 5.1 关卡接口

```typescript
interface ILevel {
  name: string;
  background: string;
  spawnRate: number;
  wolfSpeed: number;
  maxWolves: number;
  
  init(): void;
  update(deltaTime: number): void;
  renderBackground(ctx: CanvasRenderingContext2D): void;
  renderForeground(ctx: CanvasRenderingContext2D): void;
  spawnWolf(): Wolf;
  checkWinCondition(): boolean;
  checkLoseCondition(): boolean;
}
```

### 5.2 关卡管理器

```typescript
class LevelManager {
  private currentLevelIndex: number = 0;
  private currentCycle: number = 1;
  private levels: ILevel[] = [];
  
  public start(): void;
  public nextLevel(): void;
  public getCurrentLevel(): ILevel;
  public getDifficultyMultiplier(): number;
  // 每轮循环难度递增
}
```

---

## 6. 碰撞检测

```typescript
// AABB 碰撞检测
function checkAABB(a: IEntity, b: IEntity): boolean {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

// 点与矩形碰撞
function pointInRect(px: number, py: number, rect: IEntity): boolean {
  return px >= rect.x && px <= rect.x + rect.width &&
         py >= rect.y && py <= rect.y + rect.height;
}

// 圆与矩形碰撞（气球检测）
function circleRectCollision(
  cx: number, cy: number, radius: number,
  rect: IEntity
): boolean;
```

---

## 7. 渲染系统

### 7.1 像素渲染辅助

```typescript
class PixelRenderer {
  // 绘制像素矩形
  public drawPixelRect(
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    w: number, h: number,
    color: string
  ): void;

  // 绘制像素精灵（从数组数据）
  public drawSprite(
    ctx: CanvasRenderingContext2D,
    sprite: number[][],
    x: number, y: number,
    scale: number,
    palette: string[]
  ): void;

  // 绘制猪妈妈
  public drawMamaPig(ctx: CanvasRenderingContext2D, x: number, y: number): void;
  
  // 绘制狼
  public drawWolf(ctx: CanvasRenderingContext2D, x: number, y: number, isPink: boolean): void;
  
  // 绘制气球
  public drawBalloon(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void;
}
```

---

## 8. 音效系统

```typescript
class AudioManager {
  private audioContext: AudioContext | null = null;
  
  // 使用 Web Audio API 生成音效（无需外部文件）
  public init(): void;
  public playShoot(): void;      // 射箭声
  public playPop(): void;        // 气球破裂
  public playScore(): void;      // 得分
  public playHit(): void;        // 击中
  public playBonus(): void;      // 奖励
  public playGameOver(): void;   // 游戏结束
  
  // 生成简单音效
  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType,
    volume: number
  ): void;
}
```

---

## 9. 状态管理

```typescript
enum GameState {
  MENU,
  PLAYING,
  PAUSED,
  LEVEL_TRANSITION,
  GAME_OVER
}

class GameStateManager {
  private currentState: GameState = GameState.MENU;
  private score: number = 0;
  private lives: number = 3;
  private highScore: number = 0;
  
  public getState(): GameState;
  public setState(state: GameState): void;
  public addScore(points: number): void;
  public loseLife(): void;
  public addLife(): void;
}
```

---

## 10. 性能优化

### 10.1 渲染优化
- 使用分层渲染（背景层、实体层、HUD层）
- 离屏Canvas缓存静态背景
- 只渲染可视区域内的实体

### 10.2 逻辑优化
- 对象池模式复用实体（箭矢、粒子等）
- 空间分区减少碰撞检测次数
- 固定时间步长更新

### 10.3 内存优化
- 及时清理不活跃的实体
- 避免频繁创建对象
- 使用对象池

---

## 11. 常量定义

```typescript
// src/utils/constants.ts
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const PIXEL_SIZE = 2;

// 颜色调色板（像素风）
export const COLORS = {
  SKY_BLUE: '#87CEEB',
  GREEN_CLIFF: '#228B22',
  BROWN_CLIFF: '#8B4513',
  PIG_PINK: '#FFB6C1',
  WOLF_GRAY: '#808080',
  WOLF_PINK: '#FF69B4',
  BALLOON_RED: '#FF4444',
  BALLOON_BLUE: '#4444FF',
  BALLOON_YELLOW: '#FFFF44',
  BALLOON_GREEN: '#44FF44',
  WOOD_BROWN: '#A0522D',
  ROPE_GRAY: '#696969',
};

// 难度参数
export const DIFFICULTY = {
  CYCLE_MULTIPLIER: 1.5,
  SPAWN_RATE_BASE: 2000,
  WOLF_SPEED_BASE: 50,
};
```

---

## 12. 开发计划

### 阶段一：基础框架
1. 项目初始化 (Vite + TypeScript)
2. 游戏循环和渲染基础
3. 输入系统
4. 玩家移动

### 阶段二：核心玩法
1. 箭矢系统
2. 狼实体（气球状态）
3. 碰撞检测
4. 基础得分系统

### 阶段三：关卡系统
1. 第一关实现
2. 第二关实现
3. 第三关实现
4. 难度递增

### 阶段四：进阶功能
1. 肉棒骨道具
2. 隐藏道具系统
3. 粒子效果
4. 音效系统

### 阶段五：完善
1. UI/HUD
2. 游戏状态管理
3. 性能优化
4. 测试调试
