import React from 'react';
import { SensorData } from '../../types';
import { SENSOR_CONFIG } from '../../utils/constants';
import './SensorCard.scss';

interface SensorCardProps {
  sensor: SensorData;
  onClick?: () => void;
}

export const SensorCard: React.FC<SensorCardProps> = ({ sensor, onClick }) => {
  const config = SENSOR_CONFIG[sensor.type];
  
  const getStatusColor = () => {
    switch (sensor.status) {
      case 'danger': return '#e74c3c';
      case 'warning': return '#f39c12';
      default: return config.color;
    }
  };

  const getStatusText = () => {
    switch (sensor.status) {
      case 'danger': return '异常';
      case 'warning': return '预警';
      default: return '正常';
    }
  };

  const isAnimating = sensor.status !== 'normal';

  return (
    <div 
      className={`sensor-card ${isAnimating ? `sensor-card--${sensor.status}` : ''}`}
      onClick={onClick}
      style={{ borderColor: getStatusColor() }}
    >
      <div className="sensor-card__header">
        <span className="sensor-card__name">{sensor.name}</span>
        <span 
          className="sensor-card__status"
          style={{ backgroundColor: getStatusColor() }}
        >
          {getStatusText()}
        </span>
      </div>
      
      <div className="sensor-card__value-container">
        <span className="sensor-card__value" style={{ color: getStatusColor() }}>
          {sensor.value.toFixed(1)}
        </span>
        <span className="sensor-card__unit">{sensor.unit}</span>
      </div>
      
      <div className="sensor-card__threshold">
        <div className="sensor-card__threshold-bar">
          <div 
            className="sensor-card__threshold-fill"
            style={{ 
              width: `${Math.min(100, Math.max(0, 
                ((sensor.value - config.min) / (config.max - config.min)) * 100
              ))}%`,
              backgroundColor: getStatusColor()
            }}
          />
          <div className="sensor-card__threshold-marker sensor-card__threshold-marker--min" 
               style={{ left: `${((config.warningMin - config.min) / (config.max - config.min)) * 100}%` }} 
          />
          <div className="sensor-card__threshold-marker sensor-card__threshold-marker--max" 
               style={{ left: `${((config.warningMax - config.min) / (config.max - config.min)) * 100}%` }} 
          />
        </div>
        <div className="sensor-card__threshold-labels">
          <span>{config.min}</span>
          <span>{config.max}</span>
        </div>
      </div>
      
      <div className="sensor-card__footer">
        <span className="sensor-card__time">
          {new Date(sensor.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};
