<template>
  <div class="transaction-list">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>交易记录</span>
          <div class="header-actions">
            <el-button type="primary" @click="showFilter = !showFilter">
              <el-icon><Filter /></el-icon>
              筛选
            </el-button>
            <el-button @click="saveFilterView">
              <el-icon><Star /></el-icon>
              保存视图
            </el-button>
          </div>
        </div>
      </template>

      <el-collapse-transition>
        <div v-show="showFilter" class="filter-panel">
          <el-form :model="filters" inline label-width="80px">
            <el-form-item label="账本">
              <el-select v-model="filters.bookId" clearable placeholder="全部账本">
                <el-option
                  v-for="book in books"
                  :key="book.id"
                  :label="book.name"
                  :value="book.id"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="类型">
              <el-select v-model="filters.type" clearable placeholder="全部类型">
                <el-option label="收入" value="income" />
                <el-option label="支出" value="expense" />
              </el-select>
            </el-form-item>

            <el-form-item label="分类">
              <el-select v-model="filters.categoryId" clearable placeholder="全部分类">
                <el-option
                  v-for="category in categories"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="金额区间">
              <el-input-number
                v-model="filters.minAmount"
                placeholder="最小"
                style="width: 120px; margin-right: 8px"
              />
              <span>~</span>
              <el-input-number
                v-model="filters.maxAmount"
                placeholder="最大"
                style="width: 120px; margin-left: 8px"
              />
            </el-form-item>

            <el-form-item label="日期范围">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              />
            </el-form-item>

            <el-form-item label="关键词">
              <el-input
                v-model="filters.keyword"
                placeholder="搜索备注或分类"
                clearable
              />
            </el-form-item>

            <el-form-item label="标签">
              <el-select
                v-model="filters.tags"
                multiple
                placeholder="选择标签"
                style="width: 200px"
              >
                <el-option label="报销" value="报销" />
                <el-option label="聚会" value="聚会" />
                <el-option label="必要" value="必要" />
                <el-option label="可选" value="可选" />
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="applyFilters">应用</el-button>
              <el-button @click="resetFilters">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-collapse-transition>

      <div v-if="filterViews.length > 0" class="saved-views">
        <el-tag
          v-for="view in filterViews"
          :key="view.id"
          closable
          @click="loadFilterView(view)"
          @close="deleteFilterView(view.id)"
          class="view-tag"
        >
          {{ view.name }}
        </el-tag>
      </div>

      <div class="list-stats">
        <el-statistic title="共" :value="filteredTransactions.length" suffix="条记录" />
        <el-statistic
          title="收入"
          :value="totalIncome"
          prefix="¥"
          :precision="2"
          value-style="{ color: '#67C23A' }"
        />
        <el-statistic
          title="支出"
          :value="totalExpense"
          prefix="¥"
          :precision="2"
          value-style="{ color: '#F56C6C' }"
        />
        <el-statistic
          title="结余"
          :value="totalBalance"
          prefix="¥"
          :precision="2"
          :value-style="{ color: totalBalance >= 0 ? '#67C23A' : '#F56C6C' }"
        />
      </div>

      <div class="table-wrapper">
        <el-table
          :data="filteredTransactions"
          height="500px"
          style="width: 100%"
        >
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column label="类型" width="80">
            <template #default="{ row }">
              <el-tag :type="row.type === 'income' ? 'success' : 'danger'" size="small">
                {{ row.type === 'income' ? '收' : '支' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="categoryName" label="分类" width="120" />
          <el-table-column prop="note" label="备注" min-width="150" show-overflow-tooltip />
          <el-table-column label="金额" width="150">
            <template #default="{ row }">
              <span :class="['item-amount', row.type]">
                {{ row.type === 'income' ? '+' : '-' }}
                ¥{{ row.baseAmount.toFixed(2) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="bookId" label="账本" width="100">
            <template #default="{ row }">
              <el-tag size="small" type="info">{{ row.bookId }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div v-if="filteredTransactions.length === 0" class="empty-state">
        <el-empty description="暂无交易记录" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Filter, Star } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTransactionStore } from '@/stores/transactionStore'
import { useBookStore } from '@/stores/bookStore'
import { useCategoryStore } from '@/stores/categoryStore'
import type { Transaction, FilterView } from '@/types'

const transactionStore = useTransactionStore()
const bookStore = useBookStore()
const categoryStore = useCategoryStore()

const showFilter = ref(false)
const dateRange = ref<[string, string] | null>(null)

const filters = ref({
  bookId: undefined as string | undefined,
  type: undefined as 'income' | 'expense' | undefined,
  categoryId: undefined as string | undefined,
  minAmount: undefined as number | undefined,
  maxAmount: undefined as number | undefined,
  keyword: undefined as string | undefined,
  tags: undefined as string[] | undefined,
})

const books = computed(() => bookStore.books)
const categories = computed(() => categoryStore.categories)
const filterViews = computed(() => transactionStore.filterViews)

const filteredTransactions = computed(() => transactionStore.filteredTransactions)

const totalIncome = computed(() =>
  filteredTransactions.value
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.baseAmount, 0)
)

const totalExpense = computed(() =>
  filteredTransactions.value
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.baseAmount, 0)
)

const totalBalance = computed(() => totalIncome.value - totalExpense.value)

function applyFilters() {
  if (dateRange.value) {
    filters.value.startDate = dateRange.value[0]
    filters.value.endDate = dateRange.value[1]
  } else {
    delete filters.value.startDate
    delete filters.value.endDate
  }
  transactionStore.setFilters({ ...filters.value })
}

function resetFilters() {
  filters.value = {
    bookId: undefined,
    type: undefined,
    categoryId: undefined,
    minAmount: undefined,
    maxAmount: undefined,
    keyword: undefined,
    tags: undefined,
  }
  dateRange.value = null
  transactionStore.setFilters({})
}

async function saveFilterView() {
  try {
    const { value } = await ElMessageBox.prompt('请输入视图名称', '保存筛选视图', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })
    if (value) {
      transactionStore.saveFilterView(value)
      ElMessage.success('视图保存成功')
    }
  } catch {
    // 用户取消
  }
}

function loadFilterView(view: FilterView) {
  filters.value = { ...view.filters }
  if (view.filters.startDate && view.filters.endDate) {
    dateRange.value = [view.filters.startDate, view.filters.endDate]
  }
  transactionStore.setFilters(view.filters)
}

function deleteFilterView(id: string) {
  transactionStore.deleteFilterView(id)
  ElMessage.success('视图已删除')
}

watch(filters, applyFilters, { deep: true })
</script>

<style scoped>
.transaction-list {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.filter-panel {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 16px;
}

.saved-views {
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.view-tag {
  cursor: pointer;
}

.list-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.virtual-list-wrapper {
  margin-top: 16px;
}

.virtual-list {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  height: 72px;
  box-sizing: border-box;
}

.list-item:hover {
  background: #f5f7fa;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-category {
  font-weight: 500;
  color: #303133;
}

.item-note {
  font-size: 12px;
  color: #909399;
}

.item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.item-amount {
  font-size: 18px;
  font-weight: 600;
}

.item-amount.income {
  color: #67c23a;
}

.item-amount.expense {
  color: #f56c6c;
}

.item-date {
  font-size: 12px;
  color: #909399;
}

.empty-state {
  padding: 40px;
  text-align: center;
}
</style>
