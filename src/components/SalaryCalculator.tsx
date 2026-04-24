import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  Info, 
  Info as InfoIcon,
  Briefcase,
  ArrowUpRight, 
  BarChart3, 
  Shield, 
  AlertCircle,
  FileSpreadsheet,
  Percent,
  ChevronDown,
  Target,
  PiggyBank,
  TrendingUp,
  Coins,
  Coffee,
  Wallet,
  Calendar,
  Gem,
  DollarSign,
  Table,
  ListFilter
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

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
  agi: number;
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
  const [targetAmount, setTargetAmount] = useState<number | ''>('');
  const [maritalStatus, setMaritalStatus] = useState('Bekar');
  const [spouseWorks, setSpouseWorks] = useState('calisiyor');
  const [childCount, setChildCount] = useState(0);
  const [showEmployerCost, setShowEmployerCost] = useState(false);
  const [incentive5Point, setIncentive5Point] = useState(true);
  const [incentive2Point, setIncentive2Point] = useState(false);
  const [calculations, setCalculations] = useState<MonthlyCalculation[]>([]);
  const [savingsRate, setSavingsRate] = useState(20);
  
  // Real-time rates state
  const [rates, setRates] = useState({
    usd: 36.5,
    gramAltin: 3300,
    loading: true
  });

  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  // Fetch real-time data
  useEffect(() => {
    const fetchRates = async () => {
      try {
        // We use a high-fidelity Turkish finance API for accurate local market rates
        const res = await fetch('https://finans.truncgil.com/v3/today.json');
        const data = await res.json();
        
        const parseValue = (val: string) => {
          if (!val) return 0;
          // Turkish format: dots for thousands, commas for decimals
          return parseFloat(val.replace(/\./g, '').replace(',', '.'));
        };

        const usdRate = parseValue(data.USD?.Selling);
        const gramAltinRate = parseValue(data['gram-altin']?.Selling);

        if (usdRate && gramAltinRate) {
          setRates({
            usd: usdRate,
            gramAltin: gramAltinRate,
            loading: false
          });
        } else {
          // Fallback if specific fields are missing
          throw new Error("Missing data in API response");
        }
      } catch (error) {
        console.error("Rates fetch error:", error);
        // Fallback calculation if specialized API fails
        try {
          const res = await fetch('https://open.er-api.com/v6/latest/USD');
          const data = await res.json();
          const usdRate = data.rates.TRY;
          const approximateGoldUsd = 2750; 
          const calculatedGramAltin = (approximateGoldUsd / 31.1035) * usdRate;
          setRates({
            usd: usdRate,
            gramAltin: calculatedGramAltin,
            loading: false
          });
        } catch (innerError) {
          setRates(prev => ({ ...prev, loading: false })); 
        }
      }
    };

    fetchRates();
  }, []);

  const MIN_WAGE_BRUT = 26002.50; 
  const TAX_BRACKETS = [158000, 330000, 1200000, 4300000];
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

    let sgkEmployerRate = 0.205;
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

  const findGrossFromNet = (targetNet: number, cumulativeBase: number) => {
    let low = targetNet;
    let high = targetNet * 3;
    let attempts = 0;
    while (attempts < 50) {
      const mid = (low + high) / 2;
      const res = calculateTaxes(mid, cumulativeBase);
      if (Math.abs(res.totalNet - targetNet) < 0.01) return mid;
      if (res.totalNet < targetNet) low = mid;
      else high = mid;
      attempts++;
    }
    return low;
  };

  const handleCalculate = () => {
    if (!targetAmount || targetAmount === 0) {
      setCalculations([]);
      return;
    }

    let cumulativeBase = 0;
    const newCalculations: MonthlyCalculation[] = [];
    for (let i = 0; i < 12; i++) {
        let currentGross = 0;
        if (calculationType === 'grossToNet') {
          currentGross = targetAmount;
        } else {
          currentGross = findGrossFromNet(targetAmount, cumulativeBase);
        }
        const res = calculateTaxes(currentGross, cumulativeBase);
        newCalculations.push({
            month: months[i],
            gross: currentGross,
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
  }, [targetAmount, calculationType, maritalStatus, spouseWorks, childCount, incentive5Point, incentive2Point, year]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);
  };

  const displayCurrency = (val: number) => {
    if (!targetAmount || targetAmount === 0) return '---';
    return formatCurrency(val);
  };

  const totalTakeHome = calculations.reduce((acc, curr) => acc + curr.totalNet, 0);
  const averageNet = totalTakeHome / 12;
  const totalEmployerYearly = calculations.reduce((acc, curr) => acc + curr.totalEmployerCost, 0);
  
  const totalTaxes = calculations.reduce((acc, curr) => acc + curr.incomeTax + curr.stampTax, 0);
  const totalSGK = calculations.reduce((acc, curr) => acc + curr.sgkEmployee + curr.unemploymentEmployee, 0);
  
  const chartData = [
    { name: 'Net Maaş', value: totalTakeHome, color: '#10B981' },
    { name: 'Gelir Vergisi', value: totalTaxes, color: '#F43F5E' },
    { name: 'SGK Primi', value: totalSGK, color: '#6366F1' },
  ];

  const [selectedMonthIndex, setSelectedMonthIndex] = useState(new Date().getMonth());

  // Purchasing Power Estimates based on selected month
  const currentMonthCalc = calculations[selectedMonthIndex] || calculations[0];
  const monthlyNet = currentMonthCalc?.totalNet || 0;
  
  const gramAltinPrice = rates.gramAltin;
  const coffeePrice = 110;
  const usdPrice = rates.usd;
  const gramsOfGold = (monthlyNet / gramAltinPrice).toFixed(1);
  const coffees = Math.floor(monthlyNet / coffeePrice);
  const dollars = Math.floor(monthlyNet / usdPrice);

  // Future Planner Calculations
  const yearlySavings = totalTakeHome * (savingsRate / 100);
  const goldSavingsEquivalent = (yearlySavings / gramAltinPrice).toFixed(1);
  const usdSavingsEquivalent = (yearlySavings / usdPrice).toFixed(0); // Using live rate

  const exportToExcel = () => {
    const data = calculations.map((calc) => ({
      'Ay': calc.month,
      'Brüt Maaş': calc.gross,
      'SGK İşçi': calc.sgkEmployee,
      'İşsizlik Primi': calc.unemploymentEmployee,
      'Gelir Vergisi': calc.incomeTax,
      'Damga Vergisi': calc.stampTax,
      'Kümülatif Matrah': calc.cumulativeIncomeTaxBase,
      'Net Maaş': calc.totalNet,
      'Toplam İşveren Maliyeti': calc.totalEmployerCost
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Maaş Hesaplama');
    XLSX.writeFile(wb, `Karlisin_Dashboard_${year}.xlsx`);
  };

  return (
    <div className="flex-grow">
      {/* Dashboard Header */}
      <section className="relative pt-24 pb-12 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-left relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/10 text-indigo-300 rounded-2xl text-xs font-black uppercase tracking-[0.2em] mb-8 border border-indigo-500/20 backdrop-blur-xl"
          >
            <Briefcase size={16} />
            <span>Finansal Kariyer Dashboard</span>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end mb-16">
                <div>
                  <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[0.9] tracking-tighter">
                    Yeni Nesil <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Vergi Analizi.</span>
                  </h1>
                  <div className="flex flex-wrap items-center gap-4">
                    <p className="text-xl text-slate-400 font-medium max-w-lg leading-relaxed">
                      2026 vergi mevzuatı ve güncel ekonomik verilere göre optimize edilmiş maaş yönetim sistemi.
                    </p>
                    <div className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center gap-2">
                       <Shield size={12} className="text-indigo-400" />
                       <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">2026 Mevzuatı</span>
                    </div>
                  </div>
                </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex gap-4"
            >
              <div className="flex-grow p-6 bg-white/5 backdrop-blur-md rounded-[32px] border border-white/10">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Seçili Yıl</span>
                <div className="flex items-center gap-3">
                  <Calendar className="text-indigo-400" size={24} />
                  <span className="text-3xl font-black text-white">{year}</span>
                </div>
              </div>
              <button 
                onClick={exportToExcel}
                className="p-6 bg-emerald-500 text-slate-950 rounded-[32px] hover:bg-emerald-400 transition-all active:scale-95 flex flex-col items-center justify-center gap-2 group"
              >
                <FileSpreadsheet size={28} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Excel</span>
              </button>
            </motion.div>
          </div>

          {/* Calculator Section */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-16">
            {/* Input Card */}
            <motion.div 
              className="xl:col-span-1 bg-slate-900/60 backdrop-blur-2xl p-8 rounded-[40px] border border-white/5 shadow-2xl space-y-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex bg-black/40 p-1.5 rounded-2xl gap-1">
                <button 
                  onClick={() => setCalculationType('grossToNet')}
                  className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${calculationType === 'grossToNet' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                  Brütten Nete
                </button>
                <button 
                  onClick={() => setCalculationType('netToGross')}
                  className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${calculationType === 'netToGross' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                  Netten Brüte
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Maaş Tutarı</label>
                  <div className="relative group">
                    <input 
                      type="number"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Örn: 55000"
                      className="w-full h-16 bg-black/40 border border-white/10 rounded-2xl px-6 outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 text-white font-black text-xl transition-all placeholder:text-slate-700"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-600">₺</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Medeni Durum</label>
                    <select 
                      value={maritalStatus}
                      onChange={(e) => setMaritalStatus(e.target.value)}
                      className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-white font-bold outline-none focus:border-indigo-500/50 transition-all appearance-none"
                    >
                      <option value="Bekar">Bekar</option>
                      <option value="Evli">Evli</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Çocuk Sayısı</label>
                    <input 
                      type="number"
                      min="0"
                      value={childCount}
                      onChange={(e) => setChildCount(Number(e.target.value))}
                      className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-white font-bold outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <button 
                    onClick={() => setShowEmployerCost(!showEmployerCost)}
                    className={`w-full h-14 rounded-2xl border flex items-center justify-center gap-3 transition-all font-black text-[10px] tracking-widest ${showEmployerCost ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-400' : 'bg-white/5 border-white/10 text-slate-500'}`}
                  >
                    <Shield size={18} />
                    İŞVEREN MALİYETİNİ GÖSTER
                  </button>
                  
                  {showEmployerCost && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 grid grid-cols-2 gap-2"
                    >
                      <button 
                        onClick={() => setIncentive5Point(!incentive5Point)}
                        className={`py-2 px-3 rounded-lg text-[9px] font-black tracking-tighter uppercase transition-all ${incentive5Point ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-black/20 text-slate-600'}`}
                      >
                        5 Puanlık İndirim
                      </button>
                      <button 
                         onClick={() => setIncentive2Point(!incentive2Point)}
                         className={`py-2 px-3 rounded-lg text-[9px] font-black tracking-tighter uppercase transition-all ${incentive2Point ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-black/20 text-slate-600'}`}
                      >
                        Ek 2 Puan İndirim
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Main Result Area */}
            <div className="xl:col-span-2 space-y-8">
              {/* Top Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 rounded-[40px] bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl shadow-indigo-500/20 text-white group overflow-hidden relative"
                >
                  <div className="relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 block mb-2">YILLIK NET KAZANÇ</span>
                    <div className="text-4xl md:text-5xl font-black tracking-tighter mb-4 group-hover:scale-105 transition-transform origin-left">
                      {displayCurrency(totalTakeHome)}
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full w-fit backdrop-blur-md">
                      <TrendingUp size={14} />
                      <span className="text-[10px] font-black">TAHMİNİ YILLIK</span>
                    </div>
                  </div>
                  <Wallet className="absolute -right-8 -bottom-8 opacity-10 rotate-12" size={160} />
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-8 rounded-[40px] bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl shadow-emerald-500/20 text-white group overflow-hidden relative"
                >
                  <div className="relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 block mb-2">AYLIK ORTALAMA (NET)</span>
                    <div className="text-4xl md:text-5xl font-black tracking-tighter mb-4 group-hover:scale-105 transition-transform origin-left">
                      {displayCurrency(averageNet)}
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full w-fit backdrop-blur-md">
                      <Target size={14} />
                      <span className="text-[10px] font-black">HEDEF TUTAR</span>
                    </div>
                  </div>
                  <Coins className="absolute -right-8 -bottom-8 opacity-10 -rotate-12" size={160} />
                </motion.div>
              </div>

              {/* Chart and Breakdown Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2 bg-slate-950/40 rounded-[40px] border border-white/5 p-8 flex flex-col items-center justify-center">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Maaş Kesinti Dağılımı</h4>
                  <div className="w-full h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={8}
                          dataKey="value"
                          stroke="none"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6 w-full">
                    {chartData.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-3 bg-slate-950/40 rounded-[40px] border border-white/5 p-8">
                   <div className="space-y-6">
                      <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <ArrowUpRight className="text-indigo-400" size={18} />
                        DETAYLI ANALİZ
                      </h4>
                      <div className="space-y-4">
                        {[
                          { label: 'SGK + İşsizlik İşçi', value: (calculations[0]?.sgkEmployee + calculations[0]?.unemploymentEmployee), color: 'bg-indigo-500' },
                          { label: 'Gelir Vergisi', value: calculations[0]?.incomeTax, color: 'bg-rose-500' },
                          { label: 'Damga Vergisi', value: calculations[0]?.stampTax, color: 'bg-amber-500' },
                          { label: 'Vergi İstisnaları', value: (calculations[0]?.minWageIncomeTaxExemption + calculations[0]?.minWageStampTaxExemption), color: 'bg-emerald-500' },
                        ].map((item, idx) => (
                          <div key={idx} className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black">
                              <span className="text-slate-500 uppercase tracking-widest">{item.label}</span>
                              <span className="text-white font-mono">{formatCurrency(item.value || 0)}</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((item.value / calculations[0]?.gross) * 100 * 5, 100)}%` }}
                                className={`h-full ${item.color} rounded-full`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Monthly Table */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 bg-slate-900/60 backdrop-blur-2xl rounded-[40px] border border-white/5 overflow-hidden shadow-2xl"
          >
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                <ListFilter className="text-indigo-400" size={24} />
                Aylık Detay Bordro Cetveli
              </h3>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                <Table size={16} className="text-slate-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tam Liste</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-0">
                <thead>
                  <tr className="bg-black/40 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    <th className="px-6 py-5 border-b border-white/5 sticky left-0 bg-slate-900 z-10">Ay</th>
                    <th className="px-4 py-5 border-b border-white/5">SSK İşçi</th>
                    <th className="px-4 py-5 border-b border-white/5">İşsizlik İşçi</th>
                    <th className="px-4 py-5 border-b border-white/5">Gelir Vergisi</th>
                    <th className="px-4 py-5 border-b border-white/5">Damga Vergisi</th>
                    <th className="px-4 py-5 border-b border-white/5">Küm. Matrah</th>
                    <th className="px-4 py-5 border-b border-white/5 font-bold text-slate-300">Net</th>
                    <th className="px-4 py-5 border-b border-white/5">A.G.İ / Sosyal</th>
                    <th className="px-4 py-5 border-b border-white/5">GV İstisnası</th>
                    <th className="px-4 py-5 border-b border-white/5">DV İstisnası</th>
                    <th className="px-6 py-5 border-b border-white/5 text-indigo-400 font-bold">Ele Geçen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {calculations.map((calc, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 text-xs font-black text-white sticky left-0 bg-slate-900/80 backdrop-blur-md z-10 group-hover:bg-white/5">{calc.month}</td>
                      <td className="px-4 py-4 text-xs font-mono text-slate-400">{formatCurrency(calc.sgkEmployee)}</td>
                      <td className="px-4 py-4 text-xs font-mono text-slate-400">{formatCurrency(calc.unemploymentEmployee)}</td>
                      <td className="px-4 py-4 text-xs font-mono text-rose-400/80">{formatCurrency(calc.incomeTax)}</td>
                      <td className="px-4 py-4 text-xs font-mono text-amber-400/80">{formatCurrency(calc.stampTax)}</td>
                      <td className="px-4 py-4 text-xs font-mono text-slate-400">{formatCurrency(calc.cumulativeIncomeTaxBase)}</td>
                      <td className="px-4 py-4 text-xs font-mono text-slate-300 font-black">{formatCurrency(calc.net)}</td>
                      <td className="px-4 py-4 text-xs font-mono text-emerald-400/70">{formatCurrency(calc.agi)}</td>
                      <td className="px-4 py-4 text-xs font-mono text-indigo-400/70">{formatCurrency(calc.minWageIncomeTaxExemption)}</td>
                      <td className="px-4 py-4 text-xs font-mono text-indigo-400/70">{formatCurrency(calc.minWageStampTaxExemption)}</td>
                      <td className="px-6 py-4 text-sm font-black text-white bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors">
                        {formatCurrency(calc.totalNet)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Purchasing Power Section */}
          <div className="mb-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-500/10 rounded-3xl flex items-center justify-center text-indigo-400 border border-indigo-500/10 shadow-inner">
                  <Wallet size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tighter">
                    Anlık Alım Gücü Analizi
                  </h3>
                  <p className="text-xs font-bold text-slate-500 mt-1 max-w-lg leading-relaxed">
                    Seçili ayın (<span className="text-white">{months[selectedMonthIndex]}</span>) net kazancı olan <span className="text-emerald-400">{targetAmount ? formatCurrency(monthlyNet) : '---'}</span> tutarının, <span className="text-white italic">bugünkü canlı piyasa kurları</span> karşısındaki değeridir.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
                <div className="flex items-center gap-2 bg-black/40 p-2 rounded-2xl border border-white/5">
                  <span className="text-[9px] font-black text-slate-600 uppercase ml-2 tracking-widest">HESAP AYI:</span>
                  <select 
                    value={selectedMonthIndex}
                    onChange={(e) => setSelectedMonthIndex(Number(e.target.value))}
                    className="bg-transparent text-xs font-black text-white px-4 py-1 outline-none appearance-none cursor-pointer uppercase tracking-widest focus:text-indigo-400 transition-colors"
                  >
                    {months.map((month, idx) => (
                      <option key={idx} value={idx} className="bg-slate-900">{month}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="text-slate-500 mr-2" />
                </div>

                {!rates.loading && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Canlı Piyasa</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price Stability Disclaimer */}
            {selectedMonthIndex !== new Date().getMonth() && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-8 overflow-hidden"
              >
                <div className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-3xl flex items-start gap-3">
                  <div className="shrink-0 text-amber-500 mt-1">
                    <Info size={18} />
                  </div>
                  <p className="text-[11px] leading-relaxed font-bold text-slate-400">
                    <span className="text-amber-500 uppercase font-black mr-2">ÖNEMLİ:</span> 
                    Şu an <span className="text-white uppercase">{months[selectedMonthIndex]}</span> ayı için simülasyon yapıyorsunuz. Maaşınız o dönemde yatacak olsa dahi, 
                    buradaki karşılıklar <span className="text-white">bugünün ({new Date().toLocaleDateString('tr-TR')})</span> kurlarıdır. Zaman içindeki enflasyon ve kur farkı bu değerleri değiştirebilir.
                  </p>
                </div>
              </motion.div>
            )}

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] flex flex-col justify-between group transition-colors relative overflow-hidden">
                {/* Background Illustration */}
                <div className="absolute -right-6 -bottom-6 text-amber-500/5 group-hover:text-amber-500/10 transition-all duration-700 pointer-events-none">
                  <Gem size={140} className="rotate-12 group-hover:rotate-6 transition-transform duration-700" />
                </div>
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400 border border-amber-500/10">
                    <Gem size={24} />
                  </div>
                </div>
                <div className="mt-6 relative z-10">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Gram Altın</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white">{targetAmount ? gramsOfGold : '---'}</span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Adet</span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-4 font-bold border-t border-white/5 pt-4">
                    Birim: <span className="text-amber-500/80">{rates.loading ? '...' : formatCurrency(gramAltinPrice)}</span>
                  </p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] flex flex-col justify-between group transition-colors relative overflow-hidden">
                {/* Background Illustration */}
                <div className="absolute -right-6 -bottom-6 text-emerald-500/5 group-hover:text-emerald-500/10 transition-all duration-700 pointer-events-none">
                  <DollarSign size={140} className="-rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                </div>

                <div className="flex items-center justify-between relative z-10">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/10">
                    <DollarSign size={24} />
                  </div>
                </div>
                <div className="mt-6 relative z-10">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Amerikan Doları</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white">{targetAmount ? `$${dollars}` : '---'}</span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-4 font-bold border-t border-white/5 pt-4">
                    Kur: <span className="text-emerald-500/80">{rates.loading ? '...' : formatCurrency(usdPrice)}</span>
                  </p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] flex flex-col justify-between group transition-colors relative overflow-hidden">
                {/* Background Illustration */}
                <div className="absolute -right-6 -bottom-6 text-rose-500/5 group-hover:text-rose-500/10 transition-all duration-700 pointer-events-none">
                  <Coffee size={140} className="rotate-45 group-hover:rotate-12 transition-transform duration-700" />
                </div>

                <div className="flex items-center justify-between relative z-10">
                  <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-400 border border-rose-500/10">
                    <Coffee size={24} />
                  </div>
                </div>
                <div className="mt-6 relative z-10">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Bardak Kahve</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white">{targetAmount ? coffees : '---'}</span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bardak</span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-4 font-bold border-t border-white/5 pt-4">
                    Birim: <span className="text-rose-500/80">{formatCurrency(coffeePrice)}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Financial Future Planner Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 bg-slate-900 border border-white/5 rounded-[60px] overflow-hidden shadow-2xl"
          >
            <div className="p-12 md:p-16">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 mb-4">
                    <PiggyBank size={14} />
                    YILLIK BİRİKİM RADARI
                  </div>
                  <h3 className="text-3xl md:text-5xl font-black text-white tracking-tighter">Finansal Gelecek Planlayıcı</h3>
                  <div className="mt-6 flex flex-col gap-4">
                    <p className="text-[11px] font-bold text-slate-500 leading-relaxed max-w-xl">
                      Tüm yılın toplam kazancı üzerinden belirlediğiniz oranda tasarruf yapmanız durumunda oluşan <span className="text-white italic">Yıllık Birikim Potansiyeliniz.</span>
                    </p>
                    <div className="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-2xl">
                      <p className="text-[9px] text-slate-400 leading-normal">
                        <span className="text-indigo-400 font-black mr-2 uppercase">SİMU LASYON PARAMETRESİ:</span>
                        Bu hesaplama, <span className="text-white">Ocak - Aralık 2026</span> dönemindeki toplam tahmini net gelirinizin, <span className="text-white italic">anlık (bugünün)</span> piyasa kurları ile normalize edilmiş halidir. Alım gücü hesaplamasında bugünün fiyatları referans alınmıştır.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 px-8 py-6 rounded-3xl border border-white/10 text-center">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 italic">Hedef Tasarruf Oranı</span>
                   <span className="text-4xl font-black text-emerald-400">%{savingsRate}</span>
                </div>
              </div>

              <div className="space-y-16">
                <div className="relative p-2">
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={savingsRate}
                    onChange={(e) => setSavingsRate(Number(e.target.value))}
                    className="w-full h-3 bg-white/5 rounded-full appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all border border-white/10"
                  />
                  <div className="flex justify-between mt-6">
                    {[0, 20, 40, 60, 80, 100].map(p => (
                      <span key={p} className="text-[10px] font-black text-slate-600 uppercase tracking-widest">%{p}</span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   <div className="bg-white/5 p-10 rounded-[40px] border border-white/5 flex flex-col items-center gap-6">
                      <div className="w-16 h-16 bg-emerald-500/10 rounded-[28px] flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                         <Wallet size={32} />
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1 uppercase">Yıllık Birikim (TRY)</span>
                        <span className="text-3xl font-black text-white leading-none tracking-tighter">{displayCurrency(yearlySavings)}</span>
                      </div>
                   </div>

                   <div className="bg-white/5 p-10 rounded-[40px] border border-white/5 flex flex-col items-center gap-6">
                      <div className="w-16 h-16 bg-amber-500/10 rounded-[28px] flex items-center justify-center text-amber-400 border border-amber-500/20">
                         <Gem size={32} />
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1 uppercase">Altın Karşılığı</span>
                        <span className="text-3xl font-black text-white leading-none tracking-tighter">{targetAmount ? `${goldSavingsEquivalent} Gram` : '---'}</span>
                      </div>
                   </div>

                   <div className="bg-white/5 p-10 rounded-[40px] border border-white/5 flex flex-col items-center gap-6">
                      <div className="w-16 h-16 bg-indigo-500/10 rounded-[28px] flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                         <DollarSign size={32} />
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1 uppercase">USD Karşılığı</span>
                        <span className="text-3xl font-black text-white leading-none tracking-tighter">{targetAmount ? `${usdSavingsEquivalent} Dolar` : '---'}</span>
                      </div>
                   </div>
                </div>

                <div className="pt-12 border-t border-white/5 flex items-center justify-center gap-3">
                   <InfoIcon className="text-slate-600" size={16} />
                   <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest italic leading-none">Bu veriler simülasyon amaçlıdır, yatırım tavsiyesi değildir.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Legal Disclaimer */}
          <div className="mt-8 flex flex-col items-center gap-4 text-center border-t border-white/5 pt-10">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <Calculator size={14} />
              Ücretsiz Finansal Planlama Aracı
            </div>
            <div className="max-w-4xl bg-slate-900/50 p-6 rounded-2xl border border-white/5">
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic text-left">
                <AlertCircle size={12} className="inline-block mr-2 mb-0.5 text-slate-600" />
                Bu hesaplamada yer alan bilgiler sadece genel bilgilendirme amaçlıdır ve <strong>Karlısın</strong>, onun üye firmaları veya ilişkili kuruluşları tarafından profesyonel bağlamda herhangi bir tavsiye veya hizmet sunmayı amaçlamamakta ve bilgilerin doğruluğuna dair herhangi bir garanti vermemektedir. Şirketinizi, işinizi, finansmanınızı ya da mali durumunuzu etkileyecek herhangi bir karar ya da aksiyon almadan, yetkin bir profesyonel uzmana danışın. Karlısın Network bünyesinde bulunan hiçbir kuruluş, bu hesaplamada yer alan bilgilerin üçüncü kişiler tarafından kullanılması sonucunda ortaya çıkabilecek zarar veya ziyandan sorumlu değildir.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
