import { useEffect } from 'react';
import { useWeatherStore } from './store/weatherStore';
import { SearchBar } from './components/SearchBar';
import { CurrentWeather } from './components/CurrentWeather';
import { Forecast } from './components/Forecast';
import { Favorites } from './components/Favorites';
import { Skeleton } from './components/Skeleton';

const bgGradients: Record<string, string> = {
  sunny: 'from-orange-300 via-amber-200 to-yellow-100',
  cloudy: 'from-gray-300 via-slate-200 to-gray-100',
  rainy: 'from-blue-400 via-blue-300 to-cyan-200',
  snowy: 'from-blue-100 via-white to-gray-50',
  windy: 'from-teal-300 via-cyan-200 to-sky-100',
  foggy: 'from-gray-400 via-gray-300 to-slate-200',
};

function App() {
  const { weatherData, isLoading, fetchCurrentLocation, currentCity } = useWeatherStore();

  useEffect(() => {
    if (!currentCity) {
      fetchCurrentLocation();
    }
  }, []);

  const condition = weatherData?.current.condition || 'sunny';
  const bgGradient = bgGradients[condition] || bgGradients.sunny;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} transition-all duration-1000`}>
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">晴雨记</h1>
                <p className="text-sm text-gray-500">天气预报应用</p>
              </div>
            </div>
          </div>
          <SearchBar />
        </header>

        <main className="space-y-6">
          {isLoading ? (
            <Skeleton />
          ) : (
            <>
              <CurrentWeather />
              <Forecast />
              <Favorites />
            </>
          )}
        </main>

        <footer className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            © 2024 晴雨记 - 天气预报应用
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
