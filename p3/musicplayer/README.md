# 情绪电台 - 音乐播放器

一个基于 React 18 + TypeScript + Vite + Tailwind CSS + Zustand 构建的现代化音乐播放器。

## 功能特性

### 🎵 核心播放功能
- 内置超过 15 首模拟音乐，每首包含封面、歌名、艺术家、专辑和心情标签
- 底部常驻播放栏，支持播放/暂停、上一首/下一首切换
- 进度条拖拽功能
- 音量控制和静音功能
- 播放历史自动记录

### 🎨 可视化频谱
- 使用 Web Audio API 的 AnalyserNode 获取音频频率数据
- Canvas 绘制实时频谱动画
- 支持柱状图和波形图两种样式切换
- 播放/暂停时动画同步

### 📋 歌单与收藏
- 创建自定义歌单，从音乐库添加歌曲
- 标记"我喜欢"的歌曲，快速访问
- 最近播放列表自动记录（最多 30 首）
- 按心情标签筛选歌曲
- 按专辑/艺术家分组显示
- 搜索功能

### ⚙️ 设置与主题
- 支持列表循环、单曲循环、随机播放三种模式
- 浅色/深色主题切换
- 播放历史记录可清空

### 📱 响应式设计
- 移动端适配底部导航栏
- 桌面端显示侧边栏导航
- 完美适配各种屏幕尺寸

## 技术栈

- **前端框架**: React 18
- **类型系统**: TypeScript
- **构建工具**: Vite
- **样式方案**: Tailwind CSS
- **状态管理**: Zustand (持久化存储)
- **路由管理**: React Router
- **音频处理**: Web Audio API + HTML5 Audio
- **可视化**: Canvas 2D

## 项目结构

```
src/
├── components/          # 组件目录
│   ├── AudioVisualizer.tsx    # 音频频谱可视化
│   ├── PlayerBar.tsx          # 底部播放栏
│   ├── Sidebar.tsx            # 桌面端侧边栏
│   ├── MobileNav.tsx          # 移动端导航
│   └── SongCard.tsx           # 歌曲卡片
├── hooks/               # 自定义 Hooks
│   └── useAudioPlayer.ts      # 音频播放器 Hook
├── pages/               # 页面组件
│   ├── HomePage.tsx           # 首页推荐
│   ├── SearchPage.tsx         # 搜索页面
│   ├── LibraryPage.tsx        # 我的歌单
│   ├── FavoritesPage.tsx      # 我喜欢
│   └── RecentPage.tsx         # 最近播放
├── store/               # 状态管理
│   ├── usePlayerStore.ts      # 播放器状态
│   └── useAppStore.ts         # 应用全局状态
├── types/               # 类型定义
│   └── index.ts               # 全局类型
├── data/                # 模拟数据
│   └── songs.ts               # 歌曲数据
├── utils/               # 工具函数
│   └── formatTime.ts          # 时间格式化
├── App.tsx              # 应用入口
└── main.tsx             # 渲染入口
```

## 快速开始

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

## 核心功能说明

### 状态管理 (Zustand)
- `usePlayerStore`: 管理播放器状态，包括当前歌曲、播放列表、播放状态、音量、播放模式等
- `useAppStore`: 管理应用全局状态，包括主题、收藏歌单、最近播放、搜索查询等
- 使用 `persist` 中间件实现状态持久化存储

### 音频处理
- 使用 HTML5 Audio 元素实现基础播放功能
- 使用 Web Audio API 的 AnalyserNode 分析音频频率数据
- 将音频源连接到分析器，实现可视化效果

### Canvas 可视化
- `AudioVisualizer` 组件封装了两种可视化样式
- 使用 `requestAnimationFrame` 实现流畅动画
- 组件卸载时自动清理动画循环

### 响应式布局
- 使用 Tailwind CSS 的响应式工具类
- 桌面端显示侧边栏，移动端显示底部导航栏
- 适配不同屏幕尺寸的布局调整

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 许可证

MIT
