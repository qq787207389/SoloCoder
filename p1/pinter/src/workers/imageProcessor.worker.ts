const canvas = new OffscreenCanvas(1, 1)
const ctx = canvas.getContext('2d')!

interface ProcessImageMessage {
  type: 'crop' | 'filter' | 'thumbnail'
  imageData: ImageData
  payload?: any
}

function applyFilter(imageData: ImageData, filter: string): ImageData {
  const { data, width, height } = imageData
  const newData = new Uint8ClampedArray(data)

  switch (filter) {
    case 'grayscale':
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
        newData[i] = avg
        newData[i + 1] = avg
        newData[i + 2] = avg
      }
      break
    case 'sepia':
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        newData[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189)
        newData[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168)
        newData[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131)
      }
      break
    case 'vintage':
      for (let i = 0; i < data.length; i += 4) {
        newData[i] = Math.min(255, data[i] * 1.1)
        newData[i + 1] = Math.min(255, data[i + 1] * 1.05)
        newData[i + 2] = Math.min(255, data[i + 2] * 0.8)
      }
      break
    case 'vivid':
      for (let i = 0; i < data.length; i += 4) {
        newData[i] = Math.min(255, data[i] * 1.3)
        newData[i + 1] = Math.min(255, data[i + 1] * 1.3)
        newData[i + 2] = Math.min(255, data[i + 2] * 1.3)
      }
      break
    case 'cool':
      for (let i = 0; i < data.length; i += 4) {
        newData[i] = Math.min(255, data[i] * 0.9)
        newData[i + 1] = Math.min(255, data[i + 1] * 0.95)
        newData[i + 2] = Math.min(255, data[i + 2] * 1.2)
      }
      break
  }

  return new ImageData(newData, width, height)
}

function cropImage(imageData: ImageData, cropArea: { x: number; y: number; width: number; height: number }): ImageData {
  canvas.width = cropArea.width
  canvas.height = cropArea.height
  
  const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height)
  const tempCtx = tempCanvas.getContext('2d')!
  tempCtx.putImageData(imageData, 0, 0)
  
  ctx.drawImage(
    tempCanvas,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    cropArea.width,
    cropArea.height
  )

  return ctx.getImageData(0, 0, cropArea.width, cropArea.height)
}

function createThumbnail(imageData: ImageData, maxSize: number = 200): ImageData {
  const { width, height } = imageData
  const ratio = Math.min(maxSize / width, maxSize / height)
  const newWidth = Math.floor(width * ratio)
  const newHeight = Math.floor(height * ratio)

  canvas.width = newWidth
  canvas.height = newHeight

  const tempCanvas = new OffscreenCanvas(width, height)
  const tempCtx = tempCanvas.getContext('2d')!
  tempCtx.putImageData(imageData, 0, 0)

  ctx.drawImage(tempCanvas, 0, 0, width, height, 0, 0, newWidth, newHeight)

  return ctx.getImageData(0, 0, newWidth, newHeight)
}

function extractColors(imageData: ImageData): string[] {
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

self.onmessage = (event: MessageEvent<ProcessImageMessage>) => {
  const { type, imageData, payload } = event.data

  try {
    let result: any

    switch (type) {
      case 'crop':
        result = cropImage(imageData, payload.cropArea)
        break
      case 'filter':
        result = applyFilter(imageData, payload.filter)
        break
      case 'thumbnail':
        result = createThumbnail(imageData, payload.maxSize)
        break
      case 'extractColors':
        result = extractColors(imageData)
        break
    }

    self.postMessage({
      success: true,
      type,
      result
    })
  } catch (error) {
    self.postMessage({
      success: false,
      type,
      error: (error as Error).message
    })
  }
}
