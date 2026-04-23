import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Clock, ArrowRight, BookOpen, Loader2, CheckCircle2, ArrowLeft, Share2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const articles = [
  {
    id: 1,
    title: 'Haftalık Temettü Analizi: 23-27 Ekim Haftası',
    excerpt: 'Bu hafta temettü ödemesi yapacak şirketler ve BIST 100 genel görünümü üzerine detaylı analiz.',
    category: 'Analiz',
    date: '23 Ekim 2026',
    readTime: '8 dk',
    image: 'https://images.unsplash.com/photo-1611974717528-58730d385ad2?auto=format&fit=crop&q=80&w=800',
    content: `
      <p>Borsa İstanbul'da Ekim ayının son haftasına girerken temettü portföyleri için kritik bir haftayı geride bırakıyoruz. Bu hafta özellikle sanayi ve finans sektöründeki şirketlerin nakit akışı yönetimleri dikkat çekiyor.</p>
      <h3 style="color: white; margin-top: 24px;">Öne Çıkan Şirketler</h3>
      <p>Listemizde yer alan 3 temel şirket, nakit kârlılık oranlarını geçtiğimiz yılın ayn dönemine göre %15 artırmış durumda. Bu, önümüzdeki yıl için temettü verimi beklentilerini yükseltiyor.</p>
      <h3 style="color: white; margin-top: 24px;">Global Görünüm</h3>
      <p>Amerikan Merkez Bankası'nın (FED) faiz kararları sonrasında dolar bazlı temettü getirisi olan şirketlerin cazibesi artmaya devam ediyor. Karlısın olarak biz, pasif gelir yolculuğunuzda temettü sürekliliğine odaklanmanızı tavsiye ediyoruz.</p>
    `
  },
  {
    id: 2,
    title: 'Pazaryerinde Satış Yaparken Dikkat Edilmesi Gereken 5 Kriter',
    excerpt: 'Trendyol, Hepsiburada ve Amazon gibi platformlarda kârlılığı artırmanın yollarını keşfedin.',
    category: 'Strateji',
    date: '12 Ekim 2026',
    readTime: '6 dk',
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800',
    content: `
      <h3 style="color: white; margin-top: 24px;">1. Doğru Ürün Analizi</h3>
      <p>Her ürün her pazaryerinde aynı performansı göstermez. Karlısın araçlarını kullanarak hangi ürünün hangi platformda daha yüksek kâr marjı bıraktığını görebilirsiniz.</p>
      <h3 style="color: white; margin-top: 24px;">2. Kargo ve Lojistik Yönetimi</h3>
      <p>E-ticarette kârı yutan en büyük kalem kargodur. Desi hesaplamalarınızı hatasız yaparak fatura sürprizlerinden kurtulun. Lojistik optimizasyonu maliyetlerinizi %20 oranında düşürebilir.</p>
      <h3 style="color: white; margin-top: 24px;">3. Müşteri Deneyimi</h3>
      <p>Hızlı yanıt ve doğru paketleme, iade oranlarını düşürürken marka sadakatini artırır.</p>
    `
  },
  {
    id: 3,
    title: 'Yeni KDV Oranları ve E-ticaret Üzerindeki Etkileri',
    excerpt: 'Mevzuat değişiklikleri sonrasında fiyatlandırma stratejinizi nasıl güncellemelisiniz?',
    category: 'Mevzuat',
    date: '10 Ekim 2026',
    readTime: '4 dk',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
    content: `
      <p>Resmi Gazete'de yayımlanan kararlar ile e-ticaret sitelerindeki vergi yapılandırması değişti. Fiyatlarınızı güncellerken kâr marjınızı nasıl koruyacağınız üzerine bir rehber hazırladık.</p>
      <h3 style="color: white; margin-top: 24px;">Mevcut Durum Analizi</h3>
      <p>Yüksek KDV oranları karşısında tüketicilerin harcama alışkanlıkları değişebilir. Bu süreçte sepet ortalamasını artıracak kampanyalar kârlılığınızı dengeleyebilir.</p>
    `
  }
];

