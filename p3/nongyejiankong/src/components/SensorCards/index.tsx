import React from 'react';
import { SensorCard } from './SensorCard';
import { useAppContext } from '../../store/AppContext';
import './SensorCards.scss';

export const SensorCards: React.FC = () => {
  const { state, selectSensor } = useAppContext();

  return (
    <div className="sensor-cards">
      {state.sensors.map((sensor) => (
        <SensorCard
          key={sensor.id}
          sensor={sensor}
          onClick={() => selectSensor(sensor.id)}
        />
      ))}
    </div>
  );
};
