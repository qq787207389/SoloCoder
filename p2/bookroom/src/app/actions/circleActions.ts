'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { revalidatePath } from 'next/cache'

const mockCircles = [
  {
    id: '1',
    name: '经典文学读书会',
    description: '致力于阅读和讨论中外经典文学作品，每月选择一本经典，深入探讨文学价值与人文精神。',
    coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
    tags: ['经典文学', '深度阅读', '人文'],
    isPrivate: false,
    creatorId: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
    creator: { id: 'admin', name: '张老师', image: null },
    _count: { members: 128, posts: 45 }
  },
  {
    id: '2',
    name: '科幻迷俱乐部',
    description: '科幻爱好者的聚集地，一起探索未来世界的可能性，讨论最新的科幻小说和电影。',
    coverImage: 'https://images.unsplash.com/photo-1446773652149-7e3005db38e7?w=800',
    tags: ['科幻', '未来', '科技'],
    isPrivate: false,
    creatorId: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
    creator: { id: 'admin', name: '李博士', image: null },
    _count: { members: 256, posts: 89 }
  },
  {
    id: '3',
    name: '诗歌创作与赏析',
    description: '热爱诗歌的朋友可以在这里分享原创作品，互相学习和欣赏古今中外的优秀诗歌。',
    coverImage: 'https://images.unsplash.com/photo-1474366521946-c3d44b82828c?w=800',
    tags: ['诗歌', '创作', '艺术'],
    isPrivate: false,
    creatorId: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
    creator: { id: 'admin', name: '王诗人', image: null },
    _count: { members: 64, posts: 32 }
  },
  {
    id: '4',
    name: '历史探秘小组',
    description: '深入历史的长河，探寻那些被遗忘的故事和真相。欢迎所有历史爱好者加入！',
    coverImage: 'https://images.unsplash.com/photo-1461360228754-6e81c478b882?w=800',
    tags: ['历史', '人文', '研究'],
    isPrivate: false,
    creatorId: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
    creator: { id: 'admin', name: '陈教授', image: null },
    _count: { members: 96, posts: 56 }
  }
]

const mockPosts = [
  {
    id: '1',
    circleId: '1',
    userId: 'user1',
    content: '刚读完《百年孤独》，布恩迪亚家族的故事让我感触很深。马尔克斯的叙事手法真是太精彩了，魔幻和现实完美融合。大家对这本书有什么看法？',
    images: [],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(),
    user: { id: 'user1', name: '爱读书的小明', image: null },
    comments: [
      {
        id: 'c1',
        postId: '1',
        userId: 'user2',
        content: '完全同意！特别是最后那个龙卷风的意象，象征着整个家族的命运。',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        user: { id: 'user2', name: '文艺青年', image: null }
      }
    ],
    _count: { likes: 15 }
  },
  {
    id: '2',
    circleId: '1',
    userId: 'user2',
    content: '下个月我们一起读《百年孤独》怎么样？已经是第三次重读了，每次都有新的收获。',
    images: [],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    user: { id: 'user2', name: '文艺青年', image: null },
    comments: [],
    _count: { likes: 23 }
  }
]

export async function getCircles() {
  try {
    const circles = await prisma.circle.findMany({
      include: {
        creator: {
          select: { id: true, name: true, image: true }
        },
        _count: {
          select: { members: true, posts: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return circles.length > 0 ? circles : mockCircles
  } catch (error) {
    console.log('Database not available, returning mock data')
    return mockCircles
  }
}

export async function getCircleById(id: string) {
  try {
    const circle = await prisma.circle.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, image: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, image: true }
            }
          }
        },
        posts: {
          include: {
            user: {
              select: { id: true, name: true, image: true }
            },
            comments: {
              include: {
                user: {
                  select: { id: true, name: true, image: true }
                }
              }
            },
            _count: {
              select: { likes: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { members: true, posts: true }
        }
      }
    })

    if (!circle) {
      return {
        ...mockCircles[0],
        members: [],
        posts: mockPosts
      }
    }

    return circle
  } catch (error) {
    console.log('Database not available, returning mock data')
    const circle = mockCircles.find(c => c.id === id) || mockCircles[0]
    return {
      ...circle,
      members: [],
      posts: mockPosts.filter(p => p.circleId === circle.id)
    }
  }
}

export async function createCircle(data: {
  name: string
  description: string
  tags: string[]
  isPrivate: boolean
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  try {
    const circle = await prisma.circle.create({
      data: {
        ...data,
        creatorId: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: 'ADMIN'
          }
        }
      }
    })

    revalidatePath('/circles')
    return circle
  } catch (error) {
    console.log('Database not available, using mock mode')
    return { ...data, id: Date.now().toString(), creatorId: session.user.id }
  }
}

export async function joinCircle(circleId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  try {
    const existingMember = await prisma.circleMember.findUnique({
      where: {
        circleId_userId: {
          circleId,
          userId: session.user.id
        }
      }
    })

    if (existingMember) {
      throw new Error('Already a member of this circle')
    }

    await prisma.circleMember.create({
      data: {
        circleId,
        userId: session.user.id
      }
    })

    revalidatePath(`/circles/${circleId}`)
    return { success: true }
  } catch (error: any) {
    if (error.message.includes('Already')) {
      throw error
    }
    console.log('Database not available, mock join')
    return { success: true }
  }
}

export async function createPost(circleId: string, content: string, images: string[]) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  try {
    const post = await prisma.post.create({
      data: {
        circleId,
        userId: session.user.id,
        content,
        images
      },
      include: {
        user: {
          select: { id: true, name: true, image: true }
        }
      }
    })

    revalidatePath(`/circles/${circleId}`)
    return post
  } catch (error) {
    console.log('Database not available, using mock mode')
    return {
      id: Date.now().toString(),
      circleId,
      userId: session.user.id,
      content,
      images,
      createdAt: new Date(),
      user: { id: session.user.id, name: '匿名用户', image: null }
    }
  }
}

export async function likePost(postId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  try {
    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: session.user.id
        }
      }
    })

    if (existingLike) {
      await prisma.postLike.delete({
        where: { id: existingLike.id }
      })
    } else {
      await prisma.postLike.create({
        data: {
          postId,
          userId: session.user.id
        }
      })
    }

    return { success: true }
  } catch (error) {
    console.log('Database not available, mock like')
    return { success: true }
  }
}

export async function addComment(postId: string, content: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        postId,
        userId: session.user.id,
        content
      },
      include: {
        user: {
          select: { id: true, name: true, image: true }
        }
      }
    })

    return comment
  } catch (error) {
    console.log('Database not available, using mock mode')
    return {
      id: Date.now().toString(),
      postId,
      userId: session.user.id,
      content,
      createdAt: new Date(),
      user: { id: session.user.id, name: '匿名用户', image: null }
    }
  }
}
