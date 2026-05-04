import React from 'react';
import { Globe, Mail, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function Footer() {
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
    <footer className="w-full py-12 bg-slate-950/50 backdrop-blur-xl border-t border-white/5 mt-auto font-sans relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 text-left">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="group flex flex-col items-start mb-6">
              <div className="text-2xl font-black tracking-tighter leading-none select-none flex items-baseline">
                <span className="text-white group-hover:text-indigo-400 transition-colors">KARLI</span>
                <span className="text-slate-300 group-hover:text-slate-100 transition-colors">SIN</span>
              </div>
              <div className="text-[7px] font-black tracking-[0.35em] uppercase text-slate-500 group-hover:text-indigo-400/60 transition-colors mt-1 whitespace-nowrap">
                GELECEĞİNİ HESAPLA
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Yatırımcılar ve girişimciler için akıllı, hızlı ve şeffaf finansal hesaplama süreçleri sunan yeni nesil SaaS çözümü.
            </p>
          </div>
          
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest">ÜRÜNLER</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/pazar-kar-hesaplama" className="text-sm text-slate-400 font-medium hover:text-white transition-colors">Pazaryeri Kâr</Link>
              <Link to="/maas-vergi-hesaplama" className="text-sm text-slate-400 font-medium hover:text-white transition-colors flex items-center gap-2">
                Maaş Vergi Hesapla
                <div className="relative overflow-hidden px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-black tracking-tighter rounded-md border border-indigo-500/20">
                  {badgeGlint}
                  <span className="relative z-10">YENİ</span>
                </div>
              </Link>
              <Link to="/blog" className="text-sm text-slate-400 font-medium hover:text-white transition-colors">Blog</Link>
              <Link to="/temettu-takibi" className="text-sm text-slate-400 font-medium hover:text-white transition-colors flex items-center gap-2">
                Temettü Takibi
                <div className="relative overflow-hidden px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-black tracking-tighter rounded-md border border-indigo-500/20">
                  {badgeGlint}
                  <span className="relative z-10">AKTİF</span>
                </div>
              </Link>
              <Link to="/borsa/nabiz" className="text-sm text-slate-400 font-medium hover:text-white transition-colors flex items-center gap-2">
                Piyasanın Nabzı
                <div className="relative overflow-hidden px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-black tracking-tighter rounded-md border border-indigo-500/20">
                  {badgeGlint}
                  <span className="relative z-10">YENİ</span>
                </div>
              </Link>
            </nav>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest">KURUMSAL</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/hakkimizda" className="text-sm text-slate-400 font-medium hover:text-white transition-colors">Hakkımızda</Link>
              <Link to="/gizlilik-politikasi" className="text-sm text-slate-400 font-medium hover:text-white transition-colors">Gizlilik Politikası</Link>
              <Link to="/kullanim-kosullari" className="text-sm text-slate-400 font-medium hover:text-white transition-colors">Kullanım Şartları</Link>
              <Link to="/site-haritasi" className="text-sm text-slate-400 font-medium hover:text-white transition-colors">Site Haritası</Link>
            </nav>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest">İLETİŞİM</h4>
            <div className="flex gap-4">
              <a 
                href="https://ahmetcansiz.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all shadow-sm"
              >
                <Globe size={18} />
              </a>
              <a 
                href="mailto:ahmtcnsz@gmail.com"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all shadow-sm"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 text-center">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-loose">
            © 2026 Karlısın Profesyonel Araçlar. <br className="md:hidden" /> Hassas. Güvenilir. Yenilikçi.
          </p>
        </div>
      </div>
    </footer>
  );
}
