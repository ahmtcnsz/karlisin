import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { 
  Zap, 
  TrendingUp, 
  BarChart3, 
  ShieldCheck, 
  Globe, 
  Flame, 
  ArrowRight,
  Sparkles,
  Search,
  Activity,
  Gem,
  Calculator
} from 'lucide-react';
import { cn } from '../lib/utils';

const FeatureCard = ({ icon: Icon, title, description, badge, color }: { 
  icon: any, 
  title: string, 
  description: string, 
  badge?: string,
  color: string 
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    whileHover={{ y: -5 }}
    className="bg-slate-900/40 border border-white/5 p-8 rounded-[40px] relative overflow-hidden group hover:border-white/10 transition-all"
  >
    <div className={cn("absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity", color)} />
    
    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border transition-all", 
      color.replace('bg-', 'text-').replace('-500', '-400'),
      color.replace('bg-', 'bg-').replace('-500', '-500/10'),
      color.replace('bg-', 'border-').replace('-500', '-500/20')
    )}>
      <Icon size={28} />
    </div>

    {badge && (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4">
        <Sparkles size={10} className="text-amber-400" />
        {badge}
      </span>
    )}

    <h3 className="text-xl font-black text-white italic tracking-tighter uppercase mb-3">{title}</h3>
    <p className="text-sm text-slate-500 font-medium leading-relaxed">{description}</p>
  </motion.div>
);

export const MarketPulse = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
      <Helmet>
        <title>Piyasanın Nabzı - Global Finans ve Borsa Analizleri</title>
        <meta name="description" content="Altın, Petrol, Enflasyon ve S&P 500 gibi global verilerle piyasanın ritmini takip edin. Şirketlerin finansal sağlık skorlarını keşfedin." />
      </Helmet>
      
      {/* Hero Section */}
      <div className="relative pt-24 pb-32 overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-3 px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8"
            >
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping absolute inset-0" />
                <div className="w-2 h-2 rounded-full bg-indigo-500 relative" />
              </div>
              PİYASANIN NABZI v1.0
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-8xl font-black text-white tracking-tighter italic uppercase leading-none mb-8"
            >
              PİYASAYI <span className="text-indigo-500">DİNLEYİN.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-slate-400 font-medium leading-relaxed mb-12"
            >
              Global finansal veri altyapısı ile borsanın sadece fiyatlarını değil, <span className="text-white">finansal sağlığını</span> ve <span className="text-white">makro-ekonomik ritmini</span> takip edin.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-40">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard 
            icon={ShieldCheck}
            title="Dividend Safety Score"
            description="Şirketin nakit akışı ve kazanç verilerini kullanarak, temettü ödemelerini sürdürebilme gücünü skorluyoruz."
            badge="ÖZEL ALGORİTMA"
            color="bg-emerald-500"
          />
          <FeatureCard 
            icon={Globe}
            title="Global Market Pulse"
            description="Altın, Petrol, Doğal Gaz ve Enflasyon (TÜFE/CPI) verilerini içeren kapsamlı makro-ekonomik özet paneli."
            badge="MAKRO VERİ"
            color="bg-indigo-500"
          />
          <FeatureCard 
            icon={BarChart3}
            title="Endeks Kıyaslama"
            description="Seçilen hisseyi global endeksler (S&P 500, Nasdaq) ve emtialar ile tarihsel olarak kıyaslayın."
            badge="VİZÜALİZASYON"
            color="bg-purple-500"
          />
          <FeatureCard 
            icon={Flame}
            title="Smart Movers"
            description="Anlık değişimlerin ötesinde, global piyasa trendlerine göre en çok kazandıran ve kaybedenlerin hibrit analizi."
            badge="DİNAMİK LİSTE"
            color="bg-amber-500"
          />
        </div>

        {/* Comparison Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 bg-indigo-600 rounded-[60px] p-12 md:p-20 relative overflow-hidden group shadow-2xl shadow-indigo-600/20"
        >
          {/* Decorative Sparkles */}
          <Sparkles className="absolute top-10 right-10 text-white/20 w-24 h-24 rotate-12 group-hover:scale-110 transition-transform duration-700" />
          <Activity className="absolute -bottom-10 -left-10 text-white/10 w-64 h-64 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-none mb-8">
                Derinlikli <br /> Analiz Zamanı.
              </h2>
              <p className="text-lg md:text-xl text-indigo-100 font-medium leading-relaxed mb-10 opacity-90">
                Pazar verileri sadece fiyat verir, yeni analiz motorumuz hikayeyi anlatır. Şirketin finansal sağlığını ve makro-çevresini saniyeler içinde analiz edin.
              </p>
              
              <div className="space-y-6">
                {[
                  { icon: Calculator, text: "Gelişmiş Nakit Akışı Analizi" },
                  { icon: Gem, text: "Emtia & Enflasyon Korelasyonu" },
                  { icon: Search, text: "Kurumsal Analist Sentiment Takibi" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                      <item.icon size={20} />
                    </div>
                    <span className="text-lg font-black text-white italic tracking-tight">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-950/40 backdrop-blur-xl border border-white/20 rounded-[45px] p-10 shadow-2xl relative overflow-hidden">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">PROJEKSİYON</span>
                    <span className="text-2xl font-black text-white italic uppercase tracking-tight">Kullanıcı Deneyimi</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <TrendingUp size={20} />
                  </div>
               </div>
               
               {/* UI Mockup Placeholder */}
               <div className="space-y-4">
                  <div className="h-4 bg-white/10 rounded-full w-3/4 animate-pulse" />
                  <div className="h-4 bg-white/10 rounded-full w-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="h-20 bg-white/5 rounded-3xl w-full border border-white/10 flex items-center justify-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">YÜKLENİYOR...</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 bg-white/5 rounded-3xl w-full border border-white/10" />
                    <div className="h-24 bg-white/5 rounded-3xl w-full border border-white/10" />
                  </div>
               </div>
            </div>
          </div>
        </motion.div>

        {/* Why the new engine? */}
        <div className="mt-40 text-center">
          <h3 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter uppercase mb-6 inline-block border-b-2 border-indigo-500 pb-2">
            Neden Gelişmiş Finansal Veri Motoru?
          </h3>
          <div className="max-w-3xl mx-auto">
            <p className="text-slate-400 font-medium leading-relaxed mb-8">
              Karlısın, özellikle makro-ekonomik veriler (emtialar, enflasyon, faiz) ve fundamental analiz (şirketin finansal sağlığı) konularında yeni kurumsal veri sağlayıcıları ile entegre oluyor. Bu gelişimle beraber <span className="text-white">Karlısın</span>, sadece bir takip aracı değil, bir <span className="text-indigo-400">profesyonel karar destek sistemi</span> haline gelecek.
            </p>
            <div className="flex items-center justify-center gap-6">
              <div className="px-6 py-3 bg-slate-900 border border-white/5 rounded-2xl">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">VERİ STATÜSÜ</span>
                 <span className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   GELİŞTİRME AŞAMASINDA
                 </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
