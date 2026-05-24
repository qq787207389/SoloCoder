export enum FlightStatus {
  DEPARTING = 'departing',
  CRUISING = 'cruising',
  DESCENDING = 'descending',
  ARRIVED = 'arrived'
}

export interface Position {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface Airport {
  id: string;
  iata: string;
  icao: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  timezone: string;
}

export interface Airline {
  id: string;
  name: string;
  iata: string;
  icao: string;
  color: string;
}

export interface Flight {
  id: string;
  flightNumber: string;
  airline: Airline;
  departure: Airport;
  arrival: Airport;
  departureTime: Date;
  arrivalTime: Date;
  estimatedArrivalTime: Date;
  currentPosition: Position;
  altitude: number;
  speed: number;
  heading: number;
  status: FlightStatus;
  route: Position[];
  trail: Position[];
  delay?: number;
  progress: number;
  cruiseAltitude: number;
  cruiseSpeed: number;
}

export interface FilterOptions {
  airlines: string[];
  status: FlightStatus[];
  searchQuery: string;
}

export interface MapBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}
