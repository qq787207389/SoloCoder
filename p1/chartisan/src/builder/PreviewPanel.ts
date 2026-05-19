import { state } from './state'
import { Chartisan } from '../chartisan'
import { ChartInstance } from '../chartisan/types'

let chartInstance: ChartInstance | null = null
let unsubscribeState: (() => void) | null = null
let isRendering = false
let debounceTimer: number | null = null

export function renderPreviewPanel(container: HTMLElement) {
  container.innerHTML = `
    <div class="preview-header">
      <div class="preview-title">🎨 图表预览</div>
      <div>
        <button class="btn btn-primary" id="refreshChartBtn">刷新</button>
      </div>
    </div>
    <div class="preview-content">
      <div id="chartContainer" class="chart-container"></div>
    </div>
  `

  document.getElementById('refreshChartBtn')?.addEventListener('click', () => {
    renderChart(true)
  })
  
  // 只订阅一次状态变化，添加防抖
  if (!unsubscribeState) {
    unsubscribeState = state.subscribe(() => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
      debounceTimer = window.setTimeout(() => renderChart(false), 50)
    })
  }
  
  renderChart(true)
}

function renderChart(force = false) {
  if (isRendering && !force) return
  
  const container = document.getElementById('chartContainer')
  if (!container) return

  isRendering = true

  // 销毁旧图表实例
  if (chartInstance) {
    try {
      chartInstance.destroy()
    } catch (e) {
      console.warn('Destroy error:', e)
    }
    chartInstance = null
  }

  // 彻底清理容器并固定高度
  container.innerHTML = ''
  container.style.height = '500px'
  container.style.minHeight = '500px'
  
  const currentState = state.get()

  try {
    // 禁用响应式和动画
    const options = {
      ...currentState.options,
      animation: { show: false, duration: 0, easing: 'linear' },
      responsive: false
    }

    // 添加延迟确保 DOM 稳定
    setTimeout(() => {
      try {
        switch (currentState.chartType) {
          case 'bar':
            chartInstance = Chartisan.init(container).bar({
              data: currentState.data,
              options: options
            })
            break
          case 'line':
            chartInstance = Chartisan.init(container).line({
              data: currentState.data,
              options: options
            })
            break
          case 'pie':
            chartInstance = Chartisan.init(container).pie({
              data: currentState.data,
              options: options
            })
            break
          case 'scatter':
            chartInstance = Chartisan.init(container).scatter({
              data: currentState.data,
              options: options
            })
            break
        }
        
        // 绑定 PNG 导出
        const exportBtn = document.getElementById('exportPngBtn')
        if (exportBtn && !exportBtn.dataset.bound) {
          exportBtn.dataset.bound = 'true'
          exportBtn.addEventListener('click', () => {
            if (chartInstance) {
              const dataUrl = chartInstance.toImage()
              const link = document.createElement('a')
              link.download = 'chart.png'
              link.href = dataUrl
              link.click()
            }
          })
        }
      } catch (err) {
        console.error('Chart render error:', err)
        showError(container)
      } finally {
        isRendering = false
      }
    }, 10)
  } catch (error) {
    console.error('Render setup error:', error)
    showError(container)
    isRendering = false
  }
}

function showError(container: HTMLElement) {
  container.innerHTML = `<div class="empty-state" style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
    <div class="empty-state-icon" style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
    <div class="empty-state-text" style="color: #999;">图表渲染出错</div>
  </div>`
}
