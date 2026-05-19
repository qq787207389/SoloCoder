# 问卷星 - 在线问卷调查平台

一个功能完整的在线问卷调查平台，支持创建、发布、填写问卷以及数据统计分析。

## 功能特性

### 1. 问卷创建与编辑
- 支持三种题型：单选题、多选题、简答题
- 拖拽排序题目顺序
- 设置题目必填/非必填
- 为选择题添加/删除选项
- 设置收集截止时间，到期自动停止收集

### 2. 问卷发布与填写
- 生成二维码和分享链接
- 必填项校验
- 提交后显示感谢页
- 限制同一设备重复提交（localStorage）
- 响应式设计，移动端适配

### 3. 数据统计与结果查看
- 统计概览：总填写数、题目数、问卷状态
- 选择题：饼图 + 柱状图展示选项分布
- 简答题：答案列表展示
- 按时间筛选提交记录
- 导出填写结果为 CSV

### 4. 模板与草稿
- 3 个预置问卷模板
- 编辑过程中自动保存草稿
- 问卷复制功能

## 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite
- **UI 组件库**: Ant Design 6
- **状态管理**: Zustand
- **路由管理**: React Router
- **API 模拟**: MSW (Mock Service Worker)
- **图表库**: ECharts + echarts-for-react
- **拖拽排序**: @dnd-kit
- **二维码生成**: qrcode
- **日期处理**: dayjs

## 项目结构

```
src/
├── components/          # 组件目录
│   ├── QuestionEditor.tsx      # 题目编辑器
│   └── SortableQuestionEditor.tsx  # 可拖拽排序的题目编辑器
├── mocks/               # MSW 模拟 API
│   ├── browser.ts       # MSW 浏览器端配置
│   ├── handlers.ts      # API 处理函数
│   └── data.ts          # 预置数据
├── pages/               # 页面组件
│   ├── QuestionnaireList.tsx    # 问卷列表页
│   ├── QuestionnaireEditor.tsx  # 问卷编辑器
│   ├── QuestionnaireFill.tsx    # 问卷填写页
│   └── QuestionnaireStats.tsx   # 数据统计页
├── store/               # 状态管理
│   └── questionnaireStore.ts    # 问卷状态 store
├── types/               # TypeScript 类型定义
│   └── index.ts         # 核心类型定义
├── App.tsx              # 应用入口组件
├── main.tsx             # 应用入口文件
├── index.css            # 全局样式
└── vite-env.d.ts        # Vite 环境类型
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

访问 http://localhost:5173 即可查看应用。

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

### 代码检查

```bash
npm run lint
```

## 页面说明

### 1. 问卷列表页 (`/`)
- 展示所有问卷及其状态
- 支持创建新问卷、使用模板
- 支持编辑、查看统计、复制、删除问卷

### 2. 问卷编辑器 (`/editor/:id`)
- 编辑问卷基本信息（标题、描述、截止时间）
- 添加/编辑题目（单选、多选、简答）
- 拖拽调整题目顺序
- 自动保存草稿
- 保存或发布问卷

### 3. 问卷填写页 (`/fill/:id`)
- 展示问卷题目供用户填写
- 必填项校验
- 截止时间检查
- 防止重复提交
- 提交成功后显示感谢页

### 4. 数据统计页 (`/stats/:id`)
- 统计数据概览
- 选择题使用饼图和柱状图展示
- 简答题展示答案列表
- 按时间范围筛选
- 导出 CSV 数据
- 生成填写二维码

## 预置数据

项目使用 MSW 模拟后端 API，预置了以下数据：

- **5 份示例问卷**：包含不同状态（已发布、草稿、已截止）
- **3 个问卷模板**：满意度调查、活动报名、员工培训反馈
- **多份提交记录**：用于展示统计图表

## 核心特性实现说明

### Zustand 状态管理
- 乐观更新：添加/修改题目时立即反映到 UI
- 草稿自动保存：每 30 秒及页面关闭前保存

### MSW API 模拟
- RESTful API 设计
- 支持问卷 CRUD、复制、提交记录查询、统计等
- 数据存储在内存中，刷新后重置

### 拖拽排序
- 使用 @dnd-kit 实现流畅的拖拽体验
- 拖拽后自动更新题目顺序

### 响应式设计
- 使用 Ant Design Grid 系统
- 移动端、平板、桌面端均有良好体验

## 开发说明

### 添加新题型
1. 在 `src/types/index.ts` 中扩展 `QuestionType` 类型
2. 在 `QuestionEditor.tsx` 中添加对应的编辑界面
3. 在 `QuestionnaireFill.tsx` 中添加对应的填写界面
4. 在 `QuestionnaireStats.tsx` 中添加对应的统计展示

### 扩展 API
1. 在 `src/mocks/handlers.ts` 中添加新的请求处理函数
2. 在相关页面或 store 中调用新 API

## 许可证

MIT
