# 影集 - 电影发现与片单管理应用

一个基于 Vue 3 + TypeScript + Vite 开发的现代化电影发现与个人片单管理应用。

## 技术栈

- **前端框架**: Vue 3 (Composition API)
- **类型系统**: TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由管理**: Vue Router
- **UI 组件库**: Element Plus
- **HTTP 客户端**: Axios
- **API 模拟**: MSW (Mock Service Worker)

## 核心功能

### 1. 电影浏览与搜索
- 首页展示热门电影网格，包含海报、评分、年份信息
- 支持无限滚动加载更多电影
- 顶部搜索框支持按电影名称和类型搜索
- 电影详情页展示完整信息，可标记"想看"、"已看"

### 2. 个人片单管理
- 三个默认片单："想看"、"已看"、"收藏"
- 支持创建自定义片单
- 在电影详情页或列表页一键将电影加入指定片单
- 片单页面展示电影列表，支持拖拽排序
- 支持分享片单（生成只读链接的模拟页面）
- 对看过的电影进行评分（1-5星），评分保存到 localStorage

### 3. 推荐与发现
- 首页"为你推荐"区域：基于用户已看电影的类型推荐同类型高分电影
- "相似电影"模块：在详情页展示4部同类型或同演员的电影

### 4. 交互与视觉
- 海报卡片悬浮放大效果
- 详情页有平滑路由过渡动画
- 响应式网格布局（移动端单列，平板两列，桌面四列以上）
- 加载时使用骨架屏占位
- 网络错误有重试提示

## 项目结构

```
moviefind/
├── src/
│   ├── components/          # 通用组件
│   │   ├── AppHeader.vue   # 头部导航组件
│   │   └── MovieCard.vue   # 电影卡片组件
│   ├── mocks/              # MSW 模拟 API
│   │   ├── movies.ts       # 电影数据（32部电影）
│   │   ├── handlers.ts     # API 处理程序
│   │   └── browser.ts      # MSW 浏览器集成
│   ├── stores/             # Pinia 状态管理
│   │   └── playlist.ts     # 片单状态管理
│   ├── styles/             # 全局样式
│   │   ├── main.scss       # 主样式文件
│   │   └── variables.scss  # SCSS 变量
│   ├── types/              # TypeScript 类型定义
│   │   └── index.ts        # 类型定义
│   ├── views/              # 页面组件
│   │   ├── HomeView.vue           # 首页
│   │   ├── MovieDetailView.vue    # 电影详情页
│   │   ├── SearchView.vue         # 搜索结果页
│   │   ├── PlaylistView.vue       # 片单详情页
│   │   └── SharePlaylistView.vue  # 片单分享页
│   ├── App.vue             # 根组件
│   ├── main.ts             # 应用入口
│   ├── router.ts           # 路由配置
│   └── vite-env.d.ts       # Vite 类型声明
├── index.html              # HTML 模板
├── vite.config.ts          # Vite 配置
├── tsconfig.json           # TypeScript 配置
├── package.json            # 项目依赖
└── README.md               # 项目说明
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

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

## 功能说明

### 片单管理
- 默认片单不可删除，包含"想看"、"已看"、"收藏"
- 支持创建自定义片单
- 片单中的电影支持拖拽排序
- 片单数据持久化到 localStorage

### 电影评分
- 支持对已看电影进行1-5星评分
- 评分数据持久化到 localStorage
- 在片单页面显示电影评分

### 搜索功能
- 支持按电影名称搜索
- 支持按电影类型搜索
- 搜索结果支持分页加载

### 响应式设计
- 移动端：单列布局
- 平板端：双列布局
- 桌面端：四列或更多列布局

## 数据说明

应用内置了32部精选电影数据，涵盖多种类型：
- 动作/科幻：星际穿越、盗梦空间、黑客帝国等
- 剧情/经典：肖申克的救赎、阿甘正传、霸王别姬等
- 动画/家庭：千与千寻、疯狂动物城、寻梦环游记等
- 华语电影：让子弹飞、我不是药神、哪吒之魔童降世等

所有电影数据通过 MSW 模拟 API 提供。

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## License

MIT
