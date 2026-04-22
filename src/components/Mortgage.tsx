import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, PieChart, Bell, Wallet, LineChart } from 'lucide-react';

export default function Mortgage() {
  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto min-h-[80vh] flex flex-col items-center justify-center text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative mb-12"
      >
        <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40 relative z-10">
          <TrendingUp size={48} />
        </div>
        <div className="absolute -inset-4 bg-indigo-500/20 blur-2xl rounded-full animate-pulse" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <span className="px-4 py-1 bg-white/5 text-indigo-400 text-xs font-black uppercase tracking-[0.3em] rounded-full border border-white/10 mb-6 inline-block">
          Gelecek Özellik
        </span>
        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter leading-tight">
          Temettü Takibi <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Çok Yakında.</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium mb-12">
          Borsa İstanbul ve Amerikan borsalarındaki temettü takviminizi yönetin, vergi hesaplamalarınızı yapın ve pasif gelir projeksiyonlarınızı oluşturun.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-16"
      >
        {[
          { icon: <PieChart size={24} />, title: "Otomatik Takvim", desc: "Temettü ödeme tarihlerini kaçırmayın." },
          { icon: <Wallet size={24} />, title: "Vergi Hesaplama", desc: "Stopaj ve beyanname süreçlerini yönetin." },
          { icon: <LineChart size={24} />, title: "Gelir Projeksiyonu", desc: "10 yıllık gelir tahminlerinizi görün." }
        ].map((feat, i) => (
          <div key={i} className="p-8 bg-white/5 backdrop-blur-md rounded-[32px] border border-white/10 text-left group transition-all">
            <div className="text-indigo-400 mb-4 group-hover:scale-110 transition-transform w-fit uppercase tracking-widest">{feat.icon}</div>
            <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
            <p className="text-sm text-slate-400 font-medium leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/5 p-2 rounded-2xl border border-white/10 flex flex-col sm:flex-row gap-2 max-w-md w-full"
      >
        <input 
          placeholder="E-posta adresiniz" 
          className="bg-transparent px-4 py-3 outline-none text-white font-medium flex-grow"
        />
        <button className="bg-white text-slate-900 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95">
          Haber Ver
        </button>
      </motion.div>

      <p className="mt-8 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
        <Bell size={12} className="text-indigo-500" />
        Özellik aktif olduğunda bildirim alın.
      </p>
    </div>
  );
}
