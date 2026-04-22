import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  Info, 
  Info as InfoIcon, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  TrendingUp, 
  ArrowUpRight, 
  BarChart3, 
  Shield, 
  AlertCircle,
  FileSpreadsheet,
  Timer,
  Percent,
  ChevronDown,
  ChevronRight,
  Target
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface MonthlyCalculation {
  month: string;
  gross: number;
  sgkEmployee: number;
  unemploymentEmployee: number;
  incomeTaxBase: number;
  incomeTax: number;
  stampTax: number;
  cumulativeIncomeTaxBase: number;
  net: number;
  agi: number; // Keep for layout but used for social aid
  minWageIncomeTaxExemption: number;
  minWageStampTaxExemption: number;
  totalNet: number;
  sgkEmployer: number;
  unemploymentEmployer: number;
  totalEmployerCost: number;
}

export default function SalaryCalculator() {
  const [calculationType, setCalculationType] = useState<'grossToNet' | 'netToGross'>('grossToNet');
  const [year, setYear] = useState(2026);
  const [monthlyGross, setMonthlyGross] = useState<number | ''>('');
  const [maritalStatus, setMaritalStatus] = useState('Bekar');
  const [spouseWorks, setSpouseWorks] = useState('calisiyor');
  const [childCount, setChildCount] = useState(0);
  const [showEmployerCost, setShowEmployerCost] = useState(false);
  const [incentive5Point, setIncentive5Point] = useState(true);
  const [incentive2Point, setIncentive2Point] = useState(false);
  const [calculations, setCalculations] = useState<MonthlyCalculation[]>([]);
  const [isScoreOpen, setIsScoreOpen] = useState(true);

  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const MIN_WAGE_BRUT = 20002.50; 
  const TAX_BRACKETS = [110000, 230000, 870000, 3000000];
  const TAX_RATES = [0.15, 0.20, 0.27, 0.35, 0.40];
  const STAMP_TAX_RATE = 0.00759;

  const calculateTaxes = (gross: number, cumulativeBase: number) => {
    const sgkEmployee = gross * 0.14;
    const unemploymentEmployee = gross * 0.01;
    const incomeTaxBase = gross - sgkEmployee - unemploymentEmployee;
    
    let remainingBase = incomeTaxBase;
    let currentCumulative = cumulativeBase;
    let incomeTax = 0;

    for (let i = 0; i < TAX_BRACKETS.length; i++) {
      if (currentCumulative < TAX_BRACKETS[i]) {
        const bracketLimit = TAX_BRACKETS[i] - currentCumulative;
        const amountInBracket = Math.min(remainingBase, bracketLimit);
        incomeTax += amountInBracket * TAX_RATES[i];
        remainingBase -= amountInBracket;
        currentCumulative += amountInBracket;
      }
      if (remainingBase <= 0) break;
    }

    if (remainingBase > 0) {
      incomeTax += remainingBase * TAX_RATES[TAX_RATES.length - 1];
    }

    const stampTax = gross * STAMP_TAX_RATE;
    const mwSgkEmployee = MIN_WAGE_BRUT * 0.14;
    const mwUnemploymentEmployee = MIN_WAGE_BRUT * 0.01;
    const mwIncomeTaxBase = MIN_WAGE_BRUT - mwSgkEmployee - mwUnemploymentEmployee;
    
    const mwIncomeTaxExemption = mwIncomeTaxBase * 0.15; 
    const mwStampTaxExemption = MIN_WAGE_BRUT * STAMP_TAX_RATE;

    let socialAid = 0;
    if (maritalStatus === 'Evli' && spouseWorks === 'calismiyor') {
      socialAid += 2500; 
    }
    socialAid += childCount * 600; 

    const net = gross - sgkEmployee - unemploymentEmployee - incomeTax - stampTax;
    const totalNet = net + mwIncomeTaxExemption + mwStampTaxExemption + socialAid;

    // Employer Costs
    let sgkEmployerRate = 0.205; // Base 20.5%
    if (incentive5Point) sgkEmployerRate -= 0.05;
    if (incentive2Point) sgkEmployerRate -= 0.02;

    const sgkEmployer = gross * sgkEmployerRate;
    const unemploymentEmployer = gross * 0.02;
    const totalEmployerCost = gross + sgkEmployer + unemploymentEmployer;

    return {
      sgkEmployee,
      unemploymentEmployee,
      incomeTaxBase,
      incomeTax,
      stampTax,
      net,
      minWageIncomeTaxExemption: mwIncomeTaxExemption,
      minWageStampTaxExemption: mwStampTaxExemption,
      totalNet,
      socialAid,
      sgkEmployer,
      unemploymentEmployer,
      totalEmployerCost
    };
  };

  const handleCalculate = () => {
    if (!monthlyGross || monthlyGross === 0) {
      setCalculations([]);
      return;
    }

    if (monthlyGross < MIN_WAGE_BRUT) {
      setCalculations([]);
      return;
    }

    let cumulativeBase = 0;
    const newCalculations: MonthlyCalculation[] = [];

    for (let i = 0; i < 12; i++) {
        const res = calculateTaxes(monthlyGross, cumulativeBase);
        newCalculations.push({
            month: months[i],
            gross: monthlyGross,
            sgkEmployee: res.sgkEmployee,
            unemploymentEmployee: res.unemploymentEmployee,
            incomeTaxBase: res.incomeTaxBase,
            incomeTax: res.incomeTax,
            stampTax: res.stampTax,
            cumulativeIncomeTaxBase: cumulativeBase + res.incomeTaxBase,
            net: res.net,
            agi: res.socialAid,
            minWageIncomeTaxExemption: res.minWageIncomeTaxExemption,
            minWageStampTaxExemption: res.minWageStampTaxExemption,
            totalNet: res.totalNet,
            sgkEmployer: res.sgkEmployer,
            unemploymentEmployer: res.unemploymentEmployer,
            totalEmployerCost: res.totalEmployerCost
        });
        cumulativeBase += res.incomeTaxBase;
    }
    setCalculations(newCalculations);
  };

  useEffect(() => {
    handleCalculate();
  }, [monthlyGross, calculationType, maritalStatus, spouseWorks, childCount, incentive5Point, incentive2Point, year]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);
  };

  const years = Array.from({ length: 2026 - 2005 + 1 }, (_, i) => 2026 - i);

  const exportToExcel = () => {
    const data = calculations.map((calc) => ({
      'Ay': calc.month,
      'Brüt Maaş': calc.gross,
      'SGK İşçi': calc.sgkEmployee,
      'İşsizlik Primi': calc.unemploymentEmployee,
      'Gelir Vergisi': calc.incomeTax,
      'Damga Vergisi': calc.stampTax,
      'Kümülatif Matrah': calc.cumulativeIncomeTaxBase,
      'GV İstisnası': calc.minWageIncomeTaxExemption,
      'DV İstisnası': calc.minWageStampTaxExemption,
      'Net Maaş': calc.net,
      'Aile/Çocuk Yardımı': calc.agi,
      'Ele Geçen Toplam': calc.totalNet,
      'SGK İşveren': calc.sgkEmployer,
      'İşsizlik İşveren': calc.unemploymentEmployer,
      'Toplam İşveren Maliyeti': calc.totalEmployerCost
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Maaş Hesaplama');
    XLSX.writeFile(wb, `FinCalc_Maas_Hesaplama_${year}.xlsx`);
  };

  const totalTakeHome = calculations.reduce((acc, curr) => acc + curr.totalNet, 0);
  const averageNet = totalTakeHome / 12;
  const totalEmployerYearly = calculations.reduce((acc, curr) => acc + curr.totalEmployerCost, 0);
  const averageEmployerMonthly = totalEmployerYearly / 12;
  const totalDeductions = calculations.reduce((acc, curr) => acc + (curr.gross - curr.net), 0);
  const totalEmployerAddons = calculations.reduce((acc, curr) => acc + (curr.sgkEmployer + curr.unemploymentEmployer), 0);
  const efficiencyScore = Math.min(Math.max((averageNet / monthlyGross) * 10, 0), 10).toFixed(1);

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
            <TrendingUp size={16} />
            <span>2026 Vergi Mevzuatına Uygun</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-8xl font-black text-white mb-6 max-w-5xl mx-auto leading-[0.9] tracking-tighter text-center flex flex-col items-center justify-center px-4 font-display"
          >
            <span>Maaşını</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-white to-purple-400 italic px-2 pb-1 drop-shadow-2xl">Hassas Hesapla</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto mb-12 font-medium"
          >
            Brütten nete veya netten brüte; SGK, Gelir Vergisi ve tüm yasal kesintileri anında dökümleyin.
          </motion.p>

          {/* Calculator Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-6xl mx-auto bg-slate-950/40 backdrop-blur-3xl rounded-[40px] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden border border-white/5 relative"
          >
            {/* Tabs */}
            <div className="flex border-b border-white/5 bg-white/[0.02]">
              <button
                onClick={() => setCalculationType('grossToNet')}
                className={`flex-1 py-6 flex items-center justify-center gap-3 transition-all font-black tracking-[0.2em] text-[10px] sm:text-xs ${
                  calculationType === 'grossToNet' 
                    ? 'bg-white/5 text-white border-b-2 border-indigo-500' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                <Calculator size={18} />
                BRÜTTEN NETE
              </button>
              <button
                disabled
                className="flex-1 py-6 flex items-center justify-center gap-3 transition-all font-black tracking-[0.2em] text-[10px] sm:text-xs text-slate-700 cursor-not-allowed bg-black/20"
              >
                <ArrowUpRight size={18} />
                NETTEN BRÜTE (YAKINDA)
              </button>
            </div>

            <div className="p-8 md:p-10 flex flex-col gap-10">
              {/* Inputs Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                  <BarChart3 size={18} className="text-indigo-400" />
                  <h2 className="text-sm font-black text-white tracking-widest">HESAPLAMA PARAMETRELERİ</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 text-left">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-500 tracking-widest ml-1">YIL</label>
                    <div className="relative group">
                      <select 
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-xl px-4 appearance-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer font-bold text-white font-mono group-hover:border-white/20"
                      >
                        {years.map(y => (
                          <option key={y} value={y} className="bg-slate-900 font-bold">{y}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" size={20} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 col-span-1 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-500 tracking-widest ml-1">AYLIK BRÜT MAAŞ (TL)</label>
                    <div className="relative group">
                      <input 
                        type="number" 
                        value={monthlyGross}
                        onChange={(e) => setMonthlyGross(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-xl px-4 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-black text-white group-hover:border-white/20" 
                        placeholder="0.00"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₺</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-500 tracking-widest ml-1">MEDENİ DURUM</label>
                    <div className="relative group">
                      <select 
                        value={maritalStatus}
                        onChange={(e) => setMaritalStatus(e.target.value)}
                        className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-xl px-4 appearance-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer font-bold text-white group-hover:border-white/20"
                      >
                        <option value="Bekar" className="bg-slate-900 font-bold">Bekar</option>
                        <option value="Evli" className="bg-slate-900 font-bold">Evli</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" size={20} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-500 tracking-widest ml-1">EŞİ ÇALIŞIYOR MU?</label>
                    <div className="relative group">
                      <select 
                        value={spouseWorks}
                        onChange={(e) => setSpouseWorks(e.target.value)}
                        disabled={maritalStatus === 'Bekar'}
                        className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-xl px-4 appearance-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer font-bold text-white disabled:opacity-30 group-hover:border-white/20"
                      >
                        <option value="calisiyor" className="bg-slate-900 font-bold">Evet, Çalışıyor</option>
                        <option value="calismiyor" className="bg-slate-900 font-bold">Hayır, Çalışmıyor</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" size={20} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-500 tracking-widest ml-1">ÇOCUK SAYISI</label>
                    <div className="relative group">
                      <input 
                        type="number" 
                        min="0"
                        max="10"
                        value={childCount}
                        onChange={(e) => setChildCount(Number(e.target.value))}
                        className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-xl px-4 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-black text-white group-hover:border-white/20" 
                      />
                      <Target className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                    </div>
                  </div>

                  <div className="flex flex-col justify-end pb-1">
                    <button
                      type="button"
                      onClick={() => setShowEmployerCost(!showEmployerCost)}
                      className={`group relative flex items-center gap-3 px-6 h-12 rounded-xl border transition-all duration-300 ${
                        showEmployerCost 
                        ? 'bg-indigo-500/10 border-indigo-500/30' 
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center transition-all duration-300 ${
                        showEmployerCost ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-800'
                      }`}>
                        {showEmployerCost && <Shield size={12} className="text-white" />}
                      </div>
                      <span className={`text-[10px] font-black tracking-widest transition-colors ${
                        showEmployerCost ? 'text-indigo-400' : 'text-slate-500'
                      }`}>
                        İŞVEREN MALİYETİ
                      </span>
                    </button>
                  </div>
                </div>

                {showEmployerCost && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="p-3 bg-slate-900/40 border border-white/5 rounded-2xl flex flex-wrap gap-4"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        const next = !incentive5Point;
                        setIncentive5Point(next);
                        if (next) setIncentive2Point(false);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200 ${
                        incentive5Point 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                        : 'bg-white/[0.02] border-white/5 text-slate-500 hover:text-slate-400'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-sm flex items-center justify-center transition-all ${
                        incentive5Point ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-800'
                      }`}>
                        {incentive5Point && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      <span className="text-[10px] font-black tracking-widest uppercase">5 Puanlık İndirim</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const next = !incentive2Point;
                        setIncentive2Point(next);
                        if (next) setIncentive5Point(false);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200 ${
                        incentive2Point 
                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' 
                        : 'bg-white/[0.02] border-white/5 text-slate-500 hover:text-slate-400'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-sm flex items-center justify-center transition-all ${
                        incentive2Point ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]' : 'bg-slate-800'
                      }`}>
                        {incentive2Point && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      <span className="text-[10px] font-black tracking-widest uppercase">Ek 2 Puan İndirim</span>
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Results Container */}
              <div className="space-y-12">
                <div className="flex flex-col lg:flex-row items-center gap-10 text-left">
                  <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <span className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase">{showEmployerCost ? 'Toplam Maliyet' : 'Yıllık Ele Geçen'}</span>
                      <div className={`text-5xl md:text-6xl font-black font-display tracking-tight ${showEmployerCost ? 'text-indigo-400' : 'text-emerald-400'}`}>
                        {formatCurrency(showEmployerCost ? totalEmployerYearly : totalTakeHome)}
                        <span className="text-xl ml-2 opacity-50 uppercase text-white">/ Yıl</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <span className="text-[10px] font-black text-slate-500 tracking-widest block uppercase mb-2">Aylık Ort.</span>
                        <div className="text-xl font-bold text-white font-mono">
                          {formatCurrency(showEmployerCost ? averageEmployerMonthly : averageNet)}
                        </div>
                      </div>
                      <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <span className="text-[10px] font-black text-slate-500 tracking-widest block uppercase mb-2">Verimlilik</span>
                        <div className="text-xl font-bold text-indigo-400 font-mono">
                          {efficiencyScore}<span className="text-xs opacity-50 ml-1">/10</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="shrink-0 w-full lg:w-fit flex flex-col gap-4">
                    <button 
                      onClick={exportToExcel}
                      className="px-8 h-14 bg-emerald-500 text-black font-black text-[11px] tracking-[0.2em] rounded-2xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20"
                    >
                      <FileSpreadsheet size={20} />
                      EXCEL RAPORU İNDİR
                    </button>
                    <p className="text-[10px] text-slate-500 text-center font-bold italic">Tüm detaylar Excel dökümünde yer alır</p>
                  </div>
                </div>

                {/* The Döküm Table - Redesigned */}
                <div className="space-y-6 pt-12 border-t border-white/5 text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/5 flex items-center justify-center border border-indigo-500/10 text-indigo-400">
                        <BarChart3 size={20} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white tracking-widest uppercase font-display text-left">Aylık Maaş Dökümü</h3>
                        <p className="text-[10px] text-slate-500 font-bold tracking-wider italic text-left">2026 Vergi matrahı ve kesinti projeksiyonu</p>
                      </div>
                    </div>
                  </div>

                  <div className="relative bg-black/40 rounded-2xl sm:rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                      <table className="w-full text-left border-collapse min-w-[1000px] lg:min-w-[1200px]">
                        <thead>
                          <tr className="bg-white/10 border-b border-white/10">
                            <th className="sticky left-0 z-30 px-4 sm:px-6 py-4 sm:py-6 text-[9px] sm:text-[10px] font-black text-indigo-300 uppercase tracking-wider bg-slate-900 border-r border-white/5 whitespace-nowrap text-center">Ay</th>
                            <th className="px-4 py-4 sm:py-6 text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest text-right whitespace-nowrap">Brüt</th>
                            <th className="px-4 py-4 sm:py-6 text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest text-right whitespace-nowrap">SGK İşçi</th>
                            {showEmployerCost && (
                              <>
                                <th className="px-4 py-4 sm:py-6 text-[9px] sm:text-[10px] font-black text-indigo-400/70 uppercase tracking-widest text-right whitespace-nowrap">SGK İşv.</th>
                                <th className="px-4 py-4 sm:py-6 text-[9px] sm:text-[10px] font-black text-indigo-400/70 uppercase tracking-widest text-right whitespace-nowrap">İşsizlik İ.</th>
                              </>
                            )}
                            <th className="px-4 py-4 sm:py-6 text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest text-right whitespace-nowrap">Gelir Ver.</th>
                            <th className="px-4 py-4 sm:py-6 text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest text-right font-display whitespace-nowrap italic">Küm. Matrah</th>
                            <th className="px-4 py-4 sm:py-6 text-[9px] sm:text-[10px] font-black text-emerald-500/70 uppercase tracking-widest text-right whitespace-nowrap">İstisnalar</th>
                            <th className="px-4 py-4 sm:py-6 text-[9px] sm:text-[10px] font-black text-white uppercase tracking-widest text-right bg-white/[0.02] whitespace-nowrap">Ele Geçen</th>
                            {showEmployerCost && (
                              <th className="px-6 sm:px-10 py-4 sm:py-6 text-[9px] sm:text-[10px] font-black text-rose-400 uppercase tracking-widest text-right whitespace-nowrap">Top. Maliyet</th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                          {calculations.map((calc, i) => (
                            <tr key={i} className="hover:bg-white/[0.02] transition-all group">
                              <td className="sticky left-0 z-20 px-4 sm:px-6 py-4 text-[11px] sm:text-xs font-black text-indigo-300 bg-slate-900 group-hover:text-white transition-colors border-r border-white/5 text-center">{calc.month}</td>
                              <td className="px-4 py-4 text-[11px] sm:text-xs font-bold text-slate-300 text-right font-mono tracking-tight">{formatCurrency(calc.gross)}</td>
                              <td className="px-4 py-4 text-[11px] sm:text-xs font-bold text-slate-500 text-right font-mono opacity-80">{formatCurrency(calc.sgkEmployee)}</td>
                              {showEmployerCost && (
                                <>
                                  <td className="px-4 py-4 text-[11px] sm:text-xs font-bold text-indigo-300/60 text-right font-mono">{formatCurrency(calc.sgkEmployer)}</td>
                                  <td className="px-4 py-4 text-[11px] sm:text-xs font-bold text-indigo-300/60 text-right font-mono">{formatCurrency(calc.unemploymentEmployer)}</td>
                                </>
                              )}
                              <td className="px-4 py-4 text-[11px] sm:text-xs font-bold text-rose-500/70 text-right font-mono leading-none">{formatCurrency(calc.incomeTax)}</td>
                              <td className="px-4 py-4 text-[11px] sm:text-xs font-bold text-white/20 text-right font-mono text-[10px] group-hover:text-white/40">{formatCurrency(calc.cumulativeIncomeTaxBase)}</td>
                              <td className="px-4 py-4 text-[11px] sm:text-xs font-bold text-emerald-500/60 text-right font-mono">{formatCurrency(calc.minWageIncomeTaxExemption + calc.minWageStampTaxExemption)}</td>
                              <td className="px-4 py-4 text-xs sm:text-sm font-black text-white text-right font-mono bg-white/[0.01] group-hover:bg-white/[0.03] transition-colors">{formatCurrency(calc.totalNet)}</td>
                              {showEmployerCost && (
                                <td className="px-6 sm:px-10 py-4 text-[11px] sm:text-xs font-black text-rose-400 text-right font-mono ring-inset group-hover:bg-rose-500/5">{formatCurrency(calc.totalEmployerCost)}</td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Detailed Breakdown Card */}
                  <div className="bg-slate-950/40 rounded-3xl border border-white/5 overflow-hidden flex flex-col shadow-2xl">
                    <div className="px-10 py-8 border-b border-white/5 bg-white/[0.02] text-left">
                      <h3 className="text-xs font-black text-white tracking-[0.2em] flex items-center gap-3 uppercase font-display">
                         <Percent size={18} className="text-indigo-400" />
                         Kesinti Dağılım Analizi
                      </h3>
                      <p className="text-[10px] text-slate-500 mt-2 font-bold italic">Ocak ayı verilerine dayalı projeksiyon</p>
                    </div>
                    <div className="p-10 flex-grow space-y-8 text-left">
                      {[
                        { label: 'SGK PRİMİ', value: calculations[0]?.sgkEmployee, color: 'bg-indigo-500' },
                        { label: 'GELİR VERGİSİ', value: calculations[0]?.incomeTax, color: 'bg-rose-500' },
                        { label: 'DAMGA VERGİSİ', value: calculations[0]?.stampTax, color: 'bg-amber-500' },
                      ].concat(showEmployerCost ? [
                        { label: 'SGK İŞVEREN', value: calculations[0]?.sgkEmployer, color: 'bg-indigo-300' },
                        { label: 'İŞSİZLİK İŞV.', value: calculations[0]?.unemploymentEmployer, color: 'bg-purple-500' },
                      ] : []).map((item, idx) => (
                        <div key={idx} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">{item.label}</span>
                            <span className="text-sm font-bold text-white font-mono">{formatCurrency(item.value || 0)}</span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden p-[1px]">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min((item.value / calculations[0]?.totalEmployerCost) * 100 * 4, 100)}%` }}
                              className={`h-full ${item.color} rounded-full opacity-90 shadow-[0_0_10px_rgba(255,255,255,0.1)]`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Insights Card */}
                  <div className="bg-slate-950/40 rounded-3xl border border-white/5 p-10 flex flex-col justify-center space-y-12 shadow-2xl text-left">
                    <div className="space-y-10">
                      <div className="flex gap-6">
                        <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/20 shadow-inner">
                          <Timer size={28} />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-black text-white mb-2 uppercase tracking-widest font-display">Hesaplama Standartları</p>
                          <p className="text-[11px] font-medium text-slate-400 leading-relaxed italic opacity-80">
                            Yapılan maaş hesaplamalarında para birimi 2005 ve takip eden yıllarda TL değerleri esas alınmaktadır. Rakam asgari ücretin altında olduğunda hesaplama yapılmaz. 2022 Yılı ve sonrası için AGİ hesaplanmaz.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-6">
                        <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/20 shadow-inner">
                          <Shield size={28} />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-black text-white mb-2 uppercase tracking-widest font-display">Yasallık & Güvence</p>
                          <p className="text-[11px] font-medium text-slate-400 leading-relaxed italic opacity-80">
                            Yapılan maaş hesaplamaları ile ilgili olarak kesin bordro işlemleri öncesi uzman veya danışman bilgisine başvurulması tavsiye olunur.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-white/5">
                       <p className="text-[9px] text-slate-600 font-black tracking-widest uppercase">© FINCALC PROFESSIONAL TOOLS - TURKEY TAX ENGINE V4.2</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legal Disclaimer directly following Home.tsx pattern */}
              <div className="mt-4 flex flex-col items-center gap-4 text-center border-t border-white/5 pt-10">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <Calculator size={14} />
                  Ücretsiz Finansal Planlama Aracı
                </div>
                <div className="max-w-4xl bg-slate-900/50 p-6 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic text-left">
                    <AlertCircle size={12} className="inline-block mr-2 mb-0.5 text-slate-600" />
                    Bu hesaplamada yer alan bilgiler sadece genel bilgilendirme amaçlıdır ve <strong>FinCalc</strong>, onun üye firmaları veya ilişkili kuruluşları (birlikte, "FinCalc Network" olarak anılacaktır) tarafından profesyonel bağlamda herhangi bir tavsiye veya hizmet sunmayı amaçlamamakta ve bilgilerin doğruluğuna dair herhangi bir garanti vermemektedir. Şirketinizi, işinizi, finansmanınızı ya da mali durumunuzu etkileyecek herhangi bir karar ya da aksiyon almadan, yetkin bir profesyonel uzmana danışın. FinCalc Network bünyesinde bulunan hiçbir kuruluş, bu hesaplamada yer alan bilgilerin üçüncü kişiler tarafından kullanılması sonucunda ortaya çıkabilecek zarar veya ziyandan sorumlu değildir.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
