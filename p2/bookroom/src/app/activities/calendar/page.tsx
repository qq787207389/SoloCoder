'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { getActivities } from '@/app/actions/activityActions'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [activities, setActivities] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActivities()
  }, [currentMonth])

  const loadActivities = async () => {
    setLoading(true)
    try {
      const data = await getActivities()
      setActivities(data)
    } catch (error) {
      console.error('Failed to load activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const weekDays = ['日', '一', '二', '三', '四', '五', '六']

  const getActivitiesForDate = (date: Date) => {
    return activities.filter((activity) => 
      isSameDay(new Date(activity.startTime), date)
    )
  }

  const selectedDateActivities = selectedDate ? getActivitiesForDate(selectedDate) : []

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
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {format(currentMonth, 'yyyy年 M月', { locale: zhCN })}
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-gray-500 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const dayActivities = getActivitiesForDate(day)
                  const isToday = isSameDay(day, new Date())
                  const isSelected = selectedDate && isSameDay(day, selectedDate)

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        min-h-[80px] p-2 rounded-lg text-left transition-all
                        ${isSelected ? 'bg-primary-100 ring-2 ring-primary-500' : 'hover:bg-gray-100'}
                        ${!isSameMonth(day, currentMonth) ? 'text-gray-300' : ''}
                      `}
                    >
                      <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary-600' : 'text-gray-700'}`}>
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-1">
                        {dayActivities.slice(0, 2).map((activity) => (
                          <div
                            key={activity.id}
                            className="text-xs bg-primary-50 text-primary-700 px-1 py-0.5 rounded truncate"
                          >
                            {activity.title}
                          </div>
                        ))}
                        {dayActivities.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{dayActivities.length - 2} 更多
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {selectedDate 
                    ? format(selectedDate, 'M月d日 EEEE', { locale: zhCN })
                    : '选择日期查看活动'
                  }
                </h3>
                
                {selectedDate ? (
                  <div className="space-y-4">
                    {selectedDateActivities.length > 0 ? (
                      selectedDateActivities.map((activity) => (
                        <Link
                          key={activity.id}
                          href={`/activities/${activity.id}`}
                          className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <h4 className="font-medium text-gray-900 mb-1">{activity.title}</h4>
                          <p className="text-sm text-gray-500">
                            {format(new Date(activity.startTime), 'HH:mm')}
                          </p>
                          <p className="text-sm text-gray-500 truncate">{activity.location}</p>
                        </Link>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">当天暂无活动</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">点击日历中的日期查看活动</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}