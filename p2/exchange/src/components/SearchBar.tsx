import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ value, onChange, placeholder = '搜索物品...', className }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-2.5 bg-white rounded-full border transition-all',
        isFocused ? 'border-primary-500 shadow-md' : 'border-gray-200',
        className
      )}
    >
      <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      )}
    </div>
  );
}
