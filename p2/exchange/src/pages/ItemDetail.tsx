import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, User, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { useAppStore } from '../store';
import type { Item, User as UserType } from '../types';
import { CATEGORY_LABELS } from '../types';
import { formatDate } from '../utils';
import Header from '../components/Header';

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addExchangeRequest = useAppStore((state) => state.addExchangeRequest);

  const [item, setItem] = useState<Item | null>(null);
  const [owner, setOwner] = useState<UserType | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [itemResponse, myItemsResponse] = await Promise.all([
          api.getItem(id),
          api.getUserItems('current-user'),
        ]);

        if (itemResponse.success) {
          setItem(itemResponse.data);
          const ownerResponse = await api.getUser(itemResponse.data.userId);
          if (ownerResponse.success) {
            setOwner(ownerResponse.data);
          }
        }

        if (myItemsResponse.success) {
          setMyItems(myItemsResponse.data.filter((i) => i.status === 'active'));
        }
      } catch (error) {
        console.error('Failed to load item:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleExchange = async () => {
    if (!selectedItemId || !item) {
      alert('请选择要交换的物品');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.createExchangeRequest({
        toUserId: item.userId,
        offeredItemId: selectedItemId,
        requestedItemId: item.id,
        message: message.trim(),
      });

      if (response.success) {
        addExchangeRequest(response.data);
        setShowExchangeModal(false);
        alert('交换请求已发送！');
      }
    } catch (error) {
      console.error('Failed to send request:', error);
      alert('发送失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-50">
        <Header showBack />
        <div className="max-w-md mx-auto p-4">
          <div className="animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-2xl mb-4" />
            <div className="h-6 bg-gray-200 rounded mb-2 w-2/3" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-warm-50">
        <Header showBack />
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <span className="text-6xl mb-4">😢</span>
          <p>物品不存在</p>
        </div>
      </div>
    );
  }

  const isOwnItem = item.userId === 'current-user';

  return (
    <div className="min-h-screen bg-warm-50 pb-24">
      <Header showBack />

      <div className="max-w-md mx-auto">
        <div className="relative aspect-square bg-gray-100">
          {item.images.length > 0 ? (
            <>
              <img
                src={item.images[currentImageIndex]}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              {item.images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((i) => Math.max(0, i - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 rounded-full flex items-center justify-center"
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((i) => Math.min(item.images.length - 1, i + 1))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 rounded-full flex items-center justify-center"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                    {item.images.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              暂无图片
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-xl font-bold text-gray-800">{item.title}</h1>
            <span className="px-3 py-1 bg-primary-100 text-primary-600 text-sm font-medium rounded-full">
              {CATEGORY_LABELS[item.category]}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDate(item.createdAt)}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {item.community}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">物品描述</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
          </div>

          <div className="bg-secondary-50 rounded-2xl p-4 mb-4">
            <h3 className="font-semibold text-secondary-700 mb-2">💭 想换什么</h3>
            <p className="text-secondary-600 text-sm">
              {item.desiredCategory || '随缘，看有什么合适的'}
            </p>
          </div>

          {owner && (
            <div className="bg-white rounded-2xl p-4 mb-4">
              <h3 className="font-semibold text-gray-800 mb-3">发布者</h3>
              <div className="flex items-center gap-3">
                <img
                  src={owner.avatar}
                  alt={owner.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{owner.name}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      {owner.rating}
                    </div>
                    <span>·</span>
                    <span>{owner.exchangeCount}次交换</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  {owner.community}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {!isOwnItem && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 safe-bottom">
          <div className="max-w-md mx-auto">
            <button
              onClick={() => setShowExchangeModal(true)}
              className="w-full py-4 bg-primary-500 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30 hover:bg-primary-600 btn-press transition-all"
            >
              🔄 我想换这个
            </button>
          </div>
        </div>
      )}

      {showExchangeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-md max-h-[80vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-white p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold">发起交换请求</h3>
              <button
                onClick={() => setShowExchangeModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  选择你要交换的物品
                </label>
                {myItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>你还没有发布物品</p>
                    <button
                      onClick={() => navigate('/publish')}
                      className="mt-2 text-primary-500 hover:underline"
                    >
                      去发布
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {myItems.map((myItem) => (
                      <button
                        key={myItem.id}
                        onClick={() => setSelectedItemId(myItem.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                          selectedItemId === myItem.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={myItem.images[0]}
                          alt={myItem.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-800 line-clamp-1">
                            {myItem.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {CATEGORY_LABELS[myItem.category]}
                          </div>
                        </div>
                        {selectedItemId === myItem.id && (
                          <span className="text-primary-500">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  给对方留言
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="说点什么，比如什么时候交换比较方便..."
                  rows={3}
                  maxLength={100}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all resize-none"
                />
                <div className="text-right text-xs text-gray-400 mt-1">
                  {message.length}/100
                </div>
              </div>

              <button
                onClick={handleExchange}
                disabled={isSubmitting || !selectedItemId}
                className="w-full py-4 bg-primary-500 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed btn-press transition-all"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    发送中...
                  </span>
                ) : (
                  '发送交换请求'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
