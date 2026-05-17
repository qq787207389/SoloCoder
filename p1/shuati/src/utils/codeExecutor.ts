import type { TestCase, TestResult } from '@/types'

const workerCode = `
  self.onmessage = function(e) {
    const { code, testCases } = e.data
    const results = []
    const TIMEOUT_MS = 5000
    
    try {
      const func = new Function('return ' + code)()
      
      if (typeof func !== 'function') {
        throw new Error('代码必须返回一个函数')
      }
      
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i]
        const startTime = performance.now()
        
        try {
          const input = JSON.parse(testCase.input)
          const args = Object.values(input)
          
          const resultPromise = Promise.resolve().then(() => func(...args))
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('执行超时')), TIMEOUT_MS)
          )
          
          Promise.race([resultPromise, timeoutPromise])
            .then(result => {
              const actual = JSON.stringify(result)
              const passed = actual === testCase.expected
              const endTime = performance.now()
              
              results.push({
                testCaseId: testCase.id,
                passed,
                input: testCase.input,
                expected: testCase.expected,
                actual,
                runtime: Math.round(endTime - startTime)
              })
              
              if (results.length === testCases.length) {
                self.postMessage({ type: 'complete', results })
              }
            })
            .catch(error => {
              results.push({
                testCaseId: testCase.id,
                passed: false,
                input: testCase.input,
                expected: testCase.expected,
                actual: '',
                error: error.message
              })
              
              if (results.length === testCases.length) {
                self.postMessage({ type: 'complete', results })
              }
            })
        } catch (error) {
          results.push({
            testCaseId: testCase.id,
            passed: false,
            input: testCase.input,
            expected: testCase.expected,
            actual: '',
            error: error.message
          })
          
          if (results.length === testCases.length) {
            self.postMessage({ type: 'complete', results })
          }
        }
      }
    } catch (error) {
      self.postMessage({ 
        type: 'error', 
        error: error.message 
      })
    }
  }
`

let worker: Worker | null = null

function getWorker(): Worker {
  if (!worker) {
    const blob = new Blob([workerCode], { type: 'application/javascript' })
    const workerUrl = URL.createObjectURL(blob)
    worker = new Worker(workerUrl)
  }
  return worker
}

export function executeCode(code: string, testCases: TestCase[]): Promise<TestResult[]> {
  return new Promise((resolve, reject) => {
    try {
      const worker = getWorker()
      
      worker.onmessage = (e) => {
        if (e.data.type === 'complete') {
          resolve(e.data.results)
        } else if (e.data.type === 'error') {
          reject(new Error(e.data.error))
        }
      }
      
      worker.onerror = (error) => {
        reject(new Error(error.message))
      }
      
      worker.postMessage({ code, testCases })
    } catch (error) {
      reject(error)
    }
  })
}

export function terminateWorker() {
  if (worker) {
    worker.terminate()
    worker = null
  }
}
