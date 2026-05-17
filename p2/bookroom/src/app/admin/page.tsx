'use client'

import { useState } from 'react'
import { Users, Calendar, Flag, BarChart3, BookOpen, TrendingUp, Eye, Check, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface Report {
  id: string
  type: string
  reason: string
  status: string
  reporterName: string
  content: string
  createdAt: Date
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'users' | 'activities'>('dashboard')

  const stats = {
    totalUsers: 1256,
    totalActivities: 89,
    totalCircles: 24,
    pendingReports: 12,
    newUsersToday: 15,
    newRegistrations: 47
  }

  const reports: Report[] = [
    { id: '1', type: 'post', reason: '垃圾广告', status: 'PENDING', reporterName: '用户A', content: '这是一条违规帖子内容...', createdAt: new Date() },
    { id: '2', type: 'post', reason: '不当言论', status: 'PENDING', reporterName: '用户B', content: '这是一条违规评论...', createdAt: new Date() },
    { id: '3', type: 'post', reason: '其他', status: 'PENDING', reporterName: '用户C', content: '举报内容...', createdAt: new Date() },
  ]

  const weeklyData = [
    { day: '周一', users: 45, activities: 8 },
    { day: '周二', users: 52, activities: 12 },
    { day: '周三', users: 38, activities: 6 },
    { day: '周四', users: 65, activities: 15 },
    { day: '周五', users: 78, activities: 18 },
    { day: '周六', users: 92, activities: 22 },
    { day: '周日', users: 85, activities: 20 },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 mr-3" />
              <h1 className="text-2xl font-bold">管理后台</h1>
            </div>
            <div className="text-sm text-gray-400">
              管理员登录中
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <Button
            variant={activeTab === 'dashboard' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('dashboard')}
            className="flex-shrink-0"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            数据看板
          </Button>
          <Button
            variant={activeTab === 'reports' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('reports')}
            className="flex-shrink-0"
          >
            <Flag className="w-4 h-4 mr-2" />
            举报管理
            {stats.pendingReports > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {stats.pendingReports}
              </span>
            )}
          </Button>
          <Button
            variant={activeTab === 'users' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('users')}
            className="flex-shrink-0"
          >
            <Users className="w-4 h-4 mr-2" />
            用户管理
          </Button>
          <Button
            variant={activeTab === 'activities' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('activities')}
            className="flex-shrink-0"
          >
            <Calendar className="w-4 h-4 mr-2" />
            活动管理
          </Button>
        </div>

        {activeTab === 'dashboard' && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">总用户数</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                      <p className="text-sm text-green-600 flex items-center mt-1">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        +{stats.newUsersToday} 今日
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">活动总数</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalActivities}</p>
                      <p className="text-sm text-green-600 flex items-center mt-1">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        +{stats.newRegistrations} 报名
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-2 lg:col-span-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">圈子数量</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalCircles}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        举报待处理: <span className="text-red-600 font-medium">{stats.pendingReports}</span>
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Flag className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-6">本周数据趋势</h3>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-gray-500 mb-4">新用户增长</p>
                    <div className="flex items-end gap-2 h-40">
                      {weeklyData.map((item) => (
                        <div key={item.day} className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full bg-blue-500 rounded-t transition-all"
                            style={{ height: `${(item.users / 100) * 100}%` }}
                          />
                          <span className="text-xs text-gray-500 mt-2">{item.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-4">活动报名</p>
                    <div className="flex items-end gap-2 h-40">
                      {weeklyData.map((item) => (
                        <div key={item.day} className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full bg-purple-500 rounded-t transition-all"
                            style={{ height: `${(item.activities / 25) * 100}%` }}
                          />
                          <span className="text-xs text-gray-500 mt-2">{item.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'reports' && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">待处理举报</h3>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full mr-2">
                          {report.reason}
                        </span>
                        <span className="text-sm text-gray-500">
                          举报人: {report.reporterName}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(report.createdAt).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-4 bg-gray-50 p-3 rounded">{report.content}</p>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="text-green-600">
                        <Check className="w-4 h-4 mr-1" />
                        通过
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600">
                        <X className="w-4 h-4 mr-1" />
                        驳回
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4 mr-1" />
                        查看详情
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'users' && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">用户列表</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">用户</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">邮箱</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">角色</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">注册时间</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
                              <span className="text-gray-500 text-sm">用{i}</span>
                            </div>
                            <span className="font-medium text-gray-900">用户{i}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">user{i}@example.com</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${i === 1 ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                            {i === 1 ? '管理员' : '普通用户'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">2024-01-{10 + i}</td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm">编辑</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'activities' && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">活动管理</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">活动</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">类型</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">报名人数</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['读书会: 红楼梦鉴赏', '讲座: 科幻文学发展', '手作工坊: 手工书签'].map((name, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-gray-900">{name}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                            {['读书会', '讲座', '手作工坊'][i]}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{25 + i * 10} / 50</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${i === 2 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                            {i === 2 ? '进行中' : '已发布'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm">编辑</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}