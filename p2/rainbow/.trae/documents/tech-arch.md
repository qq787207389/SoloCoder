## 1. 架构设计

```mermaid
flowchart TD
    "Vite + TypeScript 项目" --> "游戏引擎层"
    "游戏引擎层" --> "GameLoop 游戏循环"
    "游戏引擎层" --> "InputManager 输入管理"
    "游戏引擎层" --> "Camera 相机系统"
    "游戏引擎层" --> "CollisionSystem 碰撞系统"
    "游戏引擎层" --> "Renderer 渲染器"
    "游戏逻辑层" --> "Player 玩家"
    "游戏逻辑层" --> "RainbowSystem 彩虹系统"
    "游戏逻辑层" --> "EnemySystem 敌人系统"
    "游戏逻辑层" --> "Level 关卡系统"
    "游戏逻辑层" --> "ItemSystem 道具系统"
    "游戏逻辑层" --> "BossSystem Boss系统"
    "渲染层" --> "PixelRenderer 像素渲染"
    "渲染层" --> "ParticleRenderer 粒子效果"
    "渲染层" --> "BackgroundRenderer 背景渲染"
    "渲染层" --> "HUDRenderer 界面渲染"
```

## 2. 技术说明
- 前端: 纯 Canvas 2D + TypeScript + Vite
- 初始化工具: Vite (vanilla-ts 模板)
- 无后端、无数据库、无外部服务
- 所有渲染通过 Canvas 2D API 手动绘制像素风格图形

## 3. 路由定义
| 路由 | 用途 |
|------|------|
| / | 游戏主页面(包含所有游戏状态) |

游戏状态机内部路由：
| 状态 | 说明 |
|------|------|
| TITLE | 标题画面 |
| PLAYING | 游戏进行中 |
| PAUSED | 暂停 |
| BOSS | Boss 战 |
| GAMEOVER | 游戏结束 |
| LEVELCLEAR | 关卡通过 |

## 4. 核心系统设计

### 4.1 游戏循环 (GameLoop)
- 使用 `requestAnimationFrame` 驱动
- 固定时间步长(Fixed Timestep)：60 FPS 逻辑更新
- 插值渲染确保流畅
- 流程: 输入处理 → 逻辑更新 → 碰撞检测 → 渲染

### 4.2 彩虹系统 (RainbowSystem)
核心数据结构:
- RainbowSegment: 存储一段彩虹的起点、终点、颜色、生命周期
- RainbowTrail: 管理一系列连续的 RainbowSegment

机制:
- 按住攻击键: 在玩家身后持续生成 RainbowSegment，形成弧形轨迹
- 松开攻击键: 彩虹开始衰减(fade)，每个 segment 有独立的生命计时器
- 彩虹作为平台: 碰撞检测中，彩虹段被视为可站立的平台
- 彩虹作为武器: 敌人碰到彩虹段时，被弹飞并消灭
- 踩塌攻击: 按 K/X 键，所有当前彩虹瞬间消失，产生向下的冲击波伤害范围内敌人

### 4.3 碰撞系统 (CollisionSystem)
- AABB 矩形碰撞为基础
- 彩虹段使用线段碰撞检测
- 玩家与平台: 上方碰撞 → 站立; 下方碰撞 → 头顶碰撞; 侧面 → 阻挡
- 玩家与敌人: 扣血 + 无敌帧
- 敌人与彩虹: 弹飞消灭 + 粒子效果
- 玩家与道具: 收集 + 特效

### 4.4 相机系统 (Camera)
- 垂直跟随玩家，平滑插值
- 限制在关卡边界内
- 随关卡高度增加，背景色调从海蓝色渐变到深空色

### 4.5 关卡系统 (Level)
- 垂直延伸设计: 每关从海面(y=0)向上延伸至天空(y=-关卡高度)
- 关卡元素生成: 预定义 + 程序化混合
- 平台类型: 固定云朵、移动云朵、漂浮岛屿、移动泡泡
- 检查点系统: 到达特定高度自动保存

### 4.6 敌人系统
| 敌人类型 | 行为模式 | 生命值 |
|----------|----------|--------|
| 甲虫 | 地面巡逻，碰到边缘转向 | 1 |
| 水母 | 空中上下浮动，缓慢追踪玩家 | 1 |
| 飞龙 | 空中移动，定期发射弹幕 | 3 |

### 4.7 Boss 系统
- Boss 体积大，有多个攻击模式
- 弹幕攻击: Boss 发射扇形/圆形弹幕
- 冲撞攻击: Boss 向玩家冲刺
- 玩家策略: 用彩虹搭建掩体挡弹幕，在 Boss 头顶画彩虹砸伤害
- Boss 生命条显示在屏幕顶部

## 5. 文件结构

```
src/
  main.ts              # 入口点，初始化游戏
  game/
    Game.ts             # 游戏主类，状态管理
    GameLoop.ts         # 游戏循环
    Camera.ts           # 相机系统
    InputManager.ts     # 输入管理
    CollisionSystem.ts  # 碰撞检测
  entities/
    Player.ts           # 玩家角色
    Enemy.ts            # 敌人基类
    Beetle.ts           # 甲虫
    Jellyfish.ts        # 水母
    Dragon.ts           # 飞龙
    Boss.ts             # Boss
  systems/
    RainbowSystem.ts    # 彩虹系统
    EnemySystem.ts      # 敌人管理
    ItemSystem.ts       # 道具管理
    ParticleSystem.ts   # 粒子效果
  level/
    Level.ts            # 关卡类
    LevelData.ts        # 关卡数据定义
    Platform.ts         # 平台基类
  rendering/
    Renderer.ts         # 主渲染器
    PixelRenderer.ts    # 像素风绘制工具
    BackgroundRenderer.ts # 背景渲染
    HUDRenderer.ts      # HUD渲染
    SpriteSheet.ts      # 精灵表管理
  utils/
    Vector2.ts          # 二维向量
    MathUtils.ts        # 数学工具
    Constants.ts        # 游戏常量
```

## 6. 性能考量
- Canvas 渲染优化: 只绘制可见区域内的对象
- 对象池: 粒子和弹幕使用对象池避免频繁 GC
- 碰撞优化: 空间分区(Spatial Hash)减少碰撞检测次数
- 离屏 Canvas: 背景层使用离屏 Canvas 缓存
