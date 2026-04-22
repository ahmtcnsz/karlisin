import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bolt, ChevronDown, Verified, Timer, BarChart3, Smartphone, RefreshCw, Shield, ArrowUpRight, TrendingUp, AlertCircle, FileSpreadsheet, Percent, Info, Calculator, Truck, Wrench, MessageSquare, X, Mail, Send } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function Home() {
  const [market, setMarket] = useState('Trendyol');
  const [activeTab, setActiveTab] = useState<'profit' | 'target'>('profit');
  const [salePrice, setSalePrice] = useState('');
  const [shipping, setShipping] = useState('');
  const [cost, setCost] = useState('');
  const [targetProfit, setTargetProfit] = useState('');
  const [taxRate, setTaxRate] = useState('20');
  const [showResult, setShowResult] = useState(false);
  const [isScoreOpen, setIsScoreOpen] = useState(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);

  useEffect(() => {
    // Show welcome modal on mount if not shown in this session
    const hasShownWelcome = sessionStorage.getItem('hasShownWelcome');
    if (!hasShownWelcome) {
      const timer = setTimeout(() => {
        setIsWelcomeOpen(true);
        sessionStorage.setItem('hasShownWelcome', 'true');
      }, 500);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, []);
  const [result, setResult] = useState({
    profit: 0,
    margin: 0,
    fees: 0,
    score: 0,
    breakdown: {
      commission: 0,
      shipping: 0,
      tax: 0,
      service: 0,
      product: 0
    },
    scores: {
      margin: 0,
      commission: 0,
      burden: 0
    },
    requiredSalePrice: 0
  });

  const marketRates: Record<string, number> = {
    'Trendyol': 20,
    'Hepsiburada': 18,
    'Amazon TR': 15,
    'N11': 15
  };

  const getMarginCategory = (margin: number) => {
    if (margin >= 25) return { label: 'GÜÇLÜ', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', desc: 'Bu ürünü piyasaya sürmeye hazırsınız. Rakamlar olumlu.' };
    if (margin >= 10) return { label: 'ORTA', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', desc: 'Karlılık sınırda. Maliyetleri optimize etmeyi düşünün.' };
    return { label: 'RİSKLİ', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', desc: 'Bu satıştan zarar etme ihtimaliniz yüksek. Stratejinizi gözden geçirin.' };
  };

  useEffect(() => {
    const s = parseFloat(salePrice) || 0;
    const sh = parseFloat(shipping) || 0;
    const c = parseFloat(cost) || 0;
    const tp = parseFloat(targetProfit) || 0;
    const commOran = marketRates[market];
    const taxOran = parseFloat(taxRate) || 0;
    
    const commRatio = commOran / 100;
    const taxRatio = taxOran / (100 + taxOran);
    const serviceFee = market === 'Trendyol' ? 15 : 0;

    if (activeTab === 'profit') {
      if (s > 0 || c > 0 || sh > 0) {
        const commissionFee = s * commRatio;
        const taxAmount = s * taxRatio; 
        
        const totalFees = commissionFee + sh + serviceFee + taxAmount;
        const profit = s - totalFees - c;
        const margin = (profit / s) * 100;

        // Score Calculation Logic
        const marginScore = Math.min(Math.max((margin / 40) * 10, 0), 10);
        const commScore = Math.min(Math.max(((30 - commOran) / 20) * 10, 0), 10);
        const burdenRatio = (totalFees + c) / s;
        const burdenScore = Math.min(Math.max((1 - burdenRatio) * 15, 0), 10);
        
        const finalScore = (marginScore * 0.5) + (commScore * 0.25) + (burdenScore * 0.25);

        setResult(prev => ({
          ...prev,
          profit: parseFloat(profit.toFixed(2)),
          margin: parseFloat(margin.toFixed(2)),
          fees: parseFloat(totalFees.toFixed(2)),
          score: parseFloat(finalScore.toFixed(1)),
          breakdown: {
            commission: parseFloat(commissionFee.toFixed(2)),
            shipping: parseFloat(sh.toFixed(2)),
            tax: parseFloat(taxAmount.toFixed(2)),
            service: parseFloat(serviceFee.toFixed(2)),
            product: parseFloat(c.toFixed(2))
          },
          scores: {
            margin: parseFloat(marginScore.toFixed(1)),
            commission: parseFloat(commScore.toFixed(1)),
            burden: parseFloat(burdenScore.toFixed(1))
          }
        }));
        setShowResult(true);
      } else {
        setShowResult(false);
      }
    } else {
      // "Kaça Satmalıyım?" logic
      const denominator = 1 - commRatio - taxRatio;
      
      if (denominator > 0 && (targetProfit !== '' || cost !== '' || shipping !== '')) {
        const reqSalePrice = (tp + sh + serviceFee + c) / denominator;
        const commissionFee = reqSalePrice * commRatio;
        const taxAmount = reqSalePrice * taxRatio;
        const totalFees = commissionFee + sh + serviceFee + taxAmount;
        const margin = reqSalePrice > 0 ? (tp / reqSalePrice) * 100 : 0;

        setResult(prev => ({
          ...prev,
          requiredSalePrice: parseFloat(reqSalePrice.toFixed(2)),
          profit: tp,
          margin: parseFloat(margin.toFixed(2)),
          fees: parseFloat(totalFees.toFixed(2)),
          breakdown: {
            commission: parseFloat(commissionFee.toFixed(2)),
            shipping: parseFloat(sh.toFixed(2)),
            tax: parseFloat(taxAmount.toFixed(2)),
            service: parseFloat(serviceFee.toFixed(2)),
            product: parseFloat(c.toFixed(2))
          }
        }));
        setShowResult(true);
      } else {
        setShowResult(false);
      }
    }
  }, [market, salePrice, shipping, cost, taxRate, targetProfit, activeTab]);

  const exportToExcel = () => {
    const data = [
      { Parametre: 'Mod', Değer: activeTab === 'profit' ? 'Kâr Hesapla' : 'Kaça Satmalıyım?' },
      { Parametre: 'Market', Değer: market },
      { Parametre: activeTab === 'profit' ? 'Satış Fiyatı' : 'Hedef Kâr Tutarı', Değer: `₺${activeTab === 'profit' ? salePrice : targetProfit}` },
      { Parametre: 'Kargo Maliyeti', Değer: `₺${shipping}` },
      { Parametre: 'Ürün Maliyeti', Değer: `₺${cost}` },
      { Parametre: 'Komisyon (%)', Değer: `%${marketRates[market]}` },
      { Parametre: 'KDV Oranı (%)', Değer: `%${taxRate}` },
      { Parametre: '', Değer: '' },
      { Parametre: 'GİDER DAĞILIMI', Değer: '' },
      { Parametre: 'Komisyon Tutarı', Değer: `₺${result.breakdown.commission}` },
      { Parametre: 'Kargo Tutarı', Değer: `₺${result.breakdown.shipping}` },
      { Parametre: 'KDV Tutarı', Değer: `₺${result.breakdown.tax}` },
      { Parametre: 'Hizmet Bedeli', Değer: `₺${result.breakdown.service}` },
      { Parametre: 'Ürün Maliyeti', Değer: `₺${result.breakdown.product}` },
      { Parametre: '', Değer: '' },
      { Parametre: 'ÖZET', Değer: '' },
      { Parametre: 'Toplam Giderler', Değer: `₺${result.fees}` },
      { Parametre: activeTab === 'profit' ? 'Net Kâr' : 'Önerilen Satış Fiyatı', Değer: `₺${activeTab === 'profit' ? result.profit : result.requiredSalePrice}` },
      { Parametre: 'Kâr Marjı', Değer: `%${result.margin}` },
      { Parametre: 'Durum', Değer: getMarginCategory(result.margin).label }
    ];

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Hesaplama Sonucu');
    XLSX.writeFile(wb, `Karlısın_${market}_Hesaplama.xlsx`);
  };

  const marginCat = getMarginCategory(result.margin);

  return (
    <div className="flex-grow">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 text-indigo-300 rounded-full text-xs font-semibold mb-6 border border-white/10 backdrop-blur-md"
          >
            <Bolt size={16} />
            <span>Hızlı ve Hassas Hesaplama</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-7xl font-black text-white mb-6 max-w-4xl mx-auto leading-[1.1] tracking-tighter text-center flex flex-col items-center justify-center px-4"
          >
            {activeTab === 'profit' ? (
              <>
                <span>Net kârını</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 italic px-2 pb-1">5 saniyede hesapla</span>
              </>
            ) : (
              <>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 italic px-2 pb-1">Kaça Satmalıyım?</span>
                <span>diye düşünme</span>
              </>
            )}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto mb-12 font-medium"
          >
            Pazaryeri komisyonları, kargo maliyetleri ve ürün maliyeti sonrası cebine ne kalacağını anında öğrenin.
          </motion.p>

          {/* Calculator Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-[850px] mx-auto bg-white/5 backdrop-blur-2xl rounded-[32px] shadow-2xl shadow-black/50 overflow-hidden border border-white/10 relative"
          >
            {/* Tabs */}
            <div className="flex border-b border-white/10">
              <button
                onClick={() => setActiveTab('profit')}
                className={`flex-1 py-4 flex items-center justify-center gap-2 transition-all font-black tracking-wider md:tracking-widest text-[10px] sm:text-xs ${
                  activeTab === 'profit' 
                    ? 'bg-white/10 text-indigo-400 border-b-2 border-indigo-500' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                <Calculator size={16} />
                KÂR HESAPLA
              </button>
              <button
                onClick={() => setActiveTab('target')}
                className={`flex-1 py-4 flex items-center justify-center gap-2 transition-all font-black tracking-wider md:tracking-widest text-[10px] sm:text-xs ${
                  activeTab === 'target' 
                    ? 'bg-white/10 text-indigo-400 border-b-2 border-indigo-500' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                <ArrowUpRight size={16} />
                KAÇA SATMALIYIM?
              </button>
            </div>

            <div className="p-8 md:p-10 flex flex-col gap-10">
              {/* Group 1: Maliyet Dağılımı (Inputs) */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                  <BarChart3 size={18} className="text-indigo-400" />
                  <h2 className="text-sm font-black text-white tracking-widest">MALİYET DAĞILIMI</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-500 tracking-widest ml-1">MARKET</label>
                    <div className="relative">
                      <select 
                        value={market}
                        onChange={(e) => setMarket(e.target.value)}
                        className="w-full h-12 bg-white/10 border border-white/10 rounded-xl px-4 appearance-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all cursor-pointer font-bold text-white font-mono"
                      >
                        <option className="bg-slate-900 font-bold" value="Trendyol">Trendyol</option>
                        <option className="bg-slate-900 font-bold" value="Hepsiburada">Hepsiburada</option>
                        <option className="bg-slate-900 font-bold" value="Amazon TR">Amazon TR</option>
                        <option className="bg-slate-900 font-bold" value="N11">N11</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" size={20} />
                    </div>
                    <AnimatePresence>
                      {market === 'Trendyol' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-2 flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-2.5 md:whitespace-nowrap w-full md:w-fit"
                        >
                          <Info size={14} className="text-indigo-400 shrink-0" />
                          <p className="text-[10px] font-bold text-indigo-200/90 leading-tight md:leading-none">
                            Ürün hizmet bedeli için <span className="text-white">₺15</span> uygulanır. Bu tutar net kardan düşülür.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-500 tracking-widest ml-1">KOMİSYON (%)</label>
                    <div className="relative group cursor-not-allowed">
                      <div className="w-full h-12 bg-white/5 border border-white/5 rounded-xl px-4 flex items-center font-black text-indigo-400/80 bg-slate-950/20">
                        %{marketRates[market]}
                      </div>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600">
                        <Shield size={16} />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-500 tracking-widest ml-1">KDV KATEGORİSİ</label>
                    <div className="relative">
                      <select 
                        value={taxRate}
                        onChange={(e) => setTaxRate(e.target.value)}
                        className="w-full h-12 bg-white/10 border border-white/10 rounded-xl px-2.5 outline-none font-black text-white appearance-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                      >
                        <option className="bg-slate-900 font-bold" value="20">%20 - Standart</option>
                        <option className="bg-slate-900 font-bold" value="10">%10 - Gıda / Tekstil</option>
                        <option className="bg-slate-900 font-bold" value="1">%1 - Temel Gıda</option>
                        <option className="bg-slate-900 font-bold" value="0">%0 - Muaf</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" size={20} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-500 tracking-widest ml-1">
                      {activeTab === 'profit' ? 'SATIŞ FİYATI (TL)' : 'ÜRÜN MALİYETİ (TL)'}
                    </label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={activeTab === 'profit' ? salePrice : cost}
                        onChange={(e) => activeTab === 'profit' ? setSalePrice(e.target.value) : setCost(e.target.value)}
                        className="w-full h-12 bg-white/10 border border-white/10 rounded-xl px-4 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-black text-white" 
                        placeholder="0.00"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₺</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-500 tracking-widest ml-1">KARGO MALİYETİ (TL)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={shipping}
                        onChange={(e) => setShipping(e.target.value)}
                        className="w-full h-12 bg-white/10 border border-white/10 rounded-xl px-4 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-black text-white" 
                        placeholder="0.00"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₺</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-500 tracking-widest ml-1">
                      {activeTab === 'profit' ? 'ÜRÜN MALİYETİ (TL)' : 'HEDEF KÂR TUTARI (TL)'}
                    </label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={activeTab === 'profit' ? cost : targetProfit}
                        onChange={(e) => activeTab === 'profit' ? setCost(e.target.value) : setTargetProfit(e.target.value)}
                        className="w-full h-12 bg-white/10 border border-white/10 rounded-xl px-4 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-black text-white" 
                        placeholder="0.00"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₺</span>
                    </div>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {showResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: 10, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 gap-8 pt-6 border-t border-white/10">
                      
                      {/* Summary Section Header */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4">
                        <h4 className="text-[10px] font-black text-slate-500 tracking-widest">HIZLI ÖZET TABLOSU</h4>
                        <button 
                          onClick={exportToExcel}
                          className="flex items-center gap-2 text-[10px] font-black text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 w-fit"
                        >
                          <FileSpreadsheet size={14} />
                          EXCEL İNDİR
                        </button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                          <span className="text-[10px] font-black text-slate-500 tracking-widest mb-1 block">
                            {activeTab === 'profit' ? 'NET KÂR' : 'ÖNERİLEN SATIŞ'}
                          </span>
                          <div className={`text-lg sm:text-xl font-black ${activeTab === 'profit' ? (result.profit >= 0 ? 'text-emerald-400' : 'text-rose-400') : 'text-indigo-400'}`}>
                            ₺{activeTab === 'profit' ? result.profit : result.requiredSalePrice}
                          </div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                          <span className="text-[10px] font-black text-slate-500 tracking-widest mb-1 block">KÂR MARJI</span>
                          <div className={`text-lg sm:text-xl font-black ${result.margin >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
                            %{result.margin}
                          </div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                          <span className="text-[10px] font-black text-slate-500 tracking-widest mb-1 block">TOPLAM GİDER</span>
                          <div className="text-lg sm:text-xl font-black text-white/80 tracking-tight">
                            ₺{result.fees}
                          </div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex flex-col justify-center">
                          <span className="text-[10px] font-black text-slate-500 tracking-widest mb-1 block">PAZARYERİ</span>
                          <div className="text-sm font-black text-slate-300 flex items-center gap-1.5">
                            <Smartphone size={14} className="text-indigo-400" />
                            {market.toLocaleUpperCase('tr-TR')}
                          </div>
                        </div>
                      </div>

                      {/* Detailed Breakdown (Results) */}
                      <div className="bg-white/5 rounded-[24px] border border-white/10 overflow-hidden shadow-inner">
                        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                          <h3 className="text-xs font-black text-white tracking-widest flex items-center gap-2">
                             <Calculator size={14} className="text-indigo-400" />
                             GİDER DAĞILIMI GRAFİĞİ
                          </h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {[
                            { label: 'KOMİSYON', value: result.breakdown.commission, icon: <Percent size={14} /> },
                            { label: 'KARGO', value: result.breakdown.shipping, icon: <Timer size={14} /> },
                            { label: 'KDV', value: result.breakdown.tax, icon: <Shield size={14} /> },
                            { label: 'HİZMET BEDELİ', value: result.breakdown.service, icon: <AlertCircle size={14} /> },
                            { label: 'ÜRÜN MALİYETİ', value: result.breakdown.product, icon: <Info size={14} /> },
                          ].map((item, idx) => (
                            <div key={idx} className="flex flex-col gap-1">
                              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                                <span className="flex items-center gap-1">{item.icon} {item.label}</span>
                                <span>₺{item.value}</span>
                              </div>
                              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min((item.value / (activeTab === 'profit' ? parseFloat(salePrice || '1') : result.requiredSalePrice)) * 100, 100)}%` }}
                                  className="h-full bg-indigo-500/40 rounded-full"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Analysis Header Card */}
                      <div className="flex flex-col gap-6 mt-4 pt-8 border-t border-white/10">
                        <h4 className="text-[10px] font-black text-slate-500 tracking-widest">AI DESTEKLİ KARAR ANALİZİ</h4>
                        <div className={`p-6 ${marginCat.bg} rounded-3xl border ${marginCat.border} relative overflow-hidden backdrop-blur-xl transition-all duration-500`}>
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
                            <div className="flex gap-4 items-center">
                              <div className={`w-12 h-12 rounded-full ${marginCat.bg} border ${marginCat.border} flex items-center justify-center shrink-0`}>
                                <div className={`w-3 h-3 rounded-full ${marginCat.color.replace('text', 'bg')} shadow-[0_0_15px_rgba(0,0,0,0.5)]`} />
                              </div>
                              <div>
                                <h3 className={`text-xl font-black ${marginCat.color} tracking-tight`}>{marginCat.label} Satış</h3>
                                <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1">{marginCat.desc}</p>
                              </div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-3 py-2 flex flex-col items-center min-w-[70px] self-end sm:self-center">
                              <span className={`text-2xl font-black ${marginCat.color}`}>{result.score}</span>
                              <span className="text-[10px] text-slate-500 font-black">/ 10</span>
                            </div>
                          </div>
                        </div>

                        {/* Profitability Score Bar */}
                        <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-black text-slate-500 tracking-widest">KARLILIK SKORU</span>
                            <span className={`text-xs font-black ${marginCat.color}`}>Güçlü</span>
                          </div>
                          <div className="grid grid-cols-10 gap-1.5 h-3">
                            {Array.from({ length: 10 }).map((_, i) => (
                              <motion.div 
                                key={i}
                                initial={{ opacity: 0, scaleX: 0 }}
                                animate={{ 
                                  opacity: 1, 
                                  scaleX: 1,
                                  backgroundColor: i < Math.round(result.score) ? (result.score > 7 ? '#10b981' : result.score > 4 ? '#f59e0b' : '#ef4444') : 'rgba(255,255,255,0.05)'
                                }}
                                transition={{ delay: i * 0.05 }}
                                className="rounded-full origin-left"
                              />
                            ))}
                          </div>
                          <div className="flex justify-between mt-2 text-[9px] font-black text-slate-600 tracking-widest">
                            <span>ZARAR</span>
                            <span>RİSKLİ</span>
                            <span>KARLI</span>
                          </div>
                        </div>

                        {/* Insights List */}
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-slate-500 tracking-widest flex items-center gap-2">
                            <TrendingUp size={14} className="text-indigo-400" /> RAKAMLAR NE SÖYLÜYOR?
                          </h4>
                          
                          <div className="grid grid-cols-1 gap-3">
                            <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex items-center gap-4 group hover:bg-emerald-500/10 transition-colors">
                              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                <TrendingUp size={20} />
                              </div>
                              <div className="flex-grow">
                                <p className="text-sm font-black text-white">{marginCat.label.toLocaleUpperCase('tr-TR')} KÂR MARJI — %{result.margin}</p>
                                <p className="text-xs font-medium text-slate-400">Rakiplerine göre aralıksız</p>
                              </div>
                            </div>

                            <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex items-center gap-4 group hover:bg-indigo-500/10 transition-colors">
                              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                <Truck size={20} />
                              </div>
                              <div className="flex-grow">
                                <p className="text-sm font-black text-white">Kargo maliyeti {result.breakdown.shipping > 0 ? `₺${result.breakdown.shipping}` : 'girilmemiş'}</p>
                                <p className="text-xs font-medium text-slate-400">{result.breakdown.shipping > 0 ? 'Lojistik yükü optimize edilebilir.' : 'Gerçekçi analiz için kargo ücretini ekle.'}</p>
                              </div>
                            </div>

                            <div className="p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10 flex items-center gap-4 group hover:bg-purple-500/10 transition-colors">
                              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                <Shield size={20} />
                              </div>
                              <div className="flex-grow">
                                <p className="text-sm font-black text-white">KDV (%{taxRate}) fiyatı %{((result.breakdown.tax / (parseFloat(salePrice) || 1)) * 100).toFixed(1)}'ini alıyor</p>
                                <p className="text-xs font-medium text-slate-400">Fiyata dahil KDV hesaplandı</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Suggestions List */}
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-slate-500 tracking-widest flex items-center gap-2">
                             IŞIK TUT: NE YAP?
                          </h4>
                          
                        <div className="space-y-2">
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between group transition-all">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                              <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">
                                {result.margin > 20 ? 'Bu ürün karlı — stok veya reklam bütçesini artırmayı düşün' : 'Karlılığı artırmak için maliyet kalemlerini gözden geçir'}
                              </span>
                            </div>
                            <span className="text-[9px] font-black text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded tracking-tighter">FIRSAT</span>
                          </div>

                          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between group transition-all">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8]" />
                              <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">Farklı platformlarda fiyat rekabetini karşılaştırın</span>
                            </div>
                            <span className="text-[9px] font-black text-indigo-400 uppercase bg-indigo-500/10 px-2 py-0.5 rounded tracking-tighter">FIRSAT</span>
                          </div>
                        </div>
                        </div>

                        {/* Score Detail Accordion */}
                        <div className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden">
                          <button 
                            onClick={() => setIsScoreOpen(!isScoreOpen)}
                            className="w-full px-6 py-4 flex justify-between items-center hover:bg-white/5 transition-colors"
                          >
                            <div className="flex items-center gap-2 text-indigo-300">
                              <BarChart3 size={16} />
                              <span className="text-xs font-black tracking-widest">BU SKOR NASIL HESAPLANDI?</span>
                            </div>
                            <ChevronDown className={`text-slate-500 transition-transform duration-300 ${isScoreOpen ? 'rotate-180' : ''}`} size={18} />
                          </button>
                          
                          <AnimatePresence>
                            {isScoreOpen && (
                              <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                exit={{ height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="px-6 pb-6 pt-2 space-y-6">
                                  <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-[11px] font-medium text-slate-400 leading-relaxed italic">
                                    Skor = Kar Marjı (%50) + Komisyon Etkisi (%25) + Maliyet Yükü (%25) formülüyle hesaplanır. Her oyuncuya 0-10 arasında puan verilir.
                                  </div>

                                  <div className="space-y-6">
                                    <div className="space-y-2">
                                      <div className="flex justify-between items-end">
                                        <div className="flex flex-col">
                                          <span className="text-sm font-black text-white">Kar Marjı</span>
                                          <span className="text-[10px] text-slate-500 font-bold">%{result.margin} kar marjı — toplam skorun %50'sini etkiler</span>
                                        </div>
                                        <span className="text-sm font-black text-emerald-400">{result.scores.margin} / 10</span>
                                      </div>
                                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${result.scores.margin * 10}%` }} className="h-full bg-emerald-500/60 rounded-full" />
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <div className="flex justify-between items-end">
                                        <div className="flex flex-col">
                                          <span className="text-sm font-black text-white">Komisyon Etkisi</span>
                                          <span className="text-[10px] text-slate-500 font-bold">%{marketRates[market]} komisyon — toplam skorun %25'ini etkiler</span>
                                        </div>
                                        <span className="text-sm font-black text-amber-400">{result.scores.commission} / 10</span>
                                      </div>
                                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${result.scores.commission * 10}%` }} className="h-full bg-amber-500/60 rounded-full" />
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <div className="flex justify-between items-end">
                                        <div className="flex flex-col">
                                          <span className="text-sm font-black text-white">Maliyet Yükü</span>
                                          <span className="text-[10px] text-slate-500 font-bold">Kargo + maliyet + KDV toplamı: satışın %{(((result.fees + (parseFloat(cost) || 0)) / (parseFloat(salePrice) || 1)) * 100).toFixed(1)}'i — %25 etkili</span>
                                        </div>
                                        <span className="text-sm font-black text-indigo-400">{result.scores.burden} / 10</span>
                                      </div>
                                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${result.scores.burden * 10}%` }} className="h-full bg-indigo-500/60 rounded-full" />
                                      </div>
                                    </div>

                                    <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex justify-between items-center group cursor-default">
                                      <span className="text-[11px] font-black text-indigo-300 uppercase tracking-widest">Toplam Karlılık Skoru</span>
                                      <span className="text-lg font-black text-indigo-200">{result.score} / 10</span>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-4 flex items-center justify-center gap-2 text-[10px] md:text-[11px] font-bold text-slate-500 border-t border-white/5 pt-6 text-center">
                <span>Türk e-ticaret satıcıları için ücretsiz kar hesaplama aracı</span>
                <span className="text-slate-700">•</span>
                <span>KDV oranları mevzuata göre değişebilir</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            className="md:col-span-2 bg-white/5 backdrop-blur-md rounded-[32px] p-8 border border-white/10 flex flex-col justify-between group overflow-hidden relative shadow-sm transition-all"
          >
            <div className="relative z-10 text-white">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 border border-white/10">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Detaylı Raporlama</h3>
              <p className="text-slate-400 font-medium">Sadece kârı değil, gider dağılımınızı pasta grafiği ile görün.</p>
            </div>
          </div>
          
          <div 
            className="bg-indigo-600/20 backdrop-blur-md rounded-[32px] p-8 test-white flex flex-col justify-between relative overflow-hidden shadow-sm border border-white/10 transition-all group"
          >
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-6 border border-white/20 group-hover:scale-110 transition-transform">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">AI Destekli Karar Analizi</h3>
              <p className="text-indigo-200 font-medium text-white/80">En çok satan kategorileri ve rekabet oranlarını analiz edin.</p>
            </div>
          </div>

          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Smartphone size={28} />, title: 'Mobil Uyumlu', desc: 'Yoldayken bile hesabını yap.', color: 'bg-indigo-500/10 text-indigo-400' },
              { icon: <RefreshCw size={28} />, title: 'Anlık Güncelleme', desc: 'Değişen mevzuat anında sistemde.', color: 'bg-purple-500/10 text-purple-400' },
              { icon: <Shield size={28} />, title: 'Güvenli Veri', desc: 'Verileriniz asla kaydedilmez.', color: 'bg-slate-500/10 text-slate-400' }
            ].map((feature, i) => (
              <div 
                key={i}
                className="bg-white/5 backdrop-blur-md rounded-[32px] p-8 border border-white/10 flex items-center gap-6 shadow-sm transition-all group"
              >
                <div className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center shrink-0 border border-white/10 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <div>
                  <h4 className="font-bold text-white transition-colors group-hover:text-indigo-300">{feature.title}</h4>
                  <p className="text-sm font-medium text-slate-400">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Welcome Modal */}
      <AnimatePresence>
        {isWelcomeOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWelcomeOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[40px] p-10 overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-600" />
              
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-8">
                  <Wrench size={36} strokeWidth={2.5} />
                </div>

                <h2 className="text-3xl font-black text-slate-900 mb-4 leading-tight">
                  Gelişmeye devam ediyoruz
                </h2>

                <p className="text-slate-600 font-medium leading-relaxed mb-10">
                  Karlisin'in yeni özelliklerini sizin için hazırlıyoruz. 
                  Daha akıllı, daha hızlı ve daha kapsamlı finansal araçlar çok yakında burada olacak.
                </p>

                <button 
                  onClick={() => setIsWelcomeOpen(false)}
                  className="w-full h-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-lg rounded-2xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  İnceleme yapacağım
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
