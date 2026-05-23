import { useState } from 'react';
import { X, Calendar, MapPin, User, Clock, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import type { Photo, Comment } from '../../types';
import { formatDateTime, getDecadeLabel } from '../../utils/dateFormat';
import { getDecadeColor } from '../../types';

interface PhotoDetailProps {
  photo: Photo;
  comments: Comment[];
  onClose: () => void;
  onAddComment: (content: string, author: string) => void;
}

const PhotoDetail = ({ photo, comments, onClose, onAddComment }: PhotoDetailProps) => {
  const [showComparison, setShowComparison] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [sliderPosition, setSliderPosition] = useState(50);

  const decadeColor = getDecadeColor(photo.decade);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment, commentAuthor || '匿名用户');
      setNewComment('');
      setCommentAuthor('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nostalgic-brown/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-nostalgic-paper rounded-vintage shadow-paper-hover overflow-hidden flex flex-col animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-nostalgic-paper/80 rounded-full text-nostalgic-brown hover:bg-nostalgic-creamDark transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 overflow-y-auto scrollbar-vintage">
          <div className="relative">
            {!showComparison ? (
              <div className="relative">
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-64 sm:h-80 object-cover sepia-filter"
                />
                <button
                  onClick={() => setShowComparison(true)}
                  className="absolute bottom-4 right-4 btn-vintage text-sm"
                >
                  今昔对比
                </button>
              </div>
            ) : (
              <div className="relative h-64 sm:h-80 overflow-hidden">
                <div className="absolute inset-0">
                  <div
                    className="absolute inset-0"
                    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                  >
                    <img
                      src={photo.imageUrl}
                      alt="过去"
                      className="w-full h-full object-cover sepia-filter"
                    />
                    <div className="absolute top-4 left-4 tag-vintage bg-nostalgic-brown text-white">
                      {photo.year}年
                    </div>
                  </div>
                  <div
                    className="absolute inset-0"
                    style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
                  >
                    <div className="w-full h-full bg-gradient-to-br from-nostalgic-brownLight to-nostalgic-brown flex items-center justify-center">
                      <div className="text-center text-nostalgic-cream">
                        <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">当前街景</p>
                        <p className="text-xs opacity-70">拖动滑块对比</p>
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
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
                      <div className="flex gap-0.5">
                        <ChevronLeft className="w-4 h-4 text-nostalgic-brown" />
                        <ChevronRight className="w-4 h-4 text-nostalgic-brown" />
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

          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-display font-bold text-nostalgic-brown mb-2">
                  {photo.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-sm text-nostalgic-brownLight">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {photo.year}年
                  </span>
                  <span
                    className="flex items-center gap-1"
                    style={{ color: decadeColor }}
                  >
                    <Clock className="w-4 h-4" />
                    {getDecadeLabel(photo.decade)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {photo.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {photo.author}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6 p-4 bg-nostalgic-cream/50 rounded-vintage border border-nostalgic-brownLighter/20">
              <p className="text-nostalgic-brown leading-relaxed whitespace-pre-wrap">
                {photo.description}
              </p>
            </div>

            <div className="border-t border-nostalgic-brownLighter/20 pt-6">
              <h3 className="text-lg font-display font-semibold text-nostalgic-brown mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                回忆留言 ({comments.length})
              </h3>

              <form onSubmit={handleSubmitComment} className="mb-6">
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

              <div className="space-y-3">
                {comments.length === 0 ? (
                  <p className="text-center text-nostalgic-brownLight text-sm py-8">
                    还没有留言，来分享你的回忆吧~
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-4 bg-nostalgic-cream/30 rounded-vintage border border-nostalgic-brownLighter/20 animate-fade-in"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <div className="w-8 h-8 bg-nostalgic-brownLighter/30 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-nostalgic-brownLight" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-nostalgic-brown text-sm">
                              {comment.author}
                            </span>
                            <span className="text-xs text-nostalgic-brownLight">
                              {formatDateTime(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-nostalgic-brownLight text-sm mt-1">
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

export default PhotoDetail;
