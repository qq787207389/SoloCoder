
import { useGame } from '../context/GameContext';
import { ToolType, BuildingType } from '../types';
import { getBuildingConfig } from '../utils/buildings';

const getToolCost = (type: ToolType): number | null => {
  switch (type) {
    case ToolType.ROAD:
      return 100;
    case ToolType.RESIDENTIAL:
    case ToolType.COMMERCIAL:
    case ToolType.INDUSTRIAL:
    case ToolType.WATER:
    case ToolType.ELECTRICITY:
      return 10;
    case ToolType.DEMOLISH:
      return -25;
    case ToolType.POLICE:
      return getBuildingConfig(BuildingType.POLICE).cost;
    case ToolType.FIRE_STATION:
      return getBuildingConfig(BuildingType.FIRE_STATION).cost;
    case ToolType.SCHOOL:
      return getBuildingConfig(BuildingType.SCHOOL).cost;
    case ToolType.HOSPITAL:
      return getBuildingConfig(BuildingType.HOSPITAL).cost;
    case ToolType.PARK:
      return getBuildingConfig(BuildingType.PARK).cost;
    default:
      return null;
  }
};

const formatCost = (cost: number | null): string => {
  if (cost === null) return '';
  if (cost < 0) return `+¥${Math.abs(cost)}`;
  if (cost >= 10000) return `¥${(cost / 10000).toFixed(1)}W`;
  if (cost >= 1000) return `¥${(cost / 1000).toFixed(0)}K`;
  return `¥${cost}`;
};

const tools: { type: ToolType; name: string; icon: string; category: string }[] = [
  { type: ToolType.SELECT, name: '选择', icon: '↖', category: '基础' },
  { type: ToolType.ROAD, name: '道路', icon: '━', category: '基础' },
  { type: ToolType.DEMOLISH, name: '拆除', icon: '✕', category: '基础' },
  { type: ToolType.RESIDENTIAL, name: '住宅', icon: '🏠', category: '区域' },
  { type: ToolType.COMMERCIAL, name: '商业', icon: '🏪', category: '区域' },
  { type: ToolType.INDUSTRIAL, name: '工业', icon: '🏭', category: '区域' },
  { type: ToolType.POLICE, name: '警局', icon: '🚓', category: '公共设施' },
  { type: ToolType.FIRE_STATION, name: '消防', icon: '🚒', category: '公共设施' },
  { type: ToolType.SCHOOL, name: '学校', icon: '🏫', category: '公共设施' },
  { type: ToolType.HOSPITAL, name: '医院', icon: '🏥', category: '公共设施' },
  { type: ToolType.PARK, name: '公园', icon: '🌳', category: '公共设施' },
];

const categories = ['基础', '区域', '公共设施'];

export function Toolbar() {
  const { state, dispatch } = useGame();

  return (
    <div className="absolute left-0 top-0 h-full w-24 bg-gray-900 bg-opacity-95 flex flex-col p-2 gap-1 z-10 overflow-y-auto">
      <div className="text-white text-xs font-bold mb-2 text-center border-b border-gray-700 pb-2">
        工具栏
      </div>
      
      {categories.map(category => (
        <div key={category} className="mb-2">
          <div className="text-gray-400 text-xs mb-1 px-1">{category}</div>
          <div className="flex flex-col gap-1">
            {tools
              .filter(t => t.category === category)
              .map(tool => {
                const cost = getToolCost(tool.type);
                const costText = formatCost(cost);
                const canAfford = cost === null || cost < 0 || state.money >= cost;
                
                return (
                  <button
                    key={tool.type}
                    onClick={() => dispatch({ type: 'SET_TOOL', payload: tool.type })}
                    className={`w-20 h-16 rounded-lg flex flex-col items-center justify-center transition-all duration-200 relative ${
                      state.selectedTool === tool.type
                        ? 'bg-orange-500 text-white shadow-lg scale-105'
                        : canAfford
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}
                    title={`${tool.name}${costText ? ` - ${costText}` : ''}`}
                    disabled={!canAfford}
                  >
                    <span className="text-lg">{tool.icon}</span>
                    <span className="text-[9px] mt-0.5">{tool.name}</span>
                    {costText && (
                      <span className={`text-[8px] font-mono ${
                        cost && cost < 0 ? 'text-green-400' : 
                        state.selectedTool === tool.type ? 'text-white' :
                        canAfford ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {costText}
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
