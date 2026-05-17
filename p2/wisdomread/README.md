# 智慧阅读 - WisdomRead

> 基于 Vue 3 + TypeScript + Vite 构建的城市书房智慧阅读 Web 应用

## ✨ 核心功能

### 🤖 AI 书籍推荐与问答
- **智能推荐**：基于余弦相似度算法，根据书籍内容和标签进行个性化推荐
- **文本嵌入**：使用 Transformers.js 加载 MiniLM 模型，在浏览器端生成文本向量
- **阅读问答**：基于语义相似度，智能回答关于书籍内容的问题
- **主题推荐**：输入感兴趣的主题，系统自动推荐相关书籍和阅读建议

### 📝 笔记与知识图谱
- **Markdown 编辑器**：实时预览，支持富文本笔记编辑
- **标签系统**：笔记可打标签，与书籍关联
- **知识图谱**：使用 D3.js 构建力导向图，展示"书-笔记-标签-作者"之间的关系
- **全文搜索**：基于 Lunr.js 实现书籍和笔记的全文检索
- **数据持久化**：所有数据存储在 IndexedDB 中，支持离线使用

### 📅 阅读日历与挑战
- **热力图日历**：可视化展示每日阅读时长
- **年度目标**：设置年度阅读目标，进度环形图展示
- **连续打卡**：阅读 streak 统计，成就系统徽章
- **文本朗读**：基于 Web Speech API，支持语速调节、暂停/继续

## 🏗️ 技术架构

### 前端框架
- **Vue 3** - Composition API
- **TypeScript** - 类型安全
- **Vite** - 快速构建工具
- **Pinia** - 状态管理
- **Vue Router** - 路由管理

### 数据存储
- **IndexedDB (idb)** - 浏览器端数据库
- **Lunr.js** - 全文搜索索引

### AI 集成
- **Transformers.js** - 浏览器端机器学习
- **Xenova/all-MiniLM-L6-v2** - 文本嵌入模型

### 可视化
- **D3.js** - 知识图谱力导向布局
- **Canvas/SVG** - 高性能渲染

### PWA 支持
- **Service Worker** - 资源缓存
- **离线访问** - 笔记和图书库离线可用
- **PWA 清单** - 可安装到桌面

## 📁 项目结构

```
wisdomread/
├── src/
│   ├── components/          # 通用组件
│   ├── views/              # 页面视图
│   │   ├── HomeView.vue       # 首页
│   │   ├── BooksView.vue      # 书籍管理
│   │   ├── BookDetailView.vue # 书籍详情
│   │   ├── NotesView.vue      # 笔记编辑
│   │   ├── GraphView.vue      # 知识图谱
│   │   └── CalendarView.vue   # 阅读日历
│   ├── stores/             # Pinia 状态管理
│   │   ├── book.ts            # 书籍状态
│   │   ├── note.ts            # 笔记状态
│   │   └── reading.ts         # 阅读记录状态
│   ├── utils/              # 工具函数
│   │   ├── db.ts              # IndexedDB 封装
│   │   ├── ai.ts              # AI 功能集成
│   │   └── search.ts          # 全文搜索
│   ├── workers/            # Web Workers
│   │   └── graphLayout.worker.ts # 图谱布局计算
│   ├── types/              # TypeScript 类型定义
│   ├── router/             # 路由配置
│   ├── App.vue             # 根组件
│   ├── main.ts             # 入口文件
│   └── style.css           # 全局样式
├── vite.config.ts          # Vite 配置
├── tsconfig.json           # TypeScript 配置
└── package.json            # 依赖管理
```

## 🚀 快速开始

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

## 📊 性能优化

### 知识图谱性能优化

1. **Web Worker 布局计算**
   - 力导向布局算法在 Web Worker 中执行，避免阻塞主线程
   - 增量更新节点位置，优化渲染性能

2. **Canvas 渲染优化**
   - 使用 Canvas 替代 SVG 渲染大规模节点（>2000节点）
   - 视口裁剪：只渲染可见区域的节点
   - 层级渲染：先渲染连线，再渲染节点，最后渲染文字

3. **力导向算法优化**
   - Barnes-Hut 近似：O(n log n) 复杂度
   - 冷却机制：迭代过程中逐渐降低速度
   - 碰撞检测：节点不重叠

### AI 性能优化

1. **模型懒加载**
   - 首次使用时才加载 AI 模型
   - 进度提示，提升用户体验

2. **向量缓存**
   - 书籍/笔记的嵌入向量缓存到 IndexedDB
   - 避免重复计算，提升推荐速度

3. **相似度计算优化**
   - 使用 TypedArray 加速向量运算
   - 预计算归一化向量

### IndexedDB 性能优化

1. **索引优化**
   - 为常用查询字段创建索引
   - 使用复合索引加速多条件查询

2. **批量操作**
   - 使用事务批量写入数据
   - 减少磁盘 IO 次数

3. **分页查询**
   - 大数据集分页加载
   - 虚拟列表渲染

## 🔧 核心 API 说明

### AI 模块 (`src/utils/ai.ts`)

```typescript
// 获取文本嵌入向量
async function getEmbedding(text: string): Promise<number[]>

// 余弦相似度计算
function cosineSimilarity(a: number[], b: number[]): number

// 推荐相似书籍
function recommendBooks(targetBook: Book, allBooks: Book[], topK: number): Book[]

// 智能问答
async function answerQuestion(question: string, context: string): Promise<string>
```

### 数据库模块 (`src/utils/db.ts`)

```typescript
// 书籍操作
const bookDB = {
  getAll(): Promise<Book[]>,
  getById(id: string): Promise<Book | undefined>,
  add(book: Book): Promise<string>,
  update(book: Book): Promise<string>,
  delete(id: string): Promise<void>
}

// 笔记操作
const noteDB = { ... }

// 阅读记录操作
const recordDB = { ... }
```

### 知识图谱模块

```typescript
// 生成图谱数据
function generateKnowledgeGraph(books: Book[]): {
  nodes: GraphNode[],
  edges: GraphEdge[]
}

// Web Worker 布局计算
worker.postMessage({ nodes, edges, width, height })
```

## 🎯 数据模型

### Book (书籍)
```typescript
interface Book {
  id: string
  isbn?: string
  title: string
  author: string
  description: string
  tags: string[]
  embedding?: number[]
  addedAt: number
  readStatus: 'want' | 'reading' | 'finished'
  rating?: number
  pages?: number
}
```

### Note (笔记)
```typescript
interface Note {
  id: string
  bookId?: string
  title: string
  content: string
  tags: string[]
  createdAt: number
  updatedAt: number
  references: string[]
}
```

## 🌐 PWA 功能

- **缓存策略**：
  - 静态资源：Cache-First
  - API 数据：Network-First，回退到缓存
  - AI 模型：长期缓存

- **离线支持**：
  - 所有页面可离线访问
  - IndexedDB 数据本地存储
  - 离线操作同步机制

## 📄 许可证

MIT License
