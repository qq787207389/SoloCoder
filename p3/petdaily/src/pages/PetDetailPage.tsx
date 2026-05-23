import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { Pet, Post, Reminder, User } from '../types.ts';
import { api } from '../services/api';
import Header from '../components/layout/Header';
import PostCard from '../components/posts/PostCard';
import PostForm from '../components/posts/PostForm';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';

const PetDetailPage: React.FC = () => {
  const { petId } = useParams<{ petId: string }>();
  const [pet, setPet] = useState<Pet | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'stats' | 'reminders'>('timeline');
  const [loading, setLoading] = useState(true);
  const [newReminder, setNewReminder] = useState({
    type: 'vaccine' as Reminder['type'],
    title: '',
    date: '',
    cycleDays: '',
    enabled: true,
  });

  useEffect(() => {
    if (petId) {
      loadData();
    }
  }, [petId]);

  const loadData = async () => {
    try {
      const [userRes, petsRes, postsRes, remindersRes] = await Promise.all([
        api.getCurrentUser(),
        api.getPets(),
        api.getPosts({ petId }),
        api.getReminders(petId),
      ]);
      const foundPet = petsRes.pets.find((p) => p.id === petId);
      setUser(userRes.user);
      setPet(foundPet || null);
      setPosts(postsRes.posts);
      setReminders(remindersRes.reminders);
    } catch (error) {
      console.error('Failed to load pet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (postData: Omit<Post, 'id' | 'likes' | 'comments' | 'createdAt'>) => {
    try {
      await api.createPost(postData);
      setShowPostForm(false);
      loadData();
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pet) return;
    try {
      await api.createReminder({
        petId: pet.id,
        type: newReminder.type,
        title: newReminder.title,
        date: newReminder.date,
        cycleDays: newReminder.cycleDays ? parseInt(newReminder.cycleDays) : undefined,
        enabled: newReminder.enabled,
      });
      setShowReminderForm(false);
      setNewReminder({ type: 'vaccine', title: '', date: '', cycleDays: '', enabled: true });
      loadData();
    } catch (error) {
      console.error('Failed to create reminder:', error);
    }
  };

  const toggleReminder = async (reminderId: string) => {
    try {
      const reminder = reminders.find((r) => r.id === reminderId);
      if (reminder) {
        await api.updateReminder(reminderId, { enabled: !reminder.enabled });
        loadData();
      }
    } catch (error) {
      console.error('Failed to toggle reminder:', error);
    }
  };

  const deleteReminder = async (reminderId: string) => {
    try {
      await api.deleteReminder(reminderId);
      loadData();
    } catch (error) {
      console.error('Failed to delete reminder:', error);
    }
  };

  const getAge = (birthday: string) => {
    const birth = new Date(birthday);
    const now = new Date();
    const diffMonth = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (diffMonth < 12) {
      return `${diffMonth}个月`;
    }
    const years = Math.floor(diffMonth / 12);
    const months = diffMonth % 12;
    return months > 0 ? `${years}岁${months}个月` : `${years}岁`;
  };

  const weightData = posts
    .filter((p) => p.weight)
    .map((p) => ({
      date: new Date(p.createdAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      weight: p.weight,
    }))
    .reverse();

  const getUpcomingReminders = () => {
    const today = new Date();
    return reminders
      .filter((r) => r.enabled)
      .map((r) => {
        const reminderDate = new Date(r.date);
        const diffDays = Math.ceil((reminderDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return { ...r, diffDays };
      })
      .filter((r) => r.diffDays <= 7 && r.diffDays >= 0)
      .sort((a, b) => a.diffDays - b.diffDays);
  };

  const reminderTypeLabels: Record<Reminder['type'], string> = {
    vaccine: '💉 疫苗',
    deworming: '🦠 驱虫',
    bath: '🛁 洗澡',
    other: '📅 其他',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-pink-500 text-lg">加载中...</div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500 text-lg">找不到这个宠物</div>
      </div>
    );
  }

  const upcomingReminders = getUpcomingReminders();

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      <Header title={pet.name} showBack />

      <div className="bg-white">
        <div className="max-w-lg mx-auto px-4 py-6">
          <div className="flex items-start gap-4">
            <Avatar src={pet.avatar} alt={pet.name} size="xl" className="float" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-800">{pet.name}</h1>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  pet.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
                }`}>
                  {pet.gender === 'male' ? '♂' : '♀'}
                </span>
              </div>
              <p className="text-gray-500 mb-2">{pet.breed} · {getAge(pet.birthday)}</p>
              <div className="flex flex-wrap gap-1">
                {(pet.tags || []).map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-pink-50 text-pink-500 rounded-full text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {upcomingReminders.length > 0 && (
            <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🔔</span>
                <span className="font-medium text-amber-800">即将到来的提醒</span>
              </div>
              <div className="space-y-2">
                {upcomingReminders.slice(0, 2).map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-sm">
                    <span className="text-amber-700">
                      {reminderTypeLabels[r.type]} - {r.title}
                    </span>
                    <span className="text-amber-600 font-medium">
                      {r.diffDays === 0 ? '今天' : `${r.diffDays}天后`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border-t border-gray-100 sticky top-14 z-30">
        <div className="max-w-lg mx-auto flex">
          {[
            { key: 'timeline', label: '📝 时间线' },
            { key: 'stats', label: '📊 成长统计' },
            { key: 'reminders', label: '🔔 提醒事项' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-pink-500 border-b-2 border-pink-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-4">
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-soft">
              <button
                onClick={() => setShowPostForm(true)}
                className="w-full flex items-center gap-3"
              >
                <Avatar src={pet.avatar} alt={pet.name} size="sm" />
                <span className="flex-1 text-left text-gray-400">分享{pet.name}的今天...</span>
                <span className="text-pink-500">📷</span>
              </button>
            </div>

            {posts.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📸</div>
                <p className="text-gray-500 mb-4">还没有记录哦</p>
                <Button onClick={() => setShowPostForm(true)}>
                  发布第一条动态
                </Button>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  pet={pet}
                  showPetInfo={false}
                  onUpdate={loadData}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-soft">
              <h3 className="font-semibold text-gray-800 mb-4">⚖️ 体重变化曲线</h3>
              {weightData.length < 2 ? (
                <div className="text-center py-12 text-gray-400">
                  <p>需要至少2条体重记录才能生成曲线</p>
                  <p className="text-sm mt-2">发布动态时记录体重吧~</p>
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightData}>
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12, fill: '#888' }}
                        axisLine={{ stroke: '#FFE4E6' }}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: '#888' }}
                        axisLine={{ stroke: '#FFE4E6' }}
                        unit="kg"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 4px 20px rgba(255, 154, 158, 0.2)',
                        }}
                        formatter={(value: number) => [`${value}kg`, '体重']}
                      />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#FF9A9E"
                        strokeWidth={3}
                        dot={{ fill: '#FF9A9E', strokeWidth: 2, r: 4 }}
                        activeDot={{ fill: '#FF7B7E', r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-4 shadow-soft text-center">
                <div className="text-3xl mb-2">📝</div>
                <div className="text-2xl font-bold text-pink-500">{posts.length}</div>
                <div className="text-sm text-gray-500">条动态</div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-soft text-center">
                <div className="text-3xl mb-2">⚖️</div>
                <div className="text-2xl font-bold text-pink-500">
                  {weightData.length > 0 ? `${weightData[weightData.length - 1].weight}kg` : '-'}
                </div>
                <div className="text-sm text-gray-500">最新体重</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reminders' && (
          <div className="space-y-4">
            <Button fullWidth onClick={() => setShowReminderForm(true)}>
              <span>+</span> 添加提醒
            </Button>

            {reminders.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔔</div>
                <p className="text-gray-500">还没有设置提醒</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className={`bg-white rounded-2xl p-4 shadow-soft ${
                      !reminder.enabled ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span>{reminderTypeLabels[reminder.type].split(' ')[0]}</span>
                          <span className="font-semibold text-gray-800">{reminder.title}</span>
                        </div>
                        <p className="text-sm text-gray-500">
                          📅 {reminder.date}
                          {reminder.cycleDays && ` · 每${reminder.cycleDays}天重复`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleReminder(reminder.id)}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            reminder.enabled ? 'bg-pink-500' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                              reminder.enabled ? 'translate-x-6' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => deleteReminder(reminder.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Modal
        isOpen={showPostForm}
        onClose={() => setShowPostForm(false)}
        title="发布动态"
      >
        <PostForm
          pet={pet}
          onSubmit={handleCreatePost}
          onCancel={() => setShowPostForm(false)}
        />
      </Modal>

      <Modal
        isOpen={showReminderForm}
        onClose={() => setShowReminderForm(false)}
        title="添加提醒"
      >
        <form onSubmit={handleCreateReminder} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">类型</label>
            <div className="grid grid-cols-4 gap-2">
              {(['vaccine', 'deworming', 'bath', 'other'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setNewReminder({ ...newReminder, type })}
                  className={`py-2 px-1 rounded-xl text-sm transition-colors ${
                    newReminder.type === type
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {reminderTypeLabels[type].split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
            <input
              type="text"
              value={newReminder.title}
              onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
              placeholder="比如：狂犬疫苗"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
            <input
              type="date"
              value={newReminder.date}
              onChange={(e) => setNewReminder({ ...newReminder, date: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              重复周期（天，可选）
            </label>
            <input
              type="number"
              value={newReminder.cycleDays}
              onChange={(e) => setNewReminder({ ...newReminder, cycleDays: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
              placeholder="输入天数，留空则不重复"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowReminderForm(false)}
              fullWidth
            >
              取消
            </Button>
            <Button type="submit" fullWidth>
              保存
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PetDetailPage;
