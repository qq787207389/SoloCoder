import type { LayerType } from '../../types';
import { useCityStore } from '../../store/cityStore';
import './LayerSwitcher.css';

const layers: Array<{ id: LayerType; name: string; icon: string }> = [
  { id: 'all', name: '综合视图', icon: '🏙️' },
  { id: 'traffic', name: '交通层', icon: '🚗' },
  { id: 'environment', name: '环境层', icon: '🌿' },
  { id: 'energy', name: '能耗层', icon: '⚡' },
  { id: 'safety', name: '安全层', icon: '🛡️' },
];

export function LayerSwitcher() {
  const activeLayer = useCityStore((state) => state.activeLayer);
  const setActiveLayer = useCityStore((state) => state.setActiveLayer);

  return (
    <div className="layer-switcher">
      <div className="layer-switcher-title">图层切换</div>
      <div className="layer-switcher-buttons">
        {layers.map((layer) => (
          <button
            key={layer.id}
            className={`layer-button ${activeLayer === layer.id ? 'active' : ''}`}
            onClick={() => setActiveLayer(layer.id)}
          >
            <span className="layer-icon">{layer.icon}</span>
            <span className="layer-name">{layer.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
