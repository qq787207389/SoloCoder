import { Routes, Route } from 'react-router-dom'
import MainMenu from './components/MainMenu'
import GameRoom from './components/GameRoom'
import Game from './components/Game'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainMenu />} />
      <Route path="/room" element={<GameRoom />} />
      <Route path="/game" element={<Game />} />
    </Routes>
  )
}

export default App
