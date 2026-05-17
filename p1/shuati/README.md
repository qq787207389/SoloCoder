# DevOJ - 在线编程刷题平台

一个功能完整的在线编程刷题平台，支持多种题型、在线代码编辑器、个人进度追踪等功能。

## ✨ 功能特性

### 📝 多题型支持
- **单选题** - 四选一选择题
- **多选题** - 多选多类型题目
- **填空题** - 文本输入类型题目
- **编程题** - 支持 JavaScript 代码执行和测试

### 💻 在线代码编辑器
- 基于 Monaco Editor 的代码编辑器
- 语法高亮和自动补全
- 支持暗色/亮色主题切换
- 代码沙箱安全执行

### 🔍 题库浏览与搜索
- 按难度筛选（简单/中等/困难）
- 按题型筛选
- 按标签分类
- 模糊搜索功能
- 分页加载
- 按通过率、编号等排序

### 👤 个人中心与进度追踪
- 答题历史记录
- 错题本功能
- 每日刷题目标
- 连续打卡天数
- 本地数据持久化（localStorage）

### 🎨 UI/UX 设计
- 响应式设计，支持桌面、平板、手机
- 暗色/亮色主题切换
- 加载骨架屏
- 平滑动画过渡

## 🛠️ 技术栈

### 核心框架
- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具

### 状态管理与数据
- **Zustand** - 全局状态管理
- **React Query** - 服务端数据缓存和请求状态
- **MSW (Mock Service Worker)** - API Mock

### UI 与样式
- **Tailwind CSS** - 原子化 CSS
- **Monaco Editor** - 代码编辑器

### 工具与规范
- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **Vitest** - 单元测试

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 即可预览

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 📁 项目结构

```
src/
├── components/          # 组件目录
│   ├── ui/             # 基础 UI 组件
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Tag.tsx
│   │   └── Skeleton.tsx
│   ├── layout/         # 布局组件
│   │   └── Navbar.tsx
│   ├── CodeEditor.tsx  # 代码编辑器组件
│   ├── QuestionCard.tsx
│   └── QuestionFilters.tsx
├── pages/              # 页面组件
│   ├── Home.tsx        # 题库首页
│   ├── QuestionDetail.tsx  # 题目详情页
│   └── Profile.tsx     # 个人中心
├── mocks/              # Mock 数据
│   ├── browser.ts
│   ├── handlers.ts
│   └── data.ts
├── store/              # 状态管理
│   └── useStore.ts
├── hooks/              # 自定义 Hooks
│   └── useQuestions.ts
├── utils/              # 工具函数
│   └── codeExecutor.ts
├── styles/             # 样式文件
│   ├── index.css
│   └── variables.css
├── types/              # 类型定义
│   └── index.ts
├── App.tsx
└── main.tsx
```

## 🧩 架构设计

### 状态管理
- **Zustand** - 管理全局 UI 状态（主题、用户、通知等）
- **React Query** - 管理服务端数据、缓存和请求状态

### 数据层
- **MSW** - 拦截浏览器请求，提供完全本地化的 API Mock
- 50+ 道题目数据，涵盖各题型和难度

### 代码安全执行
- 使用 Web Worker 在独立线程中执行用户代码
- 超时控制防止死循环
- 沙箱环境隔离执行

## 📝 代码安全执行方案

### 设计原则
1. **隔离执行** - 代码在 Web Worker 中执行，不影响主线程
2. **超时控制** - 设置 5 秒超时防止死循环
3. **异常捕获** - 完整的错误处理机制
4. **安全沙箱** - 限制可用 API 范围

### 执行流程
```
用户代码
    ↓
Web Worker 沙箱
    ↓
执行测试用例
    ↓
比对预期结果
    ↓
返回执行结果
```

### 关键特性
- 独立执行环境，避免内存泄漏
- 支持多测试用例并行执行
- 详细的错误信息和测试报告

## 🎯 未来规划

- [ ] 对战模式 - 实时答题 PK
- [ ] 题解讨论区
- [ ] Markdown 笔记功能
- [ ] 更多编程语言支持
- [ ] 数据可视化统计看板
- [ ] 用户等级与成就系统

## 📄 许可证

MIT License
