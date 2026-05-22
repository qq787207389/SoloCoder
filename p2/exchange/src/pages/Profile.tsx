import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Star, Settings, ChevronRight, LogOut, Heart, Clock } from 'lucide-react';
import { api } from '../services/api';
import { useAppStore } from '../store';
import type { Item, User, Rating } from '../types';
import { CATEGORY_LABELS } from '../types';
import Header from '../components/Header';

export default function Profile() {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const exchangeRequests = useAppStore((state) => state.exchangeRequests);

  const [myItems, setMyItems] = useState<Item[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [activeTab, setActiveTab] = useState<'items' | 'ratings'>('items');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [itemsResponse, ratingsResponse] = await Promise.all([
          api.getUserItems('current-user'),
          api.getRatings('current-user'),
        ]);

        if (itemsResponse.success) {
          setMyItems(itemsResponse.data);
        }
        if (ratingsResponse.success) {
          setRatings(ratingsResponse.data);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('确定要下架这件物品吗？')) return;

    try {
      const response = await api.deleteItem(itemId);
      if (response.success) {
        setMyItems((prev) => prev.filter((i) => i.id !== itemId));
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const stats = [
    { label: '发布物品', value: myItems.length, icon: Package },
    { label: '完成交换', value: exchangeRequests.filter((r) => r.status === 'completed').length, icon: Heart },
    { label: '平均评分', value: user?.rating || 0, icon: Star, isRating: true },
  ];

  return (
    <div className="min-h-screen pb-28">
      <Header title="个人中心" />

      <div className="max-w-md mx-auto">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-6 text-white">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Me'}
              alt="头像"
              className="w-16 h-16 rounded-full border-2 border-white/30"
            />
            <div className="flex-1">
              <h2 className="text-xl font-bold">{user?.name || '我'}</h2>
              <p className="text-white/80 text-sm">{user?.community || '阳光花园'}</p>
            </div>
            <button className="p-2 hover:bg-white/10 rounded-full">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-white -mt-4 mx-4 rounded-2xl shadow-lg p-4">
          <div className="flex justify-around">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Icon className={`w-4 h-4 ${stat.isRating ? 'text-yellow-500 fill-yellow-500' : 'text-primary-500'}`} />
                    <span className="text-xl font-bold text-gray-800">
                      {stat.isRating ? stat.value.toFixed(1) : stat.value}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4">
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => setActiveTab('items')}
              className={`flex-1 py-3 text-center font-medium transition-colors relative ${
                activeTab === 'items' ? 'text-primary-500' : 'text-gray-500'
              }`}
            >
              我的物品
              {activeTab === 'items' && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('ratings')}
              className={`flex-1 py-3 text-center font-medium transition-colors relative ${
                activeTab === 'ratings' ? 'text-primary-500' : 'text-gray-500'
              }`}
            >
              收到的评价
              {activeTab === 'ratings' && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary-500 rounded-full" />
              )}
            </button>
          </div>

          {activeTab === 'items' && (
            <div>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-20 bg-gray-200 rounded-xl" />
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                          <div className="h-3 bg-gray-200 rounded w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : myItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Package className="w-16 h-16 mb-4 opacity-50" />
                  <p className="mb-2">还没有发布物品</p>
                  <button
                    onClick={() => navigate('/publish')}
                    className="text-primary-500 hover:underline"
                  >
                    去发布第一件
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl p-4 card-hover"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                          onClick={() => navigate(`/item/${item.id}`)}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-800 line-clamp-1 mb-1">
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-600 rounded-full">
                              {CATEGORY_LABELS[item.category]}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              item.status === 'active'
                                ? 'bg-green-100 text-green-600'
                                : item.status === 'exchanged'
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {item.status === 'active' ? '上架中' : item.status === 'exchanged' ? '已交换' : '已下架'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                            {item.description}
                          </p>
                          {item.status === 'active' && (
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-xs text-red-500 hover:underline"
                            >
                              下架物品
                            </button>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'ratings' && (
            <div>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-full" />
                    </div>
                  ))}
                </div>
              ) : ratings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Star className="w-16 h-16 mb-4 opacity-50" />
                  <p>还没有收到评价</p>
                  <p className="text-sm">完成交换后对方可以给你评价</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ratings.map((rating) => (
                    <div key={rating.id} className="bg-white rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${star <= rating.score ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400 ml-auto">
                          {new Date(rating.createdAt).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                      {rating.comment && (
                        <p className="text-sm text-gray-600">{rating.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-4 mb-4">
          <div className="bg-white rounded-2xl overflow-hidden">
            <button
              onClick={() => navigate('/messages')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-500" />
                <span className="text-gray-800">交换记录</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <div className="h-px bg-gray-100 mx-4" />
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-gray-500" />
                <span className="text-gray-800">退出登录</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
