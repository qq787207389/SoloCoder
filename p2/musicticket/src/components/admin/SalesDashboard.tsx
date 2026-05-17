import { motion } from 'framer-motion';
import { BarChart, PieChart, TrendingUp, Users, Ticket, DollarSign } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { NumberAnimation } from '../NumberAnimation';
import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';

export const SalesDashboard = () => {
  const { ticketTypes } = useStore();

  const totalSales = ticketTypes.reduce((sum, t) => sum + t.salesCount * t.price, 0);
  const totalTickets = ticketTypes.reduce((sum, t) => sum + t.salesCount, 0);
  const totalCustomers = Math.floor(totalTickets / 2.5);

  const chartData = ticketTypes.map(t => ({
    name: t.name,
    sales: t.salesCount,
    revenue: t.salesCount * t.price,
  }));

  const COLORS = ['#8b5cf6', '#06b6d4', '#ff00ff'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Sales Dashboard</h2>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg">
          <TrendingUp className="w-5 h-5" />
          <span className="font-medium">+23.5% from last month</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-white/5 rounded-xl border border-white/10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-festival-purple/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-festival-purple" />
            </div>
            <span className="text-gray-400 text-sm">Total Revenue</span>
          </div>
          <div className="text-2xl font-bold text-white">
            <NumberAnimation value={totalSales} prefix="$" className="text-festival-cyan" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-white/5 rounded-xl border border-white/10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-festival-cyan/20 flex items-center justify-center">
              <Ticket className="w-5 h-5 text-festival-cyan" />
            </div>
            <span className="text-gray-400 text-sm">Tickets Sold</span>
          </div>
          <div className="text-2xl font-bold text-white">
            <NumberAnimation value={totalTickets} className="text-festival-purple" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-white/5 rounded-xl border border-white/10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-festival-pink/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-festival-pink" />
            </div>
            <span className="text-gray-400 text-sm">Customers</span>
          </div>
          <div className="text-2xl font-bold text-white">
            <NumberAnimation value={totalCustomers} className="text-festival-pink" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 bg-white/5 rounded-xl border border-white/10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <BarChart className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-gray-400 text-sm">Avg. Ticket Price</span>
          </div>
          <div className="text-2xl font-bold text-white">
            ${Math.round(totalSales / totalTickets) || 0}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 bg-white/5 rounded-xl border border-white/10"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-festival-purple" />
            Ticket Sales by Type
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af' }} />
                <YAxis tick={{ fill: '#9ca3af' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' }} 
                />
                <Legend />
                <Bar dataKey="sales" name="Tickets Sold" fill="#8b5cf6" />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4 bg-white/5 rounded-xl border border-white/10"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-festival-cyan" />
            Revenue Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="revenue"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' }} 
                  formatter={(value: number) => [`$${value}`, 'Revenue']}
                />
                <Legend />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
