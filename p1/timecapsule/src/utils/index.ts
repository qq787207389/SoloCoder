export const formatTimeRemaining = (ms: number): string => {
  if (ms <= 0) return '已解锁';

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const s = seconds % 60;
  const m = minutes % 60;
  const h = hours % 24;

  if (days > 0) {
    return `${days}天 ${h}时 ${m}分 ${s}秒`;
  }
  if (h > 0) {
    return `${h}时 ${m}分 ${s}秒`;
  }
  if (m > 0) {
    return `${m}分 ${s}秒`;
  }
  return `${s}秒`;
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const isUnlocked = (unlockTime: number): boolean => {
  return Date.now() >= unlockTime;
};

export const getTimeRemaining = (unlockTime: number): number => {
  return Math.max(0, unlockTime - Date.now());
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};
