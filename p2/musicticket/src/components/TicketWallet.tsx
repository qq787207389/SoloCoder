import { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Gift, Calendar, MapPin } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useStore } from '@/store/useStore';
import { Modal } from './Modal';

export const TicketWallet = () => {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferEmail, setTransferEmail] = useState('');
  const { tickets, seats, ticketTypes, user } = useStore();

  const userTickets = tickets.filter(t => t.userId === user?.id);

  const getTicketInfo = (ticketId: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return null;
    
    const seat = seats.find(s => s.id === ticket.seatId);
    const ticketType = ticketTypes.find(t => t.id === ticket.ticketTypeId);
    
    return { ticket, seat, ticketType };
  };

  const handleTransfer = (ticketId: string) => {
    setSelectedTicket(ticketId);
    setShowTransferModal(true);
  };

  const confirmTransfer = () => {
    setShowTransferModal(false);
    setSelectedTicket(null);
    setTransferEmail('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">My Tickets</h2>
        {userTickets.length === 0 && (
          <p className="text-gray-400">No tickets yet. <a href="#tickets" className="text-festival-purple hover:underline">Buy tickets now</a></p>
        )}
      </div>

      <div className="grid gap-4">
        {userTickets.map(ticket => {
          const info = getTicketInfo(ticket.id);
          if (!info) return null;

          return (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-xl bg-gradient-to-r from-festival-purple/20 to-festival-cyan/20 border border-white/10"
            >
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-festival" />
              
              <div className="p-4 pl-6">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-lg bg-black/30 flex items-center justify-center">
                    <QRCodeSVG value={ticket.qrCode} size={80} level="H" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-festival-purple/30 rounded-full text-sm font-medium">
                        {info.ticketType?.name}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        ticket.status === 'valid' ? 'bg-green-500/30 text-green-400' :
                        ticket.status === 'used' ? 'bg-gray-500/30 text-gray-400' :
                        'bg-yellow-500/30 text-yellow-400'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-1">WaveStorm Festival 2024</h3>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Aug 15-16, 2024
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Ocean Park Arena
                      </div>
                      {info.seat && (
                        <div>
                          Seat: {info.seat.section}-{info.seat.row}-{info.seat.number}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleTransfer(ticket.id)}
                    disabled={ticket.status !== 'valid'}
                    className="p-2 bg-festival-pink/20 text-festival-pink rounded-lg hover:bg-festival-pink/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Transfer Ticket"
                  >
                    <Gift className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <Modal isOpen={showTransferModal} onClose={() => setShowTransferModal(false)} title="Transfer Ticket" size="md">
        <div className="space-y-4">
          <p className="text-gray-400">
            Transfer your ticket to another person. They will receive an email with the ticket details.
          </p>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Recipient Email</label>
            <input
              type="email"
              value={transferEmail}
              onChange={(e) => setTransferEmail(e.target.value)}
              placeholder="Enter recipient email"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-festival-purple transition-colors"
            />
          </div>

          {selectedTicket && getTicketInfo(selectedTicket)?.ticketType && (
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-sm text-gray-400">
                You are transferring: <span className="text-white">{getTicketInfo(selectedTicket)?.ticketType?.name}</span>
              </p>
            </div>
          )}

          <button
            onClick={confirmTransfer}
            disabled={!transferEmail}
            className="w-full py-3 bg-gradient-festival text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Transfer
          </button>
        </div>
      </Modal>
    </div>
  );
};
