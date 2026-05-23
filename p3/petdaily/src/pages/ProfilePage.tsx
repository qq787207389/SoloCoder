import React, { useState, useEffect } from 'react';
import type { User, Pet, Post } from '../types.ts';
import { api } from '../services/api';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import PetCard from '../components/pets/PetCard';
import Avatar from '../components/common/Avatar';
import { Link } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'pets' | 'posts'>('pets');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userRes, petsRes, postsRes] = await Promise.all([
        api.getCurrentUser(),
        api.getPets(),
        api.getPosts(),
      ]);
      const currentUser = userRes.user;
      setUser(currentUser);
      setPets(petsRes.pets.filter((p) => p.userId === currentUser?.id));
      setPosts(postsRes.posts.filter((p) => p.userId === currentUser?.id));
    } catch (error) {
      console.error('Failed to load profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalLikes = posts.reduce((sum, post) => sum + post.likes.length, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-pink-500 text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      <Header title="个人中心" />

      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl p-6 shadow-soft mb-6">
          <div className="flex items-center gap-4">
            <Avatar src={user?.avatar || ''} alt={user?.name || ''} size="xl" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
              <p className="text-gray-500 text-sm">毛孩子铲屎官</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-500">{pets.length}</div>
              <div className="text-sm text-gray-500">毛孩子</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-500">{posts.length}</div>
              <div className="text-sm text-gray-500">动态</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-500">{totalLikes}</div>
              <div className="text-sm text-gray-500">获赞</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft mb-6 overflow-hidden">
          <div className="flex">
            <button
              onClick={() => setActiveTab('pets')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'pets'
                  ? 'text-pink-500 border-b-2 border-pink-500 bg-pink-50/50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🐾 我的宠物
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'posts'
                  ? 'text-pink-500 border-b-2 border-pink-500 bg-pink-50/50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📝 我的动态
            </button>
          </div>

          <div className="p-4">
            {activeTab === 'pets' && (
              <div>
                {pets.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🐾</div>
                    <p className="text-gray-500 text-sm">还没有添加宠物</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {pets.map((pet) => (
                      <PetCard key={pet.id} pet={pet} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'posts' && (
              <div>
                {posts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📝</div>
                    <p className="text-gray-500 text-sm">还没有发布动态</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <Link
                        key={post.id}
                        to={`/pet/${post.petId}`}
                        className="block bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex gap-3">
                          {post.images.length > 0 && (
                            <img
                              src={post.images[0]}
                              alt="post"
                              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 line-clamp-2 mb-1">
                              {post.content}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                              <span>❤️ {post.likes.length}</span>
                              <span>💬 {post.comments.length}</span>
                              <span>
                                {new Date(post.createdAt).toLocaleDateString('zh-CN')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">⚙️ 设置</h3>
          </div>
          <div className="divide-y divide-gray-100">
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <span className="flex items-center gap-3">
                <span>🔔</span>
                <span>消息通知</span>
              </span>
              <span className="text-gray-400">›</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <span className="flex items-center gap-3">
                <span>🎨</span>
                <span>主题设置</span>
              </span>
              <span className="text-gray-400">›</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <span className="flex items-center gap-3">
                <span>❓</span>
                <span>帮助与反馈</span>
              </span>
              <span className="text-gray-400">›</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <span className="flex items-center gap-3">
                <span>ℹ️</span>
                <span>关于我们</span>
              </span>
              <span className="text-gray-400">›</span>
            </button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default ProfilePage;
