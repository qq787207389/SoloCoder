'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Ticket, Users, Sparkles } from 'lucide-react';
import { Scene3D } from '@/components/Scene3D';
import { Navbar } from '@/components/Navbar';
import { Countdown } from '@/components/Countdown';
import { ArtistCard } from '@/components/ArtistCard';
import { Schedule } from '@/components/Schedule';
import { Community } from '@/components/Community';
import { TicketWallet } from '@/components/TicketWallet';
import { TicketPurchaseModal } from '@/components/TicketPurchaseModal';
import { AuthModal } from '@/components/AuthModal';
import { mockArtists } from '@/data/mockData';
import { useStore } from '@/store/useStore';
import { createWebSocket } from '@/services/websocket';

export default function Home() {
  const { 
    user, 
    updateTicketTypes, 
    updateSeats, 
    showLoginModal, 
    showRegisterModal, 
    showPurchaseModal,
    closeLoginModal,
    closeRegisterModal,
    closePurchaseModal,
    openPurchaseModal
  } = useStore();

  useEffect(() => {
    const ws = createWebSocket();
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'get_initial_data' }));
    };
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case 'initial_data':
          updateTicketTypes(message.payload.ticketTypes);
          updateSeats(message.payload.seats);
          break;
        case 'stock_update':
          updateTicketTypes(message.payload.ticketTypes);
          break;
        case 'seat_locked':
          updateSeats((prev: any) => prev.map((s: any) => 
            s.id === message.payload.seat.id ? message.payload.seat : s
          ));
          break;
        case 'seat_unlocked':
          updateSeats((prev: any) => prev.map((s: any) => 
            s.id === message.payload.seatId 
              ? { ...s, status: 'available', lockedBy: undefined, lockedAt: undefined }
              : s
          ));
          break;
      }
    };

    return () => ws.close();
  }, [updateTicketTypes, updateSeats]);

  return (
    <div className="min-h-screen">
      <Scene3D />
      <Navbar />

      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
            <span className="text-gradient">WaveStorm</span>
            <br />
            Music Festival
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
            Experience the ultimate electronic music festival with world-class DJs, immersive visuals, and unforgettable moments
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-6 mb-12"
        >
          <div className="flex items-center gap-2 text-gray-300">
            <Calendar className="w-5 h-5 text-festival-purple" />
            <span>August 15-17, 2024</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <MapPin className="w-5 h-5 text-festival-pink" />
            <span>Las Vegas, Nevada</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Users className="w-5 h-5 text-festival-cyan" />
            <span>50,000+ Attendees</span>
          </div>
        </motion.div>

        <Countdown />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-4 mt-12"
        >
          <button
            onClick={openPurchaseModal}
            className="px-8 py-4 bg-gradient-festival text-white font-bold text-lg rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Ticket className="w-5 h-5" />
            Get Tickets
          </button>
          <a
            href="#artists"
            className="px-8 py-4 bg-white/10 text-white font-bold text-lg rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            View Lineup
          </a>
        </motion.div>
      </section>

      <section id="artists" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              <span className="text-gradient">Artist Lineup</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              World-renowned DJs and rising stars from across the electronic music spectrum
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockArtists.map((artist, index) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <ArtistCard artist={artist} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="tickets" className="py-20 px-4 bg-black/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              <span className="text-gradient">Get Your Tickets</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Choose your experience and secure your spot at WaveStorm 2024
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex justify-center"
          >
            <button
              onClick={openPurchaseModal}
              className="px-12 py-5 bg-gradient-festival text-white font-bold text-xl rounded-xl hover:opacity-90 transition-opacity flex items-center gap-3"
            >
              <Ticket className="w-6 h-6" />
              Buy Tickets Now
            </button>
          </motion.div>

          {user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-12"
            >
              <TicketWallet />
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {mockArtists.slice(0, 3).map((artist, index) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative overflow-hidden rounded-xl group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                <img
                  src={artist.imageUrl}
                  alt={artist.name}
                  className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                  <h3 className="text-xl font-bold text-white">{artist.name}</h3>
                  <p className="text-gray-300 text-sm">{artist.genre}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {!user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <p className="text-gray-400 mb-4">Login to access your ticket wallet and purchase tickets</p>
              <button
                onClick={() => useStore.getState().openLoginModal()}
                className="px-6 py-3 bg-gradient-festival text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Login Now
              </button>
            </motion.div>
          )}
        </div>
      </section>

      <section id="schedule" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Schedule />
          </motion.div>
        </div>
      </section>

      <section id="community" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Community />
          </motion.div>
        </div>
      </section>

      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-gradient mb-4">WaveStorm</h3>
              <p className="text-gray-400 text-sm">The ultimate electronic music festival experience.</p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#artists" className="hover:text-white transition-colors">Artists</a></li>
                <li><a href="#tickets" className="hover:text-white transition-colors">Tickets</a></li>
                <li><a href="#schedule" className="hover:text-white transition-colors">Schedule</a></li>
                <li><a href="#community" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Info</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Connect</h4>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-festival-purple/30 transition-colors cursor-pointer">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-festival-purple/30 transition-colors cursor-pointer">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-festival-purple/30 transition-colors cursor-pointer">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-gray-500 text-sm">
            <p>&copy; 2024 WaveStorm Festival. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <TicketPurchaseModal 
        isOpen={showPurchaseModal} 
        onClose={closePurchaseModal} 
      />

      <AuthModal 
        type="login" 
        isOpen={showLoginModal} 
        onClose={closeLoginModal}
      />

      <AuthModal 
        type="register" 
        isOpen={showRegisterModal} 
        onClose={closeRegisterModal}
      />
    </div>
  );
}