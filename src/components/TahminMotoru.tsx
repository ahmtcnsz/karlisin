import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Briefcase, AlertTriangle } from 'lucide-react';

interface TahminMotoruProps {
  symbol: string;
  dividendYield: number;
  dividendRate: number;
  formatCurrency: (val: any, symbol: string) => string;
  formatPercent: (val: any) => string;
}

const TahminMotoru: React.FC<TahminMotoruProps> = ({ 
  symbol, 
  dividendYield, 
  dividendRate,
  formatCurrency,
  formatPercent
}) => {
  const [shareCount, setShareCount] = useState<number>(1000);
  const [calculatedEarnings, setCalculatedEarnings] = useState<number>(0);

  useEffect(() => {
    setCalculatedEarnings(shareCount * dividendRate);
  }, [shareCount, dividendRate]);

  const requiredCapital = calculatedEarnings > 0 ? (calculatedEarnings / (dividendYield || 0.05)) : 0;

  return (
    <div className="bg-slate-950 p-4 md:p-8 min-h-full">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em]">Tahmin Motoru v2.0</span>
            </div>
            <h1 className="text-2xl md:text-5xl font-black text-white tracking-tighter italic uppercase leading-none">
              SİMÜLASYON <span className="text-slate-700">PANELİ</span>
            </h1>
          </div>
          <div className="flex flex-col items-start md:items-end bg-slate-900/50 p-4 rounded-2xl border border-white/5">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-2">Seçili Varlık</span>
            <span className="text-xl font-black text-white leading-none italic uppercase">{symbol}</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-slate-900/50 border border-white/5 rounded-[32px] p-6 md:p-8 space-y-8 relative overflow-hidden group">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl group-hover:bg-indigo-600/20 transition-colors" />
              
              <div className="relative z-10 space-y-6">
                <div className="space-y-1">
                  <h3 className="text-xs font-black text-white uppercase tracking-widest italic">Hedef Portföy</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Planladığınız lot miktarını girin.</p>
                </div>

                <div className="space-y-6">
                  <div className="relative">
                    <input 
                      type="number" 
                      value={shareCount}
                      onChange={(e) => setShareCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl py-4 md:py-5 px-6 text-2xl md:text-3xl font-black text-white focus:outline-none focus:border-indigo-500/50 transition-all font-mono"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-end">
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Lot</span>
                      <Briefcase className="w-4 h-4 text-indigo-500/50" />
                    </div>
                  </div>

                  <div className="px-2">
                    <input 
                      type="range" 
                      min="1" 
                      max="50000" 
                      step="100"
                      value={shareCount}
                      onChange={(e) => setShareCount(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-ew-resize accent-indigo-500"
                    />
                    <div className="flex justify-between mt-3 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                      <span>1 Lot</span>
                      <span>25K</span>
                      <span>50K</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pb-1">
                  <button 
                    onClick={() => setShareCount(c => Math.max(0, c - 500))}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest transition-all active:scale-95"
                  >
                    -500 LOT
                  </button>
                  <button 
                    onClick={() => setShareCount(c => c + 500)}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest transition-all active:scale-95"
                  >
                    +500 LOT
                  </button>
                </div>
              </div>
            </section>

            <div className="bg-amber-500/5 border border-amber-500/10 rounded-3xl p-5 flex items-start gap-4">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="text-[9px] font-black text-amber-500 uppercase tracking-widest leading-none">Vergi Bilgisi</h5>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                  BİST ödemelerinde %10 stopaj kesilir. Tutarlar <span className="text-white italic">brüttür</span>.
                </p>
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Main Result 1 */}
              <motion.div 
                layout
                className="col-span-1 md:col-span-2 p-8 rounded-[40px] bg-indigo-600 border border-white/20 shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <TrendingUp className="w-24 h-24 text-white" />
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/10 rounded-full border border-white/10">
                    <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
                    <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">Yıllık Brüt Getiri</span>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-widest leading-tight font-mono break-all sm:break-normal">
                      {formatCurrency(calculatedEarnings, symbol)}
                    </div>
                    <div className="text-xs font-black text-indigo-100 uppercase tracking-widest flex items-center gap-2">
                       Verim <span className="text-white px-1.5 py-0.5 bg-white/20 rounded-md">{formatPercent(dividendYield)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Monthly Breakout */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[32px] space-y-4">
                <div className="flex items-center gap-3">
                   <Briefcase className="w-4 h-4 text-emerald-400" />
                   <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Aylık Ortalama</span>
                </div>
                <div className="space-y-0.5">
                  <div className="text-2xl font-black text-white font-mono tracking-wider italic">
                    {formatCurrency(calculatedEarnings / 12, symbol)}
                  </div>
                  <p className="text-[9px] text-slate-500 font-medium uppercase tracking-widest">Nakit Akışı</p>
                </div>
              </div>

              {/* Capital Required */}
              <div className="bg-slate-900 border border-white/5 p-6 rounded-[32px] space-y-4">
                <div className="flex items-center gap-3">
                   <TrendingUp className="w-4 h-4 text-slate-400" />
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gerekli Sermaye</span>
                </div>
                <div className="space-y-0.5">
                  <div className="text-2xl font-black text-white font-mono tracking-wider italic">
                     {formatCurrency(requiredCapital, symbol)}
                  </div>
                  <p className="text-[9px] text-slate-500 font-medium uppercase tracking-widest">Tahmini Maliyet</p>
                </div>
              </div>
            </div>

            {/* Parameter Table */}
            <div className="bg-slate-900/50 border border-white/5 rounded-[28px] p-6 pb-2">
              <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 inline-block border-b-2 border-indigo-500 pb-0.5">Hesaplama Parametreleri</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1 pb-4">
                  <span className="text-[8px] font-black text-slate-600 uppercase block tracking-widest">Piyasa</span>
                  <span className="text-[11px] font-bold text-white uppercase">{symbol.includes('.IS') ? 'BİST' : 'Global'}</span>
                </div>
                <div className="space-y-1 pb-4">
                  <span className="text-[8px] font-black text-slate-600 uppercase block tracking-widest">Lot Dağıtım</span>
                  <span className="text-[11px] font-bold text-emerald-400 font-mono">{formatCurrency(dividendRate, symbol)}</span>
                </div>
                <div className="space-y-1 pb-4">
                   <span className="text-[8px] font-black text-slate-600 uppercase block tracking-widest">Verim Endeksi</span>
                   <span className="text-[11px] font-bold text-indigo-400 font-mono">{formatPercent(dividendYield)}</span>
                </div>
                <div className="space-y-1 pb-4">
                   <span className="text-[8px] font-black text-slate-600 uppercase block tracking-widest">Stopaj</span>
                   <span className="text-[11px] font-bold text-amber-500 uppercase">%{symbol.includes('.IS') ? '10' : '0'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TahminMotoru;
