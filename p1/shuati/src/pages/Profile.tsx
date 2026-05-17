import React, { useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/Button'
import { Tag } from '@/components/ui/Tag'

export const Profile: React.FC = () => {
  const user = useStore(state => state.user)
  const submissions = useStore(state => state.submissions)
  const wrongQuestions = useStore(state => state.wrongQuestions)
  const dailyCompleted = useStore(state => state.dailyCompleted)
  const lastCompletedDate = useStore(state => state.lastCompletedDate)
  const checkDailyReset = useStore(state => state.checkDailyReset)
  const removeWrongQuestion = useStore(state => state.removeWrongQuestion)

  useEffect(() => {
    checkDailyReset()
  }, [checkDailyReset])

  const acceptedCount = submissions.filter(s => s.status === 'accepted').length
  const wrongCount = submissions.filter(s => s.status === 'wrong').length
  const today = new Date().toDateString()
  const isDailyGoalMet = dailyCompleted >= 3

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <img
              src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
              alt={user?.username || '用户'}
              className="w-24 h-24 rounded-full border-4 border-blue-500"
            />
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {user?.username || '用户'}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <Tag variant="primary">等级 {user?.level || 1}</Tag>
                <Tag variant="success">🔥 {user?.streak || 0} 天连续</Tag>
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-500">{dailyCompleted}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">今日已完成</div>
            </div>
          </div>

          {isDailyGoalMet && (
            <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-lg text-center">
              <span className="text-2xl mr-2">🎉</span>
              <span className="font-semibold text-green-700 dark:text-green-300">
                恭喜！今日目标已完成！
              </span>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-blue-500 mb-2">{submissions.length}</div>
            <div className="text-gray-600 dark:text-gray-400">总提交数</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-green-500 mb-2">{acceptedCount}</div>
            <div className="text-gray-600 dark:text-gray-400">通过数</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-red-500 mb-2">{wrongQuestions.length}</div>
            <div className="text-gray-600 dark:text-gray-400">错题数</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              📝 提交记录
            </h2>
            {submissions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                暂无提交记录
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {submissions.slice(0, 10).map(submission => (
                  <div
                    key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {submission.questionTitle}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(submission.submittedAt)}
                      </div>
                    </div>
                    <Tag
                      variant={submission.status === 'accepted' ? 'success' : 'danger'}
                      size="sm"
                    >
                      {submission.status === 'accepted' ? '通过' : '未通过'}
                    </Tag>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              ❌ 错题本
            </h2>
            {wrongQuestions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                太棒了，没有错题！
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {wrongQuestions.map(questionId => (
                  <div
                    key={questionId}
                    className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
                  >
                    <span className="text-gray-900 dark:text-gray-100">
                      题目 ID: {questionId}
                    </span>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeWrongQuestion(questionId)}
                    >
                      移除
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            📊 统计概览
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
              <div className="text-2xl mb-1">📝</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">单选</div>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
              <div className="text-2xl mb-1">✅</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">多选</div>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
              <div className="text-2xl mb-1">✏️</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">填空</div>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
              <div className="text-2xl mb-1">💻</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">编程</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
