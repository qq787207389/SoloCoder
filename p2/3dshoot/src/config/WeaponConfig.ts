export interface WeaponConfig {
  name: string
  damage: number
  fireRate: number
  magazineSize: number
  reloadTime: number
  spread: number
  spreadPerShot: number
  spreadRecovery: number
  recoil: { x: number; y: number }
  recoilRecovery: number
  bulletSpeed: number
  bulletDistance: number
  shellsEject: boolean
  muzzleFlash: boolean
  scopeZoom?: number
}

export const WEAPON_CONFIG: Record<string, WeaponConfig> = {
  pistol: {
    name: '手枪',
    damage: 25,
    fireRate: 0.3,
    magazineSize: 12,
    reloadTime: 1.5,
    spread: 0.02,
    spreadPerShot: 0.03,
    spreadRecovery: 0.08,
    recoil: { x: 0.15, y: 0.08 },
    recoilRecovery: 0.3,
    bulletSpeed: 400,
    bulletDistance: 50,
    shellsEject: true,
    muzzleFlash: true
  },
  rifle: {
    name: '突击步枪',
    damage: 30,
    fireRate: 0.1,
    magazineSize: 30,
    reloadTime: 2.5,
    spread: 0.03,
    spreadPerShot: 0.02,
    spreadRecovery: 0.05,
    recoil: { x: 0.2, y: 0.12 },
    recoilRecovery: 0.25,
    bulletSpeed: 500,
    bulletDistance: 80,
    shellsEject: true,
    muzzleFlash: true
  },
  sniper: {
    name: '狙击枪',
    damage: 100,
    fireRate: 1.5,
    magazineSize: 5,
    reloadTime: 3.0,
    spread: 0.005,
    spreadPerShot: 0.05,
    spreadRecovery: 0.1,
    recoil: { x: 0.5, y: 0.2 },
    recoilRecovery: 0.15,
    bulletSpeed: 800,
    bulletDistance: 200,
    shellsEject: true,
    muzzleFlash: true,
    scopeZoom: 4
  }
}

export const NETWORK_CONFIG = {
  serverUrl: 'ws://localhost:8080',
  tickRate: 60,
  interpolationDelay: 100,
  maxPredictionFrames: 5
}

export const GAME_CONFIG = {
  maxPlayers: 10,
  roundTime: 300,
  respawnTime: 5,
  killScore: 100,
  deathScore: -10
}
