import { useEffect, useRef, useState, useCallback } from 'react';
import type { Flight, Airport } from '../../types';
import {
  drawAirplane,
  drawTrail,
  drawRoute,
  drawAirport,
  getStatusColor,
  hitTestFlight
} from '../../utils/canvas';
import { continents } from '../../data/continents';

interface SimpleWorldMapProps {
  flights: Flight[];
  airports: Airport[];
  selectedFlight: Flight | null;
  selectedAirport: Airport | null;
  onFlightClick: (flight: Flight) => void;
  onAirportClick: (airport: Airport) => void;
}

const latLngToPixel = (
  lat: number,
  lng: number,
  width: number,
  height: number,
  offsetX: number,
  offsetY: number,
  scale: number
): { x: number; y: number } | null => {
  const x = ((lng + 180) / 360) * width * scale + offsetX;
  const y = ((90 - lat) / 180) * height * scale + offsetY;
  return { x, y };
};

export const SimpleWorldMap = ({
  flights,
  airports,
  selectedFlight,
  selectedAirport,
  onFlightClick,
  onAirportClick
}: SimpleWorldMapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const flightPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  const project = useCallback(
    (lat: number, lng: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      return latLngToPixel(
        lat,
        lng,
        canvas.width,
        canvas.height,
        offset.x,
        offset.y,
        scale
      );
    },
    [offset, scale]
  );

  const drawContinents = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.fillStyle = '#1a1f35';
      ctx.strokeStyle = '#2d3748';
      ctx.lineWidth = 1;

      continents.forEach((continent) => {
        ctx.beginPath();
        continent.forEach((point, index) => {
          const pos = latLngToPixel(
            point.lat,
            point.lng,
            width,
            height,
            offset.x,
            offset.y,
            scale
          );
          if (pos) {
            if (index === 0) {
              ctx.moveTo(pos.x, pos.y);
            } else {
              ctx.lineTo(pos.x, pos.y);
            }
          }
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });
    },
    [offset, scale]
  );

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    for (let lat = -60; lat <= 60; lat += 30) {
      const pos = latLngToPixel(lat, 0, width, height, offset.x, offset.y, scale);
      if (pos) {
        ctx.beginPath();
        ctx.moveTo(0, pos.y);
        ctx.lineTo(width, pos.y);
        ctx.stroke();
      }
    }
    for (let lng = -180; lng <= 180; lng += 30) {
      const pos = latLngToPixel(0, lng, width, height, offset.x, offset.y, scale);
      if (pos) {
        ctx.beginPath();
        ctx.moveTo(pos.x, 0);
        ctx.lineTo(pos.x, height);
        ctx.stroke();
      }
    }

    drawContinents(ctx, width, height);

    const iconSize = 8 * scale;

    if (selectedFlight) {
      drawRoute(ctx, selectedFlight.route, project, selectedFlight.progress);
    }

    flightPositionsRef.current.clear();

    flights.forEach((flight) => {
      const pos = project(
        flight.currentPosition.lat,
        flight.currentPosition.lng
      );
      if (!pos) return;

      if (pos.x < -50 || pos.x > width + 50 || pos.y < -50 || pos.y > height + 50) {
        return;
      }

      flightPositionsRef.current.set(flight.id, pos);

      if (flight.trail.length > 1 && scale > 1.2) {
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

    if (scale > 1.5) {
      airports.forEach((airport) => {
        const pos = project(airport.lat, airport.lng);
        if (!pos) return;
        if (pos.x < -50 || pos.x > width + 50 || pos.y < -50 || pos.y > height + 50) {
          return;
        }

        drawAirport(
          ctx,
          pos.x,
          pos.y,
          5 * scale,
          selectedAirport?.id === airport.id
        );
      });
    }

    animationRef.current = requestAnimationFrame(render);
  }, [flights, airports, selectedFlight, selectedAirport, project, drawContinents]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    lastPosRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - lastPosRef.current.x;
        const dy = e.clientY - lastPosRef.current.y;
        setOffset((prev) => ({
          x: prev.x + dx,
          y: prev.y + dy
        }));
        lastPosRef.current = { x: e.clientX, y: e.clientY };
      }
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((prev) => Math.max(0.5, Math.min(3, prev * delta)));
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const hitRadius = scale > 2 ? 20 : 15;

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

      if (scale > 1.5) {
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
    [flights, airports, scale, project, onFlightClick, onAirportClick]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setOffset({
      x: (canvas.width - canvas.width * scale) / 2,
      y: (canvas.height - canvas.height * scale) / 2
    });
  }, [scale]);

  useEffect(() => {
    const renderLoop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      const projectLocal = (lat: number, lng: number) =>
        latLngToPixel(lat, lng, width, height, offset.x, offset.y, scale);

      ctx.fillStyle = '#0a0e1a';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.5;
      for (let lat = -60; lat <= 60; lat += 30) {
        const pos = latLngToPixel(lat, 0, width, height, offset.x, offset.y, scale);
        if (pos) {
          ctx.beginPath();
          ctx.moveTo(0, pos.y);
          ctx.lineTo(width, pos.y);
          ctx.stroke();
        }
      }
      for (let lng = -180; lng <= 180; lng += 30) {
        const pos = latLngToPixel(0, lng, width, height, offset.x, offset.y, scale);
        if (pos) {
          ctx.beginPath();
          ctx.moveTo(pos.x, 0);
          ctx.lineTo(pos.x, height);
          ctx.stroke();
        }
      }

      ctx.fillStyle = '#1a1f35';
      ctx.strokeStyle = '#2d3748';
      ctx.lineWidth = 1;
      continents.forEach((continent) => {
        ctx.beginPath();
        continent.forEach((point, index) => {
          const pos = latLngToPixel(
            point.lat,
            point.lng,
            width,
            height,
            offset.x,
            offset.y,
            scale
          );
          if (pos) {
            if (index === 0) {
              ctx.moveTo(pos.x, pos.y);
            } else {
              ctx.lineTo(pos.x, pos.y);
            }
          }
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });

      const iconSize = 8 * scale;

      if (selectedFlight) {
        drawRoute(ctx, selectedFlight.route, projectLocal, selectedFlight.progress);
      }

      flightPositionsRef.current.clear();

      flights.forEach((flight) => {
        const pos = projectLocal(
          flight.currentPosition.lat,
          flight.currentPosition.lng
        );
        if (!pos) return;

        if (pos.x < -50 || pos.x > width + 50 || pos.y < -50 || pos.y > height + 50) {
          return;
        }

        flightPositionsRef.current.set(flight.id, pos);

        if (flight.trail.length > 1 && scale > 1.2) {
          drawTrail(ctx, flight.trail, projectLocal);
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

      if (scale > 1.5) {
        airports.forEach((airport) => {
          const pos = projectLocal(airport.lat, airport.lng);
          if (!pos) return;
          if (pos.x < -50 || pos.x > width + 50 || pos.y < -50 || pos.y > height + 50) {
            return;
          }

          drawAirport(
            ctx,
            pos.x,
            pos.y,
            5 * scale,
            selectedAirport?.id === airport.id
          );
        });
      }

      animationRef.current = requestAnimationFrame(renderLoop);
    };

    animationRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [flights, airports, selectedFlight, selectedAirport, offset, scale]);

  return (
    <div className="relative w-full h-full bg-[#0a0e1a]">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleClick}
      />
      <div className="absolute bottom-4 left-4 flex gap-2">
        <button
          onClick={() => setScale((s) => Math.min(3, s * 1.2))}
          className="w-10 h-10 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center transition-colors"
        >
          +
        </button>
        <button
          onClick={() => setScale((s) => Math.max(0.5, s * 0.8))}
          className="w-10 h-10 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center transition-colors"
        >
          −
        </button>
      </div>
      <div className="absolute bottom-4 right-4 text-xs text-slate-500">
        拖拽平移 · 滚轮缩放
      </div>
    </div>
  );
};
