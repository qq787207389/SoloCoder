# 勇者传说 - Dragon Quest Clone

一款致敬 FC《勇者斗恶龙》的回合制角色扮演游戏，使用 TypeScript + Vite + Canvas 2D 开发。

## 游戏特色

- **经典回合制战斗系统**：攻击、魔法、道具、逃跑
- **瓦片地图探索**：村庄、野外、洞窟、魔王城
- **角色成长系统**：经验值、升级、属性提升
- **装备系统**：武器和防具可改变攻防属性
- **背包系统**：道具存储和使用
- **NPC交互**：对话推进剧情
- **宝箱系统**：探索获得道具和金币
- **存档功能**：使用 localStorage 保存游戏进度
- **任务系统**：极简主线剧情

## 操作说明

| 按键 | 功能 |
|------|------|
| WASD / 方向键 | 移动 |
| 空格 / 回车 | 交互 / 对话确认 |
| X / M | 打开菜单 |
| Q | 查看当前任务 |
| ESC | 关闭菜单 / 对话 |

## 游戏流程

1. **起点 - 和平村**
   - 与村长对话接任务
   - 与小女孩对话获得药草
   - 探索村庄找到宝箱
   - 向南门出发前往野外

2. **野外平原**
   - 随机遇敌战斗
   - 探索宝箱获得道具
   - 向南前往洞窟
   - 获得勇者之证后可前往魔王城

3. **黑暗洞窟**
   - 随机遇到骷髅兵和哥布林
   - 找到武器和防具宝箱
   - 到达洞窟深处挑战巨兽BOSS

4. **魔王城**
   - 最终决战，击败魔王
   - 游戏通关！

## 技术架构

### 文件结构

```
dragon/
├── src/
│   ├── core/
│   │   ├── GameState.ts      # 游戏状态管理
│   │   ├── Renderer.ts       # Canvas 渲染引擎
│   │   └── InputHandler.ts   # 输入处理
│   ├── systems/
│   │   ├── MapSystem.ts      # 地图和交互系统
│   │   ├── BattleSystem.ts   # 战斗系统
│   │   └── MenuSystem.ts     # 菜单和存档系统
│   ├── data/
│   │   ├── items.ts          # 道具和装备数据
│   │   ├── spells.ts         # 魔法数据
│   │   ├── enemies.ts        # 敌人数据
│   │   └── maps.ts           # 地图配置
│   ├── types.ts              # TypeScript 类型定义
│   └── main.ts               # 游戏入口
├── index.html                # HTML 入口
├── vite.config.ts            # Vite 配置
├── tsconfig.json             # TypeScript 配置
└── package.json              # 项目配置
```

### 核心技术

- **TypeScript 5.0**：类型安全
- **Vite 4.4**：快速开发和构建
- **Canvas 2D**：游戏画面渲染
- **LocalStorage**：存档功能

## 运行方法

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

游戏将在 http://localhost:3000 自动打开。

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

### 预览生产版本

```bash
npm run preview
```

## 地图配置说明

地图数据在 `src/data/maps.ts` 中定义，每个地图包含：

```typescript
interface GameMap {
  name: string;           // 地图ID
  displayName: string;    // 显示名称
  width: number;          // 宽度（格）
  height: number;         // 高度（格）
  tiles: number[][];      // 瓦片数据
  collisionTiles: number[]; // 碰撞瓦片ID列表
  npcs: NPC[];           // NPC列表
  chests: Chest[];       // 宝箱列表
  portals: MapPortal[];  // 传送点
  encounterRate: number; // 遇敌概率
  encounterTable: string[]; // 可能遇到的敌人ID
  bgColor: string;       // 背景色
}
```

瓦片颜色映射在 `src/core/Renderer.ts` 中定义：

| 瓦片ID | 颜色 | 说明 |
|--------|------|------|
| 0 | #4a8a4a | 草地 |
| 1 | #2a5a2a | 森林 |
| 2 | #4a8aaa | 水域 |
| 3 | #6a6a6a | 山脉 |
| 4 | #8a7a5a | 路径 |
| 5 | #5a5a5a | 地板 |
| 6 | #3a3a3a | 墙壁 |
| 7 | #8a6a4a | 门 |

## 战斗系统说明

战斗采用回合制，行动顺序由速度属性决定。

### 战斗命令

- **攻击**：对敌人造成物理伤害
- **魔法**：消耗MP使用魔法技能
- **道具**：使用背包中的消耗品
- **逃跑**：有一定概率逃离战斗

### 敌人AI

- 普通攻击：默认行为
- 技能攻击：HP低于一定阈值时有概率使用强力技能
- BOSS敌人：多阶段技能，伤害更高

### 升级系统

- 击败敌人获得经验值
- 经验值达到阈值自动升级
- 升级后HP、MP、攻击力、防御力、速度提升
- HP和MP完全恢复

## 存档结构

存档使用 JSON 格式存储在 localStorage 的 `dragonQuestSave` 键中，包含：

```typescript
interface SaveData {
  player: {
    position: { x: number; y: number };
    stats: PlayerStats;
    equipment: { weapon: Equipment; armor: Equipment };
    inventory: InventoryItem[];
    spells: Spell[];
    mapName: string;
  };
  currentMap: string;
  maps: Record<string, GameMap>;  // 包含宝箱开启状态
  flags: Record<string, boolean>;   // 剧情标记
  currentQuest: string;             // 当前任务文本
}
```

## 游戏扩展建议

1. **添加更多地图**：增加城镇、迷宫等场景
2. **更多敌人和技能**：丰富战斗内容
3. **商店系统**：购买装备和道具
4. **伙伴系统**：增加可加入队伍的NPC
5. **音效和背景音乐**：提升游戏体验
6. **动画效果**：战斗和移动动画
7. **更多魔法和技能**：丰富战斗策略
8. **支线任务**：增加游戏内容深度

## 许可证

MIT License
