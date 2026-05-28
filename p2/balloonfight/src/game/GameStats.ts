export interface PlayerStats {
  kills: number;
  survivalTime: number;
  deaths: number;
  powerUpsCollected: number;
  fallKills: number;
}

export interface Highlight {
  time: number;
  type: 'kill' | 'death' | 'powerup' | 'event' | 'fall_kill';
  description: string;
}

export interface GameStatsData {
  player1Stats: PlayerStats;
  player2Stats: PlayerStats;
  matchTime: number;
  highlights: Highlight[];
  winner: number | null;
}

export function createEmptyPlayerStats(): PlayerStats {
  return {
    kills: 0,
    survivalTime: 0,
    deaths: 0,
    powerUpsCollected: 0,
    fallKills: 0,
  };
}

export function createEmptyGameStats(): GameStatsData {
  return {
    player1Stats: createEmptyPlayerStats(),
    player2Stats: createEmptyPlayerStats(),
    matchTime: 0,
    highlights: [],
    winner: null,
  };
}

export function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
