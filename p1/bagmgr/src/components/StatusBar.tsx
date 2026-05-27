import { useGameStore } from '@/store/gameStore';
import './StatusBar.css';

export default function StatusBar() {
  const { player, dungeon } = useGameStore();

  return (
    <div className="status-bar">
      <div className="status-section player-status">
        <div className="status-item">
          <span className="status-icon">❤️</span>
          <div className="bar-container">
            <div
              className="bar hp-bar"
              style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
            />
            <span className="bar-text">{player.hp} / {player.maxHp}</span>
          </div>
        </div>
        <div className="status-item">
          <span className="status-icon">⚡</span>
          <div className="bar-container">
            <div
              className="bar stamina-bar"
              style={{ width: `${(player.stamina / player.maxStamina) * 100}%` }}
            />
            <span className="bar-text">{player.stamina} / {player.maxStamina}</span>
          </div>
        </div>
      </div>

      <div className="status-section combat-status">
        <div className="stat">
          <span className="stat-icon">⚔️</span>
          <span className="stat-value">{player.attack}</span>
        </div>
        <div className="stat">
          <span className="stat-icon">🛡️</span>
          <span className="stat-value">{player.defense}</span>
        </div>
      </div>

      <div className="status-section progress-status">
        <div className="stat">
          <span className="stat-icon">💰</span>
          <span className="stat-value">{player.gold}</span>
        </div>
        <div className="stat">
          <span className="stat-icon">🏰</span>
          <span className="stat-value">第{player.currentFloor}层</span>
        </div>
        {dungeon && (
          <div className="stat">
            <span className="stat-icon">📍</span>
            <span className="stat-value">{dungeon.theme}</span>
          </div>
        )}
      </div>
    </div>
  );
}
