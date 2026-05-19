<template>
  <div class="settings">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>数据导入</span>
            </div>
          </template>

          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :show-file-list="false"
            accept=".csv,.json"
            :on-change="handleFileChange"
          >
            <el-button type="primary">选择文件</el-button>
          </el-upload>

          <div v-if="selectedFile" class="file-info">
            <el-icon><Document /></el-icon>
            <span>{{ selectedFile.name }}</span>
            <el-button type="text" size="small" @click="clearFile">清除</el-button>
          </div>

          <el-alert
            v-if="fileType === 'csv'"
            title="CSV导入"
            type="info"
            :closable="false"
            style="margin: 16px 0"
          >
            请确保CSV格式正确：日期,类型,分类,金额,币种,备注,标签
          </el-alert>

          <el-button
            type="success"
            :disabled="!selectedFile || importing"
            @click="importData"
            :loading="importing"
          >
            开始导入
          </el-button>

          <div v-if="importResult" class="import-result">
            <el-alert
              :title="`导入完成: 成功 ${importResult.valid} 条, 失败 ${importResult.errors.length} 条`"
              :type="importResult.errors.length ? 'warning' : 'success'"
              :closable="false"
            />
            <div v-if="importResult.errors.length > 0" class="error-list">
              <div v-for="(error, index) in importResult.errors.slice(0, 5)" :key="index" class="error-item">
                {{ error }}
              </div>
              <div v-if="importResult.errors.length > 5" class="error-more">
                还有 {{ importResult.errors.length - 5 }} 条错误...
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>数据导出</span>
            </div>
          </template>

          <div class="export-buttons">
            <el-button type="primary" @click="exportExcel" style="width: 100%; margin-bottom: 12px">
              <el-icon><Download /></el-icon>
              导出为 Excel
            </el-button>
            <el-button type="warning" @click="exportJSON" style="width: 100%">
              <el-icon><Download /></el-icon>
              导出为 JSON (备份)
            </el-button>
          </div>

          <el-divider />

          <div class="import-section">
            <h4>从 JSON 恢复</h4>
            <el-upload
              :auto-upload="false"
              :show-file-list="false"
              accept=".json"
              :on-change="handleJSONFile"
            >
              <el-button>选择备份文件</el-button>
            </el-upload>
            <div v-if="jsonFile" class="file-info">
              <el-icon><Document /></el-icon>
              <span>{{ jsonFile.name }}</span>
            </div>
            <el-button
              type="success"
              :disabled="!jsonFile"
              @click="restoreFromJSON"
              style="margin-top: 12px"
            >
              恢复数据
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>危险操作</span>
            </div>
          </template>

          <div class="danger-zone">
            <el-button type="danger" @click="showClearDialog = true">
              <el-icon><Delete /></el-icon>
              清空当前账本数据
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog
      v-model="showClearDialog"
      title="确认清空数据"
      width="500px"
      @close="cancelClear"
    >
      <el-alert
        title="此操作不可撤销！"
        type="error"
        :closable="false"
        style="margin-bottom: 16px"
      />
      <p>
        请输入 <strong>确认清空</strong> 以继续，倒计时：
        <span class="countdown">{{ countdown }}</span>
      </p>
      <el-input
        v-model="confirmText"
        placeholder="请输入 '确认清空'"
        style="margin: 16px 0"
      />
      <template #footer>
        <el-button @click="cancelClear">取消</el-button>
        <el-button
          type="danger"
          :disabled="confirmText !== '确认清空' || countdown > 0"
          @click="clearData"
        >
          确认清空
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, Download, Delete } from '@element-plus/icons-vue'
import { useTransactionStore } from '@/stores/transactionStore'
import { useBookStore } from '@/stores/bookStore'
import * as XLSX from 'xlsx'
import type { Transaction, CSVParseResult } from '@/types'

const transactionStore = useTransactionStore()
const bookStore = useBookStore()

const selectedFile = ref<File | null>(null)
const jsonFile = ref<File | null>(null)
const fileType = ref<'csv' | 'json' | null>(null)
const importing = ref(false)
const importResult = ref<CSVParseResult | null>(null)

const showClearDialog = ref(false)
const confirmText = ref('')
const countdown = ref(5)
let countdownTimer: number | null = null

function handleFileChange(file: { raw: File }) {
  selectedFile.value = file.raw
  const ext = file.raw.name.split('.').pop()?.toLowerCase()
  fileType.value = ext === 'csv' || ext === 'json' ? ext : null
  importResult.value = null
}

function clearFile() {
  selectedFile.value = null
  fileType.value = null
  importResult.value = null
}

async function importData() {
  if (!selectedFile.value) return

  importing.value = true
  try {
    const text = await selectedFile.value.text()
    if (fileType.value === 'csv') {
      parseCSV(text)
    } else if (fileType.value === 'json') {
      parseJSON(text)
    }
  } catch (error) {
    ElMessage.error('文件解析失败')
  } finally {
    importing.value = false
  }
}

