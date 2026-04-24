import React from 'react';
import { motion } from 'motion/react';
import { Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const articles = [
  {
    id: 15,
    title: 'Karlı Bir E-ticaret Markası İnşası: 2026 Yol Haritası',
    excerpt: 'Sıfırdan kârlı bir marka yaratmanın matematiği, lojistik stratejileri ve 2026 yılındaki büyüme fırsatları.',
    category: 'Marka',
    date: '24 Nisan 2026',
    readTime: '12 dk',
    image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 14,
    title: '2026\'da Borsa İstanbul: Temettü Emekliliği Hayal mi?',
    excerpt: 'Enflasyon ve faiz sarmalında temettü yatırımcılığının 2026 yılındaki rolünü ve Karlısın ile nasıl pasif gelir inşa edilebileceğini tartışıyoruz.',
    category: 'Yatırım',
    date: '24 Nisan 2026',
    readTime: '10 dk',
    image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 13,
    title: 'E-ticarette Kar Hesapla ve Fiyat Belirle: Kaça Satayım?',
    excerpt: 'Satış fiyatınızı belirlerken yapılan en büyük hatalar ve doğru kar hesaplama yöntemleri ile Karlısın rehberi.',
    category: 'SEO Rehber',
    date: '23 Nisan 2026',
    readTime: '12 dk',
    image: 'https://images.unsplash.com/photo-1554224155-1696413575b8?auto=format&fit=crop&q=80&w=800',
  }
];

export default function BlogSnippet() {
  const navigate = useNavigate();

  return (
    <section className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
        <div className="space-y-2 text-left">
          <h2 className="text-xl font-black text-white uppercase tracking-[0.2em]">Son Blog Yazıları</h2>
          <div className="w-12 h-1 bg-gradient-to-r from-purple-500 to-transparent rounded-full" />
        </div>
        <button 
          onClick={() => navigate('/blog')}
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition-colors"
        >
          Tüm Yazıları Gör <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((article, i) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            onClick={() => navigate('/blog')}
            className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/5 overflow-hidden group hover:border-indigo-500/30 transition-all flex flex-col cursor-pointer"
          >
            <div className="aspect-[16/9] overflow-hidden relative">
              <img 
                src={article.image} 
                alt={article.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3">
                <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest rounded-md border border-white/10">
                  {article.category}
                </span>
              </div>
            </div>
            
            <div className="p-5 flex flex-col items-start flex-grow">
              <div className="flex items-center gap-3 text-[8px] font-black text-slate-500 uppercase tracking-widest mb-3">
                <span className="flex items-center gap-1"><Clock size={10} /> {article.readTime}</span>
                <span>•</span>
                <span>{article.date}</span>
              </div>
              <h3 className="text-sm font-black text-white mb-3 group-hover:text-indigo-400 transition-colors leading-tight line-clamp-2">
                {article.title}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mb-4 line-clamp-2 leading-relaxed">
                {article.excerpt}
              </p>
              <div className="mt-auto pt-3 border-t border-white/5 w-full">
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-indigo-400/80 group-hover:text-indigo-400 transition-colors">
                  OKU <ArrowRight size={10} />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
