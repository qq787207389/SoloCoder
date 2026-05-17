import React from 'react'
import { Tag } from './ui/Tag'
import { useTags } from '@/hooks/useQuestions'
import { Skeleton } from './ui/Skeleton'

interface QuestionFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  difficulty: string
  onDifficultyChange: (value: string) => void
  type: string
  onTypeChange: (value: string) => void
  selectedTags: string[]
  onTagToggle: (tag: string) => void
  sort: string
  onSortChange: (value: string) => void
}

export const QuestionFilters: React.FC<QuestionFiltersProps> = ({
  search,
  onSearchChange,
  difficulty,
  onDifficultyChange,
  type,
  onTypeChange,
  selectedTags,
  onTagToggle,
  sort,
  onSortChange,
}) => {
  const { data: tagsData, isLoading } = useTags()
  const tags = tagsData?.data || []

  const difficulties = [
    { value: '', label: '全部难度' },
    { value: 'easy', label: '简单' },
    { value: 'medium', label: '中等' },
    { value: 'hard', label: '困难' },
  ]

  const types = [
    { value: '', label: '全部题型' },
    { value: 'single', label: '单选题' },
    { value: 'multiple', label: '多选题' },
    { value: 'fill', label: '填空题' },
    { value: 'coding', label: '编程题' },
  ]

  const sortOptions = [
    { value: 'number', label: '题号' },
    { value: 'difficulty', label: '难度' },
    { value: 'passRate', label: '通过率' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          搜索
        </label>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="搜索题目..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          难度
        </label>
        <select
          value={difficulty}
          onChange={(e) => onDifficultyChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        >
          {difficulties.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          题型
        </label>
        <select
          value={type}
          onChange={(e) => onTypeChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        >
          {types.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          排序
        </label>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        >
          {sortOptions.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          标签
        </label>
        {isLoading ? (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} variant="text" width={60} height={24} />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagToggle(tag)}
                className="transition-all duration-200"
              >
                <Tag
                  variant={selectedTags.includes(tag) ? 'primary' : 'default'}
                  size="sm"
                >
                  {tag}
                </Tag>
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => {
          onSearchChange('')
          onDifficultyChange('')
          onTypeChange('')
          onSortChange('number')
        }}
        className="w-full py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
      >
        重置筛选
      </button>
    </div>
  )
}
