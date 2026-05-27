import { LevelData, Beatmap, ObstacleData, CoinData } from '../types';

function generateBeatmap(bpm: number, duration: number, name: string): Beatmap {
  const beats: { time: number; intensity: number }[] = [];
  const beatInterval = 60 / bpm;
  const totalBeats = Math.floor(duration / beatInterval);
  
  for (let i = 0; i < totalBeats; i++) {
    beats.push({
      time: i * beatInterval,
      intensity: i % 4 === 0 ? 1 : 0.5 + Math.random() * 0.3,
    });
  }
  
  return {
    id: `beatmap_${name}`,
    name,
    bpm,
    beats,
    duration,
    musicUrl: '',
  };
}

function generateObstacles(bpm: number, duration: number): ObstacleData[] {
  const obstacles: ObstacleData[] = [];
  const beatInterval = 60 / bpm;
  const totalBeats = Math.floor(duration / beatInterval);
  
  const types: Array<'jump' | 'slide' | 'lane'> = ['jump', 'slide', 'lane'];
  let obstacleId = 0;
  
  for (let i = 4; i < totalBeats - 4; i++) {
    if (i % 2 !== 0) continue;
    
    const difficulty = i / totalBeats;
    
    if (Math.random() > 0.3 + difficulty * 0.3) continue;
    
    const type = types[Math.floor(Math.random() * types.length)];
    const lane = Math.floor(Math.random() * 3);
    
    obstacles.push({
      id: `obs_${obstacleId++}`,
      type,
      lane,
      beatTime: i * beatInterval,
    });
  }
  
  return obstacles;
}

function generateCoins(bpm: number, duration: number): CoinData[] {
  const coins: CoinData[] = [];
  const beatInterval = 60 / bpm;
  const totalBeats = Math.floor(duration / beatInterval);
  
  for (let i = 2; i < totalBeats - 2; i++) {
    if (Math.random() > 0.4) continue;
    
    coins.push({
      lane: Math.floor(Math.random() * 3),
      beatTime: i * beatInterval,
    });
  }
  
  return coins;
}

export function generateDemoLevel(
  id: string,
  name: string,
  artist: string,
  difficulty: 'easy' | 'normal' | 'hard' | 'expert',
  bpm: number,
  duration: number
): LevelData {
  const beatmap = generateBeatmap(bpm, duration, name);
  const obstacles = generateObstacles(bpm, duration);
  const coins = generateCoins(bpm, duration);
  
  return {
    id,
    name,
    artist,
    difficulty,
    bpm,
    musicUrl: '',
    beatmap,
    obstacles,
    coins,
    duration,
    unlocked: difficulty === 'easy' || difficulty === 'normal',
  };
}

export const DEMO_LEVELS: LevelData[] = [
  generateDemoLevel('level1', 'Neon Dawn', 'Synthwave Artist', 'easy', 110, 45),
  generateDemoLevel('level2', 'Cyber Pulse', 'Electronic Beats', 'normal', 128, 60),
  generateDemoLevel('level3', 'Digital Storm', 'Hard Dance', 'hard', 150, 75),
  generateDemoLevel('level4', 'Quantum Break', 'Speed Core', 'expert', 175, 90),
];
