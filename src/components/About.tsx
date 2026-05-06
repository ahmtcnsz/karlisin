import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { Target, Zap, ShieldCheck, Users, TrendingUp, Sparkles } from 'lucide-react';

export default function About() {
  const sections = [
    {
      icon: <Target className="text-indigo-400" size={24} />,
      title: "Akıllı SaaS Çözümü",
      text: "Karlısın, e-ticaret satıcılarının ve yatırımcıların finansal süreçlerini daha akıllı, hızlı ve şeffaf hale getirmek için geliştirilmiş bir SaaS aracıdır."
    },
    {
      icon: <ShieldCheck className="text-emerald-400" size={24} />,
      title: "Karmaşıklığa Son",
      text: "Finansal kararlar alırken kâr hesaplamak çoğu zaman karmaşık ve zaman alıcıdır. Komisyon oranları, vergiler ve gizli giderler doğru fiyatı belirlemeyi zorlaştırır. Karlısın ile bu karmaşıklığı ortadan kaldırıyoruz."
    },
    {
      icon: <Zap className="text-amber-400" size={24} />,
      title: "Gerçek Kârlılık",
      text: "Karlısın ile kullanıcılar, ürünlerinin veya yatırımlarının gerçek kârlılığını saniyeler içinde analiz edebilir, daha doğru kararlar alabilir ve işlerini büyütmeye odaklanabilir."
    },
    {
      icon: <TrendingUp className="text-purple-400" size={24} />,
      title: "Misyonumuz",
      text: "Amacımız; e-ticaret satıcılarının günlük kâr analizlerinden, çalışanların maaş ve vergi hesaplamalarına kadar finansal her adımda rehberlik etmektir. Vizyonumuzun bir parçası olarak, yatırımcılar için Türkiye'nin en gelişmiş temettü takip ve analiz araçlarını inşa etmeyi hedefliyoruz."
    },
    {
      icon: <Users className="text-rose-400" size={24} />,
      title: "Sürekli Gelişim",
      text: "Sürekli gelişen bir ürünüz. Kullanıcı geri bildirimlerini merkeze alıyor, ürünü her geçen gün daha güçlü hale getiriyoruz."
    }
  ];

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
      <Helmet>
        <title>Hakkımızda - Karlısın | Şeffaf Finansal Gelecek</title>
        <meta name="description" content="Karlısın, e-ticaret satıcıları ve yatırımcılar için geliştirilmiş yeni nesil SaaS çözümüdür. Misyonumuz finansal şeffaflık sağlamaktır." />
      </Helmet>
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
          Satıcılar için <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Şeffaf Gelecek.</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-slate-400 font-medium max-w-3xl mx-auto"
        >
          E-ticaret yolculuğunuzda rakamların gücünü yanınıza alın. Karmaşık tablolarla değil, doğru kararlarla büyüyün.
        </motion.p>
      </div>

      <div className="flex flex-col gap-12 items-center">
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

      {/* Philosophy Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="mt-20 p-12 md:p-20 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-[60px] border border-white/10 text-center relative overflow-hidden"
      >
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-8">Neden Karlısın?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="space-y-4">
              <div className="text-indigo-400 font-black text-4xl">01.</div>
              <h4 className="text-white font-bold text-xl">Basitlik</h4>
              <p className="text-slate-400 text-sm font-medium">Karmaşıklıktan arınmış, herkesin saniyeler içinde kullanabileceği bir arayüz.</p>
            </div>
            <div className="space-y-4">
              <div className="text-purple-400 font-black text-4xl">02.</div>
              <h4 className="text-white font-bold text-xl">Hız</h4>
              <p className="text-slate-400 text-sm font-medium">Saatler süren manuel hesaplamaları saniyelere indiren güçlü altyapı.</p>
            </div>
            <div className="space-y-4">
              <div className="text-rose-400 font-black text-4xl">03.</div>
              <h4 className="text-white font-bold text-xl">Şeffaflık</h4>
              <p className="text-slate-400 text-sm font-medium">Görünmeyen hiçbir gider kalmayacak şekilde tüm maliyet kalemleri önünüzde.</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(79,70,229,0.1),transparent)] pointer-events-none" />
      </motion.div>
    </div>
  );
}
