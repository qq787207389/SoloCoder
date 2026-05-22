import type { Category } from '../types';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../types';
import { cn } from '../utils';

interface CategoryFilterProps {
  selected: Category | null;
  onSelect: (category: Category | null) => void;
}

const categories: (Category | null)[] = [null, 'books', 'home', 'digital', 'clothing', 'toys', 'sports', 'other'];

export default function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => {
        const isSelected = selected === category;
        const label = category ? CATEGORY_LABELS[category] : '全部';
        const icon = category ? CATEGORY_ICONS[category] : '🏠';

        return (
          <button
            key={category || 'all'}
            onClick={() => onSelect(category)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all btn-press',
              isSelected
                ? 'bg-primary-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            )}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
