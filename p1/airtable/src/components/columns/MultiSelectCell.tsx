import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { CellProps } from '../../utils/columnTypes';

export function MultiSelectCell({ value, onChange, column, isEditing, onEditStart, onEditEnd }: CellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const options = column.options?.selectOptions || [];
  const selectedIds = Array.isArray(value) ? value : [];

  useEffect(() => {
    if (isEditing) {
      setIsOpen(true);
    }
  }, [isEditing]);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom,
        left: rect.left,
        width: Math.max(rect.width, 200),
      });
    } else {
      setDropdownPosition(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const isInContainer = containerRef.current?.contains(target);
      const isInDropdown = dropdownRef.current?.contains(target);
      
      if (!isInContainer && !isInDropdown) {
        setIsOpen(false);
        onEditEnd();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onEditEnd]);

  const handleToggle = (optionId: string) => {
    const newSelected = selectedIds.includes(optionId)
      ? selectedIds.filter((id) => id !== optionId)
      : [...selectedIds, optionId];
    onChange(newSelected);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full" onClick={!isEditing ? onEditStart : undefined}>
      {!isEditing && (
        <div className="w-full h-full flex items-center px-3 py-2 cursor-pointer hover:bg-slate-50 flex-wrap gap-1">
          {selectedIds.length > 0 ? (
            selectedIds.map((id) => {
              const option = options.find((o) => o.id === id);
              return option ? (
                <span
                  key={id}
                  className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: option.color }}
                >
                  {option.name}
                </span>
              ) : null;
            })
          ) : (
            <span className="text-slate-400">空</span>
          )}
        </div>
      )}

      {(isEditing || isOpen) && dropdownPosition && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[9999] mt-1"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
          }}
        >
          <div className="bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden max-h-[280px] overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.id}
                className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2"
                onClick={() => handleToggle(option.id)}
              >
                <span
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center ${selectedIds.includes(option.id) ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`}
                >
                  {selectedIds.includes(option.id) && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </span>
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: option.color }}
                />
                <span>{option.name}</span>
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
