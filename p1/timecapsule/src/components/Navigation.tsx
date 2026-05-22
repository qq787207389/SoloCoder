import React from 'react';
import { motion } from 'framer-motion';
import { Globe, PlusCircle, User } from 'lucide-react';
import { useCapsuleStore } from '../store/useCapsuleStore';

export const Navigation: React.FC = () => {
  const { currentView, setCurrentView, currentUser } = useCapsuleStore();

  const navItems = [
    { id: 'plaza' as const, icon: Globe, label: '广场' },
    { id: 'create' as const, icon: PlusCircle, label: '创建' },
    { id: 'profile' as const, icon: User, label: '我的' },
  ];

  const handleNavClick = (id: 'plaza' | 'create' | 'profile') => {
    if (id === 'create' && !currentUser) {
      alert('请先在"我的"页面设置昵称');
      return;
    }
    setCurrentView(id);
  };

  if (currentView === 'detail') return null;

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50"
    >
      <div className="glass border-t border-warm-200/50">
        <div className="max-w-lg mx-auto px-4 py-2">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className="relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-xl bg-warm-500/20"
                      transition={{ type: 'spring', bounce: 0.5 }}
                    />
                  )}
                  <Icon
                    className={`w-6 h-6 relative z-10 transition-colors ${
                      isActive ? 'text-warm-600' : 'text-warm-400'
                    }`}
                  />
                  <span
                    className={`text-xs font-medium relative z-10 transition-colors ${
                      isActive ? 'text-warm-700' : 'text-warm-400'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};
