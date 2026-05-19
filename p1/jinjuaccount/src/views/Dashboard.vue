<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card income">
          <div class="stat-icon">
            <el-icon :size="40"><TrendCharts /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">本月收入</div>
            <div class="stat-value">¥{{ monthlyIncome.toFixed(2) }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card expense">
          <div class="stat-icon">
            <el-icon :size="40"><ShoppingCart /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">本月支出</div>
            <div class="stat-value">¥{{ monthlyExpense.toFixed(2) }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card balance">
          <div class="stat-icon">
            <el-icon :size="40"><Wallet /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">本月结余</div>
            <div class="stat-value">¥{{ monthlyBalance.toFixed(2) }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card total">
          <div class="stat-icon">
            <el-icon :size="40"><DataLine /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">总记录数</div>
            <div class="stat-value">{{ totalTransactions }} 笔</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <Charts />

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span>最近交易</span>
            <el-button type="text" size="small" @click="$router.push('/transactions')">
              查看全部
            </el-button>
          </template>
          <el-table :data="recentTransactions" style="width: 100%">
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column prop="categoryName" label="分类" width="100" />
            <el-table-column prop="note" label="备注" show-overflow-tooltip />
            <el-table-column label="金额" width="120">
              <template #default="{ row }">
                <span :class="row.type === 'income' ? 'income-text' : 'expense-text'">
                  {{ row.type === 'income' ? '+' : '-' }}¥{{ row.baseAmount.toFixed(2) }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span>预算预警</span>
          </template>
          <div v-if="overBudgetCategories.length > 0" class="budget-warnings">
            <div
              v-for="category in overBudgetCategories"
              :key="category.categoryId"
              class="warning-item"
            >
              <div class="warning-header">
                <span class="warning-icon">⚠️</span>
                <span class="warning-name">{{ category.categoryName }}</span>
              </div>
              <el-progress
                :percentage="(category.spent / category.amount * 100)"
                :color="getProgressColor(category)"
                :stroke-width="12"
              />
              <div class="warning-stats">
                <span>已用: ¥{{ category.spent.toFixed(2) }}</span>
                <span>预算: ¥{{ category.amount.toFixed(2) }}</span>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无预算预警" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { TrendCharts, ShoppingCart, Wallet, DataLine } from '@element-plus/icons-vue'
import { useTransactionStore } from '@/stores/transactionStore'
import { useBookStore } from '@/stores/bookStore'
import { useBudgetStore } from '@/stores/budgetStore'
import Charts from '@/components/Charts.vue'
import type { Budget } from '@/types'

const transactionStore = useTransactionStore()
const bookStore = useBookStore()
const budgetStore = useBudgetStore()

const currentBookTransactions = computed(() =>
  transactionStore.transactions.present.filter(
    (t) => t.bookId === bookStore.currentBookId
  )
)

const thisMonth = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  return currentBookTransactions.value.filter((t) => {
    const date = new Date(t.date)
    return date.getFullYear() === year && date.getMonth() + 1 === month
  })
})

const monthlyIncome = computed(() =>
  thisMonth.value
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.baseAmount, 0)
)

const monthlyExpense = computed(() =>
  thisMonth.value
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.baseAmount, 0)
)

const monthlyBalance = computed(() => monthlyIncome.value - monthlyExpense.value)

const totalTransactions = computed(() => currentBookTransactions.value.length)

const recentTransactions = computed(() =>
  [...currentBookTransactions.value]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)
)

const overBudgetCategories = computed(() => {
  const budgets = budgetStore.getBookBudgets(bookStore.currentBookId || '')
  return budgets.filter((b) => b.spent / b.amount > b.threshold / 100)
})

function getProgressColor(budget: Budget): string {
  const percentage = budget.spent / budget.amount
  if (percentage >= 1) return '#F56C6C'
  if (percentage >= budget.threshold / 100) return '#E6A23C'
  return '#67C23A'
}

onMounted(() => {
  if (budgetStore.getBookBudgets(bookStore.currentBookId || '').length === 0) {
    const defaultBudgets: Omit<Budget, 'id'>[] = [
      {
        bookId: bookStore.currentBookId || '',
        categoryId: '餐饮',
        categoryName: '餐饮',
        amount: 2000,
        period: 'monthly',
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        spent: 1800,
        threshold: 80,
      },
      {
        bookId: bookStore.currentBookId || '',
        categoryId: '交通',
        categoryName: '交通',
        amount: 500,
        period: 'monthly',
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        spent: 300,
        threshold: 80,
      },
      {
        bookId: bookStore.currentBookId || '',
        categoryId: '购物',
        categoryName: '购物',
        amount: 1000,
        period: 'monthly',
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        spent: 950,
        threshold: 80,
      },
    ]

    defaultBudgets.forEach((b) => budgetStore.addBudget(b))
  }
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-card.income .stat-icon {
  color: #67c23a;
  background: rgba(103, 194, 58, 0.1);
}

.stat-card.expense .stat-icon {
  color: #f56c6c;
  background: rgba(245, 108, 108, 0.1);
}

.stat-card.balance .stat-icon {
  color: #409eff;
  background: rgba(64, 158, 255, 0.1);
}

.stat-card.total .stat-icon {
  color: #909399;
  background: rgba(144, 147, 153, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.income-text {
  color: #67c23a;
  font-weight: 500;
}

.expense-text {
  color: #f56c6c;
  font-weight: 500;
}

.budget-warnings {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.warning-item {
  padding: 12px;
  background: #fdf6ec;
  border-radius: 8px;
  border-left: 4px solid #e6a23c;
}

.warning-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.warning-icon {
  font-size: 18px;
}

.warning-name {
  font-weight: 500;
  color: #e6a23c;
}

.warning-stats {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}
</style>
