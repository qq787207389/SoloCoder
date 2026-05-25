
import { useGame } from '../context/GameContext';
import { getBuildingConfig } from '../utils/buildings';
import { TileType } from '../types';

export function InfoPanel() {
  const { state } = useGame();
  const { selectedPosition, map, buildings } = state;

  if (!selectedPosition) {
    return (
      <div className="absolute right-0 top-0 w-64 h-full bg-gray-900 bg-opacity-95 p-4 z-10">
        <h3 className="text-white font-bold mb-4">信息面板</h3>
        <p className="text-gray-400 text-sm">选择一个地块查看详情</p>
      </div>
    );
  }

  const tile = map[selectedPosition.y]?.[selectedPosition.x];
  if (!tile) return null;

  const building = tile.buildingId ? buildings.get(tile.buildingId) : null;
  const buildingConfig = building ? getBuildingConfig(building.type) : null;

  const getTileTypeName = (type: TileType) => {
    const names: Record<TileType, string> = {
      [TileType.EMPTY]: '空地',
      [TileType.ROAD]: '道路',
      [TileType.RESIDENTIAL]: '住宅区',
      [TileType.COMMERCIAL]: '商业区',
      [TileType.INDUSTRIAL]: '工业区',
      [TileType.WATER]: '水管',
      [TileType.ELECTRICITY]: '电线',
      [TileType.PARK]: '公园',
      [TileType.POLICE]: '警察局',
      [TileType.FIRE_STATION]: '消防局',
      [TileType.SCHOOL]: '学校',
      [TileType.HOSPITAL]: '医院'
    };
    return names[type] || type;
  };

  return (
    <div className="absolute right-0 top-0 w-64 h-full bg-gray-900 bg-opacity-95 p-4 z-10 overflow-y-auto">
      <h3 className="text-white font-bold mb-4">地块信息</h3>
      
      <div className="space-y-4">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-gray-400 text-xs mb-1">位置</div>
          <div className="text-white font-mono">({selectedPosition.x}, {selectedPosition.y})</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-gray-400 text-xs mb-1">类型</div>
          <div className="text-white font-bold">{getTileTypeName(tile.type)}</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-gray-400 text-xs mb-1">地价</div>
          <div className="text-yellow-400 font-mono">¥{tile.landValue}</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-gray-400 text-xs mb-1">污染</div>
          <div className={`font-mono ${tile.pollution > 5 ? 'text-red-400' : 'text-green-400'}`}>
            {tile.pollution}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-gray-400 text-xs mb-2">基础设施</div>
          <div className="flex gap-2">
            <span className={`px-2 py-1 rounded text-xs ${tile.hasWater ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-500'}`}>
              💧 水
            </span>
            <span className={`px-2 py-1 rounded text-xs ${tile.hasElectricity ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-500'}`}>
              ⚡ 电
            </span>
          </div>
        </div>

        {building && buildingConfig && (
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-2">建筑信息</div>
            <div className="space-y-2">
              <div className="text-white font-bold">{buildingConfig.name}</div>
              <div className="text-sm text-gray-300">
                <span className="text-gray-500">等级:</span> {building.level}
              </div>
              <div className="text-sm text-gray-300">
                <span className="text-gray-500">人口:</span> {building.population}/{building.maxPopulation}
              </div>
              <div className="text-sm text-gray-300">
                <span className="text-gray-500">工作岗位:</span> {building.jobs}/{building.maxJobs}
              </div>
              <div className="text-sm text-gray-300">
                <span className="text-gray-500">满意度:</span> 
                <span className={building.satisfaction >= 70 ? 'text-green-400' : 'text-red-400'}>
                  {' '}{Math.round(building.satisfaction)}%
                </span>
              </div>
              <div className="text-sm text-gray-300">
                <span className="text-gray-500">税收:</span> 
                <span className="text-green-400"> ¥{building.taxRevenue}/天</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${building.growthProgress}%` }}
                />
              </div>
              <div className="text-xs text-gray-500">生长进度</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
