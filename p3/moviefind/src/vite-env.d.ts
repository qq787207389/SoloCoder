/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

import type { ElMessageBox, ElMessage } from 'element-plus'

declare global {
  const ElMessageBox: typeof import('element-plus')['ElMessageBox']
  const ElMessage: typeof import('element-plus')['ElMessage']
}
