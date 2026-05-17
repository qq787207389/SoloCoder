import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { TicketType } from '@/types';

export const InventoryManager = () => {
  const { ticketTypes, updateTicketTypes } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTicket, setNewTicket] = useState(false);
  const [formData, setFormData] = useState<TicketType>({
    id: '',
    name: '',
    price: 0,
    description: '',
    benefits: [],
    totalStock: 0,
    remainingStock: 0,
    salesCount: 0,
  });
  const [newBenefit, setNewBenefit] = useState('');

  const handleEdit = (ticket: TicketType) => {
    setFormData(ticket);
    setEditingId(ticket.id);
  };

  const handleSave = () => {
    if (editingId) {
      updateTicketTypes(ticketTypes.map(t => t.id === editingId ? formData : t));
    } else {
      const newId = formData.id || `ticket-${Date.now()}`;
      updateTicketTypes([...ticketTypes, { ...formData, id: newId, salesCount: 0 }]);
    }
    setEditingId(null);
    setNewTicket(false);
    setFormData({
      id: '',
      name: '',
      price: 0,
      description: '',
      benefits: [],
      totalStock: 0,
      remainingStock: 0,
      salesCount: 0,
    });
  };

  const handleAddBenefit = () => {
    if (newBenefit.trim()) {
      setFormData(prev => ({ ...prev, benefits: [...prev.benefits, newBenefit.trim()] }));
      setNewBenefit('');
    }
  };

  const handleRemoveBenefit = (index: number) => {
    setFormData(prev => ({ ...prev, benefits: prev.benefits.filter((_, i) => i !== index) }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Package className="w-6 h-6 text-festival-purple" />
          Inventory Management
        </h2>
        <button
          onClick={() => setNewTicket(true)}
          className="px-4 py-2 bg-gradient-festival text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Ticket Type
        </button>
      </div>

      <div className="grid gap-4">
        {ticketTypes.map(ticket => (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-white/5 rounded-xl border border-white/10"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-white">{ticket.name}</h3>
                  <span className="px-3 py-1 bg-festival-purple/30 rounded-full text-sm">
                    ${ticket.price}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-3">{ticket.description}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {ticket.benefits.map((benefit, i) => (
                    <span key={i} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300">
                      {benefit}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <span className="text-gray-400">
                    Total: <span className="text-white font-medium">{ticket.totalStock}</span>
                  </span>
                  <span className="text-gray-400">
                    Sold: <span className="text-white font-medium">{ticket.salesCount}</span>
                  </span>
                  <span className={`${ticket.remainingStock > 50 ? 'text-green-400' : ticket.remainingStock > 10 ? 'text-yellow-400' : 'text-red-400'}`}>
                    Remaining: <span className="font-medium">{ticket.remainingStock}</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(ticket)}
                  className="p-2 text-gray-400 hover:text-festival-purple transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {(editingId || newTicket) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-6 bg-white/5 rounded-xl border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">
                {editingId ? 'Edit Ticket Type' : 'Add New Ticket Type'}
              </h3>
              <button
                onClick={() => {
                  setEditingId(null);
                  setNewTicket(false);
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
                <label className="block text-sm text-gray-400 mb-2">Price ($)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-festival-purple transition-colors"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-festival-purple transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Total Stock</label>
                <input
                  type="number"
                  value={formData.totalStock}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    totalStock: Number(e.target.value),
                    remainingStock: prev.salesCount === 0 ? Number(e.target.value) : prev.remainingStock
                  }))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-festival-purple transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Benefits</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddBenefit()}
                    placeholder="Add benefit"
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-festival-purple transition-colors"
                  />
                  <button
                    onClick={handleAddBenefit}
                    className="px-4 py-2 bg-festival-purple/20 text-festival-purple rounded-lg hover:bg-festival-purple/30 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.benefits.map((benefit, i) => (
                    <span key={i} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300 flex items-center gap-1">
                      {benefit}
                      <button onClick={() => handleRemoveBenefit(i)} className="text-gray-500 hover:text-red-400">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={!formData.name || !formData.price || !formData.totalStock}
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
