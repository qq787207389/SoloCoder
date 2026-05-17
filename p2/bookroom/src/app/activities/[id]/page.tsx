'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Calendar, MapPin, Users, Clock, Download, ArrowLeft, Ticket } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { ActivityCategory, RegistrationStatus } from '@prisma/client'
import { getActivityById, registerForActivity, cancelRegistration, getUserRegistrations } from '@/app/actions/activityActions'
import { generateICS } from '@/lib/utils'
import { QRCodeSVG } from 'qrcode.react'

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

export default function ActivityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [activity, setActivity] = useState<any>(null)
  const [userRegistration, setUserRegistration] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)

  useEffect(() => {
    loadData()
  }, [params.id])

  const loadData = async () => {
    try {
      const [activityData, registrations] = await Promise.all([
        getActivityById(params.id as string),
        getUserRegistrations()
      ])
      setActivity(activityData)
      const registration = registrations.find((r: any) => r.activityId === params.id)
      setUserRegistration(registration || null)
    } catch (error) {
      console.error('Failed to load activity:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    setRegistering(true)
    try {
      await registerForActivity(params.id as string)
      await loadData()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setRegistering(false)
    }
  }

  const handleCancelRegistration = async () => {
    if (!confirm('确定要取消报名吗？')) return
    
    try {
      await cancelRegistration(params.id as string)
      await loadData()
    } catch (error: any) {
      alert(error.message)
    }
  }

  const downloadICS = () => {
    if (!activity) return
    
    const icsContent = generateICS({
      title: activity.title,
      description: activity.description,
      location: activity.location,
      startTime: new Date(activity.startTime),
      endTime: new Date(activity.endTime)
    })

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${activity.title}.ics`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (!activity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">活动不存在</h2>
          <Link href="/activities">
            <Button>返回活动列表</Button>
          </Link>
        </div>
      </div>
    )
  }

  const isFull = activity._count.registrations >= activity.maxParticipants

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/activities" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回活动列表
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="aspect-video bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl overflow-hidden mb-6">
              {activity.coverImage ? (
                <img
                  src={activity.coverImage}
                  alt={activity.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Calendar className="w-24 h-24 text-white/50" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[activity.category]}`}>
                {categoryLabels[activity.category]}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{activity.title}</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">活动时间</p>
                  <p className="text-gray-600 text-sm">
                    {format(new Date(activity.startTime), 'yyyy年M月d日 EEEE', { locale: zhCN })}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {format(new Date(activity.startTime), 'HH:mm')} - {format(new Date(activity.endTime), 'HH:mm')}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">活动地点</p>
                  <p className="text-gray-600 text-sm">{activity.location}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Users className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">报名人数</p>
                  <p className="text-gray-600 text-sm">
                    {activity._count.registrations} / {activity.maxParticipants} 人
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Clock className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">活动时长</p>
                  <p className="text-gray-600 text-sm">
                    {Math.round((new Date(activity.endTime).getTime() - new Date(activity.startTime).getTime()) / (1000 * 60 * 60))} 小时
                  </p>
                </div>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">活动详情</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{activity.description}</p>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card>
                <CardContent className="p-6">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">报名进度</span>
                      <span className="font-semibold text-gray-900">
                        {activity._count.registrations} / {activity.maxParticipants}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${isFull ? 'bg-red-500' : 'bg-primary-600'}`}
                        style={{
                          width: `${Math.min((activity._count.registrations / activity.maxParticipants) * 100, 100)}%`
                        }}
                      />
                    </div>
                    {isFull && (
                      <p className="text-red-500 text-sm mt-2">名额已满，可报名候补</p>
                    )}
                  </div>

                  {userRegistration ? (
                    <div className="space-y-4">
                      <div className={`p-4 rounded-lg ${userRegistration.status === RegistrationStatus.CONFIRMED ? 'bg-green-50' : 'bg-yellow-50'}`}>
                        <div className="flex items-center mb-2">
                          <Ticket className="w-5 h-5 mr-2 text-green-600" />
                          <span className="font-medium text-gray-900">
                            {userRegistration.status === RegistrationStatus.CONFIRMED ? '已报名成功' : '候补报名成功'}
                          </span>
                        </div>
                        {userRegistration.status === RegistrationStatus.WAITLIST && (
                          <p className="text-sm text-yellow-700">
                            候补排名：第 {userRegistration.waitlistNumber} 位
                          </p>
                        )}
                      </div>

                      {userRegistration.ticket && (
                        <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg">
                          <p className="text-sm text-gray-600 mb-3 text-center">活动入场二维码</p>
                          <div className="flex justify-center">
                            <QRCodeSVG
                              value={userRegistration.ticket.qrCode}
                              size={150}
                              level="M"
                            />
                          </div>
                        </div>
                      )}

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={downloadICS}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        添加到日历
                      </Button>

                      <Button
                        variant="ghost"
                        className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={handleCancelRegistration}
                      >
                        取消报名
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Button
                        className="w-full"
                        onClick={handleRegister}
                        isLoading={registering}
                        disabled={activity.status !== 'PUBLISHED'}
                      >
                        {isFull ? '候补报名' : '立即报名'}
                      </Button>
                      <p className="text-sm text-gray-500 text-center">
                        报名后将生成电子票，可在我的活动中查看
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}