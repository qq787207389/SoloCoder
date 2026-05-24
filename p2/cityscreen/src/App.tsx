import { useEffect, useRef } from 'react';
import { CityScene } from './components/3d/CityScene';
import { LayerSwitcher } from './components/ui/LayerSwitcher';
import { DataPanel } from './components/ui/DataPanel';
import { dataService } from './services/dataService';
import './App.css';

function App() {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      dataService.start();
    }

    return () => {
      dataService.stop();
    };
  }, []);

  return (
    <div className="app-container">
      <div className="scene-container">
        <CityScene />
      </div>

      <LayerSwitcher />
      <DataPanel />

      <div className="bottom-controls">
        <div className="control-hint">
          <span>🖱️ 左键拖动旋转</span>
          <span>滚轮缩放</span>
          <span>点击建筑查看详情</span>
        </div>
      </div>

      <div className="title-bar">
        <h1>🏙️ 智慧城市数据可视化平台</h1>
        <span className="subtitle">Smart City Data Visualization Dashboard</span>
      </div>
    </div>
  );
}

export default App;
