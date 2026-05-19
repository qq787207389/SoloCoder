<template>
  <el-container class="app-container">
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <h2>金桔记账Pro</h2>
      </div>

      <div class="book-selector">
        <div class="book-header">
          <span>当前账本</span>
          <el-button size="small" circle @click="showBookDialog = true">
            <el-icon><Plus /></el-icon>
          </el-button>
        </div>
        <el-select
          v-model="currentBookId"
          style="width: 100%; margin-top: 8px"
          placeholder="选择账本"
          @change="onBookChange"
        >
          <el-option
            v-for="book in books"
            :key="book.id"
            :label="book.name"
            :value="book.id"
          >
            <span style="display: flex; align-items: center; gap: 8px">
              <el-tag
                :type="getTagType(book.color)"
                size="small"
                style="width: 12px; height: 12px; padding: 0"
              />
              {{ book.name }}
            </span>
          </el-option>
        </el-select>
      </div>

      <el-menu
        :default-active="activeMenu"
        router
        class="nav-menu"
        @select="onMenuSelect"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/transactions">
          <el-icon><Document /></el-icon>
          <span>交易记录</span>
        </el-menu-item>
        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <span>数据管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container class="main-container">
      <el-header class="header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item
              v-for="item in breadcrumbs"
              :key="item.path"
              :to="item.path"
            >
              {{ item.name }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-button-group>
            <el-button size="small" :icon="RefreshLeft" @click="undo" :disabled="!canUndo">
              撤销
            </el-button>
            <el-button size="small" :icon="RefreshRight" @click="redo" :disabled="!canRedo">
              重做
            </el-button>
          </el-button-group>
          <el-button type="primary" size="small" @click="showAddTransaction = true">
            <el-icon><Plus /></el-icon>
            记一笔
          </el-button>
          <el-button type="success" size="small" @click="showBatchTransaction = true">
            批量录入
          </el-button>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>

    <el-dialog
      v-model="showBookDialog"
      title="创建新账本"
      width="500px"
    >
      <el-form :model="newBook" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="newBook.name" placeholder="请输入账本名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="newBook.description"
            type="textarea"
            placeholder="请输入账本描述"
          />
        </el-form-item>
        <el-form-item label="颜色">
          <el-color-picker v-model="newBook.color" />
        </el-form-item>
        <el-form-item label="本位币">
          <el-select v-model="newBook.baseCurrency" style="width: 100%">
            <el-option label="人民币 (CNY)" value="CNY" />
            <el-option label="美元 (USD)" value="USD" />
            <el-option label="日元 (JPY)" value="JPY" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showBookDialog = false">取消</el-button>
        <el-button type="primary" @click="createBook">创建</el-button>
      </template>
    </el-dialog>

    <TransactionForm
      v-model="showAddTransaction"
      :is-batch-mode="false"
      @success="onTransactionSuccess"
    />

    <TransactionForm
      v-model="showBatchTransaction"
      :is-batch-mode="true"
      @success="onTransactionSuccess"
    />
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, DataAnalysis, Document, Setting, RefreshLeft, RefreshRight } from '@element-plus/icons-vue'
import { useBookStore } from '@/stores/bookStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { useBudgetStore } from '@/stores/budgetStore'
import { useCategoryStore } from '@/stores/categoryStore'
import TransactionForm from './TransactionForm.vue'
import type { AccountBook } from '@/types'

const router = useRouter()
const route = useRoute()

const bookStore = useBookStore()
const transactionStore = useTransactionStore()
const budgetStore = useBudgetStore()
const categoryStore = useCategoryStore()

const showBookDialog = ref(false)
const showAddTransaction = ref(false)
const showBatchTransaction = ref(false)

const currentBookId = ref<string | null>(null)

const breadcrumbs = computed(() => {
  const crumbs = [{ name: '首页', path: '/' }]
  if (route.path === '/dashboard') {
    crumbs.push({ name: '仪表盘', path: '/dashboard' })
  } else if (route.path === '/transactions') {
    crumbs.push({ name: '交易记录', path: '/transactions' })
  } else if (route.path === '/settings') {
    crumbs.push({ name: '数据管理', path: '/settings' })
  }
  return crumbs
})

const activeMenu = computed(() => route.path || '/dashboard')

const books = computed(() => bookStore.books)

