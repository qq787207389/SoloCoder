# 智慧政务服务平台

一个基于 React 18 + TypeScript + Vite + Ant Design 的现代化智慧政务服务前端平台，提供完整的在线政务服务流程。

## 功能特性

### 首页与导航
- 政府网站标准头部，包含国徽、标题、搜索框
- 顶部导航栏：个人办事、法人办事、信息公开、互动交流等
- 焦点图轮播展示最新政策和热门服务
- 常用服务快捷入口（社保查询、身份证办理、企业注册等）
- 底部友情链接和版权信息
- 响应式设计，适配桌面、平板和手机

### 办事指南与在线申办
- 办事指南列表：按部门、主题筛选，支持关键词搜索
- 办事详情页：展示办理条件、材料清单、办理流程、办理窗口和咨询电话
- 多步骤表单：基本信息 → 上传材料 → 确认提交
- 表单验证和材料上传功能
- 提交成功后生成受理编号和二维码
- 进度查询引导

### 办件进度查询
- 输入受理编号查询办理状态
- Timeline 时间轴展示各节点状态（已提交 → 审核中 → 补正通知 → 办结）
- 补正要求高亮提示

### 信息公开
- 政策文件列表，支持分页和搜索
- 文件详情页，富文本展示正文
- 附件列表提供下载（模拟）
- 通知公告列表

### 咨询投诉
- 用户可提交咨询、投诉或建议
- 表单包含标题、内容、联系电话、图片上传（可选）
- 提交成功提示
- 个人中心查看历史提交和回复状态

### 个人中心
- 简易登录/注册（localStorage 保存用户信息）
- 我的办件列表：显示历史申办记录及状态
- 我的咨询：显示提交的咨询及模拟回复
- 个人信息维护（修改密码、手机号等）

## 技术栈

- **前端框架**: React 18
- **类型系统**: TypeScript
- **构建工具**: Vite
- **UI 组件库**: Ant Design
- **路由管理**: React Router
- **状态管理**: Zustand (支持持久化)
- **数据请求**: Axios
- **数据模拟**: MSW (Mock Service Worker)
- **二维码**: qrcode.react

## 项目结构

```
gov/
├── public/              # 静态资源
├── src/
│   ├── api/            # API 接口封装
│   │   └── index.ts
│   ├── components/     # 公共组件
│   │   └── Layout.tsx # 主布局组件
│   ├── mocks/          # Mock 数据和处理器
│   │   ├── data.ts     # 模拟数据
│   │   ├── browser.ts  # MSW 浏览器配置
│   │   └── handlers.ts # API 处理器
│   ├── pages/          # 页面组件
│   │   ├── Home.tsx           # 首页
│   │   ├── ServiceList.tsx    # 办事指南列表
│   │   ├── ServiceDetail.tsx  # 办事详情页
│   │   ├── ApplicationForm.tsx # 在线申请表单
│   │   ├── ApplicationSuccess.tsx # 申请成功页
│   │   ├── ProgressQuery.tsx  # 进度查询
│   │   ├── PolicyList.tsx     # 政策列表
│   │   ├── PolicyDetail.tsx   # 政策详情
│   │   ├── Consultation.tsx   # 咨询投诉
│   │   ├── Login.tsx          # 登录注册
│   │   └── UserCenter.tsx     # 个人中心
│   ├── router/         # 路由配置
│   │   └── index.tsx
│   ├── store/          # 状态管理
│   │   └── index.ts
│   ├── types/          # 类型定义
│   │   └── index.ts
│   ├── App.css         # 全局样式
│   ├── App.tsx         # 应用入口组件
│   ├── main.tsx        # 应用入口文件
│   └── vite-env.d.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

启动后访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## Mock 数据说明

项目使用 MSW (Mock Service Worker) 在浏览器层模拟后端 API，提供以下模拟数据：

- **办事指南**: 15+ 条服务事项，涵盖社保、户政、企业、不动产、医保等类别
- **政策文件**: 10 条政策通知，支持按标题和部门搜索
- **办件记录**: 模拟用户申请记录和状态流转
- **咨询记录**: 模拟用户咨询和官方回复
- **用户信息**: 支持登录注册，信息保存在 localStorage

## 核心模块说明

### 路由模块 (`src/router/`)
使用 React Router 的嵌套布局，配置了所有页面路由，包括：
- 首页路由
- 办事相关路由（列表、详情、申请）
- 进度查询路由
- 政策相关路由
- 咨询投诉路由
- 用户中心和登录路由

### 状态管理 (`src/store/`)
使用 Zustand 实现三个状态 Store：
- `useAuthStore`: 用户认证状态，支持 localStorage 持久化
- `useApplicationStore`: 办件记录状态
- `useConsultationStore`: 咨询记录状态

### API 层 (`src/api/`)
统一封装 Axios 请求，包含：
- `serviceApi`: 办事指南相关接口
- `policyApi`: 政策文件相关接口
- `applicationApi`: 办件申请相关接口
- `consultationApi`: 咨询投诉相关接口
- `commonApi`: 公共接口（轮播图、快捷服务）

### Mock 层 (`src/mocks/`)
MSW 配置和模拟数据：
- `handlers.ts`: 所有 API 请求处理器
- `data.ts`: 模拟数据源（服务指南、政策、通知等）
- `browser.ts`: Worker 初始化配置

## 使用说明

### 搜索服务
1. 在首页顶部搜索框输入关键词
2. 或在办事指南页面使用筛选和搜索

### 在线申办
1. 浏览办事指南，选择需要办理的服务
2. 点击"在线办理"进入申请表单
3. 填写基本信息 → 上传材料 → 确认提交
4. 提交成功后获得受理编号和二维码

### 查询进度
1. 在导航栏点击"进度查询"
2. 输入受理编号查询办理状态
3. 或在个人中心"我的办件"查看所有申请

### 咨询投诉
1. 点击导航栏"互动交流"
2. 选择类型（咨询/投诉/建议）
3. 填写标题、内容和联系方式
4. 可上传相关图片（可选）

### 个人中心
1. 点击右上角登录/注册
2. 登录后可查看：
   - 我的办件：查看所有申请记录和状态
   - 我的咨询：查看历史咨询和回复
   - 个人信息：修改个人资料

## 响应式设计

项目支持多种屏幕尺寸：
- **桌面端 (≥1200px)**: 完整布局
- **平板端 (768px-1199px)**: 自适应调整
- **移动端 (<768px)**: 导航收缩，列表转为卡片式

## 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 开发说明

### 添加新的服务事项
在 `src/mocks/data.ts` 中的 `serviceGuides` 数组添加新条目。

### 添加新的政策文件
在 `src/mocks/data.ts` 中的 `policies` 数组添加新条目。

### 新增 API 接口
1. 在 `src/mocks/handlers.ts` 添加处理器
2. 在 `src/api/index.ts` 封装 API 方法

## 许可证

MIT
