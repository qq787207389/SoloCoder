# WaveStorm Festival - 选座锁座与库存一致性技术文档

## 概述

本文档详细描述了WaveStorm音乐节售票系统中选座锁座与库存一致性的实现机制。系统采用WebSocket模拟实时通信，结合乐观更新与回滚策略，确保高并发场景下的数据一致性。

## 核心架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        前端层 (React + Zustand)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────────────────┐   │
│  │  SeatMap    │  │ TicketModal │  │   UserStore           │   │
│  │ 组件        │  │ 购票流程    │  │   状态管理            │   │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬────────────┘   │
│         │                │                    │                │
└─────────┼────────────────┼────────────────────┼────────────────┘
          │                │                    │
          ▼                ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│              WebSocket 模拟服务 (mock-websocket.ts)             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 消息类型:                                               │   │
│  │  - join_queue     → 加入排队                            │   │
│  │  - lock_seat      → 锁定座位 (2分钟超时)                 │   │
│  │  - unlock_seat    → 解锁座位                            │   │
│  │  - purchase_seats → 购买座位                            │   │
│  │  - stock_update   → 库存更新广播                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 数据模型

### Seat (座位)

```typescript
interface Seat {
  id: string;           // 座位唯一标识: {section}-{row}-{number}
  row: string;          // 行号
  number: number;       // 座位号
  section: string;      // 区域 (A-H)
  price: number;        // 价格
  status: 'available' | 'locked' | 'sold' | 'selected';
  lockedBy?: string;    // 锁定者用户ID
  lockedAt?: Date;      // 锁定时间戳
}
```

### TicketType (票种)

```typescript
interface TicketType {
  id: string;
  name: string;
  price: number;
  description: string;
  benefits: string[];
  totalStock: number;
  remainingStock: number;  // 实时库存
  salesCount: number;
}
```

## 核心流程

### 1. 购票流程

```
用户选择票种 → 加入排队系统 → 进入选座 → 锁定座位 → 确认购买 → 完成
     │              │             │          │            │
     │              ▼             │          │            │
     │       排队位置更新        │          │            │
     │              │             │          │            │
     │              ▼             ▼          ▼            ▼
     │         队列就绪        选择座位    锁定座位    更新库存
     │                                        │
     ▼                                        ▼
  库存实时同步 ◄────────────────── 广播库存变化
```

### 2. 座位锁定机制

#### 2.1 锁定流程

```typescript
// WebSocket 服务端处理
case 'lock_seat': {
  const { seatId, userId } = message.payload;
  const seat = seats.find(s => s.id === seatId);
  
  if (seat && seat.status === 'available') {
    seat.status = 'locked';
    seat.lockedBy = userId;
    seat.lockedAt = new Date();

    // 自动解锁定时器 (2分钟超时)
    setTimeout(() => {
      if (seat.status === 'locked' && seat.lockedBy === userId) {
        seat.status = 'available';
        seat.lockedBy = undefined;
        seat.lockedAt = undefined;
        // 广播座位解锁消息
      }
    }, 120000); // 2分钟

    // 广播座位锁定消息
  }
  break;
}
```

#### 2.2 超时机制

| 参数 | 值 | 说明 |
|------|-----|------|
| 锁定超时时间 | 120秒 | 2分钟未完成购买自动解锁 |
| 心跳检测 | 30秒 | 定期检查锁定状态 |
| 并发处理 | FIFO | 队列机制保证顺序 |

### 3. 库存一致性保障

#### 3.1 实时库存同步

```typescript
// 前端 WebSocket 监听
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  switch (message.type) {
    case 'stock_update':
      // 更新本地库存状态
      updateTicketTypes(message.payload.ticketTypes);
      break;
    case 'seat_locked':
    case 'seat_unlocked':
      // 更新座位状态
      updateSeats(prev => prev.map(s => 
        s.id === message.payload.seatId ? message.payload.seat : s
      ));
      break;
  }
};
```

#### 3.2 乐观更新与回滚

```typescript
// Zustand store 中的购买逻辑
purchaseTickets: async () => {
  const { selectedSeats, selectedTicketType, user, seats } = get();

  // 1. 乐观更新 - 立即更新UI
  const optimisticSeats = seats.map(seat => 
    selectedSeats.includes(seat.id)
      ? { ...seat, status: 'sold' as const }
      : seat
  );
  set({ seats: optimisticSeats });

  // 2. 向后端发送请求
  const success = await api.purchase({
    seatIds: selectedSeats,
    userId: user.id,
    ticketTypeId: selectedTicketType,
  });

  // 3. 失败时回滚
  if (!success) {
    set({ seats: originalSeats }); // 回滚到原始状态
    set({ error: 'Purchase failed, seats may have been taken' });
    return false;
  }

  return true;
}
```

## 并发控制策略

### 排队系统

```typescript
interface QueuePosition {
  userId: string;
  position: number;
  status: 'waiting' | 'processing' | 'completed' | 'timeout';
  createdAt: Date;
}
```

**队列机制:**
1. 用户加入队列时分配唯一位置
2. 按顺序处理队列中的用户
3. 处理完成后自动移除队列

### 防重复提交

```typescript
// 使用状态管理防止重复提交
const [isProcessing, setIsProcessing] = useState(false);

const handlePurchase = async () => {
  if (isProcessing) return; // 防止重复点击
  
  setIsProcessing(true);
  try {
    await purchaseTickets();
  } finally {
    setIsProcessing(false);
  }
};
```

## 数据库层面的一致性保障

虽然本项目采用内存模拟，但生产环境应实现以下机制：

| 机制 | 说明 |
|------|------|
| 乐观锁 | 使用版本号或时间戳检测冲突 |
| 事务 | 确保库存更新和订单创建的原子性 |
| Redis缓存 | 高频读取使用缓存，定期同步 |
| 分布式锁 | Redis Redlock 实现跨服务互斥 |

## 性能优化

### 座位图渲染优化

1. **虚拟化渲染**: 使用 React Virtualized 处理2000+座位
2. **按需加载**: 只渲染可视区域内的座位
3. **批量更新**: 合并多个座位状态更新

```typescript
// 座位状态批量更新
const batchUpdateSeats = (seatUpdates: Seat[]) => {
  set(state => ({
    ...state,
    seats: state.seats.map(seat => {
      const update = seatUpdates.find(u => u.id === seat.id);
      return update || seat;
    })
  }));
};
```

### WebSocket优化

1. **消息压缩**: 使用 gzip 压缩消息体
2. **心跳保持**: 定期发送 ping/pong 维持连接
3. **断线重连**: 自动重连并恢复状态

## 边界情况处理

| 场景 | 处理策略 |
|------|----------|
| 网络延迟 | 显示加载状态，禁用重复提交 |
| 座位已被锁定 | 提示用户座位已被占用 |
| 库存不足 | 实时更新库存显示，禁用购买按钮 |
| 超时解锁 | 自动释放座位并通知用户 |
| 重复购买 | 使用订单号去重 |

## 总结

本系统通过以下机制保障选座锁座与库存一致性：

1. **WebSocket实时通信**: 推送库存和座位状态变化
2. **分布式锁**: 2分钟超时自动释放
3. **乐观更新**: 即时反馈，失败回滚
4. **排队系统**: FIFO顺序处理，防止超卖
5. **状态管理**: Zustand 集中管理，保证数据一致性

这些机制共同确保了高并发场景下的系统稳定性和数据准确性。
