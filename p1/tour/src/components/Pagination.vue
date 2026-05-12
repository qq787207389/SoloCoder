<template>
  <div class="pagination-wrapper">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[6, 12, 24, 48]"
      :layout="layout"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup>
import { watch } from 'vue'

const props = defineProps({
  total: {
    type: Number,
    required: true
  },
  page: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 6
  },
  layout: {
    type: String,
    default: 'total, sizes, prev, pager, next, jumper'
  }
})

const emit = defineEmits(['update:page', 'update:pageSize', 'change'])

const currentPage = defineModel('page', { default: 1 })

const handleSizeChange = (val) => {
  emit('update:pageSize', val)
  emit('change', { page: currentPage.value, pageSize: val })
}

const handleCurrentChange = (val) => {
  emit('change', { page: val, pageSize: props.pageSize })
}

watch(() => props.page, (val) => {
  currentPage.value = val
})
</script>

<style scoped>
.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 30px 0;
}

:deep(.el-pagination) {
  --el-pagination-button-width: 36px;
  --el-pagination-button-height: 36px;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-active):hover) {
  color: #667eea;
}

:deep(.el-pagination.is-background .el-pager li.is-active) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

@media (max-width: 768px) {
  :deep(.el-pagination__total),
  :deep(.el-pagination__sizes),
  :deep(.el-pagination__jump) {
    display: none;
  }
}
</style>