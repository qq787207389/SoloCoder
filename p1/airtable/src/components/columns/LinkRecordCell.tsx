import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink } from 'lucide-react';
import type { CellProps } from '../../utils/columnTypes';
import type { TableRecord } from '../../store/types';
import { useTableStore } from '../../store/useTableStore';

interface LinkRecordCellProps extends CellProps {
  onRecordClick?: (tableId: string, recordId: string) => void;
}

export function LinkRecordCell({ value, onChange, column, isEditing, onEditStart, onEditEnd, onRecordClick }: LinkRecordCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const linkTableId = column.options?.linkTableId;
  const displayColumnId = column.options?.linkDisplayColumnId;

  const linkTable = useTableStore((state) => (linkTableId ? state.tables[linkTableId] : undefined));
  const linkRecords = useTableStore((state) => (linkTableId ? state.records[linkTableId] : undefined));

  const displayColumn = linkTable?.columns.find((c) => c.id === displayColumnId) || linkTable?.columns[0];
  const selectedRecord = value && linkRecords ? linkRecords[String(value)] : undefined;
  const displayValue = selectedRecord && displayColumn ? (selectedRecord.data[displayColumn.id] as string) : '';

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
        width: Math.max(rect.width, 220),
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

  const handleSelect = (recordId: string | null) => {
    onChange(recordId);
    setIsOpen(false);
    onEditEnd();
  };

  const handleClickRecord = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value && linkTableId && onRecordClick) {
      onRecordClick(linkTableId, String(value));
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full" onClick={!isEditing ? onEditStart : undefined}>
      {!isEditing && (
        <div className="w-full h-full flex items-center px-3 py-2 cursor-pointer hover:bg-slate-50 gap-1">
          {displayValue ? (
            <>
              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm hover:bg-blue-100 flex items-center gap-1">
                {String(displayValue)}
                {value && linkTableId && (
                  <button
                    onClick={handleClickRecord}
                    className="hover:bg-blue-200 rounded p-0.5 transition-colors"
                  >
                    <ExternalLink size={12} />
                  </button>
                )}
              </span>
            </>
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
            <button
              className="w-full px-3 py-2 text-left hover:bg-slate-50 text-slate-500 border-b border-slate-100 sticky top-0 bg-white"
              onClick={() => handleSelect(null)}
            >
              （空）
            </button>
            {linkRecords && Object.values(linkRecords).map((record) => {
              const r = record as TableRecord;
              const recordDisplayValue = displayColumn ? (r.data[displayColumn.id] as string) : r.id;
              return (
                <button
                  key={r.id}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2"
                  onClick={() => handleSelect(r.id)}
                >
                  <span className="truncate">{String(recordDisplayValue || r.id)}</span>
                  {r.id === value && <span className="ml-auto text-blue-500">✓</span>}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
