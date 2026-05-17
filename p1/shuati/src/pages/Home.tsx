import React, { useState } from 'react'
import { useQuestions } from '@/hooks/useQuestions'
import { QuestionCard } from '@/components/QuestionCard'
import { QuestionFilters } from '@/components/QuestionFilters'
import { QuestionCardSkeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'

export const Home: React.FC = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [type, setType] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sort, setSort] = useState('number')

  const { data, isLoading, isError } = useQuestions({
    page,
    limit: 10,
    search,
    difficulty,
    type,
    tags: selectedTags,
    sort,
  })

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
    setPage(1)
  }

  const questions = data?.data || []
  const pagination = data?.pagination

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-72 flex-shrink-0">
            <div className="sticky top-24">
              <QuestionFilters
                search={search}
                onSearchChange={(value) => {
                  setSearch(value)
                  setPage(1)
                }}
                difficulty={difficulty}
                onDifficultyChange={(value) => {
                  setDifficulty(value)
                  setPage(1)
                }}
                type={type}
                onTypeChange={(value) => {
                  setType(value)
                  setPage(1)
                }}
                selectedTags={selectedTags}
                onTagToggle={handleTagToggle}
                sort={sort}
                onSortChange={setSort}
              />
            </div>
          </aside>

          <main className="flex-1">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                题库
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                共 {pagination?.total || 0} 道题目
              </p>
            </div>

            {isError && (
              <div className="text-center py-12">
                <p className="text-red-500 mb-4">加载失败，请稍后重试</p>
                <Button onClick={() => window.location.reload()}>重试</Button>
              </div>
            )}

            {isLoading ? (
              <div className="space-y-4">
                <QuestionCardSkeleton count={5} />
              </div>
            ) : (
              <>
                {questions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="text-gray-500 dark:text-gray-400">
                      没有找到匹配的题目
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questions.map((question) => (
                      <QuestionCard key={question.id} question={question} />
                    ))}
                  </div>
                )}

                {pagination && pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                    >
                      上一页
                    </Button>
                    
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      第 {page} / {pagination.totalPages} 页
                    </span>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={page === pagination.totalPages}
                      onClick={() => setPage(p => p + 1)}
                    >
                      下一页
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
