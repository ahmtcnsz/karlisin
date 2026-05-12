import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-8 p-6 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl"
      >
        <AlertCircle className="w-20 h-20 text-indigo-500 mb-4 mx-auto" />
        <h1 className="text-6xl font-black text-white mb-2">404</h1>
        <p className="text-xl text-slate-400 font-medium">Sayfa Bulunamadı</p>
      </motion.div>
      
      <p className="text-slate-400 max-w-md mb-10 leading-relaxed">
        Aradığınız finansal liman burada değil. Belki de gitmek istediğiniz yönü değiştirmelisiniz.
      </p>

      <Link 
        to="/"
        className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
      >
        <Home className="w-5 h-5" />
        Anasayfaya Dön
      </Link>
    </div>
  );
}
