import { z } from 'zod'
import { router, publicProcedure } from '../trpc'

export const postRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string(), userId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.id },
        include: {
          author: true,
          _count: {
            select: { likes: true },
          },
        },
      })

      if (!post) {
        throw new Error('Post not found')
      }

      let hasLiked = false
      if (input.userId) {
        const like = await ctx.prisma.like.findUnique({
          where: {
            userId_postId: {
              userId: input.userId,
              postId: input.id,
            },
          },
        })
        hasLiked = !!like
      }

      return {
        ...post,
        hasLiked,
        likeCount: post._count.likes,
      }
    }),
})
