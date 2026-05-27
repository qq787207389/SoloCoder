import { useState, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import { findAllCraftablePairs, executeCrafting } from '@/game/crafting';
import { getAccessibleItems } from '@/game/inventory';
import { RARITY_COLORS } from '@/game/constants';
import './CampView.css';

export default function CampView() {
  const { player, inventoryGrid, setScreen, updatePlayer, addItem } = useGameStore();
  const [craftingResult, setCraftingResult] = useState<string | null>(null);

  const handleRest = useCallback(() => {
    updatePlayer({
      hp: player.maxHp,
      stamina: player.maxStamina,
    });
    setCraftingResult('你在营地休息，恢复了全部生命和体力！');
  }, [player.maxHp, player.maxStamina, updatePlayer]);

  const handleCraft = useCallback(() => {
    if (!inventoryGrid) return;

    const craftable = findAllCraftablePairs(inventoryGrid);
    if (craftable.length === 0) {
      setCraftingResult('没有可以合成的物品对。尝试将可合成的物品相邻放置。');
      return;
    }

    const craft = craftable[0];
    if (craft.recipe && craft.materials) {
      const result = executeCrafting(inventoryGrid, craft.materials[0], craft.materials[1]);
      if (result.success && result.newItem) {
        addItem(result.newItem);
        setCraftingResult(`成功合成：${craft.recipe.name}！`);
      } else {
        setCraftingResult('合成失败：' + (result.reason || '未知原因'));
      }
    }
  }, [inventoryGrid, addItem]);

  const handleNextFloor = useCallback(() => {
    useGameStore.getState().goToNextFloor();
    setScreen('dungeon');
  }, [setScreen]);

  const craftablePairs = inventoryGrid ? findAllCraftablePairs(inventoryGrid) : [];

  return (
    <div className="camp-view">
      <div className="camp-header">
        <h2>🏕️ 营地</h2>
        <button className="btn btn-primary" onClick={() => setScreen('dungeon')}>
          返回地牢
        </button>
      </div>

      <div className="camp-content">
        <div className="camp-section">
          <h3>休息</h3>
          <p className="section-desc">在营地休息可以完全恢复生命和体力</p>
          <button className="btn btn-secondary" onClick={handleRest}>
            😴 休息
          </button>
        </div>

        <div className="camp-section">
          <h3>合成</h3>
          <p className="section-desc">将可合成的物品相邻放置后可以合成新物品</p>
          {craftablePairs.length > 0 ? (
            <div className="craftable-pairs">
              {craftablePairs.map((pair, index) => (
                <div key={index} className="craftable-pair">
                  <span className="pair-items">
                    {pair.materials?.map((m) => `${m.icon} ${m.name}`).join(' + ')}
                  </span>
                  <span className="pair-arrow">→</span>
                  <span className="pair-result">{pair.recipe?.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-craftable">暂无可合成的物品对</p>
          )}
          <button className="btn btn-secondary" onClick={handleCraft} disabled={craftablePairs.length === 0}>
            🔨 合成
          </button>
        </div>

        <div className="camp-section">
          <h3>继续冒险</h3>
          <p className="section-desc">准备好后前往下一层地牢</p>
          <button className="btn btn-primary" onClick={handleNextFloor}>
            ⬇️ 前往第 {player.currentFloor + 1} 层
          </button>
        </div>

        <div className="camp-section">
          <h3>背包整理</h3>
          <p className="section-desc">整理背包以优化物品布局</p>
          <button className="btn btn-secondary" onClick={() => setScreen('inventory')}>
            📦 打开背包
          </button>
        </div>
      </div>

      {craftingResult && (
        <div className="crafting-result">
          <p>{craftingResult}</p>
          <button className="btn btn-small" onClick={() => setCraftingResult(null)}>
            关闭
          </button>
        </div>
      )}
    </div>
  );
}
