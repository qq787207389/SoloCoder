import { Search, Filter, Plane, Globe } from 'lucide-react';
import { useFlightStore } from '../../store/useFlightStore';

interface TopBarProps {
  onFilterClick: () => void;
  isFilterOpen: boolean;
}

export const TopBar = ({ onFilterClick, isFilterOpen }: TopBarProps) => {
  const { filters, setSearchQuery, flights } = useFlightStore();
  const activeFlightCount = flights.filter(f => f.status !== 'arrived').length;

  return (
    <div className="fixed top-0 left-0 right-0 z-20">
      <div className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  FlyTrack
                </h1>
                <p className="text-xs text-slate-500">全球航班实时追踪</p>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-700 mx-2" />

            <div className="flex items-center gap-2">
              <Plane className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-slate-300">
                <span className="font-mono text-white font-semibold">
                  {activeFlightCount}
                </span>{' '}
                架航班在线
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="搜索航班号、机场、城市..."
                value={filters.searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-72 pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
              />
              {filters.searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  ×
                </button>
              )}
            </div>

            <button
              onClick={onFilterClick}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                isFilterOpen
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                  : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm">筛选</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
