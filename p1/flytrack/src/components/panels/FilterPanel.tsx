import { X, PlaneTakeoff, PlaneLanding, RefreshCw } from 'lucide-react';
import { useFlightStore } from '../../store/useFlightStore';
import { AIRLINES } from '../../data/airlines';
import { FlightStatus } from '../../types';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const statusOptions: { value: FlightStatus; label: string }[] = [
  { value: FlightStatus.DEPARTING, label: '爬升中' },
  { value: FlightStatus.CRUISING, label: '巡航中' },
  { value: FlightStatus.DESCENDING, label: '下降中' }
];

export const FilterPanel = ({ isOpen, onClose }: FilterPanelProps) => {
  const {
    filters,
    toggleAirlineFilter,
    toggleStatusFilter,
    clearFilters
  } = useFlightStore();

  const hasActiveFilters =
    filters.airlines.length > 0 ||
    filters.status.length > 0;

  return (
    <div
      className={`fixed left-0 top-0 h-full w-80 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 z-30 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <h3 className="text-lg font-semibold text-white">筛选航班</h3>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                重置
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
              <PlaneTakeoff className="w-4 h-4" />
              飞行状态
            </h4>
            <div className="space-y-2">
              {statusOptions.map((status) => (
                <label
                  key={status.value}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={filters.status.includes(status.value)}
                    onChange={() => toggleStatusFilter(status.value)}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
                  />
                  <span className="text-sm text-slate-300">{status.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
              <PlaneLanding className="w-4 h-4" />
              航空公司
            </h4>
            <div className="space-y-1">
              {AIRLINES.map((airline) => (
                <label
                  key={airline.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={filters.airlines.includes(airline.id)}
                    onChange={() => toggleAirlineFilter(airline.id)}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
                  />
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: airline.color }}
                  />
                  <span className="text-sm text-slate-300 truncate flex-1">
                    {airline.name}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {airline.iata}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
