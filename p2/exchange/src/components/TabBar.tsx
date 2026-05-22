import { Home, Plus, MessageCircle, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { cn } from '../utils';

const tabs = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/messages', icon: MessageCircle, label: '消息', hasPublish: true },
  { path: '/profile', icon: User, label: '我的' },
];

export default function TabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const unreadCount = useAppStore((state) => state.unreadCount);

  const isHidden = location.pathname.startsWith('/item/') || 
                   location.pathname.startsWith('/messages/');

  if (isHidden) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white tab-bar safe-bottom z-50">
      <div className="h-20 max-w-md mx-auto relative">
        <div className="absolute inset-x-0 bottom-0 h-16 flex items-center justify-around">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            const Icon = tab.icon;
            
            return (
              <div key={tab.path} className="relative flex items-center justify-center">
                {tab.hasPublish && (
                  <button
                    onClick={() => navigate('/publish')}
                    className="absolute -top-10 left-1/2 -translate-x-1/2 w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/30 btn-press transition-all hover:bg-primary-600 active:scale-95 z-10"
                  >
                    <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </button>
                )}
                
                <button
                  onClick={() => navigate(tab.path)}
                  className="flex flex-col items-center justify-center w-20 h-14 btn-press relative"
                >
                  <div className="relative">
                    <Icon
                      className={cn(
                        'w-6 h-6 transition-colors',
                        isActive ? 'text-primary-500' : 'text-gray-400'
                      )}
                    />
                    {tab.path === '/messages' && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-xs mt-1 transition-colors',
                      isActive ? 'text-primary-500 font-medium' : 'text-gray-400'
                    )}
                  >
                    {tab.label}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
