import { useGameStore } from '@/store/gameStore'
import type { Character, SkillType } from '@/types'
import { SKILL_DEFINITIONS } from '@/config/constants'

export function BattleHUD() {
  const {
    phase,
    currentTurn,
    currentTeam,
    units,
    selectedUnitId,
    selectedSkillId,
    turnPhase,
    isAnimating,
    endTurn,
    selectSkill,
    selectUnit,
  } = useGameStore()

  const selectedUnit = units.find((u) => u.id === selectedUnitId)
  const playerUnits = units.filter((u) => u.team === 'player' && u.stats.hp > 0)
  const enemyUnits = units.filter((u) => u.team === 'enemy' && u.stats.hp > 0)

  if (phase !== 'player_turn' && phase !== 'enemy_turn') {
    return null
  }

  const handleSkillClick = (skillId: SkillType) => {
    if (!selectedUnit || isAnimating) return
    selectSkill(skillId)
  }

  const handleUnitClick = (unit: Character) => {
    if (isAnimating) return
    selectUnit(unit.id)
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-16 bg-slate-900/90 backdrop-blur border-b border-slate-700 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-6">
          <div className="text-white">
            <span className="text-slate-400 text-sm">回合</span>
            <span className="text-2xl font-bold ml-2">{currentTurn}</span>
          </div>
          <div className="h-8 w-px bg-slate-700" />
          <div className="flex items-center gap-2">
            <div
              className={`w-4 h-4 rounded-full ${
                currentTeam === 'player' ? 'bg-blue-500 animate-pulse' : 'bg-slate-600'
              }`}
            />
            <span
              className={`font-bold ${
                currentTeam === 'player' ? 'text-blue-400' : 'text-slate-400'
              }`}
            >
              玩家
            </span>
          </div>
          <div className="text-slate-600">VS</div>
          <div className="flex items-center gap-2">
            <div
              className={`w-4 h-4 rounded-full ${
                currentTeam === 'enemy' ? 'bg-red-500 animate-pulse' : 'bg-slate-600'
              }`}
            />
            <span
              className={`font-bold ${
                currentTeam === 'enemy' ? 'text-red-400' : 'text-slate-400'
              }`}
            >
              敌人
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-blue-400">●</span>
            <span className="text-white">{playerUnits.length}</span>
            <span className="text-slate-400">存活</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-red-400">●</span>
            <span className="text-white">{enemyUnits.length}</span>
            <span className="text-slate-400">存活</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {phase === 'player_turn' && !isAnimating && (
            <button
              onClick={endTurn}
              className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-colors"
            >
              结束回合
            </button>
          )}
          {phase === 'enemy_turn' && (
            <div className="px-6 py-2 bg-red-900/50 text-red-400 font-bold rounded-lg flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
              敌方回合中...
            </div>
          )}
        </div>
      </div>

      <div className="fixed left-4 top-24 w-64 bg-slate-900/90 backdrop-blur rounded-xl border border-slate-700 overflow-hidden z-40">
        <div className="p-3 bg-slate-800 border-b border-slate-700">
          <h3 className="text-white font-bold flex items-center gap-2">
            <span className="text-blue-400">●</span>
            我方小队
          </h3>
        </div>
        <div className="p-2 space-y-2">
          {playerUnits.map((unit) => (
            <div
              key={unit.id}
              onClick={() => handleUnitClick(unit)}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                selectedUnitId === unit.id
                  ? 'bg-blue-600/50 ring-2 ring-blue-400'
                  : 'bg-slate-800/50 hover:bg-slate-700/50'
              } ${unit.ap === 0 ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      unit.class === 'assault'
                        ? 'bg-red-500'
                        : unit.class === 'sniper'
                        ? 'bg-cyan-500'
                        : unit.class === 'medic'
                        ? 'bg-yellow-500'
                        : 'bg-teal-500'
                    }`}
                  >
                    {unit.class === 'assault'
                      ? '突'
                      : unit.class === 'sniper'
                      ? '狙'
                      : unit.class === 'medic'
                      ? '医'
                      : '工'}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{unit.name}</p>
                    <p className="text-slate-400 text-xs">
                      Lv.{unit.level} {unit.class === 'assault'
                        ? '突击兵'
                        : unit.class === 'sniper'
                        ? '狙击手'
                        : unit.class === 'medic'
                        ? '医疗兵'
                        : '工兵'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: unit.maxAp }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < unit.ap ? 'bg-blue-400' : 'bg-slate-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    unit.stats.hp / unit.stats.maxHp > 0.5
                      ? 'bg-green-500'
                      : unit.stats.hp / unit.stats.maxHp > 0.25
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${(unit.stats.hp / unit.stats.maxHp) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs">
                <span className="text-slate-400">
                  HP: {unit.stats.hp}/{unit.stats.maxHp}
                </span>
                <span className="text-amber-400">
                  EXP: {unit.exp}/{unit.expToNext}
                </span>
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {unit.isOverwatch && (
                  <span className="text-xs bg-purple-600 px-2 py-0.5 rounded text-white">
                    👁️ 警戒
                  </span>
                )}
                {unit.isSuppressed && (
                  <span className="text-xs bg-orange-600 px-2 py-0.5 rounded text-white">
                    💫 压制
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedUnit && (
        <div className="fixed right-4 top-24 w-72 bg-slate-900/90 backdrop-blur rounded-xl border border-slate-700 overflow-hidden z-40">
          <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600">
            <h3 className="text-white font-bold text-lg">{selectedUnit.name}</h3>
            <p className="text-blue-200 text-sm">
              {selectedUnit.class === 'assault'
                ? '突击兵'
                : selectedUnit.class === 'sniper'
                ? '狙击手'
                : selectedUnit.class === 'medic'
                ? '医疗兵'
                : '工兵'}
              {' '}Lv.{selectedUnit.level}
            </p>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <h4 className="text-slate-400 text-sm mb-2">属性</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">生命值</span>
                  <span className="text-white">
                    {selectedUnit.stats.hp}/{selectedUnit.stats.maxHp}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">移动力</span>
                  <span className="text-white">{selectedUnit.stats.moveRange}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">命中</span>
                  <span className="text-white">{selectedUnit.stats.aim}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">防御</span>
                  <span className="text-white">{selectedUnit.stats.defense}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">闪避</span>
                  <span className="text-white">{selectedUnit.stats.dodge}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">护甲</span>
                  <span className="text-white">{selectedUnit.stats.armor}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-slate-400 text-sm mb-2">
                当前武器: {selectedUnit.weapons[selectedUnit.currentWeaponIndex]?.name}
              </h4>
              <div className="bg-slate-800 p-3 rounded-lg text-sm">
                <div className="grid grid-cols-2 gap-1">
                  <span className="text-slate-400">伤害</span>
                  <span className="text-red-400">
                    {selectedUnit.weapons[selectedUnit.currentWeaponIndex]?.damage}
                  </span>
                  <span className="text-slate-400">命中</span>
                  <span className="text-yellow-400">
                    {selectedUnit.weapons[selectedUnit.currentWeaponIndex]?.accuracy}%
                  </span>
                  <span className="text-slate-400">射程</span>
                  <span className="text-blue-400">
                    {selectedUnit.weapons[selectedUnit.currentWeaponIndex]?.minRange}-
                    {selectedUnit.weapons[selectedUnit.currentWeaponIndex]?.range}
                  </span>
                  <span className="text-slate-400">弹药</span>
                  <span className="text-white">
                    {selectedUnit.weapons[selectedUnit.currentWeaponIndex]?.ammo}/
                    {selectedUnit.weapons[selectedUnit.currentWeaponIndex]?.maxAmmo}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-slate-400 text-sm mb-2">技能</h4>
              <div className="space-y-2">
                {selectedUnit.skills.map((skill) => {
                  const isAvailable =
                    skill.currentCooldown === 0 && selectedUnit.ap >= skill.apCost
                  const isSelected = selectedSkillId === skill.id
                  const canUse =
                    phase === 'player_turn' &&
                    turnPhase !== 'execute_action' &&
                    !isAnimating &&
                    isAvailable

                  return (
                    <button
                      key={skill.id}
                      onClick={() => canUse && handleSkillClick(skill.id)}
                      disabled={!canUse}
                      className={`w-full p-3 rounded-lg text-left transition-all ${
                        isSelected
                          ? 'bg-blue-600 ring-2 ring-blue-400'
                          : canUse
                          ? 'bg-slate-800 hover:bg-slate-700'
                          : 'bg-slate-800/50 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{skill.icon}</span>
                          <span className="text-white font-bold">{skill.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-400 text-sm">{skill.apCost} AP</span>
                          {skill.currentCooldown > 0 && (
                            <span className="text-red-400 text-sm">
                              CD: {skill.currentCooldown}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-slate-400 text-xs">{skill.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-900/90 backdrop-blur rounded-xl border border-slate-700 px-6 py-3 z-40">
        <div className="flex items-center gap-4 text-sm">
          {turnPhase === 'select_unit' && (
            <span className="text-slate-300">👆 点击选择一个单位</span>
          )}
          {turnPhase === 'select_action' && (
            <span className="text-slate-300">🎯 选择一个技能或点击其他单位</span>
          )}
          {turnPhase === 'select_target' && selectedSkillId && (
            <span className="text-blue-400">
              🎯 选择 {SKILL_DEFINITIONS[selectedSkillId].name} 的目标
              <span className="text-slate-500 ml-2">(点击空白处取消)</span>
            </span>
          )}
          {turnPhase === 'execute_action' && (
            <span className="text-amber-400 animate-pulse">⏳ 执行中...</span>
          )}
          {isAnimating && (
            <span className="text-amber-400 animate-pulse">⏳ 动画播放中...</span>
          )}
        </div>
      </div>
    </>
  )
}
