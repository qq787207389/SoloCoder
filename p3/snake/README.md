# 贪吃蛇 · 进化战场

一款功能丰富的贪吃蛇游戏，支持多种游戏模式、主题切换和 AI 对战，具备商业级原型潜力。

## 功能特性

### 游戏模式
- **经典模式**：单人贪吃蛇，吃食物增长，碰墙或自身死亡
- **双人对战**：同键盘对战，玩家1用 WASD，玩家2用方向键
- **AI挑战**：与 1-3 条 AI 蛇对战，AI 具有不同策略

### 地图与环境
- 60×40 网格地图（可配置）
- 三种主题：经典黑底、草地自然、赛博朋克
- 随机生成不可穿越的障碍物（石头、树木）
- 墙壁穿越模式可选

### 食物系统
- **普通食物**：+1 节，+10 分
- **金色食物**：+3 节，+50 分，限时出现并闪烁
- **毒蘑菇**：-2 节，-30 分，减速 2 秒
- **速度果实**：加速持续 3 秒
- **穿墙果实**：允许穿越障碍物 5 秒

### 游戏特性
- 蛇身平滑移动插值动画
- 速度递增机制（每吃 5 个食物速度 +5%）
- 粒子特效系统（食物被吃、蛇死亡、道具激活）
- Web Audio API 音效系统
- 本地排行榜存储
- 淡入淡出过渡动画

## 技术架构

### 目录结构
```
snake/
├── src/
│   ├── core/           # 核心引擎
│   │   ├── GameObject.ts     # 游戏对象基类
│   │   ├── ObjectPool.ts     # 对象池系统
│   │   ├── GameEngine.ts     # 游戏循环引擎
│   │   └── GameManager.ts    # 游戏管理器
│   ├── entities/       # 实体类
│   │   ├── Snake.ts          # 蛇实体
│   │   ├── Food.ts           # 食物实体
│   │   ├── Obstacle.ts       # 障碍物实体
│   │   └── Particle.ts       # 粒子实体
│   ├── systems/        # 系统模块
│   │   ├── AISystem.ts       # AI 决策系统
│   │   ├── ParticleSystem.ts # 粒子系统
│   │   ├── AudioSystem.ts    # 音效系统
│   │   ├── InputSystem.ts    # 输入系统
│   │   ├── StorageSystem.ts  # 存储系统
│   │   └── UISystem.ts       # UI 系统
│   ├── config/         # 配置文件
│   │   └── gameConfig.json   # 游戏参数配置
│   ├── types/          # 类型定义
│   │   └── index.ts          # 全局类型
│   └── main.ts         # 入口文件
├── tests/              # 测试文件
├── index.html          # HTML 入口
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### 架构设计

1. **实体-组件模式**：所有游戏对象继承自 `GameObject` 基类
2. **游戏循环**：使用 `requestAnimationFrame`，逻辑更新使用固定时间步长
3. **对象池**：`ObjectPool` 管理高频创建的粒子对象，减少 GC 开销
4. **配置驱动**：所有游戏参数通过 JSON 配置文件驱动
5. **模块化设计**：各系统独立，通过 `GameManager` 协调

## AI 策略说明

### 激进型 (Aggressive)
- 优先追击玩家
- 食物优先级高
- 巡逻概率低
- 适合挑战高难度

### 保守型 (Defensive)
- 优先避开玩家
- 食物优先级中等
- 巡逻概率高
- 适合新手玩家

### 随机型 (Random)
- 各项权重均衡
- 行为不可预测
- 适合娱乐模式

## 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

### 运行测试
```bash
npm test
```

## 配置修改指南

所有游戏参数均可在 `src/config/gameConfig.json` 中修改：

### 地图配置
```json
"grid": {
  "width": 60,     // 网格宽度
  "height": 40,    // 网格高度
  "cellSize": 16   // 单元格像素大小
}
```

### 蛇属性配置
```json
"snake": {
  "initialLength": 3,      // 初始长度
  "baseSpeed": 150,        // 基础移动间隔（ms）
  "speedIncrement": 0.05,  // 速度增加百分比
  "speedIncrementInterval": 5  // 每吃N个食物提速
}
```

### 食物生成概率
```json
"foodTypes": {
  "normal": { "spawnChance": 0.6 },   // 60% 概率
  "golden": { "spawnChance": 0.1 },   // 10% 概率
  "poison": { "spawnChance": 0.1 },   // 10% 概率
  "speed": { "spawnChance": 0.1 },    // 10% 概率
  "phase": { "spawnChance": 0.1 }     // 10% 概率
}
```

### 主题配色
```json
"themes": {
  "classic": {
    "name": "经典黑底",
    "background": "#0a0a0a",
    "grid": "#1a1a1a",
    "snakeHead": "#22c55e",
    "snakeBody": "#16a34a",
    "obstacle": "#4b5563"
  }
}
```

## 操作说明

### 经典模式 / AI 挑战
- **W / ↑**：向上移动
- **S / ↓**：向下移动
- **A / ←**：向左移动
- **D / →**：向右移动
- **ESC**：暂停游戏

### 双人对战
- **玩家 1**：WASD 控制
- **玩家 2**：方向键控制

## 性能优化

1. **对象池**：粒子对象复用，避免频繁创建销毁
2. **离屏渲染**：HUD 信息合并渲染
3. **事件节流**：键盘输入防抖处理
4. **网格优化**：碰撞检测使用空间哈希

## 技术栈

- **TypeScript**：类型安全的 JavaScript 超集
- **Vite**：下一代前端构建工具
- **Canvas 2D**：HTML5 图形渲染 API
- **Web Audio API**：浏览器音频合成
- **Vitest**：单元测试框架

## 浏览器支持

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 许可证

MIT License
