import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
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
  ShieldCheck,
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
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

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
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(new Date().getMonth());
  const [savingsRate, setSavingsRate] = useState(20);
  
  // Real-time rates state
  const [rates, setRates] = useState({
    usd: 36.42,
    gramAltin: 3280,
    updateTime: '',
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
        // TR piyasası için güvenilir bir endpoint
        const res = await fetch('https://finans.truncgil.com/v3/today.json');
        const data = await res.json();
        
        const parseValue = (val: string) => {
          if (!val) return 0;
          return parseFloat(val.replace(/\./g, '').replace(',', '.'));
        };

        const usdRate = parseValue(data.USD?.Selling);
        const gramAltinRate = parseValue(data['gram-altin']?.Selling);

        if (usdRate && gramAltinRate) {
          setRates({
            usd: usdRate,
            gramAltin: gramAltinRate,
            updateTime: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            loading: false
          });
        } else {
          throw new Error("API data incomplete");
        }
      } catch (error) {
        console.error("Rates fetch error:", error);
        // Fallback: Global API
        try {
          const res = await fetch('https://open.er-api.com/v6/latest/USD');
          const data = await res.json();
          const usdRate = data.rates.TRY;
          const approximateGoldUsd = 2735; // Güncel ONS yaklaşık
          const calculatedGramAltin = (approximateGoldUsd / 31.1035) * usdRate;
          setRates({
            usd: usdRate,
            gramAltin: calculatedGramAltin,
            updateTime: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            loading: false
          });
        } catch (innerError) {
          setRates(prev => ({ ...prev, loading: false })); 
        }
      }
    };

    fetchRates();
    // 5 dakikada bir güncelle
    const interval = setInterval(fetchRates, 300000);
    return () => clearInterval(interval);
  }, []);

  const MIN_WAGE_BRUT = 30002.50; 
  const TAX_BRACKETS = [190000, 400000, 1500000, 5300000];
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
    
    // Correct application of minimum wage tax exemptions (Exemptions cannot exceed calculated tax)
    const appliedIncomeTaxExemption = Math.min(incomeTax, mwIncomeTaxExemption);
    const appliedStampTaxExemption = Math.min(stampTax, mwStampTaxExemption);

    const totalNet = net + appliedIncomeTaxExemption + appliedStampTaxExemption + socialAid;

    let sgkEmployerRate = 0.205;
    if (incentive5Point) {
      sgkEmployerRate = 0.155; // 5 Puanlık indirim (Hazine Teşviki)
    } else if (incentive2Point) {
      sgkEmployerRate = 0.185; // 2 Puanlık ek indirim senaryosu (veya ilgili mevzuat oranı)
    }

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

  const formatCurrency = (val: number, decimals: number = 0) => {
    return new Intl.NumberFormat('tr-TR', { 
      style: 'currency', 
      currency: 'TRY', 
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals 
    }).format(val);
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
  
  const nextBracketInfo = (() => {
    // If no calculations yet, return a skeleton/placeholder state
    if (!calculations.length || !targetAmount) {
      return {
        limit: TAX_BRACKETS[0],
        remaining: null,
        progress: 0,
        progressInBracket: 0,
        hitMonth: null,
        netDrop: 0,
        currentRate: 15,
        nextRate: 20,
        bracketIndex: 0,
        isEmpty: true
      };
    }
    
    const currentMonthData = calculations[selectedMonthIndex] || calculations[0];
    const prevCumulative = currentMonthData.cumulativeIncomeTaxBase - currentMonthData.incomeTaxBase;
    
    let nextLimit = TAX_BRACKETS[0];
    let bracketIndex = 0;
    for (let i = 0; i < TAX_BRACKETS.length; i++) {
      if (prevCumulative >= TAX_BRACKETS[i]) {
        nextLimit = TAX_BRACKETS[i+1];
        bracketIndex = i + 1;
      } else {
        break;
      }
    }

    if (!nextLimit) return null;

    const remaining = nextLimit - prevCumulative;
    const totalBracketCapacity = nextLimit - (bracketIndex > 0 ? TAX_BRACKETS[bracketIndex - 1] : 0);
    const progressInCurrentBracket = Math.min(((prevCumulative - (bracketIndex > 0 ? TAX_BRACKETS[bracketIndex - 1] : 0)) / totalBracketCapacity) * 100, 100);
    const overallProgress = Math.min((prevCumulative / nextLimit) * 100, 100);
    
    const transitionMonth = calculations.find(c => c.cumulativeIncomeTaxBase > nextLimit);
    
    let netDrop = 0;
    if (transitionMonth) {
        const mIndex = calculations.indexOf(transitionMonth);
        if (mIndex > 0) {
            netDrop = calculations[mIndex - 1].totalNet - transitionMonth.totalNet;
        }
    }

    return {
      limit: nextLimit,
      remaining,
      progress: overallProgress,
      progressInBracket: progressInCurrentBracket,
      hitMonth: transitionMonth?.month,
      netDrop,
      currentRate: TAX_RATES[bracketIndex] * 100,
      nextRate: TAX_RATES[bracketIndex + 1] * 100,
      bracketIndex,
      isEmpty: false
    };
  })();

  // Purchasing Power Estimates based on selected month
  const currentMonthCalc = calculations[selectedMonthIndex] || calculations[0];
  const monthlyNet = currentMonthCalc?.totalNet || 0;

  const barChartData = calculations.length > 0 ? calculations.map(calc => ({
    month: calc.month,
    net: calc.totalNet,
    tax: calc.incomeTax + calc.stampTax
  })) : [
    { month: 'Oca', net: 100, tax: 20 },
    { month: 'Şub', net: 95, tax: 25 },
    { month: 'Mar', net: 90, tax: 30 },
    { month: 'Nis', net: 85, tax: 35 },
    { month: 'May', net: 80, tax: 40 },
    { month: 'Haz', net: 80, tax: 40 },
    { month: 'Tem', net: 75, tax: 45 },
    { month: 'Ağu', net: 75, tax: 45 },
    { month: 'Eyl', net: 75, tax: 45 },
    { month: 'Eki', net: 70, tax: 50 },
    { month: 'Kas', net: 70, tax: 50 },
    { month: 'Ara', net: 70, tax: 50 },
  ];

  const chartData = calculations.length > 0 ? [
    { name: 'Net Maaş', value: currentMonthCalc?.totalNet || 0, color: '#10B981' },
    { name: 'Gelir Vergisi', value: currentMonthCalc?.incomeTax || 0, color: '#F43F5E' },
    { name: 'SGK Primi', value: totalSGK / 12, color: '#6366F1' },
  ] : [
    { name: 'Net Maaş', value: 70, color: '#334155' },
    { name: 'Gelir Vergisi', value: 20, color: '#475569' },
    { name: 'SGK Primi', value: 10, color: '#1e293b' },
  ];

  const isDataEmpty = !targetAmount || calculations.length === 0;
  
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
    const data = calculations.map((calc) => {
      const row: any = {
        'Ay': calc.month,
        'Brüt Maaş': calc.gross,
        'SGK İşçi': calc.sgkEmployee,
        'İşsizlik Primi': calc.unemploymentEmployee,
        'Gelir Vergisi': calc.incomeTax,
        'Damga Vergisi': calc.stampTax,
        'Kümülatif Matrah': calc.cumulativeIncomeTaxBase,
        'Net Maaş': calc.totalNet,
      };

      if (showEmployerCost) {
        row['SSK İşveren'] = calc.sgkEmployer;
        row['İşsizlik İşveren'] = calc.unemploymentEmployer;
        row['Toplam İşveren Maliyeti'] = calc.totalEmployerCost;
      } else {
        row['Toplam İşveren Maliyeti'] = calc.totalEmployerCost;
      }

      return row;
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Maaş Hesaplama');
    XLSX.writeFile(wb, `Karlisin_Dashboard_${year}.xlsx`);
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Maaş nasıl hesaplanır?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Maaşınızın brüt tutarından %14 SGK işçi payı ve %1 işsizlik sigortası payı düşülür. Kalan gelir vergisi matrahı üzerinden, 2026 gelir vergisi dilimlerine göre (sırasıyla %15, %20, %27, %35, %40) vergi ve damga vergisi kesilerek net maaşınıza ulaşılır."
        }
      },
      {
        "@type": "Question",
        "name": "Vergi dilimi nedir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yıl içinde elde ettiğiniz kümülatif gelir vergisi matrahına göre uygulanan farklı vergi oranlarıdır. 2026 yılında dilimler 190.000 TL'den başlayarak kademeli olarak artmaktadır."
        }
      }
    ]
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Karlısın Maaş Hesaplama",
    "operatingSystem": "All",
    "applicationCategory": "FinancialApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "TRY"
    }
  };

  return (
    <div className="flex-grow">
      <Helmet>
        <title>2026 Bürütten Nete Maaş Hesaplama - Vergi Dilimi Takibi</title>
        <meta name="description" content="2026 güncel vergi dilimlerine göre net maaşınızı kuruşu kuruşuna hesaplayın. %20 ve %27'lik dilimlere hangi ay gireceğinizi anında görün." />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(softwareSchema)}</script>
      </Helmet>
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
                    2026 Maaş Hesaplama: <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Bürütten Nete Vergi Dilimi Analizi.</span>
                  </h1>
                  <div className="flex flex-wrap items-center gap-4">
                    <p className="text-xl text-slate-400 font-medium max-w-lg leading-relaxed">
                      2026 vergi mevzuatı ve güncel kümülatif matrah verilerine göre optimize edilmiş asgari ücret net hesaplama ve maaş yönetim sistemi.
                    </p>
                    <div className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center gap-2">
                       <Shield size={12} className="text-indigo-400" aria-label="Güvenlik İkonu - Karlısın" />
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
              className="xl:col-span-1 bg-slate-900/60 backdrop-blur-2xl p-8 rounded-[40px] border border-white/5 shadow-2xl space-y-8 h-full"
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
                      className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10"
                    >
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <button 
                          onClick={() => {
                            setIncentive5Point(!incentive5Point);
                            setIncentive2Point(false);
                          }}
                          className={`py-2 px-3 rounded-lg text-[9px] font-black tracking-tighter uppercase transition-all ${incentive5Point ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-black/20 text-slate-600'}`}
                        >
                          5 Puanlık İndirim
                        </button>
                        <button 
                           onClick={() => {
                             setIncentive2Point(!incentive2Point);
                             setIncentive5Point(false);
                           }}
                           className={`py-2 px-3 rounded-lg text-[9px] font-black tracking-tighter uppercase transition-all ${incentive2Point ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-black/20 text-slate-600'}`}
                        >
                          Ek 2 Puan İndirim
                        </button>
                      </div>
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">SGK İşveren Oranı:</span>
                        <span className="text-[10px] font-black text-white">
                          %{incentive5Point ? '15.5' : incentive2Point ? '18.5' : '20.5'}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Main Result Area */}
            <div className="xl:col-span-2 flex flex-col gap-8">
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

              {/* Akıllı Vergi Takvimi Card (Full Width) */}
              {nextBracketInfo && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 backdrop-blur-md border border-indigo-500/20 rounded-[40px] p-8 overflow-hidden relative group h-full flex flex-col justify-between"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400">
                            <AlertCircle size={22} className={nextBracketInfo.isEmpty ? "" : "animate-pulse"} />
                          </div>
                          <div>
                            <h2 className="text-2xl font-black text-white tracking-tighter">
                      Vergi Dilimleri Öngörüsü & Maaş Kaybı Analizi
                    </h2>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Sizin için geleceği takip ediyoruz</p>
                          </div>
                          <span className="ml-2 px-2 py-0.5 bg-indigo-400 text-black text-[8px] font-black rounded uppercase tracking-tighter shadow-lg shadow-indigo-500/20">PRO AKTİF</span>
                        </div>
                      </div>

                      {nextBracketInfo.hitMonth ? (
                        <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-3xl flex items-center gap-4 group-hover:border-indigo-500/30 transition-colors">
                          <Calendar size={24} className="text-indigo-400" />
                          <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Kritik Eşik Ayı</p>
                            <p className="text-xl font-black text-white leading-none">{nextBracketInfo.hitMonth}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-3xl flex items-center gap-4">
                          <Shield size={24} className={nextBracketInfo.isEmpty ? "text-slate-600" : "text-emerald-400"} />
                          <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Durum</p>
                            <p className="text-xl font-black text-white leading-none">{nextBracketInfo.isEmpty ? "--" : "Güvenli Bölge"}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-8 space-y-4 relative z-10">
                      <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest">
                        <div className="flex flex-col gap-1">
                          <span className="text-slate-500">Mevcut Oran</span>
                          <span className="text-white text-sm">%{nextBracketInfo.currentRate}</span>
                        </div>
                        <div className="text-center">
                          <span className="text-indigo-400 block mb-1">Yıl Sonu Yolculuğu</span>
                          <span className="text-white text-[10px] block">İlerleme: %{nextBracketInfo.isEmpty ? "0.0" : nextBracketInfo.progress.toFixed(1)}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-slate-500">Sonraki Oran</span>
                          <span className="text-white text-sm">%{nextBracketInfo.nextRate}</span>
                        </div>
                      </div>
                      
                      <div className="h-4 bg-black/40 rounded-full border border-white/5 p-1 relative">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${nextBracketInfo.progress}%` }}
                          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_auto] animate-gradient-x rounded-full shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                        />
                        {/* Target Marker */}
                        <div className="absolute top-1/2 -translate-y-1/2 right-0 w-1 h-3 bg-white/20 rounded-full blur-[1px]" />
                      </div>
                      <div className="flex justify-center">
                        <p className="text-[11px] font-medium text-slate-400">
                          Üst dilime <span className="text-white font-black">{nextBracketInfo.remaining ? formatCurrency(nextBracketInfo.remaining) : "--"}</span> kaldı
                        </p>
                      </div>
                    </div>

                    {/* Kritik Uyarı Alanı (Her Zaman Sabit) */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-6 flex items-start gap-4 p-5 rounded-[30px] border transition-all duration-500 ${
                        nextBracketInfo.isEmpty 
                          ? 'bg-white/5 border-white/5 opacity-40' 
                          : nextBracketInfo.netDrop > 0 
                            ? 'bg-rose-500/10 border-rose-500/20' 
                            : 'bg-emerald-500/10 border-emerald-500/20'
                      }`}
                    >
                       <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                         nextBracketInfo.isEmpty 
                           ? 'bg-white/10 text-slate-500' 
                           : nextBracketInfo.netDrop > 0 
                             ? 'bg-rose-500/20 text-rose-400' 
                             : 'bg-emerald-500/20 text-emerald-400'
                       }`}>
                         {nextBracketInfo.isEmpty || nextBracketInfo.netDrop > 0 ? (
                           <TrendingUp className="rotate-180" size={20} />
                         ) : (
                           <ShieldCheck size={20} />
                         )}
                       </div>
                       <div>
                          <p className={`text-sm font-black mb-1 ${
                            nextBracketInfo.isEmpty ? 'text-slate-500' : 'text-white'
                          }`}>
                            {nextBracketInfo.isEmpty 
                              ? 'Net Maaş Kaybı Analizi' 
                              : nextBracketInfo.netDrop > 0 
                                ? 'Net Maaş Kaybı Uyarısı' 
                                : 'Maaş Koruma Durumu'}
                          </p>
                          
                          {nextBracketInfo.isEmpty ? (
                            <p className="text-xs font-medium text-slate-600 leading-relaxed italic">
                              Maaş bilginizi girdiğinizde; yıl içindeki vergi dilimi geçişlerini, hangi ayda ne kadar net maaş kaybı yaşayacağınızı burada proaktif olarak görebileceksiniz.
                            </p>
                          ) : nextBracketInfo.netDrop > 0 ? (
                            <p className="text-xs font-medium text-slate-400 leading-relaxed">
                              Dikkat! <span className="text-white font-black">{nextBracketInfo.hitMonth}</span> ayında kümülatif matrahınız <span className="text-white font-black">{formatCurrency(nextBracketInfo.limit)}</span> sınırını aşacağı için vergi diliminiz <span className="text-rose-400 font-bold">%{nextBracketInfo.nextRate}</span>'e yükselecek. Ay bazında net kazancınız <span className="text-rose-400 font-black">{formatCurrency(nextBracketInfo.netDrop)}</span> azalacak.
                            </p>
                          ) : (
                            <p className="text-xs font-medium text-slate-400 leading-relaxed">
                              Tebrikler! Mevcut maaş profilinizle yıl boyunca <span className="text-emerald-400 font-black">%{nextBracketInfo.currentRate}</span> vergi diliminde kalıyorsunuz. Herhangi bir net maaş kaybı öngörülmemektedir.
                            </p>
                          )}
                       </div>
                    </motion.div>

                    <AlertCircle className="absolute -right-16 -bottom-16 opacity-[0.03] -rotate-12 text-white" size={320} />
                  </motion.div>
                )}
            </div>
          </div>

          {/* Yeni: Aylık Analiz Grid (Sola doğru genişleyen ve tam genişlikte olan alan) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 w-full">
                {/* Maaş Seyri */}
                <div className={`md:col-span-1 bg-slate-950/40 rounded-[40px] border border-white/5 p-8 flex flex-col h-full group hover:border-indigo-500/20 transition-all ${isDataEmpty ? 'opacity-40' : ''}`}>
                  <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                    <ArrowUpRight className="text-emerald-400" size={14} />
                    Aylık Net Maaş Seyri
                  </h4>
                  <div className="w-full h-56 mt-auto">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                        <XAxis 
                          dataKey="month" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#475569', fontSize: 7, fontWeight: 800 }}
                          interval={1}
                        />
                        <YAxis hide />
                        {!isDataEmpty && (
                          <RechartsTooltip 
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                const index = barChartData.findIndex(d => d.month === label);
                                const prevNet = index > 0 ? barChartData[index - 1].net : data.net;
                                const drop = prevNet - data.net;
                                
                                return (
                                  <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-2xl">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{label}</p>
                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between gap-4">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Net Maaş:</span>
                                        <span className="text-xs font-black text-emerald-400">{formatCurrency(data.net)}</span>
                                      </div>
                                      {drop > 0 && (
                                        <div className="flex items-center justify-between gap-4 pt-1 border-t border-white/5">
                                          <span className="text-[10px] font-bold text-rose-500/80 uppercase">Kayıp:</span>
                                          <span className="text-xs font-black text-rose-400">-{formatCurrency(drop)}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        )}
                        <Bar 
                          dataKey="net" 
                          radius={[6, 6, 0, 0]}
                          barSize={12}
                        >
                          {barChartData.map((entry, index) => {
                            const maxNet = Math.max(...barChartData.map(d => d.net));
                            const prevNet = index > 0 ? barChartData[index - 1].net : entry.net;
                            const isMax = entry.net === maxNet && !isDataEmpty;
                            const isDropped = entry.net < prevNet && !isDataEmpty;
                            
                            let fillColor = "#6366F1"; // Sabit maaş (Indigo)
                            if (isDataEmpty) fillColor = "#334155";
                            else if (isDropped) fillColor = "#F43F5E"; // Düşüş (Kırmızı)
                            else if (isMax) fillColor = "#10B981"; // En Yüksek (Yeşil)

                            return (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={fillColor}
                                className={isDropped ? "animate-pulse" : ""}
                              />
                            );
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-[8px] font-bold text-slate-700 mt-6 text-center uppercase tracking-[0.2em]">
                    {isDataEmpty ? 'Girdi Bekleniyor...' : 'YIL BOYU NET MAAŞ DEĞİŞİM GRAFİĞİ'}
                  </p>
                </div>

                {/* Dağılım */}
                <div className={`md:col-span-1 bg-slate-950/40 rounded-[40px] border border-white/5 p-8 flex flex-col items-center h-full group hover:border-indigo-500/20 transition-all ${isDataEmpty ? 'opacity-40' : ''}`}>
                  <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-12 flex items-center gap-2 self-start">
                    <ArrowUpRight className="text-amber-400" size={14} />
                    DAĞILIM
                  </h4>
                  <div className="w-full h-56 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={10}
                          dataKey="value"
                          stroke="none"
                          cornerRadius={10}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        {!isDataEmpty && (
                          <RechartsTooltip 
                            contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                            formatter={(value: number) => [formatCurrency(value), '']}
                          />
                        )}
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">Gider Dağılımı</span>
                      <span className="text-sm font-black text-white">{isDataEmpty ? '--' : '%100'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 mt-auto w-full max-w-[140px]">
                    {chartData.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between group/item">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-[9px] font-black text-slate-500 uppercase group-hover/item:text-slate-300 transition-colors">{item.name}</span>
                        </div>
                        <span className="text-[9px] font-black text-white">
                          {isDataEmpty ? '--' : `%${((item.value / (chartData.reduce((a, b) => a + b.value, 0) || 1)) * 100).toFixed(0)}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detaylı Analiz */}
                <div className={`md:col-span-1 bg-slate-950/40 rounded-[40px] border border-white/5 p-8 h-full group hover:border-indigo-500/20 transition-all ${isDataEmpty ? 'opacity-40' : ''}`}>
                   <div className="space-y-8 h-full flex flex-col">
                      <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                        <ArrowUpRight className="text-indigo-400" size={14} />
                        DETAYLI ANALİZ
                      </h4>
                      
                      <div className="space-y-6 flex-grow">
                        {(isDataEmpty ? [
                          { label: 'SGK + İŞSİZLİK İŞÇİ', value: 15, color: '#334155', dummyValue: '15000' },
                          { label: 'GELİR VERGİSİ', value: 12, color: '#475569', dummyValue: '12750' },
                          { label: 'DAMGA VERGİSİ', value: 3, color: '#1e293b', dummyValue: '759' },
                          { label: 'VERGİ İSTİSNALARI', value: 8, color: '#0f172a', dummyValue: '4053' }
                        ] : [
                          { label: 'SGK + İŞSİZLİK İŞÇİ', value: (calculations[0]?.sgkEmployee + calculations[0]?.unemploymentEmployee) || 0, color: '#6366F1' },
                          { label: 'GELİR VERGİSİ', value: calculations[0]?.incomeTax || 0, color: '#F43F5E' },
                          { label: 'DAMGA VERGİSİ', value: calculations[0]?.stampTax || 0, color: '#F59E0B' },
                          { label: 'VERGİ İSTİSNALARI', value: (calculations[0]?.minWageIncomeTaxExemption + calculations[0]?.minWageStampTaxExemption) || 0, color: '#10B981' }
                        ]).map((item, idx) => (
                          <div key={idx} className="space-y-2">
                            <div className="flex justify-between items-end">
                              <span className="text-[9px] font-black text-slate-500 tracking-wider uppercase">{item.label}</span>
                              <span className="text-xs font-black text-white">
                                {isDataEmpty ? (item as any).dummyValue ? `₺0` : '--' : formatCurrency(item.value)}
                              </span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ 
                                  width: isDataEmpty 
                                    ? `${item.value}%` 
                                    : `${Math.min((item.value / (calculations[0]?.gross || 1)) * 100 * 5, 100)}%` 
                                }}
                                className="h-full rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                            </div>
                          </div>
                        ))}
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
            <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                    <ListFilter size={18} />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-wider">Aylık Detay Bordro Cetveli</h3>
                </div>
                <div className="flex items-center gap-2 mt-1 px-1">
                  <AlertCircle size={12} className="text-slate-500 shrink-0" />
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                    Bu veriler tahminidir. Şirketinizden maaş bordronuzu almayı unutmayın.
                  </p>
                </div>
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
                    {showEmployerCost && (
                      <>
                        <th className="px-4 py-5 border-b border-white/5 text-amber-400">SSK İşveren</th>
                        <th className="px-4 py-5 border-b border-white/5 text-amber-400">İşsizlik İşveren</th>
                        <th className="px-4 py-5 border-b border-white/5 text-amber-400">Toplam Maliyet</th>
                      </>
                    )}
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
                      {showEmployerCost && (
                        <>
                          <td className="px-4 py-4 text-xs font-mono text-amber-400/80">{formatCurrency(calc.sgkEmployer)}</td>
                          <td className="px-4 py-4 text-xs font-mono text-amber-400/80">{formatCurrency(calc.unemploymentEmployer)}</td>
                          <td className="px-4 py-4 text-xs font-mono text-amber-400 font-black">{formatCurrency(calc.totalEmployerCost)}</td>
                        </>
                      )}
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
                  <p className="text-[9px] text-slate-400 mt-4 font-bold border-t border-white/5 pt-4 flex justify-between items-center">
                    <span>Birim: <span className="text-amber-500/80">{rates.loading ? '...' : formatCurrency(gramAltinPrice, 2)}</span></span>
                    {!rates.loading && <span className="text-[8px] opacity-50">{rates.updateTime}</span>}
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
                  <p className="text-[9px] text-slate-400 mt-4 font-bold border-t border-white/5 pt-4 flex justify-between items-center">
                    <span>Kur: <span className="text-emerald-500/80">{rates.loading ? '...' : formatCurrency(usdPrice, 2)}</span></span>
                    {!rates.loading && <span className="text-[8px] opacity-50">{rates.updateTime}</span>}
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
            <div className="mt-24 border-t border-white/5 pt-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-slate-400">
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">Vergi Dilimleri Nasıl Hesaplanır?</h2>
                  <p className="text-sm leading-relaxed text-left">
                    2026 yılı gelir vergisi tarifesi, kümülatif gelir matrahınız üzerinden kademeli olarak hesaplanır. 
                    Maaşınızdan SGK ve İşsizlik primi düşüldükten sonra kalan tutar vergi matrahınızı oluşturur. 
                    Bu matrah yıl boyunca toplandıkça (kümülatif matrah), girdiğiniz dilime göre vergi oranınız %15'ten %40'a kadar çıkabilir. 
                    Karlısın ile kümülatif matrah hesapla işlemini kuruşu kuruşuna gerçekleştirebilirsiniz.
                  </p>
                </div>
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">Maaş Kesintileri Listesi</h2>
                  <p className="text-sm leading-relaxed text-left">
                    Bordronuzda yer alan temel kalemler şunlardır: SGK İşçi Payı (%14), İşsizlik Sigortası (%1), 
                    Gelir Vergisi ve Damga Vergisi. Asgari ücret net hesaplama 2026 verilerine göre, 
                    asgari ücretli her çalışanın maaşında gelir ve damga vergisi istisnası uygulanmaktadır. 
                    Bu hesaplamada yasal tüm istisnalar anlık olarak uygulanmaktadır.
                  </p>
                </div>
              </div>
            </div>
          </div>
      </section>
    </div>
  );
}
