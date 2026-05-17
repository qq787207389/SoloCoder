import React from 'react'
import clsx from 'clsx'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  width,
  height,
}) => {
  const baseStyles = 'animate-pulse bg-gray-200 dark:bg-gray-700'

  const variantStyles = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  }

  return (
    <div
      className={clsx(baseStyles, variantStyles[variant], className)}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  )
}

interface QuestionCardSkeletonProps {
  count?: number
}

export const QuestionCardSkeleton: React.FC<QuestionCardSkeletonProps> = ({ count = 5 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton variant="text" width={40} />
                <Skeleton variant="text" width={80} />
              </div>
              <Skeleton variant="text" width="60%" className="mb-2" />
              <div className="flex gap-2 mt-3">
                <Skeleton variant="text" width={60} />
                <Skeleton variant="text" width={60} />
              </div>
            </div>
            <Skeleton variant="text" width={80} />
          </div>
        </div>
      ))}
    </>
  )
}
