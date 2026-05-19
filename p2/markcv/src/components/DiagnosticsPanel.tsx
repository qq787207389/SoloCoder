import React from 'react';
import { DiagnosticIssue } from '../types';

interface DiagnosticsPanelProps {
  issues: DiagnosticIssue[];
  isOpen: boolean;
  onToggle: () => void;
}

const DiagnosticsPanel: React.FC<DiagnosticsPanelProps> = ({ issues, isOpen, onToggle }) => {
  const errorCount = issues.filter(i => i.type === 'error').length;
  const warningCount = issues.filter(i => i.type === 'warning').length;
  const infoCount = issues.filter(i => i.type === 'info').length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return '💡';
      default:
        return '•';
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="border-t border-gray-200">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">简历诊断</span>
          {issues.length > 0 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-700">
              {issues.length} 条建议
            </span>
          )}
        </div>
        <span className="text-gray-500 text-sm">
          {isOpen ? '收起 ▲' : '展开 ▼'}
        </span>
      </button>
      
      {isOpen && (
        <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
          {issues.length === 0 ? (
            <div className="text-center py-4 text-green-600">
              ✅ 简历看起来很棒！继续保持
            </div>
          ) : (
            <>
              <div className="flex gap-4 text-sm">
                {errorCount > 0 && <span className="text-red-600">{errorCount} 个问题</span>}
                {warningCount > 0 && <span className="text-yellow-600">{warningCount} 个警告</span>}
                {infoCount > 0 && <span className="text-blue-600">{infoCount} 条建议</span>}
              </div>
              
              {issues.map((issue, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${getBgColor(issue.type)}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{getIcon(issue.type)}</span>
                    <div>
                      <div className="font-medium text-gray-800">{issue.message}</div>
                      <div className="text-sm text-gray-600 mt-1">{issue.suggestion}</div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DiagnosticsPanel;
