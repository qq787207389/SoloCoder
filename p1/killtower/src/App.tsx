import { AnimatePresence } from 'framer-motion';
import { useGameStore } from './store/useGameStore';
import { MainMenu } from './pages/MainMenu';
import { MapView } from './components/map/MapView';
import { BattleScene } from './components/battle/BattleScene';
import { RewardScreen } from './pages/RewardScreen';
import { ShopScreen } from './pages/ShopScreen';
import { CampfireScreen } from './pages/CampfireScreen';
import { EventScreen } from './pages/EventScreen';
import { DefeatScreen } from './pages/DefeatScreen';
import { VictoryScreen } from './pages/VictoryScreen';

function App() {
  const { phase } = useGameStore();

  const renderPhase = () => {
    switch (phase) {
      case 'menu':
      case 'characterSelect':
        return <MainMenu />;
      case 'map':
        return <MapView />;
      case 'battle':
        return <BattleScene />;
      case 'reward':
        return <RewardScreen />;
      case 'shop':
        return <ShopScreen />;
      case 'campfire':
        return <CampfireScreen />;
      case 'event':
        return <EventScreen />;
      case 'defeat':
        return <DefeatScreen />;
      case 'victory':
        return <VictoryScreen />;
      default:
        return <MainMenu />;
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-gray-950">
      <AnimatePresence mode="wait">
        {renderPhase()}
      </AnimatePresence>
    </div>
  );
}

export default App;
