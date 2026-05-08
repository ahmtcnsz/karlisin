import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import TahminMotoru from './TahminMotoru';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  Search, 
  TrendingUp, 
  Calendar, 
  History as HistoryIcon, 
  Info, 
  ArrowUpRight, 
  DollarSign, 
  Percent, 
  Briefcase,
  Target,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Zap,
  Loader2,
  AlertCircle,
  AlertTriangle,
  LayoutGrid,
  Activity,
  Maximize2,
  Minimize2,
  ShieldCheck,
  RefreshCw,
  MousePointer2,
  ChevronDown,
  Clock,
  ArrowDownRight,
  PieChart,
  Calculator,
  Lightbulb,
  Layers
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

// 2026 Comprehensive Expected Dividend Calendar (Updated for Full 2026 Season)
const popularUpcoming = [
  // MART - NİSAN (TAMAMLANANLAR VEYA YAKIN GEÇMİŞ)
  { symbol: 'AKBNK.IS', name: 'Akbank', yield: '4.20%', date: '2026-03-25', month: 'Mart 2026', confirmed: true },
  { symbol: 'GARAN.IS', name: 'Garanti BBVA', yield: '4.10%', date: '2026-03-28', month: 'Mart 2026', confirmed: true },
  { symbol: 'ISCTR.IS', name: 'İş Bankası (C)', yield: '2.90%', date: '2026-03-31', month: 'Mart 2026', confirmed: true },
  { symbol: 'ANSGR.IS', name: 'Anadolu Sigorta', yield: '5.10%', date: '2026-03-20', month: 'Mart 2026', confirmed: true },
  { symbol: 'AGHOL.IS', name: 'Anadolu Grubu Hol.', yield: '1.80%', date: '2026-03-29', month: 'Mart 2026', confirmed: true },
  { symbol: 'TSKB.IS', name: 'TSKB', yield: '3.30%', date: '2026-03-24', month: 'Mart 2026', confirmed: true },
  { symbol: 'AKGRT.IS', name: 'Aksigorta', yield: '4.60%', date: '2026-03-26', month: 'Mart 2026', confirmed: true },
  { symbol: 'HALKB.IS', name: 'Halkbank', yield: '0.00%', date: '2026-03-27', month: 'Mart 2026', confirmed: true },
  { symbol: 'VAKBN.IS', name: 'Vakıfbank', yield: '0.00%', date: '2026-03-30', month: 'Mart 2026', confirmed: true },

  { symbol: 'TUPRS.IS', name: 'Tüpraş', yield: '5.50%', date: '2026-04-03', month: 'Nisan 2026', confirmed: true },
  { symbol: 'FROTO.IS', name: 'Ford Otosan', yield: '4.10%', date: '2026-04-08', month: 'Nisan 2026', confirmed: true },
  { symbol: 'DOAS.IS', name: 'Doğuş Otomotiv', yield: '10.80%', date: '2026-04-15', month: 'Nisan 2026', confirmed: true },
  { symbol: 'ENKAI.IS', name: 'Enka İnşaat', yield: '2.80%', date: '2026-04-14', month: 'Nisan 2026', confirmed: true },
  { symbol: 'OTKAR.IS', name: 'Otokar', yield: '3.60%', date: '2026-04-18', month: 'Nisan 2026', confirmed: true },
  { symbol: 'TTRAK.IS', name: 'Türk Traktör', yield: '6.20%', date: '2026-04-22', month: 'Nisan 2026', confirmed: true },
  { symbol: 'BRISA.IS', name: 'Brisa', yield: '4.80%', date: '2026-04-25', month: 'Nisan 2026', confirmed: true },
  { symbol: 'AKSA.IS', name: 'Aksa Akrilik', yield: '4.10%', date: '2026-04-24', month: 'Nisan 2026', confirmed: true },
  { symbol: 'DEVA.IS', name: 'Deva Holding', yield: '1.20%', date: '2026-04-10', month: 'Nisan 2026', confirmed: true },
  { symbol: 'ENJSA.IS', name: 'Enerjisa Enerji', yield: '5.20%', date: '2026-04-28', month: 'Nisan 2026', confirmed: true },
  { symbol: 'GWIND.IS', name: 'Galata Wind', yield: '3.10%', date: '2026-04-12', month: 'Nisan 2026', confirmed: true },
  { symbol: 'ALBRK.IS', name: 'Albaraka Türk', yield: '3.20%', date: '2026-04-16', month: 'Nisan 2026', confirmed: true },
  
  // NİSAN SONU - MAYIS (ZİRVE SEZONU)
  { symbol: 'EREGL.IS', name: 'Erdemir', yield: '4.20%', date: '2026-04-29', month: 'Nisan 2026', confirmed: true },
  { symbol: 'THYAO.IS', name: 'Türk Hava Yolları', yield: '2.10%', date: '2026-05-02', month: 'Mayıs 2026', confirmed: true },
  { symbol: 'TOASO.IS', name: 'Tofaş Oto', yield: '5.20%', date: '2026-05-05', month: 'Mayıs 2026', confirmed: true },
  { symbol: 'KCHOL.IS', name: 'Koç Holding', yield: '3.10%', date: '2026-05-08', month: 'Mayıs 2026', confirmed: true },
  { symbol: 'SAHOL.IS', name: 'Sabancı Holding', yield: '3.40%', date: '2026-05-12', month: 'Mayıs 2026', confirmed: true },
  { symbol: 'YKBNK.IS', name: 'Yapı Kredi', yield: '3.80%', date: '2026-05-14', month: 'Mayıs 2026', confirmed: true },
  { symbol: 'SISE.IS', name: 'Şişecam', yield: '2.30%', date: '2026-05-15', month: 'Mayıs 2026', confirmed: true },
  { symbol: 'ARCLK.IS', name: 'Arçelik', yield: '1.90%', date: '2026-05-18', month: 'Mayıs 2026', confirmed: false },
  { symbol: 'BIMAS.IS', name: 'BİM Mağazalar', yield: '2.80%', date: '2026-05-20', month: 'Mayıs 2026', confirmed: false },
  { symbol: 'AEFES.IS', name: 'Anadolu Efes', yield: '4.80%', date: '2026-05-22', month: 'Mayıs 2026', confirmed: false },
  { symbol: 'VESBE.IS', name: 'Vestel Beyaz Eşya', yield: '6.40%', date: '2026-05-25', month: 'Mayıs 2026', confirmed: false },
  { symbol: 'MGROS.IS', name: 'Migros Ticaret', yield: '2.50%', date: '2026-05-26', month: 'Mayıs 2026', confirmed: false },
  { symbol: 'ALARK.IS', name: 'Alarko Holding', yield: '3.20%', date: '2026-05-28', month: 'Mayıs 2026', confirmed: false },
  { symbol: 'SOKM.IS', name: 'Şok Marketler', yield: '2.60%', date: '2026-05-21', month: 'Mayıs 2026', confirmed: false },
  { symbol: 'KOZAL.IS', name: 'Koza Altın', yield: '1.10%', date: '2026-05-29', month: 'Mayıs 2026', confirmed: false },
  { symbol: 'KOZAA.IS', name: 'Koza Anadolu', yield: '0.90%', date: '2026-05-24', month: 'Mayıs 2026', confirmed: false },
  { symbol: 'TAVHL.IS', name: 'TAV Havalimanları', yield: '2.00%', date: '2026-05-10', month: 'Mayıs 2026', confirmed: true },
  { symbol: 'PGSUS.IS', name: 'Pegasus', yield: '0.00%', date: '2026-05-30', month: 'Mayıs 2026', confirmed: false },
  { symbol: 'TKFEN.IS', name: 'Tekfen Holding', yield: '3.40%', date: '2026-05-24', month: 'Mayıs 2026', confirmed: false },
  { symbol: 'CIMSA.IS', name: 'Çimsa', yield: '4.10%', date: '2026-05-16', month: 'Mayıs 2026', confirmed: true },
  { symbol: 'AKCNS.IS', name: 'Akçansa', yield: '4.50%', date: '2026-05-18', month: 'Mayıs 2026', confirmed: true },
  { symbol: 'KORDS.IS', name: 'Kordsa', yield: '1.50%', date: '2026-05-22', month: 'Mayıs 2026', confirmed: true },
  { symbol: 'KARSN.IS', name: 'Karsan', yield: '0.00%', date: '2026-05-27', month: 'Mayıs 2026', confirmed: true },
  { symbol: 'VESTL.IS', name: 'Vestel', yield: '2.80%', date: '2026-05-30', month: 'Mayıs 2026', confirmed: false },
  { symbol: 'INDES.IS', name: 'İndeks Bilgisayar', yield: '5.20%', date: '2026-05-12', month: 'Mayıs 2026', confirmed: true },
  { symbol: 'EGEEN.IS', name: 'Ege Endüstri', yield: '3.80%', date: '2026-05-08', month: 'Mayıs 2026', confirmed: true },
  { symbol: 'OYAKC.IS', name: 'Oyak Çimento', yield: '4.20%', date: '2026-05-20', month: 'Mayıs 2026', confirmed: true },
  { symbol: 'NUHCM.IS', name: 'Nuh Çimento', yield: '5.10%', date: '2026-05-23', month: 'Mayıs 2026', confirmed: true },
  
  // HAZİRAN - TEMMUZ
  { symbol: 'CCOLA.IS', name: 'Coca-Cola İçecek', yield: '2.80%', date: '2026-06-10', month: 'Haziran 2026', confirmed: true },
  { symbol: 'KO', name: 'Coca-Cola (US)', yield: '3.10%', date: '2026-06-14', month: 'Haziran 2026', confirmed: true },
  { symbol: 'TCELL.IS', name: 'Turkcell', yield: '2.60%', date: '2026-06-15', month: 'Haziran 2026', confirmed: false },
  { symbol: 'TTKOM.IS', name: 'Türk Telekom', yield: '2.00%', date: '2026-06-25', month: 'Haziran 2026', confirmed: false },
  { symbol: 'TURSG.IS', name: 'Türkiye Sigorta', yield: '4.20%', date: '2026-06-20', month: 'Haziran 2026', confirmed: false },
  { symbol: 'MAVI.IS', name: 'Mavi Giyim', yield: '2.10%', date: '2026-06-18', month: 'Haziran 2026', confirmed: false },
  { symbol: 'DOHOL.IS', name: 'Doğan Holding', yield: '1.40%', date: '2026-06-22', month: 'Haziran 2026', confirmed: false },
  { symbol: 'SMRTG.IS', name: 'Smart Solar', yield: '0.00%', date: '2026-06-28', month: 'Haziran 2026', confirmed: false },
  { symbol: 'YEOTK.IS', name: 'Yeo Teknoloji', yield: '0.00%', date: '2026-06-12', month: 'Haziran 2026', confirmed: false },
  
  { symbol: 'PEP', name: 'PepsiCo', yield: '2.80%', date: '2026-07-05', month: 'Temmuz 2026', confirmed: true },
  { symbol: 'WMT', name: 'Walmart Inc.', yield: '1.40%', date: '2026-07-15', month: 'Temmuz 2026', confirmed: true },
  { symbol: 'DIS', name: 'The Walt Disney Co.', yield: '0.90%', date: '2026-07-18', month: 'Temmuz 2026', confirmed: true },
  { symbol: 'ZOREN.IS', name: 'Zorlu Enerji', yield: '0.80%', date: '2026-07-12', month: 'Temmuz 2026', confirmed: false },
  { symbol: 'ALBRK.IS', name: 'Albaraka Türk', yield: '3.20%', date: '2026-07-25', month: 'Temmuz 2026', confirmed: false },
  
  // AĞUSTOS - EYLÜL (H2 ATAĞI)
  { symbol: 'EBEBK.IS', name: 'Ebebek Mağazacılık (1)', yield: '1.20%', date: '2026-08-15', month: 'Ağustos 2026', confirmed: false },
  { symbol: 'T', name: 'AT&T Inc.', yield: '6.50%', date: '2026-08-01', month: 'Ağustos 2026', confirmed: true },
  { symbol: 'VZ', name: 'Verizon', yield: '6.20%', date: '2026-08-08', month: 'Ağustos 2026', confirmed: true },
  { symbol: 'PFE', name: 'Pfizer Inc.', yield: '5.80%', date: '2026-08-20', month: 'Ağustos 2026', confirmed: true },
  { symbol: 'ASELS.IS', name: 'Aselsan', yield: '1.10%', date: '2026-09-20', month: 'Eylül 2026', confirmed: false },
  { symbol: 'PETKM.IS', name: 'Petkim', yield: '4.50%', date: '2026-09-25', month: 'Eylül 2026', confirmed: false },
  { symbol: 'KRDMD.IS', name: 'Kardemir (D)', yield: '3.70%', date: '2026-09-10', month: 'Eylül 2026', confirmed: false },
  { symbol: 'ASTOR.IS', name: 'Astor Enerji', yield: '1.40%', date: '2026-09-15', month: 'Eylül 2026', confirmed: false },
  { symbol: 'MCD', name: 'McDonald\'s', yield: '2.20%', date: '2026-09-14', month: 'Eylül 2026', confirmed: true },
  
  // EKİM - KASIM - ARALIK
  { symbol: 'EBEBK.IS', name: 'Ebebek Mağazacılık (2)', yield: '1.20%', date: '2026-10-15', month: 'Ekim 2026', confirmed: true },
  { symbol: 'SASA.IS', name: 'Sasa Polyester', yield: '0.50%', date: '2026-10-30', month: 'Ekim 2026', confirmed: false },
  { symbol: 'ABBV', name: 'AbbVie', yield: '3.50%', date: '2026-10-15', month: 'Ekim 2026', confirmed: true },
  { symbol: 'TXN', name: 'Texas Instruments', yield: '2.90%', date: '2026-10-22', month: 'Ekim 2026', confirmed: true },
  { symbol: 'AAPL', name: 'Apple Inc.', yield: '0.48%', date: '2026-11-08', month: 'Kasım 2026', confirmed: true },
  { symbol: 'MSFT', name: 'Microsoft', yield: '1.10%', date: '2026-11-15', month: 'Kasım 2026', confirmed: true },
  { symbol: 'HEKTS.IS', name: 'Hektaş', yield: '0.70%', date: '2026-11-10', month: 'Kasım 2026', confirmed: false },
  { symbol: 'KONTR.IS', name: 'Kontrolmatik', yield: '0.90%', date: '2026-11-25', month: 'Kasım 2026', confirmed: false },
  { symbol: 'EKGYO.IS', name: 'Emlak Konut', yield: '3.50%', date: '2026-12-18', month: 'Aralık 2026', confirmed: false },
  { symbol: 'XOM', name: 'Exxon Mobil', yield: '3.40%', date: '2026-12-10', month: 'Aralık 2026', confirmed: true },
  { symbol: 'GUBRF.IS', name: 'Gübre Fabrikaları', yield: '0.00%', date: '2026-12-25', month: 'Aralık 2026', confirmed: false },
];

