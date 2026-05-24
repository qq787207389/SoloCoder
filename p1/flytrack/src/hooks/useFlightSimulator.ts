import { useEffect, useRef } from 'react';
import { useFlightStore } from '../store/useFlightStore';
import { generateFlights, updateFlightPosition } from '../utils/flightData';

const FLIGHT_COUNT = 300;
const UPDATE_INTERVAL = 50;

export const useFlightSimulator = () => {
  const { setFlights, updateFlight, flights } = useFlightStore();
  const lastUpdateRef = useRef<number>(Date.now());
  const animationRef = useRef<number>();

  useEffect(() => {
    const initialFlights = generateFlights(FLIGHT_COUNT);
    setFlights(initialFlights);
  }, [setFlights]);

  useEffect(() => {
    if (flights.length === 0) return;

    const updatePositions = () => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateRef.current) / 1000;
      lastUpdateRef.current = now;

      flights.forEach((flight) => {
        if (flight.status !== 'arrived') {
          const updatedFlight = updateFlightPosition(flight, deltaTime);
          updateFlight(flight.id, updatedFlight);
        }
      });

      animationRef.current = requestAnimationFrame(updatePositions);
    };

    const intervalId = setInterval(() => {
      if (!animationRef.current) {
        animationRef.current = requestAnimationFrame(updatePositions);
      }
    }, UPDATE_INTERVAL);

    return () => {
      clearInterval(intervalId);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [flights.length, updateFlight]);
};
