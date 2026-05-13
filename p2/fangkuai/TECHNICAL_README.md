# AOER方块 - 技术解析

## 1. T-Spin检测原理

### 什么是T-Spin？
T-Spin是现代俄罗斯方块中的高级技巧，指在放置T型方块时，方块的三个角被阻挡，同时满足特定旋转条件。T-Spin可以获得比普通消行更高的分数奖励。

### 检测算法实现

#### 核心检测条件
在 `src/engine/TSpinDetector.ts` 中，我们实现了基于官方指南的T-Spin检测逻辑：

```typescript
static detect(piece: Piece, board: Board, lastKickIndex: number, wasRotated: boolean): TSpinType {
  // 1. 必须是T型方块
  if (piece.type !== 'T' || !wasRotated) {
    return 'none';
  }

  const centerX = piece.x + 1;
  const centerY = piece.y + 1;

  // 2. 检查四个角的填充状态
  const cornerPositions = [
    { x: centerX - 1, y: centerY - 1 }, // 左上
    { x: centerX + 1, y: centerY - 1 }, // 右上
    { x: centerX - 1, y: centerY + 1 }, // 左下
    { x: centerX + 1, y: centerY + 1 }  // 右下
  ];

  let filledCorners = 0;
  for (const pos of cornerPositions) {
    if (/* 越界或已填充 */) {
      filledCorners++;
    }
  }

  // 3. 至少3个角被填充
  if (filledCorners >= 3) {
    // 4. 检查是否使用了第5个墙踢（fin kick）
    if (lastKickIndex === 4) {
      return 'full';
    }

    // 5. 检查面朝方向的两个角是否都被填充
    const frontCorners = this.getFrontCorners(piece, centerX, centerY);
    let filledFrontCorners = 0;
    for (const pos of frontCorners) {
      if (/* 越界或已填充 */) {
        filledFrontCorners++;
      }
    }

    if (filledFrontCorners >= 2) {
      return 'full';
    } else {
      return 'mini';
    }
  }

  return 'none';
}
```

### 关键判定点

1. **方块类型检查**：只有T型方块才能触发T-Spin
2. **旋转验证**：必须是通过旋转放置的方块（硬降或移动不算）
3. **三角规则**：T型方块中心的四个对角中，至少三个被填充（包括边界）
4. **墙踢判定**：如果使用了第5个墙踢（fin kick），直接判定为Full T-Spin
5. **正面两角**：如果正面的两个角都被填充，也是Full T-Spin，否则是Mini T-Spin

### 分数计算
- T-Spin Mini: 100分 × 等级
- T-Spin Mini Single: 200分 × 等级
- T-Spin Mini Double: 400分 × 等级
- T-Spin: 400分 × 等级
- T-Spin Single: 800分 × 等级
- T-Spin Double: 1200分 × 等级
- T-Spin Triple: 1600分 × 等级

---

## 2. SRS (Super Rotation System) 墙壁踢

### 什么是SRS？
SRS是现代俄罗斯方块的标准旋转系统。当旋转方块时，如果旋转后的位置与已有方块或边界重叠，系统会尝试一系列"墙踢"偏移来寻找有效的放置位置。

### 墙踢表定义
在 `src/constants.ts` 中定义了三种墙踢表：

```typescript
export const WALL_KICKS: Record<string, number[][][]> = {
  // JLSTZ型方块的墙踢表（适用于J、L、S、T、Z型）
  JLSTZ: [
    [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],   // 0→R
    [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],       // R→0
    [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],      // 2→R
    [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]]     // L→0
  ],
  
  // I型方块的墙踢表
  I: [
    [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],     // 0→R
    [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],     // R→0
    [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],     // 2→R
    [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]]      // L→0
  ],
  
  // O型方块不旋转
  O: [[[0, 0]], [[0, 0]], [[0, 0]], [[0, 0]]]
};
```

### 旋转状态
SRS定义了四个旋转状态：
- 状态0 (Spawn)：初始生成状态
- 状态R (Right)：顺时针旋转一次
- 状态2：旋转180度
- 状态L (Left)：逆时针旋转一次

### 墙踢执行流程
在 `src/engine/RotationSystem.ts` 中实现：

