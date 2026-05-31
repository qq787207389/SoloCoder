import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Plus, Trash2, Power, PowerOff, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditorStore } from '@/store/useEditorStore';
import { 
  FilterType, 
  FILTER_LABELS, 
  FILTER_RANGES,
  DEFAULT_FILTER_PARAMS 
} from '@/types/layer';

const availableFilters: FilterType[] = [
  'brightness',
  'contrast',
  'saturation',
  'hue',
  'temperature',
  'blur',
  'sharpen',
  'noise',
  'vignette',
  'sepia',
  'invert',
];

export default function FilterPanel() {
  const { project, activeLayerId, addFilter, updateFilter, toggleFilter, removeFilter } = useEditorStore(
    useShallow((state) => ({
      project: state.project,
      activeLayerId: state.project?.activeLayerId,
      addFilter: state.addFilter,
      updateFilter: state.updateFilter,
      toggleFilter: state.toggleFilter,
      removeFilter: state.removeFilter,
    }))
  );
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState<Set<string>>(new Set());

  const activeLayer = project?.layers.find(l => l.id === activeLayerId);

  const toggleFilterExpanded = (filterId: string) => {
    setExpandedFilters(prev => {
      const next = new Set(prev);
      if (next.has(filterId)) {
        next.delete(filterId);
      } else {
        next.add(filterId);
      }
      return next;
    });
  };

  const handleAddFilter = (type: FilterType) => {
    if (activeLayerId) {
      addFilter(activeLayerId, type);
    }
    setShowAddMenu(false);
  };

  const handleFilterChange = (filterId: string, key: string, value: number) => {
    if (activeLayerId) {
      updateFilter(activeLayerId, filterId, { [key]: value });
    }
  };

  const getFilterValue = (filter: any) => {
    const params = filter.params;
    return params.value ?? params.radius ?? params.amount ?? params.intensity ?? 0;
  };

  const getFilterKey = (type: FilterType) => {
    const defaults = DEFAULT_FILTER_PARAMS[type];
    if ('value' in defaults) return 'value';
    if ('radius' in defaults) return 'radius';
    if ('amount' in defaults) return 'amount';
    if ('intensity' in defaults) return 'intensity';
    return 'value';
  };

  if (!activeLayer) {
    return (
      <div className="p-4 text-center text-text-muted text-sm">
        选择一个图层以添加滤镜
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 border-b border-border-default">
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加滤镜
          </button>
          
          {showAddMenu && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-bg-secondary border border-border-default rounded-lg shadow-xl py-1 max-h-64 overflow-y-auto z-50">
              {availableFilters.map((type) => (
                <button
                  key={type}
                  onClick={() => handleAddFilter(type)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-bg-tertiary flex items-center justify-between"
                >
                  <span>{FILTER_LABELS[type]}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {activeLayer.filters.length === 0 ? (
          <div className="text-center text-text-muted text-sm py-8">
            暂无滤镜
          </div>
        ) : (
            <AnimatePresence>
              {activeLayer.filters.map((filter, index) => {
                const isExpanded = expandedFilters.has(filter.id);
                const range = FILTER_RANGES[filter.type];
                const filterKey = getFilterKey(filter.type);
                const currentValue = getFilterValue(filter);

                return (
                  <motion.div
                    key={filter.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-2 bg-bg-tertiary/50 rounded-lg overflow-hidden"
                  >
                    <div 
                      className="flex items-center gap-2 px-2 py-2"
                    >
                      <button
                        onClick={() => toggleFilterExpanded(filter.id)}
                        className="flex-1 flex items-center gap-2"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-text-muted" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-text-muted" />
                        )}
                        <span className="text-sm font-medium">
                          {FILTER_LABELS[filter.type]}
                        </span>
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activeLayerId) {
                            toggleFilter(activeLayerId, filter.id);
                          }
                        }}
                        className="p-1 rounded hover:bg-bg-secondary transition-colors"
                        title={filter.enabled ? '禁用' : '启用'}
                      >
                        {filter.enabled ? (
                          <Power className="w-4 h-4 text-accent-secondary" />
                        ) : (
                          <PowerOff className="w-4 h-4 text-text-muted" />
                        )}
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activeLayerId) {
                            removeFilter(activeLayerId, filter.id);
                          }
                        }}
                        className="p-1 rounded hover:bg-bg-secondary transition-colors text-text-muted hover:text-red-400"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {isExpanded && filter.enabled && (
                      <div className="px-3 pb-3">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs text-text-secondary">
                          </span>
                          <span className="text-xs text-text-muted">
                            {currentValue.toFixed(1)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={range.min}
                          max={range.max}
                          step={range.step}
                          value={currentValue}
                          onChange={(e) => handleFilterChange(filter.id, filterKey, parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
        )}
      </div>
    </div>
  );
}
