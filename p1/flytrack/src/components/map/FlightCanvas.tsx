import { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Flight, Airport } from '../../types';
import {
  drawAirplane,
  drawTrail,
  drawRoute,
  drawAirport,
  getStatusColor,
  getIconSizeForZoom,
  isPointInBounds,
  hitTestFlight
} from '../../utils/canvas';

interface FlightCanvasProps {
  map: mapboxgl.Map | null;
  flights: Flight[];
  airports: Airport[];
  selectedFlight: Flight | null;
  selectedAirport: Airport | null;
  onFlightClick: (flight: Flight) => void;
  onAirportClick: (airport: Airport) => void;
}

export const FlightCanvas = ({
  map,
  flights,
  airports,
  selectedFlight,
  selectedAirport,
  onFlightClick,
  onAirportClick
}: FlightCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const zoomRef = useRef<number>(2);
  const flightPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  const project = useCallback(
    (lat: number, lng: number) => {
      if (!map) return null;
      try {
        const point = map.project(new mapboxgl.LngLat(lng, lat));
        return { x: point.x, y: point.y };
      } catch {
        return null;
      }
    },
    [map]
  );

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !map) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const zoom = map.getZoom();
    zoomRef.current = zoom;

    ctx.clearRect(0, 0, width, height);

    const iconSize = getIconSizeForZoom(zoom);
    const showTrails = zoom > 3;
    const showAirports = zoom > 4;

    if (selectedFlight) {
      drawRoute(
        ctx,
        selectedFlight.route,
        project,
        selectedFlight.progress
      );
    }

    if (showTrails && selectedFlight) {
      drawTrail(ctx, selectedFlight.trail, project);
    }

    flightPositionsRef.current.clear();

    flights.forEach((flight) => {
      const pos = project(
        flight.currentPosition.lat,
        flight.currentPosition.lng
      );
      if (!pos) return;

      if (!isPointInBounds(pos.x, pos.y, width, height, 100)) return;

      flightPositionsRef.current.set(flight.id, pos);

      if (showTrails && flight.trail.length > 1) {
        drawTrail(ctx, flight.trail, project);
      }

      const color = getStatusColor(flight.status);
      drawAirplane(
        ctx,
        pos.x,
        pos.y,
        flight.heading,
        iconSize,
        color,
        selectedFlight?.id === flight.id
      );
    });

    if (showAirports) {
      airports.forEach((airport) => {
        const pos = project(airport.lat, airport.lng);
        if (!pos) return;
        if (!isPointInBounds(pos.x, pos.y, width, height, 50)) return;

        drawAirport(
          ctx,
          pos.x,
          pos.y,
          5,
          selectedAirport?.id === airport.id
        );
      });
    }

    animationRef.current = requestAnimationFrame(render);
  }, [map, flights, airports, selectedFlight, selectedAirport, project]);

  const handleClick = useCallback(
    (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas || !map) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const zoom = zoomRef.current;
      const hitRadius = zoom > 4 ? 20 : 15;

      let clickedFlight: Flight | null = null;
      let minDistance = Infinity;

      for (const flight of flights) {
        const pos = flightPositionsRef.current.get(flight.id);
        if (!pos) continue;

        if (hitTestFlight(x, y, pos.x, pos.y, hitRadius)) {
          const distance = Math.sqrt(
            Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2)
          );
          if (distance < minDistance) {
            minDistance = distance;
            clickedFlight = flight;
          }
        }
      }

      if (clickedFlight) {
        onFlightClick(clickedFlight);
        return;
      }

      if (zoom > 4) {
        for (const airport of airports) {
          const pos = project(airport.lat, airport.lng);
          if (!pos) continue;
          if (hitTestFlight(x, y, pos.x, pos.y, 20)) {
            onAirportClick(airport);
            return;
          }
        }
      }
    },
    [map, flights, airports, project, onFlightClick, onAirportClick]
  );

  useEffect(() => {
    if (!map || !containerRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const container = containerRef.current;
      if (!container) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };

    updateSize();

    const onMove = () => {
      if (!animationRef.current) {
        animationRef.current = requestAnimationFrame(render);
      }
    };

    map.on('move', onMove);
    map.on('zoom', onMove);
    map.on('resize', updateSize);
    window.addEventListener('resize', updateSize);
    canvas.addEventListener('click', handleClick);

    animationRef.current = requestAnimationFrame(render);

    return () => {
      map.off('move', onMove);
      map.off('zoom', onMove);
      map.off('resize', updateSize);
      window.removeEventListener('resize', updateSize);
      canvas.removeEventListener('click', handleClick);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [map, render, handleClick]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-auto z-10"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ cursor: 'pointer' }}
      />
    </div>
  );
};
