import Link from 'next/link'
import { Calendar, MapPin, Users, Filter, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getActivities } from '@/app/actions/activityActions'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { ActivityCategory } from '@prisma/client'

const categoryLabels: Record<ActivityCategory, string> = {
  READING: '读书会',
  LECTURE: '讲座',
  WORKSHOP: '手作工坊',
  EXHIBITION: '展览',
  OTHER: '其他'
}

const categoryColors: Record<ActivityCategory, string> = {
  READING: 'bg-blue-100 text-blue-700',
  LECTURE: 'bg-purple-100 text-purple-700',
  WORKSHOP: 'bg-green-100 text-green-700',
  EXHIBITION: 'bg-orange-100 text-orange-700',
  OTHER: 'bg-gray-100 text-gray-700'
}

export default async function ActivitiesPage({
  searchParams
}: {
  searchParams: { category?: string; date?: string }
}) {
  const activities = await getActivities({
    category: searchParams.category as ActivityCategory | undefined,
    date: searchParams.date ? new Date(searchParams.date) : undefined
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">精彩活动</h1>
              <p className="text-primary-100">发现身边的精彩活动，与志同道合的朋友相聚</p>
            </div>
            <Link href="/activities/create">
              <Button className="bg-white text-primary-700 hover:bg-gray-100">
                <Plus className="w-4 h-4 mr-2" />
                发布活动
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                活动类型
              </label>
              <div className="flex flex-wrap gap-2">
                <Link href="/activities">
                  <Button
                    variant={!searchParams.category ? 'primary' : 'ghost'}
                    size="sm"
                  >
                    全部
                  </Button>
                </Link>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <Link key={key} href={`/activities?category=${key}`}>
                    <Button
                      variant={searchParams.category === key ? 'primary' : 'ghost'}
                      size="sm"
                    >
                      {label}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {activities.length} 个活动
          </h2>
          <Link href="/activities/calendar">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              日历视图
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity: any) => (
            <Link key={activity.id} href={`/activities/${activity.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <div className="aspect-video bg-gradient-to-br from-primary-500 to-primary-600 relative">
                  {activity.coverImage ? (
                    <img
                      src={activity.coverImage}
                      alt={activity.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Calendar className="w-16 h-16 text-white/50" />
                    </div>
                  )}
                  <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${categoryColors[activity.category]}`}>
                    {categoryLabels[activity.category]}
                  </span>
                </div>
                <CardContent className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                    {activity.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {activity.description}
                  </p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {format(new Date(activity.startTime), 'yyyy年M月d日 EEEE HH:mm', { locale: zhCN })}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="line-clamp-1">{activity.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      {activity._count.registrations} / {activity.maxParticipants} 人
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min((activity._count.registrations / activity.maxParticipants) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {activities.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无活动</h3>
            <p className="text-gray-500 mb-4">还没有任何活动，快来创建第一个吧！</p>
            <Link href="/activities/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                发布活动
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}