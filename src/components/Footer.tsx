import React from 'react';
import { Globe, Mail } from 'lucide-react';

interface FooterProps {
  onViewChange?: (view: string) => void;
}

export default function Footer({ onViewChange }: FooterProps) {
  return (
    <footer className="w-full py-12 bg-surface-container-low border-t border-surface-container mt-auto font-sans">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-xl font-black text-primary mb-4 tracking-tighter">FinCalc</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Her hesaplamada hassasiyet. Profesyonel araç setimiz, veriye dayalı içgörülerle finansal geleceğinizi güçlendirir.
            </p>
          </div>
          
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider">ÜRÜNLER</h4>
            <nav className="flex flex-col gap-2">
              <button onClick={() => onViewChange?.('calculators')} className="text-sm text-on-surface-variant hover:text-primary transition-colors text-left">Hesaplayıcılar</button>
              <button onClick={() => onViewChange?.('mortgage')} className="text-sm text-on-surface-variant hover:text-primary transition-colors text-left flex items-center gap-2">
                Temettü
                <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] font-black tracking-tighter rounded-md border border-indigo-500/20">YAKINDA</span>
              </button>
              <button onClick={() => onViewChange?.('blog')} className="text-sm text-on-surface-variant hover:text-primary transition-colors text-left">Blog</button>
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
            © 2024 FinCalc Profesyonel Araçlar. Hassas. Güvenilir. Yenilikçi.
          </p>
        </div>
      </div>
    </footer>
  );
}
