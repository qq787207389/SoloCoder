import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { CellProps } from '../../utils/columnTypes';

export function SelectCell({ value, onChange, column, isEditing, onEditStart, onEditEnd }: CellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const options = column.options?.selectOptions || [];
  const selectedOption = options.find((o) => o.id === value);

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
        width: Math.max(rect.width, 180),
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

  const handleSelect = (optionId: string | null) => {
    onChange(optionId);
    setIsOpen(false);
    onEditEnd();
  };

  return (
    <div ref={containerRef} className="relative w-full h-full" onClick={!isEditing ? onEditStart : undefined}>
      {!isEditing && (
        <div className="w-full h-full flex items-center px-3 py-2 cursor-pointer hover:bg-slate-50">
          {selectedOption ? (
            <span
              className="px-2 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: selectedOption.color }}
            >
              {selectedOption.name}
            </span>
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
          <div className="bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
            <button
              className="w-full px-3 py-2 text-left hover:bg-slate-50 text-slate-500 border-b border-slate-100"
              onClick={() => handleSelect(null)}
            >
              （空）
            </button>
            {options.map((option) => (
              <button
                key={option.id}
                className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2"
                onClick={() => handleSelect(option.id)}
              >
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: option.color }}
                />
                <span>{option.name}</span>
                {option.id === value && <span className="ml-auto text-blue-500">✓</span>}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
