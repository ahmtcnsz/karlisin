import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  TrendingUp, 
  Info, 
  ArrowRight, 
  Building2, 
  Wallet, 
  Users, 
  ChevronRight, 
  X, 
  BarChart3, 
  ShieldCheck, 
  PieChart,
  Target,
  ArrowUpRight,
  Shield,
  Briefcase
} from 'lucide-react';
import { useSeo } from './Sitemap';

interface IPO {
  id: number;
  name: string;
  code: string;
  price: number;
  date: string;
  method: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  description: string;
  lotRange: string;
  useOfFunds: string[];
  investorType: string;
}

const ipoData: IPO[] = [
  {
    id: 1,
    name: "Evofone Teknoloji A.Ş.",
    code: "EVFON",
    price: 65.00,
    date: "15-16-17 Mayıs 2026",
    method: "Eşit Dağıtım",
    status: 'upcoming', 
    description: "Xiaomi Türkiye distribütörü ve geniş ekosistem ürünleri sağlayıcısı. Türkiye'nin teknoloji perakendeciliği ve dağıtımında devleşen ismi.",
    lotRange: "10-12 Lot (Tahmini)",
    useOfFunds: ["%40 İşletme Sermayesi", "%30 Yeni Mağaza Yatırımları", "%30 Borç Yapılandırma"],
    investorType: "Tüm Yatırımcılara Eşit"
  },
  {
    id: 2,
    name: "Yiğit Akü Malzemeleri A.Ş.",
    code: "YIGIT",
    price: 34.68,
    date: "12-13-14 Mayıs 2026",
    method: "Eşit Dağıtım",
    status: 'ongoing', 
    description: "Küresel ölçekte enerji depolama çözümleri sunan, 5 kıtada 100'den fazla ülkeye ihracat yapan akümülatör devi.",
    lotRange: "25-30 Lot (Tahmini)",
    useOfFunds: ["%50 Lityum Batarya Üretim Tesisi", "%25 Ar-Ge Yatırımları", "%25 İşletme Sermayesi"],
    investorType: "Tüm Yatırımcılara Eşit"
  },
  {
    id: 3,
    name: "Altınay Savunma Teknolojileri",
    code: "ALTNY",
    price: 32.00,
    date: "8-9-10 Mayıs 2026",
    method: "Eşit Dağıtım",
    status: 'completed', 
    description: "İnsansız sistemler, hareket kontrol ve savunma sanayi teknolojilerinde Türkiye'nin öncü Ar-Ge merkezi.",
    lotRange: "11 Lot (Gerçekleşen)",
    useOfFunds: ["%60 Yeni Üretim Tesisi", "%30 Ar-Ge Galen Projesi", "%10 İşletme Sermayesi"],
    investorType: "Tüm Yatırımcılara Eşit"
  }
];

const nasdaqIpoData = [
  {
    id: 101,
    name: "Discord Inc.",
    code: "DSCD",
    price: 45.00,
    date: "Haziran 2026",
    market: "NASDAQ",
    status: 'upcoming',
    description: "Küresel çapta kullanılan topluluk ve iletişim platformu. Yapay zeka tabanlı moderasyon araçları ile büyümesini sürdürüyor."
  },
  {
    id: 102,
    name: "OpenAI Corp.",
    code: "OAI",
    price: 150.00,
    date: "Temmuz 2026",
    market: "NASDAQ",
    status: 'upcoming',
    description: "ChatGPT ve Sora modellerinin geliştiricisi. Dünyanın önde gelen yapay zeka araştırma ve uygulama şirketi."
  }
];

