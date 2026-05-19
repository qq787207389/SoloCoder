import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import PlayerBar from './components/PlayerBar';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import LibraryPage from './pages/LibraryPage';
import FavoritesPage from './pages/FavoritesPage';
import RecentPage from './pages/RecentPage';
import './index.css';

function App() {
  useAudioPlayer();

  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/recent" element={<RecentPage />} />
          </Routes>
        </main>
        <MobileNav />
        <PlayerBar />
      </div>
    </Router>
  );
}

export default App;
