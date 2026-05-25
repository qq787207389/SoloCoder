import { useEffect } from 'react';
import { useGame } from '../context/GameContext';

export function Notifications() {
  const { state, dispatch } = useGame();
  const { notifications } = state;

  useEffect(() => {
    const timers: number[] = [];
    notifications.forEach(notification => {
      const timer = setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: notification.id });
      }, 5000);
      timers.push(timer);
    });
    return () => timers.forEach(t => clearTimeout(t));
  }, [notifications, dispatch]);

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-600 border-l-4 border-green-400';
      case 'warning':
        return 'bg-yellow-600 border-l-4 border-yellow-400';
      case 'error':
        return 'bg-red-600 border-l-4 border-red-400';
      default:
        return 'bg-blue-600 border-l-4 border-blue-400';
    }
  };

  return (
    <div className="absolute top-4 right-80 z-50 space-y-2 w-72">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`${getNotificationStyle(notification.type)} text-white px-4 py-3 rounded-r-lg shadow-lg transform transition-all duration-300 animate-slide-in`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{notification.message}</span>
            <button
              onClick={() => dispatch({ type: 'REMOVE_NOTIFICATION', payload: notification.id })}
              className="ml-4 text-white hover:text-gray-200 text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
