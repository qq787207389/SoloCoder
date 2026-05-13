'use client'

import { useState } from 'react'
import { api } from '@/src/trpc/react'

interface LikeButtonProps {
  postId: string
  userId: string
  initialLiked: boolean
  initialCount: number
}

export default function LikeButton({
  postId,
  userId,
  initialLiked,
  initialCount,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [isPending, setIsPending] = useState(false)

  const { mutate: toggleLike } = api.like.toggleLike.useMutation()

  const handleClick = () => {
    const previousLiked = liked
    const previousCount = count

    setLiked(!liked)
    setCount(liked ? count - 1 : count + 1)
    setIsPending(true)

    toggleLike(
      { postId, userId },
      {
        onError: () => {
          setLiked(previousLiked)
          setCount(previousCount)
        },
        onSettled: () => {
          setIsPending(false)
        },
      }
    )
  }

  const buttonClass = `like-button ${liked ? 'like-button-liked' : 'like-button-not-liked'}`

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={buttonClass}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="like-svg"
        viewBox="0 0 24 24"
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
      <span className="like-count">{count}</span>
      <span className="like-text">{liked ? '已点赞' : '点赞'}</span>
    </button>
  )
}
