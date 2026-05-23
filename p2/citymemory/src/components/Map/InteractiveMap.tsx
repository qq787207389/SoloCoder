import { useState, useRef, useCallback, useEffect } from 'react';
import type { Photo, Decade } from '../../types';
import { getDecadeColor } from '../../types';
import { MapPin, ZoomIn, ZoomOut, Move } from 'lucide-react';

interface InteractiveMapProps {
  photos: Photo[];
  onMarkerClick: (photo: Photo) => void;
  selectedDecade?: Decade | 'all';
  onMapClick?: (lat: number, lng: number) => void;
  interactive?: boolean;
  center?: { lat: number; lng: number };
  zoom?: number;
}

const CHINA_BOUNDS = {
  minLat: 18,
  maxLat: 54,
  minLng: 73,
  maxLng: 135,
};

const latLngToPixel = (
  lat: number,
  lng: number,
  containerWidth: number,
  containerHeight: number,
  zoom: number,
  offsetX: number,
  offsetY: number
) => {
  const latRange = CHINA_BOUNDS.maxLat - CHINA_BOUNDS.minLat;
  const lngRange = CHINA_BOUNDS.maxLng - CHINA_BOUNDS.minLng;
  
  const x = ((lng - CHINA_BOUNDS.minLng) / lngRange) * containerWidth * zoom + offsetX;
  const y = ((CHINA_BOUNDS.maxLat - lat) / latRange) * containerHeight * zoom + offsetY;
  
  return { x, y };
};

const pixelToLatLng = (
  x: number,
  y: number,
  containerWidth: number,
  containerHeight: number,
  zoom: number,
  offsetX: number,
  offsetY: number
) => {
  const latRange = CHINA_BOUNDS.maxLat - CHINA_BOUNDS.minLat;
  const lngRange = CHINA_BOUNDS.maxLng - CHINA_BOUNDS.minLng;
  
  const lng = ((x - offsetX) / (containerWidth * zoom)) * lngRange + CHINA_BOUNDS.minLng;
  const lat = CHINA_BOUNDS.maxLat - ((y - offsetY) / (containerHeight * zoom)) * latRange;
  
  return { lat, lng };
};

