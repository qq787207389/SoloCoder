import Link from 'next/link'

export default function Home() {
  return (
    <main className="home-main">
      <h1 className="home-title">
        欢迎来到 Zan!
      </h1>
      <p className="home-description">
        这是一个带乐观更新的点赞功能演示。点击下方按钮查看帖子详情。
      </p>
      <Link
        href="/posts/post_0"
        className="home-link"
      >
        查看演示帖子
      </Link>
    </main>
  )
}
