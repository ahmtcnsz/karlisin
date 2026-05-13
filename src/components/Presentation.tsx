import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rocket, 
  Brain, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Layers, 
  ChevronRight, 
  ChevronLeft,
  PieChart,
  Target,
  Calculator,
  LineChart,
  Code2,
  Cpu,
  Globe,
  Users
} from 'lucide-react';

const slides = [
  {
    id: 'karlisin-logo-joke',
    title: 'Karlısın',
    subtitle: '"Logoyu bir tık sola alalım..."',
    icon: <Rocket className="w-16 h-16 text-indigo-400" />,
    color: 'from-indigo-600 to-purple-600',
    content: [
      'Geleneksel ajans makaralarını bir kenara bırakalım.',
      'Karlısın, hiyerarşinin değil, verimliliğin ürünüdür.',
      'Revizyonlara değil, doğrudan sonuca ve vizyona odaklanan bir platform.'
    ]
  },
  {
    id: 'intro',
    title: 'Karlısın: Analitik Finans Ekosistemi',
    subtitle: 'Yapay Zeka Destekli Hibrit Geliştirme ve Analiz Modeli',
    icon: <Brain className="w-16 h-16 text-pink-400" />,
    color: 'from-pink-600 to-rose-600',
    content: [
      'Karlısın, karmaşık finansal verileri anlamlı içgörülere dönüştüren bir asistan olarak kurgulandı.',
      'Geliştirme süreçlerinde AI otonomisinden faydalanarak ürün döngülerini %80 hızlandırdık.',
      'Teknolojiyi son kullanıcı için basit ve erişilebilir kılmak birincil önceliğimiz.'
    ]
  },
  {
    id: 'team-efficiency',
    title: 'Süreç Optimizasyonu: Dev & FE',
    subtitle: 'Geliştirme Maliyetlerini ve Sürelerini Minimize Ettik',
    icon: <Code2 className="w-16 h-16 text-blue-400" />,
    color: 'from-blue-600 to-indigo-600',
    grid: [
      { icon: <Code2 />, title: 'Frontend (FE)', desc: 'AI destekli tasarım sistemleri ile kullanıcı arayüzü geliştirmeyi %70 daha verimli hale getirdik.' },
      { icon: <Layers />, title: 'Backend (BE)', desc: 'Serverless mimari ve AI tarafından denetlenen API yapıları ile sistem güvenliğini artırdık.' },
      { icon: <Cpu />, title: 'Altyapı Yönetimi', desc: 'Sistem izleme ve hata tespit süreçlerini AI ile optimize ederek operasyonel yükü düşürdük.' },
      { icon: <ShieldCheck />, title: 'QA & Denetim', desc: 'Otomatize edilmiş test senaryoları ile teknik borcun oluşmasını önceden engelliyoruz.' }
    ]
  },
  {
    id: 'backoffice-disruption',
    title: 'Operasyonel Dönüşüm: Back-Office',
    subtitle: 'Veri Yönetiminde Maksimum Otomasyon',
    icon: <Zap className="w-16 h-16 text-yellow-500" />,
    color: 'from-yellow-600 to-orange-600',
    content: [
      'Geleneksel finansal veri giriş süreçlerindeki manuel iş yükünü otomatize sistemlere devrettik.',
      'Canlı piyasa verileri ve yasal mevzuat güncellemeleri anlık olarak sisteme entegre ediliyor.',
      'Düşük operasyonel maliyet, kullanıcılarımıza daha kaliteli hizmet olarak geri dönüyor.'
    ]
  },
  {
    id: 'ai-scanner-real',
    title: 'AI Portföy Tarama & Analiz',
    subtitle: 'Yatırımlarınızı Rasyonel Bir Gözle İnceleyin',
    icon: <TrendingUp className="w-16 h-16 text-emerald-400" />,
    color: 'from-emerald-600 to-teal-600',
    content: [
      'Karlısın, portföyünüzdeki gizli riskleri ve büyüme potansiyellerini özel geliştirilen "AI Scanner" ile tarar.',
      'Temettü verimliliği ve sektörel korelasyonları analiz ederek sizi piyasa dalgalanmalarına karşı uyarır.',
      'Duygusal kararlar yerine, geçmiş verilere ve rasyonel projeksiyonlara dayalı bir yol haritası sunar.'
    ]
  },
  {
    id: 'borsa-vision-real',
    title: 'Borsa: Bilinçli Yatırımın Yeni Adresi',
    subtitle: 'BIST ve Global Piyasalarda Şeffaf Analiz',
    icon: <LineChart className="w-16 h-16 text-indigo-400" />,
    color: 'from-indigo-600 to-cyan-600',
    content: [
      'Borsa İstanbul yatırımcıları için bilanço analizlerini ve piyasa raporlarını AI ile filtreden geçiriyoruz.',
      'Amacımız, yatırımcıların karmaşık tablolar içinde kaybolmasını engellemek ve odaklanmalarını sağlamak.',
      'Karlısın, yatırım disiplini kazandıran bir "dijital akıl hocası" olma yolunda ilerliyor.'
    ]
  },
  {
    id: 'ecommerce-engine',
    title: 'E-Ticaret Finansal Yönetimi',
    subtitle: 'Pazaryeri Satıcıları İçin Kâr Odaklı Çözümler',
    icon: <Calculator className="w-16 h-16 text-blue-400" />,
    color: 'from-blue-600 to-cyan-600',
    grid: [
      { icon: <Zap />, title: 'Hassas Kâr Analizi', desc: 'Komisyon, kargo ve KDV dahil net kârınızı her ürün bazında anlık hesaplayın.' },
      { icon: <Globe />, title: 'Dinamik Maliyet Takibi', desc: 'Değişen lojistik ve hammadde maliyetlerini satış fiyatlarınıza yansıtın.' },
      { icon: <Layers />, title: 'Bütçe Planlama', desc: 'Satıcıların nakit akışı yönetimini kolaylaştıran finansal takip araçları.' },
      { icon: <Target />, title: 'Müşteri Karlılığı', desc: 'Hangi satış kanalının veya ürünün daha verimli olduğunu AI ile tespit edin.' }
    ]
  },
  {
    id: 'ai-development-power',
    title: 'İterasyon Gücü ve Çeviklik',
    subtitle: 'Teknolojinin Hızına Ayak Uyduran Mimari',
    icon: <Cpu className="w-16 h-16 text-slate-300" />,
    color: 'from-slate-700 to-slate-900',
    content: [
      'Yazılım geliştirme döngülerini AI araçlarıyla destekleyerek yeni özellikleri rekor sürede yayına alıyoruz.',
      'Kullanıcı geri bildirimlerini anlık olarak koda dönüştürebilen esnek bir altyapı inşa ettik.',
      'Teknolojik gelişmeleri seyretmek yerine, onları doğrudan ürünün çekirdeğine entegre ediyoruz.'
    ]
  },
  {
    id: 'personal-finance-authority',
    title: 'Kişisel Finans ve Mevzuat Rehberi',
    subtitle: 'Herkes İçin Finansal Okuryazarlık',
    icon: <Users className="w-16 h-16 text-pink-400" />,
    color: 'from-pink-600 to-rose-600',
    content: [
      'Maaş hesaplama, kıdem tazminatı ve vergi dilimi gibi karmaşık konuları basitleştirerek sunuyoruz.',
      'Kredi ve mortgage ödeme planlarını, gizli maliyetlerden arındırarak net bir şekilde analiz ediyoruz.',
      'Son kullanıcının finansal kararlarını daha güvenli alabilmesi için tarafsız bir rehber oluyoruz.'
    ]
  },
  {
    id: 'revenue-strategy',
    title: 'Sürdürülebilir Gelir Modeli',
    subtitle: 'Değer Odaklı Büyüme Stratejisi',
    icon: <PieChart className="w-16 h-16 text-emerald-400" />,
    color: 'from-emerald-600 to-teal-600',
    grid: [
      { icon: <Target />, title: 'Premium Servisler', desc: 'Derin analiz ve raporlama isteyen kullanıcılar için abonelik paketleri.' },
      { icon: <Globe />, title: 'Veri Ortaklıkları', desc: 'Finansal kurumlar ve pazar yerleri için analitik veri çözümleri.' },
      { icon: <Layers />, title: 'API Servisleri', desc: 'Geliştirdiğimiz finansal motorların kurumsal yapılara entegrasyonu.' },
      { icon: <ShieldCheck />, title: 'Ecosystem Fees', desc: 'Finansal araçların kullanımı üzerinden kurgulanan partnerlik modelleri.' }
    ]
  },
  {
    id: 'iteration-macro',
    title: 'Anlık Revizyon ve Adaptasyon',
    subtitle: 'Hızın Avantajını Kullanıyoruz',
    icon: <Zap className="w-16 h-16 text-amber-500" />,
    color: 'from-amber-600 to-yellow-600',
    content: [
      'Geleneksel hiyerarşilerde günler süren revizyonları AI desteğiyle dakikalara indiriyoruz.',
      'Piyasa koşullarındaki ani değişimlere (vergi güncellemeleri vb.) anında yanıt verebiliyoruz.',
      'Prototipleme hızımız, pazarın dinamiklerine en iyi şekilde yanıt vermemizi sağlıyor.'
    ]
  },
  {
    id: 'scalability-global',
    title: 'Küresel Ölçeklenebilirlik',
    subtitle: 'Yerelden Küresele Uzanan Altyapı',
    icon: <Globe className="w-16 h-16 text-blue-400" />,
    color: 'from-blue-600 to-cyan-600',
    content: [
      'Altyapımız, farklı dillerdeki ve ülkelerdeki finansal mevzuatlara hızla adapte olabilecek şekilde tasarlandı.',
      'Cloud-Native mimari sayesinde milyonlarca kullanıcıya aynı kalitede hizmet sunabiliyoruz.',
      'Bugün Türkiye pazarında olan çözümlerimizi, çok yakında global piyasalara açmayı hedefliyoruz.'
    ]
  },
  {
    id: 'tech-stack-real',
    title: 'Teknolojik Altyapı ve Güvenlik',
    subtitle: 'Modern Standartlarla İnşa Edilen Mimari',
    icon: <Code2 className="w-16 h-16 text-slate-400" />,
    color: 'from-slate-700 to-slate-900',
    content: [
      'Frontend: React 18, Vite ve Framer Motion ile akıcı bir kullanıcı deneyimi.',
      'Backend: Firebase ve Serverless yapıları ile ölçeklenebilir ve güvenli veri yönetimi.',
      'Veri Güvenliği: Tüm finansal işlemler endüstri standardı güvenlik protokolleri ile korunmaktadır.',
      'AI Core: Analiz motorlarımızda en güncel dil modellerini (LLM) veriye dayalı kullanıyoruz.'
    ]
  },
  {
    id: 'closing',
    title: 'Finansın Geleceğini Tasarlıyoruz',
    subtitle: 'Karlısın - Herkes İçin Şeffaf Finans',
    icon: <Rocket className="w-16 h-16 text-indigo-400" />,
    color: 'from-indigo-600 to-purple-600',
    content: [
      'Teknolojinin sunduğu imkanları, finansal özgürlüğü demokratize etmek için kullanıyoruz.',
      'Karlısın, veriyi kâra dönüştüren tüm yatırımcıların ve girişimcilerin yanında.',
      'Bizi dinlediğiniz için teşekkür ederiz. Şimdi kânlı olma zamanı.'
    ]
  }
];

