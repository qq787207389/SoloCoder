import Link from 'next/link'
import { Users, Plus, Hash } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getCircles } from '@/app/actions/circleActions'

export default async function CirclesPage() {
  const circles = await getCircles()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-accent-600 to-accent-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">读书社群</h1>
              <p className="text-accent-100">加入兴趣圈子，与志同道合的书友一起成长</p>
            </div>
            <Link href="/circles/create">
              <Button className="bg-white text-accent-700 hover:bg-gray-100">
                <Plus className="w-4 h-4 mr-2" />
                创建圈子
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {circles.map((circle: any) => (
            <Link key={circle.id} href={`/circles/${circle.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <div className="h-40 bg-gradient-to-br from-accent-500 to-accent-600 relative flex items-center justify-center">
                  {circle.coverImage ? (
                    <img
                      src={circle.coverImage}
                      alt={circle.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Users className="w-16 h-16 text-white/50" />
                  )}
                </div>
                <CardContent className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {circle.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {circle.description}
                  </p>
                  
                  {circle.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {circle.tags.slice(0, 3).map((tag: string) => (
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

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{circle._count.members} 成员</span>
                    <span>{circle._count.posts} 动态</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {circles.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无圈子</h3>
            <p className="text-gray-500 mb-4">还没有任何圈子，快来创建第一个吧！</p>
            <Link href="/circles/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                创建圈子
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}