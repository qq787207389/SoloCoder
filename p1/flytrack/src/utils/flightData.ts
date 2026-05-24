import type { Flight, Position } from '../types';
import { FlightStatus } from '../types';
import { getRandomAirline, AIRLINES } from '../data/airlines';
import { getTwoDifferentAirports } from '../data/airports';
import {
  calculateDistance,
  generateGreatCirclePoints,
  getAltitudeForProgress,
  getSpeedForProgress,
  calculateBearing
} from './geo';

const generateFlightNumber = (airlineIata: string): string => {
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `${airlineIata}${num}`;
};

const generateRandomStartTime = (): Date => {
  const now = new Date();
  const offsetMinutes = Math.floor(Math.random() * 180) - 90;
  return new Date(now.getTime() + offsetMinutes * 60 * 1000);
};

const calculateFlightTime = (distance: number): number => {
  const baseSpeed = 850;
  const hours = distance / baseSpeed;
  return hours * 60;
};

export const generateFlight = (id: string): Flight => {
  const airline = getRandomAirline();
  const [departure, arrival] = getTwoDifferentAirports();

  const distance = calculateDistance(departure.lat, departure.lng, arrival.lat, arrival.lng);
  const flightMinutes = calculateFlightTime(distance);

  const departureTime = generateRandomStartTime();
  const arrivalTime = new Date(departureTime.getTime() + flightMinutes * 60 * 1000);
  const estimatedArrivalTime = new Date(arrivalTime);

  const route = generateGreatCirclePoints(departure, arrival, departureTime, arrivalTime, 100);

  const now = Date.now();
  const totalDuration = arrivalTime.getTime() - departureTime.getTime();
  const elapsed = now - departureTime.getTime();
  const initialProgress = Math.max(0, Math.min(1, elapsed / totalDuration));

  const cruiseAltitude = 8000 + Math.random() * 4000;
  const cruiseSpeed = 800 + Math.random() * 200;

  const initialPosition = getPositionAlongRoute(route, initialProgress);
  const nextPosition = getPositionAlongRoute(route, Math.min(1, initialProgress + 0.01));

  const heading = calculateBearing(
    initialPosition.lat,
    initialPosition.lng,
    nextPosition.lat,
    nextPosition.lng
  );

  const status = getFlightStatus(initialProgress);

  const trail: Position[] = [];
  const trailLength = 20;
  for (let i = 1; i <= trailLength; i++) {
    const trailProgress = Math.max(0, initialProgress - i * 0.005);
    if (trailProgress >= 0) {
      trail.push(getPositionAlongRoute(route, trailProgress));
    }
  }

  const delay = Math.random() > 0.7 ? Math.floor(Math.random() * 60) : undefined;

  return {
    id,
    flightNumber: generateFlightNumber(airline.iata),
    airline,
    departure,
    arrival,
    departureTime,
    arrivalTime,
    estimatedArrivalTime: delay
      ? new Date(estimatedArrivalTime.getTime() + delay * 60 * 1000)
      : estimatedArrivalTime,
    currentPosition: initialPosition,
    altitude: getAltitudeForProgress(initialProgress, cruiseAltitude),
    speed: getSpeedForProgress(initialProgress, cruiseSpeed),
    heading,
    status,
    route,
    trail,
    delay,
    progress: initialProgress,
    cruiseAltitude,
    cruiseSpeed
  };
};

const getPositionAlongRoute = (route: Position[], progress: number): Position => {
  const maxIndex = route.length - 1;
  const exactIndex = progress * maxIndex;
  const lowerIndex = Math.floor(exactIndex);
  const upperIndex = Math.min(maxIndex, lowerIndex + 1);
  const fraction = exactIndex - lowerIndex;

  const lower = route[lowerIndex];
  const upper = route[upperIndex];

  return {
    lat: lower.lat + (upper.lat - lower.lat) * fraction,
    lng: lower.lng + (upper.lng - lower.lng) * fraction,
    timestamp: lower.timestamp + (upper.timestamp - lower.timestamp) * fraction
  };
};

const getFlightStatus = (progress: number): FlightStatus => {
  if (progress < 0.15) return FlightStatus.DEPARTING;
  if (progress > 0.85) return FlightStatus.DESCENDING;
  return FlightStatus.CRUISING;
};

export const generateFlights = (count: number): Flight[] => {
  const flights: Flight[] = [];
  for (let i = 0; i < count; i++) {
    flights.push(generateFlight(`flight-${i}`));
  }
  return flights;
};

export const updateFlightPosition = (flight: Flight, deltaTime: number): Flight => {
  if (flight.status === 'arrived') return flight;

  const totalDuration = flight.arrivalTime.getTime() - flight.departureTime.getTime();
  const progressIncrement = (deltaTime * 1000) / totalDuration * 60;

  const newProgress = Math.min(1, flight.progress + progressIncrement);

  if (newProgress >= 1) {
    return {
      ...flight,
      progress: 1,
      status: FlightStatus.ARRIVED,
      currentPosition: flight.route[flight.route.length - 1],
      altitude: 0,
      speed: 0
    };
  }

  const newPosition = getPositionAlongRoute(flight.route, newProgress);
  const nextPosition = getPositionAlongRoute(flight.route, Math.min(1, newProgress + 0.01));

  const newHeading = calculateBearing(
    newPosition.lat,
    newPosition.lng,
    nextPosition.lat,
    nextPosition.lng
  );

  const newTrail = [flight.currentPosition, ...flight.trail.slice(0, 19)];

  return {
    ...flight,
    progress: newProgress,
    currentPosition: newPosition,
    heading: newHeading,
    altitude: getAltitudeForProgress(newProgress, flight.cruiseAltitude),
    speed: getSpeedForProgress(newProgress, flight.cruiseSpeed),
    status: getFlightStatus(newProgress),
    trail: newTrail
  };
};

export const getAirlinesWithFlightCount = (flights: Flight[]): Array<{ id: string; name: string; count: number }> => {
  const counts = new Map<string, number>();
  flights.forEach(f => {
    counts.set(f.airline.id, (counts.get(f.airline.id) || 0) + 1);
  });

  return AIRLINES.map(a => ({
    id: a.id,
    name: a.name,
    count: counts.get(a.id) || 0
  })).filter(a => a.count > 0);
};
