import { Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import Publish from '@/pages/Publish';
import ItemDetail from '@/pages/ItemDetail';
import Messages from '@/pages/Messages';
import MessageDetail from '@/pages/MessageDetail';
import Profile from '@/pages/Profile';
import TabBar from '@/components/TabBar';

export default function App() {
  return (
    <div className="min-h-screen bg-warm-50">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/publish" element={<Publish />} />
        <Route path="/item/:id" element={<ItemDetail />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/messages/:id" element={<MessageDetail />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <TabBar />
    </div>
  );
}
