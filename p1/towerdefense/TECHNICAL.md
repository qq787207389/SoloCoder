# 塔防游戏 - 技术文档

## 目录
1. [动态寻路与障碍物联动机制](#1-动态寻路与障碍物联动机制)
2. [怪物行为树实现](#2-怪物行为树实现)
3. [塔融合系统设计](#3-塔融合系统设计)
4. [性能优化策略](#4-性能优化策略)

---

## 1. 动态寻路与障碍物联动机制

### 1.1 网格系统设计

游戏地图被划分为规则的网格，每个单元格具有以下属性：
- **坐标**：(x, y) 网格坐标
- **可行走状态**：布尔值，表示怪物能否通过
- **移动成本**：默认 1，特殊地形可设置更高值

```typescript
class Grid {
  width: number;
  height: number;
  cellSize: number;
  cells: GridCell[][];
  
  setWalkable(x: number, y: number, walkable: boolean): void;
  isWalkable(x: number, y: number): boolean;
  worldToGrid(worldX: number, worldY: number): { x: number; y: number };
  gridToWorld(gridX: number, gridY: number): { x: number; y: number };
}
```

### 1.2 A* 寻路算法实现

#### 算法原理
A* 算法使用启发式函数估计从当前节点到目标的代价，公式为：
```
f(n) = g(n) + h(n)
```
- `g(n)`: 从起点到节点 n 的实际代价
- `h(n)`: 从节点 n 到终点的估计代价（启发式函数）

#### 启发式函数选择
使用 **对角线距离**（Chebyshev 距离）：
```typescript
private heuristic(x1: number, y1: number, x2: number, y2: number): number {
  const dx = Math.abs(x1 - x2);
  const dy = Math.abs(y1 - y2);
  return (dx + dy) + (1.4 - 2) * Math.min(dx, dy);
}
```
这种启发式函数适合 8 方向移动的网格。

#### Open List 和 Closed List
- **Open List**: 优先队列，按 f 值排序，存储待考察节点
- **Closed List**: Set 集合，存储已考察过的节点

### 1.3 路径平滑优化

原始 A* 生成的路径可能包含不必要的拐点，使用 **视线检测（Line of Sight）** 进行平滑：

```typescript
static smoothPath(path: { x: number; y: number }[], grid: Grid): { x: number; y: number }[] {
  if (path.length < 3) return path;
  
  const smoothed: { x: number; y: number }[] = [path[0]];
  let currentIndex = 0;
  
  while (currentIndex < path.length - 1) {
    let found = false;
    for (let i = path.length - 1; i > currentIndex; i--) {
      if (this.hasLineOfSight(path[currentIndex], path[i], grid)) {
        smoothed.push(path[i]);
        currentIndex = i;
        found = true;
        break;
      }
    }
    if (!found) {
      currentIndex++;
      smoothed.push(path[currentIndex]);
    }
  }
  return smoothed;
}
```

####  Bresenham 直线算法
用于检测两点之间是否有障碍物：
```typescript
private static hasLineOfSight(start: Point, end: Point, grid: Grid): boolean {
  let x0 = start.gridX;
  let y0 = start.gridY;
  const x1 = end.gridX;
  const y1 = end.gridY;
  
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  
  while (x0 !== x1 || y0 !== y1) {
    if (!grid.isWalkable(x0, y0)) return false;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 < dx) { err += dx; y0 += sy; }
  }
  return true;
}
```

### 1.4 障碍物联动机制

#### 防御塔放置
当玩家放置防御塔时：
1. 将对应网格标记为不可行走
2. 后续生成的怪物会使用新的路径

#### 动态路径更新
```typescript
// 在 spawnMonster 中调用
const path = this.pathfinder.findPath(startX, startY, endX, endY);
const smoothedPath = PathSmoother.smoothPath(path, this.grid);
```

**设计考虑**：
- 不实时更新已生成怪物的路径，避免"瞬移"现象
- 新生成的怪物使用最新路径
- 保证游戏体验的连贯性

---

## 2. 怪物行为树实现

### 2.1 行为树架构

使用 **组件化设计** 实现怪物行为，而非传统的行为树节点：

```typescript
// 基础组件
class PathFollowingComponent {
  path: Point[];
  currentIndex: number;
  reachedEnd: boolean;
}

class MonsterComponent {
  type: MonsterType;
  reward: number;
  isElite: boolean;
}
```

### 2.2 各类型怪物行为实现

#### 普通怪物 (Normal)
```typescript
// PathFollowingSystem 处理
if (pathFollow.reachedEnd || pathFollow.path.length === 0) {
  vel.vx = 0; vel.vy = 0; return;
}

const target = pathFollow.path[pathFollow.currentIndex];
const dx = target.x - pos.x;
const dy = target.y - pos.y;
const dist = Math.sqrt(dx * dx + dy * dy);

if (dist < 5) {
  pathFollow.currentIndex++; // 到达目标点，移动到下一个
} else {
  vel.vx = (dx / dist) * speed;
  vel.vy = (dy / dist) * speed;
}
```

#### 遁地怪物 (Burrow)
```typescript
class BurrowComponent {
  isUnderground: boolean;
  undergroundSpeedMultiplier: number = 0.5;
  emergeTime: number;
  emergeDuration: number = 0.5;
}

// BurrowSystem 处理
if (burrow.isUnderground && Math.random() < 0.001) {
  burrow.isUnderground = false;
  burrow.emergeTime = game.currentTime;
} else if (!burrow.isUnderground && Math.random() < 0.002) {
  burrow.isUnderground = true;
}

// 速度修正
if (burrow && burrow.isUnderground) {
  speed *= burrow.undergroundSpeedMultiplier;
}

// 攻击过滤（塔无法攻击地下的怪物）
if (burrow && burrow.isUnderground) {
  continue; // 跳过此目标
}
```

#### 飞行怪物 (Flying)
```typescript
class FlyingComponent {
  altitude: number = 30;
  bobAmplitude: number = 5;
  bobFrequency: number = 2;
  bobPhase: number;
}

// 渲染时的高度偏移
const drawY = pos.y - flying.altitude - 
  Math.sin(game.currentTime * flying.bobFrequency + flying.bobPhase) * flying.bobAmplitude;

// 攻击过滤（只有防空塔能攻击飞行怪）
if (flying && !tower.canTargetFlying) {
  continue;
}
```

#### 护盾怪物 (Shield)
```typescript
class ShieldComponent {
  shieldHealth: number;
  maxShieldHealth: number;
  broken: boolean = false;
  speedReduction: number = 0.5;
  
  takeDamage(amount: number): number {
    if (this.broken) return amount;
    const absorbed = Math.min(this.shieldHealth, amount);
    this.shieldHealth -= absorbed;
    if (this.shieldHealth <= 0) {
      this.broken = true;
    }
    return amount - absorbed;
  }
}

// 速度修正（护盾未破时减速）
if (shield && !shield.broken) {
  speed *= shield.speedReduction;
}
```

#### BOSS 怪物
```typescript
class BossComponent {
  phase: number = 1;
  maxPhases: number = 3;
  phaseThresholds: number[] = [0.66, 0.33, 0];
  specialAbilityCooldown: number = 10;
  lastSpecialAbilityTime: number = 0;
  currentAbility: string | null;
}

// 阶段检测
const healthPercent = health.current / health.max;
for (let i = boss.phase - 1; i < boss.phaseThresholds.length; i++) {
  if (healthPercent <= boss.phaseThresholds[i]) {
    boss.phase = i + 2;
    effectSystem.spawnBossPhaseEffect(pos.x, pos.y);
    break;
  }
}

// 特殊技能
if (game.currentTime - boss.lastSpecialAbilityTime > boss.specialAbilityCooldown) {
  boss.lastSpecialAbilityTime = game.currentTime;
  triggerBossAbility(boss.phase);
}
```

### 2.3 行为组合与优先级

通过 **系统执行顺序** 控制行为优先级：

```
1. MovementSystem          → 基础移动
2. PathFollowingSystem     → 路径跟随（可被其他组件修改速度）
   ↳ Burrow 减速
   ↳ Shield 减速
   ↳ ...
3. ProjectileSystem        → 投射物运动
4. TowerAttackSystem       → 塔攻击判定
5. MonsterReachedEndSystem → 怪物到达终点处理
6. DeadEntityCleanupSystem → 死亡清理
7. ParticleSystem          → 粒子更新
8. BurrowSystem            → 遁地状态切换
9. BossSystem              → BOSS阶段和技能
```

---

## 3. 塔融合系统设计

### 3.1 基础塔类型设计

| 塔类型 | 伤害 | 攻速 | 范围 | 成本 | 特殊能力 |
|--------|------|------|------|------|----------|
| 箭塔   | 15   | 1.5/s| 150  | 100  | 平衡型 |
| 炮塔   | 40   | 0.5/s| 120  | 200  | 高伤害 |
| 冰塔   | 8    | 2/s  | 130  | 150  | 高攻速 |
| 防空塔 | 25   | 1.2/s| 200  | 180  | 可攻击飞行单位 |

### 3.2 塔组件结构

```typescript
class TowerComponent {
  type: TowerType;
  level: number = 1;
  maxLevel: number = 3;
  range: number;
  attackSpeed: number;
  lastFireTime: number;
  cost: number;
  canTargetFlying: boolean;
  damageMultiplier: number = 1;
}
```

### 3.3 攻击系统流程

```typescript
// TowerAttackSystem
update(entities: Entity[], deltaTime: number): void {
  const currentTime = game.currentTime;
  const monsters = getMonsterEntities();

  for (const tower of entities) {
    const towerComp = tower.getComponent(TowerComponent);
    const attackComp = tower.getComponent(AttackComponent);
    const pos = tower.getComponent(PositionComponent);

    // 冷却检测
    if (currentTime - attackComp.lastAttackTime < attackComp.cooldown) {
      continue;
    }

    // 目标选择
    let target: Entity | null = null;
    let minDist = Infinity;

    for (const monster of monsters) {
      const monsterPos = monster.getComponent(PositionComponent);
      const distance = calculateDistance(pos, monsterPos);
      
      if (distance <= towerComp.range && distance < minDist) {
        if (isValidTarget(towerComp, monster)) {
          minDist = distance;
          target = monster;
        }
      }
    }

    // 发射投射物
    if (target) {
      attackComp.lastAttackTime = currentTime;
      game.spawnProjectile(pos.x, pos.y, target.id, towerComp.type);
      effectSystem.spawnMuzzleFlash(pos.x, pos.y);
    }
  }
}
```

### 3.4 融合机制（设计方案）

虽然当前版本未完全实现，但架构已支持以下功能：

#### 融合条件
- 两座满级塔（Lv3）
- 相邻放置（8方向）
- 消耗灵魂石（通过击杀精英怪/BOSS获得）

#### 融合效果
```typescript
class FusionComponent {
  isFused: boolean = false;
  baseTowerTypes: TowerType[];
  fusionLevel: number;
  specialAbility: string;
}

// 融合效果示例
// 箭塔 + 冰塔 = 冰冻箭塔（减速 + 伤害）
// 炮塔 + 防空塔 = 对空炮塔（范围伤害 + 对空）
```

#### 拆解机制
- 融合塔可以拆解为原始两座塔
- 返还部分灵魂石
- 保留原始等级和属性

---

## 4. 性能优化策略

### 4.1 实体管理优化

#### 使用 Map 存储实体
```typescript
class EntityManager {
  private entities: Map<number, Entity>; // O(1) 查找
  
  getEntity(id: number): Entity | undefined {
    return this.entities.get(id);
  }
}
```

#### 系统过滤优化
每个系统只处理拥有特定组件的实体：
```typescript
getEntitiesWithComponents(types: ComponentType[]): Entity[] {
  return this.getAllEntities().filter(entity => 
    entity.hasComponents(types)
  );
}
```

### 4.2 渲染优化

#### 分层渲染
```typescript
// RenderSystem.render()
private drawEntities(): void {
  // 1. 绘制塔（底层）
  // 2. 绘制怪物（中层）
  // 3. 绘制粒子特效（顶层）
}
```

#### 脏矩形渲染（设计中）
仅重绘变化区域：
```typescript
class DirtyRectManager {
  dirtyAreas: Rect[] = [];
  
  markDirty(x: number, y: number, width: number, height: number): void;
  mergeDirtyAreas(): void;
  clear(): void;
}
```

### 4.3 碰撞检测优化

#### 空间分区 - 四叉树（设计中）
```typescript
class QuadTree {
  boundary: Rect;
  capacity: number;
  entities: Entity[];
  divided: boolean;
  northWest: QuadTree | null;
  northEast: QuadTree | null;
  southWest: QuadTree | null;
  southEast: QuadTree | null;
  
  insert(entity: Entity): boolean;
  query(range: Rect): Entity[];
}
```

#### 距离平方比较
避免开方运算：
```typescript
const dx = target.x - pos.x;
const dy = target.y - pos.y;
const distSquared = dx * dx + dy * dy; // 使用平方比较
const rangeSquared = range * range;

if (distSquared <= rangeSquared) {
  // 在范围内
}
```

### 4.4 对象池（设计中）

```typescript
class ObjectPool<T> {
  private pool: T[];
  private factory: () => T;
  private reset: (obj: T) => void;
  
  acquire(): T {
    return this.pool.pop() || this.factory();
  }
  
  release(obj: T): void {
    this.reset(obj);
    this.pool.push(obj);
  }
}

// 使用场景
// - 粒子对象
// - 投射物对象
// - 怪物对象
```

### 4.5 性能监控指标

关键性能指标（FPS）：
- **低端移动设备**：目标 30+ FPS
- **同屏 50+ 怪物**：正常运行
- **15+ 防御塔**：正常运行
- **大量粒子效果**：正常运行

### 4.6 内存优化

- **组件复用**：相同类型组件共享原型
- **延迟删除**：使用标记删除，在帧结束时统一清理
- **对象池化**：高频创建/销毁的对象使用池

---

## 总结

本塔防游戏采用现代化的游戏开发架构：

1. **ECS 架构** 提供良好的扩展性和性能
2. **A* 寻路** 实现动态路径生成
3. **组件化行为** 实现多样化的怪物AI
4. **分层渲染** 保证视觉效果和性能
5. **性能优化策略** 确保在低端设备流畅运行

架构设计充分考虑了未来的扩展需求，可以轻松添加新的塔类型、怪物类型和游戏机制。
