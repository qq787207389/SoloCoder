export interface SensorData {
  id: string;
  name: string;
  type: SensorType;
  value: number;
  unit: string;
  timestamp: number;
  location: { x: number; y: number; z: number };
  status: 'normal' | 'warning' | 'danger';
  threshold: { min: number; max: number };
}

export type SensorType = 'temperature' | 'humidity' | 'light' | 'co2' | 'soilPh';

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  status: 'on' | 'off';
  runningTime: number;
  power: number;
}

export type DeviceType = 'fan' | 'curtain' | 'light';

export interface Alarm {
  id: string;
  sensorId: string;
  sensorName: string;
  level: 'info' | 'warning' | 'danger';
  message: string;
  timestamp: number;
  value: number;
  threshold: number;
  acknowledged: boolean;
}

export interface HistoryDataPoint {
  timestamp: number;
  [key: string]: number;
}

export interface AppState {
  sensors: SensorData[];
  devices: Device[];
  alarms: Alarm[];
  historyData: HistoryDataPoint[];
  wsStatus: 'connected' | 'disconnected' | 'connecting';
  isFullscreen: boolean;
  selectedSensor: string | null;
}

export type AppAction =
  | { type: 'UPDATE_SENSOR'; payload: SensorData }
  | { type: 'UPDATE_DEVICE'; payload: Device }
  | { type: 'ADD_ALARM'; payload: Alarm }
  | { type: 'ACKNOWLEDGE_ALARM'; payload: string }
  | { type: 'SET_HISTORY_DATA'; payload: HistoryDataPoint[] }
  | { type: 'SET_WS_STATUS'; payload: AppState['wsStatus'] }
  | { type: 'TOGGLE_FULLSCREEN' }
  | { type: 'SELECT_SENSOR'; payload: string | null };
