import { useState, useEffect } from 'react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import type { BuildingData } from '../../types';
import { useCityStore } from '../../store/cityStore';
import { getEnergyColor } from '../../utils/colorUtils';

interface BuildingDetailProps {
  building: BuildingData;
}

interface HistoryData {
  time: string;
  energy: number;
}

export function BuildingDetail({ building }: BuildingDetailProps) {
  const { setSelectedBuilding } = useCityStore((state) => ({
    setSelectedBuilding: state.setSelectedBuilding,
  }));

  const [historyData, setHistoryData] = useState<HistoryData[]>([]);

  useEffect(() => {
    const initialData: HistoryData[] = [];
    for (let i = 11; i >= 0; i--) {
      initialData.push({
        time: `${i}h`,
        energy: 80 + Math.random() * 80,
      });
    }
    setHistoryData(initialData);

    const interval = setInterval(() => {
      setHistoryData((prev) => {
        const newData = [...prev.slice(1)];
        newData.push({
          time: 'now',
          energy: building.energyConsumption + (Math.random() - 0.5) * 20,
        });
        return newData;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [building.energyConsumption]);

  const typeLabels: Record<BuildingData['type'], string> = {
    residential: '住宅',
    commercial: '商业',
    industrial: '工业',
    public: '公共设施',
  };

  return (
    <div className="building-detail">
      <div className="building-header">
        <div>
          <h3>{building.name}</h3>
          <span className="building-type">{typeLabels[building.type]}</span>
        </div>
        <button className="close-btn" onClick={() => setSelectedBuilding(null)}>
          ✕
        </button>
      </div>

      <div className="building-stats">
        <div className="building-stat">
          <span className="stat-label">建筑高度</span>
          <span className="stat-value">{Math.round(building.baseHeight)}m</span>
        </div>
        <div className="building-stat">
          <span className="stat-label">占地面积</span>
          <span className="stat-value">{Math.round(building.width * building.depth)}m²</span>
        </div>
        <div className="building-stat">
          <span className="stat-label">人口</span>
          <span className="stat-value">{building.population}</span>
        </div>
      </div>

      <div className="energy-section">
        <div className="energy-header">
          <span className="energy-label">实时能耗</span>
          <span
            className="energy-value"
            style={{ color: getEnergyColor(building.energyConsumption) }}
          >
            {Math.round(building.energyConsumption)} kW
          </span>
        </div>
        <div className="energy-bar-container">
          <div
            className="energy-bar"
            style={{
              width: `${(building.energyConsumption / 200) * 100}%`,
              backgroundColor: getEnergyColor(building.energyConsumption),
            }}
          />
        </div>
      </div>

      <div className="chart-section">
        <h4>能耗趋势</h4>
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={historyData}>
            <defs>
              <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4a90d9" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#4a90d9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(10, 15, 30, 0.95)',
                border: '1px solid rgba(100, 150, 255, 0.3)',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Area
              type="monotone"
              dataKey="energy"
              stroke="#4a90d9"
              strokeWidth={2}
              fill="url(#energyGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="building-info">
        <div className="info-row">
          <span className="info-label">位置</span>
          <span className="info-value">
            X: {building.position.x.toFixed(1)}, Z: {building.position.z.toFixed(1)}
          </span>
        </div>
        <div className="info-row">
          <span className="info-label">所属区域</span>
          <span className="info-value">{building.districtId}</span>
        </div>
      </div>
    </div>
  );
}
