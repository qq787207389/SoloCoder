export const SENSOR_CONFIG = {
  temperature: {
    name: '温度',
    unit: '°C',
    min: 15,
    max: 35,
    warningMin: 18,
    warningMax: 32,
    color: '#ff6b6b'
  },
  humidity: {
    name: '湿度',
    unit: '%',
    min: 30,
    max: 90,
    warningMin: 40,
    warningMax: 80,
    color: '#4ecdc4'
  },
  light: {
    name: '光照',
    unit: 'Lux',
    min: 0,
    max: 100000,
    warningMin: 1000,
    warningMax: 80000,
    color: '#ffd93d'
  },
  co2: {
    name: 'CO₂浓度',
    unit: 'ppm',
    min: 300,
    max: 2000,
    warningMin: 400,
    warningMax: 1500,
    color: '#6c5ce7'
  },
  soilPh: {
    name: '土壤pH值',
    unit: 'pH',
    min: 4,
    max: 9,
    warningMin: 5.5,
    warningMax: 7.5,
    color: '#a8e6cf'
  }
};

export const DEVICE_CONFIG = {
  fan: { name: '风机', icon: '🌬️' },
  curtain: { name: '湿帘', icon: '💧' },
  light: { name: '补光灯', icon: '💡' }
};

export const ALARM_LEVELS = {
  info: { color: '#3498db', sound: 'info' },
  warning: { color: '#f39c12', sound: 'warning' },
  danger: { color: '#e74c3c', sound: 'danger' }
};

export const WS_CONFIG = {
  url: 'ws://localhost:8080/ws',
  reconnectInterval: 3000,
  maxReconnectAttempts: 10,
  heartbeatInterval: 30000,
  heartbeatTimeout: 10000
};
