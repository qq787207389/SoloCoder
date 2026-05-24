import { useState, useEffect, useRef } from 'react';
import type { CellProps } from '../../utils/columnTypes';

export function NumberCell({ value, onChange, column, isEditing, onEditStart, onEditEnd }: CellProps) {
  const precision = column.options?.numberPrecision ?? 2;
  const [localValue, setLocalValue] = useState(value !== null && value !== undefined ? String(value) : '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value !== null && value !== undefined ? String(value) : '');
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    const numValue = localValue === '' ? null : Number(localValue);
    if (numValue !== value && numValue !== null && !isNaN(numValue)) {
      const rounded = Number(numValue.toFixed(precision));
      onChange(rounded);
    } else if (localValue === '' && value !== null) {
      onChange(null);
    }
    onEditEnd();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setLocalValue(value !== null && value !== undefined ? String(value) : '');
      onEditEnd();
    }
  };

  if (!isEditing) {
    return (
      <div
        className="w-full h-full flex items-center px-3 py-2 cursor-text text-right font-mono hover:bg-slate-50"
        onClick={onEditStart}
      >
        {value !== null && value !== undefined ? Number(value).toFixed(precision) : <span className="text-slate-400">空</span>}
      </div>
    );
  }

  return (
    <input
      ref={inputRef}
      type="number"
      step="any"
      className="w-full h-full px-3 py-2 border-2 border-blue-500 outline-none bg-white text-right font-mono"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );
}
