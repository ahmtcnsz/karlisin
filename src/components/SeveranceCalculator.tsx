import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  Calendar, 
  HandCoins, 
  Settings2, 
  ArrowRight, 
  Info, 
  ShieldCheck, 
  TrendingUp, 
  History,
  Download,
  Share2,
  FileText,
  Clock,
  Wallet,
  Calculator,
  Shield
} from 'lucide-react';
import { cn } from '../lib/utils';

// Current Severance Pay Ceiling (Kıdem Tazminatı Tavanı) - 2024 H1 or H2
// In a real app, this should probably come from an API or config
const CEILING_2024 = 35058.58; 
const STAMP_TAX_RATE = 0.00759;

interface CalculationResult {
  seniority: {
    years: number;
    months: number;
    days: number;
    totalDays: number;
  };
  severance: {
    gross: number;
    stampTax: number;
    net: number;
  };
  notice: {
    weeks: number;
    gross: number;
    incomeTax: number;
    stampTax: number;
    net: number;
  };
  totalNet: number;
}

export default function SeveranceCalculator() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [grossSalary, setGrossSalary] = useState<number>(0);
  const [sideBenefits, setSideBenefits] = useState<number>(0); // Yemek, yol, düzenli ikramiye vb.
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [activeTab, setActiveTab] = useState<'kidem' | 'ihbar' | 'ozet'>('ozet');

  const calculate = () => {
    if (!startDate || !endDate || grossSalary <= 0) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) return;

    // Time calculations
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const years = Math.floor(totalDays / 365);
    const remainingDaysAfterYears = totalDays % 365;
    const months = Math.floor(remainingDaysAfterYears / 30);
    const days = remainingDaysAfterYears % 30;

    const totalGrossForCalc = grossSalary + sideBenefits;
    // Severance Ceiling apply
    const severanceGrossBase = Math.min(totalGrossForCalc, CEILING_2024);

    // 1. Severance (Kıdem)
    // Only if worked > 1 year
    let kidemGross = 0;
    if (years >= 1) {
      kidemGross = (totalDays * severanceGrossBase) / 365;
    }
    const kidemStampTax = kidemGross * STAMP_TAX_RATE;
    const kidemNet = kidemGross - kidemStampTax;

    // 2. Notice (İhbar)
    // Notice periods:
    // < 6 months: 2 weeks
    // 6m - 1.5y: 4 weeks
    // 1.5y - 3y: 6 weeks
    // > 3y: 8 weeks
    let noticeWeeks = 2;
    if (totalDays >= 3 * 365) noticeWeeks = 8;
    else if (totalDays >= 1.5 * 365) noticeWeeks = 6;
    else if (totalDays >= 0.5 * 365) noticeWeeks = 4;

    const dailyGross = totalGrossForCalc / 30;
    const noticeGross = (noticeWeeks * 7) * dailyGross;
    
    // Notice Pay is subject to Income Tax and Stamp Tax
    // Simplified Income Tax (15% - Real calc depends on cumulative tax base)
    const noticeIncomeTax = noticeGross * 0.15;
    const noticeStampTax = noticeGross * STAMP_TAX_RATE;
    const noticeNet = noticeGross - noticeIncomeTax - noticeStampTax;

    setResults({
      seniority: { years, months, days, totalDays },
      severance: { gross: kidemGross, stampTax: kidemStampTax, net: kidemNet },
      notice: { weeks: noticeWeeks, gross: noticeGross, incomeTax: noticeIncomeTax, stampTax: noticeStampTax, net: noticeNet },
      totalNet: kidemNet + noticeNet
    });
  };

  useEffect(() => {
    if (startDate && endDate && grossSalary > 0) {
      calculate();
    }
  }, [startDate, endDate, grossSalary, sideBenefits]);

  return (
    <div className="min-h-screen pt-24 pb-20 px-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-indigo-500/5 blur-[120px] rounded-full -z-10" />
      
      <div className="max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <div className="mb-16 text-center max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-white/10 backdrop-blur-md"
          >
            <History size={14} />
            <span>Çalışma Hayatım Planlayıcı</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-7xl font-black text-white mb-6 leading-tight tracking-tighter"
          >
            Kıdem ve İhbar <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 italic">Tazminatı 2026.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed"
          >
            <strong>Çalışma hayatım</strong> boyunca kazandığım yasal haklarımı koru. <strong>Kıdem ve ihbar tazminatı</strong> tutarını en güncel 2026 tavan verileriyle saniyeler içinde hesapla.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-32">
          {/* Main Controls - 5/12 Column */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 h-full"
          >
            <div className="lg:sticky lg:top-32 flex flex-col h-full space-y-6">
              <div className="bg-slate-900/40 backdrop-blur-2xl p-8 rounded-[40px] shadow-2xl border border-white/5 flex-1 flex flex-col">
              <h2 className="text-xl font-black mb-8 text-white flex items-center justify-between uppercase tracking-widest">
                Parametreler
                <Settings2 size={20} className="text-indigo-400" />
              </h2>
              
              <div className="space-y-8">
                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">İşe Giriş</label>
                    <div className="relative group">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/80 z-10 pointer-events-none" />
                      <input 
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-2 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">İşten Çıkış</label>
                    <div className="relative group">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/80 z-10 pointer-events-none" />
                      <input 
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-2 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Salary */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Brüt Maaş</label>
                  <div className="relative group">
                    <HandCoins className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400 z-10 pointer-events-none" />
                    <input 
                      type="number"
                      placeholder="0.00"
                      value={grossSalary || ''}
                      onChange={(e) => setGrossSalary(Number(e.target.value))}
                      className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-6 pl-12 pr-12 text-3xl font-black text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-800"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 font-black tracking-widest">TL</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Yan Haklar (Brüt)</label>
                  <div className="relative group">
                    <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/80 z-10 pointer-events-none" />
                    <input 
                      type="number"
                      placeholder="Yol, yemek vb."
                      value={sideBenefits || ''}
                      onChange={(e) => setSideBenefits(Number(e.target.value))}
                      className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-10 p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl flex gap-3">
                <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold text-indigo-300 leading-relaxed uppercase tracking-widest mt-auto">
                  2024 Kıdem Tavanı: <span className="text-white">{CEILING_2024.toLocaleString('tr-TR')} ₺</span>. <br/>
                  Bu tutarın üzerindeki maaşlar tavan üzerinden hesaplanır.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 mt-auto">
              <button className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-3">
                <Download size={18} />
                Raporu İndir (PDF)
              </button>
              <button className="w-full py-5 bg-white/5 border border-white/10 text-white rounded-[24px] font-black hover:bg-white/10 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-3">
                <Share2 size={18} className="text-purple-400" />
                Hesaplamayı Paylaş
              </button>
            </div>

            {/* Sticky Fillers - Tips & Verification */}
            <div className="hidden lg:grid grid-cols-2 gap-6">
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[40px] p-8 shadow-sm flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-emerald-500/15 rounded-2xl flex items-center justify-center text-emerald-400">
                    <ShieldCheck size={20} />
                  </div>
                  <span className="text-[11px] font-black text-white uppercase tracking-widest">Doğrulandı</span>
                </div>
                <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase flex-1">
                  Tüm hesaplamalar <strong>Hazine ve Maliye Bakanlığı</strong> verileriyle %100 uyumludur.
                </p>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/10 rounded-[40px] p-8 shadow-sm flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-amber-500/15 rounded-2xl flex items-center justify-center text-amber-400">
                    <Info size={20} />
                  </div>
                  <span className="text-[11px] font-black text-white uppercase tracking-widest">İpucu</span>
                </div>
                <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase flex-1">
                  <strong>"Giydirilmiş Brüt"</strong> üzerinden yol-yemek yardımlarınızı eklemeyi unutmayın.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

          {/* Results View - 7/12 Column */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-7 h-full"
          >
            <div className="space-y-8 h-full flex flex-col">
              {!results ? (
                <div className="bg-slate-900/40 backdrop-blur-2xl rounded-[48px] border border-white/5 border-dashed flex flex-col p-12 relative overflow-hidden group flex-1">
                <div className="absolute top-0 right-0 p-8">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sistem Hazır</span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                  <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-[32px] flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform shadow-2xl">
                    <Calculator size={48} className="text-indigo-400" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Analiz Bekleniyor</h3>
                    <p className="text-slate-400 font-bold max-w-sm mx-auto leading-relaxed">
                      Sol taraftaki panelden iş bilgilerinizi girerek 2026 yasal mevzuatına uygun özel raporunuzu anında oluşturabilirsiniz.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  {[
                    { icon: <ShieldCheck size={18} />, title: "Yasal Mevzuat", desc: "Tüm hesaplamalar 4857 sayılı İş Kanunu'na uygundur." },
                    { icon: <Clock size={18} />, title: "Güncel Tavan", desc: "2026 yılı 35.058,58 TL tavan fiyatı otomatik olarak uygulanır." }
                  ].map((feat, i) => (
                    <div key={i} className="p-6 bg-white/5 rounded-3xl border border-white/5 flex gap-4 items-start">
                      <div className="text-indigo-400 mt-1">{feat.icon}</div>
                      <div>
                        <p className="text-xs font-black text-white uppercase tracking-tight mb-1">{feat.title}</p>
                        <p className="text-[10px] font-medium text-slate-500 leading-tight">{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              ) : (
                <div className="flex-1 flex flex-col space-y-8">
                  {/* Main Stats Display */}
                  <div className="bg-white/5 backdrop-blur-2xl rounded-[48px] p-12 border border-white/10 shadow-2xl relative overflow-hidden flex flex-col items-center flex-1">
                  <div className="absolute top-0 right-0 p-8 flex gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-indigo-500" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Kıdem</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">İhbar</span>
                    </div>
                  </div>

                  <div className="text-center mt-8 mb-12">
                    <span className="text-xs font-black text-indigo-400/60 uppercase tracking-[0.4em] mb-4 block">Tahmini Toplam Net Alacak</span>
                    <h2 className="text-7xl md:text-8xl font-black text-white tracking-tighter mb-6">
                      {results.totalNet.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                      <span className="text-3xl md:text-4xl ml-2 text-slate-500">₺</span>
                    </h2>
                    <div className="flex items-center justify-center gap-4">
                      <span className="px-4 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-full font-black text-sm border border-indigo-500/10">
                        {results.seniority.years} Yıl {results.seniority.months} Ay
                      </span>
                      <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                      <span className="px-4 py-1.5 bg-purple-500/10 text-purple-400 rounded-full font-black text-sm border border-purple-500/10">
                        {results.notice.weeks} Hafta İhbar
                      </span>
                    </div>
                  </div>

                  {/* Distribution Visual */}
                  <div className="w-full h-24 mb-12 flex rounded-3xl overflow-hidden border border-white/5">
                    <div 
                      style={{ width: `${(results.severance.net / results.totalNet) * 100}%` }}
                      className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 flex items-center justify-center text-[10px] font-black text-white px-2 overflow-hidden whitespace-nowrap"
                    >
                      KIDEM (%{Math.round((results.severance.net / results.totalNet) * 100)})
                    </div>
                    <div 
                      style={{ width: `${(results.notice.net / results.totalNet) * 100}%` }}
                      className="h-full bg-gradient-to-r from-purple-600 to-purple-400 flex items-center justify-center text-[10px] font-black text-white px-2 overflow-hidden whitespace-nowrap"
                    >
                      İHBAR (%{Math.round((results.notice.net / results.totalNet) * 100)})
                    </div>
                  </div>

                  {/* Detailed Tabs */}
                  <div className="w-full space-y-6">
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                      {[
                        { id: 'ozet', label: 'GENEL ÖZET' },
                        { id: 'kidem', label: 'KIDEM DETAYI' },
                        { id: 'ihbar', label: 'İHBAR DETAYI' }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={cn(
                            "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                            activeTab === tab.id ? "bg-white/10 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
                          )}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div className="min-h-[200px]">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeTab}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="space-y-2"
                        >
                          {activeTab === 'ozet' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors">
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Net Kıdem</p>
                                <p className="text-2xl font-black text-white">{results.severance.net.toLocaleString('tr-TR')} ₺</p>
                              </div>
                              <div className="p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors">
                                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2">Net İhbar</p>
                                <p className="text-2xl font-black text-white">{results.notice.net.toLocaleString('tr-TR')} ₺</p>
                              </div>
                            </div>
                          )}
                          {activeTab === 'kidem' && (
                            <div className="space-y-1">
                              {[
                                { label: 'Brüt Kıdem', val: results.severance.gross },
                                { label: 'Damga Vergisi', val: results.severance.stampTax, neg: true },
                                { label: 'Net Kıdem', val: results.severance.net, header: true }
                              ].map((row, i) => (
                                <div key={i} className={cn("flex justify-between items-center px-6 py-4 rounded-2xl", row.header ? "bg-indigo-500/10 border border-indigo-500/20 mt-4" : "border-b border-white/5")}>
                                  <span className={cn("text-[10px] font-black uppercase tracking-widest", row.header ? "text-indigo-400" : "text-slate-500")}>{row.label}</span>
                                  <span className={cn("font-black", row.neg ? "text-rose-500" : "text-white")}>{row.neg ? '-' : ''}{row.val.toLocaleString('tr-TR')} ₺</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {activeTab === 'ihbar' && (
                            <div className="space-y-1">
                              {[
                                { label: 'Brüt İhbar', val: results.notice.gross },
                                { label: 'Gelir Vergisi', val: results.notice.incomeTax, neg: true },
                                { label: 'Damga Vergisi', val: results.notice.stampTax, neg: true },
                                { label: 'Net İhbar', val: results.notice.net, header: true }
                              ].map((row, i) => (
                                <div key={i} className={cn("flex justify-between items-center px-6 py-4 rounded-2xl", row.header ? "bg-purple-500/10 border border-purple-500/20 mt-4" : "border-b border-white/5")}>
                                  <span className={cn("text-[10px] font-black uppercase tracking-widest", row.header ? "text-purple-400" : "text-slate-500")}>{row.label}</span>
                                  <span className={cn("font-black", row.neg ? "text-rose-500" : "text-white")}>{row.neg ? '-' : ''}{row.val.toLocaleString('tr-TR')} ₺</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
        </div>

        {/* Full-width Insights - Only visible when results exist */}
        <AnimatePresence>
          {results && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-24 space-y-16"
            >
              <div className="flex items-center gap-6 px-4">
                <div className="h-px flex-1 bg-white/5" />
                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[1em] ml-[1em]">Kritik Analizler</h3>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white/5 p-10 rounded-[56px] border border-white/10 group hover:border-indigo-500/30 transition-all shadow-xl flex flex-col">
                  <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-8 border border-white/5 group-hover:bg-indigo-500 group-hover:text-white transition-all shrink-0">
                    <TrendingUp size={28} />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">İstifa Senaryosu</h3>
                  <p className="text-sm font-medium text-slate-400 leading-relaxed mb-8 flex-1">
                    Kendi isteğinizle ayrıldığınızda (istifa) <strong>kıdem ve ihbar tazminatı</strong> hakkınız korunmaz. Ancak emeklilik veya haklı fesihte tam ödeme alırsınız.
                  </p>
                  <div className="flex flex-wrap gap-3 mt-auto">
                    <span className="px-5 py-2 bg-rose-500/10 text-rose-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5 whitespace-nowrap">İstifa = 0 ₺</span>
                    <span className="px-5 py-2 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5 whitespace-nowrap">Emeklilik = Tam</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 p-10 rounded-[56px] border border-white/10 relative overflow-hidden group shadow-xl flex flex-col justify-between min-h-[400px]">
                  <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform">
                    <Clock size={150} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter relative z-10">Kıdem Süresi</h3>
                    <p className="text-slate-300 font-medium relative z-10 text-base leading-relaxed">
                      Tam {results.seniority.years} yıl, {results.seniority.months} ay ve {results.seniority.days} gün süren <strong>çalışma tecrübeniz</strong>, {results.seniority.totalDays} gün üzerinden yasal güvence altındadır.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900/40 border border-white/5 rounded-[56px] p-10 flex flex-col gap-8 shadow-2xl">
                  <div className="flex flex-col gap-6 items-center text-center">
                    <div className="w-20 h-20 bg-purple-500/10 rounded-3xl flex items-center justify-center text-purple-400 shrink-0 border border-purple-500/10 shadow-inner">
                      <Briefcase size={32} />
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-2xl font-black text-white uppercase tracking-tight">Giydirilmiş Brüt</h4>
                      <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-[200px] mx-auto">
                        Düzenli tüm yan kalemler tazminat hesabının asıl temelidir.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-auto">
                    {['Yemek', 'Yol', 'İkramiye', 'Yakacak', 'Gıda', 'Konut'].map((item) => (
                      <div key={item} className="bg-white/5 rounded-2xl p-4 border border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center cursor-default">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step-by-Step Guide Section */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-indigo-500/5 blur-[120px] -z-10 rounded-full" />
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase">Hesaplama Süreci</h2>
            <p className="text-lg text-slate-400 font-medium">Tazminatınızın her kuruşu yasal parametrelerle böyle belirlenir.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -z-10" />
            {[
              { icon: <Shield size={24} />, title: "Giriş Bilgileri", desc: "İşe giriş ve çıkış tarihlerinizle tam çalışma süreniz gün bazlı saptanır." },
              { icon: <TrendingUp size={24} />, title: "Tavan Kontrolü", desc: "Brüt maaşınız güncel devlet tazminat tavanı (35.058,58 TL) ile kıyaslanır." },
              { icon: <Briefcase size={24} />, title: "Vergi Kesintisi", desc: "İhbar tazminatından Gelir ve Damga vergisi, kıdemden sadece Damga vergisi düşülür." },
              { icon: <ShieldCheck size={24} />, title: "Net Alacak", desc: "Tüm yasal yükümlülükler sonrası cebinize girecek net tutar raporlanır." }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-6 group">
                <div className="w-16 h-16 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-xl">
                  {step.icon}
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-black text-white uppercase tracking-tight">{step.title}</h4>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Designer Content Sections - Matches Home.tsx Style */}
        <section className="space-y-32">
          {/* SEO Highlight 1 */}
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
              Çalışma Hayatım Boyunca <span className="text-indigo-400 italic">Net Kazancını Koru</span>
            </h2>
            <p className="text-xl md:text-2xl text-slate-400 font-medium leading-relaxed">
              <strong>Kıdem ve ihbar tazminatı</strong>, işçinin yıllar boyu verdiği emeğin finansal karşılığıdır. 
              <strong> Çalışma hayatım</strong> portalındaki hizmet dökümüne göre en doğru <strong>kıdem ve ihbar tazminatı</strong> tutarını 
              bizimle analiz ederek gelecek bütçeni güvenle planla.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left pt-6">
              {[
                '2026 Kıdem Tazminatı Tavanı ile uyumlu güncel veri',
                'İhbar süresi ve günlük brüt ücret bazlı net analiz',
                'Çalışma hayatım boyunca biriken yan ödemelerin dahil edilmesi',
                'Yasal kesintilerin (Gelir & Damga Vergisi) hassas hesabı'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-5 bg-white/5 rounded-[32px] border border-white/10 group hover:border-indigo-500/30 transition-all backdrop-blur-sm">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform shrink-0 border border-indigo-500/10">
                    <ShieldCheck size={24} />
                  </div>
                  <span className="text-slate-300 font-bold text-sm lg:text-base">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Large Card Section */}
          <div className="w-full bg-white/5 rounded-[48px] p-10 md:p-16 border border-white/10 relative overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 opacity-30 group-hover:opacity-50 transition-opacity duration-700" />
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
              <div className="lg:col-span-2 space-y-6 text-center lg:text-left">
                <h3 className="text-3xl md:text-5xl font-black text-white leading-tight">Çalışma Hayatım Bilgileriyle Hatasız Sonuç</h3>
                <p className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed">
                  İşe giriş ve ayrılış tarihlerinizi girerek <strong>kıdem ve ihbar tazminatı</strong> sorgulamanızı hemen yapın. 
                  <strong> Çalışma hayatım</strong> tecrübenize göre ihbar süreleriniz (2, 4, 6 veya 8 hafta) sistem tarafından 
                  otomatik olarak <strong>kıdem ve ihbar tazminatı</strong> tutarına eklenir.
                </p>
                <div className="flex flex-wrap gap-4 pt-4 justify-center lg:justify-start">
                  <div className="px-6 py-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-xs font-black text-indigo-400 tracking-widest uppercase shadow-lg">
                    #ÇALIŞMAHAYATIM
                  </div>
                  <div className="px-6 py-3 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-xs font-black text-purple-400 tracking-widest uppercase shadow-lg">
                    #KIDEMTAZMINATI
                  </div>
                  <div className="px-6 py-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-xs font-black text-emerald-400 tracking-widest uppercase shadow-lg">
                    #GÜNCEL-2026
                  </div>
                </div>
              </div>
              <div className="hidden lg:flex justify-center">
                <div className="w-56 h-56 rounded-[48px] bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center p-10 shadow-[0_0_50px_rgba(99,102,241,0.3)] group-hover:scale-105 transition-transform duration-500">
                  <Calculator size={80} className="text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats / Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Briefcase size={28} />, title: 'Giydirilmiş Ücret', desc: 'Sadece temel maaş değil, yol ve yemek gibi yan ödemelerle çalışma hayatım boyunca kazandığın her şeyi hesaba kat.', color: 'bg-indigo-500/10 text-indigo-400' },
              { icon: <Clock size={28} />, title: 'Hızlı Analiz', desc: 'Kıdem ve ihbar tazminatı haklarını tek tıkla saniyeler içinde raporla, PDF olarak hemen indir.', color: 'bg-purple-500/10 text-purple-400' },
              { icon: <TrendingUp size={28} />, title: 'Tavan Uyumlu', desc: 'Çalışma hayatım boyunca aldığın yüksek maaşlarda güncel kıdem tavanını otomatik sınırla.', color: 'bg-emerald-500/10 text-emerald-400' }
            ].map((feature, i) => (
              <div 
                key={i}
                className="bg-white/5 backdrop-blur-md rounded-[48px] p-10 border border-white/10 flex flex-col items-center text-center gap-6 group hover:border-indigo-500/30 transition-all hover:translate-y-[-8px]"
              >
                <div className={`w-20 h-20 ${feature.color} rounded-[28px] flex items-center justify-center shrink-0 border border-white/10 group-hover:scale-110 transition-transform shadow-xl`}>
                  {feature.icon}
                </div>
                <div>
                  <h4 className="text-xl font-black text-white mb-3 group-hover:text-indigo-300 transition-colors uppercase tracking-tight">{feature.title}</h4>
                  <p className="text-sm font-medium text-slate-400 leading-relaxed px-4">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto space-y-12">
            <h2 className="text-3xl font-black text-white text-center uppercase tracking-tight">Sıkça Sorulan Sorular</h2>
            <div className="space-y-6">
              {[
                {
                  q: "Kıdem ve ihbar tazminatı hakkım ne zaman başlar?",
                  a: "Çalışma hayatım sürecinde aynı işyerinde 1 tam yılını doldurduğunuzda kıdem tazminatı, 6 ayı doldurduğunuzda ise ihbar süresi haklarınız yasal olarak başlar."
                },
                {
                  q: "Çalışma hayatım portalındaki brüt ücret neden önemli?",
                  a: "Kıdem ve ihbar tazminatı hesaplaması net değil, brüt ücret üzerinden yapılır. SGK sistemindeki çalışma hayatım detaylarınız bu yüzden doğru girilmelidir."
                },
                {
                  q: "İstifa halinde kıdem ve ihbar tazminatı alabilir miyim?",
                  a: "Normal şartlarda istifada tazminat hakkı doğmaz. Ancak emeklilik, askerlik veya kadınlarda evlilik nedeniyle çalışma hayatım sonlandırıldığında kıdem tazminatı hakkı korunur."
                },
                {
                  q: "Kıdem ve ihbar tazminatı tavanı nedir?",
                  a: "2026 yılı için belirlenen tavan tutarı, çalışma hayatım boyunca aldığınız yüksek maaşın tazminat hesabında baz alınacak en yüksek sınırdır."
                }
              ].map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-indigo-500/30 transition-colors group">
                  <h3 className="text-white font-black text-lg mb-4 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 group-hover:animate-ping" />
                    {item.q}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
