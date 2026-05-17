import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, Ticket, Calendar, MessageSquare, Settings } from 'lucide-react';
import { useStore } from '@/store/useStore';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, openLoginModal, openRegisterModal } = useStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Artists', href: '#artists' },
    { label: 'Tickets', href: '#tickets' },
    { label: 'Schedule', href: '#schedule' },
    { label: 'Community', href: '#community' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <motion.a
            href="#"
            className="text-2xl md:text-3xl font-bold text-gradient"
            whileHover={{ scale: 1.05 }}
          >
            WaveStorm
          </motion.a>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map(item => (
              <a
                key={item.label}
                href={item.href}
                className="text-gray-300 hover:text-white transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-festival transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <a href="#tickets" className="flex items-center gap-2 px-4 py-2 bg-festival-purple/20 text-festival-purple rounded-lg hover:bg-festival-purple/30 transition-colors">
                  <Ticket className="w-4 h-4" />
                  My Tickets
                </a>
                <a href="#community" className="p-2 text-gray-400 hover:text-white transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </a>
                {user.role === 'admin' && (
                  <a href="/admin" className="p-2 text-gray-400 hover:text-white transition-colors">
                    <Settings className="w-5 h-5" />
                  </a>
                )}
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  Logout
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-festival flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button
                  onClick={openLoginModal}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={openRegisterModal}
                  className="px-4 py-2 bg-gradient-festival text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pb-4"
            >
              <div className="flex flex-col gap-4">
                {navItems.map(item => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="text-gray-300 hover:text-white transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
                {user ? (
                  <>
                    <a href="#tickets" className="flex items-center gap-2 py-2 text-gray-300 hover:text-white">
                      <Ticket className="w-4 h-4" />
                      My Tickets
                    </a>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="py-2 text-red-400 hover:text-red-300"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        openLoginModal();
                        setIsMobileMenuOpen(false);
                      }}
                      className="py-2 text-gray-300 hover:text-white"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        openRegisterModal();
                        setIsMobileMenuOpen(false);
                      }}
                      className="py-2 bg-gradient-festival text-white rounded-lg"
                    >
                      Register
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};