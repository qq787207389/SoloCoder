# 食记 - 美食食谱分享社区

一个基于 Vue 3 + TypeScript + Vite 构建的美食食谱分享社区平台。

## 🌟 功能特性

### 1. 食谱浏览与搜索
- 🏠 首页展示推荐食谱瀑布流卡片（封面图、标题、作者、烹饪时间、难度）
- 🔍 按分类（家常菜、烘焙、素食、汤羹等）和难度筛选
- 🔑 支持关键词搜索菜名或食材
- 📄 食谱详情页：大图展示、食材清单、步骤说明

### 2. 食材清单与购物清单
- ✅ 食材可勾选已备状态
- 🛒 一键添加到购物清单
- 🔄 自动合并相同食材数量
- 📝 购物清单管理：勾选已购、编辑数量、清空已完成
- 💾 数据持久化存储于 localStorage

### 3. 用户创建与收藏
- ✏️ 创建自己的食谱：上传封面图、填写信息、动态增删食材和步骤
- ❤️ 收藏喜欢的食谱
- 👍 食谱点赞功能
- 👤 个人主页查看收藏和自创食谱

### 4. 烹饪模式
- 📱 移动端优化的全屏烹饪模式
- 👆 左右滑动切换步骤
- ⏱️ 内置计时器，支持自定义分钟提醒

### 5. 交互与体验
- 🖼️ 图片懒加载，渐变占位效果
- 💡 食材自动提示常用食材
- 📱 响应式设计，适配桌面端和移动端

## 🛠️ 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3.4+ | 渐进式 JavaScript 框架 |
| TypeScript | 5.3+ | 类型安全 |
| Vite | 5.0+ | 构建工具 |
| Pinia | 2.1+ | 状态管理 |
| Vue Router | 4.2+ | 路由管理 |
| Axios | 1.6+ | HTTP 客户端 |
| Tailwind CSS | 3.4+ | CSS 框架 |
| MSW | 2.2+ | API Mock |
| Lucide Vue | 0.511+ | 图标库 |

## 📁 项目结构

```
foodshare/
├── public/
│   └── mockServiceWorker.js   # MSW Service Worker
├── src/
│   ├── api/                    # API 接口层
│   │   ├── axios.ts           # Axios 实例配置
│   │   └── recipes.ts         # 食谱相关 API
│   ├── components/             # 通用组件
│   │   ├── Navbar.vue         # 导航栏
│   │   ├── RecipeCard.vue     # 食谱卡片
│   │   ├── IngredientList.vue # 食材列表
│   │   └── StepList.vue       # 步骤列表
│   ├── mocks/                  # MSW Mock 数据
│   │   ├── browser.ts         # MSW 浏览器配置
│   │   ├── handlers.ts        # API 处理器
│   │   └── data.ts            # Mock 数据
│   ├── router/                 # 路由配置
│   │   └── index.ts
│   ├── stores/                 # Pinia 状态管理
│   │   ├── recipe.ts          # 食谱状态
│   │   ├── user.ts            # 用户状态
│   │   └── shopping.ts        # 购物清单状态
│   ├── types/                  # TypeScript 类型定义
│   │   └── index.ts
│   ├── utils/                  # 工具函数
│   │   ├── image.ts           # 图片压缩
│   │   └── storage.ts         # 本地存储
│   ├── views/                  # 页面组件
│   │   ├── Home.vue           # 首页
│   │   ├── RecipeDetail.vue   # 食谱详情
│   │   ├── CreateRecipe.vue   # 创建食谱
│   │   ├── ShoppingList.vue   # 购物清单
│   │   ├── Profile.vue        # 个人中心
│   │   └── CookingMode.vue    # 烹饪模式
│   ├── App.vue                 # 根组件
│   ├── main.ts                 # 入口文件
│   └── style.css               # 全局样式
├── .trae/documents/            # 项目文档
│   ├── PRD.md                 # 产品需求文档
│   └── TECHNICAL_ARCHITECTURE.md # 技术架构文档
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 查看应用

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

### 类型检查

```bash
npm run check
```

## 📱 页面路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 食谱瀑布流、搜索、分类筛选 |
| `/recipe/:id` | 食谱详情 | 展示完整食谱信息 |
| `/create` | 创建食谱 | 表单填写、图片上传 |
| `/shopping` | 购物清单 | 管理待购食材 |
| `/profile` | 个人中心 | 收藏、自创食谱 |
| `/cooking/:id` | 烹饪模式 | 全屏步骤展示、计时器 |

## 🎨 设计系统

### 配色方案

- **主色调**：橙红色系 (#FF9800) - 传递美食的热情
- **辅助色**：绿色 (#4CAF50) - 代表健康
- **背景色**：米白色 (#FFF8E1) - 温暖舒适

### 字体

- 标题：Noto Serif SC（衬线字体）
- 正文：Noto Sans SC（无衬线字体）

### 动画效果

- 图片淡入加载
- 卡片悬停上浮
- 食材勾选动画
- 页面切换过渡

## 🔧 核心功能实现

### 图片压缩
使用 Canvas API 在前端对上传的图片进行压缩处理，减少存储和传输开销。

### 状态持久化
购物清单、用户收藏、自创食谱等数据通过 localStorage 进行持久化存储。

### Mock API
使用内置 Mock 数据层模拟 API 请求响应，预置 22 个精选食谱数据。

### 瀑布流布局
使用 CSS Column 实现响应式瀑布流布局，适配不同屏幕尺寸。

## 📦 预置数据

项目预置了 22 个精选食谱，涵盖以下分类：
- 🍳 家常菜 (4)
- 🧁 烘焙 (3)
- 🥬 素食 (3)
- 🍲 汤羹 (3)
- 🍮 甜品 (3)
- 🦐 海鲜 (3)
- 🍚 主食 (3)

## 🤝 开发规范

- 使用 TypeScript 确保类型安全
- 组件采用 Composition API + `<script setup>` 语法
- 遵循 Vue 3 最佳实践
- 组件文件不超过 300 行，单一职责
- 使用 Tailwind CSS 进行样式开发

## 📄 许可证

MIT License
