import { ArrowLeft, MessageCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { cn } from '../utils';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showMessage?: boolean;
  showProfile?: boolean;
  rightContent?: React.ReactNode;
  className?: string;
}

export default function Header({
  title,
  showBack = false,
  showMessage = false,
  showProfile = false,
  rightContent,
  className,
}: HeaderProps) {
  const navigate = useNavigate();
  const unreadCount = useAppStore((state) => state.unreadCount);

  return (
    <div
      className={cn(
        'sticky top-0 z-40 bg-warm-50/80 backdrop-blur-md border-b border-gray-100',
        className
      )}
    >
      <div className="flex items-center justify-between h-14 px-4 max-w-md mx-auto">
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full btn-press"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
          )}
          {title ? (
            <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔄</span>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                换享
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {rightContent}
          {showMessage && (
            <button
              onClick={() => navigate('/messages')}
              className="relative p-2 -mr-2 hover:bg-gray-100 rounded-full btn-press"
            >
              <MessageCircle className="w-6 h-6 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          )}
          {showProfile && (
            <button
              onClick={() => navigate('/profile')}
              className="p-2 -mr-2 hover:bg-gray-100 rounded-full btn-press"
            >
              <User className="w-6 h-6 text-gray-700" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
