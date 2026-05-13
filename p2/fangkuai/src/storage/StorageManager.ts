export interface ScoreEntry {
  score: number;
  level: number;
  lines: number;
  date: string;
  mode: string;
}

export class StorageManager {
  private static readonly STORAGE_KEY = 'aoer_tetris_scores';
  private static readonly MAX_SCORES = 10;

  static getScores(): ScoreEntry[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load scores:', e);
    }
    return [];
  }

  static saveScore(score: number, level: number, lines: number, mode: string): void {
    try {
      const scores = this.getScores();
      const newEntry: ScoreEntry = {
        score,
        level,
        lines,
        mode,
        date: new Date().toLocaleDateString()
      };
      
      scores.push(newEntry);
      scores.sort((a, b) => b.score - a.score);
      
      const topScores = scores.slice(0, this.MAX_SCORES);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(topScores));
    } catch (e) {
      console.error('Failed to save score:', e);
    }
  }

  static getHighScore(mode?: string): number {
    const scores = this.getScores();
    if (mode) {
      const modeScores = scores.filter(s => s.mode === mode);
      return modeScores.length > 0 ? modeScores[0].score : 0;
    }
    return scores.length > 0 ? scores[0].score : 0;
  }

  static clearScores(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
