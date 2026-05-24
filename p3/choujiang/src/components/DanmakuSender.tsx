import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Participant } from '../types';

export default function DanmakuSender() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [name, setName] = useState('');
  const [phoneLastFour, setPhoneLastFour] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadParticipants();
  }, []);

  const loadParticipants = async () => {
    try {
      const data = await api.getParticipants();
      setParticipants(data);
    } catch (error) {
      console.error('Failed to load participants:', error);
    }
  };

  const handleVerify = () => {
    const participant = participants.find(
      (p) => p.name === name && p.phoneLastFour === phoneLastFour
    );
    if (participant) {
      setSelectedParticipant(participant);
      setError('');
    } else {
      setError('未找到参与人员，请检查信息是否正确');
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParticipant || !content.trim()) return;

    setLoading(true);
    setError('');

    try {
      await api.sendDanmaku(selectedParticipant.id, content.trim());
      setSuccess(true);
      setContent('');
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送失败');
    } finally {
      setLoading(false);
    }
  };

  const quickMessages = [
    '新年快乐！', '恭喜发财！', '万事如意！', '抽奖中大奖！',
    '活动太棒了！', '好运来！', '大家好！', '开心！'
  ];

  if (!selectedParticipant) {
    return (
      <div className="min-h-screen festival-bg flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">💬</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">发送弹幕</h1>
            <p className="text-gray-500">请先验证您的身份</p>
          </div>

          <div className="space-y-4">
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
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleVerify}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl font-bold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-[1.02] shadow-lg"
            >
              验证身份
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen festival-bg flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <div className="flex items-center gap-4 mb-6 pb-4 border-b">
          <img
            src={selectedParticipant.avatar}
            alt={selectedParticipant.name}
            className="w-14 h-14 rounded-full border-2 border-purple-400"
          />
          <div>
            <div className="font-bold text-lg text-gray-800">
              {selectedParticipant.name}
            </div>
            <div className="text-sm text-gray-500">已验证</div>
          </div>
          <button
            onClick={() => setSelectedParticipant(null)}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >
            切换
          </button>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              弹幕内容
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="输入您想说的话..."
              maxLength={50}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-lg resize-none h-24"
            />
            <div className="text-right text-sm text-gray-400 mt-1">
              {content.length}/50
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              快捷短语
            </label>
            <div className="flex flex-wrap gap-2">
              {quickMessages.map((msg) => (
                <button
                  key={msg}
                  type="button"
                  onClick={() => setContent(msg)}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors"
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 px-4 py-3 rounded-xl text-center animate-[fadeIn_0.3s_ease-out]">
              ✓ 发送成功！
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="w-full py-4 bg-gradient-to-r from-pink-500 to-orange-500 text-white text-xl font-bold rounded-xl hover:from-pink-600 hover:to-orange-600 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? '发送中...' : '发送弹幕 🚀'}
          </button>
        </form>
      </div>
    </div>
  );
}
