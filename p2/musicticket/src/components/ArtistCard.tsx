import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Music } from 'lucide-react';
import { Artist } from '@/types';

interface ArtistCardProps {
  artist: Artist;
}

export const ArtistCard = ({ artist }: ArtistCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative overflow-hidden rounded-xl group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
    >
      <div className="relative h-64 overflow-hidden">
        <img
          src={artist.imageUrl}
          alt={artist.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-20 h-20 rounded-full bg-festival-pink/80 flex items-center justify-center cursor-pointer hover:bg-festival-pink transition-colors">
            <Play className="w-10 h-10 text-white ml-1" fill="white" />
          </div>
        </motion.div>

        {artist.videoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-black/90 flex items-center justify-center"
          >
            <iframe
              width="100%"
              height="100%"
              src={artist.videoUrl}
              title={artist.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </motion.div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 bg-festival-purple/50 rounded-full text-xs font-medium">
            {artist.genre}
          </span>
          <span className="px-3 py-1 bg-festival-cyan/50 rounded-full text-xs font-medium">
            {artist.stage}
          </span>
        </div>
        <h3 className="text-xl font-bold text-white mb-1">{artist.name}</h3>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Music className="w-4 h-4" />
          <span>
            {new Date(artist.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            {' - '}
            {new Date(artist.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
