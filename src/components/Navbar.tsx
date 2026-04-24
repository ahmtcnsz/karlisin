import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface NavbarProps {
  isLoggedIn?: boolean;
}

export default function Navbar({ isLoggedIn = false }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { id: 'landing', path: '/anasayfa', label: 'Anasayfa' },
    { id: 'calculators', path: '/pazar-kar-hesaplama', label: 'Pazar Kâr' },
    { id: 'salary', path: '/maas-vergi-hesaplama', label: 'Maaş & Vergi', badge: 'YENİ' },
    { id: 'mortgage', path: '/temettu-takibi', label: 'Temettü', badge: 'YAKINDA' },
    { id: 'blog', path: '/blog', label: 'Blog' },
  ];

  const isActive = (path: string) => {
    if (path === '/anasayfa' && location.pathname === '/') return true;
    return location.pathname === path;
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5 transition-all">
      <div className="relative flex items-center h-16 px-6 max-w-7xl mx-auto">
        
        {/* Logo - Left */}
        <div className="flex-shrink-0">
          <Link 
            to="/"
            className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 hover:opacity-80 transition-opacity"
          >
            KARLISIN
          </Link>
        </div>
        
        {/* Navigation - Perfectly Centered Single Line */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 whitespace-nowrap">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`px-4 py-2 text-[11px] font-black tracking-[0.15em] uppercase transition-all duration-300 relative group flex items-center gap-2 ${
                isActive(item.path)
                  ? 'text-white' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="relative z-10">{item.label}</span>
              
              {isActive(item.path) && (
                <motion.div 
                  layoutId="nav-glow"
                  className="absolute inset-0 bg-white/5 rounded-lg border border-white/10 -z-0"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              {item.badge && (
                <div className={`relative overflow-hidden px-1.5 py-0.5 text-[8px] rounded font-black leading-none shrink-0 border ${
                  item.badge === 'YENİ' 
                    ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' 
                    : 'bg-amber-500/10 text-amber-500/60 border-amber-500/20'
                }`}>
                  <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                      repeatDelay: 1
                    }}
                    className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 pointer-events-none"
                  />
                  <span className="relative z-10">{item.badge}</span>
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="ml-auto flex items-center gap-4">
          <div className="relative group hidden md:block">
            <button className="flex items-center gap-2 px-4 py-2 text-[10px] font-black text-white hover:text-indigo-400 transition-colors uppercase tracking-widest border border-white/10 rounded-lg cursor-default">
              Kurumsal
              <motion.div
                animate={{ rotate: 0 }}
                whileHover={{ rotate: 180 }}
                className="w-2 h-2 border-r border-b border-white/40 rotate-45 mb-1"
              />
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300">
              <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 min-w-[200px] shadow-2xl">
                <Link 
                  to="/hakkimizda" 
                  className="flex items-center px-4 py-3 text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all uppercase tracking-widest"
                >
                  Hakkımızda
                </Link>
                <Link 
                  to="/gizlilik-politikasi" 
                  className="flex items-center px-4 py-3 text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all uppercase tracking-widest"
                >
                  Gizlilik Politikası
                </Link>
                <Link 
                  to="/kullanim-kosullari" 
                  className="flex items-center px-4 py-3 text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all uppercase tracking-widest"
                >
                  Kullanım Şartları
                </Link>
                <Link 
                  to="/site-haritasi" 
                  className="flex items-center px-4 py-3 text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all uppercase tracking-widest border-t border-white/5 mt-1 pt-4"
                >
                  Site Haritası
                </Link>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 md:hidden text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <Menu size={24} />
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
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-4 rounded-2xl transition-all font-black text-sm tracking-widest ${
                    isActive(item.path)
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
                </Link>
              ))}

              <div className="mt-4 pt-4 border-t border-white/5 space-y-1">
                <p className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Kurumsal</p>
                <Link 
                  to="/hakkimizda" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-xs font-bold text-slate-400 hover:text-white transition-all uppercase tracking-widest"
                >
                  Hakkımızda
                </Link>
                <Link 
                  to="/gizlilik-politikasi" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-xs font-bold text-slate-400 hover:text-white transition-all uppercase tracking-widest"
                >
                  Gizlilik Politikası
                </Link>
                <Link 
                  to="/kullanim-kosullari" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-xs font-bold text-slate-400 hover:text-white transition-all uppercase tracking-widest"
                >
                  Kullanım Şartları
                </Link>
                <Link 
                  to="/site-haritasi" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-xs font-bold text-slate-400 hover:text-white transition-all uppercase tracking-widest"
                >
                  Site Haritası
                </Link>
              </div>
              
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
