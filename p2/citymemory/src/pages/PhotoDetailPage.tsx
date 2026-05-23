import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, User, Clock, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { usePhotoStore } from '../store/photoStore';
import { formatDateTime, getDecadeLabel } from '../utils/dateFormat';
import { getDecadeColor } from '../types';

const PhotoDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedPhoto, comments, fetchPhotoById, fetchComments, addComment, loading, error } = usePhotoStore();
  const [showComparison, setShowComparison] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [newComment, setNewComment] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');

  useEffect(() => {
    if (id) {
      fetchPhotoById(id);
      fetchComments(id);
    }
  }, [id]);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() && id) {
      addComment(id, newComment, commentAuthor || '匿名用户');
      setNewComment('');
      setCommentAuthor('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-nostalgic-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-nostalgic-brown border-t-transparent mx-auto mb-4" />
          <p className="text-nostalgic-brown">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !selectedPhoto) {
    return (
      <div className="min-h-screen bg-nostalgic-cream flex flex-col items-center justify-center p-4">
        <p className="text-nostalgic-brown mb-4">照片不存在或加载失败</p>
        <Link to="/" className="btn-vintage">
          返回首页
        </Link>
      </div>
    );
  }

  const decadeColor = getDecadeColor(selectedPhoto.decade);

  return (
    <div className="min-h-screen bg-nostalgic-cream">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-nostalgic-brown hover:text-nostalgic-orange transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          返回
        </button>

        <div className="card-vintage overflow-hidden animate-fade-in">
          <div className="relative">
            {!showComparison ? (
              <div className="relative">
                <img
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.title}
                  className="w-full h-72 sm:h-96 object-cover sepia-filter"
                />
                <button
                  onClick={() => setShowComparison(true)}
                  className="absolute bottom-4 right-4 btn-vintage text-sm"
                >
                  今昔对比
                </button>
              </div>
            ) : (
              <div className="relative h-72 sm:h-96 overflow-hidden">
                <div className="absolute inset-0">
                  <div
                    className="absolute inset-0"
                    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                  >
                    <img
                      src={selectedPhoto.imageUrl}
                      alt="过去"
                      className="w-full h-full object-cover sepia-filter"
                    />
                    <div className="absolute top-4 left-4 tag-vintage bg-nostalgic-brown text-white">
                      {selectedPhoto.year}年
                    </div>
                  </div>
                  <div
                    className="absolute inset-0"
                    style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
                  >
                    <div className="w-full h-full bg-gradient-to-br from-nostalgic-brownLight to-nostalgic-brown flex items-center justify-center">
                      <div className="text-center text-nostalgic-cream">
                        <MapPin className="w-16 h-16 mx-auto mb-2 opacity-50" />
                        <p className="text-lg">当前街景</p>
                        <p className="text-sm opacity-70">拖动滑块对比今昔变化</p>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 tag-vintage bg-nostalgic-orange text-white">
                      现在
                    </div>
                  </div>
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-lg"
                    style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                  >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
                      <div className="flex gap-1">
                        <ChevronLeft className="w-5 h-5 text-nostalgic-brown" />
                        <ChevronRight className="w-5 h-5 text-nostalgic-brown" />
                      </div>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPosition}
                    onChange={(e) => setSliderPosition(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
                  />
                </div>
                <button
                  onClick={() => setShowComparison(false)}
                  className="absolute bottom-4 right-4 btn-vintage-outline text-sm bg-nostalgic-paper"
                >
                  关闭对比
                </button>
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-display font-bold text-nostalgic-brown mb-3">
                  {selectedPhoto.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-nostalgic-brownLight">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {selectedPhoto.year}年
                  </span>
                  <span
                    className="flex items-center gap-1"
                    style={{ color: decadeColor }}
                  >
                    <Clock className="w-4 h-4" />
                    {getDecadeLabel(selectedPhoto.decade)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {selectedPhoto.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {selectedPhoto.author}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-8 p-6 bg-nostalgic-cream/50 rounded-vintage border border-nostalgic-brownLighter/20">
              <p className="text-nostalgic-brown leading-relaxed text-lg whitespace-pre-wrap">
                {selectedPhoto.description}
              </p>
            </div>

            <div className="border-t border-nostalgic-brownLighter/20 pt-8">
              <h2 className="text-xl font-display font-semibold text-nostalgic-brown mb-6 flex items-center gap-2">
                <MessageCircle className="w-6 h-6" />
                回忆留言 ({comments.length})
              </h2>

              <form onSubmit={handleSubmitComment} className="mb-8">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={commentAuthor}
                    onChange={(e) => setCommentAuthor(e.target.value)}
                    placeholder="您的昵称（选填）"
                    className="input-vintage sm:w-40"
                  />
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="写下你的回忆..."
                    className="input-vintage flex-1"
                  />
                  <button
                    type="submit"
                    className="btn-vintage whitespace-nowrap"
                  >
                    发表
                  </button>
                </div>
              </form>

              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-center text-nostalgic-brownLight py-12">
                    还没有留言，来分享你的回忆吧~
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-4 bg-nostalgic-cream/30 rounded-vintage border border-nostalgic-brownLighter/20 animate-fade-in"
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-10 h-10 bg-nostalgic-brownLighter/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-nostalgic-brownLight" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-nostalgic-brown">
                              {comment.author}
                            </span>
                            <span className="text-xs text-nostalgic-brownLight">
                              {formatDateTime(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-nostalgic-brownLight mt-1">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoDetailPage;
