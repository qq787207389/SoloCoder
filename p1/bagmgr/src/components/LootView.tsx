import { useGameStore } from '@/store/gameStore';
import { createItemInstance, getItemById } from '@/game/items';
import { RARITY_COLORS, ITEM_TYPE_NAMES, ELEMENT_NAMES } from '@/game/constants';
import './LootView.css';

export default function LootView() {
  const { player, keepLootItem, discardLootItem, exitCombat, setScreen, addItem } = useGameStore();

  const handleCollectAll = () => {
    for (const item of player.currentLoot) {
      addItem(item);
    }
    exitCombat();
  };

  const handleSkipAll = () => {
    exitCombat();
  };

  return (
    <div className="loot-view">
      <div className="loot-header">
        <h2>🎁 战利品</h2>
        <button className="btn btn-secondary" onClick={() => setScreen('inventory')}>
          📦 背包
        </button>
      </div>

      <div className="loot-content">
        {player.currentLoot.length > 0 ? (
          <div className="loot-items">
            {player.currentLoot.map((item) => {
              const template = getItemById(item.id.split('_')[0] + '_' + item.id.split('_')[1]);
              return (
                <div
                  key={item.id}
                  className="loot-item-card"
                  style={{ borderColor: RARITY_COLORS[item.rarity] }}
                >
                  <div className="loot-item-header">
                    <span className="item-icon">{item.icon}</span>
                    <span
                      className="item-name"
                      style={{ color: RARITY_COLORS[item.rarity] }}
                    >
                      {item.name}
                    </span>
                  </div>
                  <p className="item-desc">{item.description}</p>
                  <div className="item-tags">
                    <span className="tag type-tag">{ITEM_TYPE_NAMES[item.type]}</span>
                    {item.element !== 'none' && (
                      <span className="tag element-tag">{ELEMENT_NAMES[item.element]}</span>
                    )}
                    <span className="tag rarity-tag">{item.rarity}</span>
                  </div>
                  <div className="loot-actions">
                    <button
                      className="btn btn-primary btn-small"
                      onClick={() => keepLootItem(item.id)}
                    >
                      ✅ 保留
                    </button>
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => discardLootItem(item.id)}
                    >
                      ❌ 丢弃
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-loot">
            <p>没有更多战利品了</p>
          </div>
        )}
      </div>

      <div className="loot-footer">
        <button className="btn btn-primary" onClick={handleCollectAll}>
          🎒 全部收集
        </button>
        <button className="btn btn-secondary" onClick={handleSkipAll}>
          🚪 返回地牢
        </button>
      </div>
    </div>
  );
}
