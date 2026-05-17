import React from 'react'
import clsx from 'clsx'

interface TagProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md'
  className?: string
  onRemove?: () => void
}

export const Tag: React.FC<TagProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  onRemove,
}) => {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    primary: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    success: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  }

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  )
}

interface DifficultyBadgeProps {
  difficulty: 'easy' | 'medium' | 'hard'
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ difficulty }) => {
  const config = {
    easy: { label: '简单', variant: 'success' as const },
    medium: { label: '中等', variant: 'warning' as const },
    hard: { label: '困难', variant: 'danger' as const },
  }

  return <Tag variant={config[difficulty].variant}>{config[difficulty].label}</Tag>
}

interface QuestionTypeBadgeProps {
  type: 'single' | 'multiple' | 'fill' | 'coding'
}

export const QuestionTypeBadge: React.FC<QuestionTypeBadgeProps> = ({ type }) => {
  const config = {
    single: { label: '单选', variant: 'primary' as const },
    multiple: { label: '多选', variant: 'warning' as const },
    fill: { label: '填空', variant: 'success' as const },
    coding: { label: '编程', variant: 'default' as const },
  }

  return <Tag variant={config[type].variant}>{config[type].label}</Tag>
}
