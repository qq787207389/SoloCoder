export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

export const generateAvatar = (seed: string): string => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF8C42', '#6C5CE7'];
  const bgColor = colors[Math.abs(hashCode(seed)) % colors.length];
  const initial = seed.charAt(0).toUpperCase();
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
      <rect width="100" height="100" fill="${bgColor}"/>
      <text x="50" y="50" font-family="Arial, sans-serif" font-size="48" fill="white" text-anchor="middle" dy=".3em" font-weight="bold">${initial}</text>
    </svg>
  `)}`;
};

const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const danmakuColors = [
  '#FFFFFF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#FF8C42', '#6C5CE7', '#A8E6CF'
];

export const getRandomDanmakuColor = (): string => {
  return danmakuColors[Math.floor(Math.random() * danmakuColors.length)];
};

export const generateActivityCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};
