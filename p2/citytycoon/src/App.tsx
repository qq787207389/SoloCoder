import { useState } from 'react';
import { GameProvider } from './context/GameContext';
import { GameCanvas } from './components/GameCanvas';
import { Toolbar } from './components/Toolbar';
import { StatusBar } from './components/StatusBar';
import { InfoPanel } from './components/InfoPanel';
import { Notifications } from './components/Notification';
import { AdvisorPanel } from './components/AdvisorPanel';
import { GameOverScreen } from './components/GameOverScreen';

function GameContent() {
  const [showAdvisor, setShowAdvisor] = useState(false);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-900">
      <GameCanvas />
      <Toolbar />
      <StatusBar />
      <InfoPanel />
      <Notifications />

      <button
        onClick={() => setShowAdvisor(true)}
        className="absolute top-4 right-80 z-20 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-colors"
      >
        📊 顾问报告
      </button>

      <AdvisorPanel isOpen={showAdvisor} onClose={() => setShowAdvisor(false)} />
      <GameOverScreen />
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}

export default App;
