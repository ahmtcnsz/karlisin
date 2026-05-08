import React, { useMemo } from 'react';
import { Globe, Mail, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();
  const path = location.pathname;

  const seoContent = useMemo(() => {
    if (path.includes('maas-vergi-hesaplama')) {
      return {
        title: "Maaş ve Gelir Vergisi Çözümleri",
        desc: "Karlısın 2026 Maaş Hesaplama aracı, brütten nete hesaplama, gelir vergisi dilimleri ve SGK kesintilerini en güncel mevzuat verileriyle sunar. Çalışanlar ve işverenler için 12 aylık vergi projeksiyonu, kıdem tazminatı ve net maaş analizi süreçlerini dijitalleştirerek finansal planlamanızı kolaylaştırıyoruz.",
        tags: ['Maaş Hesaplama', 'Gelir Vergisi', 'Brütten Nete', 'Vergi Dilimleri', 'SGK Kesintisi']
      };
    }
    if (path.includes('pazar-kar')) {
      return {
        title: "E-Ticaret Kâr Ve Verimlilik Analizi",
        desc: "Karlısın Pazaryeri Kâr Hesaplama aracı; Trendyol, Amazon, Hepsiburada ve N11 satıcıları için komisyon, kargo, KDV ve hizmet bedeli gibi tüm maliyetleri otomatik analiz eder. \"Kaça Satmalıyım?\" özelliği ve detaylı gider dökümü ile e-ticaret operasyonlarınızda maksimum kârlılık ve stratejik fiyatlandırma yapmanıza yardımcı oluyoruz.",
        tags: ['Trendyol Komisyon', 'Amazon Kar Hesaplama', 'E-Ticaret Karlılık', 'Hepsiburada Komisyon', 'Satış Stratejisi']
      };
    }
    if (path.includes('temettu-takibi')) {
      return {
        title: "BIST Temettü Takibi ve Verim Analizi",
        desc: "Karlısın Temettü Takipçisi, Borsa İstanbul ve küresel piyasalardaki temettü dağıtan şirketlerin verilerini anlık olarak analiz eder. Temettü verimi, ödeme tarihleri ve 12 aylık hedef fiyat tahminleri ile portföyünüzün pasif gelir potansiyelini maksimize edin. Unified Data Engine ile doğrulanmış, gecikmesiz veriye erişin.",
        tags: ['Temettü Takvimi', 'Temettü Verimi', 'Hisse Analizi', 'Pasif Gelir', 'Borsa İstanbul']
      };
    }
    if (path.includes('borsa/nabiz')) {
      return {
        title: "Canlı Borsa ve Piyasanın Nabzı",
        desc: "Borsa İstanbul piyasa trendlerini, en çok yükselenleri ve düşenleri gerçek zamanlı takip edin. Karlısın Piyasa Nabzı aracı, teknik göstergeler ve piyasa derinliği verilerini modern bir arayüzle sunarak hızlı karar vermenizi sağlar. Sektörel değişimleri ve volatiliteyi anlık izleyerek fırsatları kaçırmayın.",
        tags: ['Canlı Borsa', 'Piyasa Analizi', 'Hisse Takip', 'Teknik Analiz', 'Anlık Veri']
      };
    }
    if (path.includes('blog')) {
      return {
        title: "Finansal Bilgi ve Yatırım Rehberi",
        desc: "Karlısın Blog sayfasında temettü yatırımcılığı, e-ticaret yönetimi, güncel vergi mevzuatları ve finansal özgürlük yolculuğuna dair kapsamlı rehberler bulabilirsiniz. Uzman görüşleri ve pratik hesaplama ipuçları ile finansal okur-yazarlığınızı geliştirin, stratejik kararlarınızı bilinçli şekilde alın.",
        tags: ['Yatırım Rehberi', 'Finansal Özgürlük', 'Hisse Yorumları', 'E-Ticaret İpuçları', 'Vergi Mevzuatı']
      };
    }
    if (path.includes('hakkimizda')) {
      return {
        title: "Yeni Nesil Finansal SaaS: Karlısın",
        desc: "Karlısın, veriyi karara dönüştüren akıllı hesaplama sistemleri üretir. Mühendislik odaklı yaklaşımımız ve Unified Data Engine altyapımızla, kullanıcılarımıza en karmaşık maliyetleri ve getiri tahminlerini saniyeler içinde sunuyoruz. Amacımız, finansal şeffaflığı ve erişilebilirliği her seviyedeki kullanıcı için demokratikleştirmektir.",
        tags: ['Karlısın Kimdir?', 'Finansal Teknoloji', 'SaaS Çözümleri', 'Veri Bilimi', 'Kurumsal Vizyon']
      };
    }
    if (path.includes('gizlilik-politikasi') || path.includes('kullanim-kosullari')) {
      return {
        title: "Güven ve Şeffaflık Politikalarımız",
        desc: "Karlısın, kullanıcı gizliliğini temel prensip olarak benimser. Gizlilik politikamız ve kullanım şartlarımız, sitemizin herhangi bir kişisel veri toplamadığını ve sunduğumuz araçların kullanım çerçevesini şeffaf bir şekilde açıklar. Hesaplamalarınız tarayıcınızda kalır, bizimle paylaşılmaz.",
        tags: ['Gizlilik Politikası', 'Kullanım Şartları', 'Şeffaflık Politikası', 'Veri Güvenliği', 'Yasal Uyarı']
      };
    }
    if (path === '/' || path === '/anasayfa') {
      return {
        title: "Profesyonel Finansal Hesaplama Araçları",
        desc: "Karlısın, e-ticaret satıcılarından yatırımcılara, çalışanlardan kurumsal yapılara kadar herkes için hassas finansal araçlar sunar. Temettü takibi, maaş vergi hesaplama ve pazaryeri kâr analizi gibi kritik metrikleri Unified Data Engine gücüyle birleştirerek, finansal kararlarınızı veriye dayalı ve güvenli şekilde almanızı sağlıyoruz.",
        tags: ['Finansal Araçlar', 'Kar Hesaplama', 'Veri Analizi', 'Stratejik Planlama', 'Yatırım Rehberi']
      };
    }
    // Default fallback
    return {
      title: "Finansal Teknoloji Çözümleri",
      desc: "Karlısın, yatırımcıların en çok ihtiyaç duyduğu temettü dağıtımı, temettü dağıtan hisseler ve 2026 maaş hesaplama gibi kritik finansal metrikleri tek bir platformda toplar. Unified Data Engine teknolojimiz ile BIST ve global borsalardaki temettü veren şirketler için 12 aylık hedef fiyat tahminleri, pazar kâr analizi ve borsa takibini en hassas verilerle sunuyoruz.",
      tags: ['Temettü Takvimi', 'Maaş Hesapla', 'Borsa Analizi', 'Pazar Kar Analizi', 'Temettü Veren Şirketler']
    };
  }, [path]);

  const badgeGlint = (
    <motion.div
      animate={{
        x: ['-100%', '200%'],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "linear",
        repeatDelay: 1
      }}
      className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 pointer-events-none"
    />
  );

  const tagLinks: Record<string, string> = {
    'Maaş Hesaplama': '/maas-vergi-hesaplama',
    'Maaş Hesapla': '/maas-vergi-hesaplama',
    'Gelir Vergisi': '/maas-vergi-hesaplama',
    'Brütten Nete': '/maas-vergi-hesaplama',
    'Pazaryeri Kâr': '/pazar-kar-hesaplama',
    'Pazar Kar Analizi': '/pazar-kar-hesaplama',
    'Kar Hesaplama': '/pazar-kar-hesaplama',
    'E-Ticaret Karlılık': '/pazar-kar-hesaplama',
    'Temettü Takvimi': '/temettu-takibi',
    'Temettü Verimi': '/temettu-takibi',
    'Temettü Takibi': '/temettu-takibi',
    'Temettü Veren Şirketler': '/temettu-takibi',
    'Canlı Borsa': '/borsa/nabiz',
    'Borsa Analizi': '/borsa/nabiz',
    'Piyasa Analizi': '/borsa/nabiz',
    'Hisse Takip': '/borsa/nabiz',
    'Anlık Veri': '/borsa/nabiz',
    'Blog': '/blog',
    'Yatırım Rehberi': '/blog',
    'Hakkımızda': '/hakkimizda',
    'Gizlilik Politikası': '/gizlilik-politikasi',
    'Kullanım Şartları': '/kullanim-kosullari'
  };

  return (
    <footer className="w-full py-12 bg-slate-950/50 backdrop-blur-xl border-t border-white/5 mt-auto font-sans relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 text-left">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="group flex flex-col items-start mb-6">
              <div className="text-2xl font-black tracking-tighter leading-none select-none flex items-baseline">
                <span className="text-white group-hover:text-indigo-400 transition-colors">KARLI</span>
                <span className="text-slate-300 group-hover:text-slate-100 transition-colors">SIN</span>
              </div>
              <div className="text-[7px] font-black tracking-[0.35em] uppercase text-slate-500 group-hover:text-indigo-400/60 transition-colors mt-1 whitespace-nowrap">
                GELECEĞİNİ HESAPLA
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Yatırımcılar ve girişimciler için akıllı, hızlı ve şeffaf finansal hesaplama süreçleri sunan yeni nesil SaaS çözümü.
            </p>
          </div>
          
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest">ÜRÜNLER</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/pazar-kar-hesaplama" className="text-sm text-slate-400 font-medium hover:text-white transition-colors">Pazaryeri Kâr</Link>
              <Link to="/maas-vergi-hesaplama" className="text-sm text-slate-400 font-medium hover:text-white transition-colors flex items-center gap-2">
                Maaş Vergi Hesapla
                <div className="relative overflow-hidden px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-black tracking-tighter rounded-md border border-indigo-500/20">
                  {badgeGlint}
                  <span className="relative z-10">YENİ</span>
                </div>
              </Link>
              <Link to="/blog" className="text-sm text-slate-400 font-medium hover:text-white transition-colors">Blog</Link>
              <Link to="/temettu-takibi" className="text-sm text-slate-400 font-medium hover:text-white transition-colors flex items-center gap-2">
                Temettü Takibi
                <div className="relative overflow-hidden px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-black tracking-tighter rounded-md border border-indigo-500/20">
                  {badgeGlint}
                  <span className="relative z-10">AKTİF</span>
                </div>
              </Link>
              <Link to="/borsa/nabiz" className="text-sm text-slate-400 font-medium hover:text-white transition-colors flex items-center gap-2">
                Piyasanın Nabzı
                <div className="relative overflow-hidden px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-black tracking-tighter rounded-md border border-indigo-500/20">
                  {badgeGlint}
                  <span className="relative z-10">YAKINDA</span>
                </div>
              </Link>
            </nav>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest">KURUMSAL</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/hakkimizda" className="text-sm text-slate-400 font-medium hover:text-white transition-colors">Hakkımızda</Link>
              <Link to="/gizlilik-politikasi" className="text-sm text-slate-400 font-medium hover:text-white transition-colors">Gizlilik Politikası</Link>
              <Link to="/kullanim-kosullari" className="text-sm text-slate-400 font-medium hover:text-white transition-colors">Kullanım Şartları</Link>
              <Link to="/site-haritasi" className="text-sm text-slate-400 font-medium hover:text-white transition-colors">Site Haritası</Link>
            </nav>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest">İLETİŞİM</h4>
            <div className="flex gap-4">
              <a 
                href="https://ahmetcansiz.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all shadow-sm"
              >
                <Globe size={18} />
              </a>
              <a 
                href="mailto:ahmtcnsz@gmail.com"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all shadow-sm"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center text-left">
            <div>
              <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{seoContent.title}</h5>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-2xl" dangerouslySetInnerHTML={{ __html: seoContent.desc }} />
            </div>
            <div className="flex flex-wrap gap-2 md:justify-end">
              {seoContent.tags.map(tag => {
                const link = tagLinks[tag];
                if (link) {
                  return (
                    <Link 
                      key={tag} 
                      to={link}
                      className="px-3 py-1.5 bg-white/5 text-[9px] font-black text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 uppercase tracking-widest rounded-lg border border-white/10 transition-all"
                    >
                      {tag}
                    </Link>
                  );
                }
                return (
                  <span key={tag} className="px-3 py-1.5 bg-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest rounded-lg border border-white/10 opacity-60">
                    {tag}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-white/5 text-center">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-loose">
            © 2026 Karlısın Profesyonel Araçlar. <br className="md:hidden" /> Hassas. Güvenilir. Yenilikçi.
          </p>
          <div className="mt-2 inline-flex items-center gap-2 px-2 py-0.5 bg-white/5 rounded border border-white/10">
             <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Build v3.1.0-prod</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
