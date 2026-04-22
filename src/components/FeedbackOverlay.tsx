import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Mail, ChevronDown } from 'lucide-react';

const FeedbackOverlay: React.FC = () => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState('Öneri');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [showFeedbackTooltip, setShowFeedbackTooltip] = useState(true);
  const [feedbackBottom, setFeedbackBottom] = useState(24);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `Karlisin Geri Bildirim: ${feedbackType}`;
    const body = `Tür: ${feedbackType}\n\nMesaj: ${feedbackMessage}\n\nGönderen: ${userEmail}`;
    window.location.href = `mailto:ahmtcnsz@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setIsFeedbackOpen(false);
    setFeedbackMessage('');
  };

  useEffect(() => {
    const tooltipTimer = setTimeout(() => setShowFeedbackTooltip(false), 30000);
    return () => clearTimeout(tooltipTimer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector('footer');
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const visibleFooterHeight = Math.max(0, viewportHeight - footerRect.top);
        const newBottom = Math.max(24, visibleFooterHeight + 24);
        setFeedbackBottom(newBottom);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className="fixed right-6 z-[90] transition-all duration-300"
      style={{ bottom: `${feedbackBottom}px` }}
    >
      <AnimatePresence>
        {showFeedbackTooltip && !isFeedbackOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-20 right-0 whitespace-nowrap bg-indigo-600 text-white px-4 py-2 rounded-2xl shadow-xl text-sm font-bold flex items-center gap-2"
          >
            <span>Geri bildirimleriniz bizim için değerli</span>
            <div className="absolute -bottom-1.5 right-8 w-3 h-3 bg-indigo-600 rotate-45" />
          </motion.div>
        )}

        {isFeedbackOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[350px] sm:w-[400px] bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden"
          >
            <div className="p-6 pb-0 flex justify-between items-start">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Görüşün bizim için önemli</h3>
                  <p className="text-sm text-slate-500 font-medium tracking-tight">Birlikte daha özgür olabiliriz</p>
                </div>
              </div>
              <button 
                onClick={() => setIsFeedbackOpen(false)}
                className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
                id="close-feedback"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-slate-50/50 p-4 rounded-2xl mb-6">
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  Hesaplama deneyimi için çalışıyoruz. Öneri, hata bildirimi veya yeni özellikleri paylaşabilirsiniz.
                </p>
              </div>

              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div className="relative group">
                  <select
                    value={feedbackType}
                    onChange={(e) => setFeedbackType(e.target.value)}
                    className="w-full h-14 pl-5 pr-12 bg-slate-50 border-2 border-transparent group-hover:border-slate-200 focus:border-indigo-500 rounded-2xl text-slate-700 font-bold appearance-none transition-all outline-none"
                  >
                    <option>Öneri</option>
                    <option>Hata Bildirimi</option>
                    <option>Yeni Özellik</option>
                    <option>Soru</option>
                  </select>
                  <ChevronDown size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                <div className="relative group">
                  <textarea
                    required
                    value={feedbackMessage}
                    placeholder="Mesajınızı buraya yazın..."
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    className="w-full min-h-[120px] bg-slate-50 border-2 border-transparent group-hover:border-slate-200 focus:border-indigo-500 rounded-3xl p-5 text-slate-700 font-medium transition-all outline-none resize-none placeholder:text-slate-300"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                    <Mail size={18} />
                  </div>
                  <input
                    required
                    type="email"
                    placeholder="E-posta adresiniz"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full h-14 pl-12 pr-5 bg-slate-50 border-2 border-transparent group-hover:border-slate-200 focus:border-indigo-500 rounded-2xl text-slate-700 font-bold transition-all outline-none placeholder:text-slate-300"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Mail size={18} />
                  <span>Maili Gönder</span>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsFeedbackOpen(!isFeedbackOpen);
          setShowFeedbackTooltip(false);
        }}
        id="feedback-toggle"
        className="flex items-center gap-3 px-6 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-full shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
        <MessageSquare size={24} className="fill-white/20" />
        <span className="text-lg">Geri Bildirim</span>
      </motion.button>
    </div>
  );
};

export default FeedbackOverlay;
