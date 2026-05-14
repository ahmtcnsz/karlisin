
import React, { useState, useEffect } from 'react';
import { Heart, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SupportButton: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 10000); // 10 saniye

    return () => clearTimeout(timer);
  }, []);

  const handleSupportClick = () => {
    window.open('https://kreosus.com/httpskarlisincom/about', '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="mb-3 relative pointer-events-auto"
          >
            <div className="bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 px-4 py-2 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-700 text-[11px] font-black uppercase tracking-tight whitespace-nowrap pr-8">
              ( Geliştirmede destek olamak için tıkla )
              <button 
                onClick={() => setShowTooltip(false)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                id="close-support-tooltip"
              >
                <X size={14} />
              </button>
            </div>
            {/* Tooltip Arrow */}
            <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white dark:bg-zinc-800 border-r border-b border-zinc-200 dark:border-zinc-700 rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleSupportClick}
        className="pointer-events-auto bg-amber-500 hover:bg-amber-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center group relative overflow-hidden"
        id="support-button-fab"
        aria-label="Destek Ol"
      >
        <Heart className="w-6 h-6 fill-white group-hover:animate-pulse" />
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
      </motion.button>
    </div>
  );
};
