import React from 'react';
import { timeToPixels } from '../../types';

interface PlayheadProps {
  currentTime: number;
  zoom: number;
  timelineWidth: number;
}

export const Playhead: React.FC<PlayheadProps> = ({
  currentTime,
  zoom,
  timelineWidth,
}) => {
  const left = timeToPixels(currentTime, zoom);

  return (
    <div
      className="absolute top-0 z-20 pointer-events-none"
      style={{
        left: `${left}px`,
        transform: 'translateX(-50%)',
        height: '100%',
      }}
    >
      <div className="relative w-4 h-4">
        <div
          className="absolute top-1/2 left-1/2 w-0 h-0 -translate-x-1/2"
          style={{
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid #ef4444',
          }}
        />
      </div>
      <div
        className="w-0.5 bg-red-500 absolute top-4 left-1/2 -translate-x-1/2"
        style={{ height: `calc(100% - 16px)` }}
      />
    </div>
  );
};
