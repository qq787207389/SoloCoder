import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuestion } from '@/hooks/useQuestions'
import { CodeEditor } from '@/components/CodeEditor'
import { DifficultyBadge, QuestionTypeBadge, Tag } from '@/components/ui/Tag'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { executeCode } from '@/utils/codeExecutor'
import { useStore } from '@/store/useStore'
import type { TestResult } from '@/types'

export const QuestionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, isError } = useQuestion(id)
  const addSubmission = useStore(state => state.addSubmission)
  const addWrongQuestion = useStore(state => state.addWrongQuestion)
  const incrementDailyCompleted = useStore(state => state.incrementDailyCompleted)

  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([])
  const [fillAnswer, setFillAnswer] = useState('')
  const [code, setCode] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])

  const question = data?.data

  useEffect(() => {
    if (question?.codeTemplate) {
      setCode(question.codeTemplate)
    }
  }, [question])

  const handleSingleChoice = (option: string) => {
    setSelectedAnswers([option])
    setShowResult(false)
  }

  const handleMultipleChoice = (option: string) => {
    setSelectedAnswers(prev =>
      prev.includes(option)
        ? prev.filter(o => o !== option)
        : [...prev, option]
    )
    setShowResult(false)
  }

  const checkAnswer = () => {
    if (!question) return

    let correct = false

    if (question.type === 'single') {
      correct = selectedAnswers[0] === question.answer
    } else if (question.type === 'multiple') {
      const answerArray = Array.isArray(question.answer) ? question.answer : [question.answer]
      correct =
        selectedAnswers.length === answerArray.length &&
        selectedAnswers.every(a => answerArray.includes(a))
    } else if (question.type === 'fill') {
      correct = fillAnswer.trim() === question.answer
    }

    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      incrementDailyCompleted()
    } else {
      addWrongQuestion(question.id)
    }

    addSubmission({
      id: Date.now().toString(),
      questionId: question.id,
      questionTitle: question.title,
      status: correct ? 'accepted' : 'wrong',
      submittedAt: new Date().toISOString(),
    })
  }

  const runCode = async () => {
    if (!question?.testCases) return

    setIsRunning(true)
    setShowResult(false)

    try {
      const results = await executeCode(code, question.testCases)
      setTestResults(results)
      
      const allPassed = results.every(r => r.passed)
      setIsCorrect(allPassed)
      setShowResult(true)

      if (allPassed) {
        incrementDailyCompleted()
      } else {
        addWrongQuestion(question.id)
      }

      addSubmission({
        id: Date.now().toString(),
        questionId: question.id,
        questionTitle: question.title,
        status: allPassed ? 'accepted' : 'wrong',
        code,
        runtime: 0,
        memory: 0,
        submittedAt: new Date().toISOString(),
        testResults: results,
      })
    } catch (error) {
      console.error('代码执行失败:', error)
    } finally {
      setIsRunning(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <Skeleton variant="text" width="40%" height={32} className="mb-4" />
          <Skeleton variant="text" width="20%" className="mb-6" />
          <Skeleton variant="rectangular" height={200} className="mb-6" />
          <Skeleton variant="rectangular" height={300} />
        </div>
      </div>
    )
  }

  if (isError || !question) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            题目不存在
          </h2>
          <Button onClick={() => navigate('/')}>返回题库</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 mb-6 transition-colors"
        >
          <span>←</span>
          <span>返回题库</span>
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                  #{question.number}
                </span>
                <DifficultyBadge difficulty={question.difficulty} />
                <QuestionTypeBadge type={question.type} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                {question.title}
              </h1>
              <div className="flex flex-wrap gap-2">
                {question.tags.map(tag => (
                  <Tag key={tag} variant="primary" size="sm">
                    {tag}
                  </Tag>
                ))}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-1">
                <span>✅</span>
                <span>通过率 {question.passRate}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                题目描述
              </h2>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                  {question.description}
                </div>
              </div>

              {question.testCases && question.type === 'coding' && (
                <div className="mt-6">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    测试用例
                  </h3>
                  <div className="space-y-3">
                    {question.testCases.map((tc, index) => (
                      <div
                        key={tc.id}
                        className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
                      >
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          用例 {index + 1}
                        </div>
                        <div className="font-mono text-sm">
                          输入: <span className="text-blue-600 dark:text-blue-400">{tc.input}</span>
                        </div>
                        <div className="font-mono text-sm">
                          预期: <span className="text-green-600 dark:text-green-400">{tc.expected}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showResult && question.explanation && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="text-md font-semibold text-blue-700 dark:text-blue-300 mb-2">
                    💡 解析
                  </h3>
                  <p className="text-blue-600 dark:text-blue-400">{question.explanation}</p>
                </div>
              )}
            </div>

            {showResult && (
              <div
                className={`p-6 rounded-xl ${
                  isCorrect
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{isCorrect ? '🎉' : '❌'}</span>
                  <div>
                    <h3
                      className={`text-xl font-bold ${
                        isCorrect
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-red-700 dark:text-red-300'
                      }`}
                    >
                      {isCorrect ? '回答正确！' : '回答错误'}
                    </h3>
                    <p
                      className={
                        isCorrect
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }
                    >
                      {isCorrect ? '太棒了，继续加油！' : '别灰心，再试一次吧！'}
                    </p>
                  </div>
                </div>

                {testResults.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {testResults.map((result, index) => (
                      <div
                        key={result.testCaseId}
                        className={`p-3 rounded-lg ${
                          result.passed
                            ? 'bg-green-100 dark:bg-green-800/30'
                            : 'bg-red-100 dark:bg-red-800/30'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span>{result.passed ? '✅' : '❌'}</span>
                          <span className="font-medium">用例 {index + 1}</span>
                        </div>
                        {!result.passed && (
                          <div className="text-sm space-y-1 ml-6">
                            <div>预期: {result.expected}</div>
                            <div>实际: {result.actual || result.error}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                作答
              </h2>

              {(question.type === 'single' || question.type === 'multiple') &&
                question.options && (
                  <div className="space-y-3">
                    {question.options.map((option, index) => {
                      const isSelected = selectedAnswers.includes(option)
                      const letter = String.fromCharCode(65 + index)

                      return (
                        <button
                          key={option}
                          onClick={() =>
                            question.type === 'single'
                              ? handleSingleChoice(option)
                              : handleMultipleChoice(option)
                          }
                          disabled={showResult}
                          className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                          } ${showResult && option === question.answer ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''} ${showResult && isSelected && option !== question.answer ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                                isSelected
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                              }`}
                            >
                              {letter}
                            </span>
                            <span className="text-gray-900 dark:text-gray-100">{option}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}

              {question.type === 'fill' && (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={fillAnswer}
                    onChange={e => setFillAnswer(e.target.value)}
                    placeholder="请输入答案..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    disabled={showResult}
                  />
                  {showResult && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      正确答案: <span className="font-mono text-green-600 dark:text-green-400">{question.answer}</span>
                    </div>
                  )}
                </div>
              )}

              {question.type === 'coding' && (
                <div className="space-y-4">
                  <CodeEditor
                    code={code}
                    onChange={setCode}
                    language="javascript"
                    height="400px"
                  />
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <Button
                  onClick={question.type === 'coding' ? runCode : checkAnswer}
                  loading={isRunning}
                  disabled={
                    (question.type !== 'coding' && !selectedAnswers.length && !fillAnswer.trim())
                  }
                  fullWidth
                >
                  {question.type === 'coding' ? '运行代码' : '提交答案'}
                </Button>
                {showResult && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowResult(false)
                      setSelectedAnswers([])
                      setFillAnswer('')
                      setTestResults([])
                    }}
                    fullWidth
                  >
                    重新作答
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
