import React from 'react';
import { motion } from 'framer-motion';
import { Fuel as Mosque } from 'lucide-react';
import WalletConnect from './WalletConnect';

interface HeaderProps {
  activeSection: string;
}

const Header: React.FC<HeaderProps> = ({ activeSection }) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-lg border-b border-white/20 shadow-sm"
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="w-10 h-10 bg-islamic-green-500 rounded-xl flex items-center justify-center">
            <Mosque className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">BerQurban</h1>
            <p className="text-xs text-gray-500">Web3 Platform</p>
          </div>
        </motion.div>

        <div className="flex items-center gap-4">
          {(activeSection === 'campaigns' || activeSection === 'animals' || activeSection === 'coupons') && (
            <WalletConnect />
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Header;