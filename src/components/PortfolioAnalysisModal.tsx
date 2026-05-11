import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Upload, 
  Table as TableIcon, 
  Sparkles, 
  AlertTriangle, 
  History, 
  ChevronRight, 
  Plus, 
  Trash2, 
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Bot,
  Info,
  ScanLine
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { cn, getApiUrl, isDevOrPreview, getDeviceId } from '../lib/utils';
import { 
  extractPortfolioFromImage, 
  analyzePortfolio, 
  saveAnalysis, 
  checkDailyLimit, 
  getTodayAnalysis,
  getAnalysisHistory,
  PortfolioItem,
  AnalysisResult
} from '../services/portfolioService';

interface PortfolioAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormattedNumberInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  options?: Intl.NumberFormatOptions;
}

const FormattedNumberInput: React.FC<FormattedNumberInputProps> = ({ value, onChange, className, options }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [localStr, setLocalStr] = useState(value ? value.toString() : '');

  useEffect(() => {
    if (!isFocused) {
      setLocalStr(value ? value.toString() : '');
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalStr(val);
    let parsedVal = val.replace(/,/g, '.');
    const parts = parsedVal.split('.');
    if (parts.length > 2) {
       parsedVal = parts.slice(0, -1).join('') + '.' + parts[parts.length - 1];
    }
    const num = parseFloat(parsedVal);
    onChange(isNaN(num) ? 0 : num);
  };

  const formatted = value ? new Intl.NumberFormat('tr-TR', options).format(value) : '';

  return (
    <input
      type="text"
      inputMode="decimal"
      value={isFocused ? localStr : formatted}
      onChange={handleChange}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={className}
    />
  );
};

export const PortfolioAnalysisModal: React.FC<PortfolioAnalysisModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'upload' | 'preview' | 'edit' | 'analyzing' | 'result' | 'history' | 'limit' | 'checking_limit'>('checking_limit');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canAnalyze, setCanAnalyze] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<{ status: string; message: string; remaining?: number; remainingExtract?: number; ip?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
      checkInitialLimit();
      checkAiStatus();
    }
  }, [isOpen]);

  const checkAiStatus = async () => {
    try {
      try {
        const res = await fetch(getApiUrl(`/api/portfolio/ai-status?t=${Date.now()}`), {
          headers: { 'x-device-id': getDeviceId() }
        });
        const contentType = res.headers.get("content-type");
        if (res.ok && contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setAiStatus(data);
          return;
        }
      } catch (e) {
        console.warn("Backend ai-status check failed", e);
      }

      setAiStatus({
        status: 'missing',
        message: 'AI Servis Anahtarı Bulunamadı',
        remaining: 0,
        ip: 'client'
      });
    } catch (err) {
      console.error("AI Status check error:", err);
      setAiStatus({
        status: 'missing',
        message: 'AI Servis Anahtarı Bulunamadı',
        remaining: 0,
        ip: 'client'
      });
    }
  };

  const checkInitialLimit = async () => {
    try {
      const { canAnalyze: allowed } = await checkDailyLimit();
      setCanAnalyze(allowed);
      setStep(allowed ? 'upload' : 'limit');
    } catch (err) {
      console.warn("Limit check bypassed:", err);
      setStep('upload');
    }
  };

  const loadHistory = async () => {
    try {
      const data = await getAnalysisHistory();
      setHistory(data);
    } catch (err) {
      console.warn("History load failed:", err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        setSelectedImage(base64);
        setStep('preview');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Dosya yükleme hatası.");
    }
  };

  const handleExtractImage = async () => {
    if (!selectedImage) return;
    setLoading(true);
    setError(null);
    try {
      const extracted = await extractPortfolioFromImage(selectedImage);
      setItems(extracted);
      setStep('edit');
      checkAiStatus();
    } catch (err: any) {
      const errMsg = err.message || "";
      setError(errMsg || "Görsel okunamadı. Lütfen manuel giriş yapın.");
      setItems([{ symbol: '', amount: 0, cost: 0 }]);
      setStep('edit');
    } finally {
      setLoading(false);
    }
  };

  const handleManualEntry = () => {
    setItems([{ symbol: '', amount: 0, cost: 0 }]);
    setStep('edit');
  };

  const handleAddItem = () => {
    setItems([...items, { symbol: '', amount: 0, cost: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: keyof PortfolioItem, value: string | number) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    if (field === 'amount' || field === 'cost') {
      newItems[index].totalValue = undefined;
    }
    setItems(newItems);
  };

  const startAnalysis = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    
    try {
      // Step: Analyzing
      setStep('analyzing');
      
      // Guest-first analysis call
      const res = await analyzePortfolio(items);
      setResult(res);
      
      try {
        await saveAnalysis(res);
      } catch (saveErr) {
        console.warn("Save analysis skipped:", saveErr);
      }
      
      setStep('result');
      // Update local status
      checkAiStatus();
    } catch (err: any) {
      console.error("Analysis Error:", err);
      const errMsg = err.message || "";
      
      if (err.message?.includes('429') || err.message?.includes('limiti doldu')) {
        setStep('limit');
        return;
      }

      setError(errMsg || "Sunucu bağlantı hatası oluştu. Lütfen teknik ekiple iletişime geçin veya daha sonra tekrar deneyin.");
      setStep('edit');
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentStep = () => {
    switch (step) {
      case 'checking_limit':
        return (
          <div className="flex flex-col items-center justify-center p-12 text-center space-y-6">
            <div className="w-16 h-16 bg-slate-900 border border-slate-700/50 rounded-full flex items-center justify-center animate-pulse">
              <Bot className="w-8 h-8 text-slate-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">ANALİZ DURUMU KONTROL EDİLİYOR</h3>
              <p className="text-xs text-slate-400">Lütfen bekleyin...</p>
            </div>
          </div>
        );
      case 'upload':
        if (loading) {
          return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-8">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping"></div>
                <div className="w-20 h-20 bg-slate-900 border border-indigo-500/30 rounded-full flex items-center justify-center relative z-10 animate-pulse">
                  <Bot className="w-8 h-8 text-indigo-400" />
                </div>
                {/* Scanning line effect */}
                <div className="absolute w-full h-[2px] bg-indigo-400 blur-[1px] animate-scan z-20 rounded-full shadow-[0_0_10px_2px_rgba(99,102,241,0.5)]"></div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                  Görsel Analiz Ediliyor
                </h3>
                <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Yapay zeka portföyünüzdeki hisse senedi maliyet ve miktar verilerini eşleştiriyor. 
                  <br/><span className="text-indigo-400 font-bold mt-1 block">Bu işlem biraz sürebilir, lütfen bekleyin...</span>
                </p>
              </div>
            </div>
          );
        }

        return (
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400">
              <Upload className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Portföy Görselini Yükle</h3>
              <p className="text-sm text-slate-400 mt-2">Borsa uygulamanızın ekran görüntüsünü yükleyin, yapay zeka verileri otomatik okusun.</p>
            </div>

            {/* AI Status Indicator */}
            {aiStatus && (
              <div className="flex flex-col items-center gap-2">
                <div className={cn(
                  "inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-4 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all",
                  aiStatus.status === 'authenticated' 
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                    : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                )}>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full animate-pulse",
                      aiStatus.status === 'authenticated' ? "bg-emerald-500" : "bg-rose-500"
                    )} />
                    {aiStatus.status === 'authenticated' ? 'AI AKTİF' : 'AI BAĞLANTI HATASI'}
                  </div>
                  {aiStatus.status === 'authenticated' && (
                    <>
                      <div className="hidden sm:block w-px h-3 bg-emerald-500/30"></div>
                      <div className="flex items-center justify-center gap-3 text-[9px] opacity-90 text-center sm:text-left">
                        <span className="flex items-center gap-1.5" title="Görsel Okuma Hakkı"><ScanLine className="w-3 h-3" /> GÖRSEL: {aiStatus.remainingExtract ?? 0}/1</span>
                        <div className="w-px h-2 bg-emerald-500/30"></div>
                        <span className="flex items-center gap-1.5" title="Manuel Analiz Hakkı"><TableIcon className="w-3 h-3" /> ANALİZ: {aiStatus.remaining ?? 0}/3</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-3 p-6 bg-slate-900 border border-white/5 rounded-2xl hover:border-indigo-500/50 hover:bg-slate-800 transition-all group"
              >
                <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-white uppercase">Görsel Seç</span>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </button>
              <button 
                onClick={handleManualEntry}
                className="flex flex-col items-center gap-3 p-6 bg-slate-900 border border-white/5 rounded-2xl hover:border-emerald-500/50 hover:bg-slate-800 transition-all group"
              >
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <TableIcon className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-white uppercase">Elle Gir</span>
              </button>
            </div>
            <button 
              onClick={() => setStep('history')}
              className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 hover:text-indigo-300"
            >
              <History className="w-3 h-3" />
              ÖNCEKİ ANALİZLERİNİ GÖR
            </button>
          </div>
        );

      case 'preview':
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-6">
            <div className="w-full max-w-sm rounded-xl overflow-hidden border border-white/10 shadow-2xl relative bg-slate-900/50">
               {selectedImage && <img src={selectedImage} alt="Portföy Önizleme" className={cn("w-full h-auto object-contain transition-all duration-700", loading ? "opacity-30 grayscale blur-[2px]" : "opacity-80")} />}
               {loading && (
                 <>
                    <div className="absolute inset-0 bg-indigo-500/10 mix-blend-overlay z-10" />
                    <motion.div 
                      initial={{ top: 0 }}
                      animate={{ top: "100%" }}
                      transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                      className="absolute left-0 right-0 h-1 bg-indigo-500 shadow-[0_0_20px_4px_rgba(99,102,241,0.8)] z-20" 
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-30">
                       <motion.div 
                         initial={{ opacity: 0.5, scale: 0.95 }}
                         animate={{ opacity: 1, scale: 1 }}
                         transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                         className="bg-slate-900/90 backdrop-blur-sm border border-indigo-500/50 px-5 py-3 rounded-xl flex items-center justify-center gap-3 shadow-2xl"
                       >
                          <ScanLine className="w-6 h-6 text-indigo-400" />
                          <div className="flex flex-col text-left">
                            <span className="text-sm font-black tracking-widest text-indigo-400 uppercase leading-none mb-1">YAPAY ZEKA</span>
                            <span className="text-[10px] font-bold text-slate-300 leading-none">Görseli Analiz Ediyor...</span>
                          </div>
                       </motion.div>
                    </div>
                 </>
               )}
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Görsel Onayı</h3>
              <p className="text-sm text-slate-400 mt-2">Bu görselden verileri okuyup çıkartacağız. Devam etmek istiyor musun?</p>
            </div>
            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-bold uppercase">{error}</div>}
            
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-3 text-left">
              <Info className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-amber-500 text-xs uppercase tracking-widest block mb-1">GÜNLÜK LİMİT UYARISI</strong>
                <p className="text-amber-500/80 text-[10px] font-medium leading-relaxed">
                  Görselden veri okuma işlemi maliyetli bir yapay zeka işlemidir. Bu nedenle <strong>günde sadece 1 kez</strong> görsel okutabilirsiniz. Lütfen net okunabilen bir görsel seçtiğinizden emin olun.
                </p>
              </div>
            </div>

            <div className="flex w-full gap-3">
              <button 
                onClick={() => setStep('upload')}
                disabled={loading}
                className="flex-1 py-4 bg-slate-800 text-slate-300 rounded-2xl font-black uppercase tracking-[0.1em] hover:bg-slate-700 transition-all text-xs disabled:opacity-50"
              >
                İptal Et
              </button>
              <button 
                onClick={handleExtractImage}
                disabled={loading || (aiStatus?.remainingExtract === 0)}
                className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.1em] shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all text-[11px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin flex-shrink-0" /> : <Bot className="w-4 h-4 flex-shrink-0" />}
                <span className="truncate">{loading ? 'OKUNUYOR...' : 'GÖRSELİ OKU (1 HAK)'}</span>
              </button>
            </div>
            {(aiStatus?.remainingExtract === 0) ? (
              <p className="text-[11px] text-rose-400 text-center font-bold px-4 py-2 bg-rose-500/10 rounded-lg">GÜNLÜK GÖRSEL OKUMA HAKKINIZ BİTTİ. ALT TARAFTAKİ ELLE GİR BUTONU İLE İŞLEM YAPABİLİRSİNİZ VEYA YARIN TEKRAR DENEYEBİLİRSİNİZ.</p>
            ) : (
              <p className="text-[10px] text-slate-500 text-center font-bold">GÜNLÜK 1 GÖRSEL OKUMA HAKKINIZIN {aiStatus?.remainingExtract ?? 0} ADEDİ KALDI.</p>
            )}
          </div>
        );

      case 'edit':
        return (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Verileri Kontrol Et</h3>
              <button onClick={handleAddItem} className="px-3 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-500/20">
                <Plus className="w-3 h-3" /> EKLE
              </button>
            </div>
            
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-300 text-xs font-medium leading-relaxed">
              <strong>Yapay Zeka Notu:</strong> Görselindeki fiyat verilerini ve anlık piyasa fiyatlarını eşleştirerek adet ve ortalama maliyet bilgilerini senin için otomatik olarak doldurmaya çalıştım. Hesaplamalarda ufak sapmalar olabilir; kendi gerçek maliyetini buradan manuel olarak da güncelleyebilirsin. Maliyetini güncellediğinde analizimiz çok daha nokta atışı olacaktır.
            </div>

            <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
              <table className="w-full min-w-[500px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Sembol</th>
                    <th className="py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-24">
                      <div className="flex items-center gap-1 group relative cursor-help">
                        <span>Adet/Lot</span>
                        <Info className="w-3 h-3 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-slate-200 text-[10px] rounded leading-relaxed font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-xl pointer-events-none text-center">
                          Tahmini olarak hesaplanmıştır. Kendi gerçek verinizi manuel düzeltebilirsiniz.
                        </div>
                      </div>
                    </th>
                    <th className="py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-24">
                       <div className="flex items-center gap-1 group relative cursor-help">
                        <span>Maliyet</span>
                        <Info className="w-3 h-3 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                         <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-slate-200 text-[10px] rounded leading-relaxed font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-xl pointer-events-none text-center">
                          Tahmini olarak hesaplanmıştır. Kendi gerçek verinizi manuel düzeltebilirsiniz.
                        </div>
                      </div>
                    </th>
                    <th className="py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Tutar</th>
                    <th className="py-3 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {items.map((item, idx) => (
                    <tr key={idx} className="group">
                      <td className="py-3 pr-2">
                        <input 
                          type="text" 
                          value={item.symbol} 
                          onChange={(e) => handleUpdateItem(idx, 'symbol', e.target.value.toUpperCase())}
                          className="w-full bg-slate-900/50 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white uppercase font-bold focus:ring-1 focus:ring-indigo-500 outline-none"
                          placeholder="THYAO"
                        />
                      </td>
                      <td className="py-3 pr-2">
                        <FormattedNumberInput 
                          value={item.amount || 0} 
                          onChange={(val) => handleUpdateItem(idx, 'amount', val)}
                          className="w-full bg-slate-900/50 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white font-bold focus:ring-1 focus:ring-indigo-500 outline-none"
                          options={{ maximumFractionDigits: 4 }}
                        />
                      </td>
                      <td className="py-3 pr-2">
                        <FormattedNumberInput 
                          value={item.cost || 0} 
                          onChange={(val) => handleUpdateItem(idx, 'cost', val)}
                          className="w-full bg-slate-900/50 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white font-bold focus:ring-1 focus:ring-indigo-500 outline-none"
                          options={{ maximumFractionDigits: 4 }}
                        />
                      </td>
                      <td className="py-3 pr-2">
                        <FormattedNumberInput 
                          value={item.totalValue ?? (item.amount || 0) * (item.cost || 0)} 
                          onChange={(val) => handleUpdateItem(idx, 'totalValue', val)}
                          className="w-full bg-slate-900/50 border border-emerald-500/30 rounded-lg px-3 py-1.5 text-xs text-emerald-400 font-black focus:ring-1 focus:ring-emerald-500 outline-none text-right"
                          options={{ maximumFractionDigits: 2 }}
                        />
                      </td>
                      <td className="py-3 text-right">
                        <button onClick={() => handleRemoveItem(idx)} className="text-slate-600 hover:text-red-400 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-bold uppercase">{error}</div>}
            <div className="flex flex-col gap-3">
              <button 
                onClick={startAnalysis}
                disabled={aiStatus?.remaining === 0}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                YORUMU OLUŞTUR (1 HAK)
              </button>
              {(aiStatus?.remaining === 0) ? (
                <p className="text-[11px] text-rose-400 text-center font-bold px-4 py-2 bg-rose-500/10 rounded-lg">GÜNLÜK ANALİZ (YORUM OLUŞTURMA) HAKKINIZ BİTTİ. YARIN TEKRAR DENEYEBİLRİSİNİZ.</p>
              ) : (
                <p className="text-[10px] text-slate-500 text-center font-bold">GÜNLÜK 3 ANALİZ HAKKINIZIN {aiStatus?.remaining ?? 0} ADEDİ KALDI.</p>
              )}
            </div>
          </div>
        );

      case 'analyzing':
        return (
          <div className="flex flex-col items-center justify-center p-12 text-center space-y-8">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
              <Sparkles className="w-6 h-6 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Veriler Analiz Ediliyor...</h3>
              <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto">Portföy sağlığın, dağılımın ve teknik görünüm yapay zeka tarafından inceleniyor.</p>
            </div>
          </div>
        );

      case 'result':
        return (
          <div className="p-6 space-y-6">
            {message && (
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 text-[10px] font-bold uppercase text-center">
                {message}
              </div>
            )}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center gap-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Bot className="w-24 h-24 text-indigo-400" />
                </div>
                <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center border border-white/5 relative z-10">
                  <span className="text-2xl font-black text-indigo-400">{result?.score || 0}</span>
                  <span className="text-[8px] font-bold text-slate-500 absolute bottom-1 uppercase">SKOR</span>
                </div>
                <div className="flex flex-col z-10">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5"><Sparkles className="w-3 h-3"/> AI PORTFÖY ANALİZİ</span>
                  <h3 className="text-white font-black uppercase text-sm mt-0.5">ANALİZ TAMAMLANDI</h3>
                </div>
              </div>

              {/* Overall Financial Summary */}
              {result?.portfolio && result.portfolio.length > 0 && (() => {
                const totalCost = result.portfolio.reduce((acc, item) => acc + (item.totalValue || (item.amount * item.cost) || 0), 0);
                const liveTotal = result.portfolio.reduce((acc, item) => acc + (item.liveTotalValue || item.totalValue || (item.amount * item.cost) || 0), 0);
                const totalProfit = liveTotal - totalCost;
                const totalProfitPercentage = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
                const isOverallProfit = totalProfit > 0;
                const isOverallLoss = totalProfit < 0;

                return (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-6 bg-slate-900 border border-white/5 rounded-2xl flex flex-col justify-center items-center relative overflow-hidden">
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                         <Sparkles className="w-3 h-3 text-emerald-400"/> TOPLAM PORTFÖY DEĞERİ
                       </span>
                       <span className="text-3xl font-black text-white tracking-tight">
                         {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(liveTotal)}
                       </span>
                       {totalCost > 0 && totalCost !== liveTotal && (
                         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                           MALİYET: {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalCost)}
                         </span>
                       )}
                    </div>
                    <div className="p-6 bg-slate-900 border border-white/5 rounded-2xl flex flex-col justify-center items-center relative overflow-hidden">
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                         KAR / ZARAR DURUMU
                       </span>
                       <div className="flex flex-col items-center">
                         <span className={cn(
                            "text-3xl font-black tracking-tight",
                            isOverallProfit ? "text-emerald-400" : isOverallLoss ? "text-rose-400" : "text-slate-300"
                         )}>
                            {isOverallProfit ? '+' : ''}{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalProfit)}
                         </span>
                         <span className={cn(
                           "text-xs font-bold mt-1",
                           isOverallProfit ? "text-emerald-400/80" : isOverallLoss ? "text-rose-400/80" : "text-slate-500"
                         )}>
                           ({isOverallProfit ? '+' : ''}{totalProfitPercentage.toFixed(2)}%)
                         </span>
                       </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="space-y-4">
              {result?.portfolio && result.portfolio.length > 0 && (
                <div className="p-5 bg-slate-900 border border-white/5 rounded-2xl">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                    <TableIcon className="w-3 h-3" /> HİSSE DAĞILIMI
                  </h4>
                  <div className="h-64 w-full mb-6 relative">
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-black text-white">{result.portfolio.length}</span>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">HİSSE</span>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={result.portfolio.map(item => ({ name: item.symbol, value: item.totalValue || ((item.amount || 0) * (item.cost || 0)) })).filter(item => item.value > 0).sort((a, b) => b.value - a.value)}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={100}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                          cornerRadius={4}
                        >
                          {result.portfolio.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e', '#84cc16'][index % 10]} className="hover:opacity-80 transition-opacity outline-none cursor-pointer" />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value)}
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}
                          itemStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Detailed Assets Section */}
                  <div className="mt-4 border-t border-white/5 pt-4">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" /> CANLI DURUM
                    </h4>
                    <div className="space-y-2">
                       {result.portfolio.map((item, idx) => {
                         const costVal = item.totalValue || (item.amount * item.cost) || 0;
                         const isProfit = item.profit && item.profit > 0;
                         const isLoss = item.profit && item.profit < 0;
                         const displayAmount = Number.isInteger(item.amount) ? item.amount : Number(item.amount).toFixed(2);
                         
                         return (
                           <div key={idx} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-white/5">
                             <div className="flex flex-col">
                               <span className="text-white font-black">{item.symbol}</span>
                               <span className="text-slate-500 text-[10px] uppercase font-bold">{displayAmount} Adet {item.cost > 0 && `(Maliyet: ₺${item.cost})`}</span>
                             </div>
                             <div className="flex flex-col items-end">
                               <span className="text-sm font-black text-white">
                                 {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(item.liveTotalValue ? item.liveTotalValue : costVal)}
                               </span>
                               {item.profitPercentage !== undefined && (
                                 <span className={cn(
                                   "text-[10px] font-black mt-0.5",
                                   isProfit ? "text-emerald-400" : isLoss ? "text-rose-400" : "text-slate-500"
                                 )}>
                                   {isProfit ? '+' : ''}{item.profitPercentage.toFixed(2)}% ({new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(item.profit || 0)})
                                 </span>
                               )}
                             </div>
                           </div>
                         );
                       })}
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <TableIcon className="w-3 h-3" /> VARLIK DAĞILIMI (ÖZET)
                </h4>
                <p className="text-sm text-white font-medium italic">
                  {typeof result?.distribution === 'object' 
                    ? Object.entries(result.distribution).map(([k,v]) => `${k}: ${v}`).join(', ') 
                    : result?.distribution}
                </p>
              </div>

              <div className="relative p-5 rounded-2xl overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 rounded-2xl"></div>
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                  <Bot className="w-32 h-32 text-indigo-400" />
                </div>
                <div className="relative z-10">
                  <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-500/20 rounded-md">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    YAPAY ZEKA ANALİZ NOTU
                  </h4>
                  <div className="text-sm text-slate-300 leading-relaxed space-y-3 font-medium">
                    {typeof result?.technicalNote === 'string' ? result?.technicalNote?.split('\n').map((paragraph: string, i: number) => (
                      <p key={i}>{paragraph}</p>
                    )) : Array.isArray(result?.technicalNote) ? result?.technicalNote.map((p, i) => <p key={i}>{typeof p === 'string' ? p : JSON.stringify(p)}</p>) : <p>{JSON.stringify(result?.technicalNote)}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-[10px] text-amber-500/80 font-bold uppercase italic">BU BİR YATIRIM TAVSİYESİ DEĞİLDİR.</p>
            </div>

            <button 
              onClick={onClose}
              className="w-full py-4 bg-slate-900 border border-white/5 text-white rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all text-xs"
            >
              KAPAT VE DEVAM ET
            </button>
            {isDevOrPreview() && (
              <button 
                  onClick={async () => {
                     await fetch(getApiUrl('/api/portfolio/reset-limit'), { method: 'POST', headers: { 'x-device-id': getDeviceId() } });
                     localStorage.removeItem('portfolio_analysis_history');
                     setResult(null);
                     setCanAnalyze(true);
                     setStep('upload');
                  }}
                  className="w-full py-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl font-bold uppercase tracking-widest hover:bg-red-500/20 transition-all text-[10px]"
              >
                [TEST] LİMİTLERİ VE GEÇMİŞİ SIFIRLA
              </button>
            )}
          </div>
        );

      case 'limit':
        return (
          <div className="flex flex-col items-center justify-center p-10 text-center space-y-6">
            <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-400">
               <Clock className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">GÜNLÜK SINIRA ULAŞTIN</h3>
              <p className="text-sm text-slate-400 mt-2">Günlük 3 adet ücretsiz analiz hakkınız bulunmaktadır. Lütfen yarın tekrar deneyin.</p>
            </div>
            <div className="w-full space-y-3">
              {isDevOrPreview() && (
                <button 
                  onClick={async () => {
                     await fetch(getApiUrl('/api/portfolio/reset-limit'), { method: 'POST', headers: { 'x-device-id': getDeviceId() } });
                     localStorage.removeItem('portfolio_analysis_history');
                     setCanAnalyze(true);
                     setStep('upload');
                  }}
                  className="w-full py-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl font-bold uppercase tracking-widest hover:bg-red-500/20 transition-all text-[10px]"
                >
                  [TEST] LİMİTLERİ VE GEÇMİŞİ SIFIRLA
                </button>
              )}
              {history.length > 0 && (
                <button 
                  onClick={() => setStep('history')}
                  className="w-full py-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-indigo-500/20 transition-all text-xs"
                >
                  ÖNCEKİ ANALİZLERİMİ GÖR
                </button>
              )}
              <button 
                onClick={onClose}
                className="w-full py-4 bg-slate-900 border border-white/5 text-white rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all text-xs"
              >
                YARIN GELİRİM
              </button>
            </div>
          </div>
        );

      case 'history':
        return (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">ANALİZ ARŞİVİ</h3>
              <button 
                onClick={() => {
                  if (result) setStep('result');
                  else setStep('upload');
                }} 
                className="text-slate-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {history.length === 0 ? (
                <div className="text-center py-12 text-slate-500">Henüz analiz yapılmamış.</div>
              ) : (
                history.map((h, i) => (
                  <button 
                    key={i} 
                    onClick={() => { setResult(h); setStep('result'); }}
                    className="w-full p-4 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-indigo-500/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 font-black">
                        {h.score}
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-black text-white uppercase tracking-wider">
                          {h.createdAt?.toDate ? h.createdAt.toDate().toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }) : new Date(h.createdAt).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })} YORUMU
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase truncate max-w-[150px]">
                          {h.portfolio.map(p => p.symbol).join(', ')}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                  </button>
                ))
              )}
            </div>
            {!canAnalyze && (
              <p className="text-[10px] text-amber-500 text-center font-bold uppercase italic">GÜNLÜK HAKKINIZ DOLMUŞTUR.</p>
            )}
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] md:w-full max-w-xl max-h-[90vh] h-auto bg-slate-950 border border-white/10 flex flex-col rounded-[32px] shadow-2xl z-[101] overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 pb-4 flex-shrink-0 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xs font-black text-white uppercase tracking-[0.2em] leading-none">Karlisin AI</h2>
                  <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest mt-1">Gelişmiş Analiz Asistanı</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {renderCurrentStep()}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
