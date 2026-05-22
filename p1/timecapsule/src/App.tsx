import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useCapsuleStore } from './store/useCapsuleStore';
import { Plaza } from './components/Plaza';
import { CreateCapsule } from './components/CreateCapsule';
import { Profile } from './components/Profile';
import { CapsuleDetail } from './components/CapsuleDetail';
import { Navigation } from './components/Navigation';

function App() {
  const { currentView } = useCapsuleStore();

  const renderView = () => {
    switch (currentView) {
      case 'plaza':
        return <Plaza key="plaza" />;
      case 'create':
        return <CreateCapsule key="create" />;
      case 'profile':
        return <Profile key="profile" />;
      case 'detail':
        return <CapsuleDetail key="detail" />;
      default:
        return <Plaza key="plaza" />;
    }
  };

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {renderView()}
      </AnimatePresence>
      <Navigation />
    </div>
  );
}

export default App;
