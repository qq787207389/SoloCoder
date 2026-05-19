# 金桔记账Pro

一款企业级个人财务管理应用，基于 Vue 3 + TypeScript + Vite + Pinia + Element Plus + ECharts 开发。

## ✨ 功能特性

### 📊 多账本与多维筛选
- **多账本管理**：支持创建多个独立账本（日常、旅行、家庭等）
- **高级筛选**：按账本、分类、金额区间、日期范围、备注关键词筛选
- **筛选视图**：保存常用筛选条件，一键切换
- **虚拟滚动**：处理大量数据流畅无卡顿

### 💰 收支记录与智能分类
- **多步骤表单**：分步引导录入，体验更佳
- **智能分类**：备注关键词自动匹配分类建议
- **批量录入**：支持一次性添加多条记录
- **多币种支持**：CNY/USD/JPY 等，自动换算本位币

### 📈 数据可视化与分析
- **支出构成**：饼图/旭日图切换，支持分类下钻
- **趋势对比**：选择两个时间段进行收支对比分析
- **趋势图**：近30天收支趋势可视化
- **预算预警**：支出超预算触发浏览器通知，界面闪烁警告

### 🏷️ 标签系统
- **自定义标签**：为交易添加个性化标签
- **标签筛选**：支持按标签筛选交易
- **标签统计**：聚合展示各标签支出情况

### 💾 数据导入导出与备份
- **CSV导入**：前端解析，支持格式校验和预览
- **Excel导出**：一键导出为 Excel 格式
- **JSON备份**：完整账本数据备份与恢复
- **安全确认**：危险操作需双重确认和倒计时

### ⌨️ 交互体验增强
- **撤销/重做**：操作历史记录，可回退恢复
- **键盘快捷键**：
  - `Ctrl + N`：新建交易
  - `Ctrl + F`：聚焦搜索
  - `Ctrl + Z`：撤销
- **响应式设计**：适配各种屏幕尺寸

## 🏗️ 架构设计

### 技术栈
```
前端框架: Vue 3 (Composition API)
类型系统: TypeScript
构建工具: Vite 5
状态管理: Pinia
UI组件库: Element Plus
图表库: ECharts + vue-echarts
路由: Vue Router 4
Excel处理: xlsx
测试: Vitest
代码规范: ESLint + Prettier
```

### 目录结构
```
jinjuaccount/
├── src/
│   ├── components/      # 组件
│   │   ├── AppLayout.vue        # 主布局
│   │   ├── Charts.vue           # 图表组件
│   │   ├── TransactionForm.vue  # 记账表单
│   │   └── TransactionList.vue  # 交易列表
│   ├── composables/     # 组合式函数
│   │   ├── useCurrencyConverter.ts  # 汇率转换
│   │   ├── useUndoRedo.ts           # 撤销重做
│   │   └── useNLP.ts                # 智能分类
│   ├── stores/          # Pinia 状态管理
│   │   ├── bookStore.ts         # 账本状态
│   │   ├── transactionStore.ts  # 交易状态
│   │   ├── categoryStore.ts     # 分类状态
│   │   └── budgetStore.ts       # 预算状态
│   ├── types/           # TypeScript 类型定义
│   ├── views/           # 页面视图
│   │   ├── Dashboard.vue        # 仪表盘
│   │   └── Settings.vue         # 设置/数据管理
│   ├── router/          # 路由配置
│   ├── utils/           # 工具函数
│   ├── main.ts          # 入口文件
│   └── App.vue          # 根组件
├── public/              # 静态资源
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### 状态管理设计
采用分层架构，每个 Store 负责独立领域：

- **Book Store**：账本 CRUD、当前账本选择
- **Transaction Store**：交易管理、筛选、历史记录（撤销/重做）
- **Category Store**：分类树管理
- **Budget Store**：预算设置、预警检查

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0

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

### 运行测试
```bash
# 运行测试
npm run test

# 测试覆盖率
npm run test:coverage

# 可视化测试界面
npm run test:ui
```

### 代码检查
```bash
# ESLint 检查
npm run lint

# Prettier 格式化
npm run format

# 类型检查
npm run typecheck
```

## 🧪 测试说明

### 单元测试覆盖范围
1. **金额换算测试**：多币种汇率转换正确性
2. **预算计算测试**：预算预警阈值计算准确性
3. **CSV解析测试**：导入文件格式校验与解析
4. **分类匹配测试**：智能分类关键词匹配
5. **状态管理测试**：Pinia Store 状态变更

### 运行测试
```bash
# 全量测试
npm run test

# 监听模式
npm run test -- --watch

# 查看覆盖率报告
npm run test:coverage
```

## 🔧 核心模块说明

### 1. 撤销/重做 (Undo/Redo)
基于命令模式实现，存储最多 50 条操作历史：

```typescript
// transactionStore.ts
const state = {
  transactions: {
    past: [],        // 历史状态
    present: [],     // 当前状态
    future: []       // 未来状态（重做）
  }
}
```

### 2. 预算预警
利用 Notification API 实现浏览器通知：

```typescript
// budgetStore.ts
if (percentage >= threshold) {
  new Notification('⚠️ 预算预警', {
    body: `${categoryName} 已使用 ${percentage}%`,
    icon: '/favicon.ico'
  })
}
```

### 3. 虚拟滚动
使用 Element Plus 虚拟列表组件，支持 10000+ 条数据流畅滚动。

### 4. 汇率自动更新
定时器每分钟模拟汇率波动：

```typescript
// useCurrencyConverter.ts
setInterval(() => {
  rates.value.USD *= 0.995 + Math.random() * 0.01  // ±0.5% 波动
}, 60000)
```

## 📱 快捷键说明

| 快捷键 | 功能 |
|--------|------|
| Ctrl + N | 新建交易 |
| Ctrl + F | 打开筛选/搜索 |
| Ctrl + Z | 撤销 |
| Ctrl + Shift + Z | 重做 |

## 🔒 安全特性

1. **双重确认**：删除账本、清空数据需二次确认
2. **倒计时锁**：确认按钮 5 秒后才可点击
3. **文本验证**：需输入指定文本方可执行危险操作
4. **本地存储**：所有数据存储在浏览器 LocalStorage

## 📄 CSV 导入格式

```csv
日期,类型,分类,金额,币种,备注,标签
2024-01-15,支出,餐饮,35.5,CNY,午餐,报销
2024-01-16,收入,工资,15000,CNY,1月工资,
```

## 🤝 开发规范

### 提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试相关
chore: 构建/工具相关
```

### 代码规范
- 使用 TypeScript 严格模式
- ESLint + Prettier 自动格式化
- 单文件组件使用 `<script setup>` 语法
- 组合式函数命名以 `use` 开头

## 📅 更新日志

### v1.0.0 (2024-01-01)
- ✅ 多账本管理
- ✅ 智能分类建议
- ✅ 数据可视化图表
- ✅ CSV/Excel 导入导出
- ✅ 撤销/重做功能
- ✅ 预算预警通知
- ✅ 键盘快捷键支持

## 📄 许可证

MIT License

---

**享受你的理财之旅！** 🍊
