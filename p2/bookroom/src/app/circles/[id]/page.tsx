'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, MessageSquare, Heart, Send, Plus, Hash } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { getCircleById, joinCircle, createPost, likePost, addComment } from '@/app/actions/circleActions'

export default function CircleDetailPage() {
  const params = useParams()
  const [circle, setCircle] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [newPostContent, setNewPostContent] = useState('')
  const [posting, setPosting] = useState(false)
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})

  useEffect(() => {
    loadCircle()
  }, [params.id])

  const loadCircle = async () => {
    try {
      const data = await getCircleById(params.id as string)
      setCircle(data)
    } catch (error) {
      console.error('Failed to load circle:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async () => {
    try {
      await joinCircle(params.id as string)
      await loadCircle()
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPostContent.trim()) return

    setPosting(true)
    try {
      await createPost(params.id as string, newPostContent, [])
      setNewPostContent('')
      await loadCircle()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setPosting(false)
    }
  }

  const handleLike = async (postId: string) => {
    try {
      await likePost(postId)
      await loadCircle()
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleAddComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim()
    if (!content) return

    try {
      await addComment(postId, content)
      setCommentInputs({ ...commentInputs, [postId]: '' })
      await loadCircle()
    } catch (error: any) {
      alert(error.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600" />
      </div>
    )
  }

  if (!circle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">圈子不存在</h2>
          <Link href="/circles">
            <Button>返回圈子列表</Button>
          </Link>
        </div>
      </div>
    )
  }

  const isMember = true

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link href="/circles" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回圈子列表
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="h-48 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl mb-6 flex items-center justify-center">
          <h1 className="text-3xl font-bold text-white">{circle.name}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {isMember && (
              <Card>
                <CardContent className="p-6">
                  <form onSubmit={handleCreatePost}>
                    <textarea
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
                      rows={3}
                      placeholder="分享你的想法..."
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                    />
                    <div className="flex items-center justify-between mt-4">
                      <Button variant="ghost" size="sm" type="button">
                        <Plus className="w-4 h-4 mr-2" />
                        添加图片
                      </Button>
                      <Button type="submit" isLoading={posting}>
                        <Send className="w-4 h-4 mr-2" />
                        发布
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {circle.posts && circle.posts.length > 0 ? (
                circle.posts.map((post: any) => (
                  <Card key={post.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start mb-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{post.user?.name || '匿名用户'}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString('zh-CN')}
                          </p>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>

                      {post.images && post.images.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          {post.images.map((image: string, index: number) => (
                            <img
                              key={index}
                              src={image}
                              alt=""
                              className="rounded-lg aspect-square object-cover"
                            />
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-6 mb-4">
                        <button
                          onClick={() => handleLike(post.id)}
                          className="flex items-center text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <Heart className="w-5 h-5 mr-1" />
                          <span>{post._count?.likes || 0}</span>
                        </button>
                        <div className="flex items-center text-gray-500">
                          <MessageSquare className="w-5 h-5 mr-1" />
                          <span>{post.comments?.length || 0}</span>
                        </div>
                      </div>

                      {post.comments && post.comments.length > 0 && (
                        <div className="border-t border-gray-100 pt-4 space-y-3">
                          {post.comments.map((comment: any) => (
                            <div key={comment.id} className="flex items-start">
                              <div className="w-8 h-8 bg-gray-200 rounded-full mr-2 flex items-center justify-center flex-shrink-0">
                                <Users className="w-4 h-4 text-gray-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm">
                                  <span className="font-medium text-gray-900">{comment.user?.name || '匿名'}</span>
                                  <span className="text-gray-600 ml-2">{comment.content}</span>
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {isMember && (
                        <div className="border-t border-gray-100 pt-4 flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full mr-1 flex items-center justify-center flex-shrink-0">
                            <Users className="w-4 h-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            className="flex-1 px-3 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                            placeholder="写下你的评论..."
                            value={commentInputs[post.id] || ''}
                            onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleAddComment(post.id)
                              }
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddComment(post.id)}
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">暂无帖子，成为第一个发帖的人吧！</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">圈子简介</h3>
                  <p className="text-gray-600 text-sm mb-4">{circle.description}</p>
                  
                  {circle.tags && circle.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {circle.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 bg-accent-50 text-accent-700 rounded-full text-xs"
                        >
                          <Hash className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {!isMember ? (
                    <Button className="w-full" onClick={handleJoin}>
                      加入圈子
                    </Button>
                  ) : (
                    <div className="text-center text-sm text-gray-500">
                      你已是该圈子成员
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    成员 ({circle._count?.members || 0})
                  </h3>
                  <div className="space-y-3">
                    {circle.members && circle.members.slice(0, 5).map((member: any) => (
                      <div key={member.id} className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full mr-2 flex items-center justify-center">
                          <Users className="w-4 h-4 text-gray-400" />
                        </div>
                        <span className="text-sm text-gray-700">
                          {member.user?.name || '匿名'}
                        </span>
                      </div>
                    ))}
                    {(!circle.members || circle.members.length === 0) && (
                      <p className="text-sm text-gray-500 text-center">暂无成员</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
