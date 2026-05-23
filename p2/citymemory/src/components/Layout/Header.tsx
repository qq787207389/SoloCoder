import { Link, useLocation } from 'react-router-dom';
import { Map, Clock, Upload, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Header = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', label: '地图浏览', icon: Map },
    { path: '/timeline', label: '时间轴', icon: Clock },
    { path: '/upload', label: '上传记忆', icon: Upload },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-nostalgic-paper/95 backdrop-blur-sm border-b border-nostalgic-brownLighter/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-nostalgic-brown rounded-full flex items-center justify-center">
              <Map className="w-6 h-6 text-nostalgic-cream" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-nostalgic-brown tracking-wide">
                城市记忆
              </h1>
              <p className="text-xs text-nostalgic-brownLight">City Memory</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-vintage transition-all duration-200 ${
                    active
                      ? 'bg-nostalgic-brown text-nostalgic-cream shadow-paper'
                      : 'text-nostalgic-brown hover:bg-nostalgic-creamDark'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <button
            className="md:hidden p-2 rounded-vintage text-nostalgic-brown hover:bg-nostalgic-creamDark"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-nostalgic-brownLighter/30">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-vintage transition-all duration-200 ${
                    active
                      ? 'bg-nostalgic-brown text-nostalgic-cream'
                      : 'text-nostalgic-brown hover:bg-nostalgic-creamDark'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              );
            })}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
