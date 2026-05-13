import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { useSeo } from './Sitemap';
import { Target, Zap, ShieldCheck, Users, TrendingUp, Sparkles } from 'lucide-react';

export default function About() {
  useSeo('Hakkımızda', 'Karlısın platformu, finansal şeffaflık ve doğru hesaplama araçları misyonuyla geliştirilmiştir.');
  const sections = [
    {
      icon: <Target className="text-indigo-400" size={24} />,
      title: "Finansal Şeffaflık",
      text: "Karlısın, yatırımcıların ve e-ticaret satıcılarının karmaşık rakamlar arasında kaybolmasını engelleyen, Unified Data Engine ile güçlendirilmiş bir analiz platformudur."
    },
    {
      icon: <ShieldCheck className="text-emerald-400" size={24} />,
      title: "Veriye Dayalı Güven",
      text: "Finansal kararlar alırken sadece tahminlerle değil, BIST ve global piyasalardan anlık akan doğrulanmış verilerle hareket etmenizi sağlıyoruz. Temettü dağıtımı ve vergi hesaplamalarında %100 hassasiyet hedefliyoruz."
    },
    {
      icon: <Zap className="text-amber-400" size={24} />,
      title: "Hızlı Analiz",
      text: "Saatler süren manuel veri toplama süreçlerini saniyelere indiriyoruz. Temettü dağıtan hisseleri keşfedin, 2026 maaş projeksiyonunuzu yapın veya pazar kârınızı anında hesaplayın."
    },
    {
      icon: <TrendingUp className="text-purple-400" size={24} />,
      title: "Misyonumuz",
      text: "E-ticaret operasyonlarından borsa yatırımlarına kadar, her ölçekten kullanıcının finansal okuryazarlığını artırmak ve doğru yatırım stratejileri kurmalarına teknolojik rehberlik etmektir."
    },
    {
      icon: <Users className="text-rose-400" size={24} />,
      title: "Topluluk Odaklı",
      text: "Kullanıcı geri bildirimleriyle şekillenen modüler yapımız sayesinde, finans dünyasının değişen dinamiklerine en hızlı uyum sağlayan araç setini sunuyoruz."
    }
  ];

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
      <Helmet>
        <title>Hakkımızda - Karlısın | Şeffaf Finansal Gelecek</title>
        <meta name="description" content="Karlısın, e-ticaret satıcıları ve yatırımcılar için geliştirilmiş yeni nesil SaaS çözümüdür. Misyonumuz finansal şeffaflık sağlamaktır." />
      </Helmet>
      
      {/* Hero Section */}
      <div className="text-center mb-20">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 text-indigo-300 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-6 border border-indigo-500/20"
        >
          <Sparkles size={14} />
          Hakkımızda
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 leading-tight"
        >
          Veriye Dayalı <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Şeffaf Gelecek.</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-slate-400 font-medium max-w-3xl mx-auto"
        >
          Yatırım ve ticaret yolculuğunuzda Unified Data Engine gücünü yanınıza alın. Karmaşık tablolarla değil, doğru ve anlık verilerle büyüyün.
        </motion.p>
      </div>

      {/* Values Grid */}
      <div className="flex flex-col gap-12 items-center mb-32">
        {sections.map((section, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-12 md:p-16 bg-white/5 backdrop-blur-md rounded-[48px] border border-white/10 hover:border-indigo-500/30 transition-all group flex flex-col items-center gap-10 text-center max-w-5xl w-full"
          >
            <div className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform shrink-0 shadow-lg">
              {React.cloneElement(section.icon as React.ReactElement<any>, { size: 40 })}
            </div>
            <div className="space-y-6">
              <h3 className="text-3xl md:text-4xl font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
                {section.title}
              </h3>
              <p className="text-slate-400 font-medium leading-relaxed text-xl">
                {section.text}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Technology Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="mb-32 p-12 md:p-20 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-[60px] border border-white/10 text-center relative overflow-hidden"
      >
        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-12 italic uppercase tracking-tighter italic">Unified Data Engine</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
            <div className="space-y-4">
              <div className="text-indigo-400 font-black text-4xl">01.</div>
              <h4 className="text-white font-bold text-xl uppercase tracking-wider">Hassas Veri</h4>
              <p className="text-slate-400 text-sm font-medium">Global ve yerel (BIST) veri kaynaklarını tek bir kanalda birleştirerek en düşük hata payıyla çalışıyoruz.</p>
            </div>
            <div className="space-y-4">
              <div className="text-purple-400 font-black text-4xl">02.</div>
              <h4 className="text-white font-bold text-xl uppercase tracking-wider">Akıllı Projeksiyon</h4>
              <p className="text-slate-400 text-sm font-medium">2026 temettü dağıtımı ve maaş tahminleri için yapay zeka destekli analiz modelleri kullanıyoruz.</p>
            </div>
            <div className="space-y-4">
              <div className="text-rose-400 font-black text-4xl">03.</div>
              <h4 className="text-white font-bold text-xl uppercase tracking-wider">Tam Entegrasyon</h4>
              <p className="text-slate-400 text-sm font-medium">E-Ticaret maliyetlerinden borsa analizi süreçlerine kadar tüm finansal adımlarınızı tek merkezden yönetiyoruz.</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(79,70,229,0.1),transparent)] pointer-events-none" />
      </motion.div>
    </div>
  );
}
