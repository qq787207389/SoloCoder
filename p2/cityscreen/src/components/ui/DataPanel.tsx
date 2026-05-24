import { useCityStore } from '../../store/cityStore';
import { getAirQualityColor, getEnergyColor, getSeverityColor } from '../../utils/colorUtils';
import { BuildingDetail } from './BuildingDetail';
import './DataPanel.css';

export function DataPanel() {
  const selectedBuildingId = useCityStore((state) => state.selectedBuildingId);
  const buildings = useCityStore((state) => state.buildings);
  const districts = useCityStore((state) => state.districts);
  const airQuality = useCityStore((state) => state.airQuality);
  const energy = useCityStore((state) => state.energy);
  const safetyEvents = useCityStore((state) => state.safetyEvents);
  const timeOfDay = useCityStore((state) => state.timeOfDay);
  const isPaused = useCityStore((state) => state.isPaused);
  const togglePause = useCityStore((state) => state.togglePause);

  const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId);

  const avgAqi = airQuality.length > 0
    ? Math.round(airQuality.reduce((sum, aq) => sum + aq.aqi, 0) / airQuality.length)
    : 0;

  const totalEnergy = energy.reduce((sum, e) => sum + e.usage, 0);
  const activeEvents = safetyEvents.filter((e) => e.status === 'active');

  const formatTime = (time: number) => {
    const hours = Math.floor(time);
    const minutes = Math.floor((time % 1) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <div className="data-panel">
      <div className="panel-header">
        <h2>城市运行数据</h2>
        <div className="time-display">
          <span className="time-icon">🕐</span>
          <span className="time-value">{formatTime(timeOfDay)}</span>
          <button
            className={`pause-btn ${isPaused ? 'paused' : ''}`}
            onClick={togglePause}
          >
            {isPaused ? '▶️' : '⏸️'}
          </button>
        </div>
      </div>

      {selectedBuilding ? (
        <BuildingDetail building={selectedBuilding} />
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">平均 AQI</div>
              <div className="stat-value" style={{ color: getAirQualityColor(avgAqi) }}>
                {avgAqi}
              </div>
              <div className="stat-trend">空气质量指数</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">总能耗</div>
              <div className="stat-value" style={{ color: getEnergyColor(totalEnergy / 10) }}>
                {Math.round(totalEnergy)}
              </div>
              <div className="stat-trend">MW</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">活跃事件</div>
              <div className="stat-value" style={{ color: activeEvents.length > 0 ? '#e74c3c' : '#2ecc71' }}>
                {activeEvents.length}
              </div>
              <div className="stat-trend">安全事件</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">建筑数量</div>
              <div className="stat-value">{buildings.length}</div>
              <div className="stat-trend">城市建筑</div>
            </div>
          </div>

          <div className="section">
            <h3>区域数据</h3>
            <div className="district-list">
              {districts.map((district) => {
                const districtAQ = airQuality.find((aq) => aq.districtId === district.id);
                const districtEnergy = energy.find((e) => e.districtId === district.id);
                return (
                  <div key={district.id} className="district-item">
                    <div className="district-name">{district.name}</div>
                    <div className="district-stats">
                      <span
                        className="district-stat"
                        style={{ color: getAirQualityColor(districtAQ?.aqi || 50) }}
                      >
                        AQI: {Math.round(districtAQ?.aqi || 0)}
                      </span>
                      <span
                        className="district-stat"
                        style={{ color: getEnergyColor((districtEnergy?.usage || 0) / 10) }}
                      >
                        能耗: {Math.round(districtEnergy?.usage || 0)} MW
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {activeEvents.length > 0 && (
        <div className="section">
          <h3 className="warning-title">⚠️ 安全警报</h3>
          <div className="event-list">
            {activeEvents.slice(0, 5).map((event) => (
              <div
                key={event.id}
                className="event-item"
                style={{ borderLeftColor: getSeverityColor(event.severity) }}
              >
                <div className="event-type">
                  {event.type === 'accident' && '🚗'}
                  {event.type === 'fire' && '🔥'}
                  {event.type === 'crime' && '🚓'}
                  {event.type === 'emergency' && '🚑'}
                  <span style={{ marginLeft: 8 }}>{event.description}</span>
                </div>
                <div className="event-time">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
