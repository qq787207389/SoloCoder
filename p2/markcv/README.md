# MarkCV - 在线简历编辑器

使用 React 18 + TypeScript + Vite + CodeMirror 构建的现代化在线简历编辑器。

## ✨ 功能特性

### 核心功能
- **双栏编辑与预览** - 左侧 Markdown 编辑器，右侧实时预览
- **Markdown 工具栏** - 常用格式一键插入
- **键盘快捷键** - 支持撤销/重做、缩进等常用快捷键

### 模板与主题
- **三种主题风格** - 经典、现代、简洁
- **自定义样式** - 可调整字体大小、行高等参数
- **A4 标准格式** - 预览区域使用标准 A4 尺寸

### 数据管理
- **自动保存** - 所有更改自动保存到 LocalStorage
- **PDF 导出** - 一键导出高质量 PDF 简历
- **Markdown 导入/导出** - 支持 .md 文件的导入和导出
- **浏览器打印** - 支持使用浏览器打印功能

### 助手功能
- **简历诊断** - 智能检查简历常见问题
- **示例内容** - 一键加载示例简历模板
- **实时建议** - 提供简历优化建议

## 🛠️ 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **编辑器**: CodeMirror 6
- **样式**: Tailwind CSS
- **Markdown 渲染**: react-markdown + remark-gfm + rehype-raw
- **PDF 导出**: html2canvas + jsPDF
- **路由**: React Router v6

## 📦 安装与运行

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

访问 `http://localhost:3000` 即可使用。

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 📁 项目结构

```
markcv/
├── src/
│   ├── components/          # 组件目录
│   │   ├── MarkdownEditor.tsx     # Markdown 编辑器组件
│   │   ├── ResumePreview.tsx      # 简历预览组件
│   │   ├── Toolbar.tsx            # 工具栏组件
│   │   └── DiagnosticsPanel.tsx   # 诊断面板组件
│   ├── pages/               # 页面目录
│   │   ├── HomePage.tsx          # 首页
│   │   └── EditorPage.tsx        # 编辑器页面
│   ├── utils/               # 工具函数
│   │   ├── storage.ts            # 本地存储工具
│   │   ├── diagnostics.ts        # 简历诊断逻辑
│   │   └── export.ts             # 导出功能
│   ├── types.ts             # TypeScript 类型定义
│   ├── constants.ts         # 常量配置
│   ├── App.tsx              # 应用入口组件
│   ├── main.tsx             # 应用入口文件
│   └── index.css            # 全局样式
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## 🎨 主题说明

### 经典主题
- 深蓝主色调
- 专业商务风格
- 适合大多数行业简历

### 现代主题
- 青色主色调
- 清新现代风格
- 适合创意、设计类简历

### 简洁主题
- 灰色主色调
- 简约大方风格
- 适合技术类简历

## 🔧 快捷键说明

在编辑器中支持以下快捷键：

| 快捷键 | 功能 |
|--------|------|
| `Ctrl/Cmd + Z` | 撤销 |
| `Ctrl/Cmd + Shift + Z` | 重做 |
| `Ctrl/Cmd + S` | 保存（自动） |
| `Tab` | 缩进 |
| `Shift + Tab` | 取消缩进 |

## 📝 使用指南

1. **开始使用** - 点击首页的"开始编辑"按钮进入编辑器
2. **编写内容** - 在左侧编辑器中使用 Markdown 语法编写简历
3. **查看预览** - 右侧实时显示简历效果
4. **切换主题** - 在顶部工具栏选择喜欢的主题
5. **调整样式** - 可自定义字体大小和行高
6. **导出简历** - 完成后点击"导出 PDF"或使用打印功能
7. **保存数据** - 所有内容会自动保存，下次打开自动恢复

## ✅ 简历诊断检查项

- 📞 **联系方式检查** - 是否包含邮箱、电话等联系方式
- 📋 **姓名标题** - 是否使用一级标题作为姓名
- 💼 **工作经历** - 是否包含工作经历描述
- 🔤 **动作动词** - 是否使用动作动词描述工作内容
- ⏱️ **时间倒序** - 工作经历是否按时间倒序排列
- 📏 **内容长度** - 简历内容是否适中

## 📄 Markdown 语法参考

### 基本格式
```markdown
# 一级标题（姓名）
## 二级标题（章节）
### 三级标题（子项）

**粗体文字**
*斜体文字*
[链接文字](网址)

- 列表项目 1
- 列表项目 2

1. 有序列表 1
2. 有序列表 2
```

### 简历示例结构
```markdown
# 张三

**前端开发工程师** | 北京 | zhangsan@email.com

## 个人简介
拥有5年前端开发经验...

## 工作经历
### 高级前端工程师 @ ABC 公司
*2021年 - 至今*

- 负责核心产品开发
- 优化性能提升30%

## 技能
- React, TypeScript, Vue
- Tailwind CSS, SCSS

## 教育背景
### 计算机科学与技术 本科
北京大学 | 2015年 - 2019年
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

Made with ❤️ using React & TypeScript
