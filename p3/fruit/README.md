# 🍒 水果老虎机 - Fruit Slots

一个使用 TypeScript + Vite + Canvas 2D 开发的经典水果老虎机游戏。

## 🎮 游戏特色

- **3x3 卷轴布局**：经典的 3 列 3 行显示格
- **7 种水果图标**：樱桃、柠檬、橙子、李子、西瓜、葡萄、幸运 7
- **5 条中奖线**：3 条横线 + 2 条对角线
- **可调节下注**：1-10 枚代币每局
- **自动旋转**：连续自动旋转直到余额不足
- **音效反馈**：旋转、停止、中奖、硬币等音效
- **中奖动画**：中奖线路闪烁提示和金额递增动画
- **响应式设计**：支持桌面和移动端
- **键盘支持**：空格键或回车键快速旋转

## 📁 文件结构

```
fruit/
├── src/
│   ├── types.ts          # 类型定义
│   ├── config.ts         # 游戏配置（赔付表、概率权重等）
│   ├── GameState.ts      # 游戏状态管理类
│   ├── Reel.ts           # 卷轴类
│   ├── AudioManager.ts   # 音效管理器类
│   ├── SlotMachine.ts    # 主游戏类
│   ├── main.ts           # 入口文件
│   └── style.css         # 样式文件
├── index.html            # HTML 模板
├── vite.config.ts        # Vite 配置
├── tsconfig.json         # TypeScript 配置
├── package.json          # 项目配置
└── README.md             # 说明文档
```

## 🧩 核心类说明

### `GameState` - 游戏状态管理
- 管理代币余额、当前下注、中奖记录
- 控制旋转状态、自动旋转状态
- 提供状态查询和修改方法

### `Reel` - 卷轴
- 生成随机水果符号（带权重）
- 处理卷轴滚动物理（速度、减速、停止）
- 计算当前可见的 3 个符号

### `AudioManager` - 音效管理
- 使用 Web Audio API 生成合成音效
- 支持旋转、停止、中奖、硬币、错误等音效
- 可调节音量和静音

### `SlotMachine` - 主游戏
- Canvas 渲染和游戏循环
- 旋转逻辑和停止序列
- 中奖判定和赔付计算
- UI 状态更新和事件绑定

## 🎰 赔付表 (PAYTABLE)

在 `src/config.ts` 中可以配置赔付倍数：

```typescript
export const PAYTABLE: Record<FruitType, number> = {
  cherry: 5,      // 樱桃 x5
  lemon: 8,       // 柠檬 x8
  orange: 12,     // 橙子 x12
  plum: 18,       // 李子 x18
  watermelon: 25, // 西瓜 x25
  grape: 40,      // 葡萄 x40
  seven: 100,     // 幸运7 x100
};
```

## 📊 概率权重 (FRUIT_WEIGHTS)

在 `src/config.ts` 中可以配置水果出现概率：

```typescript
export const FRUIT_WEIGHTS: Record<FruitType, number> = {
  cherry: 25,     // 最常见
  lemon: 22,
  orange: 20,
  plum: 15,
  watermelon: 10,
  grape: 6,
  seven: 2,       // 最稀有
};
```

## 🚀 开始游戏

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

## 🎯 游戏规则

1. **初始金额**：玩家初始拥有 100 枚代币
2. **下注**：使用 +/- 按钮调整下注金额（1-10）
3. **旋转**：点击"旋转"按钮开始游戏，扣除下注金额
4. **停止**：3 列卷轴依次停止（间隔约 0.5 秒）
5. **中奖判定**：任意一条中奖线上 3 个水果相同即中奖
6. **奖励计算**：奖励 = 下注金额 × 对应水果赔率
7. **自动旋转**：点击"自动"按钮，游戏将连续旋转直到余额不足或手动停止

## 🎵 操作说明

- **点击旋转按钮** 或 **Canvas 区域**：开始旋转
- **点击 +/- 按钮**：调整下注金额
- **点击自动按钮**：开启/关闭自动旋转
- **按空格键/回车键**：快速旋转

## 🎨 技术栈

- **TypeScript 5.x** - 类型安全的 JavaScript
- **Vite 6.x** - 极速的前端构建工具
- **Canvas 2D API** - 高性能图形渲染
- **Web Audio API** - 浏览器原生音频合成

## ✨ 视觉效果

- 深色渐变背景，金色边框点缀
- 水果图标使用 Emoji，无外部资源依赖
- 卷轴滚动带有平滑减速效果
- 中奖时线路金色脉冲闪烁，格子绿色高亮
- 按钮带有悬停和点击反馈
- 消息提示 3 秒后自动消失

## 🔧 自定义配置

在 `src/config.ts` 中可以修改：

- `GAME_CONFIG.initialCredits` - 初始代币数
- `GAME_CONFIG.minBet` - 最小下注
- `GAME_CONFIG.maxBet` - 最大下注
- `GAME_CONFIG.stopDelay` - 卷轴停止间隔（毫秒）
- `CELL_SIZE` - 格子大小
- `PAYLINES` - 中奖线定义

## 📱 响应式支持

游戏已适配：
- 桌面端（标准显示器）
- 平板设备
- 手机（触摸操作）

Canvas 会自动计算尺寸，按钮在触摸设备上有足够的点击区域。

---

祝您游戏愉快！🎰
