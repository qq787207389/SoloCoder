import { MessageCircle } from 'lucide-react';
import { CHANNELS } from '../types';
import { useChatStore } from '../store/useChatStore';
import { useWebSocket } from '../hooks/useWebSocket';

const channelIcons: Record<string, string> = {
  lobby: '🏠',
  tech: '💻',
  casual: '☕',
};

export function ChannelList() {
  const currentChannel = useChatStore((state) => state.currentChannel);
  const setCurrentChannel = useChatStore((state) => state.setCurrentChannel);
  const { joinChannel } = useWebSocket();

  const handleChannelChange = async (channelId: string) => {
    joinChannel(channelId);
    await setCurrentChannel(channelId);
  };

  return (
    <div className="p-4">
      <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
        <MessageCircle className="w-4 h-4" />
        聊天频道
      </h3>
      <div className="space-y-2">
        {CHANNELS.map((channel) => (
          <button
            key={channel.id}
            onClick={() => handleChannelChange(channel.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 text-left group ${
              currentChannel === channel.id
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/70'
            }`}
          >
            <span className="text-xl">{channelIcons[channel.id] || '💬'}</span>
            <div className="flex-1">
              <span className="font-semibold text-sm">{channel.name}</span>
              <p
                className={`text-xs mt-0.5 ${
                  currentChannel === channel.id
                    ? 'text-blue-100'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {channel.description}
              </p>
            </div>
            {currentChannel === channel.id && (
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
