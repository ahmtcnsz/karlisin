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
  Briefcase,
  Loader2,
  Zap
} from 'lucide-react';
import { useSeo } from './Sitemap';

interface IPO {
  id: number | string;
  name: string;
  code: string;
  price: number | string;
  date: string;
  method: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  description: string;
  lotRange: string;
  useOfFunds: string[];
  investorType: string;
}

const ipoData: IPO[] = [];

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

// Sub-components for cleaner structure
const IpoCard = ({ ipo, index, market, onSelect, formatCurrency, compact = false }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: Math.min(index * 0.02, 0.8) }}
    className={`group relative bg-slate-900/40 border border-white/5 rounded-[32px] overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 ${compact ? 'p-5' : 'p-8'}`}
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
    
    <div className={`flex items-center gap-4 ${compact ? 'mb-4' : 'mb-8'}`}>
      <div className={`${compact ? 'w-10 h-10 text-sm' : 'w-14 h-14 text-lg'} bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400 font-black border border-white/10 group-hover:bg-indigo-500 group-hover:text-white group-hover:border-transparent transition-all duration-300 shrink-0 capitalize`}>
        {(ipo.code || 'BIST').substring(0, 2)}
      </div>
      <div className="overflow-hidden">
        <h2 className={`${compact ? 'text-sm' : 'text-lg'} font-black text-white truncate uppercase mb-1 leading-tight`}>{ipo.name || 'İsimsiz'}</h2>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-indigo-400 tracking-widest">{ipo.code || 'KOD'}</span>
          {!compact && (
            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${
              ipo.status === 'ongoing' ? 'bg-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.3)]' :
              ipo.status === 'upcoming' ? 'bg-amber-500 text-slate-950 text-[7px] shadow-[0_0_10px_rgba(245,158,11,0.3)]' :
              'bg-white/10 text-slate-400'
            }`}>
              {ipo.status === 'ongoing' ? 'TALEP TOPLIYOR' : ipo.status === 'upcoming' ? 'BEKLENİYOR' : 'İŞLEM GÖRÜYOR'}
            </span>
          )}
        </div>
      </div>
    </div>

    {!compact ? (
      <>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-950/40 border border-white/5 rounded-[24px] p-4 flex flex-col items-center justify-center text-center">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Arz Fiyatı</p>
            <p className="text-base font-black text-white">
              {formatCurrency(ipo.price, market)}
            </p>
          </div>
          <div className="bg-slate-950/40 border border-white/5 rounded-[24px] p-4 flex flex-col items-center justify-center text-center">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Talep Tarihi</p>
            <p className="text-[11px] font-bold text-white line-clamp-1">{ipo.date || 'Belirsiz'}</p>
          </div>
        </div>

        <div className="space-y-3.5 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-500">
              <Building2 size={14} className="opacity-60" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{market === 'BIST' ? 'YÖNTEM' : 'Borsa'}</span>
            </div>
            <span className="text-[10px] font-black text-white uppercase">{market === 'BIST' ? ipo.method : ipo.market}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-500">
              <Users size={14} className="opacity-60" />
              <span className="text-[10px] font-bold uppercase tracking-wider">TAHMİNİ LOT</span>
            </div>
            <span className="text-[10px] font-black text-emerald-400">{ipo.lotRange || 'Belli Değil'}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-500">
              <TrendingUp size={14} className="opacity-60" />
              <span className="text-[10px] font-bold uppercase tracking-wider">PAZAR</span>
            </div>
            <span className="text-[11px] font-black text-indigo-300 uppercase truncate max-w-[100px] text-right">{ipo.market || 'Yıldız'}</span>
          </div>
        </div>
      </>
    ) : (
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-bold text-slate-500 uppercase">Durum:</span>
        <span className="text-[10px] font-black text-amber-500 uppercase">Bekleniyor</span>
      </div>
    )}

    <button 
      onClick={() => onSelect(ipo)}
      className={`w-full ${compact ? 'h-10' : 'h-12'} flex items-center justify-center gap-3 bg-white/[0.03] border border-white/5 rounded-2xl group/btn hover:bg-white/10 hover:border-white/20 transition-all duration-300`}
    >
      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover/btn:text-white transition-colors">Analizi Göster</span>
      <ChevronRight size={14} className="text-slate-600 group-hover/btn:translate-x-1 group-hover/btn:text-indigo-400 transition-all" />
    </button>
  </motion.div>
);

const SyncModal = ({ isVisible }: { isVisible: boolean }) => (
  <AnimatePresence>
    {isVisible && (
      <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-slate-900 border border-indigo-500/20 rounded-[48px] overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.2)]"
        >
          {/* Animated background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-indigo-500/20 blur-[80px] -mt-16 rounded-full" />
          
          <div className="p-10 text-center relative z-10">
            <div className="relative mb-10 inline-block">
              <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[32px] flex items-center justify-center shadow-2xl shadow-indigo-500/40">
                <Loader2 className="text-white animate-spin" size={40} />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center shadow-lg">
                <Zap className="text-amber-400 fill-amber-400" size={20} />
              </div>
            </div>

            <div className="space-y-4 mb-10">
              <div className="flex items-center justify-center gap-3">
                <span className="px-3 py-1 bg-indigo-500 text-white text-[10px] font-black rounded-lg uppercase tracking-widest shadow-lg shadow-indigo-500/20">UNIFIED ENGINE v3.1</span>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Senkronize Ediliyor</span>
              </div>
              
              <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
                Veriler <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Doğrulanıyor</span>
              </h2>
              
              <p className="text-slate-400 text-base font-medium leading-relaxed max-w-sm mx-auto">
                Borsa İstanbul, SPK ve KAP verileri eş zamanlı olarak taranıyor. Karlısın sistemi için en güncel arz verileri hazırlanıyor.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 border border-white/5 rounded-3xl group">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-3 mx-auto group-hover:bg-indigo-500 shadow-inner group-hover:shadow-indigo-500/50 transition-all">
                  <ShieldCheck className="text-indigo-400 group-hover:text-white" size={16} />
                </div>
                <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1 group-hover:text-indigo-400 transition-colors">SPK Kaynaklı</p>
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                  />
                </div>
              </div>
              <div className="p-4 bg-white/5 border border-white/5 rounded-3xl group">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3 mx-auto group-hover:bg-purple-500 shadow-inner group-hover:shadow-purple-500/50 transition-all">
                  <BarChart3 className="text-purple-400 group-hover:text-white" size={16} />
                </div>
                <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1 group-hover:text-purple-400 transition-colors">BİST Entegre</p>
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                  />
                </div>
              </div>
            </div>

            <div className="mt-10 flex items-center justify-center gap-3">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 sm:h-2 sm:w-2"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 sm:h-2 sm:w-2"></span>
              </div>
              <span className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.2em] animate-pulse">Sistem Çalışıyor, Lütfen Bekleyin...</span>
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const EmptyState = () => (
  <div className="col-span-full py-20 text-center">
    <div className="inline-flex p-6 bg-white/5 rounded-full mb-6">
      <Info size={32} className="text-slate-500" />
    </div>
    <p className="text-slate-400 font-black uppercase tracking-widest text-sm">
      Seçili kriterlere uygun halka arz bulunamadı.
    </p>
  </div>
);

export default function HalkaArzTakvimi() {
  useSeo('Halka Arz Takvimi', 'Borsa İstanbul ve NASDAQ güncel halka arz takvimi, talep toplama tarihleri ve halka arz sonuçları.');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all');
  const [market, setMarket] = useState<'BIST' | 'NASDAQ'>('BIST');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIpo, setSelectedIpo] = useState<any | null>(null);
  const [bistData, setBistData] = useState<IPO[]>(ipoData);
  const [nasdaqData, setNasdaqData] = useState<any[]>(nasdaqIpoData);
  const [loading, setLoading] = useState(true);
  const [isBackgroundUpdating, setIsBackgroundUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toLocaleTimeString('tr-TR'));

  const fetchLiveIPOs = async (isRefresh = false) => {
    const minLoadingTime = new Promise(resolve => setTimeout(resolve, 2500));
    try {
      const hasData = (bistData && bistData.length > 0) || (nasdaqData && nasdaqData.length > 0);
      
      // Always show loading if it's a refresh OR if we don't have data yet
      // On initial mount, loading is already true
      if (isRefresh) {
        setLoading(true);
      } else if (!hasData) {
        setLoading(true);
      } else {
        setIsBackgroundUpdating(true);
      }
      
      const url = isRefresh ? '/api/ipo-data?refresh=true' : '/api/ipo-data';
      
      // Request timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minutes UI timeout

      const fetchPromise = fetch(url, { signal: controller.signal });
      
      // Wait for both the fetch AND the minimum 2 seconds delay
      const [res] = await Promise.all([fetchPromise, minLoadingTime]);
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        throw new Error(`Sunucu meşgul veya hata verdi (${res.status}). Lütfen daha sonra tekrar deneyiniz.`);
      }
      
      const data = await res.json();
      
      if (!data) return;

      // Veri koruma: Sadece dolu dizi gelirse güncelle ve eksik alanları (fiyat, lot, yöntem) koru
      if (data.bist && Array.isArray(data.bist) && data.bist.length > 0) {
        setBistData(prevBist => {
          if (prevBist.length === 0) return data.bist;
          
          const merged = [...prevBist];
          
          data.bist.forEach((newItem: any) => {
            const index = merged.findIndex(o => o.code === newItem.code);
            
            let cleanPrice = newItem.price;
            if (typeof newItem.price === 'string') {
              const parsed = parseFloat(newItem.price.replace(/[^\d.,]/g, '').replace(',', '.'));
              if (!isNaN(parsed)) cleanPrice = parsed;
            }

            if (index !== -1) {
              const oldItem = merged[index];
              const isOldPriceValid = oldItem.price && oldItem.price !== 'Belli Değil' && oldItem.price !== '---' && oldItem.price !== '—';
              const isNewPriceValid = cleanPrice && cleanPrice !== 'Belli Değil' && cleanPrice !== '---' && cleanPrice !== '—';

              merged[index] = {
                ...newItem,
                price: !isNewPriceValid && isOldPriceValid ? oldItem.price : cleanPrice,
                method: (!newItem.method || newItem.method === 'Belli Değil' || newItem.method === '—') ? (oldItem.method || newItem.method) : newItem.method,
                lotRange: (!newItem.lotRange || newItem.lotRange === 'Belli Değil') ? (oldItem.lotRange || newItem.lotRange) : newItem.lotRange,
                description: (!newItem.description || newItem.description.length < 10) ? (oldItem.description || newItem.description) : newItem.description,
                useOfFunds: newItem.useOfFunds && newItem.useOfFunds.length > 0 ? newItem.useOfFunds : (oldItem.useOfFunds || []),
                investorType: newItem.investorType || oldItem.investorType
              };
            } else {
              merged.push({ ...newItem, price: cleanPrice });
            }
          });
          
          // Benzersizliği koru (Map ile)
          const uniqueMap = new Map();
          merged.forEach(item => uniqueMap.set(item.code, item));
          return Array.from(uniqueMap.values());
        });
      }
      
      if (data.nasdaq && Array.isArray(data.nasdaq) && data.nasdaq.length > 0) {
        setNasdaqData(data.nasdaq);
      }
      
      if (data.lastUpdate) {
        const updateDate = new Date(data.lastUpdate);
        setLastUpdate(updateDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) + ' (' + updateDate.toLocaleDateString('tr-TR') + ')');
      }
      
      setError(null);
    } catch (err: any) {
      console.error("[Karlısın-IPO] Senkronizasyon hatası:", err);
      
      const hasData = (bistData && bistData.length > 0) || (nasdaqData && nasdaqData.length > 0);
      if (isRefresh || !hasData) {
        const msg = err.name === 'AbortError' 
          ? "Zaman aşımı: Veri kaynağı yavaş yanıt veriyor. Lütfen tekrar deneyin." 
          : "Veriler güncellenemedi. İnternet bağlantınızı veya sunucu durumunu kontrol edin.";
        setError(msg);
      }
    } finally {
      setLoading(false);
      setIsBackgroundUpdating(false);
    }
  };

  useEffect(() => {
    fetchLiveIPOs();
  }, []);

  const displayData = (market === 'BIST' ? bistData : nasdaqData) || [];
  const validData = Array.isArray(displayData) ? displayData : [];
  
  const filteredIpos = validData.filter((ipo: any) => {
    if (!ipo) return false;
    const matchesFilter = filter === 'all' || ipo.status === filter;
    const matchesSearch = searchTerm === '' || 
      ipo.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      ipo.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  }).sort((a, b) => {
    // Status priority: ongoing (0) > upcoming (1) > completed (2)
    const statusPriority = { ongoing: 0, upcoming: 1, completed: 2 };
    const priorityA = statusPriority[a.status as keyof typeof statusPriority] ?? 3;
    const priorityB = statusPriority[b.status as keyof typeof statusPriority] ?? 3;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // Within same status, try to sort by date (descending for completed, ascending for upcoming/ongoing?)
    // User asked "Recent to past", which generally means Descending Date globally.
    // Let's try to parse dates like "15-16-17 Mayıs 2026" or "Haziran 2026"
    
    const getSortableDate = (dateStr: string) => {
      if (!dateStr) return 0;
      const lowerDate = dateStr.toLowerCase();
      
      // Extract year
      const yearMatch = lowerDate.match(/\d{4}/);
      const year = yearMatch ? parseInt(yearMatch[0]) : 2026;

      // Extract month
      const months = ["ocak", "şubat", "mart", "nisan", "mayıs", "haziran", "temmuz", "ağustos", "eylül", "ekim", "kasım", "aralık"];
      let monthIndex = -1;
      months.forEach((m, idx) => {
        if (lowerDate.includes(m)) monthIndex = idx;
      });
      if (monthIndex === -1) monthIndex = 0;

      // Extract day (last day of range if range)
      const dayMatches = lowerDate.match(/\d+/g);
      let day = 1;
      if (dayMatches && dayMatches.length > 0) {
        // Find the last number that isn't the year
        const candidates = dayMatches.filter(d => d.length <= 2).map(d => parseInt(d));
        if (candidates.length > 0) {
          day = Math.max(...candidates);
        }
      }

      return year * 10000 + (monthIndex + 1) * 100 + day;
    };

    const dateA = getSortableDate(a.date);
    const dateB = getSortableDate(b.date);

    return dateB - dateA; // Descending (Newest first)
  });
  
  const finalItems = filteredIpos;
  
  // Categorization for "All" view with specific business labels
  const categorized = {
    ongoing: filteredIpos.filter(item => item.status === 'ongoing'),
    upcoming: filteredIpos.filter(item => item.status === 'upcoming' && !item.date.toLowerCase().includes('bekleniyor') && !item.date.toLowerCase().includes('taslak')),
    draft: filteredIpos.filter(item => item.status === 'upcoming' && (item.date.toLowerCase().includes('bekleniyor') || item.date.toLowerCase().includes('taslak'))),
    completed: filteredIpos.filter(item => item.status === 'completed'),
  };

  const activeCount = validData.filter((ipo: any) => ipo && ipo.status === 'ongoing').length;
  const upcomingIpo = validData.find((ipo: any) => ipo && ipo.status === 'upcoming');
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
    if (!val || val === 'Belli Değil' || val === '---' || val === '—') return val || '—';
    
    let numericValue = val;
    
    if (typeof val === 'string') {
      const cleaned = val.replace(/[^\d.,]/g, '').replace(',', '.');
      const parsed = parseFloat(cleaned);
      if (!isNaN(parsed)) {
        numericValue = parsed;
      } else {
        return val || '—';
      }
    }
    
    if (typeof numericValue !== 'number' || isNaN(numericValue)) return val || '—';
    
    try {
      return numericValue.toLocaleString(m === 'BIST' ? 'tr-TR' : 'en-US', { 
        style: 'currency', 
        currency: m === 'BIST' ? 'TRY' : 'USD' 
      });
    } catch (e) {
      return val || '—';
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
      
      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen relative">
      {/* Synchronizing Data Modal */}
      <SyncModal isVisible={loading} />

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-10 mb-16 px-6">
        <div className="lg:max-w-xl shrink-0">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            onClick={() => fetchLiveIPOs(true)}
            className="inline-flex items-center gap-4 px-4 py-1.5 bg-indigo-500/10 text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-indigo-500/20 cursor-pointer hover:bg-indigo-500/20 transition-all group"
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isBackgroundUpdating ? 'bg-amber-400' : 'bg-emerald-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isBackgroundUpdating ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
              </span>
              <span>
                {isBackgroundUpdating ? 'GÜNCELLENİYOR...' : 'SİSTEM ÇALIŞIYOR'}
              </span>
            </div>
            <div className="w-px h-3 bg-white/20 mx-1" />
            <div className="flex items-center gap-1.5">
              <Calendar size={12} className="opacity-60" /> {lastUpdate}
            </div>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-[0.9]"
          >
            Halka Arz <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Takvimi</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg mt-6 font-medium leading-relaxed"
          >
            Borsa İstanbul ve NASDAQ onaylı en güncel arz verileri. 3 farklı kaynaktan doğrulanmış profesyonel takip platformu.
          </motion.p>
        </div>

        {/* Data Verification Panel (Position B) - Filling the gap */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:flex-1 h-full min-h-[160px] p-6 rounded-[32px] bg-slate-900/40 border border-white/5 relative overflow-hidden backdrop-blur-sm shadow-2xl flex flex-col justify-center"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50" />
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-5">
              <div className="shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-inner">
                <ShieldCheck className="text-indigo-400" size={28} />
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="px-2 py-0.5 bg-indigo-500 text-white text-[9px] font-black rounded-sm shadow-lg shadow-indigo-500/20">UNIFIED DATA ENGINE v3.1</span>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">Veri Doğrulama</h3>
                </div>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                  Verilerimiz **SPK Haftalık Bültenleri**, **KAP (Kamuyu Aydınlatma Platformu)** bildirimleri ve kurumsal veri terminallerinden eş zamanlı olarak çapraz sorgulanarak çekilmektedir.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">SPK BÜLTENİ</span>
              </div>
              <div className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">KAP RESMİ</span>
              </div>
              <div className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">BİST VERİ</span>
              </div>
              <div className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">BANKA API</span>
              </div>
            </div>
          </div>
        </motion.div>
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

      {/* Moved Search & Market & Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-12 bg-slate-900/40 p-4 rounded-[32px] border border-white/5">
        <div className="relative group w-full lg:w-96">
          <input 
            type="text" 
            placeholder="Şirket veya Kod Ara..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-3.5 px-12 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors">
            <Info size={18} />
          </div>
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap lg:flex-nowrap gap-4 w-full lg:w-auto">
          <div className="flex bg-slate-950/50 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl w-full lg:w-auto">
            {(['BIST', 'NASDAQ'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMarket(m)}
                className={`flex-1 lg:flex-none px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  market === m 
                    ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="flex bg-slate-950/50 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl shrink-0 overflow-x-auto w-full lg:w-auto">
            {(['all', 'ongoing', 'upcoming', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 lg:flex-none px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  filter === f 
                    ? 'bg-slate-700 text-white border border-white/10' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {f === 'all' ? 'Tümü' : f === 'ongoing' ? 'Devam Eden' : f === 'upcoming' ? 'Beklenen' : 'Tamamlanan'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table/Grid */}
      {error && !loading && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 p-6 bg-red-500/10 border border-red-500/20 rounded-[32px] flex items-center gap-4 text-red-400"
        >
          <div className="p-2 bg-red-500/20 rounded-xl">
            <Info size={20} />
          </div>
          <div className="flex-grow">
            <p className="text-sm font-bold">{error}</p>
          </div>
          <button 
            onClick={() => fetchLiveIPOs(true)}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Tekrar Dene
          </button>
        </motion.div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-white/5 rounded-[40px] border border-white/10" />
          ))}
        </div>
      ) : (
        <div className="space-y-20">
          {filter === 'all' ? (
            <>
              {/* Ongoing Section */}
              {categorized.ongoing.length > 0 && (
                <section>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-10 w-1.5 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                    <div>
                      <h2 className="text-2xl font-black text-white uppercase tracking-tight">TALEP TOPLAYANLAR</h2>
                      <p className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase">AKTİF HALKA ARZLAR ({categorized.ongoing.length})</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categorized.ongoing.map((ipo, index) => (
                      <IpoCard key={`ongoing-${ipo.code || index}-${index}`} ipo={ipo} index={index} market={market} onSelect={setSelectedIpo} formatCurrency={formatCurrency} />
                    ))}
                  </div>
                </section>
              )}

              {/* Verified Upcoming Section */}
              {categorized.upcoming.length > 0 && (
                <section>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-10 w-1.5 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                    <div>
                      <h2 className="text-2xl font-black text-white uppercase tracking-tight">ONAYLI HALKA ARZLAR</h2>
                      <p className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase">TARİHİ NETLEŞEN BEKLEYENLER ({categorized.upcoming.length})</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categorized.upcoming.map((ipo, index) => (
                      <IpoCard key={`upcoming-${ipo.code || index}-${index}`} ipo={ipo} index={index} market={market} onSelect={setSelectedIpo} formatCurrency={formatCurrency} />
                    ))}
                  </div>
                </section>
              )}

              {/* Draft Section */}
              {categorized.draft.length > 0 && (
                <section>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-10 w-1.5 bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                    <div>
                      <h2 className="text-2xl font-black text-white uppercase tracking-tight">TASLAK VE BEKLEYENLER</h2>
                      <p className="text-[10px] text-amber-500 font-bold tracking-widest uppercase">İZAHNAME AŞAMASINDAKİ ŞİRKETLER ({categorized.draft.length})</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {categorized.draft.map((ipo, index) => (
                      <IpoCard key={`draft-${ipo.code || index}-${index}`} ipo={ipo} index={index} market={market} onSelect={setSelectedIpo} formatCurrency={formatCurrency} compact={true} />
                    ))}
                  </div>
                </section>
              )}

              {/* Completed Section */}
              {categorized.completed.length > 0 && (
                <section>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-10 w-1.5 bg-slate-700 rounded-full" />
                    <div>
                      <h2 className="text-2xl font-black text-white uppercase tracking-tight">İŞLEME BAŞLAYANLAR</h2>
                      <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">BORSADA İŞLEM GÖREN GEÇMİŞ ARZLAR ({categorized.completed.length})</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60 hover:opacity-100 transition-opacity">
                    {categorized.completed.map((ipo, index) => (
                      <IpoCard key={`completed-${ipo.code || index}-${index}`} ipo={ipo} index={index} market={market} onSelect={setSelectedIpo} formatCurrency={formatCurrency} />
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {finalItems.length > 0 ? (
                finalItems.map((ipo, index) => (
                  <IpoCard key={`${ipo.status}-${ipo.code || index}-${index}`} ipo={ipo} index={index} market={market} onSelect={setSelectedIpo} formatCurrency={formatCurrency} />
                ))
              ) : (
                <EmptyState />
              )}
            </div>
          )}
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
