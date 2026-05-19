import type { City, WeatherData, WeatherCondition } from '../types';

export const CITIES: City[] = [
  { id: '1', name: '北京', country: '中国' },
  { id: '2', name: '上海', country: '中国' },
  { id: '3', name: '广州', country: '中国' },
  { id: '4', name: '深圳', country: '中国' },
  { id: '5', name: '杭州', country: '中国' },
  { id: '6', name: '成都', country: '中国' },
  { id: '7', name: '武汉', country: '中国' },
  { id: '8', name: '西安', country: '中国' },
  { id: '9', name: '南京', country: '中国' },
  { id: '10', name: '重庆', country: '中国' },
  { id: '11', name: '天津', country: '中国' },
  { id: '12', name: '苏州', country: '中国' },
  { id: '13', name: '长沙', country: '中国' },
  { id: '14', name: '青岛', country: '中国' },
  { id: '15', name: '大连', country: '中国' },
];

const CONDITIONS: WeatherCondition[] = ['sunny', 'cloudy', 'rainy', 'snowy', 'windy', 'foggy'];

function generateForecast(cityId: string): WeatherData {
  const city = CITIES.find(c => c.id === cityId) || CITIES[0];
  const baseTemp = 15 + Math.floor(Math.random() * 20);
  const condition = CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)];
  
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const today = new Date();
  
  const forecast = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dayCondition = CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)];
    
    return {
      date: date.toISOString().split('T')[0],
      dayOfWeek: days[date.getDay()],
      condition: dayCondition,
      maxTemp: baseTemp + Math.floor(Math.random() * 10) - 5 + i,
      minTemp: baseTemp - 10 + Math.floor(Math.random() * 8) - 4 + Math.floor(i / 2),
      humidity: 40 + Math.floor(Math.random() * 40),
      windSpeed: 5 + Math.floor(Math.random() * 25),
      precipitation: Math.floor(Math.random() * 100),
    };
  });

  return {
    city,
    current: {
      temperature: baseTemp,
      feelsLike: baseTemp - 2 + Math.floor(Math.random() * 5),
      condition,
      humidity: 45 + Math.floor(Math.random() * 35),
      windSpeed: 8 + Math.floor(Math.random() * 20),
      windDirection: ['东北', '东南', '西北', '西南', '东', '西', '南', '北'][Math.floor(Math.random() * 8)],
      pressure: 1000 + Math.floor(Math.random() * 30),
      visibility: 5 + Math.floor(Math.random() * 15),
      uvIndex: 1 + Math.floor(Math.random() * 10),
    },
    forecast,
    lastUpdated: new Date().toISOString(),
  };
}

export function getWeatherData(cityId: string): WeatherData {
  return generateForecast(cityId);
}

export function searchCities(query: string): City[] {
  if (!query.trim()) return [];
  return CITIES.filter(city => 
    city.name.toLowerCase().includes(query.toLowerCase())
  );
}
