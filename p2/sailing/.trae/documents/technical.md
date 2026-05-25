## 1. 架构设计

```mermaid
flowchart LR
    A["React 18 前端层"] --> B["Canvas 2D 渲染层"]
    A --> C["UI 层 (HUD/面板)"]
    C --> D["zustand 状态管理"]
    D --> E["游戏引擎 (游戏循环、物理、天气]
    E --> F["世界生成 (种子/岛屿/资源)"]
    E --> G["存档模块 (localStorage)]
```

## 2. 技术说明

- 前端：React 18 + TypeScript + Vite
- 样式：TailwindCSS 3 + 自定义 CSS（Canvas 专用样式
- 状态：zustand
- 图标：lucide-react
- 构建：Vite
- 后端：无（纯单机，前端自包含）
- 数据：localStorage 存档
- 初始化：`react-ts` 模板
- 游戏循环：`requestAnimationFrame` + 自定义引擎
- 渲染：Canvas 2D，按需分块（岛屿、船只、天气）
- 物理：自定义简易风/洋流/惯性/损伤影响操控

## 3. 路由定义

| 路由 | 用途 |
|------|------|
| `/` | 开始页（标题、开始/继续游戏） |
| `/game` | 游戏主界面（Canvas + HUD + 面板） |

## 4. 数据模型

```ts
type Island = {
  id: string
  x: number
  y: number
  radius: number
  biome: "palm" | "volcano" | "reef" | "iceberg" | "wreck" | "tower"
  resources: Record<string, number>
  discovered: boolean
}

type Ship = {
  x: number
  y: number
  heading: number
  speed: number
  hull: number
  sailState: "up" | "down"
  upgrades: Record<string, boolean>
}

type SaveSlot = {
  seed: number
  ship: Ship
  stats: { hunger: number; thirst: number; warmth: number; stamina: number; hull: number }
  inventory: Record<string, number>
  islands: Island[]
  weather: Weather
  day: number
  timeOfDay: number
}
```

## 5. 存档格式

存档以 JSON 形式写入 localStorage：
- key: `sailing_save_v1`
- 内容：`SaveSlot`
- 自动保存间隔：30 秒
- 最大存档数：3 槽
