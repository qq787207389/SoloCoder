import { useRef } from 'react';
import { useStore } from '../store';
import { AppState } from '../types';

export const DataManager = () => {
  const { exportData, importData } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string) as AppState;
        if (data.boards && data.lists && data.cards) {
          importData(data);
          alert('数据导入成功！');
        } else {
          alert('无效的数据格式！');
        }
      } catch (error) {
        alert('文件解析失败！');
      }
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={exportData}
        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
      >
        <span>📤</span>
        <span className="hidden sm:inline">导出数据</span>
      </button>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
      >
        <span>📥</span>
        <span className="hidden sm:inline">导入数据</span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />
    </div>
  );
};
