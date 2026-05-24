import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Flight, Airport } from '../../types';
import { FlightCanvas } from './FlightCanvas';
import { SimpleWorldMap } from './SimpleWorldMap';
import { MapTokenPrompt } from './MapTokenPrompt';

interface MapboxMapProps {
  flights: Flight[];
  airports: Airport[];
  selectedFlight: Flight | null;
  selectedAirport: Airport | null;
  onFlightClick: (flight: Flight) => void;
  onAirportClick: (airport: Airport) => void;
  onMapClick: () => void;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

export const MapboxMap = ({
  flights,
  airports,
  selectedFlight,
  selectedAirport,
  onFlightClick,
  onAirportClick,
  onMapClick
}: MapboxMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [hasError, setHasError] = useState(false);
  const [showTokenPrompt, setShowTokenPrompt] = useState(true);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const handleMapClick = useCallback(() => {
    onMapClick();
  }, [onMapClick]);

  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) {
      if (!MAPBOX_TOKEN) {
        setHasError(true);
      }
      return;
    }

    try {
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [0, 20],
        zoom: 2,
        minZoom: 1,
        maxZoom: 12,
        accessToken: MAPBOX_TOKEN
      });

      newMap.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
      newMap.addControl(new mapboxgl.FullscreenControl(), 'bottom-right');

      newMap.on('style.load', () => {
        newMap.setPaintProperty('background', 'background-color', '#0a0e1a');
      });

      newMap.on('click', (e) => {
        const features = newMap.queryRenderedFeatures(e.point);
        if (features.length === 0) {
          handleMapClick();
        }
      });

      newMap.on('error', () => {
        setHasError(true);
      });

      mapRef.current = newMap;
      setMap(newMap);
      setShowTokenPrompt(false);

      return () => {
        newMap.remove();
      };
    } catch {
      setHasError(true);
    }
  }, [handleMapClick]);

  useEffect(() => {
    if (!map || !selectedFlight) return;

    map.flyTo({
      center: [
        selectedFlight.currentPosition.lng,
        selectedFlight.currentPosition.lat
      ],
      zoom: 5,
      duration: 1000,
      easing: (t) => t * (2 - t)
    });
  }, [map, selectedFlight?.id]);

  useEffect(() => {
    if (!map || !selectedAirport) return;

    map.flyTo({
      center: [selectedAirport.lng, selectedAirport.lat],
      zoom: 7,
      duration: 1000,
      easing: (t) => t * (2 - t)
    });
  }, [map, selectedAirport?.id]);

  if (hasError || !MAPBOX_TOKEN) {
    return (
      <div className="relative w-full h-full">
        <SimpleWorldMap
          flights={flights}
          airports={airports}
          selectedFlight={selectedFlight}
          selectedAirport={selectedAirport}
          onFlightClick={onFlightClick}
          onAirportClick={onAirportClick}
        />
        {showTokenPrompt && (
          <MapTokenPrompt onClose={() => setShowTokenPrompt(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      <FlightCanvas
        map={map}
        flights={flights}
        airports={airports}
        selectedFlight={selectedFlight}
        selectedAirport={selectedAirport}
        onFlightClick={onFlightClick}
        onAirportClick={onAirportClick}
      />
    </div>
  );
};
