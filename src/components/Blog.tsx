import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Clock, ArrowRight, BookOpen, Loader2, CheckCircle2, ArrowLeft, Share2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const articles = [
  {
    id: 1,
    title: 'Haftalık Temettü Analizi: Portföy Stratejileri',
    excerpt: 'Bugün yayınladığımız analizde BIST 100 ve global piyasalardaki temettü verimi en yüksek şirketleri inceledik.',
    category: 'Analiz',
    date: '23 Nisan 2026',
    readTime: '8 dk',
    image: 'https://images.unsplash.com/photo-1611974717528-58730d385ad2?auto=format&fit=crop&q=80&w=800',
    content: `
      <p>Bugün, 23 Nisan 2026 itibarıyla piyasalarda temettü odaklı bir hareketlilik gözlemliyoruz. Karlısın ekibi olarak hazırladığımız bu haftalık analizde, portföyünüzü koruyacak ve büyütecek stratejilere odaklandık.</p>
      <h3 style="color: white; margin-top: 24px;">Piyasa Özeti</h3>
      <p>Borsa İstanbul'da işlem hacmi bugün rekor seviyelere yaklaştı. Özellikle enerji ve teknoloji hisselerindeki temettü projeksiyonları, uzun vadeli yatırımcılar için yeşil ışık yakıyor.</p>
      <h3 style="color: white; margin-top: 24px;">Pasif Gelir Odak Noktası</h3>
      <p>Unutmayın, temettü yatırımcılığı bir sprint değil, maratondur. Karlısın'ın 10 yıllık projeksiyon araçlarıyla geleceğinizi bugünden planlayın.</p>
    `
  },
  {
    id: 2,
    title: 'Dijital Dönüşümde E-ticaretin Geleceği',
    excerpt: 'E-ticarette başarının anahtarı artık sadece ürün satmak değil, veriyi doğru okumaktan geçiyor.',
    category: 'Gelecek',
    date: '23 Nisan 2026',
    readTime: '6 dk',
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800',
    content: `
      <h3 style="color: white; margin-top: 24px;">Veri Odaklı Karar Verme</h3>
      <p>Karlısın blog yazarı olarak bugün şunu vurgulamak istiyoruz: Verileriniz size hikayenizi anlatır. Satış rakamlarınızın ötesine geçin.</p>
      <h3 style="color: white; margin-top: 24px;">Yapay Zeka Entegrasyonu</h3>
      <p>2026 yılı, yapay zekanın e-ticaret lojistiğinde %30 daha fazla verimlilik sağladığı yıl olarak tarihe geçecek.</p>
    `
  },
  {
    id: 3,
    title: 'Yeni Nesil Vergi Yapılandırması ve Karlılık',
    excerpt: 'Vergi maliyetlerini yasal yollarla optimize ederek kâr marjınızı nasıl %5 artırırsınız?',
    category: 'Finans',
    date: '23 Nisan 2026',
    readTime: '5 dk',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
    content: `
      <p>Mevzuat değişiklikleri her zaman bir fırsat barındırır. Karlısın ile bu fırsatları yakalayın.</p>
      <h3 style="color: white; margin-top: 24px;">Maliyet Analizi</h3>
      <p>Bugün her işletmeyen yapması gereken ilk şey, gizli operasyonel maliyetleri ortaya çıkarmaktır.</p>
    `
  },
  {
    id: 4,
    title: 'Haftalık Analiz: E-ticaret Başarı İpuçları',
    excerpt: 'Kendi markasını kurmak isteyenler için bu haftanın altın değerindeki tavsiyeleri.',
    category: 'Özel',
    date: '23 Nisan 2026',
    readTime: '7 dk',
    image: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaad5b?auto=format&fit=crop&q=80&w=800',
    content: `
      <p>Karlısın Haftalık Analiz dizisinin bu bölümünde, yeni başlayanlar için yol haritasını çiziyoruz.</p>
      <h3 style="color: white; margin-top: 24px;">Marka Kimliği</h3>
      <p>Siz sadece bir ürün değil, bir çözüm satıyorsunuz. Markanızın sesi, müşterinizin duymak istediği cevap olmalı.</p>
      <h3 style="color: white; margin-top: 24px;">Lojistik Gücü</h3>
      <p>Doğru kargo anlaşması ve hızlı teslimat, markanızı zirveye taşıyacak iki temel dayanaktır.</p>
    `
  },
  {
    id: 5,
    title: 'Maliyet Yönetimi: 2026 Stratejileri',
    excerpt: 'Artan maliyetler karşısında kâr marjınızı korumanın yolları ve yeni ekonomi modeli.',
    category: 'Finans',
    date: '23 Nisan 2026',
    readTime: '9 dk',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800',
    content: `
      <p>2026 yılı maliyet yönetimi açısından zorlayıcı olsa da Karlısın araçlarıyla bu süreci avantaja çevirebilirsiniz.</p>
      <h3 style="color: white; margin-top: 24px;">Operasyonel Verimlilik</h3>
      <p>Gereksiz harcamaları kısmak yerine, var olan kaynakları daha verimli kullanma stratejilerini inceliyoruz.</p>
      <h3 style="color: white; margin-top: 24px;">Fiyatlandırma Psikolojisi</h3>
      <p>Maliyet artışlarını fiyata yansıtırken müşteri sadakatini bozmamak için kullanabileceğiniz psikolojik modeller.</p>
    `
  },
  {
    id: 6,
    title: '2026\'da Pasif Gelir Modelleri: Nereden Başlamalı?',
    excerpt: 'Finansal özgürlük yolunda pasif gelir inşa etmek için 2026 yılının en kârlı ve sürdürülebilir modellerini keşfedin.',
    category: 'Strateji',
    date: '23 Nisan 2026',
    readTime: '10 dk',
    image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=800',
    content: `
      <p>Gerçek finansal özgürlük, siz uyurken bile çalışan sistemler kurmaktan geçer. Karlısın olarak 2026 projeksiyonlarımızda öne çıkan modelleri sizin için derledik.</p>
      <h3 style="color: white; margin-top: 24px;">Dijital Varlık Yatırımcılığı</h3>
      <p>Artık sadece hisse senedi değil, yapay zeka tarafından yönetilen dijital gelir kapıları da portföylerin vazgeçilmezi haline geldi.</p>
      <h3 style="color: white; margin-top: 24px;">Otomatik E-Ticaret Kanalları</h3>
      <p>Stoksuz satışın ötesinde, marka sadakati üzerine kurulu ve tam otomatize edilmiş niş mağazalar, 2026'nın en yüksek ROI (Geri Dönüş) oranına sahip.</p>
    `
  },
  {
    id: 7,
    title: 'B2B E-ticarette Müşteri Edinme Maliyeti (CAC) Nasıl Düşürülür?',
    excerpt: 'Artan reklam maliyetleri karşısında, B2B sektöründe müşteri başına maliyeti optimize etmenin 5 stratejik yolu.',
    category: 'Analiz',
    date: '23 Nisan 2026',
    readTime: '12 dk',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800',
    content: `
      <p>B2B dünyasında rekabet artık sadece fiyatta değil, operasyonel verimlilikte yaşanıyor. CAC değerlerinizi nasıl tek haneli yüzdelere indirirsiniz?</p>
      <h3 style="color: white; margin-top: 24px;">Hesap Odaklı Pazarlama (ABM)</h3>
      <p>Geniş kitlelere reklam vermek yerine, Karlısın verileriyle nokta atışı yaparak potansiyeli en yüksek müşterilere odaklanın.</p>
      <h3 style="color: white; margin-top: 24px;">Sadakat Döngüsü</h3>
      <p>Yeni müşteri bulmak, var olanı elde tutmaktan 5 kat daha pahalıdır. CAC'ı düşürmenin en iyi yolu, churn (kayıp) oranını sıfıra yaklaştırmaktır.</p>
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
      
      await addDoc(collection(db, 'newsletter_subscribers'), {
        email: email,
        subscribedAt: serverTimestamp(),
        source: 'blog_newsletter'
      });

      try {
        const workingCloudRunUrl = 'https://karl-s-n-1001236491636.europe-west2.run.app/api/mail';
        const isCustomDomain = window.location.hostname.includes('karlisin.com') || window.location.hostname.includes('www');
        const apiUrl = isCustomDomain ? workingCloudRunUrl : '/api/mail';

        await fetch(apiUrl, {
          method: 'POST',
          mode: 'cors',
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

  if (selectedArticle) {
    return (
      <div className="pt-24 pb-20 px-6 max-w-4xl mx-auto min-h-screen">
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
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-300 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-indigo-500/20 font-bold">
            Haberler & İpuçları
          </motion.div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Karlısın <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Blog</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-slate-400 font-medium mt-4 text-lg">
            E-ticaret ve finans dünyasındaki en son gelişmeleri, stratejileri ve başarı hikayelerini takip edin.
          </motion.p>
        </div>

        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Yazı ara..." className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium transition-all text-white" />
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
            className="bg-white/5 backdrop-blur-md rounded-[32px] border border-white/10 overflow-hidden group hover:border-indigo-500/50 transition-all flex flex-col cursor-pointer"
          >
            <div className="aspect-[16/9] overflow-hidden relative">
              <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-lg border border-white/10">{article.category}</span>
              </div>
            </div>
            
            <div className="p-8 flex flex-col flex-grow">
              <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
                <span className="flex items-center gap-1.5"><Clock size={12} /> {article.readTime} oku</span>
                <span>•</span>
                <span>{article.date}</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-4 group-hover:text-indigo-400 transition-colors leading-tight">{article.title}</h2>
              <p className="text-sm text-slate-400 font-medium mb-8 line-clamp-2">{article.excerpt}</p>
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
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-20 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-xl p-12 rounded-[48px] border border-white/10 text-center relative overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto">
          <BookOpen size={48} className="mx-auto text-indigo-400 mb-6" />
          <h2 className="text-3xl font-black text-white mb-4">Haftalık Analizler Kapınıza Gelsin</h2>
          <p className="text-slate-300 font-medium mb-8">E-ticaret başarısı için gereken verileri ve ipuçlarını haftalık olarak e-posta adresinize gönderelim.</p>
          
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl">
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="text-emerald-400" size={32} />
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
