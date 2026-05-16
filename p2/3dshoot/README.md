# 都市风暴 - Urban Storm

一款基于 TypeScript + Vite + Three.js + WebSocket 的网页第一人称多人射击游戏。

## 项目结构

```
urban-storm/
├── src/                          # 客户端代码
│   ├── core/                     # 核心模块
│   │   ├── GameEngine.ts         # 游戏引擎
│   │   ├── SceneManager.ts       # 场景管理
│   │   ├── InputManager.ts       # 输入管理
│   │   ├── PhysicsWorld.ts       # 物理世界
│   │   └── ResourceManager.ts    # 资源管理
│   ├── player/                   # 玩家模块
│   │   └── PlayerController.ts   # 玩家控制器
│   ├── weapons/                  # 武器系统
│   │   └── WeaponSystem.ts       # 武器管理
│   ├── network/                  # 网络模块
│   │   └── NetworkClient.ts      # 网络客户端
│   ├── ui/                       # UI模块
│   │   └── UIManager.ts          # UI管理
│   ├── config/                   # 配置文件
│   │   └── WeaponConfig.ts       # 武器配置
│   ├── main.ts                   # 入口文件
│   └── style.css                 # 样式文件
├── server/                        # 服务端代码
│   └── index.ts                  # WebSocket服务器
├── index.html                     # HTML入口
├── package.json                   # 依赖配置
├── tsconfig.json                  # TypeScript配置
└── vite.config.ts                 # Vite配置
```

## 功能特性

### 3D场景与角色
- **都市环境**: 建筑物、墙壁、地面、灯光等完整的城市场景
- **第一人称视角**: 完整的FPS视角控制
- **碰撞检测**: AABB碰撞检测，支持复杂场景碰撞
- **移动系统**: WASD移动、空格键跳跃、Ctrl下蹲
- **步伐晃动**: 角色移动时的头部晃动效果
- **动态光照**: 方向光 + 点光源 + 阴影
- **后处理效果**: SSAO（屏幕空间环境光遮蔽） + Bloom（泛光）

### 武器系统
- **三种武器**: 手枪（高伤害/低射速）、突击步枪（均衡）、狙击枪（高伤害/远距离）
- **后坐力模式**: 每种武器独特的后坐力曲线
- **弹道射线**: Raycasting射线检测命中
- **弹壳抛出**: 射击时的弹壳抛射物理效果
- **枪口火焰**: 动态的枪口闪光特效
- **屏幕震动**: 射击时的屏幕震动反馈
- **武器状态机**: 射击、换弹、切换的完整状态管理
- **动态扩散**: 连续射击导致的准星扩散

### 物理与反馈
- **材质差异化**: 不同材质的受击特效
- **可破坏物体**: 木箱、玻璃面板可被破坏
- **布娃娃效果**: 敌人死亡后的物理模拟
- **击退效果**: 命中时的物理反馈

### 多人对战
- **客户端预测**: 本地输入立即响应，减少感知延迟
- **服务端权威**: 服务端最终判定所有游戏状态
- **回滚延迟补偿**: 针对网络延迟的射击判定补偿
- **实体插值**: 平滑显示其他玩家的移动
- **房间系统**: 支持房间创建与加入，最多10人同服
- **状态同步**: 60Hz的游戏状态同步频率

### UI/HUD系统
- **动态准星**: 根据移动、射击状态动态扩散
- **弹药显示**: 当前/最大弹药数
- **生命值条**: 可视化血量显示
- **小地图**: 2D俯视图小地图，显示队友和敌人位置
- **击杀信息**: 实时显示击杀事件
- **计分板**: Tab键显示，包含击杀、死亡数据
- **加载界面**: 资源加载进度显示
- **主菜单**: 开始游戏、控制说明

### 资源管理
- **异步加载**: 纹理、模型、音效的异步并行加载
- **进度条**: 加载进度可视化
- **资源缓存**: 避免重复加载

## 技术实现

### 运行环境要求
- Node.js 16+
- 现代浏览器（支持 WebSocket、WebGL）

### 安装依赖
```bash
npm install
```

### 启动服务器
```bash
npm run server
```

### 启动客户端开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## 网络同步与延迟补偿技术解析

### 1. 客户端预测（Client-Side Prediction）

**核心问题**: 网络延迟（如200ms RTT）会导致玩家操作响应迟缓，破坏沉浸感。

**解决方案**: 客户端在输入后立即应用本地预测，不等待服务器响应。

**实现流程**:
```
玩家输入 → 本地立即执行移动/射击 → 发送到服务器 → 服务器验证 → 修正（如需要）
```

