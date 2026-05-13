const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.upsert({
    where: { id: 'user_0' },
    update: {},
    create: {
      id: 'user_0',
      name: 'Demo User',
    },
  })

  const post = await prisma.post.upsert({
    where: { id: 'post_0' },
    update: {},
    create: {
      id: 'post_0',
      title: '欢迎来到 Zan!',
      content: '这是一个带乐观更新的点赞功能演示。',
      authorId: user.id,
    },
  })

  console.log({ user, post })
}

main()
  .catch(async (e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
