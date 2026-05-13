import { z } from 'zod'
import { router, publicProcedure } from '../trpc'

export const likeRouter = router({
  toggleLike: publicProcedure
    .input(z.object({ postId: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { postId, userId } = input

      const existingLike = await ctx.prisma.like.findUnique({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      })

      if (existingLike) {
        await ctx.prisma.like.delete({
          where: { id: existingLike.id },
        })
        return { liked: false }
      } else {
        await ctx.prisma.like.create({
          data: {
            userId,
            postId,
          },
        })
        return { liked: true }
      }
    }),

  getLikeCount: publicProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ ctx, input }) => {
      const count = await ctx.prisma.like.count({
        where: { postId: input.postId },
      })
      return { count }
    }),

  hasLiked: publicProcedure
    .input(z.object({ postId: z.string(), userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const like = await ctx.prisma.like.findUnique({
        where: {
          userId_postId: {
            userId: input.userId,
            postId: input.postId,
          },
        },
      })
      return { liked: !!like }
    }),
})
