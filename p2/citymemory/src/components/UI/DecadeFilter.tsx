import type { Decade } from '../../types';
import { DECADE_OPTIONS } from '../../types';

interface DecadeFilterProps {
  selectedDecade: Decade | 'all';
  onChange: (decade: Decade | 'all') => void;
}

const DecadeFilter = ({ selectedDecade, onChange }: DecadeFilterProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {DECADE_OPTIONS.map((option) => {
        const isSelected = selectedDecade === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
              isSelected
                ? 'text-white shadow-md transform scale-105'
                : 'bg-nostalgic-cream text-nostalgic-brown hover:bg-nostalgic-creamDark'
            }`}
            style={isSelected ? { backgroundColor: option.color } : {}}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default DecadeFilter;
