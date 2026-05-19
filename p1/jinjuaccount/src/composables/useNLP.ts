import type { NLPResult } from '@/types'

interface CategoryPattern {
  keywords: string[]
  category: string
  type: 'income' | 'expense'
}

const categoryPatterns: CategoryPattern[] = [
  { keywords: ['午餐', '吃饭', '餐厅', '外卖', '奶茶', '咖啡', '麦当劳', '肯德基'], category: '餐饮', type: 'expense' },
  { keywords: ['打车', '地铁', '公交', '油费', '停车', '高铁', '飞机', '机票'], category: '交通', type: 'expense' },
  { keywords: ['衣服', '鞋子', '淘宝', '京东', '购物', '超市'], category: '购物', type: 'expense' },
  { keywords: ['电影', '游戏', '旅游', 'KTV', '娱乐'], category: '娱乐', type: 'expense' },
  { keywords: ['房租', '水电', '物业', '装修'], category: '居住', type: 'expense' },
  { keywords: ['工资', '薪水', '薪资', '发薪'], category: '工资', type: 'income' },
  { keywords: ['奖金', '红包', '年终奖'], category: '奖金', type: 'income' },
  { keywords: ['理财', '股票', '基金', '收益'], category: '投资', type: 'income' },
  { keywords: ['兼职', '副业', '外快'], category: '兼职', type: 'income' },
]

const amountRegex = /(\d+(\.\d+)?)/g

export function useNLP() {
  function parseNote(note: string): NLPResult {
    const result: NLPResult = {
      confidence: 0,
    }

    const amounts = note.match(amountRegex)
    if (amounts && amounts.length > 0) {
      result.amount = parseFloat(amounts[0])
      result.confidence += 0.3
    }

    for (const pattern of categoryPatterns) {
      for (const keyword of pattern.keywords) {
        if (note.includes(keyword)) {
          result.category = pattern.category
          result.type = pattern.type
          result.confidence += 0.5
          break
        }
      }
      if (result.category) break
    }

    if (result.confidence > 0.8) {
      result.confidence = 1
    }

    return result
  }

  function suggestCategory(note: string): { category: string | null; type: 'income' | 'expense' | null; confidence: number } {
    const result = parseNote(note)
    return {
      category: result.category || null,
      type: result.type || null,
      confidence: result.confidence,
    }
  }

  function extractAmount(note: string): number | null {
    const result = parseNote(note)
    return result.amount || null
  }

  return {
    parseNote,
    suggestCategory,
    extractAmount,
  }
}
