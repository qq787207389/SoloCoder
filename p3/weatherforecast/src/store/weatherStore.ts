import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { City, WeatherData, FavoriteCity } from '../types';
import { weatherApi } from '../services/weatherApi';

interface WeatherStore {
  currentCity: City | null;
  weatherData: WeatherData | null;
  favoriteCities: FavoriteCity[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  searchResults: City[];
  
  setSearchQuery: (query: string) => void;
  searchCities: (query: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  fetchWeather: (cityId: string) => Promise<void>;
  fetchCurrentLocation: () => Promise<void>;
  addFavorite: (city: City) => void;
  removeFavorite: (cityId: string) => void;
  reorderFavorites: (fromIndex: number, toIndex: number) => void;
  clearSearch: () => void;
}

export const useWeatherStore = create<WeatherStore>()(
  persist(
    (set, get) => ({
      currentCity: null,
      weatherData: null,
      favoriteCities: [],
      isLoading: false,
      error: null,
      searchQuery: '',
      searchResults: [],

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      searchCities: async (query: string) => {
        set({ searchQuery: query });
        if (query.trim()) {
          const results = await weatherApi.searchCities(query);
          set({ searchResults: results });
        } else {
          set({ searchResults: [] });
        }
      },

      selectCity: async (city: City) => {
        set({ currentCity: city, searchResults: [], searchQuery: '' });
        await get().fetchWeather(city.id);
      },

      fetchWeather: async (cityId: string) => {
        set({ isLoading: true, error: null });
        try {
          const data = await weatherApi.getWeather(cityId);
          set({ weatherData: data });
        } catch (err) {
          set({ error: '获取天气数据失败' });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchCurrentLocation: async () => {
        set({ isLoading: true, error: null });
        try {
          const city = await weatherApi.getCurrentLocation();
          set({ currentCity: city });
          await get().fetchWeather(city.id);
        } catch (err) {
          set({ error: '获取位置失败' });
        } finally {
          set({ isLoading: false });
        }
      },

      addFavorite: (city: City) => {
        const { favoriteCities } = get();
        if (favoriteCities.length >= 10) {
          set({ error: '最多收藏10个城市' });
          return;
        }
        if (favoriteCities.find(c => c.id === city.id)) return;
        
        const newFavorite: FavoriteCity = {
          ...city,
          order: favoriteCities.length,
        };
        set({ favoriteCities: [...favoriteCities, newFavorite] });
      },

      removeFavorite: (cityId: string) => {
        const { favoriteCities } = get();
        const filtered = favoriteCities
          .filter(c => c.id !== cityId)
          .map((c, i) => ({ ...c, order: i }));
        set({ favoriteCities: filtered });
      },

      reorderFavorites: (fromIndex: number, toIndex: number) => {
        const { favoriteCities } = get();
        const result = [...favoriteCities];
        const [removed] = result.splice(fromIndex, 1);
        result.splice(toIndex, 0, removed);
        const reordered = result.map((c, i) => ({ ...c, order: i }));
        set({ favoriteCities: reordered });
      },

      clearSearch: () => {
        set({ searchQuery: '', searchResults: [] });
      },
    }),
    {
      name: 'weather-storage',
      partialize: (state) => ({
        favoriteCities: state.favoriteCities,
        currentCity: state.currentCity,
      }),
    }
  )
);
