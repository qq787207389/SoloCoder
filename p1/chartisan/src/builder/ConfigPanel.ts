import { state } from './state'
import { ChartType } from '../chartisan/types'
import { defaultThemes } from '../chartisan/themes'

const chartTypes: { type: ChartType; icon: string; name: string }[] = [
  { type: 'bar', icon: '📊', name: '柱状图' },
  { type: 'line', icon: '📈', name: '折线图' },
  { type: 'pie', icon: '🥧', name: '饼图' },
  { type: 'scatter', icon: '⚬', name: '散点图' }
]

export function renderConfigPanel(container: HTMLElement) {
  container.innerHTML = `
    <div class="panel-header">⚙️ 图表配置</div>
    
    <div class="chart-type-selector" id="chartTypeSelector">
      ${chartTypes.map(ct => `
        <div class="chart-type-btn ${ct.type === state.get().chartType ? 'active' : ''}" data-type="${ct.type}">
          <div class="chart-type-icon">${ct.icon}</div>
          <div class="chart-type-name">${ct.name}</div>
        </div>
      `).join('')}
    </div>
    
    <div id="commonConfig"></div>
    <div id="typeSpecificConfig"></div>
    <div class="section-divider"></div>
    <div id="exportSection"></div>
  `

  bindChartTypeEvents()
  renderCommonConfig()
  renderTypeSpecificConfig()
  renderExportSection()
}

function bindChartTypeEvents() {
  document.querySelectorAll('.chart-type-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const type = (e.currentTarget as HTMLElement).dataset.type as ChartType
      document.querySelectorAll('.chart-type-btn').forEach(b => b.classList.remove('active'))
      e.currentTarget.classList.add('active')
      state.set({ chartType: type })
      renderTypeSpecificConfig()
    })
  })
}

function renderCommonConfig() {
  const container = document.getElementById('commonConfig')
  if (!container) return
  const currentOptions = state.get().options

  container.innerHTML = `
    <div class="form-group">
      <label class="form-label">主题</label>
      <div class="color-picker-wrapper" id="themePicker">
        ${Object.entries(defaultThemes).map(([key, theme]) => `
          <div class="color-swatch ${currentOptions.theme === key ? 'active' : ''}" 
               style="background: ${theme.colors[0]}" 
               data-theme="${key}"
               title="${key}">
          </div>
        `).join('')}
      </div>
    </div>
    
    <div class="form-group">
      <label class="form-checkbox">
        <input type="checkbox" id="legendShow" ${currentOptions.legend?.show ? 'checked' : ''}>
        显示图例
      </label>
    </div>
    
    <div class="form-group" id="legendPositionGroup" style="display: ${currentOptions.legend?.show ? 'block' : 'none'}">
      <label class="form-label">图例位置</label>
      <select class="form-select" id="legendPosition">
        <option value="top" ${currentOptions.legend?.position === 'top' ? 'selected' : ''}>顶部</option>
        <option value="bottom" ${currentOptions.legend?.position === 'bottom' ? 'selected' : ''}>底部</option>
        <option value="left" ${currentOptions.legend?.position === 'left' ? 'selected' : ''}>左侧</option>
        <option value="right" ${currentOptions.legend?.position === 'right' ? 'selected' : ''}>右侧</option>
      </select>
    </div>
    
    <div class="form-group">
      <label class="form-checkbox">
        <input type="checkbox" id="animationShow" ${currentOptions.animation?.show !== false ? 'checked' : ''}>
        开启动画
      </label>
    </div>
  `

  // 绑定主题选择事件
  document.getElementById('themePicker')?.addEventListener('click', (e) => {
    const swatch = (e.target as HTMLElement).closest('.color-swatch')
    if (swatch) {
      const theme = (swatch as HTMLElement).dataset.theme || 'light'
      document.querySelectorAll('#themePicker .color-swatch').forEach(s => s.classList.remove('active'))
      swatch.classList.add('active')
      state.set({ options: { ...state.get().options, theme } })
    }
  })

  // 绑定图例显示/隐藏
  document.getElementById('legendShow')?.addEventListener('change', (e) => {
    const checked = (e.target as HTMLInputElement).checked
    const group = document.getElementById('legendPositionGroup')
    if (group) group.style.display = checked ? 'block' : 'none'
    state.set({ options: { ...state.get().options, legend: { ...state.get().options.legend, show: checked } } })
  })

  // 绑定图例位置
  document.getElementById('legendPosition')?.addEventListener('change', (e) => {
    const position = (e.target as HTMLSelectElement).value as any
    state.set({ options: { ...state.get().options, legend: { ...state.get().options.legend, position } } })
  })

  // 绑定动画开关
  document.getElementById('animationShow')?.addEventListener('change', (e) => {
    const checked = (e.target as HTMLInputElement).checked
    state.set({ options: { ...state.get().options, animation: { ...state.get().options.animation, show: checked } } })
  })
}

