interface AvatarProps {
  color: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ color, name, size = 'md' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-14 h-14 text-base',
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-md hover:shadow-lg transition-shadow duration-300`}
      style={{
        background: `linear-gradient(135deg, ${color}, ${adjustColor(color, -30)})`,
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
