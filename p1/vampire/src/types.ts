
export interface Vector2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'attack' | 'defense' | 'speed' | 'special';
  apply: (player: any) =&gt; void;
}

export interface EnemyType {
  name: string;
  color: number;
  size: number;
  speed: number;
  health: number;
  damage: number;
  exp: number;
  behavior: 'chase' | 'shoot' | 'split';
}

export interface Weapon {
  name: string;
  damage: number;
  fireRate: number;
  bulletSpeed: number;
  bulletSize: number;
  bulletCount: number;
  spread: number;
}

export interface GameStats {
  time: number;
  kills: number;
  level: number;
  highScore: number;
}
