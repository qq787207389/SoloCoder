import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Layout/Header';
import MapPage from './pages/MapPage';
import PhotoDetailPage from './pages/PhotoDetailPage';
import UploadPage from './pages/UploadPage';
import TimelinePage from './pages/TimelinePage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-nostalgic-cream font-body">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/photo/:id" element={<PhotoDetailPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
        </Routes>
      </main>
    </div>
    </Router>
  );
}

export default App;
