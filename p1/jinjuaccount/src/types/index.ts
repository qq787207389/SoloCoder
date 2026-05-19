export interface AccountBook {
  id: string
  name: string
  description: string
  color: string
  icon: string
  baseCurrency: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  parentId: string | null
  type: 'income' | 'expense'
  icon: string
  color: string
  level: number
}

export interface Transaction {
  id: string
  bookId: string
  type: 'income' | 'expense'
  amount: number
  currency: string
  baseAmount: number
  categoryId: string
  categoryName: string
  date: string
  note: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface Budget {
  id: string
  bookId: string
  categoryId: string
  categoryName: string
  amount: number
  period: 'monthly' | 'yearly'
  year: number
  month: number
  spent: number
  threshold: number
}

export interface FilterView {
  id: string
  name: string
  filters: TransactionFilters
  createdAt: string
}

export interface TransactionFilters {
  bookId?: string
  type?: 'income' | 'expense'
  categoryId?: string
  minAmount?: number
  maxAmount?: number
  startDate?: string
  endDate?: string
  keyword?: string
  tags?: string[]
}

export interface Tag {
  id: string
  name: string
  color: string
  usageCount: number
}

export interface ExchangeRate {
  base: string
  rates: Record<string, number>
  lastUpdated: string
}

export interface DashboardLayout {
  id: string
  name: string
  widgets: WidgetConfig[]
  createdAt: string
  updatedAt: string
}

export interface WidgetConfig {
  id: string
  type: 'pie' | 'bar' | 'trend' | 'summary' | 'list'
  title: string
  x: number
  y: number
  width: number
  height: number
  config: Record<string, unknown>
}

export interface HistoryState<T> {
  past: T[]
  present: T
  future: T[]
}

export type CurrencyCode = 'CNY' | 'USD' | 'JPY' | 'EUR' | 'GBP'

export interface NLPResult {
  amount?: number
  category?: string
  type?: 'income' | 'expense'
  confidence: number
}

export interface CSVParseResult {
  success: boolean
  data: Partial<Transaction>[]
  errors: string[]
  total: number
  valid: number
}
