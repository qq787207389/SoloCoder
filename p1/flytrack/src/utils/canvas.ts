import type { Flight, Position, FlightStatus } from '../types';

export const getStatusColor = (status: FlightStatus): string => {
  switch (status) {
    case 'departing':
      return '#22c55e';
    case 'cruising':
      return '#ffffff';
    case 'descending':
      return '#f97316';
    case 'arrived':
      return '#6b7280';
    default:
      return '#ffffff';
  }
};

export const drawAirplane = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  heading: number,
  size: number,
  color: string,
  isSelected: boolean
) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((heading * Math.PI) / 180);

  if (isSelected) {
    ctx.beginPath();
    ctx.arc(0, 0, size * 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 212, 255, 0.3)';
    ctx.fill();
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.moveTo(size, 0);
  ctx.lineTo(-size * 0.5, -size * 0.4);
  ctx.lineTo(-size * 0.3, 0);
  ctx.lineTo(-size * 0.5, size * 0.4);
  ctx.closePath();

  ctx.fillStyle = color;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-size * 0.2, -size * 0.8);
  ctx.lineTo(-size * 0.2, -size * 0.2);
  ctx.lineTo(size * 0.1, -size * 0.2);
  ctx.lineTo(size * 0.1, -size * 0.8);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-size * 0.2, size * 0.8);
  ctx.lineTo(-size * 0.2, size * 0.2);
  ctx.lineTo(size * 0.1, size * 0.2);
  ctx.lineTo(size * 0.1, size * 0.8);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
};

export const drawTrail = (
  ctx: CanvasRenderingContext2D,
  trail: Position[],
  project: (lat: number, lng: number) => { x: number; y: number } | null,
  color: string = 'rgba(0, 212, 255, 0.6)'
) => {
  if (trail.length < 2) return;

  ctx.beginPath();
  let started = false;

  for (let i = 0; i < trail.length; i++) {
    const point = trail[i];
    const projected = project(point.lat, point.lng);

    if (!projected) continue;

    if (!started) {
      ctx.moveTo(projected.x, projected.y);
      started = true;
    } else {
      ctx.lineTo(projected.x, projected.y);
    }
  }

  const gradient = ctx.createLinearGradient(
    ctx.canvas.width / 2,
    0,
    ctx.canvas.width / 2,
    ctx.canvas.height
  );
  gradient.addColorStop(0, 'rgba(0, 212, 255, 0)');
  gradient.addColorStop(1, color);

  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.globalAlpha = 0.4;
  ctx.stroke();
  ctx.globalAlpha = 1;
};

export const drawRoute = (
  ctx: CanvasRenderingContext2D,
  route: Position[],
  project: (lat: number, lng: number) => { x: number; y: number } | null,
  progress: number
) => {
  if (route.length < 2) return;

  const progressIndex = Math.floor(progress * (route.length - 1));

  ctx.setLineDash([6, 6]);
  ctx.lineDashOffset = 0;
  ctx.beginPath();
  let started = false;

  for (let i = progressIndex; i < route.length; i++) {
    const point = route[i];
    const projected = project(point.lat, point.lng);
    if (!projected) continue;

    if (!started) {
      ctx.moveTo(projected.x, projected.y);
      started = true;
    } else {
      ctx.lineTo(projected.x, projected.y);
    }
  }

  ctx.strokeStyle = 'rgba(255, 149, 0, 0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.setLineDash([]);
};

export const drawAirport = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  isSelected: boolean
) => {
  ctx.save();

  if (isSelected) {
    ctx.beginPath();
    ctx.arc(x, y, size * 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 212, 255, 0.2)';
    ctx.fill();
  }

  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fillStyle = '#00d4ff';
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#0a0e1a';
  ctx.font = 'bold 10px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.restore();
};

export const getIconSizeForZoom = (zoom: number): number => {
  const baseSize = 8;
  return baseSize * (1 + (zoom - 2) * 0.15);
};

export const isPointInBounds = (
  x: number,
  y: number,
  width: number,
  height: number,
  padding: number = 50
): boolean => {
  return (
    x >= -padding &&
    x <= width + padding &&
    y >= -padding &&
    y <= height + padding
  );
};

export const hitTestFlight = (
  mouseX: number,
  mouseY: number,
  flightX: number,
  flightY: number,
  hitRadius: number = 15
): boolean => {
  const dx = mouseX - flightX;
  const dy = mouseY - flightY;
  return Math.sqrt(dx * dx + dy * dy) <= hitRadius;
};
