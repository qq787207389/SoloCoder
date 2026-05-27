import { BACKPACKS } from '@/game/backpacks';
import { useGameStore } from '@/store/gameStore';
import type { CSSProperties } from 'react';
import './MainMenu.css';

export default function MainMenu() {
  const { startNewGame } = useGameStore();

  return (
    <div className="main-menu">
      <div className="menu-bg" />
      <div className="menu-content">
        <h1 className="game-title">背包探险</h1>
        <p className="game-subtitle">空间压力 · 地牢策略</p>

        <div className="backpack-selection">
          <h2 className="selection-title">选择你的背包</h2>
          <div className="backpack-cards">
            {BACKPACKS.map((backpack) => (
              <div
                key={backpack.id}
                className="backpack-card"
                onClick={() => startNewGame(backpack.id)}
                style={{ '--card-color': backpack.color } as CSSProperties}
              >
                <div className="backpack-icon">
                  <div className="backpack-preview">
                    <div
                      className="preview-grid"
                      style={{
                        gridTemplateColumns: `repeat(${backpack.width}, 8px)`,
                        gridTemplateRows: `repeat(${backpack.height}, 8px)`,
                      }}
                    >
                      {Array.from({ length: backpack.width * backpack.height }).map((_, i) => {
                        const x = i % backpack.width;
                        const y = Math.floor(i / backpack.width);
                        const inSlot = backpack.specialSlots.some(
                          (s) => x >= s.x && x < s.x + s.width && y >= s.y && y < s.y + s.height
                        );
                        return (
                          <div
                            key={i}
                            className={`preview-cell ${inSlot ? 'slot-cell' : ''}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="backpack-info">
                  <h3 className="backpack-name">{backpack.name}</h3>
                  <p className="backpack-desc">{backpack.description}</p>
                  <div className="backpack-stats">
                    <span>❤️ {backpack.baseStats.hp}</span>
                    <span>⚡ {backpack.baseStats.stamina}</span>
                    <span>⚔️ {backpack.baseStats.attack}</span>
                    <span>🛡️ {backpack.baseStats.defense}</span>
                  </div>
                  <div className="backpack-ability">
                    <strong>特性：</strong>{backpack.specialAbility}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="menu-footer">
          <p>提示：合理摆放物品是获胜的关键</p>
        </div>
      </div>
    </div>
  );
}
