import { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Package, Music, LogOut, BarChart3 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { SalesDashboard } from '@/components/admin/SalesDashboard';
import { InventoryManager } from '@/components/admin/InventoryManager';
import { ArtistManager } from '@/components/admin/ArtistManager';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'artists', label: 'Artists', icon: Music },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { logout, user } = useStore();

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-4">You need to be an admin to access this page.</p>
          <button
            onClick={() => document.dispatchEvent(new CustomEvent('open-login'))}
            className="px-6 py-2 bg-gradient-festival text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Login as Admin
          </button>
        </motion.div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <SalesDashboard />;
      case 'inventory':
        return <InventoryManager />;
      case 'artists':
        return <ArtistManager />;
      default:
        return <SalesDashboard />;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="flex">
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 250, opacity: 1 }}
          className="fixed left-0 top-0 bottom-0 bg-[#1a1a2e] border-r border-white/10 z-40"
        >
          <div className="p-6 border-b border-white/10">
            <h1 className="text-xl font-bold text-gradient">WaveStorm</h1>
            <p className="text-gray-400 text-sm">Admin Panel</p>
          </div>
          
          <nav className="p-4">
            <div className="space-y-2">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === item.id
                        ? 'bg-festival-purple/20 text-festival-purple'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </motion.aside>

        <main className="ml-250 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-white">
                {navItems.find(n => n.id === activeTab)?.label}
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-festival-purple" />
                  <span className="text-gray-400 text-sm">Live Analytics</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-festival flex items-center justify-center">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>

            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
