self.onmessage = (e) => {
  const { type, data } = e.data

  switch (type) {
    case 'PARSE_CSV':
      parseCSV(data)
      break
    case 'AGGREGATE_DATA':
      aggregateData(data)
      break
    case 'GENERATE_SCATTER_DATA':
      generateScatterData(data)
      break
  }
}

function parseCSV(csvContent: string): void {
  try {
    const lines = csvContent.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.trim())
    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim())
      const obj: Record<string, string | number> = {}
      headers.forEach((header, i) => {
        const value = values[i]
        const num = parseFloat(value)
        obj[header] = isNaN(num) ? value : num
      })
      return obj
    })

    self.postMessage({
      type: 'PARSE_CSV_SUCCESS',
      data: { headers, rows }
    })
  } catch (error) {
    self.postMessage({
      type: 'PARSE_CSV_ERROR',
      error: (error as Error).message
    })
  }
}

function aggregateData(data: { rows: any[]; xField: string; yField: string }): void {
  try {
    const { rows, xField, yField } = data
    const aggregated: Record<string, number> = {}

    rows.forEach(row => {
      const x = String(row[xField])
      const y = parseFloat(row[yField]) || 0
      aggregated[x] = (aggregated[x] || 0) + y
    })

    const result = Object.entries(aggregated).map(([label, value]) => ({ label, value }))

    self.postMessage({
      type: 'AGGREGATE_DATA_SUCCESS',
      data: result
    })
  } catch (error) {
    self.postMessage({
      type: 'AGGREGATE_DATA_ERROR',
      error: (error as Error).message
    })
  }
}

function generateScatterData(count: number): void {
  try {
    const data = []
    for (let i = 0; i < count; i++) {
      data.push({
        label: `Point ${i + 1}`,
        value: Math.random() * 100,
        x: Math.random() * 100,
        y: Math.random() * 100
      })
    }

    self.postMessage({
      type: 'GENERATE_SCATTER_DATA_SUCCESS',
      data
    })
  } catch (error) {
    self.postMessage({
      type: 'GENERATE_SCATTER_DATA_ERROR',
      error: (error as Error).message
    })
  }
}

export {}
