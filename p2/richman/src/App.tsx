import { useState } from 'react';
import { StartScreen } from './components/StartScreen';
import { Game } from './components/Game';
function App() {
 const [gameStarted, setGameStarted] = useState(false);
 const [playerNames, setPlayerNames] = useState<string[]>([]);
 const [aiCount, setAiCount] = useState(0);
 const handleStartGame = (names: string[], ai: number) => {
 setPlayerNames(names);
 setAiCount(ai);
 setGameStarted(true);
 };
 if (!gameStarted) {
 return <StartScreen onStartGame={handleStartGame}/>;
 }
 return <Game playerNames={playerNames} aiCount={aiCount}/>;
}
export default App;
