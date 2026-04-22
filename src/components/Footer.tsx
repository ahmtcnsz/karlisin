import React from 'react';
import { Globe, Mail } from 'lucide-react';
import { motion } from 'motion/react';

interface FooterProps {
  onViewChange?: (view: string) => void;
}

export default function Footer({ onViewChange }: FooterProps) {
  const badgeGlint = (
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
  );

  return (
    <footer className="w-full py-12 bg-surface-container-low border-t border-surface-container mt-auto font-sans">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-xl font-black text-primary mb-4 tracking-tighter">FinCalc</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              E-ticaret satıcıları için akıllı, hızlı ve şeffaf fiyatlandırma süreçleri sunan yeni nesil SaaS çözümü.
            </p>
          </div>
          
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider">ÜRÜNLER</h4>
            <nav className="flex flex-col gap-2">
              <button onClick={() => onViewChange?.('calculators')} className="text-sm text-on-surface-variant hover:text-primary transition-colors text-left">Hesaplayıcılar</button>
              <button onClick={() => onViewChange?.('salary')} className="text-sm text-on-surface-variant hover:text-primary transition-colors text-left flex items-center gap-2">
                Maaş Vergi Hesapla
                <div className="relative overflow-hidden px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-black tracking-tighter rounded-md border border-indigo-500/20">
                  {badgeGlint}
                  <span className="relative z-10">YENİ</span>
                </div>
              </button>
              <button onClick={() => onViewChange?.('blog')} className="text-sm text-on-surface-variant hover:text-primary transition-colors text-left">Blog</button>
              <button onClick={() => onViewChange?.('mortgage')} className="text-sm text-on-surface-variant hover:text-primary transition-colors text-left flex items-center gap-2">
                Temettü
                <div className="relative overflow-hidden px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-black tracking-tighter rounded-md border border-indigo-500/20">
                  {badgeGlint}
                  <span className="relative z-10">YAKINDA</span>
                </div>
              </button>
            </nav>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider">KURUMSAL</h4>
            <nav className="flex flex-col gap-2">
              <button 
                onClick={() => onViewChange?.('about')} 
                className="text-sm text-on-surface-variant hover:text-primary transition-colors text-left"
              >
                Hakkımızda
              </button>
              <button 
                onClick={() => onViewChange?.('privacy')} 
                className="text-sm text-on-surface-variant hover:text-primary transition-colors text-left"
              >
                Gizlilik Politikası
              </button>
              <button 
                onClick={() => onViewChange?.('terms')} 
                className="text-sm text-on-surface-variant hover:text-primary transition-colors text-left"
              >
                Kullanım Şartları
              </button>
            </nav>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider">İLETİŞİM</h4>
            <div className="flex gap-4">
              <a 
                href="https://ahmetcansiz.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white border border-surface-container flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-white transition-all shadow-sm"
              >
                <Globe size={18} />
              </a>
              <a 
                href="mailto:ahmtcnsz@gmail.com"
                className="w-10 h-10 rounded-full bg-white border border-surface-container flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-white transition-all shadow-sm"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-surface-container text-center">
          <p className="text-xs text-on-surface-variant">
            © 2026 FinCalc Profesyonel Araçlar. Hassas. Güvenilir. Yenilikçi.
          </p>
        </div>
      </div>
    </footer>
  );
}
