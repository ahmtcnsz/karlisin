import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Clock, ArrowRight, BookOpen, Loader2, CheckCircle, ArrowLeft, Share2 } from 'lucide-react';
import { getApiUrl } from '../lib/utils';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, getDocsFromServer } from 'firebase/firestore';

import { articles } from '../constants/articles';

export default function Blog() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [liveArticles, setLiveArticles] = useState<typeof articles>(articles);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<typeof articles[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { id: pathSlug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Yazıları API'den çek
  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoadingArticles(true);
        const res = await fetch(getApiUrl('/api/blog/posts'));
        if (res.ok) {
          const data = await res.json();
          setLiveArticles(data);
        }
      } catch (err) {
        console.error('Blog posts fetch error:', err);
      } finally {
        setLoadingArticles(false);
      }
    }
    fetchPosts();
  }, []);

  // Filtrelenmiş makaleler
  const trimmedSearch = searchQuery.trim().toLowerCase();
  const filteredArticles = [...liveArticles]
    .filter(article => 
      article.title.toLowerCase().includes(trimmedSearch) ||
      article.excerpt.toLowerCase().includes(trimmedSearch) ||
      article.category.toLowerCase().includes(trimmedSearch)
    )
    .sort((a, b) => b.id - a.id); // Her zaman en yeni id üstte

  // URL'den makale slug'ını veya ID'sini oku
  useEffect(() => {
    if (loadingArticles) return;

    const slugOrId = pathSlug || searchParams.get('id');
    if (slugOrId) {
      // Önce slug ile ara
      let article = liveArticles.find(a => a.slug === slugOrId);
      // Bulunamazsa ID ile ara (geriye dönük uyumluluk)
      if (!article) {
        article = liveArticles.find(a => String(a.id) === slugOrId);
      }

      if (article) {
        setSelectedArticle(article);
        window.scrollTo(0, 0);
      } else {
        setSelectedArticle(null);
      }
    } else {
      setSelectedArticle(null);
    }
  }, [pathSlug, searchParams, liveArticles, loadingArticles]);

  const handleShare = async (article: typeof articles[0]) => {
    const shareUrl = `https://www.karlisin.com/blog/${article.slug || article.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: shareUrl,
        });
      } catch (err) {
        if (!(err instanceof Error && err.name === 'AbortError')) {
          console.error('Sharing failed', err);
        }
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        // Custom toast instead of alert would be better, but sticking to simple feedback
        const btn = document.getElementById(`share-btn-${article.id}`);
        if (btn) {
          const originalText = btn.innerHTML;
          btn.innerHTML = 'Kopyalandı!';
          setTimeout(() => { btn.innerHTML = originalText; }, 2000);
        } else {
          alert('Link kopyalandı!');
        }
      } catch (err) {
        console.error('Clipboard failed', err);
      }
    }
  };

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
      
      const path = 'newsletter_subscribers';
      try {
        await addDoc(collection(db, path), {
          email: email,
          subscribedAt: serverTimestamp(),
          source: 'blog_newsletter'
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }

      try {
        const apiUrl = getApiUrl('/api/mail');

        await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, type: 'newsletter' })
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

  const handleManualBroadcast = async (article: typeof articles[0]) => {
    try {
      setStatus('loading');
      console.log(`[Karlısın] Manuel duyuru başlatılıyor: ${article.title}`);
      
      const path = 'newsletter_subscribers';
      let querySnapshot;
      try {
        querySnapshot = await getDocsFromServer(collection(db, path));
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, path);
        return; // handleFirestoreError throws, but just in case
      }
      
      const subscribers = querySnapshot.docs.map(doc => doc.data().email).filter(e => !!e);

      if (subscribers.length === 0) {
        alert('Abone bulunamadı!');
        setStatus('idle');
        return;
      }

      const apiUrl = getApiUrl('/api/broadcast');
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscribers,
          articleTitle: article.title,
          articleExcerpt: article.excerpt,
          articleUrl: `https://www.karlisin.com/blog/${article.slug || article.id}`
        })
      });

      if (res.ok) {
        alert('Duyuru başarıyla gönderildi!');
        localStorage.setItem('last_broadcast_article_id', String(article.id));
      } else {
        alert('Duyuru gönderilirken bir hata oluştu.');
      }
      setStatus('idle');
    } catch (err) {
      console.error('Manual broadcast error:', err);
      alert('Kritik hata! Konsolu kontrol edin.');
      setStatus('idle');
    }
  };

  if (selectedArticle) {
    return (
      <div className="pt-24 pb-20 px-6 max-w-4xl mx-auto min-h-screen">
        <Helmet>
          <title>{selectedArticle.title} | Karlısın Blog</title>
          <meta name="description" content={selectedArticle.excerpt} />
        </Helmet>
        <div className="flex justify-between items-center mb-8">
          <motion.button 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setSelectedArticle(null)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group font-bold tracking-tight"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Geri Dön
          </motion.button>
        </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="aspect-[21/9] rounded-[40px] overflow-hidden mb-12 border border-white/10 shadow-2xl">
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

            <div className="mt-16 pt-8 border-t border-white/10">
              <h3 className="text-2xl font-black text-white mb-8 italic uppercase tracking-wider">İlginizi Çekebilir</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {liveArticles
                  .filter(a => a.id !== selectedArticle.id)
                  .sort(() => Math.random() - 0.5)
                  .slice(0, 2)
                  .map(related => (
                    <motion.div
                      key={related.id}
                      onClick={() => {
                        navigate(`/blog/${related.slug || related.id}`);
                        window.scrollTo(0, 0);
                      }}
                      className="group bg-white/5 rounded-3xl border border-white/5 hover:border-indigo-500/30 overflow-hidden cursor-pointer transition-all"
                    >
                      <div className="aspect-[21/9] overflow-hidden">
                        <img src={related.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={related.title} />
                      </div>
                      <div className="p-6">
                        <h4 className="text-white font-bold group-hover:text-indigo-400 transition-colors line-clamp-1">{related.title}</h4>
                        <p className="text-slate-400 text-xs mt-2 line-clamp-2">{related.excerpt}</p>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>

            <div className="mt-16 pt-8 border-t border-white/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white">K</div>
                <div>
                  <p className="text-white font-bold">Karlısın Ekibi</p>
                  <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Finans Editörü</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {searchParams.get('admin') === 'true' && (
                  <button 
                    onClick={() => handleManualBroadcast(selectedArticle)}
                    disabled={status === 'loading'}
                    className="p-3 bg-emerald-500 hover:bg-emerald-600 rounded-2xl border border-emerald-400/20 text-white transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2 px-6 disabled:opacity-50"
                  >
                    <CheckCircle size={20} />
                    <span className="font-bold text-sm uppercase tracking-widest">Duyuru Gönder</span>
                  </button>
                )}
                <button 
                  onClick={() => handleShare(selectedArticle)}
                  className="p-3 bg-indigo-500 hover:bg-indigo-600 rounded-2xl border border-indigo-400/20 text-white transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center gap-2 px-6"
                >
                  <Share2 size={20} />
                  <span className="font-bold text-sm uppercase tracking-widest">Paylaş</span>
                </button>
              </div>
            </div>
          </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
      <Helmet>
        <title>Blog - Karlısın | Finansal Stratejiler ve Pazar Analizleri</title>
        <meta name="description" content="E-ticaret başarısı, 2026 maaş hesaplamaları ve yatırım stratejileri üzerine güncel Karlısın blog yazıları." />
      </Helmet>
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
        <div className="max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-300 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-indigo-500/20 font-bold">
            {liveArticles.length} Toplam İçerik
          </motion.div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Karlısın <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Blog</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-slate-400 font-medium mt-4 text-lg">
            E-ticaret ve finans dünyasındaki en son gelişmeleri, stratejileri ve başarı hikayelerini takip edin.
          </motion.p>
        </div>

        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-indigo-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Yazı ara..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-11 pr-5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-white placeholder:text-slate-500 transition-all font-medium" 
          />
        </div>
      </div>

      <div className="flex flex-col gap-16 items-center">
        {/* Featured Article - Only show if not searching */}
        {filteredArticles.length > 0 && searchQuery === '' && (
          <motion.article 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            onClick={() => navigate(`/blog/${filteredArticles[0].slug || filteredArticles[0].id}`)} 
            className="bg-white/5 backdrop-blur-md rounded-3xl md:rounded-[48px] border border-white/10 overflow-hidden group hover:border-indigo-500/50 transition-all flex flex-col cursor-pointer shadow-2xl max-w-5xl"
          >
            <div className="aspect-video overflow-hidden relative">
              <img src={filteredArticles[0].image} alt={filteredArticles[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
              <div className="absolute top-6 left-6">
                <span className="px-4 py-1.5 bg-indigo-500 backdrop-blur-md text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg">SON YAZI</span>
              </div>
            </div>
            
            <div className="p-10 md:p-16 flex flex-col items-center text-center">
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-black text-slate-500 uppercase tracking-widest mb-6">
                <span className="px-3 py-1 bg-white/5 rounded-lg border border-white/10">{filteredArticles[0].category}</span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5"><Clock size={14} /> {filteredArticles[0].readTime} oku</span>
                <span className="hidden sm:inline">•</span>
                <span>{filteredArticles[0].date}</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6 group-hover:text-indigo-400 transition-colors leading-tight tracking-tight">{filteredArticles[0].title}</h2>
              <p className="text-lg text-slate-400 font-medium mb-10 line-clamp-3 leading-relaxed max-w-3xl">{filteredArticles[0].excerpt}</p>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-indigo-400 group-hover:text-white transition-all">
                  Hemen Oku <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </button>
                {searchParams.get('admin') === 'true' && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleManualBroadcast(filteredArticles[0]);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/5"
                  >
                    <CheckCircle size={14} /> Duyuru Gönder
                  </button>
                )}
              </div>
            </div>
          </motion.article>
        )}

        {/* Regular Articles List */}
        <div className="w-full max-w-7xl">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-[40px] border border-white/10 w-full">
              <Search size={48} className="mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400 font-medium">Aradığınız kriterlere uygun yazı bulunamadı.</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-4 text-indigo-400 font-bold hover:underline"
              >
                Tüm yazıları göster
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Show articles other than the featured one if not searching */}
              {(searchQuery === '' ? filteredArticles.slice(1) : filteredArticles).map((article, i) => (
                <motion.article 
                  key={article.id} 
                  initial={{ opacity: 0, y: 20 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }} 
                  onClick={() => navigate(`/blog/${article.slug || article.id}`)} 
                  className="bg-white/5 backdrop-blur-md rounded-[40px] border border-white/10 overflow-hidden group hover:border-indigo-500/50 transition-all flex flex-col cursor-pointer text-center items-center"
                >
                  <div className="aspect-[16/9] w-full overflow-hidden relative">
                    <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-lg border border-white/10">{article.category}</span>
                    </div>
                  </div>
                  
                  <div className="p-8 flex flex-col items-center flex-grow">
                    <div className="flex items-center justify-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
                      <span className="flex items-center gap-1.5"><Clock size={12} /> {article.readTime} oku</span>
                      <span>•</span>
                      <span>{article.date}</span>
                    </div>
                    <h2 className="text-xl font-black text-white mb-4 group-hover:text-indigo-400 transition-colors line-clamp-2 leading-tight">{article.title}</h2>
                    <p className="text-sm text-slate-400 font-medium mb-6 line-clamp-2 leading-relaxed">{article.excerpt}</p>
                    <div className="mt-auto pt-4 border-t border-white/5 w-full">
                      <button className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 group-hover:text-white transition-colors w-full">
                        Devamını Oku <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Featured Newsletter */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-20 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-xl p-12 rounded-[48px] border border-white/10 text-center relative overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto">
          <BookOpen size={48} className="mx-auto text-indigo-400 mb-6" />
          <h2 className="text-3xl font-black text-white mb-4">Haftalık Analizler Kapınıza Gelsin</h2>
          <p className="text-slate-300 font-medium mb-8">E-ticaret başarısı için gereken verileri ve ipuçlarını haftalık olarak e-posta adresinize gönderelim.</p>
          
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl">
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle className="text-emerald-400" size={32} />
                  <p className="text-white font-bold text-lg">Bültene Abone Oldunuz!</p>
                  <p className="text-emerald-400/80 text-sm">Analizlerimizi size ulaştırmak için sabırsızlanıyoruz.</p>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-grow flex flex-col items-start gap-2">
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-posta adresiniz" className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-white font-medium" />
                  {status === 'error' && <p className="text-rose-400 text-xs font-bold ml-2">{errorMessage}</p>}
                </div>
                <button type="submit" disabled={status === 'loading'} className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center min-w-[140px]">
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
