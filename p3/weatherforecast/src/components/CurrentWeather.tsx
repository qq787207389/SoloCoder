import { useWeatherStore } from '../store/weatherStore';
import { WeatherIcon } from './WeatherIcon';

const conditionLabels: Record<string, string> = {
  sunny: '晴天',
  cloudy: '多云',
  rainy: '雨天',
  snowy: '雪天',
  windy: '大风',
  foggy: '雾天',
};

export function CurrentWeather() {
  const { weatherData, currentCity, addFavorite, favoriteCities, removeFavorite } = useWeatherStore();

  if (!weatherData || !currentCity) return null;

  const { current } = weatherData;
  const isFavorite = favoriteCities.some(c => c.id === currentCity.id);

  return (
    <div className="bg-white/85 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-xl">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{currentCity.name}</h1>
            <p className="text-gray-500">{currentCity.country}</p>
          </div>
        </div>
        <button
          onClick={() => isFavorite ? removeFavorite(currentCity.id) : addFavorite(currentCity)}
          className={`p-3 rounded-xl transition-all duration-200 ${
            isFavorite
              ? 'bg-red-100 text-red-500 hover:bg-red-200'
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-500'
          }`}
        >
          <svg className="w-6 h-6" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-6">
          <WeatherIcon condition={current.condition} size="xl" />
          <div>
            <div className="text-6xl md:text-7xl font-bold text-gray-800">
              {current.temperature}
              <span className="text-3xl">°C</span>
            </div>
            <p className="text-xl text-gray-500 mt-1">体感 {current.feelsLike}°C</p>
            <p className="text-lg text-gray-600 font-medium mt-2">{conditionLabels[current.condition]}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-2xl p-4 text-center">
          <svg className="w-8 h-8 text-blue-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
          <p className="text-gray-500 text-sm">湿度</p>
          <p className="text-xl font-bold text-gray-700">{current.humidity}%</p>
        </div>

        <div className="bg-green-50 rounded-2xl p-4 text-center">
          <svg className="w-8 h-8 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          <p className="text-gray-500 text-sm">风速</p>
          <p className="text-xl font-bold text-gray-700">{current.windSpeed} km/h</p>
        </div>

        <div className="bg-purple-50 rounded-2xl p-4 text-center">
          <svg className="w-8 h-8 text-purple-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-500 text-sm">气压</p>
          <p className="text-xl font-bold text-gray-700">{current.pressure} hPa</p>
        </div>

        <div className="bg-orange-50 rounded-2xl p-4 text-center">
          <svg className="w-8 h-8 text-orange-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <p className="text-gray-500 text-sm">能见度</p>
          <p className="text-xl font-bold text-gray-700">{current.visibility} km</p>
        </div>
      </div>
    </div>
  );
}
