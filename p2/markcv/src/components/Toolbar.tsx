import React from 'react';
import { ThemeType, StyleSettings } from '../types';
import { THEMES, SAMPLE_RESUME } from '../constants';
import { exportToPDF, exportToMarkdown, importMarkdown } from '../utils/export';

interface ToolbarProps {
  theme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
  styleSettings: StyleSettings;
  onStyleChange: (settings: StyleSettings) => void;
  previewScale: number;
  onScaleChange: (scale: number) => void;
  markdown: string;
  onMarkdownChange: (markdown: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  theme,
  onThemeChange,
  styleSettings,
  onStyleChange,
  previewScale,
  onScaleChange,
  markdown,
  onMarkdownChange
}) => {
  const handleExportPDF = async () => {
    try {
      await exportToPDF('resume-content');
    } catch (error) {
      alert('PDF 导出失败，请重试');
    }
  };

  const handleExportMD = () => {
    exportToMarkdown(markdown);
  };

  const handleImportMD = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const content = await importMarkdown(file);
        onMarkdownChange(content);
      } catch (error) {
        alert('文件导入失败，请重试');
      }
    }
    e.target.value = '';
  };

  const handleLoadSample = () => {
    if (confirm('确定要加载示例内容吗？当前内容将被替换。')) {
      onMarkdownChange(SAMPLE_RESUME);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-800">MarkCV</h1>
          <span className="text-sm text-gray-500">在线简历编辑器</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">主题:</label>
            <select
              value={theme}
              onChange={(e) => onThemeChange(e.target.value as ThemeType)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(THEMES).map(([key, config]) => (
                <option key={key} value={key}>{config.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">缩放:</label>
            <select
              value={previewScale}
              onChange={(e) => onScaleChange(parseFloat(e.target.value))}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0.5}>50%</option>
              <option value={0.6}>60%</option>
              <option value={0.75}>75%</option>
              <option value={0.9}>90%</option>
              <option value={1}>100%</option>
            </select>
          </div>

          <div className="h-6 w-px bg-gray-300" />

          <button
            onClick={handleLoadSample}
            className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            加载示例
          </button>

          <label className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer">
            导入
            <input
              type="file"
              accept=".md,.txt"
              onChange={handleImportMD}
              className="hidden"
            />
          </label>

          <button
            onClick={handleExportMD}
            className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            导出 MD
          </button>

          <button
            onClick={handleExportPDF}
            className="px-4 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            导出 PDF
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            打印
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">字号:</label>
          <input
            type="number"
            value={styleSettings.fontSize}
            onChange={(e) => onStyleChange({ ...styleSettings, fontSize: parseInt(e.target.value) || 14 })}
            min={10}
            max={20}
            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">行高:</label>
          <input
            type="number"
            value={styleSettings.lineHeight}
            onChange={(e) => onStyleChange({ ...styleSettings, lineHeight: parseFloat(e.target.value) || 1.6 })}
            min={1}
            max={2.5}
            step={0.1}
            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
