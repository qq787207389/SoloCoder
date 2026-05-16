import React, { createContext, useContext, useReducer, useMemo, useCallback } from 'react';
import { AppState, AppAction, SensorData, Device, Alarm } from '../types';
import { SENSOR_CONFIG } from '../utils/constants';

const initialState: AppState = {
  sensors: [
    { id: 'temp-1', name: '室内温度1', type: 'temperature', value: 25, unit: '°C', timestamp: Date.now(), location: { x: 0, y: 2, z: 2 }, status: 'normal', threshold: { min: 18, max: 32 } },
    { id: 'hum-1', name: '室内湿度1', type: 'humidity', value: 65, unit: '%', timestamp: Date.now(), location: { x: 2, y: 2, z: 0 }, status: 'normal', threshold: { min: 40, max: 80 } },
    { id: 'light-1', name: '光照传感器1', type: 'light', value: 35000, unit: 'Lux', timestamp: Date.now(), location: { x: -2, y: 3, z: 0 }, status: 'normal', threshold: { min: 1000, max: 80000 } },
    { id: 'co2-1', name: 'CO₂传感器1', type: 'co2', value: 800, unit: 'ppm', timestamp: Date.now(), location: { x: 0, y: 1.5, z: -2 }, status: 'normal', threshold: { min: 400, max: 1500 } },
    { id: 'ph-1', name: '土壤pH1', type: 'soilPh', value: 6.5, unit: 'pH', timestamp: Date.now(), location: { x: 1, y: 0.5, z: 1 }, status: 'normal', threshold: { min: 5.5, max: 7.5 } },
  ],
  devices: [
    { id: 'fan-1', name: '风机1', type: 'fan', status: 'on', runningTime: 3600, power: 1500 },
    { id: 'fan-2', name: '风机2', type: 'fan', status: 'off', runningTime: 1800, power: 1500 },
    { id: 'curtain-1', name: '湿帘1', type: 'curtain', status: 'on', runningTime: 2400, power: 800 },
    { id: 'light-1', name: '补光灯1', type: 'light', status: 'off', runningTime: 0, power: 2000 },
  ],
  alarms: [],
  historyData: [],
  wsStatus: 'connecting',
  isFullscreen: false,
  selectedSensor: null,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'UPDATE_SENSOR': {
      const sensorIndex = state.sensors.findIndex(s => s.id === action.payload.id);
      if (sensorIndex >= 0) {
        const newSensors = [...state.sensors];
        newSensors[sensorIndex] = action.payload;
        return { ...state, sensors: newSensors };
      }
      return { ...state, sensors: [...state.sensors, action.payload] };
    }
    case 'UPDATE_DEVICE': {
      const deviceIndex = state.devices.findIndex(d => d.id === action.payload.id);
      if (deviceIndex >= 0) {
        const newDevices = [...state.devices];
        newDevices[deviceIndex] = action.payload;
        return { ...state, devices: newDevices };
      }
      return { ...state, devices: [...state.devices, action.payload] };
    }
    case 'ADD_ALARM':
      return { ...state, alarms: [action.payload, ...state.alarms].slice(0, 100) };
    case 'ACKNOWLEDGE_ALARM':
      return {
        ...state,
        alarms: state.alarms.map(a =>
          a.id === action.payload ? { ...a, acknowledged: true } : a
        ),
      };
    case 'SET_HISTORY_DATA':
      return { ...state, historyData: action.payload };
    case 'SET_WS_STATUS':
      return { ...state, wsStatus: action.payload };
    case 'TOGGLE_FULLSCREEN':
      return { ...state, isFullscreen: !state.isFullscreen };
    case 'SELECT_SENSOR':
      return { ...state, selectedSensor: action.payload };
    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  updateSensor: (sensor: SensorData) => void;
  updateDevice: (device: Device) => void;
  addAlarm: (alarm: Omit<Alarm, 'id' | 'timestamp'>) => void;
  acknowledgeAlarm: (id: string) => void;
  toggleFullscreen: () => void;
  selectSensor: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const updateSensor = useCallback((sensor: SensorData) => {
    const config = SENSOR_CONFIG[sensor.type];
    let status: SensorData['status'] = 'normal';
    if (sensor.value < config.warningMin || sensor.value > config.warningMax) {
      status = 'warning';
    }
    if (sensor.value < config.min || sensor.value > config.max) {
      status = 'danger';
    }
    dispatch({ type: 'UPDATE_SENSOR', payload: { ...sensor, status } });
  }, []);

  const updateDevice = useCallback((device: Device) => {
    dispatch({ type: 'UPDATE_DEVICE', payload: device });
  }, []);

  const addAlarm = useCallback((alarm: Omit<Alarm, 'id' | 'timestamp'>) => {
    const newAlarm: Alarm = {
      ...alarm,
      id: `alarm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    dispatch({ type: 'ADD_ALARM', payload: newAlarm });
  }, []);

  const acknowledgeAlarm = useCallback((id: string) => {
    dispatch({ type: 'ACKNOWLEDGE_ALARM', payload: id });
  }, []);

  const toggleFullscreen = useCallback(() => {
    dispatch({ type: 'TOGGLE_FULLSCREEN' });
  }, []);

  const selectSensor = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_SENSOR', payload: id });
  }, []);

  const contextValue = useMemo(
    () => ({
      state,
      dispatch,
      updateSensor,
      updateDevice,
      addAlarm,
      acknowledgeAlarm,
      toggleFullscreen,
      selectSensor,
    }),
    [state, updateSensor, updateDevice, addAlarm, acknowledgeAlarm, toggleFullscreen, selectSensor]
  );

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
