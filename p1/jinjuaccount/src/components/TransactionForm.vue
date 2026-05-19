<template>
  <el-dialog
    v-model="visible"
    :title="isBatchMode ? '批量记账' : '记一笔'"
    width="600px"
    :close-on-click-modal="false"
    @close="resetForm"
  >
    <el-steps :active="currentStep" align-center>
      <el-step title="金额与类型" />
      <el-step title="选择分类" />
      <el-step title="补充详情" />
    </el-steps>

    <el-form
      ref="formRef"
      :model="form"
      label-width="100px"
      style="margin-top: 30px"
    >
      <div v-show="currentStep === 0">
        <el-form-item label="类型">
          <el-radio-group v-model="form.type" @change="onTypeChange">
            <el-radio-button label="expense">支出</el-radio-button>
            <el-radio-button label="income">收入</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="金额" required>
          <el-input-number
            v-model="form.amount"
            :min="0.01"
            :precision="2"
            size="large"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="币种">
          <el-select v-model="form.currency" style="width: 100%">
            <el-option
              v-for="currency in currencies"
              :key="currency"
              :label="currency"
              :value="currency"
            />
          </el-select>
        </el-form-item>

        <el-form-item v-if="isBatchMode" label="记录数">
          <el-input-number v-model="batchCount" :min="1" :max="20" />
        </el-form-item>
      </div>

      <div v-show="currentStep === 1">
        <el-form-item label="分类" required>
          <el-cascader
            v-model="selectedCategory"
            :options="categoryTree"
            :props="{ value: 'id', label: 'name', children: 'children' }"
            placeholder="请选择分类"
            clearable
            style="width: 100%"
          />
        </el-form-item>

        <div v-if="suggestion.confidence > 0" class="suggestion">
          <el-alert
            :title="`智能建议: ${suggestion.category || ''} (${(suggestion.confidence * 100).toFixed(0)}%)`"
            type="info"
            :closable="false"
            show-icon
          >
            <template #default>
              <el-button type="primary" size="small" @click="applySuggestion">
                应用建议
              </el-button>
            </template>
          </el-alert>
        </div>
      </div>

      <div v-show="currentStep === 2">
        <el-form-item label="日期">
          <el-date-picker
            v-model="form.date"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="form.note"
            type="textarea"
            placeholder="输入备注，如：今天午餐麦当劳50"
            @input="onNoteInput"
            rows="3"
          />
        </el-form-item>

        <el-form-item label="标签">
          <el-select
            v-model="form.tags"
            multiple
            filterable
            allow-create
            placeholder="选择或创建标签"
            style="width: 100%"
          >
            <el-option
              v-for="tag in availableTags"
              :key="tag.id"
              :label="tag.name"
              :value="tag.name"
            />
          </el-select>
        </el-form-item>
      </div>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="prevStep" :disabled="currentStep === 0">
          上一步
        </el-button>
        <el-button v-if="currentStep < 2" type="primary" @click="nextStep">
          下一步
        </el-button>
        <el-button v-else type="primary" @click="submitForm">
          {{ isBatchMode ? '批量添加' : '添加' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useCategoryStore } from '@/stores/categoryStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { useBookStore } from '@/stores/bookStore'
import { useNLP } from '@/composables/useNLP'
import { useCurrencyConverter } from '@/composables/useCurrencyConverter'
import type { Category, Transaction } from '@/types'

interface Props {
  modelValue: boolean
  isBatchMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isBatchMode: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const formRef = ref()
const currentStep = ref(0)
const batchCount = ref(5)
const selectedCategory = ref<string[]>([])
const suggestion = ref({ category: null as string | null, type: null as string | null, confidence: 0 })

const categoryStore = useCategoryStore()
const transactionStore = useTransactionStore()
const bookStore = useBookStore()
const { suggestCategory } = useNLP()
const { currencies, toBaseCurrency } = useCurrencyConverter()

const categoryTree = computed(() => {
  return categoryStore.getCategoryTree(form.value.type)
})

const form = ref({
  type: 'expense' as 'income' | 'expense',
  amount: 0,
  currency: 'CNY' as string,
  categoryId: '',
  categoryName: '',
  date: new Date().toISOString().split('T')[0],
  note: '',
  tags: [] as string[],
})

const availableTags = ref([
  { id: '1', name: '报销' },
  { id: '2', name: '聚会' },
  { id: '3', name: '必要' },
  { id: '4', name: '可选' },
])

function onTypeChange() {
  selectedCategory.value = []
  form.value.categoryId = ''
  form.value.categoryName = ''
}

function onNoteInput() {
  suggestion.value = suggestCategory(form.value.note)
}

function applySuggestion() {
  if (suggestion.value.category) {
    const category = categoryStore.expenseCategories.find(
      (c) => c.name === suggestion.value.category
    )
    if (category) {
      selectedCategory.value = [category.id]
      form.value.categoryId = category.id
      form.value.categoryName = category.name
    }
  }
  if (suggestion.value.type) {
    form.value.type = suggestion.value.type
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

function nextStep() {
  if (currentStep.value < 2) {
    if (currentStep.value === 0 && form.value.amount <= 0) {
      ElMessage.error('请输入正确的金额')
      return
    }
    if (currentStep.value === 1 && selectedCategory.value.length === 0) {
      ElMessage.error('请选择分类')
      return
    }
    currentStep.value++
  }
}

function submitForm() {
  if (!bookStore.currentBookId) {
    ElMessage.error('请先创建账本')
    return
  }

  if (selectedCategory.value.length === 0) {
    ElMessage.error('请选择分类')
    return
  }

  const categoryId = selectedCategory.value[selectedCategory.value.length - 1]
  const category = categoryStore.getCategoryById(categoryId)

  const baseAmount = toBaseCurrency(form.value.amount, form.value.currency as any)

  const transactionData = {
    bookId: bookStore.currentBookId,
    type: form.value.type,
    amount: form.value.amount,
    currency: form.value.currency,
    baseAmount: baseAmount,
    categoryId: categoryId,
    categoryName: category?.name || '',
    date: form.value.date,
    note: form.value.note,
    tags: form.value.tags,
  }

  if (props.isBatchMode) {
    const transactions = Array(batchCount.value)
      .fill(null)
      .map((_, index) => ({
        ...transactionData,
        note: index === 0 ? transactionData.note : `${transactionData.note || '记录'} ${index + 1}`,
      }))
    transactionStore.addTransactions(transactions)
    ElMessage.success(`成功添加 ${batchCount.value} 条记录`)
  } else {
    transactionStore.addTransaction(transactionData)
    ElMessage.success('记账成功')
  }

  emit('success')
  visible.value = false
}

function resetForm() {
  form.value = {
    type: 'expense',
    amount: 0,
    currency: 'CNY',
    categoryId: '',
    categoryName: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
    tags: [],
  }
  selectedCategory.value = []
  currentStep.value = 0
  suggestion.value = { category: null, type: null, confidence: 0 }
}

watch(
  () => selectedCategory.value,
  (val) => {
    if (val.length > 0) {
      const categoryId = val[val.length - 1]
      const category = categoryStore.getCategoryById(categoryId)
      if (category) {
        form.value.categoryId = category.id
        form.value.categoryName = category.name
      }
    }
  }
)
</script>

<style scoped>
.suggestion {
  margin-top: 16px;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