const canUndo = computed(() => transactionStore.canUndo)
const canRedo = computed(() => transactionStore.canRedo)

const newBook = ref<Partial<AccountBook>>({
  name: '',
  description: '',
  color: '#409EFF',
  baseCurrency: 'CNY',
})

function getTagType(color: string): string {
  const colorMap: Record<string, string> = {
    '#409EFF': 'primary',
    '#67C23A': 'success',
    '#E6A23C': 'warning',
    '#F56C6C': 'danger',
    '#909399': 'info',
  }
  return colorMap[color] || 'primary'
}

function onBookChange(bookId: string) {
  bookStore.setCurrentBook(bookId)
}

function createBook() {
  if (!newBook.value.name) {
    ElMessage.error('请输入账本名称')
    return
  }

  const book = bookStore.addBook(newBook.value as Omit<AccountBook, 'id' | 'createdAt' | 'updatedAt'>)
  currentBookId.value = book.id
  showBookDialog.value = false

  newBook.value = {
    name: '',
    description: '',
    color: '#409EFF',
    baseCurrency: 'CNY',
  }

  ElMessage.success('账本创建成功')
}

function undo() {
  transactionStore.undo()
  ElMessage.success('已撤销')
}

function redo() {
  transactionStore.redo()
  ElMessage.success('已重做')
}

function onMenuSelect(index: string) {
  router.push(index)
}

function onTransactionSuccess() {
  ElMessage.success('记录添加成功')
}

function handleKeydown(e: KeyboardEvent) {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key.toLowerCase()) {
      case 'n':
        e.preventDefault()
        showAddTransaction.value = true
        break
      case 'f':
        e.preventDefault()
        router.push('/transactions')
        break
      case 'z':
        if (e.shiftKey) {
          e.preventDefault()
          if (canRedo.value) redo()
        } else {
          e.preventDefault()
          if (canUndo.value) undo()
        }
        break
    }
  }
}

onMounted(() => {
  bookStore.initBooks()
  transactionStore.initTransactions()
  budgetStore.initBudgets()
  categoryStore.initCategories()

  currentBookId.value = bookStore.currentBookId

  if (books.value.length === 0) {
    bookStore.addBook({
      name: '日常账本',
      description: '日常生活收支记录',
      color: '#409EFF',
      baseCurrency: 'CNY',
    })
  }

  if (transactionStore.currentTransactions.length === 0 && bookStore.currentBookId) {
    generateMockData()
  }

  window.addEventListener('keydown', handleKeydown)
})

function generateMockData() {
  const categories = ['餐饮', '交通', '购物', '娱乐', '居住', '工资', '奖金']
  const transactions = []
  const bookId = bookStore.currentBookId!

  for (let i = 0; i < 200; i++) {
    const isExpense = Math.random() > 0.3
    const category = categories[Math.floor(Math.random() * categories.length)]
    const amount = Math.random() * 1000 + 10
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 90))

    transactions.push({
      bookId,
      type: isExpense ? 'expense' : 'income',
      amount: amount,
      currency: 'CNY',
      baseAmount: amount,
      categoryId: category,
      categoryName: category,
      date: date.toISOString().split('T')[0],
      note: `自动生成的${category}记录 #${i + 1}`,
      tags: ['报销', '聚会', '必要', '可选'].slice(0, Math.floor(Math.random() * 3)),
    })
  }

  transactionStore.addTransactions(transactions)
}
</script>

<style scoped>
.app-container {
  height: 100vh;
  background: #f5f7fa;
}

.sidebar {
  background: #304156;
  display: flex;
  flex-direction: column;
}

.logo {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #1f2d3d;
}

.logo h2 {
  color: #fff;
  margin: 0;
  font-size: 18px;
}

.book-selector {
  padding: 16px;
  border-bottom: 1px solid #1f2d3d;
}

.book-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #bfcbd9;
  font-size: 14px;
}

.nav-menu {
  flex: 1;
  border-right: none;
  background: transparent;
}

.nav-menu .el-menu-item {
  color: #bfcbd9;
}

.nav-menu .el-menu-item:hover,
.nav-menu .el-menu-item.is-active {
  background: #263445;
  color: #409eff;
}

.main-container {
  display: flex;
  flex-direction: column;
}

.header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-left {
  flex: 1;
}

.header-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.main-content {
  flex: 1;
  overflow: auto;
  padding: 20px;
}
</style>
