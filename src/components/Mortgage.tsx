import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, PieChart, Bell, Wallet, LineChart, CheckCircle2, Loader2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function Mortgage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Lütfen geçerli bir e-posta adresi girin.');
      setStatus('error');
      return;
    }

    try {
      setStatus('loading');
      setErrorMessage('');
      
      await addDoc(collection(db, 'waitlist'), {
        email: email,
        source: 'temettu',
        createdAt: serverTimestamp()
      });

      // Backend üzerinden hoş geldin maili gönder
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 saniye sonra vazgeç

        await fetch('/api/welcome-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
      } catch (mailError) {
        console.error('Email notification failed or timed out:', mailError);
        // Mail gitmese bile kullanıcıyı sıraya eklediğimiz için devam ediyoruz
      }

      setStatus('success');
      setEmail('');
    } catch (error) {
      console.error('Waitlist error:', error);
      setStatus('error');
      setErrorMessage('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto min-h-[80vh] flex flex-col items-center justify-center text-center text-sans">
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
        className="w-full max-w-md"
      >
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl flex flex-col items-center gap-3"
            >
              <CheckCircle2 className="text-emerald-400" size={40} />
              <h4 className="text-white font-black text-lg">Sıraya Eklendiniz!</h4>
              <p className="text-emerald-400/80 text-sm font-medium">Güncellemeleri e-posta adresinize göndereceğiz.</p>
              <button 
                onClick={() => setStatus('idle')}
                className="mt-2 text-xs font-black text-emerald-400/60 hover:text-emerald-400 uppercase tracking-widest"
              >
                Başka bir e-posta ekle
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              <div className="bg-white/5 p-2 rounded-2xl border border-white/10 flex flex-col sm:flex-row gap-2">
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-posta adresiniz" 
                  disabled={status === 'loading'}
                  className="bg-transparent px-4 py-3 outline-none text-white font-medium flex-grow"
                />
                <button 
                  type="submit"
                  disabled={status === 'loading'}
                  className="bg-white text-slate-900 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {status === 'loading' ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : 'Haber Ver'}
                </button>
              </div>
              {status === 'error' && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-rose-400 text-xs font-bold mt-3 ml-2 text-left"
                >
                  {errorMessage}
                </motion.p>
              )}
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>

      <p className="mt-8 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
        <Bell size={12} className="text-indigo-500" />
        Özellik aktif olduğunda bildirim alın.
      </p>
    </div>
  );
}