/**
 * Helper to find the closest upcoming dividend symbol from popularUpcoming list.
 * This ensures the app opens with the most relevant (hottest) stock currently in the season.
 */
const getHottestDividendSymbol = () => {
  // Get current date in Istanbul (UTC+3)
  const now = new Date();
  // Offset for UTC+3 (Istanbul)
  const istanbulTime = new Date(now.getTime() + (3 * 3600000));
  const istanbulDate = new Date(istanbulTime.getFullYear(), istanbulTime.getMonth(), istanbulTime.getDate());
  istanbulDate.setHours(0, 0, 0, 0);
  
  // Sort by date ascending
  const sorted = [...popularUpcoming].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Find the first one that is today or in the future
  const upcoming = sorted.filter(item => {
    const itemDate = new Date(item.date);
    itemDate.setHours(0, 0, 0, 0);
    return itemDate >= istanbulDate;
  });
  
  if (upcoming.length > 0) {
    return upcoming[0].symbol;
  }
  
  // Fallback to highest yield or first in list
  return sorted.length > 0 ? sorted[0].symbol : 'EREGL.IS';
};

interface DividendData {
  symbol: string;
  version: string;
  source: string;
  timestamp: string;
  summary: {
    price: {
      regularMarketPrice: number;
      regularMarketChangePercent?: number;
      longName: string;
      currency: string;
      dayHigh?: number;
      dayLow?: number;
      volume?: number;
    };
    summaryDetail: {
      dividendRate: number;
      dividendYield: number;
      forwardDividendRate: number;
      forwardDividendYield: number;
      payoutRatio: number;
      marketCap: number;
      trailingPE: number;
      fiftyTwoWeekHigh: number;
      fiftyTwoWeekLow: number;
      industry: string | null;
      sector: string | null;
    };
    calendarEvents: {
      exDividendDate?: Date;
      dividendDate?: Date;
    };
    assetProfile: {
      longBusinessSummary?: string;
      website?: string;
    };
    financialData?: {
      recommendationKey?: string;
      targetMeanPrice?: number;
      numberOfAnalystOpinions?: number;
      isTechnicalTarget?: boolean;
    };
  };
  history: Array<{
    date: number;
    amount: number;
  }>;
  verification: {
    sources_count: number;
    google_verified: boolean;
    yahoo_verified: boolean;
    alpha_vantage_verified: boolean;
    investing_verified: boolean;
    last_sync: string;
  };
}

// Helper to safely extract value from complex objects (raw/fmt/value)
const getVal = (obj: any) => {
  if (obj === null || obj === undefined) return undefined;
  if (typeof obj === 'number') return obj;
  if (typeof obj === 'object') {
    if (obj.value !== undefined) return obj.value;
    if (obj.raw !== undefined) return obj.raw;
    return obj.val;
  }
  if (typeof obj === 'string') return parseFloat(obj);
  return undefined;
};

const formatCurrency = (val?: any, symbol?: string) => {
  const value = getVal(val);
  if (value === undefined || isNaN(value)) return '-';
  const isBist = symbol?.endsWith('.IS');
  return new Intl.NumberFormat(isBist ? 'tr-TR' : 'en-US', { 
    style: 'currency', 
    currency: isBist ? 'TRY' : 'USD' 
  }).format(value);
};

const formatPercent = (val?: any) => {
  const value = getVal(val);
  if (value === undefined || isNaN(value)) return '-';
  return (value * 100).toFixed(2) + '%';
};

const formatDate = (val?: Date | number | null) => {
  if (!val || (typeof val === 'number' && isNaN(val))) return '-';
  try {
    const date = new Date(val);
    if (isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Europe/Istanbul'
    }).format(date);
  } catch {
    return '-';
  }
};

const formatLargeNumber = (val?: number) => {
  if (val === undefined || isNaN(val) || val === 0) return '---';
  if (val >= 1000000000) return (val / 1000000000).toFixed(2) + 'B';
  if (val >= 1000000) return (val / 1000000).toFixed(2) + 'M';
  if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
  return val.toString();
};

const getRecommendationLabel = (key?: string) => {
  if (!key) return 'TUT';
  const k = key.toLowerCase();
  if (k.includes('strong_buy')) return 'GÜÇLÜ AL';
  if (k.includes('buy')) return 'AL';
  if (k.includes('underperform') || k.includes('sell')) return 'SAT';
  return 'TUT';
};

const InfoTooltip = ({ title, text, position = 'center' }: { title: string; text: string; position?: 'center' | 'left' | 'right' }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const positionClasses = {
    center: "left-1/2 -translate-x-1/2",
    left: "left-0",
    right: "right-0"
  };

  return (
    <div className="relative inline-block ml-1.5 group/tooltip cursor-help align-middle">
      <button 
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center border border-white/20 hover:border-indigo-400 hover:bg-indigo-500/20 transition-all z-20 relative outline-none"
      >
        <Info className="w-2.5 h-2.5 text-slate-400 group-hover/tooltip:text-indigo-400" />
      </button>
      <div className={cn(
        "absolute bottom-full mb-3 w-64 p-5 bg-slate-900/98 backdrop-blur-2xl border border-white/10 rounded-[24px] shadow-2xl z-[9999] pointer-events-none transition-all duration-300 scale-90 translate-y-2 shadow-indigo-500/20",
        positionClasses[position],
        isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0"
      )}>
        <div className={cn(
          "absolute -bottom-1.5 w-4 h-4 bg-slate-900 border-b border-r border-white/10 rotate-45",
          position === 'center' ? "left-1/2 -translate-x-1/2" : position === 'left' ? "left-4" : "right-4"
        )} />
        <div className="relative z-10">
          <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">{title}</h5>
          <p className="text-[11px] text-slate-200 leading-relaxed font-medium italic">{text}</p>
        </div>
      </div>
    </div>
  );
};

