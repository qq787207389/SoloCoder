import { GameMode, Leaderboard, LeaderboardEntry } from '../types';

const STORAGE_KEY = 'snake_evolution_leaderboard';
const PLAYER_NAME_KEY = 'snake_evolution_player_name';

const defaultLeaderboard: Leaderboard = {
  classic: [],
  battle: [],
  ai: []
};

export class StorageSystem {
  public static getLeaderboard(): Leaderboard {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return { ...defaultLeaderboard, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Error loading leaderboard:', e);
    }
    return { ...defaultLeaderboard };
  }

  public static saveLeaderboard(leaderboard: Leaderboard): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leaderboard));
    } catch (e) {
      console.error('Error saving leaderboard:', e);
    }
  }

  public static addScore(mode: GameMode, name: string, score: number): void {
    const leaderboard = this.getLeaderboard();
    const entry: LeaderboardEntry = {
      name,
      score,
      date: new Date().toLocaleDateString()
    };

    leaderboard[mode].push(entry);
    leaderboard[mode].sort((a, b) => b.score - a.score);
    leaderboard[mode] = leaderboard[mode].slice(0, 10);

    this.saveLeaderboard(leaderboard);
  }

  public static getTopScores(mode: GameMode, count: number = 10): LeaderboardEntry[] {
    const leaderboard = this.getLeaderboard();
    return leaderboard[mode].slice(0, count);
  }

  public static getPlayerName(): string {
    try {
      return localStorage.getItem(PLAYER_NAME_KEY) || 'Player';
    } catch (e) {
      return 'Player';
    }
  }

  public static setPlayerName(name: string): void {
    try {
      localStorage.setItem(PLAYER_NAME_KEY, name);
    } catch (e) {
      console.error('Error saving player name:', e);
    }
  }

  public static clearLeaderboard(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Error clearing leaderboard:', e);
    }
  }
}