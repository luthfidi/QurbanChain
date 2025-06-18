import { useState, useEffect } from 'react';
import { WalletState } from '../types';

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: 0,
    network: null,
  });

  const connectWallet = async () => {
    // Simulate wallet connection
    setTimeout(() => {
      setWallet({
        isConnected: true,
        address: '0x742d35...d3e5f2a',
        balance: 1.25,
        network: 'Polygon',
      });
    }, 1000);
  };

  const disconnectWallet = () => {
    setWallet({
      isConnected: false,
      address: null,
      balance: 0,
      network: null,
    });
  };

  return {
    wallet,
    connectWallet,
    disconnectWallet,
  };
};