function parseCSV(text: string) {
  const lines = text.split('\n').filter((line) => line.trim())
  const result: CSVParseResult = {
    success: true,
    data: [],
    errors: [],
    total: lines.length - 1,
    valid: 0,
  }

  const headers = lines[0].split(',').map((h) => h.trim())

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim())
    try {
      const transaction: Partial<Transaction> = {
        bookId: bookStore.currentBookId || '',
        date: values[headers.indexOf('日期')],
        type: values[headers.indexOf('类型')] === '收入' ? 'income' : 'expense',
        categoryName: values[headers.indexOf('分类')],
        categoryId: values[headers.indexOf('分类')],
        baseAmount: parseFloat(values[headers.indexOf('金额')]),
        amount: parseFloat(values[headers.indexOf('金额')]),
        currency: values[headers.indexOf('币种')] || 'CNY',
        note: values[headers.indexOf('备注')] || '',
        tags: values[headers.indexOf('标签')]?.split(';').filter(Boolean) || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      if (!transaction.date || !transaction.baseAmount) {
        throw new Error(`第 ${i + 1} 行数据不完整`)
      }

      result.data.push(transaction)
      result.valid++
    } catch (e: any) {
      result.errors.push(e.message || `第 ${i + 1} 行解析失败`)
    }
  }

  if (result.data.length > 0) {
    transactionStore.addTransactions(result.data as any)
  }

  importResult.value = result
  ElMessage.success(`成功导入 ${result.valid} 条记录`)
}

function parseJSON(text: string) {
  try {
    const data = JSON.parse(text)
    if (Array.isArray(data)) {
      const transactions = data.map((t: any) => ({
        ...t,
        bookId: bookStore.currentBookId || '',
      }))
      transactionStore.addTransactions(transactions)
      importResult.value = {
        success: true,
        data: transactions,
        errors: [],
        total: transactions.length,
        valid: transactions.length,
      }
      ElMessage.success(`成功导入 ${transactions.length} 条记录`)
    }
  } catch (e) {
    ElMessage.error('JSON格式错误')
  }
}

function exportExcel() {
  const transactions = transactionStore.transactions.present
    .filter((t) => t.bookId === bookStore.currentBookId)
    .map((t) => ({
      日期: t.date,
      类型: t.type === 'income' ? '收入' : '支出',
      分类: t.categoryName,
      金额: t.baseAmount,
      币种: t.currency,
      备注: t.note,
      标签: t.tags.join(';'),
    }))

  const ws = XLSX.utils.json_to_sheet(transactions)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '交易记录')
  XLSX.writeFile(wb, `金桔记账_${new Date().toISOString().split('T')[0]}.xlsx`)
  ElMessage.success('导出成功')
}

function exportJSON() {
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    book: bookStore.books.find((b) => b.id === bookStore.currentBookId),
    transactions: transactionStore.transactions.present.filter(
      (t) => t.bookId === bookStore.currentBookId
    ),
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `金桔记账备份_${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('备份成功')
}

function handleJSONFile(file: { raw: File }) {
  jsonFile.value = file.raw
}

async function restoreFromJSON() {
  if (!jsonFile.value) return

  try {
    await ElMessageBox.confirm(
      '此操作将覆盖当前所有数据，确定要继续吗？',
      '确认恢复',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const text = await jsonFile.value.text()
    const data = JSON.parse(text)

    if (data.transactions && Array.isArray(data.transactions)) {
      transactionStore.transactions.present = data.transactions
      transactionStore.saveState()
      ElMessage.success('恢复成功')
      jsonFile.value = null
    }
  } catch {
    // 用户取消
  }
}

function cancelClear() {
  showClearDialog.value = false
  confirmText.value = ''
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

function clearData() {
  if (bookStore.currentBookId) {
    transactionStore.clearBookTransactions(bookStore.currentBookId)
    ElMessage.success('数据已清空')
    cancelClear()
  }
}

function startCountdown() {
  countdown.value = 5
  countdownTimer = window.setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      if (countdownTimer) clearInterval(countdownTimer)
    }
  }, 1000)
}

watch(showClearDialog, (val) => {
  if (val) {
    startCountdown()
  }
})

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
})
</script>

<style scoped>
.settings {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 16px 0;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.export-buttons {
  margin-bottom: 16px;
}

.import-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
}

.import-result {
  margin-top: 16px;
}

.error-list {
  margin-top: 12px;
  max-height: 150px;
  overflow-y: auto;
}

.error-item {
  padding: 8px 12px;
  background: #fef0f0;
  border-radius: 4px;
  margin-bottom: 8px;
  font-size: 12px;
  color: #f56c6c;
}

.error-more {
  text-align: center;
  color: #909399;
  font-size: 12px;
}

.danger-zone {
  padding: 16px;
  background: #fef0f0;
  border-radius: 8px;
}

.countdown {
  color: #f56c6c;
  font-weight: 600;
  font-size: 18px;
}
</style>
