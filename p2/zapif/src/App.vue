<script setup lang="ts">
import NodePanel from './components/NodePanel.vue'
import WorkflowCanvas from './components/WorkflowCanvas.vue'
import PropertyPanel from './components/PropertyPanel.vue'
import Toolbar from './components/Toolbar.vue'
import ExecutionLog from './components/ExecutionLog.vue'
</script>

<template>
  <div class="app-container">
    <Toolbar />
    <div class="main-content">
      <NodePanel />
      <div class="canvas-wrapper">
        <WorkflowCanvas />
        <ExecutionLog />
      </div>
      <PropertyPanel />
    </div>
  </div>
</template>

<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.canvas-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
}
</style>
