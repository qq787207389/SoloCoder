import LikeButton from './LikeButton'

interface PostData {
  id: string
  title: string
  content: string
  createdAt: Date
  author: {
    name: string
  }
  likeCount: number
  hasLiked: boolean
}

interface PostDetailProps {
  post: PostData
  userId: string
}

export default function PostDetail({ post, userId }: PostDetailProps) {
  return (
    <article className="post-article">
      <h1 className="post-title">{post.title}</h1>
      
      <div className="post-meta">
        <span>By {post.author.name}</span>
        <span>•</span>
        <span>
          {new Date(post.createdAt).toLocaleDateString()}
        </span>
      </div>

      <p className="post-content">{post.content}</p>

      <div className="post-divider">
        <LikeButton
          postId={post.id}
          userId={userId}
          initialLiked={post.hasLiked}
          initialCount={post.likeCount}
        />
      </div>
    </article>
  )
}
