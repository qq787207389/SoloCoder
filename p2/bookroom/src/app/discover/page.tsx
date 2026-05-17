'use client'

import { useState, useEffect } from 'react'
import { MapPin, Users, BookOpen, MessageCircle, Search, Sliders } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { haversineDistance, calculateSimilarity } from '@/lib/utils'

interface Bookstore {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  distance: number
}

interface UserMatch {
  id: string
  name: string
  bio: string
  interests: string[]
  similarity: number
  distance: number
  isOnline: boolean
}

export default function DiscoverPage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [activeTab, setActiveTab] = useState<'bookstores' | 'people'>('bookstores')
  const [searchRadius, setSearchRadius] = useState(5)
  const [socialModeEnabled, setSocialModeEnabled] = useState(false)

  const mockBookstores: Bookstore[] = [
    { id: '1', name: '时光书房', address: '上海市静安区南京西路1266号', latitude: 31.2304, longitude: 121.4737, distance: 1.2 },
    { id: '2', name: '墨香书屋', address: '上海市黄浦区福州路390号', latitude: 31.2354, longitude: 121.4837, distance: 2.5 },
    { id: '3', name: '云端阅读', address: '上海市徐汇区衡山路890号', latitude: 31.2054, longitude: 121.4437, distance: 3.8 },
    { id: '4', name: '森林书店', address: '上海市长宁区愚园路1088号', latitude: 31.2204, longitude: 121.4237, distance: 4.5 },
  ]

  const mockUsers: UserMatch[] = [
    { id: '1', name: '读书小王子', bio: '热爱文学，喜欢分享读书心得', interests: ['文学', '诗歌', '历史'], similarity: 0.85, distance: 1.5, isOnline: true },
    { id: '2', name: '咖啡与书', bio: '周末喜欢泡在书店，寻找同好', interests: ['小说', '传记', '哲学'], similarity: 0.72, distance: 2.3, isOnline: true },
    { id: '3', name: '夜读人', bio: '深夜是读书的最佳时光', interests: ['科幻', '悬疑', '推理'], similarity: 0.68, distance: 3.1, isOnline: false },
    { id: '4', name: '书香门第', bio: '经典文学爱好者，寻找共读伙伴', interests: ['经典文学', '外国文学', '名著'], similarity: 0.78, distance: 4.0, isOnline: true },
  ]

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        () => {
          setUserLocation({ lat: 31.2304, lng: 121.4737 })
        }
      )
    } else {
      setUserLocation({ lat: 31.2304, lng: 121.4737 })
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">发现</h1>
          <p className="text-green-100">探索附近的书房和志同道合的书友</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === 'bookstores' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('bookstores')}
          >
            <MapPin className="w-4 h-4 mr-2" />
            附近书房
          </Button>
          <Button
            variant={activeTab === 'people' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('people')}
          >
            <Users className="w-4 h-4 mr-2" />
            书友匹配
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-400" />
            <span className="text-gray-600">搜索范围: {searchRadius} 公里内</span>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="20"
              value={searchRadius}
              onChange={(e) => setSearchRadius(Number(e.target.value))}
              className="w-40 accent-green-600"
            />
            <Button variant="ghost" size="sm">
              <Sliders className="w-4 h-4 mr-2" />
              筛选
            </Button>
          </div>
        </div>

        {activeTab === 'bookstores' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockBookstores.map((bookstore) => (
              <Card key={bookstore.id} className="hover:shadow-lg transition-shadow">
                <div className="h-40 bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-white/50" />
                </div>
                <CardContent className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{bookstore.name}</h3>
                  <div className="flex items-start mb-4">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600">{bookstore.address}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-600 font-medium">
                      {bookstore.distance} km
                    </span>
                    <Button size="sm" variant="outline">
                      查看详情
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-green-50 to-accent-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">阅读社交模式</h3>
                      <p className="text-sm text-gray-600">开启后可被附近的书友发现和匹配</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSocialModeEnabled(!socialModeEnabled)}
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      socialModeEnabled ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                        socialModeEnabled ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>

            {socialModeEnabled ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockUsers.map((user) => (
                  <Card key={user.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start mb-4">
                        <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                          <Users className="w-7 h-7 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{user.name}</h3>
                            <span
                              className={`w-2 h-2 rounded-full ${
                                user.isOnline ? 'bg-green-500' : 'bg-gray-300'
                              }`}
                            />
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{user.bio}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            {user.distance} km 以内
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {user.interests.map((interest) => (
                          <span
                            key={interest}
                            className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="text-sm">
                          <span className="text-gray-500">匹配度 </span>
                          <span className="font-semibold text-green-600">
                            {Math.round(user.similarity * 100)}%
                          </span>
                        </div>
                        <Button size="sm">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          发起私聊
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">开启阅读社交模式</h3>
                <p className="text-gray-500 mb-4">开启后可发现附近的书友并进行匹配</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}