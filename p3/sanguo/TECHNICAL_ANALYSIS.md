# 霸业三国志 - 技术分析文档

## 一、战斗技能解释器实现

### 1.1 核心架构
战斗系统采用**事件驱动架构**，基于半即时制（ATB - Active Time Battle）设计。每个战斗单位拥有独立的ATB槽，充能完成后即可行动。

### 1.2 技能执行流程
```
技能触发
    ↓
目标选择（单体/全体/己方）
    ↓
效果解析循环（damage/heal/buff/debuff）
    ↓
    ├─ 伤害计算：攻击力 × 技能系数 × 阵营克制 × 暴击倍率
    ├─ 治疗计算：攻击力 × 治疗系数
    └─ 状态效果：持续时间 + 数值加成
    ↓
日志记录
    ↓
更新战斗状态
```

### 1.3 伤害计算公式
```
最终伤害 = (攻击力 × 技能系数 - 防御力 × 0.5) × 阵营克制 × 暴击加成

阵营克制：
- 魏克蜀 → +15%伤害
- 蜀克吴 → +15%伤害
- 吴克魏 → +15%伤害
- 群雄：无克制关系

暴击：
- 暴击率：基础 + 装备 + BUFF
- 暴击伤害：150% + 装备加成 + BUFF加成
```

### 1.4 BUFF系统实现
```typescript
interface Buff {
  id: string           // 唯一标识
  name: string         // 名称
  type: 'buff' | 'debuff'
  stat: keyof Stats    // 影响属性
  value: number        // 数值（百分比/绝对值）
  duration: number     // 剩余回合
  maxDuration: number  // 最大回合数
}

// BUFF应用策略
- 同名BUFF刷新持续时间，不叠加
- 同类BUFF取最大值生效
- 永久类BUFF（duration=-1）不受回合影响
```

## 二、保底算法实现

### 2.1 抽卡概率模型
三种卡池采用不同的概率模型：

| 稀有度 | 普通招募 | 限定招募 | 友情招募 |
|--------|----------|----------|----------|
| N      | 50%      | 45%      | 70%      |
| R      | 35%      | 35%      | 25%      |
| SR     | 12%      | 14%      | 5%       |
| SSR    | 2.5%     | 4.5%     | -        |
| UR     | 0.5%     | 1.5%     | -        |

### 2.2 保底算法核心

#### 软保底（Soft Pity）
```typescript
function calculateSoftPityRate(baseRate: number, pityCount: number, softPityStart: number): number {
  if (pityCount < softPityStart) return baseRate
  
  // 超过软保底阈值后，每抽增加2%概率
  const extraPity = (pityCount - softPityStart) * 0.02
  return Math.min(baseRate + extraPity, 1.0)
}
```

#### 硬保底（Hard Pity）
```typescript
function getCardRarity(pool: GachaPool, pityCount: number): Rarity {
  // 硬保底：达到阈值必出最高稀有度
  if (pityCount >= pool.hardPity) {
    return getHighestRarity(pool)
  }
  
  // 软保底概率加成
  let rates = pool.rates.map(rate => ({
    ...rate,
    rate: calculateSoftPityRate(rate.rate, pityCount, pool.softPity)
  }))
  
  // 加权随机抽取
  return weightedRandom(rates)
}
```

#### 十连保底机制
```typescript
// 第10抽必出SR及以上
if (pullIndex === 9 && !hasPurpleOrAbove) {
  // SR概率70%，SSR概率30%
  const guaranteedRarity = Math.random() < 0.3 ? 'SSR' : 'SR'
  return selectHeroByRarity(guaranteedRarity)
}
```

### 2.3 保底计数器策略
```typescript
// 计数器规则
- 每抽+1，获得SSR/UR时重置为0
- 不同卡池计数器独立
- 十连抽逐次检查保底，单次十连中获得稀有即重置
- 限定卡池保底不继承到普通卡池

// 伪代码示例
pityCounter[poolId]++
const result = performSinglePull()
if (result.rarity === 'SSR' || result.rarity === 'UR') {
  pityCounter[poolId] = 0
}
```

## 三、技术栈与架构设计

### 3.1 核心技术栈
- **框架**：React 18 + TypeScript
- **构建工具**：Vite 4.x
- **状态管理**：Zustand
- **样式方案**：Inline CSS（零依赖）

### 3.2 目录结构
```
sanguo/
├── src/
│   ├── types/          # 类型定义
│   ├── data/           # 配置数据（英雄、技能、装备等）
│   ├── logic/          # 核心业务逻辑
│   │   ├── battle.ts   # 战斗系统
│   │   ├── gacha.ts    # 抽卡系统
│   │   └── upgrade.ts  # 养成系统
│   ├── store/          # Zustand状态管理
│   └── components/     # React组件
└── index.html
```

### 3.3 数据流设计
```
用户操作 → Action → Store更新 → 视图重新渲染
     ↓                              ↑
  业务逻辑层 ──────────────────────┘
  (纯函数、可测试)
```

## 四、性能优化点

1. **战斗模拟优化**：使用纯函数模拟战斗，不产生副作用，可Web Worker化
2. **状态管理**：Zustand轻量架构，避免不必要的重渲染
3. **动画性能**：CSS3翻牌动画使用transform而非重排属性
4. **数据驱动**：所有配置通过JSON定义，便于后续扩展

## 五、扩展方向

1. 后端对接：当前所有API为Promise模拟，替换为真实接口即可
2. 多人PVP：战斗系统支持玩家对战扩展
3. 更多玩法：副本、竞技场、公会战等
4. 特效增强：使用Canvas/WebGL实现更华丽的战斗特效
