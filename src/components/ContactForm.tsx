import React, { useState, useRef } from 'react';
import { Mail, ChevronDown, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import ReCAPTCHA from "react-google-recaptcha";

const ContactForm: React.FC = () => {
  const [feedbackType, setFeedbackType] = useState('Öneri');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [loadTime] = useState(Date.now());
  const [hpName, setHpName] = useState('');
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'loading') return;

    setStatus('loading');

    const recaptchaToken = recaptchaRef.current?.getValue();
    if (!recaptchaToken && import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    try {
      // 1. Firebase Log
      await addDoc(collection(db, 'contact_requests'), {
        email: userEmail,
        type: feedbackType,
        message: feedbackMessage,
        source: 'contact_page',
        createdAt: serverTimestamp()
      });

      // 2. Email Notification via Server API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          type: feedbackType,
          message: feedbackMessage,
          source: 'contact_page',
          _hp_name: hpName,
          _hp_time: loadTime.toString(),
          recaptchaToken
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Mail gönderim hatası');
      }

      setStatus('success');
      setFeedbackMessage('');
      setUserEmail('');
      
      // Success modal'ı için bir süre sonra idle'a dönülebilir veya form tamamen gizlenebilir
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      console.error('Contact form error:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-2xl relative overflow-hidden group">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full -mr-32 -mt-32 group-hover:bg-indigo-500/20 transition-colors duration-700" />
      
      <div className="relative z-10">
        <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Bize Ulaşın</h3>
        <p className="text-slate-400 font-medium mb-8">Sorularınız, önerileriniz veya iş birliği talepleriniz için formu doldurabilirsiniz.</p>

        <form onSubmit={handleFeedbackSubmit} className="space-y-6">
          {/* Honeypot Field - Hidden for Humans */}
          <div className="hidden" aria-hidden="true">
            <input 
              type="text" 
              name="_hp_name" 
              value={hpName} 
              onChange={(e) => setHpName(e.target.value)} 
              tabIndex={-1} 
              autoComplete="off" 
            />
          </div>

          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center"
              >
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="text-white font-bold text-lg mb-1">Mesajınız Alındı!</h4>
                <p className="text-slate-400 text-sm font-medium">En kısa sürede size geri dönüş yapacağız. Teşekkürler.</p>
              </motion.div>
            ) : status === 'error' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center"
              >
                <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-red-500/20">
                  <AlertCircle size={24} />
                </div>
                <h4 className="text-white font-bold text-lg mb-1">Hata Oluştu</h4>
                <p className="text-slate-400 text-sm font-medium">Mesaj gönderilirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.</p>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative group/field">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Konu Başlığı</label>
              <div className="relative focus-within:ring-2 focus-within:ring-indigo-500/20 rounded-2xl transition-all">
                <select
                  disabled={status === 'loading'}
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value)}
                  className="w-full h-14 pl-5 pr-12 bg-white/5 border-2 border-transparent group-hover/field:border-white/10 focus:border-indigo-500 rounded-2xl text-white font-bold appearance-none transition-all outline-none disabled:opacity-50"
                >
                  <option className="bg-slate-900">Öneri</option>
                  <option className="bg-slate-900">Hata Bildirimi</option>
                  <option className="bg-slate-900">İş Birliği</option>
                  <option className="bg-slate-900">Diğer</option>
                </select>
                <ChevronDown size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>

            <div className="relative group/field">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">E-Posta Adresiniz</label>
              <div className="relative focus-within:ring-2 focus-within:ring-indigo-500/20 rounded-2xl transition-all">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">
                  <Mail size={18} />
                </div>
                <input
                  disabled={status === 'loading'}
                  required
                  type="email"
                  placeholder="name@example.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full h-14 pl-12 pr-5 bg-white/5 border-2 border-transparent group-hover/field:border-white/10 focus:border-indigo-500 rounded-2xl text-white font-bold transition-all outline-none placeholder:text-slate-600 disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          <div className="relative group/field">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Mesajınız</label>
            <div className="relative focus-within:ring-2 focus-within:ring-indigo-500/20 rounded-3xl transition-all">
              <textarea
                disabled={status === 'loading'}
                required
                value={feedbackMessage}
                placeholder="Mesajınızı buraya yazın..."
                onChange={(e) => setFeedbackMessage(e.target.value)}
                className="w-full min-h-[160px] bg-white/5 border-2 border-transparent group-hover/field:border-white/10 focus:border-indigo-500 rounded-3xl p-6 text-white font-medium transition-all outline-none resize-none placeholder:text-slate-600 disabled:opacity-50"
              />
            </div>
          </div>

          {import.meta.env.VITE_RECAPTCHA_SITE_KEY && (
            <div className="flex justify-center py-2">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                theme="dark"
              />
            </div>
          )}

          <motion.button
            whileHover={status === 'idle' ? { scale: 1.01 } : {}}
            whileTap={status === 'idle' ? { scale: 0.99 } : {}}
            type="submit"
            disabled={status !== 'idle'}
            className="w-full h-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all disabled:opacity-50 disabled:grayscale"
          >
            {status === 'loading' ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={20} />
            )}
            <span>{status === 'loading' ? 'Gönderiliyor...' : 'Mesajı Gönder'}</span>
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