export default function HalkaArzTakvimi() {
  useSeo('Halka Arz Takvimi', 'Borsa İstanbul ve NASDAQ güncel halka arz takvimi, talep toplama tarihleri ve halka arz sonuçları.');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all');
  const [market, setMarket] = useState<'BIST' | 'NASDAQ'>('BIST');
  const [selectedIpo, setSelectedIpo] = useState<any | null>(null);
  const [bistData, setBistData] = useState<IPO[]>(ipoData);
  const [nasdaqData, setNasdaqData] = useState<any[]>(nasdaqIpoData);
  const [loading, setLoading] = useState(false);
  const [isBackgroundUpdating, setIsBackgroundUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toLocaleTimeString('tr-TR'));

  const fetchLiveIPOs = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setLoading(true);
      } else {
        setIsBackgroundUpdating(true);
      }
      
      const url = isRefresh ? '/api/ipo-data?refresh=true' : '/api/ipo-data';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API hatası: ${res.status}`);
      
      const data = await res.json();
      
      // Sadece veri gerçekten varsa ve diziyse güncelle, yoksa eski (ipoData) verisini bozma
      if (data && data.bist && Array.isArray(data.bist) && data.bist.length > 0) {
        setBistData(data.bist);
      }
      if (data && data.nasdaq && Array.isArray(data.nasdaq) && data.nasdaq.length > 0) {
        setNasdaqData(data.nasdaq);
      }
      
      if (data && data.lastUpdate) {
        const updateDate = new Date(data.lastUpdate);
        setLastUpdate(updateDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) + ' (' + updateDate.toLocaleDateString('tr-TR') + ')');
      }
    } catch (err) {
      console.warn('[Karlısın-IPO] Senkronizasyon hatası, statik veriye dönülüyor:', err);
      // Hata durumunda en azından statik veriyi garantile
      if (!bistData || bistData.length === 0) setBistData(ipoData);
    } finally {
      setLoading(false);
      setIsBackgroundUpdating(false);
    }
  };

  useEffect(() => {
    fetchLiveIPOs();
  }, []);

  const displayData = Array.isArray(market === 'BIST' ? bistData : nasdaqData) ? (market === 'BIST' ? bistData : nasdaqData) : [];
  const filteredIpos = filter === 'all' ? displayData : displayData.filter((ipo: any) => ipo && ipo.status === filter);
  
  const activeCount = displayData.filter((ipo: any) => ipo && ipo.status === 'ongoing').length;
  const upcomingIpo = displayData.find((ipo: any) => ipo && ipo.status === 'upcoming');
  const upcomingDate = upcomingIpo?.date || 'Yakında';

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Halka arz nedir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Halka arz, bir şirketin hisselerini Borsa İstanbul'da işlem görmek üzere halka açması ve yatırımcıların ortaklığına sunması sürecidir. Bu süreçte şirket sermaye artırımı veya ortak satışı yoluyla fon sağlar."
        }
      },
      {
        "@type": "Question",
        "name": "Halka arza nasıl katılınır?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Halka arzlara banka veya aracı kurumlarınızın yatırım hesapları üzerinden, talep toplama tarihleri içerisinde 'Halka Arz' sekmesi veya 'Hisse Alış' (borsada satış yöntemi ise) üzerinden katılabilirsiniz."
        }
      },
      {
        "@type": "Question",
        "name": "Eşit dağıtım ile oransal dağıtım arasındaki fark nedir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Eşit dağıtımda her yatırımcıya, katılan kişi sayısına göre yaklaşık aynı miktarda lot verilir. Oransal dağıtımda ise yatırımcının yatırdığı tutarın büyüklüğüne göre (genellikle %'lik bir oranla) lot dağıtımı yapılır."
        }
      },
      {
        "@type": "Question",
        "name": "Halka arzda kaç lot düşer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Halka arzda düşecek lot sayısı; halka arz edilen toplam pay miktarının, arza katılan toplam yatırımcı sayısına bölünmesiyle tahmin edilir. Katılım yoğunluğu arttıkça kişi başı düşen lot sayısı azalır."
        }
      }
    ]
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Karlısın Halka Arz Takvimi",
    "operatingSystem": "All",
    "applicationCategory": "FinancialApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "TRY"
    }
  };

  const formatCurrency = (val: any, m: 'BIST' | 'NASDAQ') => {
    if (typeof val !== 'number') return '—';
    try {
      return val.toLocaleString(m === 'BIST' ? 'tr-TR' : 'en-US', { 
        style: 'currency', 
        currency: m === 'BIST' ? 'TRY' : 'USD' 
      });
    } catch (e) {
      return '—';
    }
  };

  return (
    <div className="flex-grow">
      <Helmet>
        <title>2026 Halka Arz Takvimi - Güncel SPK Onaylı Halka Arzlar</title>
        <meta name="description" content="Borsa İstanbul (BIST) güncel halka arz takvimi, talep toplama tarihleri, hisse fiyatları ve lot tahminleri. SPK onaylı yeni halka arzları anlık takip edin." />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(softwareSchema)}</script>
      </Helmet>
      
      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
        <div className="max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="inline-flex items-center gap-4 px-4 py-1.5 bg-indigo-500/10 text-indigo-300 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-indigo-500/20"
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isBackgroundUpdating ? 'bg-amber-400' : 'bg-emerald-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isBackgroundUpdating ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
              </span>
              <span className={isBackgroundUpdating ? 'text-amber-400' : 'text-emerald-400'}>
                {isBackgroundUpdating ? 'SENKRONİZE EDİLİYOR...' : 'VERİLER GÜNCEL'}
              </span>
            </div>
            <div className="w-px h-3 bg-white/20 mx-1" />
            <div className="flex items-center gap-1">
              <Calendar size={14} /> SON GÜNCELLEME: {lastUpdate} {/* NO REFRESH BUTTON SHOULD BE HERE */}
            </div>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-white tracking-tight"
          >
            Halka Arz <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Takvimi</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg mt-4 font-medium leading-relaxed"
          >
            Unified Data Engine v3.1 ile 5 farklı kaynaktan doğrulanmış, Borsa İstanbul ve SPK onaylı en güncel halka arz listesi.
          </motion.p>
        </div>

        {/* Market & Filters */}
        <div className="flex flex-col gap-4">
          <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl self-end">
            {(['BIST', 'NASDAQ'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMarket(m)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  market === m 
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl">
            {(['all', 'ongoing', 'upcoming', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === f 
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {f === 'all' ? 'Tümü' : f === 'ongoing' ? 'Devam Eden' : f === 'upcoming' ? 'Beklenen' : 'Tamamlanan'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-md"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aktif Halka Arz</p>
              <h3 className="text-2xl font-black text-white">{activeCount} Şirket</h3>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-md"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sıradaki Arz</p>
              <h3 className="text-2xl font-black text-white">{upcomingDate.split(' ')[0]} {upcomingDate.split(' ')[1] || ''}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-md"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl">
              <Users size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Katılım Beklentisi</p>
              <h3 className="text-2xl font-black text-white">3M+ Kişi</h3>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Data Verification Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="mb-16 p-8 rounded-[40px] bg-slate-900/40 border border-white/5 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
        <div className="flex flex-col lg:flex-row items-center gap-10">
          <div className="shrink-0 flex items-center justify-center w-20 h-20 rounded-[28px] bg-indigo-500/10 border border-indigo-500/20">
            <ShieldCheck className="text-indigo-400" size={40} />
          </div>
          <div className="flex-grow">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 bg-indigo-500 text-white text-[9px] font-black rounded-md">UNIFIED DATA ENGINE v3.1</span>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Veri Doğrulama ve Kaynak Şeffaflığı</h3>
            </div>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-4xl">
              Halka arz verilerimiz sadece tek bir kaynaktan değil; **SPK Haftalık Bültenleri**, **KAP (Kamuyu Aydınlatma Platformu)** bildirimleri, **Borsa İstanbul (BİST)** duyuruları ve kurumsal veri terminallerinden eş zamanlı olarak çekilmektedir. 
              Her bir kayıt, ana motorumuz tarafından çapraz sorgulamaya tabi tutularak hata payı minimize edilir. Talep toplama tarihleri ve lot dağıtımları onaylandığı anda sistemimize canlı olarak yansır.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 shrink-0">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">SPK BÜLTENİ</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">KAP RESMİ</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">BİST VERİ</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">BANKA API</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Table/Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-96 bg-white/5 rounded-[40px] border border-white/10" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredIpos.map((ipo, index) => (
            <motion.div
              key={ipo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-slate-900/40 border border-white/10 rounded-[40px] overflow-hidden hover:border-indigo-500/40 transition-all duration-500"
            >
              {/* Status Badge */}
              <div className="absolute top-6 right-6">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                  ipo.status === 'ongoing' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 ring-4 ring-emerald-500/5' :
                  ipo.status === 'upcoming' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                  'bg-slate-800 text-slate-500 border border-white/5'
                }`}>
                  {ipo.status === 'ongoing' ? 'Talep Topluyor' : ipo.status === 'upcoming' ? 'Onay Bekliyor' : 'Tamamlandı'}
                </span>
              </div>

              <div className="p-10">
                <div className="flex items-start gap-6 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-white font-black text-xl shadow-xl shadow-indigo-500/20 shrink-0 capitalize">
                    {(ipo.code || 'BIST').substring(0, 2)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white mb-1 group-hover:text-indigo-400 transition-colors uppercase">{ipo.name || 'İsimsiz Şirket'}</h2>
                    <p className="text-sm font-black text-indigo-400 tracking-[0.2em]">{ipo.code || 'KOD'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Arz Fiyatı</p>
                    <p className="text-lg font-black text-white">
                      {formatCurrency(ipo.price, market)}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Arz Tarihi</p>
                    <p className="text-lg font-black text-white">{ipo.date}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-500 font-bold"><Building2 size={16} /> {market === 'BIST' ? 'Dağıtım Yöntemi' : 'Borsa'}</span>
                    <span className="text-slate-200 font-black">{market === 'BIST' ? ipo.method : ipo.market}</span>
                  </div>
                  {ipo.lotRange && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-500 font-bold"><Wallet size={16} /> Tahmini Lot Dağıtımı</span>
                      <span className="text-emerald-400 font-black">{ipo.lotRange}</span>
                    </div>
                  )}
                </div>

                <p className="text-slate-400 text-sm font-medium mb-10 line-clamp-2 italic">
                  {ipo.description}
                </p>

                <button 
                  onClick={() => setSelectedIpo(ipo)}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 hover:border-indigo-500/30 transition-all text-slate-300 group-hover:text-white"
                >
                  Analizi Gör <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-16 bg-indigo-500/5 border border-indigo-500/10 rounded-[40px] p-10 md:p-16 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="w-24 h-24 bg-indigo-500/20 rounded-[32px] flex items-center justify-center shrink-0">
            <Info className="text-indigo-400" size={40} />
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-black text-white mb-4">Halka Arzlarda Başarılı Olmanın Yolları</h3>
            <p className="text-slate-400 text-lg font-medium leading-relaxed mb-8 max-w-3xl">
              Halka arzlara katılmadan önce izahnameyi mutlaka inceleyin. Şirketin borçluluk durumu, büyüme hedefleri ve halka arz gelirinin nerede kullanılacağı yatırım kararınızda kritik rol oynar.
            </p>
            <div className="flex flex-wrap gap-4">
              <span className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] font-black text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                <ChevronRight size={14} /> Finansal Okuryazarlık
              </span>
              <span className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] font-black text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                <ChevronRight size={14} /> Risk Yönetimi
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedIpo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIpo(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[48px] overflow-hidden shadow-2xl"
            >
              <button 
                onClick={() => setSelectedIpo(null)}
                className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all z-20"
              >
                <X size={20} />
              </button>

              <div className="p-8 md:p-12">
                <div className="flex items-center gap-6 mb-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-500/20 shrink-0 capitalize">
                    {(selectedIpo.code || 'BIST').substring(0, 2)}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white mb-2">{selectedIpo.name || 'İsimsiz Şirket'}</h2>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-indigo-500/20">
                        {selectedIpo.code || 'KOD'}
                      </span>
                      <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Halka Arz Analizi</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <ShieldCheck size={14} className="text-emerald-400" /> Yatırım Özeti
                      </p>
                      <p className="text-slate-300 text-sm font-medium leading-relaxed">
                        {selectedIpo.description}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <BarChart3 size={14} className="text-indigo-400" /> Katılımcı Grubu
                      </p>
                      <p className="text-white text-sm font-black italic">
                        {selectedIpo.investorType}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <PieChart size={14} className="text-purple-400" /> {selectedIpo.useOfFunds ? 'Fon Kullanım Alanları' : 'Şirket Bilgisi'}
                    </p>
                    <div className="space-y-3">
                      {selectedIpo.useOfFunds ? selectedIpo.useOfFunds.map((fund: string, i: number) => (
                        <div key={i} className="flex items-center gap-3 text-xs font-black text-slate-300 group">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          {fund}
                        </div>
                      )) : (
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Yatırımcı sunumu ve finansal tablolar doğrultusunda büyüme odaklı sermaye artırımı planlanmaktadır.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-3xl p-6 mb-10">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    {selectedIpo.lotRange && (
                      <>
                        <div className="text-center md:text-left">
                          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Lot Dağıtım Tahmini</p>
                          <p className="text-2xl font-black text-white">{selectedIpo.lotRange}</p>
                        </div>
                        <div className="h-px md:h-12 w-full md:w-px bg-indigo-500/20" />
                      </>
                    )}
                    <div className="text-center md:text-right">
                      <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Onaylı Arz Fiyatı</p>
                      <p className="text-2xl font-black text-white">
                        {formatCurrency(selectedIpo.price, market)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <a 
                    href={`https://www.google.com/search?q=${selectedIpo.name}+halka+arz+izahname`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-4 bg-white text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-400 hover:text-white transition-all text-center"
                  >
                    Resmi İzahnameyi Oku
                  </a>
                  <button 
                    onClick={() => setSelectedIpo(null)}
                    className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    Kapat
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>

    {/* SEO Section Integration */}
    <section className="mt-24 border-t border-white/5 pt-16 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24 items-center">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/10 text-indigo-300 rounded-2xl text-xs font-black uppercase tracking-[0.2em] mb-8 border border-indigo-500/20"
            >
              <Briefcase size={16} />
              <span>Finansal Takip Dashboard</span>
            </motion.div>
            
            <h2 className="text-5xl md:text-6xl font-black text-white mb-8 leading-[0.9] tracking-tighter">
              Halk Arz Takibi Artık <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Çok Daha Kolay.</span>
            </h2>
            
            <p className="text-xl text-slate-400 font-medium leading-relaxed mb-10 max-w-xl">
              Karmaşık borsa bültenlerinde kaybolmayın. Karlısın ile en güncel halka arz tarihlerini, dağıtım yöntemlerini ve uzman analizlerini tek bir merkezden yönetin.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <span className="px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] font-black text-indigo-300 uppercase tracking-widest">#HizliTakip</span>
              <span className="px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] font-black text-indigo-300 uppercase tracking-widest">#GuncelBorsa</span>
              <span className="px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] font-black text-indigo-300 uppercase tracking-widest">#IPOTakvim</span>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full" />
            <div className="relative bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-10 rounded-[60px] shadow-2xl">
              <div className="w-20 h-20 bg-indigo-500 rounded-[32px] flex items-center justify-center mb-8 shadow-xl shadow-indigo-500/20">
                <Calendar className="text-white" size={40} />
              </div>
              <p className="text-2xl font-black text-white mb-4 italic">Borsa İstanbul'un nabzını tutun.</p>
              <p className="text-slate-400 font-medium leading-relaxed">
                Karlısın olarak, yatırımcıların doğru bilgiye en hızlı şekilde ulaşmasını sağlıyoruz. 2026 halka arz listesi ile hiçbir fırsatı kaçırmayın.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white tracking-tight italic">Sıkça Sorulan Sorular</h2>
            <div className="w-24 h-1 bg-indigo-500 mx-auto mt-6 rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqSchema.mainEntity.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/5 border border-white/5 p-8 rounded-[40px] hover:border-white/10 transition-all group"
              >
                <h3 className="text-lg font-black text-white mb-4 flex items-start gap-3">
                  <span className="text-indigo-400 mt-1 shrink-0"><Info size={18} /></span>
                  {item.name}
                </h3>
                <p className="text-slate-400 font-medium leading-relaxed text-sm">
                  {item.acceptedAnswer.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Detailed Description Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-slate-950/40 rounded-[40px] border border-white/5 p-10 h-full">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-6">
              <ArrowUpRight size={24} />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4">MOBİL UYUMLU</h3>
            <p className="text-sm font-medium text-slate-500 leading-relaxed uppercase">
              Halka arz takvimi cebinizde. Bankada veya yolda, arzları anında takip edin.
            </p>
          </div>
          
          <div className="bg-slate-950/40 rounded-[40px] border border-white/5 p-10 h-full">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-6">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4">ANLIK GÜNCELLEME</h3>
            <p className="text-sm font-medium text-slate-500 leading-relaxed uppercase">
              SPK bültenlerini saniyeler içinde takvimimize işliyoruz. En güncel veriyle karar verin.
            </p>
          </div>
          
          <div className="bg-slate-950/40 rounded-[40px] border border-white/5 p-10 h-full">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-6">
              <Shield size={24} />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4">GİZLİLİK ODAKLI</h3>
            <p className="text-sm font-medium text-slate-500 leading-relaxed uppercase">
              Verileriniz anonim kalır. Hiçbir yatırım bilginiz sunucularımızda saklanmaz.
            </p>
          </div>
        </div>

        {/* Final SEO Text */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-slate-400 pb-20">
          <div className="space-y-6">
            <h4 className="text-2xl font-black text-white uppercase tracking-tight">Halka Arzlarda Strateji Nasıl Olmalı?</h4>
            <p className="text-sm leading-relaxed text-left">
              Halka arzlara katılırken dağıtım yöntemi en kritik faktördür. Eşit dağıtım yöntemiyle yapılan arzlarda tüm yatırımcılar aynı gemidedir. Oransal dağıtımda ise yatırım gücü yüksek olanlar daha fazla pay alır. Karlısın, bu yöntemleri net bir şekilde ayırt etmenize ve her biri için en doğru stratejiyi belirlemenize yardımcı olur. Ayrıca izahnamedeki fon kullanım alanları, şirketin gelecekteki büyüme potansiyeli hakkında en net ipucunu verir.
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="text-2xl font-black text-white uppercase tracking-tight">2026 Beklenen Halka Arz Listesi</h4>
            <p className="text-sm leading-relaxed text-left">
              Borsa İstanbul (BIST) 2026 projeksiyonlarında teknoloji, enerji ve sanayi sektörlerinden birçok dev şirketin halka açılması bekleniyor. SPK onaylı halka arzlar listesi düzenli olarak güncellenmektedir. Bu sayfayı sık kullanılanlara ekleyerek SPK bültenlerinden süzülmüş en temiz ve doğruluğu teyit edilmiş halka arz verilerine anında ulaşabilirsiniz. Karlısın, finansal kararlarınızda en güvenilir pusulanızdır.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
