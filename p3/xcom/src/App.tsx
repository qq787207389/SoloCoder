import { MainMenu } from './components/MainMenu'
import { GameCanvas } from './components/GameCanvas'
import { BattleHUD } from './components/BattleHUD'
import { ActionLog } from './components/ActionLog'
import { GameOverScreen } from './components/GameOverScreen'
import { useGameStore } from './store/gameStore'

function App() {
  const { phase } = useGameStore()

  return (
    <div className="w-full h-screen overflow-hidden bg-slate-900">
      <GameCanvas />
      
      {phase === 'menu' && <MainMenu />}
      
      {(phase === 'player_turn' || phase === 'enemy_turn') && (
        <>
          <BattleHUD />
          <ActionLog />
        </>
      )}
      
      <GameOverScreen />
    </div>
  )
}

export default App
