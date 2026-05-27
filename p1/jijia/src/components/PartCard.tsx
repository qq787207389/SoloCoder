
import { Part, RARITY_COLORS, RARITY_NAMES, DAMAGE_TYPE_NAMES, PartType, PART_TYPE_NAMES } from '../types';

interface PartCardProps {
  part: Part;
  onClick?: () => void;
  selected?: boolean;
  showPrice?: boolean;
  showSellPrice?: boolean;
  disabled?: boolean;
}

export default function PartCard({
  part,
  onClick,
  selected = false,
  showPrice = false,
  showSellPrice = false,
  disabled = false,
}: PartCardProps) {
  const rarityColor = RARITY_COLORS[part.rarity];
  const rarityName = RARITY_NAMES[part.rarity];

  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`
        relative p-3 rounded-lg border-2 transition-all duration-200
        ${selected ? 'scale-105 z-10' : 'hover:scale-102'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        bg-gray-900/80 backdrop-blur-sm
      `}
      style={{
        borderColor: selected ? '#00f5d4' : rarityColor,
        boxShadow: selected ? `0 0 20px ${rarityColor}40` : 'none',
      }}
    >
      <div
        className="absolute top-0 right-0 px-2 py-0.5 text-xs font-bold rounded-bl"
        style={{ backgroundColor: rarityColor, color: '#000' }}
      >
        {rarityName}
      </div>

      <div className="font-bold text-white mb-1 pr-16" style={{ color: rarityColor }}>
        {part.name}
      </div>

      <div className="text-xs text-gray-400 mb-2">
        {PART_TYPE_NAMES[part.type as PartType]}
      </div>

      <div className="text-xs text-gray-300 mb-2 line-clamp-2">
        {part.description}
      </div>

      <div className="grid grid-cols-2 gap-1 text-xs mb-2">
        <div className="flex items-center gap-1">
          <span className="text-gray-500">重量:</span>
          <span className="text-yellow-400">{part.weight}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-500">能量:</span>
          <span className="text-cyan-400">{part.energyCost}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-500">耐久:</span>
          <span className="text-green-400">{part.durability}/{part.maxDurability}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-500">插槽:</span>
          <span className="text-purple-400">{part.slotCount}</span>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-2 mb-2">
        <div className="text-xs text-gray-400 mb-1">属性:</div>
        <div className="grid grid-cols-2 gap-1 text-xs">
          {part.stats.armor !== undefined && (
            <div className="text-blue-400">护甲 +{part.stats.armor}</div>
          )}
          {part.stats.damage !== undefined && (
            <div className="text-red-400">
              伤害 +{part.stats.damage}
              {part.damageType && ` (${DAMAGE_TYPE_NAMES[part.damageType]})`}
            </div>
          )}
          {part.stats.accuracy !== undefined && (
            <div className="text-yellow-400">精准 +{part.stats.accuracy}</div>
          )}
          {part.stats.range !== undefined && (
            <div className="text-orange-400">射程 +{part.stats.range}</div>
          )}
          {part.stats.mobility !== undefined && (
            <div className="text-green-400">机动 +{part.stats.mobility}</div>
          )}
          {part.stats.evasion !== undefined && (
            <div className="text-pink-400">闪避 +{part.stats.evasion}</div>
          )}
          {part.stats.maxEnergy !== undefined && (
            <div className="text-cyan-400">能量 +{part.stats.maxEnergy}</div>
          )}
          {part.stats.shield !== undefined && (
            <div className="text-indigo-400">护盾 +{part.stats.shield}</div>
          )}
          {part.stats.maxHealth !== undefined && (
            <div className="text-emerald-400">生命 +{part.stats.maxHealth}</div>
          )}
          {part.stats.actionPoints !== undefined && (
            <div className="text-amber-400">行动点 +{part.stats.actionPoints}</div>
          )}
        </div>
      </div>

      {part.affixes.length > 0 && (
        <div className="border-t border-gray-700 pt-2">
          <div className="text-xs text-gray-400 mb-1">词缀:</div>
          {part.affixes.map((affix) => (
            <div key={affix.id} className="text-xs text-amber-300">
              {affix.name}: {affix.description}
            </div>
          ))}
        </div>
      )}

      {showPrice && (
        <div className="mt-2 text-right font-bold text-yellow-400">
          💰 {part.price.toLocaleString()}
        </div>
      )}

      {showSellPrice && (
        <div className="mt-2 text-right font-bold text-yellow-400">
          出售 💰 {Math.floor(part.price * 0.5).toLocaleString()}
        </div>
      )}
    </div>
  );
}
