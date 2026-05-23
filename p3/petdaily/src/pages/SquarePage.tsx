import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Post, Pet } from '../types.ts';
import { api } from '../services/api';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import PostCard from '../components/posts/PostCard';
import Avatar from '../components/common/Avatar';
import { Link } from 'react-router-dom';

const SquarePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [hotTags, setHotTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const tagFilter = searchParams.get('tag');

  useEffect(() => {
    loadData();
  }, [tagFilter]);

  const loadData = async () => {
    try {
      const [postsRes, petsRes] = await Promise.all([
        api.getPosts(tagFilter ? { tag: tagFilter } : undefined),
        api.getPets(),
      ]);
      setPosts(postsRes.posts);
      setPets(petsRes.pets);

      const allTags = postsRes.posts.flatMap((p) => p.tags || []);
      const tagCounts: Record<string, number> = {};
      allTags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
      const sortedTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([tag]) => tag);
      setHotTags(sortedTags);
    } catch (error) {
      console.error('Failed to load square data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPetById = (petId: string) => pets.find((p) => p.id === petId);

  const handleTagClick = (tag: string) => {
    if (tagFilter === tag) {
      setSearchParams({});
    } else {
      setSearchParams({ tag });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-pink-500 text-lg">加载中...</div>
      </div>
    );
  }

  const leftColumn = posts.filter((_, i) => i % 2 === 0);
  const rightColumn = posts.filter((_, i) => i % 2 === 1);

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      <Header title="萌宠广场" />

      <main className="max-w-lg mx-auto px-4 py-4">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🔥</span>
            <span className="font-semibold text-gray-800">热门标签</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {hotTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  tagFilter === tag
                    ? 'bg-pink-500 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-pink-50 shadow-sm'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {tagFilter && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-gray-500">筛选标签：</span>
            <span className="px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-sm">
              #{tagFilter}
            </span>
            <button
              onClick={() => setSearchParams({})}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        )}

        {posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🐾</div>
            <p className="text-gray-500">还没有动态哦</p>
          </div>
        ) : (
          <div className="flex gap-4">
            <div className="flex-1 space-y-4">
              {leftColumn.map((post) => (
                <Link to={`/pet/${post.petId}`} key={post.id}>
                  <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
                    {post.images.length > 0 && (
                      <img
                        src={post.images[0]}
                        alt="post"
                        className="w-full aspect-square object-cover"
                      />
                    )}
                    <div className="p-3">
                      <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-2">
                        <Avatar
                          src={getPetById(post.petId)?.avatar || ''}
                          size="sm"
                        />
                        <span className="text-xs text-gray-500">
                          {getPetById(post.petId)?.name}
                        </span>
                        <span className="ml-auto text-xs text-gray-400 flex items-center gap-1">
                          ❤️ {post.likes.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="flex-1 space-y-4">
              {rightColumn.map((post) => (
                <Link to={`/pet/${post.petId}`} key={post.id}>
                  <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
                    {post.images.length > 0 && (
                      <img
                        src={post.images[0]}
                        alt="post"
                        className="w-full aspect-square object-cover"
                      />
                    )}
                    <div className="p-3">
                      <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-2">
                        <Avatar
                          src={getPetById(post.petId)?.avatar || ''}
                          size="sm"
                        />
                        <span className="text-xs text-gray-500">
                          {getPetById(post.petId)?.name}
                        </span>
                        <span className="ml-auto text-xs text-gray-400 flex items-center gap-1">
                          ❤️ {post.likes.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {posts.length > 0 && (
          <div className="mt-8">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span>📝</span> 最新动态
            </h3>
            <div className="space-y-4">
              {posts.slice(0, 5).map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  pet={getPetById(post.petId)}
                  onUpdate={loadData}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default SquarePage;
