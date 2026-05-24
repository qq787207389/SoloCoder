import { create } from 'zustand';
import type { Flight, FilterOptions, FlightStatus, Airport } from '../types';

interface FlightState {
  flights: Flight[];
  selectedFlight: Flight | null;
  selectedAirport: Airport | null;
  filters: FilterOptions;
  isFilterPanelOpen: boolean;
  isAirportPanelOpen: boolean;

  setFlights: (flights: Flight[]) => void;
  updateFlight: (flightId: string, updatedFlight: Flight) => void;
  selectFlight: (flight: Flight | null) => void;
  selectAirport: (airport: Airport | null) => void;
  setFilters: (filters: Partial<FilterOptions>) => void;
  toggleFilterPanel: () => void;
  toggleAirportPanel: () => void;
  toggleAirlineFilter: (airlineId: string) => void;
  toggleStatusFilter: (status: FlightStatus) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
}

export const useFlightStore = create<FlightState>((set) => ({
  flights: [],
  selectedFlight: null,
  selectedAirport: null,
  filters: {
    airlines: [],
    status: [],
    searchQuery: ''
  },
  isFilterPanelOpen: false,
  isAirportPanelOpen: false,

  setFlights: (flights) => set({ flights }),

  updateFlight: (flightId, updatedFlight) =>
    set((state) => ({
      flights: state.flights.map((f) =>
        f.id === flightId ? updatedFlight : f
      ),
      selectedFlight:
        state.selectedFlight?.id === flightId
          ? updatedFlight
          : state.selectedFlight
    })),

  selectFlight: (flight) =>
    set({
      selectedFlight: flight,
      selectedAirport: null,
      isAirportPanelOpen: false
    }),

  selectAirport: (airport) =>
    set({
      selectedAirport: airport,
      selectedFlight: null,
      isAirportPanelOpen: !!airport
    }),

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    })),

  toggleFilterPanel: () =>
    set((state) => ({
      isFilterPanelOpen: !state.isFilterPanelOpen
    })),

  toggleAirportPanel: () =>
    set((state) => ({
      isAirportPanelOpen: !state.isAirportPanelOpen
    })),

  toggleAirlineFilter: (airlineId) =>
    set((state) => ({
      filters: {
        ...state.filters,
        airlines: state.filters.airlines.includes(airlineId)
          ? state.filters.airlines.filter((id) => id !== airlineId)
          : [...state.filters.airlines, airlineId]
      }
    })),

  toggleStatusFilter: (status) =>
    set((state) => ({
      filters: {
        ...state.filters,
        status: state.filters.status.includes(status)
          ? state.filters.status.filter((s) => s !== status)
          : [...state.filters.status, status]
      }
    })),

  setSearchQuery: (query) =>
    set((state) => ({
      filters: { ...state.filters, searchQuery: query }
    })),

  clearFilters: () =>
    set({
      filters: {
        airlines: [],
        status: [],
        searchQuery: ''
      }
    })
}));

export const useFilteredFlights = () => {
  const { flights, filters } = useFlightStore();

  return flights.filter((flight) => {
    if (
      filters.airlines.length > 0 &&
      !filters.airlines.includes(flight.airline.id)
    ) {
      return false;
    }

    if (
      filters.status.length > 0 &&
      !filters.status.includes(flight.status)
    ) {
      return false;
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      return (
        flight.flightNumber.toLowerCase().includes(query) ||
        flight.departure.iata.toLowerCase().includes(query) ||
        flight.arrival.iata.toLowerCase().includes(query) ||
        flight.departure.city.toLowerCase().includes(query) ||
        flight.arrival.city.toLowerCase().includes(query)
      );
    }

    return true;
  });
};
