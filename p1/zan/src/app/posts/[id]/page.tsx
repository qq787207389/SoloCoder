import { apiServer } from '@/src/trpc/server'
import PostDetail from '@/src/components/PostDetail'

interface PageProps {
  params: { id: string }
}

export default async function PostPage({ params }: PageProps) {
  const DEMO_USER_ID = 'user_0'

  const post = await (await apiServer()).post.getById({
    id: params.id,
    userId: DEMO_USER_ID,
  })

  return (
    <main className="post-page-main">
      <PostDetail post={post} userId={DEMO_USER_ID} />
    </main>
  )
}
