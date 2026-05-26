import { useGameStore } from '../store/gameStore'
import { ModuleType, Resources } from '../types/game'

const MODULE_INFO: Record<ModuleType, { name: string; desc: string }> = {
  habitat: { name: '生活舱', desc: '船员居住，提供基础生命支持' },
  power: { name: '发电站', desc: '生产电力供应基地运作' },
  oxygen: { name: '氧气生成器', desc: '产生氧气维持生命' },
  storage: { name: '仓库', desc: '增加资源存储容量' },
  research: { name: '研究站', desc: '解锁新科技' },
  factory: { name: '加工厂', desc: '将原材料加工成高级材料' },
  nuclear: { name: '核电站', desc: '大量电力输出（需科技）' },
  bio_lab: { name: '生物实验室', desc: '研究深海生物' },
  defense: { name: '防御炮台', desc: '抵御生物攻击' }
}

const MODULE_COLORS: Record<ModuleType, string> = {
  habitat: '#4a9eff',
  power: '#ffaa00',
  oxygen: '#00ff88',
  storage: '#aa88ff',
  research: '#ff66aa',
  factory: '#888888',
  nuclear: '#00ffff',
  bio_lab: '#88ff44',
  defense: '#ff4444'
}

const RESOURCE_NAMES: Record<string, string> = {
  ore: '矿石',
  organic: '有机物',
  rare_ore: '稀有矿',
  crystal: '水晶',
  fuel: '燃料',
  biomass: '生物质',
  alloy: '合金',
  electronics: '电子'
}

const RESOURCE_COLORS: Record<string, string> = {
  ore: '#c0a080',
  organic: '#40c060',
  rare_ore: '#80a0ff',
  crystal: '#c080ff',
  fuel: '#ffc040',
  biomass: '#80ff80',
  alloy: '#a0a0a0',
  electronics: '#ff80c0'
}

const MODULE_COSTS: Record<ModuleType, Partial<Resources>> = {
  habitat: { ore: 50, alloy: 20 },
  power: { ore: 40, electronics: 10 },
  oxygen: { ore: 30, alloy: 15, electronics: 10 },
  storage: { ore: 60 },
  research: { ore: 80, alloy: 30, electronics: 20 },
  factory: { ore: 100, alloy: 50, electronics: 30 },
  nuclear: { rare_ore: 50, crystal: 20, electronics: 50 },
  bio_lab: { alloy: 40, electronics: 40, biomass: 30 },
  defense: { ore: 60, alloy: 30, electronics: 20 }
}

export function BuildPanel() {
  const { setBuildMode, buildMode, canAfford, technologies, resources } = useGameStore()

  const modules: ModuleType[] = ['habitat', 'power', 'oxygen', 'storage', 'research', 'factory', 'nuclear', 'bio_lab', 'defense']

  const isModuleUnlocked = (type: ModuleType): boolean => {
    if (type === 'nuclear') {
      return technologies.find(t => t.id === 'nuclear_power')?.unlocked ?? false
    }
    return true
  }

  const renderCost = (cost: Partial<Resources>) => {
    return Object.entries(cost).map(([key, value]) => {
      const have = (resources as any)[key] || 0
      const need = value || 0
      const enough = have >= need
      return (
        <span key={key} style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 3,
          marginRight: 6,
          marginBottom: 2,
          fontSize: 10,
          color: enough ? '#ccc' : '#f66'
        }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: RESOURCE_COLORS[key] || '#888',
            flexShrink: 0
          }} />
          <span>{RESOURCE_NAMES[key]}: {need}</span>
          {!enough && <span style={{ color: '#f66' }}>(缺{need - have})</span>}
        </span>
      )
    })
  }

  return (
    <div style={{
      background: 'rgba(10, 20, 40, 0.95)',
      borderRadius: 8,
      padding: 12,
      border: '1px solid #2a4a7a',
      maxHeight: '60vh',
      overflowY: 'auto'
    }}>
      <div style={{ fontSize: 14, fontWeight: 'bold', color: '#8af', marginBottom: 10 }}>
        🔧 建造模块
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {modules.map(type => {
          const unlocked = isModuleUnlocked(type)
          const affordable = canAfford(MODULE_COSTS[type])
          const info = MODULE_INFO[type]
          const selected = buildMode === type

          return (
            <button
              key={type}
              onClick={() => unlocked && setBuildMode(selected ? null : type)}
              disabled={!unlocked}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: 8,
                background: selected ? '#2a4a7a' : unlocked ? '#1a2a4a' : '#1a1a2a',
                border: `1px solid ${selected ? '#4a8aff' : unlocked ? (affordable ? '#2a4a7a' : '#4a2a2a') : '#333'}`,
                borderRadius: 6,
                cursor: unlocked ? 'pointer' : 'not-allowed',
                opacity: unlocked ? 1 : 0.5,
                textAlign: 'left'
              }}
            >
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: MODULE_COLORS[type],
                flexShrink: 0
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 'bold', color: '#fff' }}>
                    {info.name}
                  </div>
                  {!affordable && unlocked && (
                    <span style={{ fontSize: 10, color: '#f66' }}>资源不足</span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>
                  {info.desc}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {renderCost(MODULE_COSTS[type])}
                </div>
                {!unlocked && (
                  <div style={{ fontSize: 10, color: '#f66', marginTop: 4 }}>
                    ⚠️ 需要: 核能科技
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
