import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { mockArtists } from '@/data/mockData';
import { Artist } from '@/types';

export const ArtistManager = () => {
  const [artists, setArtists] = useState<Artist[]>(mockArtists);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newArtist, setNewArtist] = useState(false);
  const [formData, setFormData] = useState<Artist>({
    id: '',
    name: '',
    genre: '',
    bio: '',
    imageUrl: '',
    videoUrl: '',
    stage: '',
    startTime: new Date(),
    endTime: new Date(),
  });

  const stages = ['Main Stage', 'Neon Stage', 'Techno Tent', 'Acoustic Stage', 'Bass Arena'];
  const genres = ['Electronic', 'Synthwave', 'Techno', 'Indie Pop', 'Dubstep', 'House', 'Hip Hop', 'Rock'];

  const handleEdit = (artist: Artist) => {
    setFormData(artist);
    setEditingId(artist.id);
  };

  const handleSave = () => {
    if (editingId) {
      setArtists(artists.map(a => a.id === editingId ? formData : a));
    } else {
      const newId = `artist-${Date.now()}`;
      setArtists([...artists, { ...formData, id: newId }]);
    }
    setEditingId(null);
    setNewArtist(false);
    setFormData({
      id: '',
      name: '',
      genre: '',
      bio: '',
      imageUrl: '',
      videoUrl: '',
      stage: '',
      startTime: new Date(),
      endTime: new Date(),
    });
  };

  const handleDelete = (id: string) => {
    setArtists(artists.filter(a => a.id !== id));
  };

  const formatTime = (date: Date) => {
    return date.toISOString().slice(11, 16);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Music className="w-6 h-6 text-festival-purple" />
          Artist Management
        </h2>
        <button
          onClick={() => setNewArtist(true)}
          className="px-4 py-2 bg-gradient-festival text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Artist
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {artists.map(artist => (
          <motion.div
            key={artist.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-xl group"
          >
            <div className="relative h-48">
              <img
                src={artist.imageUrl}
                alt={artist.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={() => handleEdit(artist)}
                  className="p-2 bg-black/50 rounded-lg text-white hover:bg-black/70 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(artist.id)}
                  className="p-2 bg-black/50 rounded-lg text-white hover:bg-red-500/50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-festival-purple/30 rounded text-xs">{artist.genre}</span>
                <span className="px-2 py-1 bg-festival-cyan/30 rounded text-xs">{artist.stage}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{artist.name}</h3>
              <p className="text-gray-400 text-sm mb-2 line-clamp-2">{artist.bio}</p>
              <div className="text-sm text-gray-400">
                {formatTime(artist.startTime)} - {formatTime(artist.endTime)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {(editingId || newArtist) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-6 bg-white/5 rounded-xl border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">
                {editingId ? 'Edit Artist' : 'Add New Artist'}
              </h3>
              <button
                onClick={() => {
                  setEditingId(null);
                  setNewArtist(false);
                }}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-festival-purple transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Genre</label>
                <select
                  value={formData.genre}
                  onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-festival-purple transition-colors"
                >
                  <option value="">Select genre</option>
                  {genres.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Stage</label>
                <select
                  value={formData.stage}
                  onChange={(e) => setFormData(prev => ({ ...prev, stage: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-festival-purple transition-colors"
                >
                  <option value="">Select stage</option>
                  {stages.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Image URL</label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-festival-purple transition-colors"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-festival-purple transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Start Time</label>
                <input
                  type="time"
                  value={formatTime(formData.startTime)}
                  onChange={(e) => {
                    const newDate = new Date(formData.startTime);
                    const [hours, minutes] = e.target.value.split(':');
                    newDate.setHours(Number(hours), Number(minutes));
                    setFormData(prev => ({ ...prev, startTime: newDate }));
                  }}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-festival-purple transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">End Time</label>
                <input
                  type="time"
                  value={formatTime(formData.endTime)}
                  onChange={(e) => {
                    const newDate = new Date(formData.endTime);
                    const [hours, minutes] = e.target.value.split(':');
                    newDate.setHours(Number(hours), Number(minutes));
                    setFormData(prev => ({ ...prev, endTime: newDate }));
                  }}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-festival-purple transition-colors"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={!formData.name || !formData.genre || !formData.stage || !formData.imageUrl}
              className="mt-4 px-6 py-2 bg-gradient-festival text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
