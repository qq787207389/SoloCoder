import { router } from '../trpc'
import { likeRouter } from './like'
import { postRouter } from './post'

export const appRouter = router({
  like: likeRouter,
  post: postRouter,
})

export type AppRouter = typeof appRouter