**关键代码（NetworkClient.ts）**:
```typescript
// 输入序列号，用于服务器验证
this.inputSequence++

// 立即应用本地预测（PlayerController.ts）
this.position.add(this.velocity.clone().multiplyScalar(deltaTime))

// 发送到服务器
this.socket.send(JSON.stringify({
  type: 'playerState',
  payload: {
    x, y, z, rotation, velocity,
    sequence: this.inputSequence,
    timestamp: Date.now()
  }
}))

// 保存未确认的输入，用于回滚
this.pendingInputs.push({ sequence, ... })
```

**注意事项**:
- 必须保存未被服务器确认的输入状态
- 服务器返回状态时，需要重放后续输入以保证一致性
- 物理模拟必须客户端/服务端完全一致（确定性）

### 2. 服务器权威（Server Authority）

**核心问题**: 客户端不可信任，防止作弊（如穿墙、秒杀、瞬移）。

**解决方案**: 服务器拥有最终决定权，所有关键操作必须经服务器验证。

**验证内容**:
- **位置验证**: 检查移动距离是否在合理范围内
- **速度验证**: 检查移动速度是否超出角色能力
- **碰撞验证**: 检查新位置是否与场景物体碰撞
- **射击验证**: 检查射击频率、伤害值、弹道合理性

**关键代码（server/index.ts）**:
```typescript
function handlePlayerShoot(playerId, payload) {
  const player = players.get(playerId)
  
  // 1. 射速验证（防作弊）
  const now = Date.now()
  if (now - player.lastShot < 100) return
  player.lastShot = now
  
  // 2. 弹道验证
  const direction = normalize(payload.direction)
  const ray = createRay(payload.origin, direction)
  
  // 3. 服务端重新进行碰撞检测
  const hit = raycast(ray, sceneObjects)
  
  // 4. 伤害应用
  if (hit) applyDamage(hit.target, weapon.damage)
}
```

### 3. 延迟补偿（Lag Compensation）

**核心问题**: 玩家A看到的玩家B位置是几百毫秒前的位置，直接射击会"打空"。

**解决方案**: 服务器回溯目标到射击发生时的位置，再进行命中判定。

**算法流程**:
```
玩家射击（T0）→ 数据包到服务器（T1）→ 服务器：
  1. 计算网络延迟：RTT = T1 - T0
  2. 回溯目标到 T = T1 - RTT/2 时的位置
  3. 在回溯位置进行命中检测
  4. 应用伤害（但不移动目标，只修正判定）
```

**关键代码（server/index.ts）**:
```typescript
function lagCompensateShoot(shooterId, payload) {
  const shootTime = payload.timestamp
  const now = Date.now()
  const latency = now - shootTime
  
  room.players.forEach(target => {
    if (target.id === shooterId) return
    
    // 获取目标在射击时刻的历史位置
    const historicalPos = getPositionAtTime(target, shootTime)
    
    // 在历史位置进行命中检测
    const hit = checkHit(payload.ray, historicalPos)
    
    if (hit) {
      // 命中判定成功，应用伤害
      applyDamage(target, damage)
      
      // 但目标位置不回溯，继续正常移动
    }
  })
}
```

**历史位置存储**:
```typescript
// 每个玩家保存最近1秒（60帧）的位置历史
interface PositionHistory {
  timestamp: number
  position: Vector3
}

// 使用插值获取任意时刻的位置
function getPositionAtTime(player, targetTime) {
  const history = player.positionHistory
  
  // 找到包围目标时间的两个关键帧
  const [prev, next] = findBoundingFrames(history, targetTime)
  
  // 线性插值
  const t = (targetTime - prev.timestamp) / (next.timestamp - prev.timestamp)
  return lerp(prev.position, next.position, t)
}
```

### 4. 实体插值（Entity Interpolation）

**核心问题**: 服务器以离散间隔（如60Hz）发送状态，直接使用会导致其他玩家移动卡顿。

**解决方案**: 在两个服务器状态之间进行平滑插值，生成中间帧。

**实现方式**:
```
客户端渲染时间 = 服务器时间 - 插值延迟（如100ms）

帧1（T0） → 插值 → 帧2（T1）
   ↓              ↓
位置P0    →    位置P1

渲染在 T0 + delay 时刻，使用 P0 和 P1 插值
```

**关键代码（NetworkClient.ts）**:
```typescript
public getInterpolatedPlayerState(playerId: string) {
  const states = this.playerStates.get(playerId)
  if (!states || states.length < 2) return null
  
  const now = Date.now()
  const renderTime = now - 100 // 100ms 插值延迟
  
  // 找到合适的插值区间
  while (states.length >= 2 && states[1].timestamp <= renderTime) {
    states.shift()
  }
  
  if (states.length < 2) return states[0]
  
  // 计算插值系数
  const t0 = states[0].timestamp
  const t1 = states[1].timestamp
  const alpha = (renderTime - t0) / (t1 - t0)
  
  // 线性插值所有属性
  return {
    position: states[0].position.lerp(states[1].position, alpha),
    rotation: slerp(states[0].rotation, states[1].rotation, alpha),
    velocity: lerp(states[0].velocity, states[1].velocity, alpha)
  }
}
```

