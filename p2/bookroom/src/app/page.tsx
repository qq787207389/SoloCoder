import Link from 'next/link'
import { Calendar, Users, BookOpen, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              城市书房社区
            </h1>
            <p className="text-lg sm:text-xl text-primary-100 max-w-2xl mx-auto mb-8">
              发现精彩活动，加入读书社群，结识志同道合的书友
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/activities">
                <Button size="lg" className="w-full sm:w-auto bg-white text-primary-700 hover:bg-gray-100">
                  <Calendar className="w-5 h-5 mr-2" />
                  浏览活动
                </Button>
              </Link>
              <Link href="/circles">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                  <Users className="w-5 h-5 mr-2" />
                  加入社群
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            为什么选择 Bookroom
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">精彩活动</h3>
              <p className="text-gray-600">
                读书会、讲座、手作工坊等多种线下活动，丰富你的业余生活
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-accent-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">兴趣社群</h3>
              <p className="text-gray-600">
                加入兴趣圈子，与志同道合的书友一起读书打卡，共同成长
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">附近书房</h3>
              <p className="text-gray-600">
                发现身边的城市书房，参与热门活动，认识附近的书友
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <BookOpen className="w-16 h-16 text-primary-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4 text-gray-900">
            开始你的阅读社交之旅
          </h2>
          <p className="text-gray-600 mb-8">
            立即加入 Bookroom，与万千书友一起探索阅读的乐趣
          </p>
          <Link href="/login">
            <Button size="lg">
              立即加入
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}