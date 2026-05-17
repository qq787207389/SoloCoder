'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar as CalendarIcon, MapPin, Users, Upload } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card, CardContent } from '@/components/ui/Card'
import { createActivity } from '@/app/actions/activityActions'
import { ActivityCategory } from '@prisma/client'

const categoryOptions = [
  { value: ActivityCategory.READING, label: '读书会' },
  { value: ActivityCategory.LECTURE, label: '讲座' },
  { value: ActivityCategory.WORKSHOP, label: '手作工坊' },
  { value: ActivityCategory.EXHIBITION, label: '展览' },
  { value: ActivityCategory.OTHER, label: '其他' }
]

export default function CreateActivityPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ActivityCategory.READING,
    maxParticipants: 30,
    startTime: '',
    endTime: '',
    location: '',
    latitude: '',
    longitude: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createActivity({
        ...formData,
        maxParticipants: Number(formData.maxParticipants),
        startTime: new Date(formData.startTime),
        endTime: new Date(formData.endTime),
        latitude: formData.latitude ? Number(formData.latitude) : undefined,
        longitude: formData.longitude ? Number(formData.longitude) : undefined
      })
      router.push('/activities')
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link href="/activities" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回活动列表
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">发布新活动</h1>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    活动封面
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">点击上传图片</p>
                    <p className="text-xs text-gray-400 mt-1">支持 JPG、PNG 格式，大小不超过 5MB</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    活动标题 *
                  </label>
                  <Input
                    required
                    placeholder="请输入活动标题"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    活动类型 *
                  </label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ActivityCategory })}
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    活动详情 *
                  </label>
                  <Textarea
                    required
                    rows={6}
                    placeholder="请详细描述活动内容、流程、注意事项等"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">时间与地点</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <CalendarIcon className="w-4 h-4 inline mr-1" />
                      开始时间 *
                    </label>
                    <Input
                      required
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <CalendarIcon className="w-4 h-4 inline mr-1" />
                      结束时间 *
                    </label>
                    <Input
                      required
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    活动地点 *
                  </label>
                  <Input
                    required
                    placeholder="请输入详细地址"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      纬度
                    </label>
                    <Input
                      type="number"
                      step="0.000001"
                      placeholder="31.230416"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      经度
                    </label>
                    <Input
                      type="number"
                      step="0.000001"
                      placeholder="121.473701"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">人数设置</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  最大参与人数 *
                </label>
                <Input
                  required
                  type="number"
                  min="1"
                  placeholder="30"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Link href="/activities">
              <Button variant="outline" type="button">
                取消
              </Button>
            </Link>
            <Button type="submit" isLoading={loading}>
              发布活动
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}