function renderTypeSpecificConfig() {
  const container = document.getElementById('typeSpecificConfig')
  if (!container) return
  const chartType = state.get().chartType
  const options = state.get().options

  let configHTML = ''

  switch (chartType) {
    case 'bar':
      configHTML = `
        <div class="section-divider"></div>
        <div class="form-group">
          <label class="form-label">柱状图模式</label>
          <select class="form-select" id="barMode">
            <option value="grouped" ${options.mode === 'grouped' ? 'selected' : ''}>分组</option>
            <option value="stacked" ${options.mode === 'stacked' ? 'selected' : ''}>堆叠</option>
          </select>
        </div>
      `
      break
    case 'line':
      configHTML = `
        <div class="section-divider"></div>
        <div class="form-group">
          <label class="form-checkbox">
            <input type="checkbox" id="smoothLine" ${options.smooth ? 'checked' : ''}>
            平滑曲线
          </label>
        </div>
        <div class="form-group">
          <label class="form-checkbox">
            <input type="checkbox" id="showArea" ${options.showArea ? 'checked' : ''}>
            显示面积
          </label>
        </div>
      `
      break
    case 'pie':
      configHTML = `
        <div class="section-divider"></div>
        <div class="form-group">
          <label class="form-checkbox">
            <input type="checkbox" id="showPieLabel" ${options.showLabel !== false ? 'checked' : ''}>
            显示标签
          </label>
        </div>
      `
      break
    case 'scatter':
      configHTML = `
        <div class="section-divider"></div>
        <div class="form-group">
          <label class="form-label">点大小</label>
          <input type="number" class="form-input" id="pointSize" value="${options.pointSize || 4}" min="1" max="20">
        </div>
      `
      break
  }

  container.innerHTML = configHTML
  bindTypeSpecificEvents(chartType)
}

function bindTypeSpecificEvents(chartType: ChartType) {
  switch (chartType) {
    case 'bar':
      document.getElementById('barMode')?.addEventListener('change', (e) => {
        const mode = (e.target as HTMLSelectElement).value as any
        state.set({ options: { ...state.get().options, mode } })
      })
      break
    case 'line':
      document.getElementById('smoothLine')?.addEventListener('change', (e) => {
        const checked = (e.target as HTMLInputElement).checked
        state.set({ options: { ...state.get().options, smooth: checked } })
      })
      document.getElementById('showArea')?.addEventListener('change', (e) => {
        const checked = (e.target as HTMLInputElement).checked
        state.set({ options: { ...state.get().options, showArea: checked } })
      })
      break
    case 'pie':
      document.getElementById('showPieLabel')?.addEventListener('change', (e) => {
        const checked = (e.target as HTMLInputElement).checked
        state.set({ options: { ...state.get().options, showLabel: checked } })
      })
      break
    case 'scatter':
      document.getElementById('pointSize')?.addEventListener('change', (e) => {
        const size = parseInt((e.target as HTMLInputElement).value)
        state.set({ options: { ...state.get().options, pointSize: size } })
      })
      break
  }
}

function renderExportSection() {
  const container = document.getElementById('exportSection')
  if (!container) return

  container.innerHTML = `
    <div class="export-section">
      <div class="panel-header">📤 导出</div>
      <div class="btn-group">
        <button class="btn btn-primary" id="exportPngBtn">导出 PNG</button>
        <button class="btn btn-success" id="exportCodeBtn">生成代码</button>
      </div>
      <div id="codeOutput"></div>
    </div>
  `

  document.getElementById('exportCodeBtn')?.addEventListener('click', () => {
    const currentState = state.get()
    const code = generateCode(currentState.chartType, currentState.data, currentState.options)
    const output = document.getElementById('codeOutput')
    if (output) {
      output.innerHTML = `<div class="code-block">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`
    }
  })
}

function generateCode(chartType: ChartType, data: any, options: any): string {
  return `const chart = Chartisan.init(document.getElementById('chart'))
  .${chartType}({
    data: ${JSON.stringify(data, null, 6)},
    options: ${JSON.stringify(options, null, 6)}
  })`
}
