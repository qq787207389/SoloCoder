import React from 'react';
import type { WeatherCondition } from '../types';

interface WeatherIconProps {
  condition: WeatherCondition;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

const iconPaths: Record<WeatherCondition, React.ReactNode> = {
  sunny: (
    <>
      <circle cx="12" cy="12" r="5" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1.5" />
      <g stroke="#F59E0B" strokeWidth="2" strokeLinecap="round">
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </g>
    </>
  ),
  cloudy: (
    <>
      <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" fill="#9CA3AF" />
      <path d="M7 19.9A8 8 0 019 4a8 8 0 017.74 6H18a5 5 0 010 10H7z" fill="none" stroke="#6B7280" strokeWidth="1" />
    </>
  ),
  rainy: (
    <>
      <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" fill="#6B7280" />
      <g stroke="#60A5FA" strokeWidth="2" strokeLinecap="round">
        <line x1="8" y1="19" x2="8" y2="22" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="16" y1="19" x2="16" y2="22" />
      </g>
    </>
  ),
  snowy: (
    <>
      <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="1" />
      <g fill="#FFFFFF">
        <circle cx="8" cy="20" r="1" />
        <circle cx="12" cy="22" r="1" />
        <circle cx="16" cy="20" r="1" />
        <circle cx="10" cy="21" r="0.8" />
        <circle cx="14" cy="21" r="0.8" />
      </g>
    </>
  ),
  windy: (
    <>
      <g stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round">
        <path d="M9.59 4.59A2 2 0 1111 8H2" />
        <path d="M12.59 19.41A2 2 0 1014 16H2" />
        <path d="M17.73 7.73A2.5 2.5 0 1119.5 12H2" />
        <path d="M17.73 16.27A2.5 2.5 0 1019.5 12H2" />
      </g>
    </>
  ),
  foggy: (
    <>
      <g stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round">
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="3" y1="14" x2="21" y2="14" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </g>
      <circle cx="12" cy="6" r="3" fill="#D1D5DB" />
    </>
  ),
};

export function WeatherIcon({ condition, size = 'md' }: WeatherIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={sizeClasses[size]}>
      {iconPaths[condition]}
    </svg>
  );
}
