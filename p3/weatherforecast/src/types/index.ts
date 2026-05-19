export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy' | 'foggy';

export interface City {
  id: string;
  name: string;
  country: string;
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  condition: WeatherCondition;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  pressure: number;
  visibility: number;
  uvIndex: number;
}

export interface DailyForecast {
  date: string;
  dayOfWeek: string;
  condition: WeatherCondition;
  maxTemp: number;
  minTemp: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
}

export interface WeatherData {
  city: City;
  current: CurrentWeather;
  forecast: DailyForecast[];
  lastUpdated: string;
}

export interface FavoriteCity extends City {
  order: number;
}

export type ThemeType = 'sunny' | 'cloudy' | 'rainy' | 'snowy';

export interface WeatherState {
  currentCity: City | null;
  weatherData: WeatherData | null;
  favoriteCities: FavoriteCity[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  searchResults: City[];
}
