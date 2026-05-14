import { EnhanceConfig } from '../types'

export const enhanceConfigs: Record<number, EnhanceConfig> = {
  0: { successRate: 1.0, degradeRate: 0, breakRate: 0, protectItem: false },
  1: { successRate: 0.95, degradeRate: 0, breakRate: 0, protectItem: false },
  2: { successRate: 0.90, degradeRate: 0, breakRate: 0, protectItem: false },
  3: { successRate: 0.85, degradeRate: 0.05, breakRate: 0, protectItem: false },
  4: { successRate: 0.80, degradeRate: 0.10, breakRate: 0, protectItem: false },
  5: { successRate: 0.75, degradeRate: 0.15, breakRate: 0, protectItem: false },
  6: { successRate: 0.70, degradeRate: 0.20, breakRate: 0, protectItem: false },
  7: { successRate: 0.65, degradeRate: 0.20, breakRate: 0.02, protectItem: false },
  8: { successRate: 0.60, degradeRate: 0.25, breakRate: 0.03, protectItem: false },
  9: { successRate: 0.55, degradeRate: 0.25, breakRate: 0.05, protectItem: false },
  10: { successRate: 0.50, degradeRate: 0.30, breakRate: 0.05, protectItem: false },
  11: { successRate: 0.45, degradeRate: 0.30, breakRate: 0.08, protectItem: false },
  12: { successRate: 0.40, degradeRate: 0.35, breakRate: 0.08, protectItem: false },
  13: { successRate: 0.35, degradeRate: 0.35, breakRate: 0.10, protectItem: false },
  14: { successRate: 0.30, degradeRate: 0.40, breakRate: 0.10, protectItem: false },
  15: { successRate: 0.25, degradeRate: 0.40, breakRate: 0.15, protectItem: false }
}

export const enhanceBonus = [0, 3, 6, 10, 15, 20, 26, 32, 40, 48, 60, 75, 90, 110, 130, 150]

export const protectItemChanceReduction = 0.5
