import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight, Home, Calculator, ShoppingBag, PieChart, BookOpen, Shield, FileText, Info } from 'lucide-react';

export default function Sitemap() {
  const sections = [
    {
      title: 'Hesaplama Araçları',
      icon: <Calculator size={20} className="text-indigo-400" />,
      links: [
        { name: 'Maaş ve Vergi Hesaplama (2026)', path: '/maas-vergi-hesaplama', icon: <Calculator size={16} /> },
        { name: 'Pazar Kâr Analizi (Trendyol & Amazon)', path: '/pazar-kar-hesaplama', icon: <ShoppingBag size={16} /> },
        { name: 'Temettü Verimi Takibi', path: '/temettu-takibi', icon: <PieChart size={16} /> },
      ]
    },
    {
      title: 'İçerik ve Bilgi',
      icon: <BookOpen size={20} className="text-purple-400" />,
      links: [
        { name: 'Finans Blogu', path: '/blog', icon: <BookOpen size={16} /> },
        { name: 'Hakkımızda', path: '/hakkimizda', icon: <Info size={16} /> },
        { name: 'Geri Bildirim', path: '#', onClick: () => (window as any).toggleFeedback?.(), icon: <FileText size={16} /> },
      ]
    },
    {
      title: 'Yasal Süreçler',
      icon: <Shield size={20} className="text-emerald-400" />,
      links: [
        { name: 'Gizlilik Politikası', path: '/gizlilik-politikasi', icon: <Shield size={16} /> },
        { name: 'Kullanım Şartları', path: '/kullanim-kosullari', icon: <FileText size={16} /> },
      ]
    }
  ];

  return (
    <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto space-y-16">
      <div className="space-y-4">
        <div className="flex items-center gap-4 text-slate-500 text-xs font-black uppercase tracking-[0.2em]">
          <Link to="/" className="hover:text-white transition-colors">Ana Sayfa</Link>
          <ChevronRight size={12} />
          <span className="text-indigo-400">Site Haritası</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white italic">Site Haritası</h1>
        <p className="text-slate-400 font-medium">Karlısın platformundaki tüm araçlara ve içeriklere buradan ulaşabilirsiniz.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {sections.map((section, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              {section.icon}
              <h2 className="text-xl font-black text-white uppercase tracking-wider">{section.title}</h2>
            </div>
            <div className="space-y-2">
              {section.links.map((link, lIdx) => (
                <Link
                  key={lIdx}
                  to={link.path}
                  onClick={(e) => link.onClick && link.onClick()}
                  className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 hover:border-white/10 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-white/5 rounded-lg text-slate-400 group-hover:text-white transition-colors">
                      {link.icon}
                    </span>
                    <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">
                      {link.name}
                    </span>
                  </div>
                  <ArrowRight size={16} className="text-slate-600 group-hover:text-indigo-400 transform group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-12 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-[48px] border border-white/10 text-center space-y-6">
        <h3 className="text-2xl font-black text-white">Aradığınızı bulamadınız mı?</h3>
        <p className="text-slate-400 font-medium max-w-md mx-auto italic">
          Platformumuzu sürekli geliştiriyoruz. Yeni bir özellik öneriniz varsa bize bildirin!
        </p>
        <button 
          onClick={() => (window as any).toggleFeedback?.()}
          className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
        >
          Öneri Gönder
        </button>
      </div>
    </div>
  );
}
