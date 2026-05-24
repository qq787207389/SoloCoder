import { useState, useEffect, useRef } from 'react';
import type { CellProps } from '../../utils/columnTypes';

export function TextCell({ value, onChange, isEditing, onEditStart, onEditEnd }: CellProps) {
  const [localValue, setLocalValue] = useState(String(value || ''));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(String(value || ''));
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
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
      setLocalValue(String(value || ''));
      onEditEnd();
    }
  };

  if (!isEditing) {
    return (
      <div
        className="w-full h-full flex items-center px-3 py-2 cursor-text truncate hover:bg-slate-50"
        onClick={onEditStart}
      >
        {String(value || '') || <span className="text-slate-400">空</span>}
      </div>
    );
  }

  return (
    <input
      ref={inputRef}
      type="text"
      className="w-full h-full px-3 py-2 border-2 border-blue-500 outline-none bg-white"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );
}
