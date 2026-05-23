import React from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, showBack = false, rightAction }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-pink-100">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => window.history.back()}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-pink-50 text-gray-600"
            >
              ←
            </button>
          )}
          <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            {title}
          </h1>
        </div>
        {rightAction}
      </div>
    </header>
  );
};

export default Header;
