# 🌍 足迹地图 - 旅行日记应用

一个基于 Vue 3 + TypeScript + Vite 构建的现代化旅行日记应用，帮助你记录和可视化旅行足迹。

## ✨ 功能特性

### 🗺️ 地图与标记
- 集成 MapLibre GL JS 开源地图引擎
- 点击地图任意位置添加旅行记录
- 已访问地点使用红色图钉标记
- 心愿地点使用虚线灰色图钉标记
- 点击标记弹出信息卡片预览

### 📅 时间轴展示
- 按年份分组展示所有旅行记录
- 支持无限滚动加载更多历史记录
- 显示地点缩略图和旅行类型
- 支持编辑和删除操作

### 📊 统计与可视化
- 统计访问过的国家和城市数量
- 记录总旅行次数和照片数量
- 按旅行类型（城市/自然/美食/文化/其他）生成饼图
- 按国家和城市统计旅行频次

### ✨ 旅行计划与愿望清单
- 添加未来想去的目的地
- 设置优先级（高/中/低）
- 标记完成后自动转为旅行记录
- 心愿清单管理功能

### 💾 数据导入导出
- 导出所有旅行数据为 JSON 格式
- 支持从 JSON 文件导入恢复数据
- 数据持久化存储到 localStorage

### 📱 响应式设计
- 完美适配桌面端和移动端
- 移动端友好的导航菜单
- 触摸友好的交互设计

## 🛠️ 技术栈

- **前端框架**: Vue 3 (Composition API)
- **编程语言**: TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由**: Vue Router
- **地图引擎**: MapLibre GL JS
- **图表库**: ECharts
- **模拟工具**: MSW (Mock Service Worker)

## 📦 安装与运行

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 生产构建
```bash
npm run build
```

### 预览构建结果
```bash
npm run preview
```

## 📁 项目结构

```
traveltrack/
├── src/
│   ├── components/          # 通用组件
│   │   ├── TravelMap.vue    # 地图组件
│   │   ├── DiaryForm.vue    # 日记表单
│   │   ├── Timeline.vue     # 时间轴组件
│   │   ├── Wishlist.vue     # 心愿清单组件
│   │   └── StatsChart.vue   # 统计图表组件
│   ├── views/               # 页面视图
│   │   ├── HomeView.vue     # 首页（地图）
│   │   ├── TimelineView.vue # 时间轴页
│   │   ├── WishlistView.vue # 心愿单页
│   │   └── StatsView.vue    # 统计页
│   ├── stores/              # Pinia 状态管理
│   │   └── travel.ts        # 旅行数据存储
│   ├── types/               # TypeScript 类型定义
│   │   └── index.ts         # 类型声明
│   ├── utils/               # 工具函数
│   │   └── index.ts         # 通用工具
│   ├── App.vue              # 根组件
│   ├── main.ts              # 入口文件
│   └── style.css            # 全局样式
├── public/                  # 静态资源
├── index.html               # HTML 模板
├── package.json             # 依赖配置
├── tsconfig.json            # TypeScript 配置
└── vite.config.ts           # Vite 配置
```

## 🗺️ 地图 SDK 接入说明

本项目使用 **MapLibre GL JS** 作为地图引擎，这是一个完全开源的地图渲染库，无需 API 密钥。

### 为什么选择 MapLibre GL JS？
- ✅ 完全开源免费
- ✅ 无需 API 密钥
- ✅ 与 Mapbox GL JS 兼容
- ✅ 支持自定义样式和图层
- ✅ 活跃的社区维护

### 基础用法

```typescript
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

// 初始化地图
const map = new maplibregl.Map({
  container: 'map',
  style: 'https://demotiles.maplibre.org/style.json', // 地图样式
  center: [104.1954, 35.8617], // 中国中心坐标
  zoom: 3
})

// 添加导航控件
map.addControl(new maplibregl.NavigationControl())

// 添加标记
new maplibregl.Marker()
  .setLngLat([longitude, latitude])
  .addTo(map)
```

### 自定义地图样式
你可以使用以下方式自定义地图样式：
1. 使用 [Maputnik](https://maputnik.github.io/) 编辑器创建自定义样式
2. 接入第三方瓦片服务（如 OpenStreetMap、Stadia Maps 等）
3. 自建矢量瓦片服务器

### 替换为高德地图
如果需要使用高德地图，可按以下步骤操作：

1. 安装高德地图 JS API Loader
```bash
npm install @amap/amap-jsapi-loader
```

2. 创建地图组件
```typescript
import AMapLoader from '@amap/amap-jsapi-loader'

AMapLoader.load({
  key: '你的高德地图API密钥',
  version: '2.0',
  plugins: ['AMap.Marker']
}).then(({ AMap }) => {
  const map = new AMap.Map('map', {
    center: [116.397428, 39.90923],
    zoom: 10
  })
})
```

## 📊 状态管理

使用 Pinia 进行状态管理，主要存储：
- `diaries`: 旅行日记列表
- `wishlist`: 心愿清单
- 自动持久化到 localStorage

### Store 方法
```typescript
// 添加日记
store.addDiary(diaryData)

// 更新日记
store.updateDiary(id, updates)

// 删除日记
store.deleteDiary(id)

// 添加心愿
store.addWishlistItem(item)

// 完成心愿并转为日记
store.completeWishlistItem(id, diaryData)

// 导出数据
store.exportData()

// 导入数据
store.importData(data)
```

## 🎨 主题与样式

项目采用简洁现代的设计风格：
- 主色调：蓝色 (`#3b82f6`)
- 中性色：灰色系
- 卡片式布局
- 圆角设计
- 微妙阴影效果

## 🔧 开发建议

1. **TypeScript 严格模式**：项目已启用严格类型检查，确保类型安全
2. **组件拆分**：保持组件单一职责，复杂逻辑拆分为 composables
3. **响应式设计**：开发时考虑移动端适配
4. **性能优化**：使用 `computed` 缓存派生状态，避免不必要的重渲染

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
