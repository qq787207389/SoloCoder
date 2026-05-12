# 悠游旅行 - 旅游网站前台

基于 Vue3 + Vite + Element Plus 构建的现代化旅游网站。

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **Element Plus** - Vue 3 组件库
- **Pinia** - Vue 3 状态管理
- **Vue Router** - Vue 官方路由
- **Sass** - CSS 预处理器

## 页面功能

### 1. 首页 (Home)
- 轮播图展示
- 分类导航
- 热门景点
- 精选旅游线路
- 最新攻略资讯

### 2. 旅游线路 (Routes)
- 线路列表展示
- 筛选功能（目的地、价格区间、行程天数）
- 分页功能
- 线路详情页

### 3. 酒店预订 (Hotels)
- 酒店列表展示
- 酒店详情页
- 房型选择

### 4. 景点门票 (Tickets)
- 景点列表
- 门票预订功能

### 5. 攻略资讯 (Guides)
- 热门攻略排行
- 标签云
- 文章列表

### 6. 用户中心 (Login/Register/Profile)
- 用户登录/注册
- 个人信息管理
- 我的订单
- 优惠券管理

### 7. 购物车与结算 (Cart/Checkout)
- 购物车管理
- 订单确认
- 优惠券选择
- 订单提交

## 项目结构

```
src/
├── components/          # 通用组件
│   ├── HeaderNav.vue   # 顶部导航栏
│   ├── Footer.vue      # 页脚
│   ├── RouteCard.vue   # 线路卡片
│   ├── Pagination.vue  # 分页组件
│   └── FilterBar.vue   # 筛选组件
├── views/              # 页面组件
├── stores/             # Pinia 状态管理
│   ├── user.js         # 用户状态
│   └── cart.js         # 购物车状态
├── router/             # 路由配置
├── data/               # 模拟数据
├── styles/             # 全局样式
├── App.vue             # 根组件
└── main.js             # 入口文件
```

## 安装运行

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看网站。

### 3. 构建生产版本

```bash
npm run build
```

### 4. 预览生产版本

```bash
npm run preview
```

## 响应式设计

网站支持以下设备尺寸：
- 桌面端：≥ 1200px
- 平板端：768px - 1199px
- 移动端：≤ 767px

## 主要特性

1. **现代化 UI 设计** - 采用紫色渐变主题，简约高端
2. **完整的状态管理** - 使用 Pinia 管理用户和购物车状态
3. **模拟数据** - 内置完整的模拟数据，无需后端即可预览
4. **表单验证** - 完整的登录、注册表单验证
5. **组件复用** - 封装了多个可复用的通用组件
6. **路由守卫** - 支持路由权限控制
