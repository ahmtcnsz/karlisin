import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight, Home, Calculator, ShoppingBag, PieChart, BookOpen, Shield, FileText, Info, TrendingUp } from 'lucide-react';

const blogSlugs = [
  'temettu-nedir-borsada-temettu-dagitimi-ve-pasif-gelir-rehberi',
  'temettu-verimi-nedir-ve-neden-onemlidir',
  'pazaryeri-saticilari-icin-kar-rehberi-trendyol-hepsiburada-ve-amazon-da-zarar-etmekten-nasil-kurtulursunuz',
  '2026-maas-hesaplama-rehberi-vergi-dilimi-dolar-ve-altin-karsiligi-analizi',
  'karli-bir-e-ticaret-markasi-insasi-2026-yol-haritasi',
  '2026-da-borsa-istanbul-temettu-emekliligi-hayal-mi',
  '2026-rehberi-brutten-nete-maas-hesaplama-nasil-yapilir',
  'kaca-satayim-e-ticarette-kar-hesaplama-ve-fiyatlandirma',
  'yapay-zeka-destekli-karlilik-analizi-2026-ve-otesi',
  'finansal-ozgurlugun-gizli-formulu-bilesik-getiri-gucu'
];

export const useSeo = (title: string, description?: string) => {
  useEffect(() => {
    document.title = `${title} | Karlısın.com`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description || 'Karlısın - E-Ticaret ve Finansal Karar Destek Platformu');
    }
  }, [title, description]);
};

export default function Sitemap() {
  useSeo('Site Haritası', 'Karlısın.com üzerindeki tüm araçlar, hesaplayıcılar ve rehber içerikler. Temettü takvimi ve pazar yeri kar hesaplayıcıları burada.');
  const sections = [
    {
      title: 'Hesaplama Araçları',
      icon: <Calculator size={20} className="text-indigo-400" />,
      links: [
        { name: '2026 Maaş ve Gelir Vergisi Hesaplama', path: '/maas-vergi-hesaplama', icon: <Calculator size={16} /> },
        { name: 'Trendol & Amazon Pazar Kâr Analizi', path: '/pazar-kar-hesaplama', icon: <ShoppingBag size={16} /> },
        { name: 'Temettü Dağıtımı ve Verimi Takibi', path: '/temettu-takibi', icon: <PieChart size={16} /> },
        { name: 'Borsa Takibi ve Şirket Finansal Analizi', path: '/borsa/nabiz', icon: <TrendingUp size={16} /> },
      ]
    },
    {
      title: 'İçerik ve Bilgi',
      icon: <BookOpen size={20} className="text-purple-400" />,
      links: [
        { name: 'Finans Blogu', path: '/blog', icon: <BookOpen size={16} /> },
        ...blogSlugs.map(slug => ({
          name: slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          path: `/blog/${slug}`,
          icon: <ChevronRight size={14} className="text-slate-500" />
        })),
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
        <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter">Site Haritası</h1>
        <p className="text-slate-400 font-medium">Karlısın platformundaki <strong>temettü dağıtımı</strong>, <strong>temettü dağıtan hisseler</strong> ve finansal araçlara buradan ulaşabilirsiniz.</p>
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
                  className="flex flex-col p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 hover:border-white/10 transition-all group"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <span className="p-2 bg-white/5 rounded-lg text-slate-400 group-hover:text-white transition-colors">
                        {link.icon}
                      </span>
                      <span className="text-sm font-bold text-white transition-colors uppercase tracking-tight">
                        {link.name}
                      </span>
                    </div>
                    <ArrowRight size={16} className="text-slate-600 group-hover:text-indigo-400 transform group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        ))}
      </div>


    </div>
  );
}
