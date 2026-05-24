import type { Position, Airport } from '../types';

const R = 6371;

const toRad = (deg: number): number => (deg * Math.PI) / 180;
const toDeg = (rad: number): number => (rad * 180) / Math.PI;

export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const calculateBearing = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
  let bearing = toDeg(Math.atan2(y, x));
  return (bearing + 360) % 360;
};

export const interpolateGreatCircle = (
  start: Position,
  end: Position,
  progress: number
): Position => {
  const d = calculateDistance(start.lat, start.lng, end.lat, end.lng) / R;
  const a = Math.sin((1 - progress) * d) / Math.sin(d);
  const b = Math.sin(progress * d) / Math.sin(d);

  const lat1 = toRad(start.lat);
  const lng1 = toRad(start.lng);
  const lat2 = toRad(end.lat);
  const lng2 = toRad(end.lng);

  const x = a * Math.cos(lat1) * Math.cos(lng1) + b * Math.cos(lat2) * Math.cos(lng2);
  const y = a * Math.cos(lat1) * Math.sin(lng1) + b * Math.cos(lat2) * Math.sin(lng2);
  const z = a * Math.sin(lat1) + b * Math.sin(lat2);

  const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
  const lng = Math.atan2(y, x);

  return {
    lat: toDeg(lat),
    lng: toDeg(lng),
    timestamp: start.timestamp + (end.timestamp - start.timestamp) * progress
  };
};

export const generateGreatCirclePoints = (
  departure: Airport,
  arrival: Airport,
  departureTime: Date,
  arrivalTime: Date,
  numPoints: number = 50
): Position[] => {
  const points: Position[] = [];
  const startPos: Position = {
    lat: departure.lat,
    lng: departure.lng,
    timestamp: departureTime.getTime()
  };
  const endPos: Position = {
    lat: arrival.lat,
    lng: arrival.lng,
    timestamp: arrivalTime.getTime()
  };

  for (let i = 0; i <= numPoints; i++) {
    points.push(interpolateGreatCircle(startPos, endPos, i / numPoints));
  }

  return points;
};

export const calculateFlightDuration = (distance: number, speed: number): number => {
  return (distance / speed) * 60;
};

export const getAltitudeForProgress = (progress: number, cruiseAltitude: number): number => {
  const climbPhase = 0.15;
  const descentPhase = 0.85;

  if (progress < climbPhase) {
    return (progress / climbPhase) * cruiseAltitude * (0.5 + 0.5 * Math.sin(progress * Math.PI / climbPhase - Math.PI / 2));
  } else if (progress > descentPhase) {
    const descentProgress = (progress - descentPhase) / (1 - descentPhase);
    return cruiseAltitude * (1 - descentProgress) * (0.5 + 0.5 * Math.cos(descentProgress * Math.PI));
  } else {
    return cruiseAltitude * (0.995 + 0.005 * Math.sin(progress * Math.PI * 2));
  }
};

export const getSpeedForProgress = (progress: number, cruiseSpeed: number): number => {
  const climbPhase = 0.15;
  const descentPhase = 0.85;

  if (progress < climbPhase) {
    return cruiseSpeed * (0.6 + 0.4 * (progress / climbPhase));
  } else if (progress > descentPhase) {
    return cruiseSpeed * (0.6 + 0.4 * (1 - (progress - descentPhase) / (1 - descentPhase)));
  } else {
    return cruiseSpeed * (0.995 + 0.005 * Math.sin(progress * Math.PI * 1.5));
  }
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  return `${hours}h ${mins}m`;
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};
