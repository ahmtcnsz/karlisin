import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Menu, 
  X, 
  ChevronDown, 
  TrendingUp, 
  Activity 
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

interface NavbarProps {
  isLoggedIn?: boolean;
}

export default function Navbar({ isLoggedIn = false }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();

  const navItems = [
    { id: 'landing', path: '/anasayfa', label: 'Anasayfa' },
    { id: 'calculators', path: '/pazar-kar-hesaplama', label: 'Pazar Kâr', badge: 'POPÜLER' },
    { id: 'salary', path: '/maas-vergi-hesaplama', label: 'Maaş & Vergi', badge: 'YENİ' },
  ];

  const isActive = (path: string) => {
    if (path === '/anasayfa' && location.pathname === '/') return true;
    return location.pathname === path;
  };

  const isBorsaActive = location.pathname === '/temettu-takibi' || location.pathname === '/borsa/nabiz';

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5 transition-all">
      <div className="relative flex items-center h-16 px-6 max-w-7xl mx-auto">
        
        {/* Logo - Left */}
        <div className="flex-shrink-0">
          <Link 
            to="/"
            className="group flex flex-col items-start translate-y-0.5"
          >
            <div className="text-2xl font-black tracking-tighter leading-none select-none flex items-baseline">
              <span className="text-white group-hover:text-indigo-400 transition-colors">KARLI</span>
              <span className="text-slate-300 group-hover:text-slate-100 transition-colors">SIN</span>
            </div>
            <div className="text-[7px] font-black tracking-[0.35em] uppercase text-slate-500 group-hover:text-indigo-400/60 transition-colors mt-1 whitespace-nowrap">
              GELECEĞİNİ HESAPLA
            </div>
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
                    : item.badge === 'POPÜLER'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
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

          {/* BORSA DROPDOWN */}
          <div 
            className="relative group/dropdown"
            onMouseEnter={() => setActiveDropdown('borsa')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button 
              className={cn(
                "px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 flex items-center gap-2 cursor-pointer",
                isBorsaActive ? "text-white bg-white/5 border border-white/10 shadow-inner" : "text-slate-500 hover:text-slate-300"
              )}
            >
              BORSA
              <ChevronDown className={cn("w-3 h-3 transition-transform", activeDropdown === 'borsa' ? "rotate-180" : "")} />
            </button>

            <AnimatePresence>
              {activeDropdown === 'borsa' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 w-64 pt-2 z-50 pointer-events-auto"
                >
                  <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-2 select-none">
                    <Link 
                      to="/temettu-takibi" 
                      onClick={() => setActiveDropdown(null)}
                      className={cn(
                        "flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        location.pathname === '/temettu-takibi' ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-4 h-4" />
                        TEMETTÜ TAKİBİ
                      </div>
                      <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[7px] border border-emerald-500/30">AKTİF</span>
                    </Link>
                    <Link 
                      to="/borsa/nabiz" 
                      onClick={() => setActiveDropdown(null)}
                      className={cn(
                        "flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        location.pathname === '/borsa/nabiz' ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Activity className="w-4 h-4" />
                        PİYASANIN NABZI
                      </div>
                      <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 rounded text-[7px] border border-indigo-500/30">YENİ</span>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            to="/blog"
            className={`px-4 py-2 text-[11px] font-black tracking-[0.15em] uppercase transition-all duration-300 relative group flex items-center gap-2 ${
              location.pathname.startsWith('/blog')
                ? 'text-white' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            BLOG
          </Link>
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
              <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 min-w-[200px] shadow-2xl overflow-hidden">
                <Link to="/hakkimizda" className="flex items-center px-4 py-3 text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all uppercase tracking-widest">Hakkımızda</Link>
                <Link to="/gizlilik-politikasi" className="flex items-center px-4 py-3 text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all uppercase tracking-widest">Gizlilik Politikası</Link>
                <Link to="/kullanim-kosullari" className="flex items-center px-4 py-3 text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all uppercase tracking-widest">Kullanım Şartları</Link>
                <Link to="/site-haritasi" className="flex items-center px-4 py-3 text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all uppercase tracking-widest border-t border-white/5 mt-1 pt-4">Site Haritası</Link>
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
              <Link 
                to="/" 
                className={cn("block px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all", isActive('/anasayfa') ? "bg-white/10 text-white" : "text-slate-400")}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ANASAYFA
              </Link>
              <Link 
                to="/pazar-kar-hesaplama" 
                className={cn("block px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center justify-between", isActive('/pazar-kar-hesaplama') ? "bg-white/10 text-white" : "text-slate-400")}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                PAZAR KÂR <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-500 rounded text-[8px] border border-amber-500/20">POPÜLER</span>
              </Link>
              <Link 
                to="/maas-vergi-hesaplama" 
                className={cn("block px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center justify-between", isActive('/maas-vergi-hesaplama') ? "bg-white/10 text-white" : "text-slate-400")}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                MAAŞ & VERGİ <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 rounded text-[8px] border border-indigo-500/20">YENİ</span>
              </Link>

              <div className="mx-4 my-2 h-px bg-white/5" />
              <p className="px-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2">BORSA MENÜSÜ</p>
              
              <Link to="/temettu-takibi" className={cn("flex items-center justify-between px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all", isActive('/temettu-takibi') ? "bg-indigo-600 text-white" : "text-slate-400")} onClick={() => setIsMobileMenuOpen(false)}>
                TEMETTÜ TAKİBİ <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[8px] border border-emerald-500/30 font-black">AKTİF</span>
              </Link>
              <Link to="/borsa/nabiz" className={cn("flex items-center justify-between px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all", isActive('/borsa/nabiz') ? "bg-indigo-600 text-white" : "text-slate-400")} onClick={() => setIsMobileMenuOpen(false)}>
                PİYASANIN NABZI <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 rounded text-[8px] border border-indigo-500/30 font-black">YENİ</span>
              </Link>
              
              <div className="mx-4 my-2 h-px bg-white/5" />
              <Link to="/blog" className={cn("block px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all", location.pathname.startsWith('/blog') ? "bg-white/10 text-white" : "text-slate-400")} onClick={() => setIsMobileMenuOpen(false)}>BLOG</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