### 5. 状态回滚与纠正（State Rollback & Correction）

**核心问题**: 客户端预测可能与服务器最终状态不一致。

**解决方案**: 服务器返回权威状态时，客户端进行平滑纠正。

**纠正策略**:
- **立即纠正**: 差异过大时直接跳转到正确位置（会有闪烁）
- **平滑纠正**: 在几帧内逐渐移动到正确位置（视觉更平滑）
- **速度修正**: 调整速度而不是位置，让玩家自然到达正确位置

**关键代码**:
```typescript
function reconcileState(serverState) {
  const clientState = this.localState
  
  const posDiff = distance(clientState.position, serverState.position)
  
  if (posDiff > 5) {
    // 差异太大，立即纠正
    this.localState.position = serverState.position
  } else if (posDiff > 0.1) {
    // 平滑纠正，在 100ms 内完成
    this.correctionTarget = serverState.position
    this.correctionTime = 0.1
  }
  
  // 重放服务器确认后发生的输入
  for (const input of this.pendingInputs) {
    if (input.sequence > serverState.lastSequence) {
      this.applyInput(this.localState, input)
    }
  }
}
```

### 6. 抖动缓冲（Jitter Buffer）

**核心问题**: 网络抖动导致数据包到达时间不规则，造成播放卡顿。

**解决方案**: 在客户端缓冲一定数量的状态包，平滑处理时间波动。

**实现要点**:
- 缓冲区大小 = 预期抖动 + 安全余量（如 50ms）
- 动态调整缓冲区大小以适应网络条件变化
- 使用加权移动平均估算抖动

```typescript
class JitterBuffer {
  private buffer: State[] = []
  private targetDelay = 50 // ms
  private jitterEstimate = 0
  
  add(state: State, arrivalTime: number) {
    // 更新抖动估算
    const interArrivalTime = arrivalTime - this.lastArrivalTime
    this.jitterEstimate = 0.9 * this.jitterEstimate + 0.1 * Math.abs(interArrivalTime - 16.67)
    
    this.buffer.push(state)
    
    // 动态调整目标延迟
    this.targetDelay = 50 + this.jitterEstimate * 2
  }
  
  get(now: number): State {
    const targetTime = now - this.targetDelay
    // 查找最接近目标时间的状态
    return findClosestState(this.buffer, targetTime)
  }
}
```

## 网络架构总结

```
┌─────────────────────────────────────────────────────────┐
│                      客户端                                │
│  ┌───────────────┐    ┌───────────────┐    ┌─────────┐ │
│  │  输入收集器   │ →  │  客户端预测   │ →  │ 渲染   │ │
│  └───────────────┘    └───────────────┘    └─────────┘ │
│         ↓                    ↑                           │
│  ┌───────────────┐    ┌───────────────┐                  │
│  │  实体插值器   │ ←  │ 抖动缓冲区   │                  │
│  └───────────────┘    └───────────────┘                  │
└───────────────────────────┬───────────────────────────────┘
                            │ WebSocket
                            ▼
┌─────────────────────────────────────────────────────────┐
│                      服务器                                │
│  ┌───────────────┐    ┌───────────────┐    ┌─────────┐ │
│  │  状态验证器   │ →  │ 延迟补偿器   │ →  │ 广播   │ │
│  └───────────────┘    └───────────────┘    └─────────┘ │
│         ↓                    ↑                           │
│  ┌───────────────┐    ┌───────────────┐                  │
│  │  历史位置库   │ →  │  游戏逻辑    │                  │
│  └───────────────┘    └───────────────┘                  │
└─────────────────────────────────────────────────────────┘
```

## 性能优化建议

1. **带宽优化**:
   - 只发送变化的状态（增量更新）
   - 使用二进制协议（如Protocol Buffers）替代JSON
   - 降低非关键对象的更新频率

2. **CPU优化**:
   - 空间分区（Octree/Grid）加速碰撞检测
   - 对象池减少GC压力
   - WebWorker处理物理计算

3. **内存优化**:
   - 限制历史状态缓冲区大小
   - 及时清理断开连接的玩家数据
   - 纹理/模型资源压缩

## 控制说明

| 按键 | 功能 |
|------|------|
| W/A/S/D | 移动 |
| 鼠标移动 | 视角旋转 |
| 鼠标左键 | 射击 |
| 空格 | 跳跃 |
| Ctrl/C | 下蹲 |
| R | 换弹 |
| 1/2/3 | 切换武器 |
| Tab | 显示计分板 |

## 技术栈

- **前端**: TypeScript + Vite + Three.js
- **后端**: Node.js + ws (WebSocket)
- **物理**: 自定义AABB碰撞检测
- **网络**: WebSocket + 客户端预测 + 延迟补偿

## 许可证

MIT
