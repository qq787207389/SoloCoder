import { useState, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import { getItemById, createItemInstance } from '@/game/items';
import { RARITY_COLORS } from '@/game/constants';
import './ShopView.css';

export default function ShopView() {
  const { player, setScreen, updatePlayer, addItem } = useGameStore();
  const [shopItems, setShopItems] = useState(() => {
    const items: { templateId: string; price: number; id: string }[] = [];
    const count = 5 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const templateId = 'item_' + (1 + Math.floor(Math.random() * 33));
      const template = getItemById(templateId);
      if (template) {
        items.push({
          templateId,
          price: Math.floor((template.price || 20) * (0.8 + Math.random() * 0.4)),
          id: `shop_${i}`,
        });
      }
    }
    return items;
  });

  const handleBuy = useCallback((item: { templateId: string; price: number; id: string }) => {
    if (player.gold < item.price) return;

    const newItem = createItemInstance(item.templateId);
    if (newItem && addItem(newItem)) {
      updatePlayer({ gold: player.gold - item.price });
      setShopItems((prev) => prev.filter((i) => i.id !== item.id));
    }
  }, [player.gold, updatePlayer, addItem]);

  return (
    <div className="shop-view">
      <div className="shop-header">
        <h2>💰 商人</h2>
        <div className="gold-display">💰 {player.gold} 金币</div>
        <button className="btn btn-secondary" onClick={() => setScreen('dungeon')}>
          离开商店
        </button>
      </div>

      <div className="shop-content">
        <div className="shop-items">
          {shopItems.map((item) => {
            const template = getItemById(item.templateId);
            if (!template) return null;
            const canAfford = player.gold >= item.price;

            return (
              <div
                key={item.id}
                className="shop-item-card"
                style={{ borderColor: RARITY_COLORS[template.rarity] }}
              >
                <div className="shop-item-header">
                  <span className="item-icon">{template.icon}</span>
                  <span className="item-name" style={{ color: RARITY_COLORS[template.rarity] }}>
                    {template.name}
                  </span>
                </div>
                <p className="item-desc">{template.description}</p>
                <div className="item-stats">
                  {template.stats.attack !== undefined && <span>⚔️ {template.stats.attack}</span>}
                  {template.stats.defense !== undefined && <span>🛡️ {template.stats.defense}</span>}
                  {template.stats.hp !== undefined && <span>❤️ {template.stats.hp}</span>}
                </div>
                <div className="shop-item-footer">
                  <span className="price">💰 {item.price}</span>
                  <button
                    className="btn btn-primary btn-small"
                    onClick={() => handleBuy(item)}
                    disabled={!canAfford}
                  >
                    {canAfford ? '购买' : '金币不足'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {shopItems.length === 0 && (
          <div className="empty-shop">
            <p>商店已空</p>
          </div>
        )}
      </div>
    </div>
  );
}
