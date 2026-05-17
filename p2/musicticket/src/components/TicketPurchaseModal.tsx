import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Lock, ShoppingCart, CheckCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { SeatMap } from './SeatMap';

interface TicketPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TicketPurchaseModal = ({ isOpen, onClose }: TicketPurchaseModalProps) => {
  const [showSeatMap, setShowSeatMap] = useState(false);
  const [step, setStep] = useState(1);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  
  const { 
    ticketTypes, 
    selectedTicketType, 
    setSelectedTicketType, 
    selectedSeats,
    seats,
    purchaseTickets,
    isProcessing,
    error,
    queuePosition,
    setQueuePosition
  } = useStore();

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setPurchaseSuccess(false);
    }
  }, [isOpen]);

  const handleQueueJoin = () => {
    setQueuePosition({
      userId: 'current-user',
      position: Math.floor(Math.random() * 50) + 1,
      status: 'waiting',
      createdAt: new Date(),
    });
    setStep(2);
  };

  const handlePurchase = async () => {
    const success = await purchaseTickets();
    if (success) {
      setPurchaseSuccess(true);
      setTimeout(() => {
        onClose();
      }, 3000);
    }
  };

  const selectedSeatInfo = seats.filter(s => selectedSeats.includes(s.id));
  const ticketType = ticketTypes.find(t => t.id === selectedTicketType);
  const totalPrice = ticketType ? ticketType.price * selectedSeats.length : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-2xl overflow-hidden rounded-2xl bg-[#1a1a2e] border border-white/10"
          >
            {purchaseSuccess ? (
              <div className="p-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center"
                >
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">Purchase Successful!</h2>
                <p className="text-gray-400">Your tickets have been added to your ticket wallet.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <div className="flex items-center gap-4">
                    {[1, 2, 3].map(s => (
                      <div key={s} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                          step >= s 
                            ? 'bg-festival-purple text-white' 
                            : 'bg-white/10 text-gray-500'
                        }`}>
                          {s}
                        </div>
                        {s < 3 && (
                          <div className={`w-12 h-0.5 mx-2 transition-all ${
                            step > s ? 'bg-festival-purple' : 'bg-white/10'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors text-2xl"
                  >
                    &times;
                  </button>
                </div>

                <div className="p-6">
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                      >
                        <h3 className="text-xl font-bold text-white">Select Ticket Type</h3>
                        <div className="grid gap-4">
                          {ticketTypes.map(ticket => (
                            <motion.button
                              key={ticket.id}
                              onClick={() => setSelectedTicketType(ticket.id)}
                              className={`p-4 rounded-xl border-2 text-left transition-all ${
                                selectedTicketType === ticket.id
                                  ? 'border-festival-purple bg-festival-purple/10'
                                  : 'border-white/10 bg-white/5 hover:border-white/20'
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-bold text-white">{ticket.name}</h4>
                                  <p className="text-gray-400 text-sm">{ticket.description}</p>
                                </div>
                                <div className="text-right">
                                  <div className="text-xl font-bold text-festival-cyan">${ticket.price}</div>
                                  <div className="text-gray-500 text-sm">
                                    {ticket.remainingStock} left
                                  </div>
                                </div>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {ticket.benefits.map((benefit, i) => (
                                  <span key={i} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300">
                                    {benefit}
                                  </span>
                                ))}
                              </div>
                            </motion.button>
                          ))}
                        </div>
                        <button
                          onClick={handleQueueJoin}
                          disabled={!selectedTicketType || isProcessing}
                          className="w-full py-3 bg-gradient-festival text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isProcessing ? 'Processing...' : 'Join Queue'}
                        </button>
                      </motion.div>
                    )}

                    {step === 2 && queuePosition && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="text-center py-8"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-20 h-20 mx-auto mb-6 rounded-full bg-festival-orange/20 flex items-center justify-center"
                        >
                          <Users className="w-10 h-10 text-festival-orange" />
                        </motion.div>
                        <h3 className="text-xl font-bold text-white mb-2">Waiting in Queue</h3>
                        <p className="text-gray-400 mb-6">
                          You are currently in position <span className="text-festival-pink font-bold text-2xl">{queuePosition.position}</span>
                        </p>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                          className="h-2 bg-gradient-festival rounded-full"
                        />
                        <p className="text-gray-500 text-sm mt-4">Please wait while we process your request...</p>
                        
                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 3 }}
                          onClick={() => setStep(3)}
                          className="mt-6 px-6 py-3 bg-gradient-festival text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
                        >
                          Proceed to Seating
                        </motion.button>
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold text-white">Select Seats</h3>
                          <button
                            onClick={() => setShowSeatMap(true)}
                            className="px-4 py-2 bg-festival-purple/20 text-festival-purple rounded-lg hover:bg-festival-purple/30 transition-colors"
                          >
                            Open Seat Map
                          </button>
                        </div>

                        {selectedSeats.length === 0 ? (
                          <div className="p-8 text-center bg-white/5 rounded-xl">
                            <Lock className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                            <p className="text-gray-400">No seats selected</p>
                            <p className="text-gray-500 text-sm">Click "Open Seat Map" to select your seats</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {selectedSeatInfo.map(seat => (
                              <div key={seat.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                <span className="text-white">
                                  Section {seat.section} - Row {seat.row}, Seat {seat.number}
                                </span>
                                <span className="text-festival-cyan font-medium">${seat.price}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {error && (
                          <div className="p-4 bg-red-500/20 text-red-400 rounded-lg text-center">
                            {error}
                          </div>
                        )}

                        <div className="p-4 bg-white/5 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Ticket Type</span>
                            <span className="text-white">{ticketType?.name}</span>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Quantity</span>
                            <span className="text-white">{selectedSeats.length}</span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-white/10">
                            <span className="text-white font-medium">Total</span>
                            <span className="text-2xl font-bold text-festival-cyan">${totalPrice}</span>
                          </div>
                        </div>

                        <button
                          onClick={handlePurchase}
                          disabled={selectedSeats.length === 0 || isProcessing}
                          className="w-full py-3 bg-gradient-festival text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isProcessing ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                              />
                              Processing...
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-5 h-5" />
                              Purchase Tickets
                            </>
                          )}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </motion.div>

          {showSeatMap && <SeatMap onClose={() => setShowSeatMap(false)} />}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
