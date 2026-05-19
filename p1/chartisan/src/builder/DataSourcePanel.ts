import { state } from './state'

let dataWorker: Worker | null = null
let workerInitialized = false

function initWorker() {
  if (workerInitialized) return
  workerInitialized = true
  
  if (typeof Worker !== 'undefined') {
    dataWorker = new Worker(new URL('../workers/dataProcessor.ts', import.meta.url), { type: 'module' })
    dataWorker.onmessage = (e) => {
      switch (e.data.type) {
        case 'PARSE_CSV_SUCCESS':
          state.set({
            rawData: e.data.data,
            xField: e.data.data.headers[0],
            yField: e.data.data.headers[1] || e.data.data.headers[0]
          })
          renderTable()
          break
        case 'GENERATE_SCATTER_DATA_SUCCESS':
          state.set({
            data: {
              datasets: [{
                name: '散点数据',
                data: e.data.data
              }]
            }
          })
          break
      }
    }
  }
}

export function renderDataSourcePanel(container: HTMLElement) {
  initWorker()

  container.innerHTML = `
    <div class="panel-header">📊 数据源</div>
    
    <div class="file-upload" id="fileUpload">
      <div class="file-upload-icon">📁</div>
      <div class="file-upload-text">点击或拖拽上传 CSV/JSON</div>
    </div>
    
    <div class="btn-group">
      <button class="btn btn-secondary" id="addRowBtn">+ 添加行</button>
      <button class="btn btn-secondary" id="genScatterBtn">生成散点数据</button>
    </div>
    
    <div class="section-divider"></div>
    
    <div class="form-group">
      <label class="form-label">X 轴字段</label>
      <select class="form-select" id="xFieldSelect"></select>
    </div>
    <div class="form-group">
      <label class="form-label">Y 轴字段</label>
      <select class="form-select" id="yFieldSelect"></select>
    </div>
    
    <div class="section-divider"></div>
    
    <div id="dataTableContainer"></div>
  `

  bindEvents()
  renderTable()
}

function bindEvents() {
  const fileUpload = document.getElementById('fileUpload')
  const addRowBtn = document.getElementById('addRowBtn')
  const genScatterBtn = document.getElementById('genScatterBtn')
  const xFieldSelect = document.getElementById('xFieldSelect') as HTMLSelectElement
  const yFieldSelect = document.getElementById('yFieldSelect') as HTMLSelectElement

  // 使用 replaceWith 避免重复绑定
  const newUpload = fileUpload?.cloneNode(true)
  fileUpload?.parentNode?.replaceChild(newUpload!, fileUpload)
  
  newUpload?.addEventListener('click', () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv,.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) processFile(file)
    }
    input.click()
  })

  const newAddBtn = addRowBtn?.cloneNode(true)
  addRowBtn?.parentNode?.replaceChild(newAddBtn!, addRowBtn)
  newAddBtn?.addEventListener('click', addRow)

  const newGenBtn = genScatterBtn?.cloneNode(true)
  genScatterBtn?.parentNode?.replaceChild(newGenBtn!, genScatterBtn)
  newGenBtn?.addEventListener('click', () => {
    dataWorker?.postMessage({ type: 'GENERATE_SCATTER_DATA', data: 1000 })
  })

  const newXSelect = xFieldSelect?.cloneNode(true)
  xFieldSelect?.parentNode?.replaceChild(newXSelect!, xFieldSelect)
  newXSelect?.addEventListener('change', (e) => {
    state.set({ xField: (e.target as HTMLSelectElement).value })
    updateChartData()
  })

  const newYSelect = yFieldSelect?.cloneNode(true)
  yFieldSelect?.parentNode?.replaceChild(newYSelect!, yFieldSelect)
  newYSelect?.addEventListener('change', (e) => {
    state.set({ yField: (e.target as HTMLSelectElement).value })
    updateChartData()
  })
}

function processFile(file: File) {
  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    if (file.name.endsWith('.csv')) {
      dataWorker?.postMessage({ type: 'PARSE_CSV', data: content })
    } else if (file.name.endsWith('.json')) {
      try {
        const json = JSON.parse(content)
      } catch (err) {
        console.error('JSON parse error')
      }
    }
  }
  reader.readAsText(file)
}

function addRow() {
  const currentState = state.get()
  if (currentState.rawData) {
    const newRow: Record<string, any> = {}
    currentState.rawData.headers.forEach(h => newRow[h] = '')
    state.set({
      rawData: {
        ...currentState.rawData,
        rows: [...currentState.rawData.rows, newRow]
      }
    })
    renderTable()
  } else {
    const datasets = currentState.data.datasets
    if (datasets[0]) {
      datasets[0].data.push({ label: `类别 ${datasets[0].data.length + 1}`, value: 50 })
      state.set({ data: { ...currentState.data, datasets } })
      renderTable()
    }
  }
}

function renderTable() {
  const container = document.getElementById('dataTableContainer')
  if (!container) return

  const currentState = state.get()
  
  if (currentState.rawData) {
    const { headers, rows } = currentState.rawData
    
    const xSelect = document.getElementById('xFieldSelect') as HTMLSelectElement
    const ySelect = document.getElementById('yFieldSelect') as HTMLSelectElement
    
    if (xSelect) {
      xSelect.innerHTML = headers.map(h => `<option value="${h}" ${h === currentState.xField ? 'selected' : ''}>${h}</option>`).join('')
    }
    if (ySelect) {
      ySelect.innerHTML = headers.map(h => `<option value="${h}" ${h === currentState.yField ? 'selected' : ''}>${h}</option>`).join('')
    }

    container.innerHTML = `
      <table class="data-table">
        <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>
          ${rows.map((row, idx) => `
            <tr>${headers.map(h => `<td><input type="text" data-row="${idx}" data-col="${h}" value="${row[h]}" /></td>`).join('')}</tr>
          `).join('')}
        </tbody>
      </table>
    `

    container.querySelectorAll('input').forEach(input => {
      input.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement
        const rowIdx = parseInt(target.dataset.row || '0')
        const col = target.dataset.col || ''
        const rawData = state.get().rawData
        if (rawData) {
          rawData.rows[rowIdx][col] = target.value
          state.set({ rawData: { ...rawData } })
          updateChartData()
        }
      })
    })
  } else {
    const data = currentState.data.datasets[0]?.data || []
    container.innerHTML = `
      <table class="data-table">
        <thead><tr><th>标签</th><th>数值</th></tr></thead>
        <tbody>
          ${data.map((item, idx) => `
            <tr>
              <td><input type="text" data-idx="${idx}" data-field="label" value="${item.label}" /></td>
              <td><input type="number" data-idx="${idx}" data-field="value" value="${item.value}" /></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `

    container.querySelectorAll('input').forEach(input => {
      input.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement
        const idx = parseInt(target.dataset.idx || '0')
        const field = target.dataset.field as 'label' | 'value'
        const datasets = state.get().data.datasets
        if (datasets[0]) {
          datasets[0].data[idx][field] = field === 'value' ? parseFloat(target.value) : target.value
          state.set({ data: { datasets } })
        }
      })
    })
  }
}

function updateChartData() {
  const currentState = state.get()
  if (!currentState.rawData) return

  const { rows } = currentState.rawData
  const { xField, yField } = currentState

  const chartData = rows.map(row => ({
    label: String(row[xField]),
    value: parseFloat(row[yField]) || 0
  }))

  state.set({
    data: {
      datasets: [{
        name: '数据系列',
        data: chartData
      }]
    }
  })
}
