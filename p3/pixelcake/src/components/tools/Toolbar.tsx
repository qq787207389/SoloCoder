import { useShallow } from 'zustand/react/shallow';
import {
  MousePointer2,
  Crop,
  Paintbrush,
  Eraser,
  Sticker,
  Type,
  Square,
  Circle,
  Lasso,
  Wand2,
  Palette,
  Hand,
  Move,
} from 'lucide-react';
import { useToolStore } from '@/store/useToolStore';
import { ToolType, TOOL_LABELS } from '@/types/tool';

const tools: { type: ToolType; icon: any; category: string }[] = [
  { type: 'select', icon: MousePointer2, category: '基础' },
  { type: 'move', icon: Move, category: '基础' },
  { type: 'hand', icon: Hand, category: '基础' },
  { type: 'crop', icon: Crop, category: '基础' },
  { type: 'brush', icon: Paintbrush, category: '绘图' },
  { type: 'eraser', icon: Eraser, category: '绘图' },
  { type: 'stamp', icon: Sticker, category: '绘图' },
  { type: 'gradient', icon: Palette, category: '绘图' },
  { type: 'text', icon: Type, category: '文本' },
  { type: 'rect-select', icon: Square, category: '选区' },
  { type: 'ellipse-select', icon: Circle, category: '选区' },
  { type: 'lasso-select', icon: Lasso, category: '选区' },
  { type: 'magic-wand', icon: Wand2, category: '选区' },
];

export default function Toolbar() {
  const { currentTool, setCurrentTool } = useToolStore(
    useShallow((state) => ({
      currentTool: state.currentTool,
      setCurrentTool: state.setCurrentTool,
    }))
  );

  const groupedTools = tools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, typeof tools>);

  return (
    <div className="p-3 border-b border-border-default">
      <div className="flex flex-wrap gap-1">
        {Object.entries(groupedTools).map(([category, categoryTools]) => (
          <div key={category} className="contents">
            {categoryTools.map((tool) => {
              const Icon = tool.icon;
              const isActive = currentTool === tool.type;
              
              return (
                <button
                  key={tool.type}
                  onClick={() => setCurrentTool(tool.type)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 ${
                    isActive
                      ? 'tool-btn-active shadow-lg'
                      : 'hover:bg-bg-tertiary text-text-secondary hover:text-text-primary'
                  }`}
                  title={TOOL_LABELS[tool.type]}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
