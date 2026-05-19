import axios from 'axios';
import type { City, WeatherData } from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 5000,
});

export const weatherApi = {
  async getWeather(cityId: string): Promise<WeatherData> {
    const response = await api.get<WeatherData>(`/weather/${cityId}`);
    return response.data;
  },

  async searchCities(query: string): Promise<City[]> {
    const response = await api.get<City[]>('/cities/search', {
      params: { q: query },
    });
    return response.data;
  },

  async getCurrentLocation(): Promise<City> {
    const response = await api.get<City>('/location');
    return response.data;
  },

  async getAllCities(): Promise<City[]> {
    const response = await api.get<City[]>('/cities');
    return response.data;
  },
};
