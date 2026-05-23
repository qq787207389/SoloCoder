import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Post, Pet, User } from '../../types.ts';
import { api } from '../../services/api';
import Avatar from '../common/Avatar';

interface PostCardProps {
  post: Post;
  pet?: Pet;
  user?: User;
  showPetInfo?: boolean;
  onUpdate?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, pet, user, showPetInfo = true, onUpdate }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(post.comments);
  const [showFishAnimation, setShowFishAnimation] = useState(false);

  const handleLike = async () => {
    try {
      const res = await api.likePost(post.id);
      setLiked(res.post.likes.length > likeCount);
      setLikeCount(res.post.likes.length);
      if (res.post.likes.length > likeCount) {
        setShowFishAnimation(true);
        setTimeout(() => setShowFishAnimation(false), 1000);
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const res = await api.addComment(post.id, comment);
      setComments([...comments, res.comment]);
      setComment('');
      onUpdate?.();
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft overflow-hidden fade-in">
      {showPetInfo && (
        <div className="p-4 flex items-center gap-3">
          {pet && (
            <Link to={`/pet/${pet.id}`}>
              <Avatar src={pet.avatar} alt={pet.name} size="md" />
            </Link>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {pet && (
                <Link to={`/pet/${pet.id}`} className="font-semibold text-gray-800 hover:text-pink-500">
                  {pet.name}
                </Link>
              )}
              {(pet?.tags || []).slice(0, 1).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-pink-50 text-pink-500 rounded-full text-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-400">{formatDate(post.createdAt)}</p>
          </div>
        </div>
      )}

      {post.images.length > 0 && (
        <div className="relative">
          <img
            src={post.images[0]}
            alt="post"
            className="w-full aspect-square object-cover"
          />
          {showFishAnimation && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className="absolute text-3xl fish-fall"
                  style={{
                    left: `${20 + i * 15}%`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                >
                  🐟
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        <p className="text-gray-700 mb-3 whitespace-pre-wrap">{post.content}</p>

        {post.weight && (
          <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
            <span>⚖️ 体重：{post.weight}kg</span>
          </div>
        )}

        <div className="flex flex-wrap gap-1 mb-3">
          {(post.tags || []).map((tag) => (
            <Link
              key={tag}
              to={`/square?tag=${tag}`}
              className="px-2 py-1 bg-pink-50 text-pink-500 rounded-full text-xs hover:bg-pink-100 transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
              liked
                ? 'text-pink-500 bg-pink-50'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <span className={`text-xl ${liked ? 'heart-beat' : ''}`}>
              {liked ? '❤️' : '🤍'}
            </span>
            <span className="text-sm font-medium">{likeCount}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <span className="text-xl">💬</span>
            <span className="text-sm font-medium">{comments.length}</span>
          </button>

          <button className="flex items-center gap-2 px-3 py-1.5 rounded-full text-gray-500 hover:bg-gray-50 transition-colors">
            <span className="text-xl">↗️</span>
            <span className="text-sm font-medium">分享</span>
          </button>
        </div>

        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
              {comments.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-4">暂无评论，来说两句吧~</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="flex gap-2">
                    <Avatar src={c.userAvatar} alt={c.userName} size="sm" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">{c.userName}</span>
                        <span className="text-xs text-gray-400">{formatDate(c.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-600">{c.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="写下你的评论..."
                className="flex-1 px-3 py-2 rounded-full bg-gray-50 border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 text-sm transition-all"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-full text-sm font-medium hover:from-pink-500 hover:to-pink-600 transition-all"
              >
                发送
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
