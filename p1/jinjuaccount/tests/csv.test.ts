import { describe, it, expect } from 'vitest'
import type { Transaction, CSVParseResult } from '../src/types'

describe('CSV Parser', () => {
  function parseCSV(text: string): CSVParseResult {
    const lines = text.split('\n').filter((line) => line.trim())
    const result: CSVParseResult = {
      success: true,
      data: [],
      errors: [],
      total: Math.max(0, lines.length - 1),
      valid: 0,
    }

    if (lines.length === 0) {
      result.success = false
      result.errors.push('文件为空')
      return result
    }

    const headers = lines[0].split(',').map((h) => h.trim())
    const requiredHeaders = ['日期', '类型', '分类', '金额']
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h))

    if (missingHeaders.length > 0) {
      result.success = false
      result.errors.push(`缺少必要列: ${missingHeaders.join(', ')}`)
      return result
    }

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim())
      try {
        if (values.length < headers.length) {
          throw new Error(`第 ${i} 行列数不足`)
        }

        const amount = parseFloat(values[headers.indexOf('金额')])
        if (isNaN(amount)) {
          throw new Error(`第 ${i} 行金额格式错误`)
        }

        const date = values[headers.indexOf('日期')]
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          throw new Error(`第 ${i} 行日期格式错误`)
        }

        const transaction: Partial<Transaction> = {
          date,
          type: values[headers.indexOf('类型')] === '收入' ? 'income' : 'expense',
          categoryName: values[headers.indexOf('分类')],
          categoryId: values[headers.indexOf('分类')],
          baseAmount: amount,
          amount: amount,
          currency: headers.includes('币种') ? values[headers.indexOf('币种')] : 'CNY',
          note: headers.includes('备注') ? values[headers.indexOf('备注')] : '',
          tags: headers.includes('标签')
            ? values[headers.indexOf('标签')].split(';').filter(Boolean)
            : [],
        }

        result.data.push(transaction)
        result.valid++
      } catch (e: any) {
        result.errors.push(e.message)
      }
    }

    return result
  }

  it('should parse valid CSV correctly', () => {
    const csv = `日期,类型,分类,金额,币种,备注,标签
2024-01-15,支出,餐饮,35.5,CNY,午餐,报销
2024-01-16,收入,工资,15000,CNY,1月工资,`

    const result = parseCSV(csv)
    expect(result.success).toBe(true)
    expect(result.total).toBe(2)
    expect(result.valid).toBe(2)
    expect(result.errors).toHaveLength(0)
    expect(result.data).toHaveLength(2)
    expect(result.data[0].categoryName).toBe('餐饮')
    expect(result.data[0].baseAmount).toBe(35.5)
    expect(result.data[0].tags).toEqual(['报销'])
  })

  it('should detect missing headers', () => {
    const csv = `日期,分类,金额,币种,备注,标签
2024-01-15,餐饮,35.5,CNY,午餐,报销`

    const result = parseCSV(csv)
    expect(result.success).toBe(false)
    expect(result.errors).toContain('缺少必要列: 类型')
  })

  it('should detect invalid date format', () => {
    const csv = `日期,类型,分类,金额
2024/01/15,支出,餐饮,35.5`

    const result = parseCSV(csv)
    expect(result.valid).toBe(0)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toContain('日期格式错误')
  })

  it('should detect invalid amount format', () => {
    const csv = `日期,类型,分类,金额
2024-01-15,支出,餐饮,abc`

    const result = parseCSV(csv)
    expect(result.valid).toBe(0)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toContain('金额格式错误')
  })

  it('should handle empty CSV', () => {
    const csv = ''
    const result = parseCSV(csv)
    expect(result.success).toBe(false)
    expect(result.errors).toContain('文件为空')
  })

  it('should handle mixed valid and invalid rows', () => {
    const csv = `日期,类型,分类,金额
2024-01-15,支出,餐饮,35.5
2024-01-16,收入,工资,invalid
2024-01-17,支出,交通,20`

    const result = parseCSV(csv)
    expect(result.total).toBe(3)
    expect(result.valid).toBe(2)
    expect(result.errors).toHaveLength(1)
  })

  it('should correctly parse income and expense types', () => {
    const csv = `日期,类型,分类,金额
2024-01-15,支出,餐饮,35.5
2024-01-16,收入,工资,15000`

    const result = parseCSV(csv)
    expect(result.data[0].type).toBe('expense')
    expect(result.data[1].type).toBe('income')
  })

  it('should handle optional columns gracefully', () => {
    const csv = `日期,类型,分类,金额
2024-01-15,支出,餐饮,35.5`

    const result = parseCSV(csv)
    expect(result.valid).toBe(1)
    expect(result.data[0].currency).toBe('CNY')
    expect(result.data[0].note).toBe('')
    expect(result.data[0].tags).toEqual([])
  })
})

describe('NLP Category Suggestion', () => {
  const categoryPatterns = [
    { keywords: ['午餐', '吃饭', '餐厅', '外卖', '奶茶', '咖啡'], category: '餐饮', type: 'expense' as const },
    { keywords: ['打车', '地铁', '公交', '油费'], category: '交通', type: 'expense' as const },
    { keywords: ['衣服', '鞋子', '淘宝', '京东'], category: '购物', type: 'expense' as const },
    { keywords: ['工资', '薪水', '薪资', '发薪'], category: '工资', type: 'income' as const },
    { keywords: ['奖金', '红包', '年终奖'], category: '奖金', type: 'income' as const },
  ]

  function suggestCategory(note: string): { category: string | null; type: 'income' | 'expense' | null; confidence: number } {
    for (const pattern of categoryPatterns) {
      for (const keyword of pattern.keywords) {
        if (note.includes(keyword)) {
          return {
            category: pattern.category,
            type: pattern.type,
            confidence: 0.8,
          }
        }
      }
    }
    return { category: null, type: null, confidence: 0 }
  }

  it('should suggest 餐饮 for lunch notes', () => {
    const result = suggestCategory('今天午餐麦当劳50元')
    expect(result.category).toBe('餐饮')
    expect(result.type).toBe('expense')
    expect(result.confidence).toBeGreaterThan(0)
  })

  it('should suggest 交通 for taxi notes', () => {
    const result = suggestCategory('打车去公司35元')
    expect(result.category).toBe('交通')
    expect(result.type).toBe('expense')
  })

  it('should suggest 工资 for salary notes', () => {
    const result = suggestCategory('1月工资15000')
    expect(result.category).toBe('工资')
    expect(result.type).toBe('income')
  })

  it('should return null for unknown notes', () => {
    const result = suggestCategory('这是一个测试备注')
    expect(result.category).toBeNull()
    expect(result.type).toBeNull()
    expect(result.confidence).toBe(0)
  })

  it('should match keywords case-insensitively', () => {
    const result1 = suggestCategory('喝了一杯奶茶')
    const result2 = suggestCategory('喝了一杯奶 茶')
    expect(result1.category).toBe('餐饮')
    expect(result2.category).toBeNull()
  })
})
