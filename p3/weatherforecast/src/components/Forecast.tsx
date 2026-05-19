import { useWeatherStore } from '../store/weatherStore';
import { WeatherIcon } from './WeatherIcon';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function Forecast() {
  const { weatherData } = useWeatherStore();

  if (!weatherData) return null;

  const { forecast } = weatherData;

  const chartData = forecast.map((day) => ({
    day: day.dayOfWeek,
    最高温: day.maxTemp,
    最低温: day.minTemp,
  }));

  return (
    <div className="bg-white/85 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-2xl">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        7 天天气预报
      </h2>

      <div className="h-64 md:h-80 mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="day" stroke="#6B7280" fontSize={12} />
            <YAxis stroke="#6B7280" fontSize={12} unit="°C" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
              }}
              labelStyle={{ color: '#374151', fontWeight: 'bold' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="最高温"
              stroke="#F59E0B"
              strokeWidth={3}
              dot={{ fill: '#F59E0B', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 8, fill: '#F59E0B' }}
            />
            <Line
              type="monotone"
              dataKey="最低温"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 8, fill: '#3B82F6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex gap-4 min-w-max">
          {forecast.map((day, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-28 md:w-32 p-4 bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow duration-200"
            >
              <p className="text-sm font-medium text-gray-500 text-center mb-2">{day.dayOfWeek}</p>
              <p className="text-xs text-gray-400 text-center mb-3">{day.date.slice(5)}</p>
              <div className="flex justify-center mb-3">
                <WeatherIcon condition={day.condition} size="md" />
              </div>
              <div className="text-center mb-2">
                <span className="text-lg font-bold text-orange-500">{day.maxTemp}°</span>
                <span className="text-gray-300 mx-1">/</span>
                <span className="text-lg font-bold text-blue-500">{day.minTemp}°</span>
              </div>
              <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                {day.windSpeed} km/h
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
