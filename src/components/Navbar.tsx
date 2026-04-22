import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Menu, X } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isLoggedIn?: boolean;
}

export default function Navbar({ currentView, onViewChange, isLoggedIn = false }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'calculators', label: 'Hesaplayıcılar' },
    { id: 'salary', label: 'Maaş Vergi Hesapla', badge: 'YENİ' },
    { id: 'blog', label: 'Blog' },
    { id: 'mortgage', label: 'Temettü', badge: 'YAKINDA' },
  ];

  const handleNavClick = (id: string) => {
    onViewChange(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 w-full z-50 bg-white/5 backdrop-blur-xl border-b border-white/10 transition-all">
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <button 
            onClick={() => handleNavClick('calculators')}
            className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 cursor-pointer"
          >
            Karlısın
          </button>
          
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`text-sm font-black transition-all duration-200 relative pb-1 flex items-center gap-2 ${
                  currentView === item.id 
                    ? 'text-indigo-400' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.label.toLocaleUpperCase('tr-TR')}
                {item.badge && (
                  <div className="relative overflow-hidden px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-black tracking-tighter rounded-md border border-indigo-500/20">
                    <motion.div
                      animate={{
                        x: ['-100%', '200%'],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                        repeatDelay: 1
                      }}
                      className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 pointer-events-none"
                    />
                    <span className="relative z-10">{item.badge}</span>
                  </div>
                )}
                {currentView === item.id && (
                  <motion.div 
                    layoutId="navbar-active"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn && (
            <div className="hidden md:flex items-center gap-4">
              <button className="p-2 text-slate-400 hover:bg-white/10 rounded-full transition-all">
                <Bell size={20} />
              </button>
              <button 
                onClick={() => onViewChange('dashboard')}
                className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-opacity"
              >
                JD
              </button>
            </div>
          )}
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 md:hidden text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-900/95 backdrop-blur-2xl border-b border-white/10 overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl transition-all font-black text-sm tracking-widest ${
                    currentView === item.id
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label.toLocaleUpperCase('tr-TR')}
                  {item.badge && (
                    <div className="relative overflow-hidden px-2 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black rounded-lg border border-indigo-500/20">
                      <motion.div
                        animate={{
                          x: ['-100%', '200%'],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear",
                          repeatDelay: 1
                        }}
                        className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 pointer-events-none"
                      />
                      <span className="relative z-10">{item.badge}</span>
                    </div>
                  )}
                </button>
              ))}
              
              {isLoggedIn && (
                <div className="flex items-center justify-between p-4 mt-2 border-t border-white/5 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      JD
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">Ahmet Can</p>
                      <p className="text-[10px] font-bold text-slate-500">PRO PLAN</p>
                    </div>
                  </div>
                  <button className="p-2.5 bg-white/5 rounded-xl text-slate-400">
                    <Bell size={20} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
