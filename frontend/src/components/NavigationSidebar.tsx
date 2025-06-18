import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavigationSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isExpanded: boolean;
}

const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  activeSection,
  onSectionChange,
  isExpanded,
}) => {
  
  const sections = [
    { id: 'home', label: 'Beranda', color: 'bg-islamic-green-500' },
    { id: 'campaigns', label: 'Campaign', color: 'bg-blue-500' },
    { id: 'animals', label: 'Hewan', color: 'bg-red-500' },
    { id: 'coupons', label: 'Kupon', color: 'bg-gold-500' },
  ];

  // Get the index of the active section
  const activeSectionIndex = sections.findIndex(section => section.id === activeSection);

  // Determine which sections should be on the left (visited/passed sections)
  const getPositionForSection = (sectionIndex: number) => {
    if (activeSection === 'home') {
      // All sections on the right when home is active
      return 'right';
    }
    
    if (sectionIndex <= activeSectionIndex) {
      // Current and previous sections go to the left
      return 'left';
    } else {
      // Future sections stay on the right
      return 'right';
    }
  };

  // Group sections by their position
  const leftSections = sections.filter((_, index) => getPositionForSection(index) === 'left');
  const rightSections = sections.filter((_, index) => getPositionForSection(index) === 'right');

  return (
    <>
      {/* Left Sidebar - for visited/passed sections */}
      <AnimatePresence>
        {leftSections.length > 0 && (
          <motion.div
            className="fixed left-0 top-0 h-full z-50 flex"
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="flex h-full">
              {leftSections.map((section, index) => {
                const originalIndex = sections.findIndex(s => s.id === section.id);
                return (
                  <motion.div
                    key={`left-${section.id}`}
                    className={`${section.color} cursor-pointer transition-all duration-500 flex items-center justify-center relative overflow-hidden group hover:shadow-2xl`}
                    style={{
                      width: '60px',
                      writingMode: 'vertical-rl',
                      textOrientation: 'mixed',
                    }}
                    onClick={() => onSectionChange(section.id)}
                    whileHover={{ 
                      width: '80px',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ 
                      delay: index * 0.1,
                      duration: 0.6,
                      ease: [0.25, 0.1, 0.25, 1]
                    }}
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="text-white text-base font-bold tracking-wider transform rotate-180 relative z-10 transition-all duration-300 group-hover:scale-110">
                      {section.label}
                    </div>
                    
                    {activeSection === section.id && (
                      <motion.div
                        className="absolute right-0 top-0 bottom-0 w-1 bg-white/40 shadow-lg"
                        layoutId="activeIndicatorLeft"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}

                    {/* Hover Effect */}
                    <motion.div
                      className="absolute inset-0 bg-white/5"
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Sidebar - for current and future sections */}
      <motion.div
        className="fixed right-0 top-0 h-full z-50 flex"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="flex h-full">
          {rightSections.map((section, index) => {
            const originalIndex = sections.findIndex(s => s.id === section.id);
            return (
              <motion.div
                key={`right-${section.id}`}
                className={`${section.color} cursor-pointer transition-all duration-500 flex items-center justify-center relative overflow-hidden group hover:shadow-2xl`}
                style={{
                  width: isExpanded && activeSection !== 'home' ? '60px' : '50px',
                  writingMode: 'vertical-rl',
                  textOrientation: 'mixed',
                }}
                onClick={() => onSectionChange(section.id)}
                whileHover={{ 
                  width: isExpanded && activeSection !== 'home' ? '80px' : '60px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ 
                  delay: index * 0.1,
                  duration: 0.6,
                  ease: [0.25, 0.1, 0.25, 1]
                }}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="text-white text-base font-bold tracking-wider transform rotate-180 relative z-10 transition-all duration-300 group-hover:scale-110">
                  {section.label}
                </div>
                
                {activeSection === section.id && (
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-1 bg-white/40 shadow-lg"
                    layoutId="activeIndicatorRight"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                {/* Hover Effect */}
                <motion.div
                  className="absolute inset-0 bg-white/5"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </>
  );
};

export default NavigationSidebar;