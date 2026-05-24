import { X, MapPin, PlaneTakeoff, PlaneLanding, Clock, AlertCircle } from 'lucide-react';
import type { Airport, Flight } from '../../types';
import { formatTime } from '../../utils/geo';

interface AirportPanelProps {
  airport: Airport;
  arrivingFlights: Flight[];
  departingFlights: Flight[];
  onClose: () => void;
  onFlightClick: (flight: Flight) => void;
}

export const AirportPanel = ({
  airport,
  arrivingFlights,
  departingFlights,
  onClose,
  onFlightClick
}: AirportPanelProps) => {
  const delayedArrivals = arrivingFlights.filter(f => f.delay && f.delay > 0);
  const delayedDepartures = departingFlights.filter(f => f.delay && f.delay > 0);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 z-30 animate-slide-up">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between p-4 border-b border-slate-700/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {airport.name}
                <span className="text-sm font-mono text-slate-400">
                  ({airport.iata})
                </span>
              </h3>
              <p className="text-sm text-slate-400">
                {airport.city}, {airport.country}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {(delayedArrivals.length > 0 || delayedDepartures.length > 0) && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-orange-400">
                  {delayedArrivals.length + delayedDepartures.length} 架延误
                </span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-slate-700/50 max-h-80">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <PlaneLanding className="w-5 h-5 text-cyan-400" />
              <h4 className="font-semibold text-white">到达航班</h4>
              <span className="text-sm text-slate-500">
                ({arrivingFlights.length})
              </span>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {arrivingFlights.slice(0, 10).map((flight) => (
                <div
                  key={flight.id}
                  onClick={() => onFlightClick(flight)}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <div>
                    <div className="font-mono text-white text-sm">
                      {flight.flightNumber}
                    </div>
                    <div className="text-xs text-slate-500">
                      {flight.departure.city}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {formatTime(flight.estimatedArrivalTime)}
                    </div>
                    {flight.delay && flight.delay > 0 ? (
                      <div className="text-xs text-orange-400">
                        +{flight.delay}m
                      </div>
                    ) : (
                      <div className="text-xs text-green-400">准点</div>
                    )}
                  </div>
                </div>
              ))}
              {arrivingFlights.length === 0 && (
                <div className="text-center text-slate-500 py-8">
                  暂无到达航班
                </div>
              )}
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <PlaneTakeoff className="w-5 h-5 text-orange-400" />
              <h4 className="font-semibold text-white">出发航班</h4>
              <span className="text-sm text-slate-500">
                ({departingFlights.length})
              </span>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {departingFlights.slice(0, 10).map((flight) => (
                <div
                  key={flight.id}
                  onClick={() => onFlightClick(flight)}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <div>
                    <div className="font-mono text-white text-sm">
                      {flight.flightNumber}
                    </div>
                    <div className="text-xs text-slate-500">
                      {flight.arrival.city}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {formatTime(flight.departureTime)}
                    </div>
                    {flight.delay && flight.delay > 0 ? (
                      <div className="text-xs text-orange-400">
                        +{flight.delay}m
                      </div>
                    ) : (
                      <div className="text-xs text-green-400">准点</div>
                    )}
                  </div>
                </div>
              ))}
              {departingFlights.length === 0 && (
                <div className="text-center text-slate-500 py-8">
                  暂无出发航班
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
