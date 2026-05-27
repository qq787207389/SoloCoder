import { useState, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import { RARITY_COLORS } from '@/game/constants';
import './AltarView.css';

const ALTAR_TYPES = [
  {
    type: 'sacrifice' as const,
    name: '献祭祭坛',
    description: '献祭一件物品，永久增强属性',
    icon: '🔥',
  },
  {
    type: 'blessing' as const,
    name: '祝福祭坛',
    description: '获得神圣祝福，恢复全部生命并增加上限',
    icon: '✨',
  },
  {
    type: 'curse' as const,
    name: '诅咒祭坛',
    description: '接受暗黑诅咒，获得强大力量但降低防御',
    icon: '💀',
  },
];

export default function AltarView() {
  const { player, setScreen, updatePlayer, removeItem, inventoryGrid } = useGameStore();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const handleSacrifice = useCallback(() => {
    if (!selectedItemId) return;

    const item = inventoryGrid?.items.get(selectedItemId);
    if (!item) return;

    removeItem(selectedItemId);
    setSelectedItemId(null);

    let bonus = '';
    const rarityBonus: Record<string, number> = {
      common: 1,
      uncommon: 2,
      rare: 3,
      epic: 5,
      legendary: 8,
    };

    const bonusValue = rarityBonus[item.rarity] || 1;

    if (item.type === 'weapon') {
      updatePlayer({ attack: player.attack + bonusValue });
      bonus = `攻击力 +${bonusValue}`;
    } else if (item.type === 'armor') {
      updatePlayer({ defense: player.defense + bonusValue });
      bonus = `防御力 +${bonusValue}`;
    } else if (item.type === 'potion' || item.type === 'food') {
      updatePlayer({ maxHp: player.maxHp + bonusValue * 5 });
      bonus = `最大生命 +${bonusValue * 5}`;
    } else {
      updatePlayer({ attack: player.attack + Math.floor(bonusValue / 2) });
      bonus = `攻击力 +${Math.floor(bonusValue / 2)}`;
    }

    setResult(`献祭成功！${bonus}`);
  }, [selectedItemId, inventoryGrid, removeItem, updatePlayer, player.attack, player.defense, player.maxHp]);

  const handleBlessing = useCallback(() => {
    updatePlayer({
      hp: player.maxHp + 20,
      maxHp: player.maxHp + 20,
      stamina: player.maxStamina,
    });
    setResult('获得神圣祝福！最大生命+20，完全恢复！');
  }, [player.maxHp, player.maxStamina, updatePlayer]);

  const handleCurse = useCallback(() => {
    updatePlayer({
      attack: player.attack + 5,
      defense: Math.max(0, player.defense - 3),
    });
    setResult('接受暗黑诅咒！攻击力+5，防御力-3');
  }, [player.attack, player.defense, updatePlayer]);

  return (
    <div className="altar-view">
      <div className="altar-header">
        <h2>⛪ 祭坛</h2>
        <button className="btn btn-secondary" onClick={() => setScreen('dungeon')}>
          离开祭坛
        </button>
      </div>

      <div className="altar-content">
        {result ? (
          <div className="altar-result">
            <p>{result}</p>
            <button className="btn btn-primary" onClick={() => setScreen('dungeon')}>
              继续冒险
            </button>
          </div>
        ) : (
          <div className="altar-options">
            <div className="altar-type sacrifice">
              <div className="altar-icon">🔥</div>
              <h3>献祭祭坛</h3>
              <p className="altar-desc">献祭一件物品，永久增强属性</p>

              <div className="item-selector">
                <p>选择要献祭的物品：</p>
                <div className="item-list">
                  {player.inventory.map((item) => (
                    <button
                      key={item.id}
                      className={`item-option ${selectedItemId === item.id ? 'selected' : ''}`}
                      style={{ borderColor: RARITY_COLORS[item.rarity] }}
                      onClick={() => setSelectedItemId(item.id)}
                    >
                      {item.icon} {item.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="btn btn-danger"
                onClick={handleSacrifice}
                disabled={!selectedItemId}
              >
                🔥 献祭
              </button>
            </div>

            <div className="altar-type blessing">
              <div className="altar-icon">✨</div>
              <h3>祝福祭坛</h3>
              <p className="altar-desc">获得神圣祝福，恢复全部生命并增加上限</p>
              <button className="btn btn-primary" onClick={handleBlessing}>
                ✨ 祈祷
              </button>
            </div>

            <div className="altar-type curse">
              <div className="altar-icon">💀</div>
              <h3>诅咒祭坛</h3>
              <p className="altar-desc">接受暗黑诅咒，获得强大力量但降低防御</p>
              <button className="btn btn-danger" onClick={handleCurse}>
                💀 接受诅咒
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
