import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3, 
  Globe, 
  Zap, 
  ShieldCheck, 
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Gem,
  Building2,
  Calendar,
  Wallet,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useSeo } from './Sitemap';

interface StockData {
  symbol: string;
  summary: {
    price: {
      regularMarketPrice: number;
      longName: string;
      currency: string;
      regularMarketChangePercent: number;
      dayHigh: number;
      dayLow: number;
      volume: number;
    };
    summaryDetail: {
      dividendYield: number;
      marketCap: number;
      trailingPE: number;
      fiftyTwoWeekHigh: number;
      fiftyTwoWeekLow: number;
      sector: string;
      industry: string;
    };
    assetProfile: {
      longBusinessSummary: string;
    };
    financialData: {
      targetMeanPrice: number;
    };
  };
  verification: {
    last_sync: string;
    sources_count: number;
    yapikredi_verified?: boolean;
  };
}

export const HisseAnaliz = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useSeo('Hisse Analizi', 'Yapı Kredi ve global veri kaynakları ile Borsa İstanbul hisselerini derinlemesine analiz edin.');

  const fetchStockData = async (symbol: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/stock/${symbol}`);
      if (!res.ok) throw new Error('Hisse verisi alınamadı');
      const data = await res.json();
      setStockData(data);
      setSuggestions([]);
      setSearchQuery('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchStockData(searchQuery.toUpperCase());
    }
  };

  const fetchSuggestions = async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`/api/search?q=${q}`);
      const data = await res.json();
      setSuggestions(data.filter((s: any) => s.symbol.includes('.IS')).slice(0, 5));
    } catch (e) {}
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) fetchSuggestions(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const StatCard = ({ icon: Icon, title, value, subValue, color }: any) => (
    <div className="bg-slate-900/40 border border-white/5 p-6 rounded-[32px] group hover:border-white/10 transition-all">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 border", color)}>
        <Icon size={20} />
      </div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{title}</p>
      <h4 className="text-xl font-black text-white italic tracking-tight">{value}</h4>
      {subValue && <p className="text-[10px] text-slate-400 font-medium mt-1">{subValue}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pt-32 pb-20 px-6">
      <Helmet>
        <title>Hisse Analizi & Piyasa Verileri | Karlısın</title>
      </Helmet>

      <div className="max-w-7xl mx-auto">
        {/* Header & Search */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10 mb-16">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6"
            >
              <Globe size={12} />
              PİYASA ANALİZ MOTORU
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-7xl font-black text-white tracking-tighter italic uppercase leading-none"
            >
              HİSSE <span className="text-indigo-500">RADARI.</span>
            </motion.h1>
          </div>

          <div className="w-full lg:max-w-md relative">
            <form onSubmit={handleSearch} className="relative group">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Hisse kodu ara... (örn: THYAO)"
                className="w-full bg-slate-900/50 border border-white/10 rounded-[24px] py-5 px-8 outline-none focus:border-indigo-500/50 focus:bg-slate-900/80 transition-all text-white font-bold group-hover:border-white/20"
              />
              <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 rounded-2xl text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20">
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
              </button>
            </form>

            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl z-50 p-2"
                >
                  {suggestions.map((s) => (
                    <button
                      key={s.symbol}
                      onClick={() => fetchStockData(s.symbol)}
                      className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 rounded-2xl transition-all text-left group"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-white italic tracking-tight">{s.symbol.replace('.IS', '')}</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">{s.shortname}</span>
                      </div>
                      <ArrowUpRight size={16} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 bg-red-500/10 border border-red-500/20 rounded-[32px] text-red-400 text-center font-bold mb-10"
          >
            {error}
          </motion.div>
        )}

        {stockData ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            {/* Top Stats Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-purple-700 p-10 rounded-[48px] relative overflow-hidden shadow-2xl shadow-indigo-500/20 group">
                <Activity className="absolute top-10 right-10 text-white/10 w-40 h-40 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-[24px] bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl font-black">
                      {stockData.symbol.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">{stockData.summary.price.longName}</h2>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 bg-white/20 rounded-md text-[10px] font-black text-white tracking-widest">{stockData.symbol}</span>
                        <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{stockData.summary.summaryDetail.sector}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-end gap-6">
                    <div>
                      <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] block mb-1">ANLIK FİYAT (TRY)</span>
                      <div className="text-6xl font-black text-white italic tracking-tighter tabular-nums">
                        {stockData.summary.price.regularMarketPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className={cn(
                      "flex items-center gap-1 px-4 py-2 rounded-2xl mb-2 backdrop-blur-md font-black italic tracking-tighter",
                      stockData.summary.price.regularMarketChangePercent >= 0 ? "bg-emerald-400/20 text-emerald-300" : "bg-red-400/20 text-red-300"
                    )}>
                      {stockData.summary.price.regularMarketChangePercent >= 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                      %{Math.abs(stockData.summary.price.regularMarketChangePercent).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <StatCard 
                  icon={Target}
                  title="Target Mean Price"
                  value={stockData.summary.financialData.targetMeanPrice > 0 ? stockData.summary.financialData.targetMeanPrice.toLocaleString('tr-TR') : 'N/A'}
                  subValue="Analistlerin Ortalama Tahmini"
                  color="text-amber-400 bg-amber-400/10 border-amber-400/20"
                />
                <StatCard 
                  icon={ShieldCheck}
                  title="Dividend Yield"
                  value={stockData.summary.summaryDetail.dividendYield > 0 ? `%${(stockData.summary.summaryDetail.dividendYield * 100).toFixed(2)}` : 'Veri Yok'}
                  subValue="Son 12 Ay Verimi"
                  color="text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                />
              </div>

              <div className="grid grid-cols-1 gap-6">
                <StatCard 
                  icon={BarChart3}
                  title="Market Cap"
                  value={`${(stockData.summary.summaryDetail.marketCap / 1000000000).toFixed(2)}B`}
                  subValue="Tüm Payların Piyasa Değeri"
                  color="text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
                />
                <StatCard 
                  icon={Activity}
                  title="P/E Ratio (F/K)"
                  value={stockData.summary.summaryDetail.trailingPE > 0 ? stockData.summary.summaryDetail.trailingPE.toFixed(2) : 'N/A'}
                  subValue="Fiyat / Kazanç Oranı"
                  color="text-purple-400 bg-purple-500/10 border-purple-500/20"
                />
              </div>
            </div>

            {/* Detailed Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-10">
                <div className="bg-slate-900/40 border border-white/5 p-10 rounded-[48px]">
                  <h3 className="flex items-center gap-3 text-2xl font-black text-white italic tracking-tighter uppercase mb-8">
                    <Info className="text-indigo-400" />
                    Şirket Profili
                  </h3>
                  <p className="text-slate-400 font-medium leading-relaxed text-lg">
                    {stockData.summary.assetProfile.longBusinessSummary || 'Şirket özeti henüz eklenmemiş.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[40px]">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">52 Haftalık Performans</h4>
                      <div className="space-y-6">
                        <div className="flex justify-between items-end">
                           <span className="text-xs font-bold text-slate-400 uppercase">En Düşük</span>
                           <span className="text-xl font-black text-white tabular-nums">{stockData.summary.summaryDetail.fiftyTwoWeekLow.toLocaleString('tr-TR')}</span>
                        </div>
                        <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                           <div 
                             className="absolute h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                             style={{ 
                               left: '0%', 
                               width: `${((stockData.summary.price.regularMarketPrice - stockData.summary.summaryDetail.fiftyTwoWeekLow) / (stockData.summary.summaryDetail.fiftyTwoWeekHigh - stockData.summary.summaryDetail.fiftyTwoWeekLow) * 100)}%` 
                             }}
                            />
                        </div>
                        <div className="flex justify-between items-start">
                           <span className="text-xs font-bold text-slate-400 uppercase">En Yüksek</span>
                           <span className="text-xl font-black text-white tabular-nums">{stockData.summary.summaryDetail.fiftyTwoWeekHigh.toLocaleString('tr-TR')}</span>
                        </div>
                      </div>
                   </div>

                   <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[40px]">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Günlük Veriler</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="text-[10px] font-black text-slate-500 uppercase">Gün Yüksek</span>
                          <span className="text-sm font-black text-white">{stockData.summary.price.dayHigh.toLocaleString('tr-TR')}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="text-[10px] font-black text-slate-500 uppercase">Gün Düşük</span>
                          <span className="text-sm font-black text-white">{stockData.summary.price.dayLow.toLocaleString('tr-TR')}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-[10px] font-black text-slate-500 uppercase">İşlem Hacmi</span>
                          <span className="text-sm font-black text-white">{(stockData.summary.price.volume / 1000000).toFixed(2)}M</span>
                        </div>
                      </div>
                   </div>
                </div>
              </div>

              <aside className="space-y-6">
                <div className="bg-indigo-600 p-8 rounded-[40px] text-white overflow-hidden relative group">
                  <Zap className="absolute -bottom-6 -right-6 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform" />
                  <h4 className="text-xl font-black italic tracking-tighter uppercase mb-4 relative z-10">Smart Analysis</h4>
                  <p className="text-sm text-indigo-100 font-medium mb-6 relative z-10">Gemini AI modelimiz bu hisse için temel rasyoları analiz ediyor.</p>
                  <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-50 transition-all relative z-10">
                    ANALİZ OLUŞTUR
                  </button>
                </div>

                <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[40px]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      stockData.verification.yapikredi_verified ? "bg-indigo-500/20 text-indigo-400" : "bg-emerald-500/20 text-emerald-400"
                    )}>
                      {stockData.verification.yapikredi_verified ? <Gem size={16} /> : <ShieldCheck size={16} />}
                    </div>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">
                      {stockData.verification.yapikredi_verified ? 'YAPI KREDİ ENTEGRE' : 'VERİ DOĞRULAMA'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed">
                      {stockData.verification.yapikredi_verified 
                        ? 'Bu veriler Yapı Kredi API Portal üzerinden alınan resmi Borsa İstanbul verileridir. Ek kaynaklarla (Google, Yahoo) çapraz doğrulanmıştır.'
                        : `Bu veriler Yapı Kredi API Portal ve global veri sağlayıcılarından eş zamanlı olarak alınan ${stockData.verification.sources_count} farklı kaynağın konsolidasyonu ile oluşturulmuştur.`
                      }
                    </p>
                    <div className="text-[9px] text-indigo-400 font-black uppercase tracking-widest pt-2">
                      SON GÜNCELLEME: {stockData.verification.last_sync}
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </motion.div>
        ) : !loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-32 text-center"
          >
            <div className="inline-flex p-10 bg-slate-900/40 border border-white/5 rounded-[60px] mb-8">
              <Search className="text-slate-700" size={80} />
            </div>
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-4">Bir Hisse Kodu Girin</h2>
            <p className="text-slate-500 font-medium max-w-md mx-auto">
              Borsa İstanbul verilerini anlık olarak takip etmek ve Yapı Kredi altyapısıyla analiz etmek için bir sembol arayın.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
