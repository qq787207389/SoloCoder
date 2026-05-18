# 3D 鞋款定制器

一个基于 React + Three.js (React Three Fiber) 的3D产品定制预览器，支持实时交互配置和AR体验。

## 功能特性

### 3D 场景与模型
- ✅ 程序化生成高精度运动鞋3D模型
- ✅ 支持自动旋转、鼠标拖拽旋转、滚轮缩放、右键平移
- ✅ 真实光照和阴影效果
- ✅ 5种预设配色方案
- ✅ 自定义颜色选择器（鞋面、鞋带、鞋底、Logo）

### 部件定制
- ✅ 可切换部件显示/隐藏（鞋带、Logo、徽章）
- ✅ 支持上传自定义图片作为鞋面纹理

### AR 预览
- ✅ WebXR AR 模式（支持Hit Test平面检测）
- ✅ 在真实空间中放置和查看3D模型
- ✅ 响应式移动设备体验

### 交互与UI
- ✅ 美观的控制面板，支持标签页切换
- ✅ 截图功能，一键保存当前视图
- ✅ 全屏模式
- ✅ 加载状态提示

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **3D渲染**: Three.js
- **React 3D**: @react-three/fiber (R3F)
- **3D工具库**: @react-three/drei
- **AR支持**: @react-three/xr
- **样式**: Tailwind CSS

## 快速开始

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

## 如何替换为自定义模型

### 方法1: 使用 glTF/GLB 模型（推荐）

1. 将你的模型文件放到 `public/models/` 目录下
2. 修改 `src/components/Shoe.tsx`:

```tsx
import { useGLTF } from '@react-three/drei';

export function Shoe({ config }: ShoeProps) {
  const { scene } = useGLTF('/models/your-shoe-model.glb');
  
  // 应用颜色到模型材质
  scene.traverse((child) => {
    if (child.isMesh) {
      const material = child.material as THREE.MeshStandardMaterial;
      
      // 根据模型部件名称应用不同颜色
      if (child.name.includes('upper')) {
        material.color.set(config.colors.upper);
      }
      if (child.name.includes('laces')) {
        material.color.set(config.colors.laces);
      }
      // ... 其他部件
    }
  });

  return <primitive object={scene} />;
}
```

### 方法2: 自定义程序化模型

修改 `src/components/Shoe.tsx` 中的几何体构建代码，使用不同的 Three.js 几何体组合。

### 方法3: 添加纹理支持

```tsx
// 在材质中应用纹理
const texture = useTexture('/textures/your-texture.png');

<meshStandardMaterial 
  map={config.customTexture ? customTexture : texture}
  color={config.colors.upper}
/>
```

## 项目结构

```
src/
├── components/
│   ├── Shoe.tsx        # 3D鞋模型组件
│   ├── Scene.tsx       # 3D场景组件
│   ├── UIPanel.tsx     # UI控制面板
│   └── ARViewer.tsx    # AR预览组件
├── types/
│   └── index.ts        # TypeScript类型定义
├── App.tsx             # 主应用组件
├── main.tsx            # 应用入口
└── index.css           # 全局样式
```

## AR 使用说明

### 支持的浏览器
- Chrome for Android 81+
- Edge for Android
- 其他支持 WebXR 的移动浏览器

### 使用方法
1. 在移动设备上打开应用
2. 点击"AR预览"按钮
3. 将摄像头指向平坦表面
4. 点击屏幕放置鞋子模型
5. 移动设备从不同角度查看

## 性能优化

- ✅ 使用 Suspense 进行模型和纹理懒加载
- ✅ 阴影质量根据设备自动降级（可在 Scene.tsx 中调整）
- ✅ 支持 LOD（细节层次）优化
- ✅ 响应式设计，移动端适配

## 自定义配置

### 修改预设配色
编辑 `src/types/index.ts` 中的 `COLOR_PRESETS` 对象:

```ts
export const COLOR_PRESETS: Record<string, ShoeColors> = {
  yourPreset: {
    upper: '#ff0000',
    laces: '#ffffff',
    sole: '#000000',
    logo: '#ffff00',
  },
};
```

### 添加新的可定制部件
1. 在 `src/types/index.ts` 中扩展类型
2. 在 `Shoe.tsx` 中添加对应的几何体
3. 在 `UIPanel.tsx` 中添加控制选项

## 浏览器兼容性

| 功能 | Chrome | Firefox | Safari | Edge |
|------|--------|---------|--------|------|
| 3D渲染 | ✅ | ✅ | ✅ | ✅ |
| AR模式 | ✅ (Android) | ❌ | ✅ (iOS 15+) | ✅ |
| 全屏模式 | ✅ | ✅ | ✅ | ✅ |

## 许可证

MIT
