import { useState, useEffect } from 'react';
import { useStore } from './store';
import { api } from './services/api';
import HomePage from './components/HomePage';
import CheckInPage from './components/CheckInPage';
import BigScreen from './components/BigScreen';
import AdminPanel from './components/AdminPanel';
import DanmakuSender from './components/DanmakuSender';

function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const { setParticipants, setCheckIns, setWinners, setDanmakus, setPrizeSetting } = useStore();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [participants, checkIns, winners, danmakus, prizeSetting] = await Promise.all([
        api.getParticipants(),
        api.getCheckIns(),
        api.getWinners(),
        api.getDanmakus(),
        api.getPrizeSetting(),
      ]);
      setParticipants(participants);
      setCheckIns(checkIns);
      setWinners(winners);
      setDanmakus(danmakus);
      setPrizeSetting(prizeSetting);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleBack = () => {
    setCurrentPage('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'checkin':
        return (
          <div>
            <BackButton onClick={handleBack} />
            <CheckInPage />
          </div>
        );
      case 'bigscreen':
        return <BigScreen />;
      case 'admin':
        return (
          <div>
            <BackButton onClick={handleBack} />
            <AdminPanel />
          </div>
        );
      case 'danmaku':
        return (
          <div>
            <BackButton onClick={handleBack} />
            <DanmakuSender />
          </div>
        );
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return <div className="app">{renderPage()}</div>;
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed top-4 left-4 z-50 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-gray-700 hover:bg-white transition-colors flex items-center gap-2"
    >
      <span>←</span>
      <span>返回首页</span>
    </button>
  );
}

export default App;
