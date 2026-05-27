import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import MainMenu from './pages/MainMenu';
import Workshop from './pages/Workshop';
import Battle from './pages/Battle';
import Shop from './pages/Shop';

const SAVE_VERSION = 'v3';

export default function App() {
  const { currentPage } = useGameStore();

  useEffect(() => {
    const savedVersion = localStorage.getItem('mech-game-version');
    if (savedVersion !== SAVE_VERSION) {
      localStorage.removeItem('mech-game-storage');
      localStorage.removeItem('mech-game-saves');
      localStorage.setItem('mech-game-version', SAVE_VERSION);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        useGameStore.getState().setCurrentPage('menu');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'menu':
        return <MainMenu />;
      case 'workshop':
        return <Workshop />;
      case 'battle':
        return <Battle />;
      case 'shop':
        return <Shop />;
      default:
        return <MainMenu />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
      {renderPage()}
    </div>
  );
}
