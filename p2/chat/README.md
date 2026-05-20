# 轻聊 - 实时聊天室应用

一个基于 React + TypeScript + Vite + Tailwind CSS 构建的现代化实时聊天室应用。

## 功能特性

### 👥 用户与频道
- 用户输入昵称即可加入聊天室（无需注册）
- 随机分配头像颜色
- 支持多个聊天室频道：大厅、技术交流、闲聊
- 显示当前在线用户列表
- 用户加入/离开时的系统提示

### 💬 实时消息
- 发送和接收文本消息
- Emoji 表情选择器
- 消息列表自动滚动到底部
- 用户查看历史消息时，有新消息会显示"新消息"气泡按钮
- 支持消息引用回复，显示被引用消息的预览
- 消息发送状态指示（发送中/已发送）

### 🖼️ 图片上传
- 支持本地文件上传图片
- 支持剪贴板粘贴图片
- 超过 1MB 的图片自动压缩为 800px 宽度

### 🔍 历史消息与搜索
- 频道历史消息存储在 IndexedDB
- 切换频道时加载最近 100 条消息
- 顶部搜索框可搜索当前频道的历史消息
- 搜索关键词高亮显示
- 支持在搜索结果间跳转

### 📱 响应式设计
- 移动端布局为全屏聊天界面
- 频道和用户列表在抽屉式菜单中
- 桌面端显示侧边栏

### 🎨 主题与音效
- 深色/浅色主题切换
- 新消息 Web Audio 音效提示

### ⌨️ 打字指示器
- 显示"某某正在输入..."提示

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式方案**: Tailwind CSS
- **状态管理**: Zustand
- **本地存储**: IndexedDB (idb 库)
- **图标库**: Lucide React
- **表情选择器**: emoji-picker-react
- **WebSocket 模拟**: 自定义 Mock 服务

## 项目结构

```
src/
├── components/          # React 组件
│   ├── Avatar.tsx       # 头像组件
│   ├── ChatHeader.tsx   # 聊天头部
│   ├── ChatRoom.tsx     # 聊天主界面
│   ├── ChannelList.tsx  # 频道列表
│   ├── LoginForm.tsx    # 登录表单
│   ├── MessageInput.tsx # 消息输入框
│   ├── MessageItem.tsx  # 消息项
│   ├── MessageList.tsx  # 消息列表
│   ├── MobileDrawer.tsx # 移动端抽屉
│   ├── SearchBar.tsx    # 搜索栏
│   ├── TypingIndicator.tsx # 打字指示器
│   └── UserList.tsx     # 用户列表
├── mocks/               # Mock 服务
│   └── mockWebSocket.ts # WebSocket 模拟服务
├── store/               # Zustand 状态管理
│   └── useChatStore.ts  # 聊天状态 store
├── types/               # TypeScript 类型定义
│   └── index.ts
├── utils/               # 工具函数
│   ├── db.ts            # IndexedDB 封装
│   ├── imageCompressor.ts # 图片压缩工具
│   └── sound.ts         # 音效工具
├── App.tsx              # 主应用组件
├── main.tsx             # 应用入口
└── index.css            # 全局样式
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

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 使用说明

1. **加入聊天**: 打开应用后，输入昵称即可加入聊天室
2. **切换频道**: 在左侧频道列表点击想要进入的频道
3. **发送消息**: 在底部输入框输入消息，按回车或点击发送按钮
4. **发送表情**: 点击表情按钮打开表情选择器
5. **发送图片**: 点击图片按钮选择文件，或直接粘贴剪贴板中的图片
6. **引用回复**: 鼠标悬停在消息上，点击回复按钮引用该消息
7. **搜索消息**: 点击顶部搜索按钮，输入关键词搜索历史消息
8. **切换主题**: 点击顶部太阳/月亮图标切换深色/浅色主题
9. **查看在线用户**: 在左侧用户列表查看当前在线用户

## 注意事项

- WebSocket 服务为模拟实现，仅用于单机演示
- 历史消息存储在浏览器的 IndexedDB 中，清除浏览器数据会丢失
- 图片会自动压缩以优化存储和传输

## License

MIT
