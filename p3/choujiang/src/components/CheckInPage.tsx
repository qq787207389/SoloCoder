import { useState } from 'react';
import { api } from '../services/api';
import type { CheckInRecord } from '../types';

interface CheckInPageProps {
  onSuccess?: (record: CheckInRecord) => void;
}

export default function CheckInPage({ onSuccess }: CheckInPageProps) {
  const [name, setName] = useState('');
  const [phoneLastFour, setPhoneLastFour] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successRecord, setSuccessRecord] = useState<CheckInRecord | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const record = await api.checkIn(name, phoneLastFour);
      setSuccessRecord(record);
      setShowSuccess(true);
      onSuccess?.(record);
      
      setTimeout(() => {
        setShowSuccess(false);
        setName('');
        setPhoneLastFour('');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '签到失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen festival-bg flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">活动签到</h1>
          <p className="text-gray-500">请输入您的信息完成签到</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              姓名
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入您的姓名"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              手机号后四位
            </label>
            <input
              type="text"
              value={phoneLastFour}
              onChange={(e) => setPhoneLastFour(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="请输入手机号后四位"
              maxLength={4}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-lg tracking-widest"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? '签到中...' : '立即签到'}
          </button>
        </form>
      </div>

      {showSuccess && successRecord && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white rounded-3xl p-12 text-center animate-[bounce_0.5s_ease-in-out] shadow-2xl max-w-sm">
            <div className="text-8xl mb-6 animate-[sparkle_1s_ease-in-out_infinite]">✨</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">签到成功！</h2>
            <div className="mb-4">
              <img
                src={successRecord.participant.avatar}
                alt={successRecord.participant.name}
                className="w-24 h-24 rounded-full mx-auto border-4 border-green-400 shadow-lg"
              />
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {successRecord.participant.name}
            </p>
            <p className="text-gray-500 mt-2">欢迎参加活动！</p>
          </div>
        </div>
      )}
    </div>
  );
}
