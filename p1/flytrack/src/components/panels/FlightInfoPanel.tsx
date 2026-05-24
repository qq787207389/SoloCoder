import { X, Plane, ArrowRight, MapPin, Clock, Gauge, Mountain, Calendar } from 'lucide-react';
import type { Flight } from '../../types';
import { formatTime, formatDuration } from '../../utils/geo';
import { getStatusColor } from '../../utils/canvas';

interface FlightInfoPanelProps {
  flight: Flight;
  onClose: () => void;
}

const getStatusText = (status: string): string => {
  switch (status) {
    case 'departing':
      return '爬升中';
    case 'cruising':
      return '巡航中';
    case 'descending':
      return '下降中';
    case 'arrived':
      return '已到达';
    default:
      return '未知';
  }
};

export const FlightInfoPanel = ({ flight, onClose }: FlightInfoPanelProps) => {
  const totalDuration =
    (flight.arrivalTime.getTime() - flight.departureTime.getTime()) / 60000;
  const remainingTime = totalDuration * (1 - flight.progress);

  return (
    <div className="absolute top-20 right-4 w-80 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden z-20 animate-slide-in">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getStatusColor(flight.status) }}
              />
              <span className="text-sm text-slate-400">
                {getStatusText(flight.status)}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white font-mono tracking-wider">
              {flight.flightNumber}
            </h2>
            <p className="text-sm text-slate-400">{flight.airline.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="flex items-center justify-between py-4 border-y border-slate-700/50">
          <div className="text-center flex-1">
            <div className="text-2xl font-bold text-white">
              {flight.departure.iata}
            </div>
            <div className="text-xs text-slate-500">
              {flight.departure.city}
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center px-4">
            <div className="w-full flex items-center gap-2">
              <Plane className="w-4 h-4 text-cyan-400" />
              <div className="flex-1 h-0.5 bg-gradient-to-r from-cyan-400 to-orange-500 rounded-full" />
              <ArrowRight className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-xs text-slate-500 mt-2">
              {formatDuration(totalDuration)}
            </div>
          </div>

          <div className="text-center flex-1">
            <div className="text-2xl font-bold text-white">
              {flight.arrival.iata}
            </div>
            <div className="text-xs text-slate-500">
              {flight.arrival.city}
            </div>
          </div>
        </div>

        <div className="mt-4 mb-3">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>进度</span>
            <span>{Math.round(flight.progress * 100)}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-cyan-300 rounded-full transition-all duration-500"
              style={{ width: `${flight.progress * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-slate-800/50 rounded-xl p-3">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Mountain className="w-3 h-3" />
              <span>高度</span>
            </div>
            <div className="text-lg font-bold text-white font-mono">
              {Math.round(flight.altitude).toLocaleString()}
              <span className="text-xs text-slate-500 ml-1">m</span>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-3">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Gauge className="w-3 h-3" />
              <span>速度</span>
            </div>
            <div className="text-lg font-bold text-white font-mono">
              {Math.round(flight.speed)}
              <span className="text-xs text-slate-500 ml-1">km/h</span>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-3">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Clock className="w-3 h-3" />
              <span>预计到达</span>
            </div>
            <div className="text-lg font-bold text-white font-mono">
              {formatTime(flight.estimatedArrivalTime)}
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-3">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Clock className="w-3 h-3" />
              <span>剩余时间</span>
            </div>
            <div className="text-lg font-bold text-white font-mono">
              {formatDuration(remainingTime)}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-3">
            <Calendar className="w-3 h-3" />
            <span>航班详情</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">出发时间</span>
              <span className="text-white">{formatTime(flight.departureTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">到达时间</span>
              <span className="text-white">{formatTime(flight.arrivalTime)}</span>
            </div>
            {flight.delay && flight.delay > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">延误</span>
                <span className="text-orange-400">+{flight.delay} 分钟</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">出发机场</span>
              <span className="text-white">{flight.departure.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">到达机场</span>
              <span className="text-white">{flight.arrival.name}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
