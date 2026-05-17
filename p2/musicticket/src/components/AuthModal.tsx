import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Modal } from './Modal';

interface AuthModalProps {
  type: 'login' | 'register';
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal = ({ type, isOpen, onClose }: AuthModalProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const { login, register, isProcessing, error, switchToLogin, switchToRegister, setError } = useStore();

  useEffect(() => {
    setFormData({ username: '', email: '', password: '' });
    setError(null);
  }, [type, isOpen, setError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (type === 'login') {
      await login(formData.username, formData.password);
    } else {
      await register(formData.username, formData.email, formData.password);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSwitchType = () => {
    if (type === 'login') {
      switchToRegister();
    } else {
      switchToLogin();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={type === 'login' ? 'Login' : 'Register'} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {type === 'register' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-festival-purple transition-colors"
              required
            />
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-festival-purple transition-colors"
            required
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-festival-purple transition-colors"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          type="submit"
          disabled={isProcessing}
          className="w-full py-3 bg-gradient-festival text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : (type === 'login' ? 'Login' : 'Register')}
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-gray-400"
        >
          {type === 'login' ? 'New to WaveStorm?' : 'Already have an account?'}
          <button
            type="button"
            onClick={handleSwitchType}
            className="ml-1 text-festival-purple hover:text-festival-purple/80 transition-colors"
          >
            {type === 'login' ? 'Register here' : 'Login here'}
          </button>
        </motion.div>

        {type === 'login' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-gray-500"
          >
            Demo: username: <span className="text-gray-300">user</span>, password: <span className="text-gray-300">user</span>
            <br />
            Admin: username: <span className="text-gray-300">admin</span>, password: <span className="text-gray-300">admin</span>
          </motion.div>
        )}
      </form>
    </Modal>
  );
};