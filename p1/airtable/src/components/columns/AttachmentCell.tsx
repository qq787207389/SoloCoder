import { useState, useRef } from 'react';
import { Paperclip, X, Upload } from 'lucide-react';
import type { CellProps } from '../../utils/columnTypes';
import type { Attachment } from '../../store/types';

export function AttachmentCell({ value, onChange, isEditing, onEditStart, onEditEnd }: CellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachments = Array.isArray(value) ? (value as Attachment[]) : [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newAttachments: Attachment[] = Array.from(files).map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
        type: file.type,
      }));
      onChange([...attachments, ...newAttachments]);
    }
  };

  const handleRemove = (attachmentId: string) => {
    onChange(attachments.filter((a) => a.id !== attachmentId));
  };

  const toggleOpen = () => {
    if (!isEditing) {
      onEditStart();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <div
        className="w-full h-full flex items-center px-3 py-2 cursor-pointer hover:bg-slate-50 flex-wrap gap-1"
        onClick={toggleOpen}
      >
        {attachments.length > 0 ? (
          <>
            <Paperclip size={14} className="text-slate-400" />
            <span className="text-sm text-slate-600">{attachments.length} 个附件</span>
          </>
        ) : (
          <span className="text-slate-400">空</span>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-64 z-50 mt-1">
          <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
            <div className="mb-3">
              <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                <Upload size={16} className="text-slate-400" />
                <span className="text-sm text-slate-500">点击上传文件</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-2 p-2 bg-slate-50 rounded group"
                >
                  <Paperclip size={14} className="text-slate-400 flex-shrink-0" />
                  <span className="text-sm truncate flex-1">{attachment.name}</span>
                  <button
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(attachment.id);
                    }}
                  >
                    <X size={14} className="text-slate-500" />
                  </button>
                </div>
              ))}
            </div>

            <button
              className="mt-3 w-full px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 rounded"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onEditEnd();
              }}
            >
              完成
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
