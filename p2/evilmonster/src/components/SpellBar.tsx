import { useEffect, useState } from 'react';
import { getEngine } from '../game/engine';
import { SpellType } from '../types/game';
import { SPELL_CONFIGS } from '../game/config/spells';

interface SpellBarProps {
  selectedSpell: SpellType | null;
  onSelectSpell: (spell: SpellType | null) => void;
}

export default function SpellBar({ selectedSpell, onSelectSpell }: SpellBarProps) {
  const engine = getEngine();
  const [, forceUpdate] = useState({});

  useEffect(() => {
    return engine.subscribe(() => forceUpdate({}));
  }, [engine]);

  const { gameState } = engine;
  const spells: SpellType[] = ['fireball', 'lightning', 'heal'];

  const handleSpellClick = (spellType: SpellType) => {
    if (selectedSpell === spellType) {
      onSelectSpell(null);
    } else {
      const cooldown = engine.getSpellCooldown(spellType);
      const config = SPELL_CONFIGS[spellType];
      if (cooldown <= 0 && gameState.mana >= config.manaCost) {
        onSelectSpell(spellType);
      }
    }
  };

  return (
    <div className="h-20 bg-gradient-to-t from-gray-900 to-gray-800 border-t-2 border-yellow-700 flex items-center justify-center gap-6 px-6">
      <span className="text-yellow-400 font-bold mr-4">✨ 法术:</span>

      {spells.map((spellType) => {
        const config = SPELL_CONFIGS[spellType];
        const cooldown = engine.getSpellCooldown(spellType);
        const isOnCooldown = cooldown > 0;
        const notEnoughMana = gameState.mana < config.manaCost;
        const isSelected = selectedSpell === spellType;
        const cooldownPercent = isOnCooldown ? (cooldown / config.cooldown) * 100 : 0;

        let icon = '🔥';
        if (spellType === 'lightning') icon = '⚡';
        if (spellType === 'heal') icon = '💚';

        return (
          <button
            key={spellType}
            onClick={() => handleSpellClick(spellType)}
            disabled={isOnCooldown || notEnoughMana}
            className={`relative w-16 h-16 rounded-lg flex flex-col items-center justify-center transition-all ${
              isSelected
                ? 'ring-4 ring-yellow-400 bg-gray-700 scale-110'
                : isOnCooldown || notEnoughMana
                ? 'bg-gray-800 opacity-60 cursor-not-allowed'
                : 'bg-gray-700 hover:bg-gray-600 hover:scale-105'
            }`}
          >
            {isOnCooldown && (
              <div
                className="absolute inset-0 bg-black/60 rounded-lg overflow-hidden"
                style={{
                  clipPath: `inset(${100 - cooldownPercent}% 0 0 0)`,
                }}
              />
            )}
            <span className="text-2xl relative z-10">{icon}</span>
            <span className="text-xs text-gray-300 relative z-10 font-bold">
              {config.name}
            </span>
            {isOnCooldown && (
              <span className="absolute top-1 right-1 text-xs text-yellow-400 font-bold z-20">
                {Math.ceil(cooldown)}s
              </span>
            )}
          </button>
        );
      })}

      <div className="ml-8 text-sm text-gray-400">
        <div>💡 点击选择法术，然后点击地图释放</div>
        <div className="text-xs text-gray-500">再次点击取消选择</div>
      </div>
    </div>
  );
}
