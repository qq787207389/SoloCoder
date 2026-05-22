import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, Star, Check, X, Copy, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAppStore } from '../store';
import type { ExchangeRequest, Item, User, Rating } from '../types';
import { formatDate } from '../utils';
import Header from '../components/Header';

export default function MessageDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const updateExchangeRequest = useAppStore((state) => state.updateExchangeRequest);

  const [request, setRequest] = useState<ExchangeRequest | null>(null);
  const [offeredItem, setOfferedItem] = useState<Item | null>(null);
  const [requestedItem, setRequestedItem] = useState<Item | null>(null);
  const [fromUser, setFromUser] = useState<User | null>(null);
  const [toUser, setToUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [myRating, setMyRating] = useState<Rating | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const requestsResponse = await api.getExchangeRequests('all');
        const foundRequest = requestsResponse.data?.find((r) => r.id === id);

        if (foundRequest) {
          setRequest(foundRequest);

          const [offeredRes, requestedRes, fromUserRes, toUserRes, ratingsRes] = await Promise.all([
            api.getItem(foundRequest.offeredItemId),
            api.getItem(foundRequest.requestedItemId),
            api.getUser(foundRequest.fromUserId),
            api.getUser(foundRequest.toUserId),
            api.getRatings(foundRequest.toUserId),
          ]);

          if (offeredRes.success) setOfferedItem(offeredRes.data);
          if (requestedRes.success) setRequestedItem(requestedRes.data);
          if (fromUserRes.success) setFromUser(fromUserRes.data);
          if (toUserRes.success) setToUser(toUserRes.data);
          if (ratingsRes.success) {
            const mine = ratingsRes.data.find((r) => r.exchangeId === id && r.fromUserId === 'current-user');
            setMyRating(mine || null);
          }
        }
      } catch (error) {
        console.error('Failed to load request:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleAccept = async () => {
    if (!request) return;
    setIsProcessing(true);
    try {
      const response = await api.updateExchangeRequest(request.id, { status: 'accepted' });
      if (response.success) {
        setRequest(response.data);
        updateExchangeRequest(response.data);
      }
    } catch (error) {
      console.error('Failed to accept:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!request) return;
    setIsProcessing(true);
    try {
      const response = await api.updateExchangeRequest(request.id, { status: 'rejected' });
      if (response.success) {
        setRequest(response.data);
        updateExchangeRequest(response.data);
      }
    } catch (error) {
      console.error('Failed to reject:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComplete = async () => {
    if (!request) return;
    setIsProcessing(true);
    try {
      const response = await api.updateExchangeRequest(request.id, { status: 'completed' });
      if (response.success) {
        setRequest(response.data);
        updateExchangeRequest(response.data);
        setShowRatingModal(true);
      }
    } catch (error) {
      console.error('Failed to complete:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!request) return;
    setIsProcessing(true);
    try {
      const otherUserId = request.fromUserId === 'current-user' ? request.toUserId : request.fromUserId;
      const response = await api.createRating({
        toUserId: otherUserId,
        exchangeId: request.id,
        score: rating,
        comment: ratingComment,
      });
      if (response.success) {
        setMyRating(response.data);
        setShowRatingModal(false);
        alert('评价成功！');
      }
    } catch (error) {
      console.error('Failed to submit rating:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    alert('手机号已复制');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-50">
        <Header title="交换详情" showBack />
        <div className="max-w-md mx-auto p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-white rounded-2xl" />
            <div className="h-32 bg-white rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-warm-50">
        <Header title="交换详情" showBack />
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <span className="text-6xl mb-4">😢</span>
          <p>请求不存在</p>
        </div>
      </div>
    );
  }

  const isReceived = request.toUserId === 'current-user';
  const otherUser = isReceived ? fromUser : toUser;
  const statusConfig = {
    pending: { label: '待处理', color: 'text-orange-500 bg-orange-50' },
    accepted: { label: '已接受', color: 'text-green-500 bg-green-50' },
    rejected: { label: '已拒绝', color: 'text-red-500 bg-red-50' },
    completed: { label: '已完成', color: 'text-gray-500 bg-gray-100' },
  }[request.status];

  return (
    <div className="min-h-screen bg-warm-50 pb-24">
      <Header title="交换详情" showBack />

      <div className="max-w-md mx-auto p-4">
        <div className="bg-white rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {otherUser && (
                <img src={otherUser.avatar} alt="" className="w-12 h-12 rounded-full" />
              )}
              <div>
                <div className="font-medium text-gray-800">{otherUser?.name}</div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                  {otherUser?.rating} · {otherUser?.exchangeCount}次交换
                </div>
              </div>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
          <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
            {request.message || '对方没有留言'}
          </p>
          <p className="text-xs text-gray-400 mt-2">{formatDate(request.createdAt)}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 mb-4">
          <h3 className="font-semibold text-gray-800 mb-3">交换物品</h3>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">{isReceived ? '对方提供' : '你提供'}</p>
              {offeredItem && (
                <div className="bg-gray-50 rounded-xl p-2">
                  <img src={offeredItem.images[0]} alt="" className="w-full aspect-square object-cover rounded-lg mb-2" />
                  <p className="text-sm font-medium text-gray-800 line-clamp-1">{offeredItem.title}</p>
                </div>
              )}
            </div>
            <div className="text-2xl">🔄</div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">{isReceived ? '你收到' : '对方收到'}</p>
              {requestedItem && (
                <div className="bg-gray-50 rounded-xl p-2">
                  <img src={requestedItem.images[0]} alt="" className="w-full aspect-square object-cover rounded-lg mb-2" />
                  <p className="text-sm font-medium text-gray-800 line-clamp-1">{requestedItem.title}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {request.status === 'accepted' && (
          <div className="bg-green-50 rounded-2xl p-4 mb-4 border border-green-200">
            <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              联系方式
            </h3>
            <div className="space-y-2">
              {otherUser && (
                <div className="flex items-center justify-between bg-white rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-green-600" />
                    <span className="text-gray-800">{otherUser.phone}</span>
                  </div>
                  <button
                    onClick={() => copyPhone(otherUser.phone)}
                    className="flex items-center gap-1 text-green-600 text-sm hover:underline"
                  >
                    <Copy className="w-4 h-4" />
                    复制
                  </button>
                </div>
              )}
              <p className="text-xs text-green-600 text-center mt-2">
                请联系对方约定时间地点完成交换
              </p>
            </div>
          </div>
        )}

        {request.status === 'completed' && myRating && (
          <div className="bg-gray-50 rounded-2xl p-4 mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">你的评价</h3>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${star <= myRating.score ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                />
              ))}
            </div>
            {myRating.comment && (
              <p className="text-sm text-gray-600">{myRating.comment}</p>
            )}
          </div>
        )}
      </div>

      {request.status === 'pending' && isReceived && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 safe-bottom">
          <div className="max-w-md mx-auto flex gap-3">
            <button
              onClick={handleReject}
              disabled={isProcessing}
              className="flex-1 py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 disabled:opacity-50 btn-press transition-all flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              拒绝
            </button>
            <button
              onClick={handleAccept}
              disabled={isProcessing}
              className="flex-1 py-4 bg-primary-500 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30 hover:bg-primary-600 disabled:opacity-50 btn-press transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              接受
            </button>
          </div>
        </div>
      )}

      {request.status === 'accepted' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 safe-bottom">
          <div className="max-w-md mx-auto">
            <button
              onClick={handleComplete}
              disabled={isProcessing}
              className="w-full py-4 bg-secondary-500 text-white font-semibold rounded-xl shadow-lg shadow-secondary-500/30 hover:bg-secondary-600 disabled:opacity-50 btn-press transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              标记交换完成
            </button>
          </div>
        </div>
      )}

      {request.status === 'completed' && !myRating && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 safe-bottom">
          <div className="max-w-md mx-auto">
            <button
              onClick={() => setShowRatingModal(true)}
              className="w-full py-4 bg-primary-500 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30 hover:bg-primary-600 btn-press transition-all"
            >
              去评价
            </button>
          </div>
        </div>
      )}

      {showRatingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 animate-bounce-in">
            <h3 className="text-lg font-semibold text-center mb-6">评价这次交换</h3>

            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder="写下你的评价（可选）"
              rows={3}
              maxLength={100}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all resize-none mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 btn-press transition-all"
              >
                取消
              </button>
              <button
                onClick={handleSubmitRating}
                disabled={isProcessing}
                className="flex-1 py-3 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 disabled:opacity-50 btn-press transition-all"
              >
                提交评价
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