export default function Blog() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<typeof articles[0] | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Lütfen geçerli bir e-posta adresi girin.');
      setStatus('error');
      return;
    }

    try {
      setStatus('loading');
      setErrorMessage('');
      
      // 1. Firebase'e kaydet
      await addDoc(collection(db, 'newsletter_subscribers'), {
        email: email,
        subscribedAt: serverTimestamp(),
        source: 'blog_newsletter'
      });

      // 2. Mail gönder (Backend üzerinden)
      try {
        const workingCloudRunUrl = 'https://karl-s-n-1001236491636.europe-west2.run.app/api/mail';
        const isCustomDomain = window.location.hostname.includes('karlisin.com') || window.location.hostname.includes('www');
        const apiUrl = isCustomDomain ? workingCloudRunUrl : '/api/mail';

        await fetch(apiUrl, {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email, 
            type: 'newsletter' 
          })
        });
      } catch (mailErr) {
        console.error('Mail trigger error:', mailErr);
      }

      setStatus('success');
      setEmail('');
    } catch (err: any) {
      console.error('Subscription error:', err);
      setErrorMessage('Bir hata oluştu. Tekrar deneyin.');
      setStatus('error');
    }
  };

  if (selectedArticle) {
    return (
      <div className="pt-24 pb-20 px-6 max-w-4xl mx-auto min-h-screen">
        <motion.button 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setSelectedArticle(null)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group font-bold tracking-tight"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Geri Dön
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="aspect-[21/9] rounded-[40px] overflow-hidden mb-12 border border-white/10">
            <img src={selectedArticle.image} alt={selectedArticle.title} className="w-full h-full object-cover" />
          </div>

          <div className="flex items-center gap-4 text-xs font-black text-indigo-400 uppercase tracking-widest mb-6">
            <span className="px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20">{selectedArticle.category}</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><Clock size={14} /> {selectedArticle.readTime} oku</span>
            <span>•</span>
            <span>{selectedArticle.date}</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-8 tracking-tight leading-[1.1]">
            {selectedArticle.title}
          </h1>

          <div className="prose prose-invert prose-indigo max-w-none">
            <div 
              className="text-slate-300 text-lg leading-relaxed space-y-6 font-medium"
              dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
            />
          </div>

          <div className="mt-16 pt-8 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white">K</div>
              <div>
                <p className="text-white font-bold">Karlısın Ekibi</p>
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Finans Editörü</p>
              </div>
            </div>
            <button className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-white transition-all">
              <Share2 size={20} />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
        <div className="max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-300 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-indigo-500/20"
          >
            Haberler & İpuçları
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-white tracking-tight"
          >
            Karlısın <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Blog</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 font-medium mt-4 text-lg"
          >
            E-ticaret ve finans dünyasındaki en son gelişmeleri, stratejileri ve başarı hikayelerini takip edin.
          </motion.p>
        </div>

        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Yazı ara..." 
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium transition-all text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article, i) => (
          <motion.article 
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setSelectedArticle(article)}
            className="bg-white/5 backdrop-blur-md rounded-[32px] border border-white/10 overflow-hidden group hover:border-indigo-500/50 transition-all flex flex-col shadow-sm cursor-pointer"
          >
            <div className="aspect-[16/9] overflow-hidden relative">
              <img 
                src={article.image} 
                alt={article.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-lg border border-white/10">
                  {article.category}
                </span>
              </div>
            </div>
            
            <div className="p-8 flex flex-col flex-grow">
              <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
                <span className="flex items-center gap-1.5"><Clock size={12} /> {article.readTime} oku</span>
                <span>•</span>
                <span>{article.date}</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-4 group-hover:text-indigo-400 transition-colors leading-tight">
                {article.title}
              </h2>
              <p className="text-sm text-slate-400 font-medium mb-8 line-clamp-2">
                {article.excerpt}
              </p>
              <div className="mt-auto pt-4 border-t border-white/5">
                <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-400 group-hover:text-white transition-colors">
                  Devamını Oku <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      {/* Featured Newsletter */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-20 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-xl p-12 rounded-[48px] border border-white/10 text-center relative overflow-hidden"
      >
        <div className="relative z-10 max-w-2xl mx-auto">
          <BookOpen size={48} className="mx-auto text-indigo-400 mb-6" />
          <h2 className="text-3xl font-black text-white mb-4">Haftalık Analizler Kapınıza Gelsin</h2>
          <p className="text-slate-300 font-medium mb-8">E-ticaret başarısı için gereken verileri ve ipuçlarını haftalık olarak e-posta adresinize gönderelim.</p>
          
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl"
              >
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="text-emerald-400" size={32} />
                  <p className="text-white font-bold text-lg">Bültene Abone Oldunuz!</p>
                  <p className="text-emerald-400/80 text-sm">Analizlerimizi size ulaştırmak için sabırsızlanıyoruz.</p>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-grow flex flex-col items-start gap-2">
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-posta adresiniz" 
                    className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-white font-medium"
                  />
                  {status === 'error' && <p className="text-rose-400 text-xs font-bold ml-2">{errorMessage}</p>}
                </div>
                <button 
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center min-w-[140px]"
                >
                  {status === 'loading' ? <Loader2 size={20} className="animate-spin" /> : 'Abone Ol'}
                </button>
              </form>
            )}
          </AnimatePresence>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#4f46e5,transparent_70%)] opacity-10 pointer-events-none" />
      </motion.div>
    </div>
  );
}
