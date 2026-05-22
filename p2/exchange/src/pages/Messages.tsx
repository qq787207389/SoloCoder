import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAppStore } from '../store';
import type { ExchangeRequest, Item, User } from '../types';
import { formatDate } from '../utils';
import Header from '../components/Header';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: '待处理', color: 'text-orange-500 bg-orange-50' },
  accepted: { label: '已接受', color: 'text-green-500 bg-green-50' },
  rejected: { label: '已拒绝', color: 'text-red-500 bg-red-50' },
  completed: { label: '已完成', color: 'text-gray-500 bg-gray-100' },
};

export default function Messages() {
  const navigate = useNavigate();
  const exchangeRequests = useAppStore((state) => state.exchangeRequests);
  const setExchangeRequests = useAppStore((state) => state.setExchangeRequests);
  const markRequestAsRead = useAppStore((state) => state.markRequestAsRead);

  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [items, setItems] = useState<Record<string, Item>>({});
  const [users, setUsers] = useState<Record<string, User>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const response = await api.getExchangeRequests('all');
        if (response.success) {
          setExchangeRequests(response.data);

          const itemIds = [...new Set(response.data.flatMap((r) => [r.offeredItemId, r.requestedItemId]))];
          const userIds = [...new Set(response.data.flatMap((r) => [r.fromUserId, r.toUserId]))];

          const itemsMap: Record<string, Item> = {};
          const usersMap: Record<string, User> = {};

          for (const itemId of itemIds) {
            const itemResponse = await api.getItem(itemId);
            if (itemResponse.success) {
              itemsMap[itemId] = itemResponse.data;
            }
          }

          for (const userId of userIds) {
            const userResponse = await api.getUser(userId);
            if (userResponse.success) {
              usersMap[userId] = userResponse.data;
            }
          }

          setItems(itemsMap);
          setUsers(usersMap);
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [setExchangeRequests]);

  const filteredRequests = exchangeRequests.filter((r) => {
    if (activeTab === 'received') {
      return r.toUserId === 'current-user';
    }
    return r.fromUserId === 'current-user';
  });

  const handleRequestClick = (request: ExchangeRequest) => {
    if (!request.isRead && request.toUserId === 'current-user') {
      markRequestAsRead(request.id);
      api.markRequestAsRead(request.id);
    }
    navigate(`/messages/${request.id}`);
  };

  return (
    <div className="min-h-screen pb-28">
      <Header title="消息" />

      <div className="max-w-md mx-auto">
        <div className="flex border-b border-gray-200 bg-white sticky top-14 z-30">
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 py-3 text-center font-medium transition-colors relative ${
              activeTab === 'received'
                ? 'text-primary-500'
                : 'text-gray-500'
            }`}
          >
            收到的请求
            {activeTab === 'received' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 py-3 text-center font-medium transition-colors relative ${
              activeTab === 'sent'
                ? 'text-primary-500'
                : 'text-gray-500'
            }`}
          >
            发出的请求
            {activeTab === 'sent' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary-500 rounded-full" />
            )}
          </button>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <span className="text-6xl mb-4">📭</span>
              <p>暂无{activeTab === 'received' ? '收到的' : '发出的'}请求</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((request) => {
                const otherUserId = activeTab === 'received' ? request.fromUserId : request.toUserId;
                const otherUser = users[otherUserId];
                const item = activeTab === 'received'
                  ? items[request.requestedItemId]
                  : items[request.offeredItemId];
                const status = STATUS_LABELS[request.status];

                return (
                  <button
                    key={request.id}
                    onClick={() => handleRequestClick(request)}
                    className="w-full bg-white rounded-2xl p-4 text-left card-hover animate-fade-in"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        {otherUser ? (
                          <img
                            src={otherUser.avatar}
                            alt={otherUser.name}
                            className="w-12 h-12 rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-full" />
                        )}
                        {!request.isRead && request.toUserId === 'current-user' && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-800 line-clamp-1">
                            {otherUser?.name || '未知用户'}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>
                            {status.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          {item && (
                            <img
                              src={item.images[0]}
                              alt={item.title}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          )}
                          <span className="text-sm text-gray-600 line-clamp-1">
                            {activeTab === 'received' ? '想换你的' : '想用'} {item?.title || '物品'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500 line-clamp-1 flex-1">
                            {request.message}
                          </p>
                          <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                            {formatDate(request.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
