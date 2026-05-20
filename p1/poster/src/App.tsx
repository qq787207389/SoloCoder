import { useEffect } from 'react';
import Header from './components/Header';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import LayerPanel from './components/LayerPanel';
import { useEditorStore } from './stores/useEditorStore';

export default function App() {
  const { darkMode } = useEditorStore();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-slate-900">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <LayerPanel />
        
        <main className="flex-1 overflow-hidden">
          <Canvas />
        </main>
        
        <Toolbar />
      </div>
    </div>
  );
}
