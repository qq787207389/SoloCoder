# Bookroom - 城市书房社区平台

一个基于 Next.js 14 + TypeScript + Tailwind CSS + Prisma + NextAuth + WebSocket 的城市书房社区平台，侧重活动发布、社群互动和线下社交。

## 核心功能

### 1. 活动管理
- 书房管理员可发布线下活动（读书会、讲座、手作工坊），包括封面、详情、报名人数限制、开始时间、地点
- 用户端可浏览活动列表，支持筛选类别、日期、地点，一键报名，满员自动候补
- 报名后生成电子票（二维码）
- 活动日历视图（月/周/日），标记已报名活动，可添加到系统日历（.ics 生成下载）
- 活动开始前24小时推送提醒

### 2. 读书社群
- 创建/加入兴趣圈子，圈内可发帖（支持图文、表情、回复、点赞）
- 使用 WebSocket 实现新帖实时推送
- 共读打卡：圈主发起共读任务，成员每日打卡进度
- 动态流个性化推荐（基于标签和关注，采用简单加权排序）

### 3. 附近书房与社交匹配
- 基于用户位置展示附近书房和当前热门活动
- 兴趣匹配：用户可开启"阅读社交"模式，系统根据阅读兴趣相似度推荐附近的书友
- 支持发起私聊（WebSocket 实时通信）
- 私聊界面实现在线状态、消息已读回执、表情包支持

### 4. 管理后台
- 仅管理员可访问：活动审核、用户管理、数据看板
- 内容审核（帖子举报处理）

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: NextAuth.js
- **实时通信**: WebSocket
- **工具库**: date-fns, lucide-react, clsx, tailwind-merge, qrcode.react

## 项目结构

```
bookroom/
├── prisma/
│   └── schema.prisma          # 数据库 Schema
├── src/
│   ├── app/
│   │   ├── actions/           # Server Actions
│   │   │   ├── activityActions.ts
│   │   │   └── circleActions.ts
│   │   ├── api/               # API 路由
│   │   │   ├── auth/[...nextauth]/
│   │   │   └── ws.ts          # WebSocket 服务
│   │   ├── activities/        # 活动页面
│   │   ├── circles/           # 社群页面
│   │   ├── discover/          # 发现/匹配页面
│   │   ├── chat/              # 聊天页面
│   │   ├── admin/             # 管理后台
│   │   ├── login/             # 登录页面
│   │   ├── layout.tsx
│   │   ├── page.tsx           # 首页
│   │   └── globals.css
│   ├── components/            # 组件
│   │   └── ui/                # UI 组件库
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       └── Textarea.tsx
│   ├── hooks/                 # 自定义 Hook
│   │   └── useWebSocket.ts
│   ├── lib/                   # 工具库
│   │   ├── prisma.ts
│   │   └── utils.ts
│   └── types/                 # 类型定义
│       ├── next-auth.d.ts
│       └── websocket.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## 数据库 Schema

核心数据模型：
- User: 用户信息
- Bookstore: 书房信息
- Activity: 活动信息
- Registration: 报名记录
- Ticket: 电子票
- Circle: 兴趣圈子
- CircleMember: 圈子成员
- Post: 帖子
- Comment: 评论
- PostLike: 点赞
- ReadingTask: 共读任务
- CheckIn: 打卡记录
- ChatMessage: 聊天消息
- Report: 举报记录

## WebSocket 消息协议

```typescript
interface WSMessage {
  type: 'chat' | 'notification' | 'new_post' | 'activity_update' | 'presence'
  payload: any
  timestamp: number
}
```

## 社交匹配算法

1. **兴趣相似度计算**: 使用 Jaccard 相似度指数
   ```
   相似度 = 交集数量 / 并集数量
   ```

2. **距离计算**: 使用 Haversine 公式计算两点间地理距离

3. **加权排序**:
   - 兴趣相似度: 60%
   - 地理距离: 30%
   - 在线状态: 10%

## 快速开始

1. 安装依赖:
```bash
npm install
```

2. 配置环境变量:
```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库连接等
```

3. 初始化数据库:
```bash
npx prisma migrate dev
```

4. 启动开发服务器:
```bash
npm run dev
```

5. 访问 http://localhost:3000

## 移动端适配

项目采用移动端优先设计，所有交互均适配触屏设备：
- 响应式布局
- 触摸友好的按钮尺寸
- 手势操作支持
- 优化的移动端导航
