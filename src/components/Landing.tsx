import React from 'react';
import { motion } from 'motion/react';
import BlogSnippet from './BlogSnippet';
import { 
  Calculator, 
  TrendingUp, 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  Smartphone,
  Globe,
  PieChart
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();
  const tools = [
    {
      id: 'salary',
      path: '/maas-vergi-hesaplama',
      title: 'Maaş Vergi Hesaplama',
      description: '2026 güncel vergi dilimlerine göre brütten nete maaş ve gelir vergisi hesaplayın.',
      icon: <Calculator className="text-indigo-400" size={28} />,
      badge: 'GÜNCEL',
      color: 'from-indigo-500/20 to-indigo-600/5',
      borderColor: 'border-indigo-500/20'
    },
    {
      id: 'calculators',
      path: '/pazar-kar-hesaplama',
      title: 'Pazaryeri Kar Hesaplama',
      description: 'Trendyol, Hepsiburada ve Amazon için komisyon, kargo ve KDV dahil net kâr analizi yapın.',
      icon: <Smartphone className="text-emerald-400" size={28} />,
      badge: 'POPÜLER',
      color: 'from-emerald-500/20 to-emerald-600/5',
      borderColor: 'border-emerald-500/20'
    },
    {
      id: 'mortgage',
      path: '/temettu-takibi',
      title: 'Temettü Takibi',
      description: 'Borsa pasif gelirinizi takip edin, vergi süreçlerini ve gelecek ödemeleri planlayın.',
      icon: <TrendingUp className="text-amber-400" size={28} />,
      badge: 'YAKINDA',
      color: 'from-amber-500/20 to-amber-600/5',
      borderColor: 'border-amber-500/20'
    },
  ];

  const features = [
    {
      title: 'Hassas Veriler',
      desc: 'Resmi mevzuat ve güncel komisyon oranlarıyla %100 uyumlu.',
      icon: <ShieldCheck size={20} />
    },
    {
      title: 'Üyelik Gerekmez',
      desc: 'Hiçbir veri kaydı tutulmaz, tüm hesaplamalar tarayıcınızda gerçekleşir.',
      icon: <Zap size={20} />
    },
    {
      title: 'Gelişmiş Analiz',
      desc: 'Karmaşık finansal verileri basit ve anlaşılır grafiklere dönüştürün.',
      icon: <PieChart size={20} />
    }
  ];

  const faqs = [
    {
      q: 'Verilerim güvende mi?',
      a: 'Karlısın bir sunucu kaydı tutmaz. Tüm hesaplamalar anlık olarak tarayıcınızda yapılır ve sayfa yenilendiğinde silinir.'
    },
    {
      q: 'Hesaplamalar güncel mi?',
      a: 'Evet, özellikle maaş ve vergi hesaplamalarımız 2026 yılı resmi tebliğlerine ve güncel vergi dilimlerine göredir.'
    },
    {
      q: 'Pazaryeri komisyonları nasıl belirleniyor?',
      a: 'Trendyol, Amazon ve Hepsiburada gibi platformların en güncel kategori bazlı komisyon oranlarını takip ediyoruz.'
    }
  ];

  return (
    <div className="pt-24 pb-0 px-6 max-w-7xl mx-auto flex flex-col gap-24">
      {/* Hero Section */}
      <section className="text-center space-y-8 max-w-4xl mx-auto relative px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-24 h-24 bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 rounded-[32px] mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.4)] mb-10 relative group"
        >
          <Zap size={48} className="text-white fill-white group-hover:scale-110 transition-transform" />
          <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full -z-10 group-hover:scale-150 transition-transform duration-1000" />
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.95]"
        >
          Geleceği <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-400">Hesapla.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-2xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed border-l-2 border-indigo-500/30 pl-6"
        >
          Maaş hesaplamadan pazaryeri analizine kadar profesyonel finansal araçlar. Üyelik gerektirmez, %100 gizli ve ücretsiz.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-6 pt-6"
        >
          <Link 
            to="/maas-vergi-hesaplama"
            className="px-10 py-5 bg-white text-slate-950 rounded-2xl font-black text-base uppercase tracking-widest shadow-[0_20px_40px_-15px_rgba(255,255,255,0.3)] hover:bg-indigo-50 hover:text-indigo-600 transition-all active:scale-95 flex items-center gap-3"
          >
            Hemen Başlayın <ArrowRight size={20} />
          </Link>
          <Link 
            to="/hakkimizda"
            className="px-10 py-5 bg-white/5 border-2 border-white/10 rounded-2xl font-black text-base text-white uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all"
          >
            Detaylı Bilgi
          </Link>
        </motion.div>
      </section>

      {/* Tools Grid - Centered & Refined */}
      <section className="space-y-12">
        <div className="text-left space-y-4">
          <h2 className="text-3xl font-black text-white uppercase tracking-[0.2em]">Finansal Araçlar</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-indigo-500 to-transparent rounded-full" />
        </div>
        
        <div className="flex flex-wrap justify-center gap-8">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -12, scale: 1.02 }}
              onClick={() => navigate(tool.path)}
              className={`cursor-pointer w-full md:w-[380px] p-10 bg-gradient-to-br ${tool.color} rounded-[48px] border-2 ${tool.borderColor} backdrop-blur-3xl flex flex-col items-start gap-8 group transition-all shadow-2xl shadow-black/20`}
            >
              <div className="w-16 h-16 bg-white/10 rounded-3xl border border-white/20 flex items-center justify-center transition-all group-hover:rotate-6 group-hover:bg-white/20 shadow-xl">
                {tool.icon}
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-2xl font-black text-white">{tool.title}</h3>
                  {tool.badge && (
                    <span className="px-3 py-1 bg-white/10 text-white rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10">
                      {tool.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  {tool.description}
                </p>
              </div>
              <div className="mt-auto w-full flex justify-between items-center pt-6 border-t border-white/5 group-hover:border-white/10 transition-colors">
                <span className="text-xs font-black text-white/40 uppercase tracking-[0.2em] group-hover:text-white transition-colors">Aracı Keşfet</span>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white text-white/40 group-hover:text-slate-900 transition-all">
                  <ArrowRight size={18} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Data Stats Panel (New Section) */}
      <section className="bg-gradient-to-b from-indigo-500/10 to-transparent rounded-[64px] border border-white/10 p-12 md:p-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 blur-[120px] rounded-full -mr-48 -mt-48" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <div className="space-y-4">
              <span className="text-indigo-400 font-black text-sm uppercase tracking-[0.3em]">Gerçek Zamanlı</span>
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                2026 Verileri <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400 uppercase italic">Hazır.</span>
              </h2>
            </div>
            
            <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-lg">
              Mevzuat değişimlerini anlık takip ediyoruz. Asgari ücret güncellemeleri ve gelir vergisi dilimleri sisteme otomatik işlenir.
            </p>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <div className="text-3xl font-black text-white">4.0+</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Milyon Senaryo</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-black text-white">%100</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hata Payı Yok</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-[48px] p-6 md:p-8 shadow-2xl relative w-full overflow-hidden">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/50" />
                <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Canlı Simülasyon</span>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Vergi Dilimi 1</span>
                <span className="text-sm font-black text-white">%15</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: '45%' }}
                  className="h-full bg-indigo-500" 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Asgari Ücret 2026</span>
                <span className="text-sm font-black text-emerald-400">GÜNCELLENDİ</span>
              </div>
              
              <div className="p-4 sm:p-6 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 overflow-hidden">
                <div className="flex gap-3 sm:gap-4 items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shrink-0">
                    <Calculator size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 truncate">Hesaplanan</div>
                    <div className="text-lg sm:text-xl font-black text-white truncate">₺32,450.00</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section (New Section) */}
      <section className="max-w-4xl mx-auto w-full space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-[0.1em] sm:tracking-[0.2em] whitespace-nowrap">Sıkça Sorulan Sorular</h2>
          <p className="text-slate-500 font-medium">Karlısın hakkında merak edilenler</p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="group p-8 bg-white/5 hover:bg-white/[0.08] border border-white/10 rounded-[32px] transition-all cursor-default"
            >
              <h4 className="text-lg font-black text-white mb-4 flex items-center gap-4">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xs">0{i+1}</span>
                {faq.q}
              </h4>
              <p className="text-slate-400 font-medium leading-relaxed pl-12 border-l border-white/5">
                {faq.a}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Blog Snippet Section */}
      <BlogSnippet />

      {/* Final CTA Section */}
      <section className="relative pt-32 pb-24 w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden border-t border-white/5 bg-slate-950/30">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15),transparent_70%)] pointer-events-none" />
        
        <div className="relative z-10 space-y-16 text-center px-6">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-8xl font-black text-white max-w-5xl mx-auto leading-[1.1] italic"
          >
            Rakamlarla Barışma <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Zamanı Geldi.</span>
          </motion.h2>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row justify-center items-center gap-10"
          >
            <Link 
              to="/maas-vergi-hesaplama"
              className="w-full sm:w-auto px-16 py-7 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white rounded-3xl font-black text-sm uppercase tracking-[0.3em] shadow-[0_20px_60px_rgba(99,102,241,0.4)] hover:scale-105 active:scale-95 transition-all group relative overflow-hidden text-center"
            >
              <span className="relative z-10">Hemen Ücretsiz Deneyin</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Link>
            <p className="text-slate-500 font-bold text-[11px] uppercase tracking-[0.4em] shrink-0">
              Kayıt Zorunlu Değildir
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
