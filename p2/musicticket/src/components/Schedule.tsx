import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin } from 'lucide-react';
import { mockArtists } from '@/data/mockData';

export const Schedule = () => {
  const [activeDay, setActiveDay] = useState(1);

  const day1Artists = mockArtists.filter((_, index) => index < 3);
  const day2Artists = mockArtists.filter((_, index) => index >= 3);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Schedule</h2>

      <div className="flex gap-4">
        <button
          onClick={() => setActiveDay(1)}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            activeDay === 1
              ? 'bg-gradient-festival text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          Day 1 - August 15
        </button>
        <button
          onClick={() => setActiveDay(2)}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            activeDay === 2
              ? 'bg-gradient-festival text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          Day 2 - August 16
        </button>
      </div>

      <div className="relative">
        <div className="absolute left-12 top-0 bottom-0 w-0.5 bg-gradient-to-b from-festival-purple via-festival-cyan to-festival-pink" />

        <div className="space-y-4">
          {(activeDay === 1 ? day1Artists : day2Artists).map((artist, index) => (
            <motion.div
              key={artist.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-24"
            >
              <div className="absolute left-8 top-0 w-8 h-8 rounded-full bg-festival-purple border-4 border-[#1a1a2e] flex items-center justify-center">
                <span className="text-white text-xs font-bold">{index + 1}</span>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
                <div className="flex items-start gap-4">
                  <img
                    src={artist.imageUrl}
                    alt={artist.name}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{artist.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="px-2 py-1 bg-festival-purple/30 rounded text-xs text-gray-300">
                        {artist.genre}
                      </span>
                      <span className="px-2 py-1 bg-festival-cyan/30 rounded text-xs text-gray-300">
                        {artist.stage}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{artist.bio}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(artist.startTime)} - {formatTime(artist.endTime)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {artist.stage}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
