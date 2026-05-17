import React from 'react'
import { Link } from 'react-router-dom'
import { DifficultyBadge, QuestionTypeBadge, Tag } from './ui/Tag'
import type { Question } from '@/types'

interface QuestionCardProps {
  question: Question
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  return (
    <Link
      to={`/question/${question.id}`}
      className="block p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
              #{question.number}
            </span>
            <DifficultyBadge difficulty={question.difficulty} />
            <QuestionTypeBadge type={question.type} />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 truncate">
            {question.title}
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {question.description}
          </p>
          
          <div className="flex flex-wrap gap-2">
            {question.tags.slice(0, 3).map((tag) => (
              <Tag key={tag} variant="primary" size="sm">
                {tag}
              </Tag>
            ))}
            {question.tags.length > 3 && (
              <Tag size="sm">+{question.tags.length - 3}</Tag>
            )}
          </div>
        </div>
        
        <div className="ml-4 text-right flex-shrink-0">
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-1">
            <span>✅</span>
            <span>{question.passRate}%</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <span>⭐</span>
            <span>{question.favorites}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