const InteractiveMap = ({
  photos,
  onMarkerClick,
  selectedDecade = 'all',
  onMapClick,
  interactive = true,
  center = { lat: 35.8617, lng: 104.1954 },
  zoom: initialZoom = 1,
}: InteractiveMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [zoom, setZoom] = useState(initialZoom);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredPhoto, setHoveredPhoto] = useState<string | null>(null);

  const filteredPhotos = selectedDecade === 'all'
    ? photos
    : photos.filter(p => p.decade === selectedDecade);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      const centerPixel = latLngToPixel(
        center.lat,
        center.lng,
        dimensions.width,
        dimensions.height,
        1,
        0,
        0
      );
      setOffset({
        x: (dimensions.width / 2 - centerPixel.x) * zoom,
        y: (dimensions.height / 2 - centerPixel.y) * zoom,
      });
    }
  }, [center, dimensions]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!interactive) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  }, [interactive, offset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMapClick = useCallback((e: React.MouseEvent) => {
    if (!onMapClick || isDragging) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const { lat, lng } = pixelToLatLng(
      x,
      y,
      dimensions.width,
      dimensions.height,
      zoom,
      offset.x,
      offset.y
    );

    onMapClick(lat, lng);
  }, [onMapClick, isDragging, dimensions, zoom, offset]);

  const handleZoomIn = () => {
    setZoom(z => Math.min(z + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(z => Math.max(z - 0.2, 0.5));
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleMapClick}
      onWheel={handleWheel}
      style={{ cursor: isDragging ? 'grabbing' : onMapClick ? 'crosshair' : 'grab' }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(139, 115, 85, 0.1)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          <path
            d="M 180 150 Q 220 120 280 140 Q 320 130 380 160 Q 420 150 480 180 
               Q 520 170 560 200 Q 600 190 640 220 Q 660 260 620 300 
               Q 580 340 540 320 Q 500 360 460 340 Q 420 380 380 360 
               Q 340 400 300 380 Q 260 420 220 400 Q 180 380 160 340 
               Q 140 300 160 260 Q 140 220 160 180 Q 170 160 180 150 Z"
            fill="rgba(212, 112, 44, 0.08)"
            stroke="rgba(139, 115, 85, 0.3)"
            strokeWidth="2"
            strokeDasharray="5,5"
            transform={`scale(${zoom}) translate(${offset.x / zoom / 10}%, ${offset.y / zoom / 10}%)`}
          />
          
          <circle cx="250" cy="200" r="3" fill="rgba(212, 112, 44, 0.3)" />
          <circle cx="450" cy="250" r="3" fill="rgba(212, 112, 44, 0.3)" />
          <circle cx="350" cy="300" r="3" fill="rgba(212, 112, 44, 0.3)" />
          <circle cx="550" cy="280" r="3" fill="rgba(212, 112, 44, 0.3)" />
          <circle cx="200" cy="350" r="3" fill="rgba(212, 112, 44, 0.3)" />
        </svg>
      </div>

      <div className="absolute inset-0">
        {filteredPhotos.map((photo, index) => {
          const pos = latLngToPixel(
            photo.lat,
            photo.lng,
            dimensions.width,
            dimensions.height,
            zoom,
            offset.x,
            offset.y
          );
          const color = getDecadeColor(photo.decade);
          const isHovered = hoveredPhoto === photo.id;

          if (pos.x < -50 || pos.x > dimensions.width + 50 ||
              pos.y < -50 || pos.y > dimensions.height + 50) {
            return null;
          }

          return (
            <div
              key={photo.id}
              className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer z-10"
              style={{
                left: pos.x,
                top: pos.y,
                transition: 'transform 0.2s ease-out',
                transform: `translate(-50%, -100%) scale(${isHovered ? 1.2 : 1})`,
                animationDelay: `${index * 50}ms`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onMarkerClick(photo);
              }}
              onMouseEnter={() => setHoveredPhoto(photo.id)}
              onMouseLeave={() => setHoveredPhoto(null)}
            >
              <div
                className="relative"
                style={{
                  width: isHovered ? 40 : 32,
                  height: isHovered ? 40 : 32,
                  background: color,
                  borderRadius: '50% 50% 50% 0',
                  transform: 'rotate(-45deg)',
                  boxShadow: isHovered 
                    ? '0 4px 12px rgba(0,0,0,0.3)' 
                    : '0 2px 6px rgba(0,0,0,0.2)',
                  border: '2px solid white',
                  transition: 'all 0.2s ease-out',
                }}
              >
                <div 
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ transform: 'rotate(45deg)' }}
                >
                  <span 
                    className="text-white font-bold"
                    style={{ fontSize: isHovered ? '11px' : '9px' }}
                  >
                    {photo.year.toString().slice(-2)}
                  </span>
                </div>
              </div>

              {isHovered && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-nostalgic-paper rounded-vintage shadow-paper-hover px-3 py-2 whitespace-nowrap z-20">
                  <p className="text-sm font-medium text-nostalgic-brown">{photo.title}</p>
                  <p className="text-xs text-nostalgic-brownLight">{photo.location}</p>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                    <div 
                      className="w-2 h-2 bg-nostalgic-paper transform rotate-45"
                      style={{ marginTop: '-4px' }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {interactive && (
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 bg-nostalgic-paper rounded-vintage shadow-paper flex items-center justify-center text-nostalgic-brown hover:bg-nostalgic-creamDark transition-colors"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 bg-nostalgic-paper rounded-vintage shadow-paper flex items-center justify-center text-nostalgic-brown hover:bg-nostalgic-creamDark transition-colors"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
        </div>
      )}

      {interactive && (
        <div className="absolute bottom-4 left-4 bg-nostalgic-paper/90 backdrop-blur-sm rounded-vintage shadow-paper px-3 py-2 z-20">
          <div className="flex items-center gap-2 text-xs text-nostalgic-brownLight">
            <Move className="w-3 h-3" />
            <span>拖动平移 · 滚轮缩放</span>
          </div>
        </div>
      )}

      {onMapClick && (
        <div className="absolute top-4 left-4 bg-nostalgic-paper/90 backdrop-blur-sm rounded-vintage shadow-paper px-4 py-2 z-20">
          <p className="text-sm text-nostalgic-brown flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            点击地图选择位置
          </p>
        </div>
      )}

      <div className="absolute top-4 right-4 bg-nostalgic-paper/90 backdrop-blur-sm rounded-vintage shadow-paper px-3 py-2 z-20">
        <p className="text-xs text-nostalgic-brownLight">
          缩放: {Math.round(zoom * 100)}%
        </p>
      </div>
    </div>
  );
};

export default InteractiveMap;
