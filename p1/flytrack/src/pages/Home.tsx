import { useCallback, useMemo } from 'react';
import { MapboxMap } from '../components/map/MapboxMap';
import { TopBar } from '../components/ui/TopBar';
import { FlightInfoPanel } from '../components/panels/FlightInfoPanel';
import { FilterPanel } from '../components/panels/FilterPanel';
import { AirportPanel } from '../components/panels/AirportPanel';
import { useFlightStore, useFilteredFlights } from '../store/useFlightStore';
import { useFlightSimulator } from '../hooks/useFlightSimulator';
import { AIRPORTS } from '../data/airports';
import type { Flight, Airport } from '../types';

export const Home = () => {
  const {
    selectedFlight,
    selectedAirport,
    isFilterPanelOpen,
    selectFlight,
    selectAirport,
    toggleFilterPanel
  } = useFlightStore();

  const filteredFlights = useFilteredFlights();

  useFlightSimulator();

  const handleFlightClick = useCallback((flight: Flight) => {
    selectFlight(flight);
  }, [selectFlight]);

  const handleAirportClick = useCallback((airport: Airport) => {
    selectAirport(airport);
  }, [selectAirport]);

  const handleMapClick = useCallback(() => {
    selectFlight(null);
    selectAirport(null);
  }, [selectFlight, selectAirport]);

  const handleCloseFlightPanel = useCallback(() => {
    selectFlight(null);
  }, [selectFlight]);

  const handleCloseAirportPanel = useCallback(() => {
    selectAirport(null);
  }, [selectAirport]);

  const arrivingFlights = useMemo(() => {
    if (!selectedAirport) return [];
    return filteredFlights.filter(
      (f) => f.arrival.id === selectedAirport.id
    );
  }, [selectedAirport, filteredFlights]);

  const departingFlights = useMemo(() => {
    if (!selectedAirport) return [];
    return filteredFlights.filter(
      (f) => f.departure.id === selectedAirport.id
    );
  }, [selectedAirport, filteredFlights]);

  return (
    <div className="w-full h-screen bg-[#0a0e1a] overflow-hidden">
      <TopBar
        onFilterClick={toggleFilterPanel}
        isFilterOpen={isFilterPanelOpen}
      />

      <FilterPanel
        isOpen={isFilterPanelOpen}
        onClose={toggleFilterPanel}
      />

      <div className="w-full h-full pt-16">
        <MapboxMap
          flights={filteredFlights}
          airports={AIRPORTS}
          selectedFlight={selectedFlight}
          selectedAirport={selectedAirport}
          onFlightClick={handleFlightClick}
          onAirportClick={handleAirportClick}
          onMapClick={handleMapClick}
        />
      </div>

      {selectedFlight && (
        <FlightInfoPanel
          flight={selectedFlight}
          onClose={handleCloseFlightPanel}
        />
      )}

      {selectedAirport && (
        <AirportPanel
          airport={selectedAirport}
          arrivingFlights={arrivingFlights}
          departingFlights={departingFlights}
          onClose={handleCloseAirportPanel}
          onFlightClick={handleFlightClick}
        />
      )}
    </div>
  );
};
