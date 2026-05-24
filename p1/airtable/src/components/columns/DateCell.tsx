import { useState, useEffect, useRef } from 'react';
import { format, isValid, parseISO } from 'date-fns';
import type { CellProps } from '../../utils/columnTypes';

export function DateCell({ value, onChange, isEditing, onEditStart, onEditEnd }: CellProps) {
  const [localValue, setLocalValue] = useState(value ? String(value) : '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value ? String(value) : '');
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.showPicker?.();
    }
  }, [isEditing]);

  const handleBlur = () => {
    if (localValue !== value) {
      onChange(localValue || null);
    }
    onEditEnd();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (localValue !== value) {
        onChange(localValue || null);
      }
      onEditEnd();
    } else if (e.key === 'Escape') {
      setLocalValue(value ? String(value) : '');
      onEditEnd();
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      if (isValid(date)) {
        return format(date, 'yyyy-MM-dd');
      }
    } catch {
      // ignore
    }
    return dateStr;
  };

  if (!isEditing) {
    return (
      <div
        className="w-full h-full flex items-center px-3 py-2 cursor-text hover:bg-slate-50"
        onClick={onEditStart}
      >
        {value ? (
          <span className="text-slate-700">{formatDate(String(value))}</span>
        ) : (
          <span className="text-slate-400">空</span>
        )}
      </div>
    );
  }

  return (
    <input
      ref={inputRef}
      type="date"
      className="w-full h-full px-3 py-2 border-2 border-blue-500 outline-none bg-white"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );
}
