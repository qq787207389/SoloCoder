export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export function base64ToBlob(base64: string, mimeType: string = 'image/png'): Blob {
  const byteCharacters = atob(base64.split(',')[1])
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: mimeType })
}

export function extractColorsFromImage(imageData: ImageData): string[] {
  const { data, width, height } = imageData
  const colorCounts: Record<string, number> = {}
  const sampleRate = 10

  for (let y = 0; y < height; y += sampleRate) {
    for (let x = 0; x < width; x += sampleRate) {
      const i = (y * width + x) * 4
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]
      
      if (a < 128) continue

      const color = getColorName(r, g, b)
      colorCounts[color] = (colorCounts[color] || 0) + 1
    }
  }

  return Object.entries(colorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([color]) => color)
}

function getColorName(r: number, g: number, b: number): string {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const sum = r + g + b

  if (sum > 700) return '白色'
  if (sum < 150) return '黑色'
  if (max - min < 30) return '灰色'

  if (r > g && r > b) {
    if (r - g > 50) return '红色'
    return '橙色'
  }
  if (g > r && g > b) {
    if (g - b > 50) return '绿色'
    return '青色'
  }
  if (b > r && b > g) {
    if (b - g > 50) return '蓝色'
    return '紫色'
  }

  return '彩色'
}

export function generateTagsFromFilename(filename: string): string[] {
  const keywords: Record<string, string[]> = {
    设计: ['design', 'ui', 'ux', 'interface', 'layout', 'mockup', 'wireframe'],
    风景: ['landscape', 'nature', 'mountain', 'sea', 'sky', 'sunset', 'forest'],
    人物: ['person', 'people', 'portrait', 'face', 'human'],
    建筑: ['architecture', 'building', 'city', 'urban', 'house'],
    动物: ['animal', 'dog', 'cat', 'bird', 'pet', 'wildlife'],
    食物: ['food', 'cooking', 'recipe', 'restaurant', 'dish'],
    艺术: ['art', 'painting', 'illustration', 'drawing', 'sketch'],
    科技: ['tech', 'technology', 'computer', 'digital', 'code'],
    旅行: ['travel', 'trip', 'vacation', 'tourism', 'adventure'],
    时尚: ['fashion', 'style', 'clothing', 'wear', 'outfit']
  }

  const filenameLower = filename.toLowerCase()
  const tags: string[] = []

  for (const [tag, words] of Object.entries(keywords)) {
    if (words.some(word => filenameLower.includes(word))) {
      tags.push(tag)
    }
  }

  return tags.slice(0, 3)
}

export function mergeCollaborativeActions(actions: any[]): any[] {
  const seen = new Set<string>()
  const result: any[] = []

  for (const action of actions.sort((a, b) => a.timestamp - b.timestamp)) {
    const key = `${action.type}-${action.payload.id}`
    
    if (action.type === 'card_remove') {
      seen.add(`card_add-${action.payload.id}`)
      seen.add(`card_update-${action.payload.id}`)
      seen.add(`card_move-${action.payload.id}`)
    }

    if (!seen.has(key)) {
      result.push(action)
      if (action.type === 'card_add' || action.type === 'card_update') {
        seen.add(key)
      }
    }
  }

  return result
}
