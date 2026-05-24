import { useState } from 'react';
import GameCanvas from '@/components/GameCanvas';
import StatusBar from '@/components/StatusBar';
import Toolbar from '@/components/Toolbar';
import InfoPanel from '@/components/InfoPanel';
import SpellBar from '@/components/SpellBar';
import GameOverModal from '@/components/GameOverModal';
import { SpellType } from '@/types/game';

export default function Home() {
  const [selectedSpell, setSelectedSpell] = useState<SpellType | null>(null);

  const handleSpellUsed = () => {
    setSelectedSpell(null);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-950 overflow-hidden">
      <StatusBar />

      <div className="flex-1 flex overflow-hidden">
        <Toolbar />

        <div className="flex-1 relative">
          <GameCanvas selectedSpell={selectedSpell} onSpellUsed={handleSpellUsed} />
        </div>

        <InfoPanel />
      </div>

      <SpellBar selectedSpell={selectedSpell} onSelectSpell={setSelectedSpell} />

      <GameOverModal />
    </div>
  );
}
