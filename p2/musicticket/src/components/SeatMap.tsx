import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Seat } from '@/types';

const SEAT_COLORS = {
  available: 'bg-green-500/60 hover:bg-green-400 cursor-pointer',
  sold: 'bg-gray-700 cursor-not-allowed',
  locked: 'bg-yellow-500/60 cursor-not-allowed',
  selected: 'bg-festival-pink ring-2 ring-white ring-offset-2 ring-offset-black',
};

interface SeatMapProps {
  onClose: () => void;
}

export const SeatMap = ({ onClose }: SeatMapProps) => {
  const { seats, selectedSeats, selectSeat, deselectSeat, selectedTicketType, ticketTypes } = useStore();
  const [selectedSection, setSelectedSection] = useState<string>('all');

  const sections = useMemo(() => {
    return [...new Set(seats.map(s => s.section))].sort();
  }, [seats]);

  const filteredSeats = useMemo(() => {
    if (selectedSection === 'all') return seats;
    return seats.filter(s => s.section === selectedSection);
  }, [seats, selectedSection]);

  const groupedSeats = useMemo(() => {
    const groups: Record<string, Seat[]> = {};
    filteredSeats.forEach(seat => {
      const key = `${seat.section}-${seat.row}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(seat);
    });
    return groups;
  }, [filteredSeats]);

  const handleSeatClick = useCallback((seat: Seat) => {
    if (seat.status !== 'available') return;
    
    if (selectedSeats.includes(seat.id)) {
      deselectSeat(seat.id);
    } else {
      const ticketType = ticketTypes.find(t => t.id === selectedTicketType);
      if (ticketType && selectedSeats.length >= ticketType.remainingStock) return;
      selectSeat(seat.id);
    }
  }, [selectedSeats, selectSeat, deselectSeat, selectedTicketType, ticketTypes]);

  const ticketType = ticketTypes.find(t => t.id === selectedTicketType);
  const maxSelectable = ticketType?.remainingStock || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-[#1a1a2e] border border-white/10"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Select Your Seats</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="p-4 border-b border-white/10">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500/60" />
              <span className="text-gray-400 text-sm">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-700" />
              <span className="text-gray-400 text-sm">Sold</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500/60" />
              <span className="text-gray-400 text-sm">Locked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-festival-pink ring-2 ring-white" />
              <span className="text-gray-400 text-sm">Selected</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSection('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedSection === 'all'
                  ? 'bg-festival-purple text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              All Sections
            </button>
            {sections.map(section => (
              <button
                key={section}
                onClick={() => setSelectedSection(section)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedSection === section
                    ? 'bg-festival-purple text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                Section {section}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[50vh]">
          <div className="space-y-2">
            {Object.entries(groupedSeats).map(([key, rowSeats]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-gray-400 text-sm w-16">{rowSeats[0]?.section} {rowSeats[0]?.row}</span>
                <div className="flex gap-1 flex-wrap">
                  {rowSeats.map(seat => (
                    <motion.button
                      key={seat.id}
                      onClick={() => handleSeatClick(seat)}
                      className={`w-8 h-8 rounded text-xs font-medium transition-all ${SEAT_COLORS[seat.status]}`}
                      whileHover={seat.status === 'available' ? { scale: 1.1 } : {}}
                      whileTap={{ scale: 0.95 }}
                      title={`${seat.section}-${seat.row}-${seat.number} - $${seat.price}`}
                    >
                      {seat.number}
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-black/50">
          <div className="flex items-center justify-between">
            <div className="text-gray-400">
              Selected: <span className="text-white font-bold">{selectedSeats.length}</span> / {maxSelectable}
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gradient-festival text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              Continue
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