const formatCompactNumber = (val?: any) => {
  const value = getVal(val);
  if (value === undefined || isNaN(value)) return '-';
  
  return new Intl.NumberFormat('tr-TR', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 2
  }).format(value);
};

const DividendGrowthChart = ({ history }: { history: any[] }) => {
  const chartData = [...(history || [])]
    .sort((a, b) => (a?.date || 0) - (b?.date || 0))
    .map(item => ({
      date: item?.date ? new Date(item.date * 1000).getFullYear() : 0,
      amount: item?.amount || 0
    }));

  // Group by year to show annual dividends
  const annualData: { [key: number]: number } = {};
  chartData.forEach(item => {
    if (item.date > 0) {
      annualData[item.date] = (annualData[item.date] || 0) + item.amount;
    }
  });

  const processedData = Object.entries(annualData).map(([year, amount]) => ({
    year: parseInt(year),
    amount: parseFloat(amount.toFixed(4))
  })).sort((a, b) => a.year - b.year);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <AreaChart data={processedData}>
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
          <XAxis 
            dataKey="year" 
            stroke="#64748b" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            tick={{ fontWeight: 800 }}
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            tick={{ fontWeight: 800 }}
            tickFormatter={(val) => `₺${val}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0f172a', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              fontSize: '11px',
              fontWeight: '900',
              color: '#fff'
            }}
            itemStyle={{ color: '#818cf8' }}
          />
          <Area 
            type="monotone" 
            dataKey="amount" 
            stroke="#818cf8" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorAmount)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const DividendTracker: React.FC = () => {
  // Primary States
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState(getHottestDividendSymbol());
  const [data, setData] = useState<DividendData | null>(null);
  const [avData, setAvData] = useState<any | null>(null);
  const [avNews, setAvNews] = useState<any | null>(null);
  const [avRsi, setAvRsi] = useState<any | null>(null);
  const [avFin, setAvFin] = useState<any | null>(null);
  const [avEarnings, setAvEarnings] = useState<any | null>(null);
  const [avCashFlow, setAvCashFlow] = useState<any | null>(null);
  const [avEcon, setAvEcon] = useState<any | null>(null);
  const [avOil, setAvOil] = useState<any | null>(null);
  const [avCalendar, setAvCalendar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI States
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  const [isInformationModalOpen, setIsInformationModalOpen] = useState(false);
  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);
  const [showAllDividends, setShowAllDividends] = useState(false);
  const [calendarSearch, setCalendarSearch] = useState('');
  const [istanbulTime, setIstanbulTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setIstanbulTime(now.toLocaleTimeString('tr-TR', { 
        timeZone: 'Europe/Istanbul',
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Lock body scroll when any modal is open
  useEffect(() => {
    const isAnyModalOpen = isInformationModalOpen || isCalculatorModalOpen || showAllDividends;
    
    if (isAnyModalOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
      document.documentElement.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
      document.documentElement.style.overflow = 'unset';
    };
  }, [isInformationModalOpen, isCalculatorModalOpen, showAllDividends]);

  const fetchAlphaVantage = async (symbol: string) => {
    try {
      const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      // 1. Overview
      const res = await fetch(`/api/alphavantage/overview?symbol=${encodeURIComponent(symbol)}`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.Symbol) setAvData(json);
      } else {
        console.warn(`[AV] Overview returned ${res.status}`);
      }
      await wait(1000); // Rate limit protection

      // 2. News & Sentiment
      const resNews = await fetch(`/api/alphavantage/news?symbol=${encodeURIComponent(symbol)}`);
      if (resNews.ok) {
        const jsonNews = await resNews.json();
        setAvNews(jsonNews);
      }
      await wait(1000);

      // 3. RSI (Technical)
      const resRsi = await fetch(`/api/alphavantage/rsi?symbol=${encodeURIComponent(symbol)}`);
      if (resRsi.ok) {
        const jsonRsi = await resRsi.json();
        setAvRsi(jsonRsi);
      }
      await wait(1000);

      // 4. Financials (Income Statement)
      const resFin = await fetch(`/api/alphavantage/financials?symbol=${encodeURIComponent(symbol)}`);
      if (resFin.ok) {
        const jsonFin = await resFin.json();
        setAvFin(jsonFin);
      }
      await wait(1000);

      // 5. Earnings
      const resEarn = await fetch(`/api/alphavantage/earnings?symbol=${encodeURIComponent(symbol)}`);
      if (resEarn.ok) {
        const jsonEarn = await resEarn.json();
        setAvEarnings(jsonEarn);
      }
      await wait(1000);

      // 6. Cash Flow
      const resCF = await fetch(`/api/alphavantage/cashflow?symbol=${encodeURIComponent(symbol)}`);
      if (resCF.ok) {
        const jsonCF = await resCF.json();
        setAvCashFlow(jsonCF);
      }
    } catch (err) {
      console.warn('[AV] Alpha Vantage fetch skipped or failed:', err);
    }
  };

  const fetchAVCalendar = async () => {
    try {
      const res = await fetch('/api/alphavantage/calendar?horizon=3month');
      if (!res.ok) return;
      const json = await res.json();
      if (Array.isArray(json)) {
        setAvCalendar(json.filter(i => i.symbol).slice(0, 10));
      }
    } catch (err) {
      console.warn('[AV Calendar] Fetch failed:', err);
    }
  };

  const fetchEconomics = async () => {
    try {
      // Fetch Federal Funds Rate as a global proxy
      const res = await fetch('/api/alphavantage/economics/FEDERAL_FUNDS_RATE');
      if (res.ok) {
        const json = await res.json();
        setAvEcon(json);
      }

      // Fetch Brent Oil Price as a global commodity index
      const resOil = await fetch('/api/alphavantage/commodity/BRENT');
      if (resOil.ok) {
        const jsonOil = await resOil.json();
        setAvOil(jsonOil);
      }
    } catch (err) {
      console.warn('[AV Econ] Fetch failed:', err);
    }
  };

  const fetchData = async (symbol: string, forceRefresh = false) => {
    setLoading(true);
    setError(null);
    setAvData(null);
    setAvNews(null);
    setAvRsi(null);
    setAvFin(null);
    setAvEarnings(null);
    setAvCashFlow(null);
    try {
      const url = `/api/dividends?symbol=${encodeURIComponent(symbol)}${forceRefresh ? '&refresh=true' : ''}`;
      const res = await fetch(url);
      const contentType = res.headers.get('content-type');
      
      if (!res.ok) {
        let errorMsg = `Bağlantı Hatası (${res.status})`;
        if (contentType && contentType.includes('application/json')) {
          const json = await res.json();
          errorMsg = json.message || json.error || errorMsg;
          if (res.status === 429) errorMsg = "API Limitine Takıldı (Alpha Vantage)";
        } else {
          errorMsg = `Sunucu hatası: ${res.status} ${res.statusText}`;
        }
        throw new Error(errorMsg);
      }
      
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('[DividendTracker] Beklenmeyen yanıt (HTML/Düz metin):', text.substring(0, 500));
        throw new Error('Sunucu JSON yerine HTML (veya sayfa) döndürdü. Lütfen firebase.json rewrites ayarlarını kontrol edin.');
      }

      const json = await res.json();
      if (!json || !json.summary) throw new Error('Sembol verisi bulunamadı.');

      // Price alert if all fetchers fail (0 returned)
      if (json.summary.price?.regularMarketPrice === 0) {
        console.warn('[DividendTracker] Fiyat verisi 0 döndü. Tüm kaynaklar kilitlenmiş olabilir.');
        setError('Piyasa verilerine şu an erişilemiyor. Lütfen Settings kısmından API keylerinizi kontrol edin veya biraz sonra tekrar deneyin.');
      }

      // Background fetch for AV details
      fetchAlphaVantage(symbol);
      fetchAVCalendar();

      // Normalize history if back-end date format varies
      if (json.history) {
        json.history = json.history.map((h: any) => ({
          ...h,
          date: typeof h.date === 'string' ? new Date(h.date).getTime() : h.date
        }));
      }

      setData(json);
      setSearchResults([]);
    } catch (err: any) {
      console.error('[DividendTracker] Fetch hatası:', err);
      setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedSymbol);
    fetchAVCalendar();
    fetchEconomics();
  }, []);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/stock/search?q=${val}`);
      if (!res.ok) return;
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        setSearchResults(Array.isArray(json) ? json : []);
      } catch (e) {
        console.warn('[Search] API returned non-JSON response');
        setSearchResults([]);
      }
    } catch (err) {
      console.error('[Search] Error:', err);
    }
  };

  // Simple sort for display
  const sortedDividends = [...popularUpcoming].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Group by month
  const groupedDividends = sortedDividends.reduce((acc, current) => {
    const month = current.month;
    if (!acc[month]) acc[month] = [];
    acc[month].push(current);
    return acc;
  }, {} as Record<string, typeof popularUpcoming>);

  // Status badge helper
  const getStatusBadge = (dividendDate?: Date | number | null) => {
    if (!dividendDate) return null;
    
    // Current date for comparison
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(dividendDate);
    
    // Normalize dates for day-only comparison
    const d1 = today;
    const d2 = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    const badgeBase = "px-4 md:px-5 py-2 text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl border flex items-center justify-center gap-2 shadow-lg whitespace-nowrap text-center";

    if (diffDays === 0) {
      return (
        <span className={cn(badgeBase, "bg-blue-500/20 text-blue-400 border-blue-500/40 animate-pulse shadow-blue-500/5")}>
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
          PAY EDİLİYOR / HESAPLARDA
        </span>
      );
    } else if (diffDays === 1) {
      return (
        <span className={cn(badgeBase, "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-bounce shadow-emerald-500/5")}>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          YARIN ÖDEME VAR
        </span>
      );
    } else if (diffDays > 1 && diffDays <= 5) {
      return (
        <span className={cn(badgeBase, "bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-amber-500/5")}>
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
          HAKEDİŞ YAKIN ({diffDays} GÜN)
        </span>
      );
    } else if (diffDays > 5 && diffDays <= 15) {
      return (
        <span className={cn(badgeBase, "bg-indigo-500/20 text-indigo-400 border-indigo-500/40 shadow-indigo-500/5")}>
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
          YAKLAŞIYOR ({diffDays} GÜN)
        </span>
      );
    } else if (diffDays < 0) {
      return (
        <span className={cn(badgeBase, "bg-slate-500/20 text-slate-400 border-slate-500/40")}>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
          ÖDEME TAMAMLANDI
        </span>
      );
    }
    return (
      <span className={cn(badgeBase, "bg-slate-800/40 text-slate-500 border-white/5")}>
        <Calendar className="w-3 h-3" />
        BEKLEMEDE
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30 pt-16">
      {/* Search Header */}
      <div className="border-b border-white/5 bg-slate-900/40 backdrop-blur-xl sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 md:py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
              <TrendingUp className="text-white w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <div className="flex flex-col gap-1">
                <h1 className="text-lg md:text-xl font-black text-white tracking-tight uppercase italic leading-none">Temettü Dağıtımı & Takip</h1>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">Temettü Dağıtan Hisseler ve 2026 Tahmini</p>
              </div>
              <p className="text-[8px] md:text-[10px] text-slate-500 font-black tracking-widest uppercase mt-0.5">Akıllı Yatırım Rehberi</p>
            </div>
          </div>

          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Hisse senedi ara (örn: AAPL, KO, THYAO.IS)..."
              className="w-full bg-slate-900 border border-white/10 rounded-2xl py-2.5 pl-11 pr-5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-slate-500 transition-all font-medium"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
            />
            
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100] backdrop-blur-3xl"
                >
                  <div className="max-h-80 overflow-y-auto">
                    {searchResults.map((item) => (
                      <button
                        key={item.symbol}
                        onClick={() => {
                          setSelectedSymbol(item.symbol);
                          fetchData(item.symbol);
                          setQuery('');
                        }}
                        className="w-full px-5 py-3 text-left hover:bg-white/5 flex items-center justify-between transition-colors border-b border-white/5 last:border-0"
                      >
                        <div className="truncate pr-4">
                          <div className="font-bold text-white">{item.symbol}</div>
                          <div className="text-[10px] text-slate-500 truncate font-black tracking-widest uppercase">{item.longname || item.shortname || item.exchange}</div>
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-2">
                          <span className="text-[9px] font-black text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase">{item.exchange}</span>
                          <ChevronRight className="w-4 h-4 text-slate-600" />
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Season Marquee */}
      <div className="bg-indigo-600 py-1.5 overflow-hidden whitespace-nowrap border-y border-indigo-400/30">
        <div className="flex animate-marquee">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-10 mx-6">
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                2026 TEMETTÜ TAKVİMİ (ALPHA VANTAGE PRO & EBEBEK GÜNCEL)
              </span>
              <span className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] italic">
                EREGL: 29.04 • THYAO: 02.05 • TOASO: 05.05 • KCHOL: 08.05 • SAHOL: 12.05 • EBEBK: 15.10 • YKBNK: 14.05 • SISE: 15.05 • BIMAS: 20.05 • VESBE: 25.05 • ALARK: 28.05 • KOZAL: 29.05
              </span>
            </div>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
            <p className="text-slate-400 font-black tracking-widest uppercase text-xs">Piyasa Verileri Yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-500/5 border border-rose-500/10 rounded-[32px] p-12 flex flex-col items-center text-center gap-6 max-w-2xl mx-auto shadow-2xl">
            <div className="w-20 h-20 rounded-3xl bg-rose-500/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="text-rose-500 w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white mb-2 uppercase italic">Bağlantı Hatası</h3>
              <p className="text-slate-400 leading-relaxed font-medium">{error}. Lütfen internet bağlantınızı ve sembolü kontrol edin.</p>
            </div>
            <button onClick={() => fetchData(selectedSymbol)} className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-sm font-black uppercase tracking-widest transition-all">Tekrar Dene</button>
          </div>
        ) : data ? (
          <div className="space-y-12">
            <div className="space-y-6">
              {/* MAIN DASHBOARD: Key Metrics & Company Info Overhaul */}
              <div className="bg-slate-900 border border-white/5 rounded-[48px] overflow-hidden shadow-2xl flex flex-col relative group">
                <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                
                <div className="p-8 md:p-10 flex flex-col relative">
                  {/* Decorative Symbol Background */}
                  <div className="absolute top-0 right-0 p-8 md:p-10 font-black text-white uppercase tracking-tighter leading-none italic text-[60px] md:text-[120px] opacity-[0.02] select-none pointer-events-none overflow-hidden">
                    {data?.symbol}
                  </div>

                  <div className="relative z-10">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/5">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic leading-none">{data?.symbol}</h2>
                            <div className="h-6 w-px bg-white/10 mx-2" />
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-tight max-w-[250px] font-sans">
                              {data?.summary?.price?.longName || data?.symbol}
                            </div>
                          </div>
                          <div className="flex items-center flex-wrap gap-2 mt-2">
                             <button
                               onClick={() => fetchData(selectedSymbol, true)}
                               className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[8px] font-black uppercase tracking-widest rounded border border-indigo-500/20 flex items-center gap-1.5 hover:bg-indigo-500/20 transition-all"
                               title="Verileri Kaynaktan Zorla Yenile"
                             >
                               {loading ? <Loader2 className="w-2 h-2 animate-spin" /> : <RefreshCw className="w-2 h-2" />}
                               VERİ YENİLE
                             </button>

                            <span className="px-2 py-0.5 bg-white/5 text-slate-400 text-[8px] font-black uppercase tracking-widest rounded border border-white/5">
                              {data?.summary?.summaryDetail?.sector || avData?.Sector || 'Sektör Verisi Yok'}
                            </span>

                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 rounded border border-white/5">
                              <Clock className="w-2 h-2 text-slate-500" />
                              <span className="text-slate-400 font-bold uppercase tracking-widest text-[7px]">
                                SENK: {data?.verification?.last_sync || (data as any)?.last_sync || '---'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="h-12 w-px bg-white/10 hidden md:block" />

                        <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col border-r border-white/5 pr-4">
                              <div className="text-2xl font-black text-white italic tracking-tighter leading-none mb-0.5">
                                {formatCurrency(data?.summary?.price?.regularMarketPrice, data?.symbol)}
                              </div>
                              <div className={cn(
                                "text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-1",
                                (data?.summary?.price?.regularMarketChangePercent || 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                              )}>
                                {(data?.summary?.price?.regularMarketChangePercent || 0) >= 0 ? <TrendingUp className="w-2 h-2" /> : <TrendingUp className="w-2 h-2 rotate-180" />}
                                {(data?.summary?.price?.regularMarketChangePercent || 0) >= 0 ? '+' : ''}
                                {formatPercent(data?.summary?.price?.regularMarketChangePercent)}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex flex-col">
                                <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Günlük Aralık</span>
                                <div className="text-[9px] font-bold text-slate-300">
                                  {data?.summary?.price?.dayLow && data?.summary?.price?.dayHigh ? (
                                    `${formatCurrency(data?.summary?.price?.dayLow, data?.symbol)} - ${formatCurrency(data?.summary?.price?.dayHigh, data?.symbol)}`
                                  ) : (
                                    '---'
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Hacim</span>
                                <div className="text-[9px] font-bold text-slate-300">
                                  {formatLargeNumber(data?.summary?.price?.volume)}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Data Sources sub-row */}
                          <div className="flex items-center gap-3">
                            <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest">DOĞRULANAN KAYNAKLAR:</span>
                            <div className="flex items-center gap-2">
                              <div className={cn("flex items-center gap-1 transition-opacity", data?.verification?.yahoo_verified ? "opacity-100" : "opacity-30")}>
                                <div className="w-2.5 h-2.5 rounded-full bg-purple-500 flex items-center justify-center text-[5px] font-bold text-white">Y</div>
                                <span className={cn("text-[7px] font-bold", data?.verification?.yahoo_verified ? "text-purple-400" : "text-slate-500")}>YAHOO</span>
                              </div>
                              <div className={cn("flex items-center gap-1 transition-opacity", data?.verification?.google_verified ? "opacity-100" : "opacity-30")}>
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex items-center justify-center text-[5px] font-bold text-white">G</div>
                                <span className={cn("text-[7px] font-bold", data?.verification?.google_verified ? "text-blue-400" : "text-slate-500")}>GOOGLE</span>
                              </div>
                              <div className={cn("flex items-center gap-1 transition-opacity", data?.verification?.investing_verified ? "opacity-100" : "opacity-30")}>
                                <div className="w-2.5 h-2.5 rounded-full bg-orange-500 flex items-center justify-center text-[5px] font-bold text-white">I</div>
                                <span className={cn("text-[7px] font-bold", data?.verification?.investing_verified ? "text-orange-400" : "text-slate-500")}>INVESTING</span>
                              </div>
                            </div>
                            <div className="h-2 w-px bg-white/10" />
                            <div className="flex items-center gap-1">
                              <ShieldCheck className={cn("w-2 h-2", (data?.verification?.sources_count || 0) >= 2 ? "text-emerald-500 animate-pulse" : "text-slate-500")} />
                              <span className={cn("text-[7px] font-black uppercase tracking-widest", (data?.verification?.sources_count || 0) >= 2 ? "text-emerald-400" : "text-rose-500")}>
                                {(data?.verification?.sources_count || 0) >= 2 ? 'ÇAPRAZ DOĞRULAMA AKTİF' : 'TEK KAYNAKDAN ÇEKİLİYOR'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button 
                          onClick={() => { setActiveTab('overview'); setIsInformationModalOpen(true); }}
                          className="flex items-center gap-2 px-4 py-2.5 bg-slate-950 text-white rounded-xl border border-white/5 hover:border-indigo-500/30 group transition-all font-black text-[9px] uppercase tracking-widest"
                        >
                          <Activity className="w-3 h-3 text-indigo-500" />
                          Profil
                        </button>

                        <button 
                          onClick={() => { setActiveTab('history'); setIsInformationModalOpen(true); }}
                          className="flex items-center gap-2 px-4 py-2.5 bg-slate-950 text-white rounded-xl border border-white/5 hover:border-orange-500/30 group transition-all font-black text-[9px] uppercase tracking-widest"
                        >
                          <HistoryIcon className="w-3 h-3 text-orange-500" />
                          Geçmiş
                        </button>

                        <button 
                          onClick={() => setIsCalculatorModalOpen(true)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-slate-950 text-white rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all font-black text-[9px] uppercase tracking-widest"
                        >
                          <Calculator className="w-3 h-3 text-emerald-500" />
                          Tahmin
                        </button>
                      </div>
                    </div>



                    {/* Pro Metrics Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                       {/* Hisse Başı Ödeme */}
                       <div className="bg-slate-950/60 p-6 md:p-5 lg:p-6 rounded-[32px] border border-white/5 relative group hover:border-emerald-500/20 transition-all flex flex-col justify-center min-h-[140px]">
                          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                            <DollarSign className="w-10 h-10 text-white" />
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">BEKLENEN ÖDEME</div>
                            <InfoTooltip title="Temettü Tahmini" text="Analistlerin ve şirketin gelecek 12 ay için öngördüğü toplam hisse başı temettü miktarıdır." />
                          </div>
                          <div className="text-2xl md:text-3xl font-black text-emerald-400 tracking-tighter italic mb-1 truncate">
                             {formatCurrency(
                               (data?.summary?.summaryDetail as any)?.forwardDividendRate || 
                               data?.summary?.summaryDetail?.dividendRate || 
                               (avData?.DividendPerShare ? parseFloat(avData.DividendPerShare) : 0), 
                               data?.symbol
                             )}
                           </div>
                           <div className="flex items-center gap-2">
                              <div className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">
                                {((data?.summary?.summaryDetail as any)?.forwardDividendRate || data?.summary?.summaryDetail?.dividendRate) > 0 ? 'TEMETTÜ TAHMİNİ' : (avData?.DividendPerShare ? 'ALPHA VANTAGE VERİSİ' : 'VERİ YOK')}
                              </div>
                           </div>
                       </div>

                       {/* Temettü Verimi */}
                       <div className="bg-slate-950/60 p-6 md:p-5 lg:p-6 rounded-[32px] border border-white/5 relative group hover:border-indigo-500/20 transition-all flex flex-col justify-center min-h-[140px]">
                          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                            <TrendingUp className="w-10 h-10 text-white" />
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">TEMETTÜ VERİMİ</div>
                            <InfoTooltip title="Temettü Verimi" text="Beklenen temettü ödemesinin hisse fiyatına oranıdır." />
                          </div>
                          <div className="text-2xl md:text-3xl font-black text-indigo-400 tracking-tighter italic mb-1 truncate">
                            {formatPercent(
                              (data?.summary?.summaryDetail as any)?.forwardDividendYield || 
                              data?.summary?.summaryDetail?.dividendYield || 
                              (avData?.DividendYield ? parseFloat(avData.DividendYield) : 0)
                            )}
                          </div>
                          <div className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">
                            {(data?.summary?.summaryDetail as any)?.forwardDividendYield > 0 ? 'Beklenen Verim' : (avData?.DividendYield ? 'Yıllık Ortalama' : 'VERİ YOK')}
                          </div>
                       </div>

                       {/* Payout Ratio */}
                       <div className="bg-slate-950/60 p-6 md:p-5 lg:p-6 rounded-[32px] border border-white/5 relative group hover:border-amber-500/20 transition-all flex flex-col justify-center min-h-[140px]">
                          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                            <HistoryIcon className="w-10 h-10 text-white" />
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">PAYOUT RATIO</div>
                            <InfoTooltip title="Payout Ratio" text="Şirketin kârının yüzde kaçını hissedarlarına dağıttığını gösterir." />
                          </div>
                          <div className="text-2xl md:text-3xl font-black text-amber-500 tracking-tighter italic mb-1 truncate">
                            {formatPercent(
                              data?.summary?.summaryDetail?.payoutRatio || 
                              (avData?.PayoutRatio ? parseFloat(avData.PayoutRatio) : 0)
                            )}
                          </div>
                          <div className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Kar Dağıtım %</div>
                       </div>
                    </div>

                    {/* Veri Bilgilendirme Notu */}
                    {data?.summary?.summaryDetail?.dividendRate === 0 && (
                      <div className="mt-4 px-6 py-3 bg-slate-950/40 border border-white/5 rounded-2xl flex items-center gap-3">
                         <Info className="w-4 h-4 text-slate-500" />
                         <p className="text-[11px] text-slate-500 font-medium">
                            Tahminler 0 gelirse şirket son 1 yıldır hiç temettü ödememiş olması veya tüm global kaynakların aynı anda erişime kapalı olmasıdır.
                         </p>
                      </div>
                    )}



                    {/* Upcoming Highlights Bar Integration */}
                    {popularUpcoming.filter(u => new Date(u.date) >= new Date(new Date().setHours(0,0,0,0))).length > 0 && (
                      <div className="mt-12 mb-12">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
                             <Zap className="w-5 h-5 text-indigo-400" />
                          </div>
                          <div>
                             <h3 className="text-[12px] font-black text-white uppercase tracking-[0.3em] leading-none mb-1">En Yakın Temettüler</h3>
                             <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Piyasa bazlı yaklaşan ödeme fırsatları</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {[...popularUpcoming]
                            .filter(u => {
                              const uDate = new Date(u.date);
                              uDate.setHours(0,0,0,0);
                              const today = new Date();
                              today.setHours(0,0,0,0);
                              return uDate >= today;
                            })
                            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                            .slice(0, 4)
                            .map((u, i) => {
                              const uDate = new Date(u.date);
                              uDate.setHours(0,0,0,0);
                              const today = new Date();
                              today.setHours(0,0,0,0);
                              const diffDays = Math.round((uDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                              return (
                                <button 
                                  key={u.symbol + i}
                                  onClick={() => { setSelectedSymbol(u.symbol); fetchData(u.symbol); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                  className="bg-slate-950/40 border border-white/5 hover:border-indigo-500/40 p-5 rounded-[24px] flex flex-col gap-3 group/lite transition-all text-left relative overflow-hidden"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-lg font-black text-white italic group-hover/lite:text-indigo-400 transition-colors uppercase">{u.symbol}</span>
                                    <span className={cn(
                                      "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                                      diffDays <= 3 ? "bg-emerald-500/20 text-emerald-400 animate-pulse" : "bg-white/5 text-slate-400"
                                    )}>
                                      {diffDays === 0 ? 'PAY EDİLİYOR' : `${diffDays} GÜN`}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Dağıtım</div>
                                    <div className="text-sm font-black text-white/90 italic">{formatDate(new Date(u.date))}</div>
                                  </div>
                                </button>
                              );
                            })
                          }
                        </div>
                      </div>
                    )}

                    {(data?.summary?.calendarEvents?.dividendDate || data?.summary?.calendarEvents?.exDividendDate) && (
                      <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-4 mb-12 bg-slate-950/40 p-5 md:p-4 rounded-3xl border border-white/5">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          {data?.summary?.calendarEvents?.dividendDate && (
                            <div className="flex flex-col flex-1 sm:flex-none sm:pr-6 sm:border-r border-white/5">
                              <div className="flex items-center gap-1 mb-1">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Ödeme Tarihi</span>
                                <InfoTooltip title="Ödeme Tarihi" text="Şirketin temettü ödemesini hissedarların hesaplarına yatıracağı resmi tarihtir." />
                              </div>
                              <span className="text-sm sm:text-[12px] font-black text-white italic">{formatDate(data?.summary?.calendarEvents?.dividendDate)}</span>
                            </div>
                          )}
                          {data?.summary?.calendarEvents?.exDividendDate && (
                            <div className="flex flex-col flex-1 sm:flex-none sm:pr-6 sm:border-r border-white/5 sm:pl-2">
                              <div className="flex items-center gap-1 mb-1">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Hakediş (EX)</span>
                                <InfoTooltip title="Hakediş Tarihi" text="Temettü hakkı kazanmak için hissenin en geç bu tarihten önceki son işlem günü elinizde olması gerekir." />
                              </div>
                              <span className="text-sm sm:text-[12px] font-black text-white italic">{formatDate(data?.summary?.calendarEvents?.exDividendDate)}</span>
                            </div>
                          )}
                        </div>
                        <div className="w-full sm:w-auto sm:ml-auto flex items-center justify-center sm:justify-end border-t border-white/5 sm:border-0 pt-4 sm:pt-0">
                          {getStatusBadge(data?.summary?.calendarEvents?.dividendDate)}
                        </div>
                      </div>
                    )}

                    {/* Piyasa Görüşü Section - Professional & Informational */}
                    <div className="mt-10 pt-10 border-t border-white/5">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
                                 <Briefcase className="w-6 h-6 text-indigo-400" />
                              </div>
                              <div>
                                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">Piyasa Görüşü</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">Analist Beklentileri ve Stratejik Veriler</p>
                              </div>
                           </div>
                           
                           <div className="flex items-center gap-3 px-4 py-2 bg-slate-950/80 border border-white/5 rounded-xl backdrop-blur-sm shadow-xl">
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mt-0.5">İstanbul {istanbulTime}</span>
                              </div>
                              <div className="w-px h-3 bg-white/10" />
                              <span className="text-[9px] font-black text-indigo-400 uppercase italic tracking-widest">Global & Yerel Kaynaklar</span>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                           {/* Analist Konsensüsü */}
                           <div className="bg-slate-950/50 border border-white/5 rounded-[32px] p-6 md:p-8 flex flex-col group/consensus relative min-h-[160px] md:min-h-0">
                              <div className="absolute top-6 right-6 transition-transform cursor-help z-20">
                                 <div className="relative group/info">
                                    <div className="p-1 rounded-full hover:bg-white/5 transition-colors">
                                       <Info className="w-4 h-4 text-slate-500 group-hover/info:text-indigo-400 transition-colors" />
                                    </div>
                                    <div className="absolute bottom-full right-0 mb-3 w-64 p-4 bg-slate-900/95 backdrop-blur-xl text-[10px] font-bold text-slate-200 rounded-2xl border border-white/10 opacity-0 group-hover/info:opacity-100 transition-all pointer-events-none shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 translate-y-2 group-hover/info:translate-y-0">
                                       <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                          <span className="uppercase tracking-widest text-indigo-400">Veri Konsensüsü</span>
                                       </div>
                                       Bu veri; Bloomberg, Refinitiv (Reuters) ve Yahoo Finance gibi global finansal sağlayıcılardan gelen kurumsal analist (JP Morgan, Goldman Sachs, vb.) raporlarının ağırlıklı ortalamasını temsil eder.
                                    </div>
                                 </div>
                              </div>
                              
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Konsensüs</span>
                              <div className="text-4xl font-black text-white italic tracking-[0.1em] uppercase mb-2">
                                 {getRecommendationLabel(data?.summary?.financialData?.recommendationKey)}
                              </div>
                              <div className="mt-auto space-y-2">
                                 <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-indigo-500" />
                                    {data?.summary?.financialData?.numberOfAnalystOpinions 
                                      ? `${data?.summary?.financialData?.numberOfAnalystOpinions} Kurumsal Analist Görüşü` 
                                      : 'Sektör Ortalaması'}
                                 </div>
                                 <div className="text-[8px] text-slate-600 font-black uppercase tracking-[0.2em] italic">Kaynak: Global Institutional Aggregator</div>
                              </div>
                           </div>

                           {/* Hedef Fiyat */}
                           <div className="bg-slate-950/50 border border-white/5 rounded-[32px] p-6 md:p-8 flex flex-col group/target relative min-h-[160px] md:min-h-0">
                              <div className="absolute top-6 right-6 transition-transform cursor-help z-20">
                                 <div className="relative group/info">
                                    <div className="p-1 rounded-full hover:bg-white/5 transition-colors">
                                       <Info className="w-4 h-4 text-slate-500 group-hover/info:text-indigo-400 transition-colors" />
                                    </div>
                                    <div className="absolute bottom-full right-0 mb-3 w-56 p-4 bg-slate-900/95 backdrop-blur-xl text-[10px] font-bold text-slate-200 rounded-2xl border border-white/10 opacity-0 group-hover/info:opacity-100 transition-all pointer-events-none shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 translate-y-2 group-hover/info:translate-y-0">
                                       <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                          <span className="uppercase tracking-widest text-indigo-400">Bilgilendirme</span>
                                       </div>
                                       Analistlerin önümüzdeki 12 ay için öngördüğü fiyat tahminlerinin medyan ortalamasıdır.
                                    </div>
                                 </div>
                              </div>

                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 px-1">Ort. Hedef Fiyat</span>
                              <div className="flex items-end gap-3 mb-2">
                                <div className="text-4xl font-black text-white italic tracking-tighter leading-none">
                                   {formatCurrency(data?.summary?.financialData?.targetMeanPrice || avData?.AnalystTargetPrice, data?.symbol)}
                                </div>
                                <ArrowUpRight className="w-6 h-6 text-indigo-400 mb-1 group-hover/target:translate-x-1 group-hover/target:-translate-y-1 transition-transform" />
                              </div>
                              <div className="flex items-center gap-2 mt-auto">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40" />
                                <span className="text-[9px] font-black text-indigo-500/80 uppercase tracking-widest">12 Aylık Hedef</span>
                              </div>
                           </div>

                           {/* Endüstri / Sektör */}
                           <div className="bg-slate-950/50 border border-white/5 rounded-[32px] p-6 md:p-8 flex flex-col group/industry relative min-h-[160px] md:min-h-0 overflow-hidden">
                              <Layers className="absolute -bottom-4 -right-4 w-24 h-24 text-white/5 rotate-12 group-hover:scale-110 group-hover:rotate-0 transition-all duration-700" />
                              
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 relative z-10">Endüstri / Sınıf</span>
                              <div className="text-xl font-black text-white italic tracking-tight uppercase leading-snug mb-2 line-clamp-2 relative z-10">
                                 {data?.summary?.summaryDetail?.industry || avData?.Industry || 'VERİ BEKLENİYOR'}
                              </div>
                              <div className="mt-auto flex items-center gap-2 relative z-10">
                                 <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40" />
                                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                    VARLIK SEKTÖRÜ:{' '}
                                    <span className="text-indigo-400">
                                       {data?.summary?.summaryDetail?.sector || avData?.Sector || 'TANIMSIZ SEKTÖR'}
                                    </span>
                                 </span>
                               </div>
                           </div>

                           {/* İşlem Platformu / Aracı Kurum */}
                           <div className="bg-indigo-600/5 border border-indigo-500/10 rounded-[32px] p-6 md:p-8 flex flex-col group/broker overflow-hidden relative min-h-[160px] md:min-h-0">
                              <Activity className="absolute -bottom-6 -right-6 w-24 h-24 text-indigo-500/5 rotate-12 group-hover:scale-110 group-hover:rotate-0 transition-all duration-700" />
                              
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 relative z-10">İşlem Platformu</span>
                              <div className="text-lg font-black text-white uppercase tracking-tight mb-2 relative z-10">
                                 {data?.symbol?.includes('.IS') ? 'BİST (Midas / Bankalar)' : 'Global (Midas / Interactive)'}
                              </div>
                              <p className="text-[9px] text-slate-400 font-medium leading-relaxed relative z-10 max-w-[200px]">
                                 {data?.symbol?.includes('.IS') 
                                   ? 'Hisse senedini Borsa İstanbul yetkili tüm aracı kurumlar üzerinden alabilirsiniz.' 
                                   : 'Yurt dışı piyasalarına erişimi olan lisanslı kurumlar üzerinden işlem görebilir.'}
                              </p>
                           </div>
                        </div>

                        {/* Ek Analiz Verileri (AlphaVantage Destekli) */}
                        {avData && (
                           <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="px-5 py-4 bg-slate-900/40 rounded-2xl flex items-center justify-between border border-white/5 hover:bg-slate-900/60 transition-colors">
                                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Fiyat Aralığı (52H)</span>
                                 <span className="text-[11px] font-black text-white font-mono italic">{avData['52WeekHigh'] || '-'} / {avData['52WeekLow'] || '-'}</span>
                              </div>
                              <div className="px-5 py-4 bg-slate-900/40 rounded-2xl flex items-center justify-between border border-white/5 hover:bg-slate-900/60 transition-colors">
                                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">EPS Tahmini</span>
                                 <span className="text-[11px] font-black text-emerald-400 font-mono italic">{avData.EPS || '-'}</span>
                              </div>
                              <div className="px-5 py-4 bg-slate-900/40 rounded-2xl flex items-center justify-between border border-white/5 hover:bg-slate-900/60 transition-colors">
                                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">P/E Oranı</span>
                                 <span className="text-[11px] font-black text-indigo-400 font-mono italic">{avData.PERatio || '-'}</span>
                              </div>
                           </div>
                        )}
                        
                        <div className="mt-6 flex items-center gap-2 justify-center">
                           <Info className="w-3 h-3 text-slate-700" />
                           <p className="text-[7px] text-slate-700 font-bold uppercase tracking-widest">Yatırım kararları için tek başına yeterli değildir. Kaynak: AlphaVantage & Yahoo Analytics Interface.</p>
                        </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Disclosure Sub-bar */}
                <div className="bg-slate-950/50 border-t border-white/5 p-6 flex items-center gap-4">
                   <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20">
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                   </div>
                   <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider italic">
                     Bu ekranda yer alan veriler Alpha Vantage ve BİST kaynaklıdır. Sembol detayları ve ödeme tarihleri bilgilendirme amaçlıdır. 
                     <span className="text-white font-black mx-1">Yatırım tavsiyesi değildir.</span> 
                     Resmi kararlarınız için KAP ve kurumunuzun bildirimlerini esas alınız.
                   </p>
                </div>
              </div>

              {/* 2026 CALENDAR (Full Width) */}
              <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-white/5 pb-8">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
                        <Calendar className="text-indigo-400 w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none mb-1">Hisse Takvimi</h3>
                        <p className="text-slate-500 text-[9px] font-black tracking-[0.3em] uppercase italic">Gelecek Dönem Temettü Beklentileri</p>
                      </div>
                    </div>

                    <div className="relative w-full md:w-96 group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-indigo-400 transition-colors" />
                      <input
                        type="text"
                        placeholder="Takvimde ara (örn: EREGL)..."
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl py-2.5 pl-11 pr-5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-slate-500 transition-all font-medium"
                        value={calendarSearch}
                        onChange={(e) => setCalendarSearch(e.target.value)}
                      />
                      {calendarSearch && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-indigo-400 uppercase bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
                          {sortedDividends.filter(d => (calendarSearch === '' || d.symbol.toLowerCase().includes(calendarSearch.toLowerCase()) || d.name.toLowerCase().includes(calendarSearch.toLowerCase()))).length} SONUÇ
                        </div>
                      )}
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {sortedDividends
                      .filter(d => {
                         const today = new Date();
                         today.setHours(0,0,0,0);
                         const itemDate = new Date(d.date);
                         const isRecentOrFuture = itemDate >= new Date(today.getTime() - (15 * 24 * 60 * 60 * 1000)); 
                         const matchesSearch = calendarSearch === '' || 
                                               d.symbol.toLowerCase().includes(calendarSearch.toLowerCase()) || 
                                               d.name.toLowerCase().includes(calendarSearch.toLowerCase());
                         return isRecentOrFuture && matchesSearch;
                      })
                      .slice(0, 17)
                      .map((item) => {
                        const now = new Date();
                        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        const targetDate = new Date(item.date);
                        const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
                        
                        const diffTime = target.getTime() - today.getTime();
                        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                        const isVerySoon = diffDays >= 0 && diffDays <= 7;
                        const isPast = diffDays < 0;
                        const isToday = diffDays === 0;

                        return (
                          <button 
                            key={item.symbol + item.date}
                            onClick={() => {
                              setSelectedSymbol(item.symbol);
                              fetchData(item.symbol);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={cn(
                              "p-5 rounded-xl border transition-all flex flex-col items-start justify-between group/calendar relative overflow-hidden shadow-xl text-left h-40",
                              isVerySoon ? "bg-indigo-600/10 border-indigo-500 shadow-indigo-500/10" : "bg-slate-950/60 border-white/5 hover:border-indigo-500/50 hover:bg-slate-900"
                            )}
                          >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/calendar:opacity-20 transition-opacity">
                              <TrendingUp className="w-16 h-16 text-white rotate-12" />
                            </div>
                            
                            <div className="w-full flex justify-between items-start">
                              <div className="text-xl font-black text-white group-hover/calendar:text-indigo-400 transition-colors uppercase italic tracking-tighter leading-none">{item.symbol}</div>
                              {item.confirmed && !isPast && (
                                <div className="px-1.5 py-0.5 bg-indigo-600 text-[6px] font-black text-white uppercase italic tracking-widest rounded shadow-lg z-20 animate-pulse">
                                  KESİN
                                </div>
                              )}
                            </div>

                            <div className="w-full mt-auto space-y-2">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-3 h-3 text-slate-600" />
                                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">
                                    {item.date.split('-')[2]} {item.month.split(' ')[0]}
                                  </div>
                                </div>
                                {isVerySoon && (
                                  <div className="text-[9px] font-black text-emerald-400 uppercase tracking-tighter flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5" />
                                    {diffDays === 0 ? 'PAY EDİLİYOR' : `${diffDays} GÜN KALDI`}
                                  </div>
                                )}
                                {isPast && (
                                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-tighter flex items-center gap-1">
                                    <ShieldCheck className="w-2.5 h-2.5" />
                                    HESAPLARDA
                                  </div>
                                )}
                              </div>
                              
                              <div className="w-full flex items-center justify-between pt-2 border-t border-white/5">
                                 <div className="text-[8px] text-slate-600 font-black uppercase tracking-widest">VERİM</div>
                                 <div className="text-sm font-black text-emerald-400 italic leading-none">{item.yield}</div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    <button 
                      onClick={() => setShowAllDividends(true)}
                      className="p-5 rounded-xl bg-indigo-600/5 border-2 border-dashed border-indigo-500/20 hover:border-indigo-500/50 hover:bg-indigo-600/10 transition-all flex flex-col items-center justify-center gap-3 group/all h-36"
                    >
                      <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center group-hover/all:scale-110 transition-transform">
                        <LayoutGrid className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div className="text-indigo-400 font-black text-[9px] uppercase tracking-[0.2em] text-center">TÜM 2026<br/>TAKVİMİ</div>
                    </button>
                 </div>
              </div>

              {/* SECONDARY SECTION: Stats & History & Calculator Slots */}
              <div className="space-y-8 pt-8">
                 {/* Mobile Analysis Buttons */}
                 <div className="lg:hidden grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setActiveTab('overview');
                        setIsInformationModalOpen(true);
                      }}
                      className="p-5 rounded-2xl bg-slate-900 border border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-all text-center"
                    >
                      GELİŞMİŞ ANALİZ
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('history');
                        setIsInformationModalOpen(true);
                      }}
                      className="p-5 rounded-2xl bg-slate-900 border border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-all text-center"
                    >
                      ÖDEME GEÇMİŞİ
                    </button>
                 </div>
              </div>

              {/* Information & Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
               {/* Dividend Growth Visualization */}
               <div className="lg:col-span-3 bg-slate-950 border border-white/5 rounded-[48px] p-10 md:p-14 shadow-3xl overflow-hidden relative group/growth">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                           <TrendingUp className="w-8 h-8 text-emerald-400" />
                        </div>
                        <div>
                           <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-3">Temettü Büyüme Trendi</h3>
                           <p className="text-slate-500 text-[11px] font-black tracking-[0.4em] uppercase italic">Yıllık Kümülatif Ödeme Analizi</p>
                        </div>
                     </div>
                  </div>
                  {data?.history && data.history.length > 0 ? (
                    <DividendGrowthChart history={data.history} />
                  ) : (
                    <div className="h-64 flex items-center justify-center border border-dashed border-white/10 rounded-[32px]">
                       <span className="text-slate-500 font-bold uppercase tracking-widest italic">Yetersiz Veri Geçmişi</span>
                    </div>
                  )}
               </div>

               {/* Global Opportunities (Alpha Vantage Calendar) */}
               {avCalendar.length > 0 && (
                <div className="lg:col-span-3 bg-slate-900 border border-white/5 rounded-[40px] p-10 shadow-2xl space-y-8 overflow-hidden relative group">
                  <div className="absolute top-0 right-0 p-8">
                     <div className="text-xs font-black text-indigo-500 uppercase tracking-[0.4em] italic mb-2">ALPHA VANTAGE GLOBAL</div>
                     <div className="h-0.5 w-full bg-indigo-500/20 rounded-full" />
                  </div>
                  
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                      <ExternalLink className="text-indigo-400 w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Dünyadan Yaklaşan Ödemeler</h3>
                      <p className="text-slate-500 text-[10px] font-black tracking-[0.3em] uppercase mt-1">Sektör Bağımsız Global Fırsatlar</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {avCalendar.map((item, idx) => (
                      <button 
                        key={idx}
                        onClick={() => {
                          setSelectedSymbol(item.symbol);
                          fetchData(item.symbol);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-indigo-500/40 transition-all text-left flex items-center justify-between group/avc"
                      >
                        <div>
                          <div className="text-base font-black text-white group-hover/avc:text-indigo-400 transition-colors uppercase italic">{item.symbol}</div>
                          <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{formatDate(new Date(item.dividend_date))}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-black text-emerald-500">{formatCurrency(parseFloat(item.amount), item.symbol)}</div>
                          <ArrowUpRight className="w-3 h-3 text-slate-700 group-hover/avc:text-emerald-500 ml-auto mt-1" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
               )}

               <div className="lg:col-span-3 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-white/5 rounded-[48px] p-12 md:p-16 flex flex-col md:flex-row items-center gap-12 shadow-3xl relative overflow-hidden group">
                  <div className="absolute -left-20 -top-20 w-80 h-80 bg-indigo-600/10 blur-[120px] rounded-full group-hover:bg-indigo-600/20 transition-colors duration-1000" />
                  <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-purple-600/5 blur-[120px] rounded-full group-hover:bg-purple-600/15 transition-colors duration-1000" />
                  
                  <div className="w-28 h-28 rounded-[40px] bg-white text-slate-950 flex items-center justify-center shadow-2xl relative z-10 group-hover:scale-110 transition-transform duration-700">
                    <Zap className="w-14 h-14" />
                  </div>
                  
                  <div className="relative z-10 flex-1 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic">Karlısın Pro Analiz</span>
                    </div>
                    <h3 className="text-4xl font-black text-white mb-4 tracking-tighter italic uppercase leading-none">PASİF GELİR HEDEFLEYİCİ</h3>
                    <p className="text-slate-400 text-lg leading-relaxed font-medium max-w-xl mb-6">
                      Maaşlı bir çalışanın veya yatırımcının en büyük hayali olan <span className="text-white italic">"Finansal Özgürlük"</span> için gereken vites değişimini simüle edin. Eğer portföyünüzde bu hisseden <span className="text-white font-black underline decoration-indigo-500/50 decoration-2">1.000 adet (lot)</span> bulunsaydı, ne kadarlık bir brüt nakit akışınız olurdu?
                    </p>
                    
                    <div className="flex flex-wrap gap-4">
                      <div className="bg-white/5 border border-white/10 px-5 py-3 rounded-2xl backdrop-blur-md flex items-center gap-4 group/logic">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover/logic:bg-indigo-500/20 group-hover/logic:text-indigo-400 transition-colors">
                           <Calculator size={16} />
                        </div>
                        <div>
                          <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Hesaplama Standartı</div>
                          <div className="text-xs font-bold text-slate-300">
                            1000 <span className="text-[10px] text-slate-500 mx-1">×</span> {formatCurrency((data?.summary?.summaryDetail as any)?.forwardDividendRate || data?.summary?.summaryDetail?.dividendRate || 0, data?.symbol)} <span className="text-indigo-400 ml-1">(Hisse Başı Tahmini Temettü)</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-emerald-500/5 border border-emerald-500/10 px-5 py-3 rounded-2xl backdrop-blur-md flex items-center gap-4 group/logic">
                         <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                           <Lightbulb size={16} />
                        </div>
                        <div>
                          <div className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest mb-1">Neden 1.000 Adet?</div>
                          <div className="text-xs font-bold text-white italic">Projeksiyonun anlaşılabilir olması için sabit 1.000 lot temel alınmıştır.</div>
                        </div>
                      </div>
                    </div>
                  </div>

                    <div className="flex-shrink-0 text-center md:text-right relative z-10 flex flex-col items-center md:items-end scale-100">
                      <div className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-3 opacity-60">Yıllık Temettü Getirisi</div>
                      <div className="text-5xl md:text-7xl font-black text-emerald-400 italic tracking-tighter drop-shadow-2xl">
                        {formatCurrency(1000 * ((data?.summary?.summaryDetail as any)?.forwardDividendRate || data?.summary?.summaryDetail?.dividendRate || 0), data?.symbol)}
                      </div>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Projeksiyon Aktif
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      ) : (
          <div className="flex flex-col items-center justify-center py-40 space-y-8 text-center max-w-lg mx-auto">
             <div className="w-32 h-32 rounded-[48px] bg-slate-900 border border-white/5 flex items-center justify-center shadow-3xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-indigo-600/30 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
              <Briefcase className="text-indigo-500 w-12 h-12 relative z-10" />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">Radarına Ekle</h2>
              <p className="text-slate-500 leading-relaxed font-medium text-lg">
                Dünya borsalarından verim odaklı hisseleri anlık takip edin, temettü projeksiyonlarınızı oluşturun ve yatırım stratejinizi güçlendirin.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {['AAPL', 'KO', 'SCHD', 'FROTO.IS', 'EREGL.IS'].map(sym => (
                <button 
                  key={sym}
                  onClick={() => {
                    setSelectedSymbol(sym);
                    fetchData(sym);
                  }}
                  className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-all border border-white/5"
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        )}
        {!data && !loading && !error && (
          <div className="mt-20 pt-20 border-t border-white/5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
              <div className="space-y-4">
                <h4 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em]">Temettü Dağıtımı Nedir?</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  <strong>Temettü dağıtımı</strong>, bir şirketin elde ettiği kârın bir kısmını ortaklarına nakit veya hisse senedi olarak paylaştırmasıdır. 
                  Yatırımcılar için pasif gelir kaynağı oluşturan bu süreç, şirketin finansal gücünü ve sürdürülebilirliğini temsil eder.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em]">Temettü Dağıtan Hisseler 2026</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Borsa İstanbul (BIST) ve global piyasalarda <strong>temettü dağıtan hisseler</strong>, portföy çeşitlendirmesinde kritik rol oynar. 
                  Karlısın üzerinde <strong>2026 temettü takvimi</strong> ile yaklaşan ödemeleri takip edebilir, 12 aylık projeksiyonlarla gelecekteki temettü gelirinizi hesaplayabilirsiniz.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em]">Unified Data & Tahminler</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Uygulamamız, <strong>temettü veren şirketler</strong> için sadece geçmiş verileri değil, Unified Data Engine sayesinde analistlerin 12 aylık hedef fiyat ve <strong>temettü verimi</strong> tahminlerini de sunar. 
                  Akıllı filtreleme ile en yüksek verime sahip şirketleri saniyeler içinde analiz edin.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {isInformationModalOpen && data && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInformationModalOpen(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-6xl h-[85vh] bg-slate-950 border border-white/10 rounded-[40px] shadow-[0_0_100px_rgba(79,70,229,0.15)] overflow-hidden flex flex-col"
            >
               {/* Modal Header */}
               <div className="px-10 py-8 border-b border-white/5 bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                 <div className="flex items-center gap-5">
                   <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-xl">
                     <TrendingUp className="text-indigo-400 w-8 h-8" />
                   </div>
                   <div>
                     <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none mb-1">
                       {activeTab === 'overview' ? 'ŞİRKET PROFİLİ' : 'ÖDEME GEÇMİŞİ'}
                     </h3>
                     <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">
                       {activeTab === 'overview' ? `${data?.symbol} HAKKINDA DETAYLI BİLGİ` : `${data?.symbol} DİVİDEND VERİLERİ`}
                     </p>
                   </div>
                 </div>

                 <button 
                  onClick={() => setIsInformationModalOpen(false)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black text-white transition-all uppercase tracking-widest border border-white/10"
                 >
                   KAPAT
                 </button>
               </div>

               {/* Modal Body */}
               <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
                 <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="max-w-4xl mx-auto"
                      >
                          <div className="bg-slate-900/50 border border-white/5 rounded-[40px] p-12 shadow-xl overflow-hidden relative font-sans">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] rounded-full -mr-20 -mt-20" />
                            <div className="relative z-10 space-y-8">
                              <p className="text-slate-300 leading-relaxed font-medium text-xl whitespace-pre-wrap">
                                {avData?.Description || data?.summary?.assetProfile?.longBusinessSummary || 'Bu şirket için detaylı profil özeti şu an mevcut değil.'}
                              </p>

                              <div className="pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 bg-slate-950/30 rounded-3xl border border-white/5">
                                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2">Varlık Sektörü</span>
                                  <span className="text-lg font-black text-white italic uppercase tracking-tight">
                                    {data?.summary?.summaryDetail?.sector || avData?.Sector || 'Belirlenmedi'}
                                  </span>
                                </div>
                                <div className="p-6 bg-slate-950/30 rounded-3xl border border-white/5">
                                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2">Endüstri / Sınıf</span>
                                  <span className="text-lg font-black text-white italic uppercase tracking-tight">
                                    {data?.summary?.summaryDetail?.industry || avData?.Industry || 'Belirlenmedi'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                      </motion.div>
                    )}

                    {activeTab === 'history' && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                      >
                        {data?.history && data.history.length > 0 ? (
                          Object.entries(
                            data.history.sort((a,b) => (b.date || 0) - (a.date || 0)).reduce((acc, item) => {
                              const year = item.date ? new Date(item.date * 1000).getFullYear() : 0;
                              if (!acc[year]) acc[year] = [];
                              acc[year].push(item);
                              return acc;
                            }, {} as Record<number, typeof data.history>)
                          ).sort((a, b) => Number(b[0]) - Number(a[0])).map(([year, items]) => (
                            <div key={year} className="bg-slate-900 border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
                              <div className="px-8 py-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                <h3 className="text-xl font-black text-white italic tracking-tighter">{year} ÖDEME GEÇMİŞİ</h3>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-950 px-3 py-1 rounded-lg border border-white/10">
                                  {items.length} ÖDEME
                                </span>
                              </div>
                              <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                  <tbody className="divide-y divide-white/5">
                                    {items.map((item, idx) => (
                                      <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-8 py-5">
                                          <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white/5 flex flex-col items-center justify-center border border-white/5">
                                              <span className="text-[9px] font-black text-slate-500 uppercase">
                                                {(() => {
                                                  const d = new Date(item.date * 1000);
                                                  return isNaN(d.getTime()) ? '-' : d.toLocaleString('tr-TR', { month: 'short' });
                                                })()}
                                              </span>
                                              <span className="text-lg font-black text-white leading-none">
                                                {(() => {
                                                  const d = new Date(item.date * 1000);
                                                  return isNaN(d.getTime()) ? '-' : d.getDate();
                                                })()}
                                              </span>
                                            </div>
                                            <div>
                                              <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-0.5">Ödeme Tarihi</div>
                                              <div className="text-sm font-bold text-white">{formatDate(item.date * 1000)}</div>
                                            </div>
                                          </div>
                                        </td>
                                        <td className="px-8 py-5">
                                          <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-0.5">Lot Başına Net</div>
                                          <div className="text-xl font-black text-emerald-400 tracking-tighter">
                                            {formatCurrency(item.amount, data?.symbol)}
                                          </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                          <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase rounded-xl border border-emerald-500/20 tracking-widest">KESİNLEŞTİ</span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="bg-slate-900 border border-white/5 rounded-[32px] p-20 text-center">
                            <HistoryIcon className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                            <p className="text-slate-500 font-black uppercase text-xs tracking-[0.2em] italic">Bu sembol için geçmiş veri bulunamadı.</p>
                          </div>
                        )}
                      </motion.div>
                    )}

                 </AnimatePresence>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCalculatorModalOpen && data && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCalculatorModalOpen(false)}
              className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-6xl h-full max-h-[95vh] bg-slate-950 border border-white/10 rounded-[32px] md:rounded-[48px] shadow-[0_0_150px_rgba(16,185,129,0.15)] flex flex-col overflow-hidden"
            >
                {/* Modal Header */}
                <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-slate-900/40 shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-inner">
                      <DollarSign className="text-emerald-400 w-5 h-5 md:w-7 md:h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl md:text-3xl font-black text-white italic truncate max-w-[150px] md:max-w-none uppercase tracking-tighter leading-none mb-1">
                        {data?.symbol} <span className="text-slate-600">Simülatörü</span>
                      </h3>
                      <p className="text-[8px] md:text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Yatırım ve Temettü Projeksiyonu</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsCalculatorModalOpen(false)}
                    className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black text-white transition-all uppercase tracking-widest border border-white/10 active:scale-95"
                  >
                    KAPAT
                  </button>
                </div>

                {/* Modal Content - Scrollable area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-950">
                    <TahminMotoru 
                      symbol={data?.symbol}
                      dividendYield={getVal(data?.summary?.summaryDetail?.dividendYield) || 0}
                      dividendRate={getVal(data?.summary?.summaryDetail?.dividendRate) || 0}
                      formatCurrency={formatCurrency}
                      formatPercent={formatPercent}
                    />
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer Branding */}
      <footer className="max-w-7xl mx-auto px-4 py-16 space-y-12">
        {/* Quality Seal & Data Transparency */}
        <div className="bg-slate-950/40 border-2 border-white/5 rounded-[40px] p-10 backdrop-blur-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-400">
                <Info className="w-5 h-5" />
                <h5 className="text-[12px] font-black uppercase tracking-[0.2em]">Yasal Bilgilendirme</h5>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Karlısın tarafından sunulan temettü verileri, analizler ve hesaplamalar yalnızca bilgi amaçlıdır. 
                <span className="text-white font-bold mx-1">ASLA YATIRIM TAVSİYESİ DEĞİLDİR.</span> 
                Portföy yönetimi ve alım-satım kararlarınızı kendi risk analiziniz çerçevesinde vermelisiniz.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <TrendingUp className="w-5 h-5" />
                <h5 className="text-[12px] font-black uppercase tracking-[0.2em]">Veri Kaynakları</h5>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Sistemimiz global veriler için <span className="text-white">Alpha Vantage Pro</span>, yerel piyasalar için 
                <span className="text-white"> Borsa İstanbul (BİST)</span> yayın akışları ve <span className="text-white">Foreks Bilgi Havuzu</span> 
                ile entegre çalışmaktadır.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-amber-400">
                <Briefcase className="w-5 h-5" />
                <h5 className="text-[12px] font-black uppercase tracking-[0.2em]">Hata Payı</h5>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Şirketlerin temettü politikalarındaki ani değişiklikler veya KAP bildirimlerindeki güncellemeler sisteme 
                gecikmeli yansıyabilir. Kesin bilgi için MKK ve KAP platformlarını ziyaret ediniz.
              </p>
            </div>
          </div>
        </div>


      </footer>

      {/* Sticky Legal Disclaimer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-slate-950/80 backdrop-blur-xl border-t border-white/5 pointer-events-none md:pointer-events-auto">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full">
            <AlertTriangle className="w-3 h-3 text-rose-500" />
            <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest">YASAL UYARI</span>
          </div>
          <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-wider text-center">
            BURADAKİ ANALİZLER <span className="text-white">REHBER NİTELİĞİNDEDİR</span> VE YATIRIM TAVSİYESİ DEĞİLDİR. 
            VERİLER GECİKMELİ OLABİLİR. FİNANSAL ADIMLARINIZI KENDİ STRATEJİNİZE GÖRE BELİRLEYİN.
          </p>
        </div>
      </div>
      <AnimatePresence>
        {showAllDividends && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAllDividends(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[40px] shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
            >
              <div className="p-10 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Tüm Takvim</h3>
                  <p className="text-slate-500 text-sm font-medium">Aylara göre yaklaşan temettü ödemeleri</p>
                </div>
                <button 
                  onClick={() => setShowAllDividends(false)}
                  className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-white rotate-90 md:rotate-0" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-12">
                {Object.entries(groupedDividends).map(([month, items]) => (
                  <div key={month} className="space-y-4">
                    <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] pl-2">{month}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {items.map((item) => (
                        <button
                          key={item.symbol + item.date}
                          onClick={() => {
                            setSelectedSymbol(item.symbol);
                            fetchData(item.symbol);
                            setShowAllDividends(false);
                          }}
                          className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all text-left"
                        >
                          <div>
                            <div className="text-sm font-black text-white">{item.symbol}</div>
                            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{item.name}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-black text-emerald-500">{item.yield}</div>
                            <div className="text-[9px] text-slate-600 font-medium">{item.date.split('-')[2]} {month.split(' ')[0]}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DividendTracker;
