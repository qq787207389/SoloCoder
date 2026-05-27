import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import { executePlayerAction, executeEnemyTurn, generateEnemyLoot } from '@/game/combat';
import { createItemInstance } from '@/game/items';
import { RARITY_COLORS } from '@/game/constants';
import './CombatView.css';

export default function CombatView() {
  const { player, exitCombat, setScreen, updateCombat, damagePlayer, setLoot, updatePlayer, consumeItem } = useGameStore();
  const [isAnimating, setIsAnimating] = useState(false);

  const combat = player.currentCombat;

  const handleSkillUse = useCallback(async (skillId: string) => {
    if (!combat || combat.isOver || combat.turn !== 'player' || isAnimating) return;

    setIsAnimating(true);

    const result = executePlayerAction(combat, skillId);
    updateCombat(result.newState);

    for (const itemId of result.consumedItemIds) {
      consumeItem(itemId);
    }

    const usedSkill = result.newState.player.skills.find((s) => s.id === skillId);
    if (usedSkill && usedSkill.type === 'heal' && usedSkill.damage < 0) {
      const healAmount = Math.abs(usedSkill.damage);
      updatePlayer({ hp: Math.min(player.maxHp, player.hp + healAmount) });
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    if (result.newState.isOver) {
      setIsAnimating(false);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    const enemyResult = executeEnemyTurn(result.newState);
    updateCombat(enemyResult);

    if (enemyResult.player.hp !== result.newState.player.hp) {
      const damage = Math.max(0, result.newState.player.hp - enemyResult.player.hp);
      damagePlayer(damage);
    }

    setIsAnimating(false);
  }, [combat, isAnimating, updateCombat, consumeItem, updatePlayer, damagePlayer, player.maxHp, player.hp]);

  const handleCombatEnd = useCallback(() => {
    if (!combat) return;

    if (combat.result === 'win' && combat.enemy) {
      const lootIds = generateEnemyLoot(combat.enemy);
      const items = lootIds
        .map((id) => createItemInstance(id))
        .filter((item): item is NonNullable<typeof item> => item !== null);
      setLoot(items);
    } else {
      exitCombat();
    }
  }, [combat, exitCombat, setLoot]);

  const handleFlee = useCallback(() => {
    if (!combat) return;
    const damage = Math.floor(combat.enemy.attack * 0.5);
    damagePlayer(damage);
    exitCombat();
  }, [combat, damagePlayer, exitCombat]);

  if (!combat) {
    return <div className="combat-view">加载战斗中...</div>;
  }

  return (
    <div className="combat-view">
      <div className="combat-header">
      <h2>⚔️ 战斗</h2>
      <span className="combat-round">回合 {combat.round}</span>
    </div>

    <div className="combat-arena">
      <div className="combatant enemy-side">
        <div className="combatant enemy">
          <div className="enemy-sprite" style={{ color: combat.enemy.color }}>
            {combat.enemy.sprite}
          </div>
          <div className="combatant-info">
            <h3 className="enemy-name">{combat.enemy.name}</h3>
            <div className="hp-bar">
              <div
                className="hp-fill enemy-hp" style={{ width: `${(combat.enemy.hp / combat.enemy.maxHp) * 100}%` }} />
              <span className="hp-text">{combat.enemy.hp} / {combat.enemy.maxHp}</span>
            </div>
            <div className="enemy-stats">
              <span>⚔️ {combat.enemy.attack}</span>
              <span>🛡️ {combat.enemy.defense}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="combatant player-side">
        <div className="combatant player">
          <div className="player-sprite">🧙</div>
          <div className="combatant-info">
            <h3>冒险者</h3>
            <div className="hp-bar">
              <div
                className="hp-fill player-hp" style={{ width: `${(combat.player.hp / combat.player.maxHp) * 100}%` }} />
              <span className="hp-text">{combat.player.hp} / {combat.player.maxHp}</span>
            </div>
            <div className="player-stats">
              <span>⚔️ {combat.player.attack}</span>
              <span>🛡️ {combat.player.defense}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="combat-log">
      <div className="log-content">
        {combat.log.slice(-5).map((log, i) => (
        <p key={i} className={i === combat.log.length - 1 ? 'latest' : ''}>{log}</p>
      ))}
      </div>
    </div>

    {combat.isOver ? (
      <div className="combat-result">
        {combat.result === 'win' ? (
          <>
            <h3 className="victory">🎉 胜利！</h3>
            <button className="btn btn-primary" onClick={handleCombatEnd}>
              收集战利品
            </button>
          </>
        ) : (
          <>
            <h3 className="defeat">💀 失败...</h3>
            <button className="btn btn-danger" onClick={() => setScreen('gameover')}>
              返回
            </button>
          </>
        )}
      </div>
    ) : (
      <div className="combat-skills">
      <div className="skills-panel">
        {combat.player.skills.map((skill) => (
          <button
            key={skill.id}
            className={`skill-button ${skill.type}`}
            disabled={combat.turn !== 'player' || isAnimating || skill.currentCooldown > 0}
            onClick={() => handleSkillUse(skill.id)}
          >
            <span className="skill-icon">{skill.icon}</span>
            <span className="skill-name">{skill.name}</span>
            {skill.damage > 0 && <span className="skill-damage">{skill.damage}</span>}
            {skill.currentCooldown > 0 && (
              <span className="skill-cooldown">{skill.currentCooldown}</span>
            )}
          </button>
        ))}
      </div>
      <button
        className="btn btn-secondary flee-button" onClick={handleFlee} disabled={isAnimating}>
        🏃 逃跑
      </button>
    </div>
    )}

    <div className="combat-accessible-items">
      <h4>可触及物品</h4>
      <div className="accessible-items-list">
        {combat.player.accessibleItems.map((item) => (
          <div
            key={item.id} className="accessible-item" style={{ borderColor: RARITY_COLORS[item.rarity] }}>
            <span className="item-icon">{item.icon}</span>
            <span className="item-name">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}