export default function Presentation() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slide = slides[currentSlide];

  const next = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prev = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-slate-950 overflow-y-auto md:overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className={`absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-br ${slide.color} opacity-10 blur-[120px] rounded-full transition-all duration-1000`} />
        <div className={`absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-tr ${slide.color} opacity-10 blur-[120px] rounded-full transition-all duration-1000`} />
      </div>

      <div className="max-w-5xl w-full z-10 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -20 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-16 shadow-2xl relative overflow-hidden"
          >
            {/* Slide Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-800/50">
              <motion.div 
                className={`h-full bg-gradient-to-r ${slide.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>

            <div className="absolute top-8 right-8 text-slate-500 font-mono text-sm tracking-widest flex items-center gap-2">
              <span className="text-white">{String(currentSlide + 1).padStart(2, '0')}</span>
              <span className="opacity-20">/</span>
              <span>{String(slides.length).padStart(2, '0')}</span>
            </div>

            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ 
                  scale: 1, 
                  rotate: 0,
                  x: slide.id === 'karlisin-logo-joke' ? -10 : 0 
                }}
                transition={{ type: 'spring', damping: 15, stiffness: 100, delay: 0.2 }}
                className={`mb-10 p-7 bg-gradient-to-br ${slide.color} rounded-x-3xl rounded-y-2xl shadow-2xl relative group`}
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity rounded-inherit" />
                {React.cloneElement(slide.icon as React.ReactElement<any>, { className: "w-16 h-16 text-white" })}
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 mb-4 tracking-tighter"
              >
                {slide.title}
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${slide.color} mb-14 uppercase tracking-[0.2em]`}
              >
                {slide.subtitle}
              </motion.p>

              {slide.content && (
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.15, delayChildren: 0.5 } },
                    hidden: {}
                  }}
                  className="space-y-6 max-w-3xl"
                >
                  {slide.content.map((p, i) => (
                    <motion.div
                      key={i}
                      variants={{
                        hidden: { opacity: 0, x: -30 },
                        visible: { opacity: 1, x: 0 }
                      }}
                      className="flex items-start gap-4 text-left group"
                    >
                      <div className={`mt-2 w-3 h-3 rounded-full flex-shrink-0 bg-gradient-to-br ${slide.color} shadow-lg shadow-indigo-500/50 group-hover:scale-125 transition-transform`} />
                      <p className="text-slate-300 text-lg md:text-xl leading-relaxed font-light">
                        {p}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {slide.grid && (
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.5 } },
                    hidden: {}
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mt-4"
                >
                  {slide.grid.map((item, i) => (
                    <motion.div
                      key={i}
                      variants={{
                        hidden: { opacity: 0, scale: 0.8, y: 30 },
                        visible: { opacity: 1, scale: 1, y: 0 }
                      }}
                      className="bg-slate-800/30 backdrop-blur-md p-8 rounded-[2rem] border border-white/5 text-left hover:bg-slate-800/50 transition-all hover:border-white/20 hover:-translate-y-2 group shadow-xl"
                    >
                      <div className={`mb-6 w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-br ${slide.color} text-white group-hover:rotate-12 transition-transform shadow-lg`}>
                        {React.cloneElement(item.icon as React.ReactElement<any>, { className: "w-6 h-6" })}
                      </div>
                      <h3 className="text-white font-black text-xl mb-3 tracking-tight">{item.title}</h3>
                      <p className="text-slate-400 leading-relaxed font-light text-sm">{item.desc}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <div className="flex items-center justify-between mt-16 w-full px-4">
          <button
            onClick={prev}
            className="flex items-center gap-3 px-8 py-4 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all active:scale-95 group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold tracking-widest uppercase text-xs">Geri</span>
          </button>

          <div className="hidden md:flex gap-3">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-500 hover:opacity-100 ${
                  i === currentSlide ? 'w-12 bg-indigo-500' : 'w-3 bg-slate-800 opacity-50'
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="flex items-center gap-3 px-8 py-4 bg-indigo-600 rounded-2xl text-white hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/30 active:scale-95 group"
          >
            <span className="font-bold tracking-widest uppercase text-xs">
              {currentSlide === slides.length - 1 ? 'Başa Dön' : 'Devam Et'}
            </span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Footer Branding Removed */}
    </div>
  );
}
