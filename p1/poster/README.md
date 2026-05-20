# 海报精灵 Pro

一款功能丰富、性能卓越的在线海报设计工具，基于 React 18 + TypeScript + Vite + Fabric.js + Zustand + Tailwind CSS 构建。

## 功能特性

### 画布与模板系统
- ✅ 自定义画布尺寸，预设常用尺寸模板
- ✅ 无限缩放（25% ~ 400%）
- ✅ 网格吸附对齐
- ✅ 像素级移动和变换

### 元素编辑
#### 文本元素
- ✅ 多字体支持
- ✅ 字号、行高、字间距调整
- ✅ 段落对齐
- ✅ 文本颜色（纯色）
- ✅ 描边效果
- ✅ 粗体、斜体样式
- ✅ 文本装饰

#### 形状元素
- ✅ 矩形、圆形、三角形、星形
- ✅ 填充色（纯色）
- ✅ 描边样式（虚线、端点、粗细）

#### 图层管理
- ✅ 缩略图和名称显示
- ✅ 锁定/解锁
- ✅ 可见/隐藏
- ✅ 拖拽排序（通过按钮）
- ✅ 多选支持
- ✅ 图层层级调整（上移、下移、置顶、置底）
- ✅ 混合模式（正片叠底、滤色等 8 种）

### 操作与历史
- ✅ 撤销/重做历史栈
- ✅ 复制、粘贴、克隆
- ✅ 删除功能
- ✅ 快捷键支持（Ctrl+Z、Ctrl+Y、Ctrl+C、Ctrl+V、Delete 等）

### 主题与导出
- ✅ 亮色/暗色主题切换
- ✅ 导出为 JSON 项目文件

### 性能优化
- ✅ Fabric.js 脏矩形渲染优化
- ✅ 对象缓存机制

## 技术架构

### 核心技术栈
- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Fabric.js** - 画布渲染和交互
- **Zustand** - 状态管理
- **Tailwind CSS** - 样式框架

### 目录结构
```
src/
├── core/                      # 核心逻辑层
│   ├── CanvasManager.ts      # Fabric.js 画布管理
│   ├── HistoryManager.ts     # 历史栈管理
│   ├── KeyboardManager.ts    # 快捷键管理
│   └── SnapManager.ts        # 吸附对齐管理
├── components/                # React 组件层
│   ├── App.tsx               # 主应用组件
│   ├── Header.tsx            # 顶部导航栏
│   ├── Canvas.tsx            # 画布组件
│   ├── Toolbar.tsx           # 右侧工具栏
│   └── LayerPanel.tsx        # 左侧图层面板
├── stores/                    # 状态管理层
│   └── useEditorStore.ts     # 编辑器全局状态
├── types/                     # 类型定义层
│   └── index.ts              # 所有类型定义
├── data/                      # 数据层
│   └── templates.ts          # 模板预设数据
├── utils/                     # 工具函数层
│   ├── colorUtils.ts         # 颜色处理工具
│   └── aiUtils.ts            # AI 辅助工具
├── workers/                   # Web Worker
│   └── imageProcessor.worker.ts  # 图片处理
└── styles/                    # 样式层
    └── index.css             # 全局样式 + Tailwind
```

### 架构设计原则

1. **分离关注点**
   - core 层：纯逻辑封装，无 React 依赖
   - components 层：UI 渲染和交互，通过状态与 core 层通信
   - stores 层：全局状态管理，连接 UI 和 core 层

2. **可测试性**
   - core 层独立可单元测试
   - Zustand store 支持注入和测试
   - 工具函数纯函数设计

3. **扩展性**
   - Manager 类支持扩展新功能
   - 状态按模块拆分，便于添加新功能
   - 类型完整，便于维护

### 历史系统设计

基于命令模式实现的无限制历史栈：

```typescript
interface HistoryState {
  elements: CanvasElement[];      // 元素快照
  canvasSize: CanvasSize;          // 画布尺寸
  backgroundColor: string;         // 背景色
  selectedIds: string[];           // 选中状态
}

class HistoryManager {
  push(command): void              // 记录新状态
  undo(): HistoryState | null     // 撤销
  redo(): HistoryState | null     // 重做
  goTo(index): HistoryState | null // 跳转到指定步骤
}
```

**工作流程**：
1. 每次执行可撤销操作前，记录当前状态
2. 执行操作后，将新状态压入历史栈
3. 撤销时，取出历史栈中前一个状态恢复
4. 重做时，取出历史栈中后一个状态恢复

### 智能配色算法

```typescript
function generateColorPalette(baseColor: string): ColorPalette {
  // 1. 转换 baseColor 为 HSL
  // 2. 计算互补色（hue + 180°）
  // 3. 计算类似色（hue ± 30°）
  // 4. 生成主色、次色、强调色、背景色、文本色
}
```

**配色方案**：
- 主色：用户选择的基础色
- 次色：类似色（±30°色相），饱和度微调
- 强调色：互补色（±180°色相），用于突出显示
- 背景色：主色的亮色/暗色版本（根据亮度判断）
- 文本色：与背景色对比度 ≥ 4.5:1

## 扩展指南

### 添加新元素类型

1. 在 `src/types/index.ts` 中添加元素类型定义
2. 在 `src/components/Toolbar.tsx` 中添加添加按钮
3. 在 `src/core/CanvasManager.ts` 中添加 Fabric 对象创建逻辑
4. 在 `src/components/Toolbar.tsx` 中添加属性编辑面板

### 添加新滤镜

1. 在 `src/types/index.ts` 中添加滤镜类型
2. 在 `src/components/Toolbar.tsx` 中添加滤镜控件
3. 在 `src/core/CanvasManager.ts` 中添加滤镜应用逻辑
4. （可选）在 `src/workers/imageProcessor.worker.ts` 中添加 Web Worker 处理

### 添加新快捷键

1. 在 `src/core/KeyboardManager.ts` 中注册新快捷键
2. 在 `src/stores/useEditorStore.ts` 中添加对应的 action
3. 更新文档说明

## 开发指南

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

### 运行测试
```bash
npm run test
```

### 代码检查
```bash
npm run lint
```

## 快捷键列表

| 快捷键 | 功能 |
|--------|------|
| Ctrl + Z | 撤销 |
| Ctrl + Y / Ctrl + Shift + Z | 重做 |
| Ctrl + C | 复制 |
| Ctrl + V | 粘贴 |
| Ctrl + D | 克隆 |
| Delete / Backspace | 删除 |
| Ctrl + A | 全选 |
| Escape | 取消选择 |
| Ctrl + [ | 后移一层 |
| Ctrl + ] | 前移一层 |
| Ctrl + Shift + [ | 置于底层 |
| Ctrl + Shift + ] | 置于顶层 |
| 方向键 | 微移元素 |
| Shift + 方向键 | 大幅移动元素 |

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 性能指标

- 画布承载 200+ 独立对象时，操作响应 < 50ms
- 拖拽和缩放流畅 60fps
- 图片加载使用 Web Worker 异步处理

## 许可证

MIT License
