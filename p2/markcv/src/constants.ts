import { ThemeConfig, StyleSettings } from './types';

export const THEMES: Record<string, ThemeConfig> = {
  classic: {
    name: '经典',
    primary: '#1a365d',
    secondary: '#2d3748',
    accent: '#3182ce',
    background: '#ffffff',
    paper: '#f7fafc'
  },
  modern: {
    name: '现代',
    primary: '#0d9488',
    secondary: '#134e4a',
    accent: '#06b6d4',
    background: '#f0fdfa',
    paper: '#ffffff'
  },
  simple: {
    name: '简洁',
    primary: '#374151',
    secondary: '#1f2937',
    accent: '#6b7280',
    background: '#f9fafb',
    paper: '#ffffff'
  }
};

export const DEFAULT_STYLE_SETTINGS: StyleSettings = {
  fontSize: 14,
  lineHeight: 1.6,
  fontFamily: 'system-ui'
};

export const STORAGE_KEYS = {
  MARKDOWN: 'markcv_markdown',
  THEME: 'markcv_theme',
  STYLE_SETTINGS: 'markcv_style_settings'
};

export const EDITOR_TOOLS = [
  { id: 'bold', label: 'B', title: '加粗', prefix: '**', suffix: '**' },
  { id: 'italic', label: 'I', title: '斜体', prefix: '*', suffix: '*' },
  { id: 'heading1', label: 'H1', title: '一级标题', prefix: '# ', suffix: '' },
  { id: 'heading2', label: 'H2', title: '二级标题', prefix: '## ', suffix: '' },
  { id: 'heading3', label: 'H3', title: '三级标题', prefix: '### ', suffix: '' },
  { id: 'link', label: '🔗', title: '链接', prefix: '[', suffix: '](url)' },
  { id: 'list', label: '•', title: '列表', prefix: '- ', suffix: '' },
  { id: 'numbered', label: '1.', title: '有序列表', prefix: '1. ', suffix: '' },
  { id: 'hr', label: '—', title: '分割线', prefix: '\n---\n', suffix: '' }
];

export const SAMPLE_RESUME = `# 张三

**前端开发工程师** | 北京 | zhangsan@email.com | 138-0000-0000 | [GitHub](https://github.com) | [LinkedIn](https://linkedin.com)

## 个人简介

拥有5年前端开发经验，专注于 React 生态系统和现代 Web 应用开发。热爱技术，追求极致的用户体验。

## 工作经历

### 高级前端工程师 @ ABC 科技有限公司
*2021年3月 - 至今*

- 主导公司核心产品的前端架构设计与开发，用户量达 100 万+
- 优化首页加载性能，LCP 从 3.5s 降低到 1.2s
- 建立前端代码规范和 CI/CD 流程，提升团队效率 30%
- 指导初级工程师，进行技术分享和代码审查

### 前端工程师 @ XYZ 互联网公司
*2019年6月 - 2021年2月*

- 负责电商平台的商品详情页和购物车功能开发
- 使用 React + TypeScript 重构旧项目，代码可维护性显著提升
- 与设计团队紧密合作，实现像素级还原的 UI 界面

## 技能

**前端技术：** React, TypeScript, Vue 3, Next.js, Vite, Webpack
**样式方案：** Tailwind CSS, SCSS, CSS-in-JS, Styled Components
**其他技能：** Node.js, GraphQL, REST API, Git, Docker, Jest

## 教育背景

### 计算机科学与技术 本科
北京大学 | 2015年9月 - 2019年6月

- GPA: 3.8/4.0
- 获得国家奖学金
- ACM 程序设计竞赛省级二等奖

## 项目经历

### MarkCV - 在线简历编辑器
*个人开源项目*

- 使用 React 18 + TypeScript + Vite 构建
- 集成 CodeMirror 6 实现 Markdown 编辑功能
- 支持多主题切换、实时预览、PDF 导出
- GitHub Stars: 1000+
`;

export const CODEMIRROR_CONFIG = {
  lineNumbers: true,
  tabSize: 2,
  indentWithTab: true,
  lineWrapping: true
};
