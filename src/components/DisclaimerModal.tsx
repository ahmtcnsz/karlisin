import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Check, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface DisclaimerModalProps {
  title: string;
  content: string;
  storageKey: string;
}

export default function DisclaimerModal({ title, content, storageKey }: DisclaimerModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const state = localStorage.getItem(storageKey);
        if (!state) {
          setIsOpen(true);
        }
      }
    } catch (e) {
      console.warn("Storage access failed", e);
    }
  }, [storageKey]);

  const handleConfirm = () => {
    if (accepted) {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(storageKey, 'true');
        }
      } catch (e) {}
      setIsOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden"
          style={{ isolation: 'isolate' }}
        >
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[40px] shadow-2xl p-10 flex flex-col items-center text-center overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500" />
            
            <div className="w-20 h-20 bg-yellow-500/10 rounded-[30px] flex items-center justify-center mb-8 text-yellow-500 shadow-inner">
              <AlertTriangle className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-4 leading-tight">
              {title || 'Bilgilendirme'}
            </h3>
            
            <div className="text-slate-400 text-sm font-medium leading-relaxed mb-10">
              <p dangerouslySetInnerHTML={{ __html: content || '' }} />
            </div>

            <div className="w-full space-y-6">
              <label 
                className="flex items-center justify-center gap-3 cursor-pointer group select-none"
                onClick={(e) => {
                  if ((e.target as HTMLElement).tagName !== 'INPUT') {
                    setAccepted(!accepted);
                  }
                }}
              >
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="peer sr-only" 
                    checked={accepted}
                    readOnly
                  />
                  <div className="w-6 h-6 rounded-lg border-2 border-white/10 bg-white/5 transition-all peer-checked:bg-white peer-checked:border-white group-hover:border-white/30 flex items-center justify-center">
                    <Check className={cn("w-4 h-4 text-slate-900 transition-opacity", accepted ? "opacity-100" : "opacity-0")} />
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">
                  Okudum ve Anladım
                </span>
              </label>

              <button
                disabled={!accepted}
                onClick={handleConfirm}
                className={cn(
                  "w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-[0.98]",
                  accepted 
                    ? "bg-white text-slate-900 hover:bg-white/90 shadow-lg shadow-white/10" 
                    : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
                )}
              >
                <CheckCircle className="w-4 h-4" />
                Anladım, Devam Et
              </button>
            </div>

            {/* Decorative elements */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-500/5 blur-[80px] rounded-full" />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/5 blur-[80px] rounded-full" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
