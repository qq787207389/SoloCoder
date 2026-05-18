import { useState, useEffect, useRef } from 'react';
import { Scene } from './components/Scene';
import { UIPanel } from './components/UIPanel';
import { ARViewer, isARSupported } from './components/ARViewer';
import type { ShoeConfig } from './types';
import { COLOR_PRESETS } from './types';

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState<ShoeConfig>({
    colors: COLOR_PRESETS.classic,
    visibility: {
      laces: true,
      logo: true,
      badge: true,
    },
    customTexture: null,
  });
  const [autoRotate, setAutoRotate] = useState(true);
  const [isAROpen, setIsAROpen] = useState(false);
  const [arSupported, setArSupported] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  useEffect(() => {
    setArSupported(isARSupported());
  }, []);

  const handleScreenshot = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `shoe-customizer-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <Scene config={config} autoRotate={autoRotate} />
      </div>

      <div className="absolute top-4 left-4 z-10">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl px-6 py-4 shadow-2xl border border-white/20">
          <h1 className="text-xl font-bold text-white tracking-tight">
            3D 鞋款定制器
          </h1>
          <p className="text-sm text-white/70 mt-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            拖拽旋转 • 滚轮缩放 • 右键平移
          </p>
        </div>
      </div>

      <UIPanel
        config={config}
        onConfigChange={setConfig}
        onScreenshot={handleScreenshot}
        onToggleFullscreen={handleToggleFullscreen}
        onOpenAR={() => setIsAROpen(true)}
        autoRotate={autoRotate}
        onToggleAutoRotate={() => setAutoRotate(!autoRotate)}
        arSupported={arSupported}
        isOpen={isPanelOpen}
        onToggleOpen={() => setIsPanelOpen(!isPanelOpen)}
      />

      <ARViewer
        config={config}
        isOpen={isAROpen}
        onClose={() => setIsAROpen(false)}
      />

      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-white/10 backdrop-blur-xl rounded-xl px-5 py-3 shadow-xl border border-white/20">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="w-3 h-3 bg-emerald-400 rounded-full block" />
              <span className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-75" />
            </div>
            <span className="text-sm font-medium text-white/90">实时渲染中</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
