interface TimelineEvent {
  time: number;
  type: 'character' | 'light' | 'screen' | 'particle' | 'camera';
  data: Record<string, unknown>;
}

interface ConcertTimeline {
  duration: number;
  bpm: number;
  audioUrl: string;
  events: TimelineEvent[];
}

export const concertScript: ConcertTimeline = {
  duration: 180,
  bpm: 128,
  audioUrl: '/concert.mp3',
  events: [
    { time: 0, type: 'screen', data: { type: 'text', text: 'VR SINGER 2024', effect: 'glow' } },
    { time: 0, type: 'light', data: { id: 'main', color: '#ffffff', intensity: 0.5 } },
    { time: 0, type: 'particle', data: { color: '#00ffff', count: 100, type: 'sparkle' } },
    
    { time: 5, type: 'character', data: { position: [0, 0, 0], animation: 'wave' } },
    { time: 5, type: 'screen', data: { type: 'text', text: '欢迎来到虚拟演唱会!', effect: 'fade' } },
    { time: 5, type: 'light', data: { id: 'main', intensity: 1 } },
    
    { time: 10, type: 'character', data: { position: [-3, 0, 0], animation: 'walk' } },
    { time: 10, type: 'light', data: { id: 'left', color: '#ff00ff', intensity: 1.2 } },
    { time: 10, type: 'particle', data: { color: '#ff00ff', count: 150 } },
    
    { time: 15, type: 'character', data: { position: [0, 0, 0], animation: 'dance' } },
    { time: 15, type: 'screen', data: { type: 'animation', effect: 'pulse' } },
    { time: 15, type: 'light', data: { id: 'main', color: '#ffff00', intensity: 1.5 } },
    { time: 15, type: 'particle', data: { type: 'glowstick', color: '#ffff00', count: 200 } },
    
    { time: 20, type: 'character', data: { position: [3, 0, 0], animation: 'sing' } },
    { time: 20, type: 'light', data: { id: 'right', color: '#00ff00', intensity: 1 } },
    
    { time: 25, type: 'character', data: { position: [0, 0, 0], animation: 'dance' } },
    { time: 25, type: 'light', data: { id: 'main', color: '#ff6600', intensity: 2 } },
    { time: 25, type: 'particle', data: { type: 'confetti', color: '#ff6600', count: 300, speed: 2 } },
    
    { time: 30, type: 'screen', data: { type: 'text', text: '🎵 副歌时间 🎵', effect: 'bounce' } },
    { time: 30, type: 'light', data: { id: 'left', color: '#ff0000', intensity: 1.5 } },
    { time: 30, type: 'light', data: { id: 'right', color: '#0000ff', intensity: 1.5 } },
    
    { time: 35, type: 'character', data: { position: [-2, 0, 2], animation: 'dance' } },
    { time: 35, type: 'particle', data: { color: '#ff0066', count: 250 } },
    
    { time: 40, type: 'character', data: { position: [2, 0, 2], animation: 'sing' } },
    { time: 40, type: 'light', data: { id: 'main', color: '#00ffff', intensity: 1.8 } },
    
    { time: 45, type: 'character', data: { position: [0, 0, 0], animation: 'wave' } },
    { time: 45, type: 'screen', data: { type: 'text', text: '一起唱!', effect: 'glow' } },
    { time: 45, type: 'particle', data: { color: '#ffffff', count: 400, speed: 1.5 } },
    
    { time: 50, type: 'character', data: { position: [0, 0, 0], animation: 'dance' } },
    { time: 50, type: 'light', data: { id: 'ambient', color: '#660066', intensity: 0.5 } },
    
    { time: 60, type: 'character', data: { position: [-4, 0, 0], animation: 'walk' } },
    { time: 60, type: 'light', data: { id: 'left', color: '#00ff66', intensity: 1.3 } },
    { time: 60, type: 'particle', data: { color: '#00ff66', count: 180 } },
    
    { time: 65, type: 'character', data: { position: [4, 0, 0], animation: 'dance' } },
    { time: 65, type: 'light', data: { id: 'right', color: '#6600ff', intensity: 1.3 } },
    
    { time: 70, type: 'screen', data: { type: 'animation', effect: 'rainbow' } },
    { time: 70, type: 'light', data: { id: 'main', color: '#ff00ff', intensity: 2 } },
    { time: 70, type: 'particle', data: { type: 'confetti', color: '#ff00ff', count: 350, speed: 2.5 } },
    
    { time: 75, type: 'character', data: { position: [0, 0, 0], animation: 'sing' } },
    { time: 75, type: 'light', data: { id: 'main', color: '#ffffff', intensity: 2.5 } },
    
    { time: 80, type: 'character', data: { position: [0, 0, 3], animation: 'dance' } },
    { time: 80, type: 'particle', data: { color: '#ffff00', count: 300 } },
    
    { time: 90, type: 'screen', data: { type: 'text', text: '🎤 感谢观看 🎤', effect: 'fade' } },
    { time: 90, type: 'light', data: { id: 'main', intensity: 0.8 } },
    { time: 90, type: 'light', data: { id: 'left', intensity: 0.5 } },
    { time: 90, type: 'light', data: { id: 'right', intensity: 0.5 } },
    { time: 90, type: 'particle', data: { color: '#ffffff', count: 500, speed: 1 } },
    
    { time: 100, type: 'character', data: { position: [0, 0, 0], animation: 'wave' } },
    { time: 100, type: 'light', data: { id: 'main', color: '#ffd700', intensity: 1.5 } },
  ],
};
