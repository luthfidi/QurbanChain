import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NavigationSidebar from './components/NavigationSidebar';
import Header from './components/Header';
import LandingSection from './components/sections/LandingSection';
import CampaignsSection from './components/sections/CampaignsSection';
import AnimalsSection from './components/sections/AnimalsSection';
import CouponsSection from './components/sections/CouponsSection';
import '@rainbow-me/rainbowkit/styles.css';

import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import type {
  Chain
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

export const chain: Chain = {
  id: 31337,
  name: 'Anvil Local',
  nativeCurrency: {
    decimals: 18,
    name: 'ANVIL ETHER',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545/'],
    },
    public: {
      http: ['http://127.0.0.1:8545/'],
    },
  },
  testnet: true,
};

export const config = getDefaultConfig({
  appName: 'BerQurban',
  projectId: '452a570bb1aae234d7abc64c5943f8d6', // Dapatkan dari https://cloud.walletconnect.com
  chains: [chain]
});

function App() {
  const queryClient = new QueryClient();
  const [activeSection, setActiveSection] = useState('home');

  const renderSection = () => {
    const sections = {
      home: <LandingSection />,
      campaigns: <CampaignsSection />,
      animals: <AnimalsSection />,
      coupons: <CouponsSection />,
    };

    return sections[activeSection as keyof typeof sections] || <LandingSection />;
  };

  const isExpanded = activeSection !== 'home';
  

  // Get the number of sections that should be on the left
  const sections = ['home', 'campaigns', 'animals', 'coupons'];
  const activeSectionIndex = sections.findIndex(section => section === activeSection);
  const leftSectionsCount = activeSection === 'home' ? 0 : activeSectionIndex + 1;

  const xOffset = isExpanded ? leftSectionsCount * 60 : 0;
  // Animation variants for the main content
  const pageVariants = {
    initial: {
      opacity: 0,
      x: 100,
      scale: 0.95,
      filter: 'blur(6px)'
    },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      filter: 'blur(0px)'
    },
    exit: {
      opacity: 0,
      x: -100,
      scale: 0.95,
      filter: 'blur(6px)'
    }
  };


  // Animation variants for the folding effect with dynamic margins
  const containerVariants = {
    home: {
      x: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1]
      }
    },
    expanded: {
      x: xOffset,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };


  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div className="min-h-screen bg-white font-inter overflow-hidden">
            {/* Header - only show when expanded */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, y: -40, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Header activeSection={activeSection} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Sidebar */}
            <AnimatePresence>
              <motion.div
                key="sidebar"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                className="fixed top-0 left-0 h-screen z-30"
              >
                <NavigationSidebar
                  activeSection={activeSection}
                  onSectionChange={setActiveSection}
                  isExpanded={isExpanded}
                />
              </motion.div>
            </AnimatePresence>
            
            {/* Main Content with Canal Street Market style folding animation */}
            <motion.main
              className="relative min-h-screen pr-[240px]"
              variants={containerVariants}
              animate={isExpanded ? 'expanded' : 'home'}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ 
                    duration: 0.8, 
                    ease: [0.25, 0.1, 0.25, 1],
                    delay: isExpanded ? 0.2 : 0
                  }}
                  className="min-h-screen"
                  style={{
                    paddingTop: isExpanded ? '80px' : '0px'
                  }}
                >
                  {renderSection()}
                </motion.div>
              </AnimatePresence>
              <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent pointer-events-none z-20" />
            </motion.main>

            {/* Mobile responsive adjustments */}
            <style jsx>{`
              @media (max-width: 768px) {
                main {
                  transform: none !important;
                }
              }
            `}</style>
          </div>
          <Toaster position="top-center" />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;