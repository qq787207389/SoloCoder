import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Send, Image } from 'lucide-react';
import { useStore } from '@/store/useStore';

export const Community = () => {
  const [newPost, setNewPost] = useState('');
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState('');
  const { posts, addPost, likePost, addComment, likeComment, user } = useStore();

  const handleSubmitPost = () => {
    if (newPost.trim()) {
      addPost(newPost.trim());
      setNewPost('');
    }
  };

  const handleSubmitComment = (postId: string) => {
    if (commentContent.trim()) {
      addComment(postId, commentContent.trim());
      setCommentContent('');
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Community</h2>

      {user ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-white/5 rounded-xl border border-white/10"
        >
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-festival flex items-center justify-center flex-shrink-0">
              {user.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share your thoughts about WaveStorm..."
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-festival-purple transition-colors resize-none"
              />
              <div className="flex items-center justify-between mt-3">
                <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <Image className="w-5 h-5" />
                  Add Image
                </button>
                <button
                  onClick={handleSubmitPost}
                  disabled={!newPost.trim()}
                  className="px-6 py-2 bg-gradient-festival text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Post
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="p-6 bg-white/5 rounded-xl text-center">
          <p className="text-gray-400 mb-4">Login to join the conversation!</p>
          <button
            onClick={() => document.dispatchEvent(new CustomEvent('open-login'))}
            className="px-6 py-2 bg-gradient-festival text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Login Now
          </button>
        </div>
      )}

      <div className="space-y-4">
        {posts.map(post => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-white/5 rounded-xl border border-white/10"
          >
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-festival flex items-center justify-center flex-shrink-0">
                {post.username?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-white">{post.username}</span>
                  <span className="text-gray-500 text-sm">{formatTime(post.createdAt)}</span>
                </div>
                
                <p className="text-gray-300 mb-4">{post.content}</p>
                
                {post.imageUrl && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img
                      src={post.imageUrl}
                      alt="Post content"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                <div className="flex items-center gap-6">
                  <button
                    onClick={() => likePost(post.id)}
                    className={`flex items-center gap-2 transition-colors ${
                      post.likedBy.includes(user?.id || '')
                        ? 'text-festival-pink'
                        : 'text-gray-400 hover:text-festival-pink'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${post.likedBy.includes(user?.id || '') ? 'fill-current' : ''}`} />
                    <span>{post.likes}</span>
                  </button>
                  <button
                    onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>{post.comments.length}</span>
                  </button>
                </div>

                <AnimatePresence>
                  {expandedPost === post.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-white/10"
                    >
                      {post.comments.length > 0 && (
                        <div className="space-y-3 mb-4">
                          {post.comments.map(comment => (
                            <div key={comment.id} className="flex gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-festival flex items-center justify-center flex-shrink-0">
                                {comment.username?.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-white text-sm">{comment.username}</span>
                                  <span className="text-gray-500 text-xs">{formatTime(comment.createdAt)}</span>
                                </div>
                                <p className="text-gray-300 text-sm">{comment.content}</p>
                                <button
                                  onClick={() => likeComment(post.id, comment.id)}
                                  className={`flex items-center gap-1 mt-2 text-sm transition-colors ${
                                    comment.likedBy.includes(user?.id || '')
                                      ? 'text-festival-pink'
                                      : 'text-gray-500 hover:text-festival-pink'
                                  }`}
                                >
                                  <Heart className={`w-4 h-4 ${comment.likedBy.includes(user?.id || '') ? 'fill-current' : ''}`} />
                                  <span>{comment.likes}</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {user && (
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-festival flex items-center justify-center flex-shrink-0">
                            {user.username?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <input
                              type="text"
                              value={commentContent}
                              onChange={(e) => setCommentContent(e.target.value)}
                              placeholder="Write a comment..."
                              onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment(post.id)}
                              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-festival-purple transition-colors"
                            />
                            <button
                              onClick={() => handleSubmitComment(post.id)}
                              disabled={!commentContent.trim()}
                              className="mt-2 px-4 py-2 bg-festival-purple/20 text-festival-purple rounded-lg hover:bg-festival-purple/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Comment
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