```typescript
static tryRotate(board: Board, piece: Piece, direction: 1 | -1): {
  success: boolean;
  offset: { x: number; y: number };
  kickIndex: number;
} {
  // 1. 计算旋转后的形状
  const newShape = this.rotate(piece, direction);
  
  // 2. 获取对应的墙踢表
  const kickTable = this.getKickTable(piece);
  const fromState = piece.rotation;
  const toState = (piece.rotation + direction + 4) % 4;
  const kicks = kickTable[fromState];

  // 3. 按顺序尝试每个墙踢偏移
  for (let i = 0; i < kicks.length; i++) {
    const [kickX, kickY] = kicks[i];
    
    // 应用偏移
    testPiece.x = piece.x + kickX;
    testPiece.y = piece.y - kickY;

    // 检查位置是否有效
    if (board.isValidPosition(testPiece)) {
      // 找到有效位置，应用旋转和偏移
      piece.shape = newShape;
      piece.x = testPiece.x;
      piece.y = testPiece.y;
      piece.rotation = toState;
      return { success: true, offset: { x: kickX, y: -kickY }, kickIndex: i };
    }
  }

  // 所有墙踢都失败，旋转无效
  return { success: false, offset: { x: 0, y: 0 }, kickIndex: -1 };
}
```

### 墙踢表详解

#### JLSTZ型墙踢表（5个偏移）
| 尝试次数 | 偏移 (X, Y) | 说明 |
|---------|------------|------|
| 0 | (0, 0) | 不偏移，直接旋转 |
| 1 | (-1, 0) | 左移1格 |
| 2 | (-1, +1) | 左移1格，上移1格 |
| 3 | (0, -2) | 下移2格 |
| 4 | (-1, -2) | 左移1格，下移2格 |

**注意**：第5个偏移（索引4）就是著名的"Fin Kick"，如果使用这个偏移成功旋转，会直接触发Full T-Spin判定。

#### I型墙踢表（5个偏移）
I型方块因为形状特殊，有独立的墙踢表，偏移更大，因为它旋转时需要更多空间。

### 墙踢的实际应用

1. **T-Spin Triple**：通过精确的墙踢，T型方块可以嵌入到一个三行高的洞中，形成T-Spin Triple，这是游戏中得分最高的单次操作之一。

2. **复杂地形操作**：在方块堆积较高时，墙踢系统允许玩家在看似不可能的位置放置方块，增加了游戏的深度和技巧性。

3. **连续旋转**：玩家可以通过连续旋转来"走动"方块，利用墙踢在水平方向移动方块，这在某些情况下非常有用。

### 与T-Spin的关联
SRS墙踢系统与T-Spin检测密切相关：
- 使用第5个墙踢（索引4）成功旋转的T型方块，直接判定为Full T-Spin
- 墙踢使得T-Spin Triple等高级技巧成为可能
- 旋转状态决定了检测时哪些角是"正面角"

---

## 3. 其他核心系统

### 7-Bag随机生成器
现代俄罗斯方块使用7-bag系统保证方块分布的公平性：
- 将7种方块打乱顺序放入一个"袋子"
- 按顺序从袋子中取出方块
- 袋子清空后重新生成新的打乱顺序

这种方法保证：
- 任何两种相同方块之间最多间隔12个方块
- 玩家最多14个方块内必然能拿到想要的方块
- 避免了传统纯随机的极端分布

### 锁定延迟（Lock Delay）
方块触底后不会立即锁定，而是有一个短暂的延迟（通常0.5秒），在此期间玩家可以：
- 继续移动方块
- 旋转方块（可能触发墙踢）
- 软降重置锁定计时器

这个机制使得T-Spin等高级操作成为可能。

---

## 4. 项目架构

```
src/
├── constants.ts          # 游戏常量配置
├── main.ts               # 应用入口
├── engine/               # 游戏核心引擎
│   ├── Piece.ts          # 方块类
│   ├── Board.ts          # 游戏板
│   ├── SevenBag.ts       # 7-Bag随机生成器
│   ├── RotationSystem.ts # SRS旋转系统
│   ├── TSpinDetector.ts  # T-Spin检测器
│   ├── TetrisGame.ts     # 游戏逻辑控制器
│   └── BossAI.ts         # Boss AI行为树
├── renderer/             # 渲染系统
│   ├── GameRenderer.ts   # 主渲染器
│   └── ParticleSystem.ts # 粒子系统
├── audio/                # 音效系统
│   └── AudioSystem.ts    # Web Audio音效
├── input/                # 输入系统
│   └── InputManager.ts   # 键盘和触屏输入
└── storage/              # 存储系统
    └── StorageManager.ts # 本地存储分数榜
```
