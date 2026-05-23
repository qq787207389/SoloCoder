import { useEffect, useRef, useState, useCallback } from 'react';
import type { Photo, Decade } from '../../types';
import { getDecadeColor } from '../../types';
import InteractiveMap from './InteractiveMap';

declare global {
  interface Window {
    AMap: any;
    _AMapSecurityConfig: any;
  }
}

interface MapComponentProps {
  photos: Photo[];
  onMarkerClick: (photo: Photo) => void;
  selectedDecade?: Decade | 'all';
  onMapClick?: (lat: number, lng: number) => void;
  interactive?: boolean;
  center?: { lat: number; lng: number };
  zoom?: number;
}

const MapComponent = ({
  photos,
  onMarkerClick,
  selectedDecade = 'all',
  onMapClick,
  interactive = true,
  center = { lat: 35.8617, lng: 104.1954 },
  zoom = 1,
}: MapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const filteredPhotos = selectedDecade === 'all'
    ? photos
    : photos.filter(p => p.decade === selectedDecade);

  const loadAMapScript = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (window.AMap) {
        resolve();
        return;
      }

      window._AMapSecurityConfig = {
        securityJsCode: 'test',
      };

      const timeout = setTimeout(() => {
        reject(new Error('地图加载超时'));
      }, 10000);

      const script = document.createElement('script');
      script.src = 'https://webapi.amap.com/maps?v=2.0&key=demo&plugin=AMap.MarkerClusterer';
      script.onload = () => {
        clearTimeout(timeout);
        setTimeout(() => {
          if (window.AMap) {
            resolve();
          } else {
            reject(new Error('AMap not available'));
          }
        }, 500);
      };
      script.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('地图脚本加载失败'));
      };
      document.head.appendChild(script);
    });
  }, []);

  const createCustomMarker = useCallback((photo: Photo, AMap: any) => {
    const color = getDecadeColor(photo.decade);
    const content = document.createElement('div');
    content.innerHTML = `
      <div style="
        width: 32px;
        height: 32px;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
        border: 2px solid white;
      ">
        <div style="
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="font-size: 10px; color: ${color}; font-weight: bold;">
            ${photo.year.toString().slice(-2)}
          </span>
        </div>
      </div>
    `;

    const marker = new AMap.Marker({
      position: [photo.lng, photo.lat],
      content: content,
      offset: new AMap.Pixel(-16, -32),
      title: photo.title,
    });

    marker.on('click', () => onMarkerClick(photo));

    return marker;
  }, [onMarkerClick]);

  useEffect(() => {
    let mounted = true;

    const initMap = async () => {
      try {
        await loadAMapScript();
        
        if (!mounted || !mapRef.current) return;

        const AMap = window.AMap;
        const map = new AMap.Map(mapRef.current, {
          center: [center.lng, center.lat],
          zoom: zoom,
          viewMode: '2D',
          pitch: 0,
          mapStyle: 'amap://styles/light',
        });

        mapInstanceRef.current = map;
        setMapLoaded(true);

        if (onMapClick) {
          map.on('click', (e: any) => {
            onMapClick(e.lnglat.lat, e.lnglat.lng);
          });
        }

      } catch (error) {
        if (mounted) {
          console.log('高德地图加载失败，使用备用地图:', error);
          setUseFallback(true);
          setMapLoaded(true);
        }
      }
    };

    initMap();

    return () => {
      mounted = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.destroy();
        } catch (e) {}
      }
    };
  }, [loadAMapScript, center, zoom, onMapClick]);

  useEffect(() => {
    if (!mapLoaded || useFallback || !mapInstanceRef.current || !window.AMap) return;

    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const AMap = window.AMap;
    const markers = filteredPhotos.map(photo => createCustomMarker(photo, AMap));
    markersRef.current = markers;

    if (markers.length > 0) {
      const count = Math.min(markers.length, 10);
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          if (markers[i] && mapInstanceRef.current) {
            markers[i].setMap(mapInstanceRef.current);
            markers[i].show();
          }
        }, i * 100);
      }
    }
  }, [mapLoaded, useFallback, filteredPhotos, createCustomMarker]);

  if (useFallback) {
    return (
      <InteractiveMap
        photos={photos}
        onMarkerClick={onMarkerClick}
        selectedDecade={selectedDecade}
        onMapClick={onMapClick}
        interactive={interactive}
        center={center}
        zoom={zoom}
      />
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      
      {!mapLoaded && (
        <div className="absolute inset-0 bg-nostalgic-cream/80 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-nostalgic-brown border-t-transparent mx-auto mb-4" />
            <p className="text-nostalgic-brown">地图加载中...</p>
          </div>
        </div>
      )}

      {interactive && mapLoaded && !useFallback && (
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="w-10 h-10 bg-nostalgic-paper rounded-vintage shadow-paper flex items-center justify-center text-nostalgic-brown hover:bg-nostalgic-creamDark transition-colors"
          >
            +
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="w-10 h-10 bg-nostalgic-paper rounded-vintage shadow-paper flex items-center justify-center text-nostalgic-brown hover:bg-nostalgic-creamDark transition-colors"
          >
            -
          </button>
        </div>
      )}

      {onMapClick && mapLoaded && !useFallback && (
        <div className="absolute top-4 left-4 bg-nostalgic-paper/90 backdrop-blur-sm rounded-vintage shadow-paper px-4 py-2 z-10">
          <p className="text-sm text-nostalgic-brown">
            点击地图选择位置
          </p>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
