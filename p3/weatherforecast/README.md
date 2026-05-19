# 晴雨记 - 天气预报应用

一款基于 React 18 + TypeScript + Vite + Tailwind CSS 构建的现代化天气预报应用。

## 功能特性

### 1. 城市搜索与当前天气
- 首页显示默认城市（或用户定位城市）的实时天气卡片
- 显示温度、体感温度、湿度、风力、气压、能见度等详细信息
- 顶部搜索框支持输入城市名称自动补全
- 搜索后切换城市并更新天气数据

### 2. 未来天气预报
- 使用 Recharts 绘制 7 天温度走势折线图（最高/最低温）
- 横向滚动列表显示每日详情：天气图标、日期、温度范围、风速
- 交互式图表，支持悬停查看详细数据

### 3. 城市收藏夹
- 用户可收藏最多 10 个城市
- 点击收藏城市快速切换
- 支持拖拽排序城市
- 收藏列表保存到 localStorage，刷新页面不丢失

### 4. 主题与交互
- 根据当前天气状况自动切换背景渐变（晴天/阴天/雨天/雪天/大风/雾天）
- 首次加载时自动定位并显示骨架屏加载动画
- 响应式设计，完美适配手机、平板、桌面端
- 毛玻璃效果卡片，现代化 UI 设计

## 技术栈

- **前端框架**: React 18
- **类型系统**: TypeScript
- **构建工具**: Vite
- **样式方案**: Tailwind CSS
- **状态管理**: Zustand
- **图表库**: Recharts
- **HTTP 客户端**: Axios
- **API 模拟**: MSW (Mock Service Worker)

## 项目结构

```
src/
├── components/          # 组件目录
│   ├── SearchBar.tsx   # 搜索栏组件
│   ├── CurrentWeather.tsx  # 当前天气组件
│   ├── Forecast.tsx    # 天气预报组件
│   ├── Favorites.tsx   # 收藏夹组件
│   ├── WeatherIcon.tsx # 天气图标组件
│   └── Skeleton.tsx    # 骨架屏组件
├── store/              # 状态管理
│   └── weatherStore.ts # 天气状态 store
├── services/           # API 服务
│   └── weatherApi.ts   # 天气 API 封装
├── mocks/              # API 模拟
│   ├── browser.ts      # MSW 浏览器端配置
│   ├── handlers.ts     # 请求处理器
│   └── data.ts         # 模拟数据
├── types/              # TypeScript 类型定义
│   └── index.ts
├── App.tsx             # 主应用组件
├── main.tsx            # 应用入口
└── index.css           # 全局样式
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

应用将在 `http://localhost:5173` 启动

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 核心实现说明

### 状态管理 (Zustand)
- 使用 Zustand 进行全局状态管理
- 支持 persist 中间件，收藏列表持久化到 localStorage
- 统一管理当前城市、天气数据、搜索状态、收藏列表

### API 层 (MSW)
- 使用 MSW 在浏览器端模拟 API 接口
- 支持搜索城市、获取天气数据、获取当前位置
- 模拟数据包含全国主要城市，每次请求随机生成天气数据

### 拖拽排序
- 使用原生 HTML5 Drag & Drop API 实现
- 拖拽过程中实时更新顺序
- 拖拽状态有视觉反馈

### 响应式设计
- 使用 Tailwind CSS 响应式断点
- 适配移动端、平板、桌面端
- 卡片布局在不同屏幕下自动调整

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 许可证

MIT
