import { RefreshCw } from 'lucide-react';
import { useRef, useState, useEffect, useCallback } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef(0);
  const isPullingRef = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;
    startYRef.current = e.touches[0].clientY;
    isPullingRef.current = true;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPullingRef.current || isRefreshing) return;

    const container = containerRef.current;
    if (!container) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;

    if (diff > 0 && container.scrollTop <= 0) {
      const distance = Math.min(diff * 0.5, 80);
      setPullDistance(distance);
    }
  }, [isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    isPullingRef.current = false;

    if (pullDistance > 50 && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(50);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, isRefreshing, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div ref={containerRef} className="overflow-y-auto -webkit-overflow-scrolling: touch">
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{ height: pullDistance }}
      >
        <RefreshCw
          className={`w-6 h-6 text-primary-500 ${isRefreshing ? 'animate-spin' : ''}`}
          style={{ transform: `rotate(${pullDistance * 3}deg)` }}
        />
      </div>
      {children}
    </div>
  );
}
