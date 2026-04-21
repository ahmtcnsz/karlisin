import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Coins, History, ArrowUpRight, Zap, PiggyBank, Target } from 'lucide-react';

export default function Investment() {
  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
        <div className="max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-300 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-indigo-500/20"
          >
            Wealth Accelerator
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-black text-white tracking-tight"
          >
            Investment & ROI Analyst
          </motion.h1>
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 shadow-sm backdrop-blur-md"
        >
          <button className="px-6 py-2.5 bg-white/10 shadow-sm rounded-xl text-white font-black text-sm transition-all uppercase tracking-tight border border-white/10">Compound</button>
          <button className="px-6 py-2.5 text-slate-400 font-bold text-sm hover:text-white transition-all uppercase tracking-tight">Simple ROI</button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 flex flex-col gap-8"
        >
          <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-[40px] shadow-sm border border-white/10">
            <h2 className="text-xl font-bold mb-8 text-white flex items-center justify-between">
              Growth Model
              <Zap size={20} className="text-indigo-400" />
            </h2>
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-bold text-slate-400 flex items-center gap-2">
                    <PiggyBank size={16} /> Initial Capital
                  </label>
                  <span className="text-base font-black text-indigo-400">$25,000</span>
                </div>
                <input type="range" className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-500" min="1000" max="1000000" step="5000" defaultValue="25000" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-bold text-slate-400 flex items-center gap-2">
                    <Target size={16} /> Monthly Add
                  </label>
                  <span className="text-base font-black text-indigo-400">$1,200</span>
                </div>
                <input type="range" className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-500" min="0" max="50000" step="100" defaultValue="1200" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-bold text-slate-400 flex items-center gap-2">
                    <Coins size={16} /> Est. Annual Return
                  </label>
                  <span className="text-base font-black text-emerald-400">9.5%</span>
                </div>
                <input type="range" className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-500" min="1" max="25" step="0.1" defaultValue="9.5" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-bold text-slate-400 flex items-center gap-2">
                    <History size={16} /> Time Horizon
                  </label>
                  <span className="text-base font-black text-indigo-400">20 Years</span>
                </div>
                <input type="range" className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-500" min="1" max="50" step="1" defaultValue="20" />
              </div>
            </div>
            
            <button className="w-full mt-10 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3">
              Generate Projection
              <ArrowUpRight size={18} />
            </button>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-8 rounded-[40px] border border-white/10 border-dashed">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Scenario Comparison</h3>
            <div className="space-y-4">
              {[
                { name: 'Conservative (6%)', value: '$840k' },
                { name: 'Aggressive (12%)', value: '$1.8M' },
                { name: 'S&P 500 Avg (10%)', value: '$1.4M' }
              ].map((scenario, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 shadow-sm hover:bg-white/10 transition-all cursor-pointer">
                  <span className="text-sm font-bold text-slate-400">{scenario.name}</span>
                  <span className="font-black text-white">{scenario.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Projection View */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 flex flex-col gap-8"
        >
          {/* Main Display */}
          <div className="bg-white/5 backdrop-blur-2xl rounded-[48px] p-10 border border-white/10 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Growth</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-white/10 rounded-full" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Principal</span>
                </div>
              </div>
            </div>

            <div className="text-center mt-12 mb-16">
              <span className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-4 block">Estimated Net Worth in 2044</span>
              <h2 className="text-7xl md:text-8xl font-black text-white tracking-tighter mb-4">$1,358,044</h2>
              <div className="flex items-center justify-center gap-3">
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm font-black tracking-tighter">+ $1,045,044 Interest</span>
                <span className="text-white/10 text-sm font-bold">|</span>
                <span className="text-slate-400 text-sm font-bold">$313,000 Contributed</span>
              </div>
            </div>

            <div className="w-full h-80 relative mt-4">
              <svg className="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="inv-gradient" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
                <path 
                  d="M0,300 C200,280 400,220 600,150 C800,80 900,20 1000,0 L1000,300 L0,300 Z" 
                  fill="url(#inv-gradient)" 
                />
                <path 
                  d="M0,300 C200,280 400,220 600,150 C800,80 900,20 1000,0" 
                  stroke="#6366f1" 
                  strokeWidth="6" 
                  strokeLinecap="round" 
                  fill="none" 
                  strokeOpacity="0.6"
                />
                
                {/* Horizontal Markers */}
                <line x1="0" y1="100" x2="1000" y2="100" stroke="rgba(255,255,255,0.05)" strokeDasharray="10 10" />
                <line x1="0" y1="200" x2="1000" y2="200" stroke="rgba(255,255,255,0.05)" strokeDasharray="10 10" />
              </svg>
              
              <div className="absolute bottom-0 w-full flex justify-between px-4 pt-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <span>Start</span>
                <span>Year 5</span>
                <span>Year 10</span>
                <span>Year 15</span>
                <span>Year 20</span>
              </div>
            </div>
          </div>

          {/* Quick Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white/5 backdrop-blur-md p-8 rounded-[40px] border border-white/10 shadow-sm group hover:border-indigo-500 transition-all"
            >
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all border border-white/5">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Rule of 72</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                At your current 9.5% return rate, your money will double every <span className="text-indigo-400 font-black">7.5 years</span>.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-purple-600/30 to-indigo-600/30 backdrop-blur-xl p-8 rounded-[40px] text-white shadow-lg border border-white/10 relative overflow-hidden group transition-all"
            >
              <h3 className="text-xl font-black mb-4 relative z-10">Historical Context</h3>
              <p className="text-slate-300 font-medium mb-6 relative z-10 leading-relaxed">
                The S&P 500 has averaged a 10% annual return for the last 100 years. Your portfolio is currently performing in line with history.
              </p>
              <button className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl font-bold text-xs uppercase tracking-widest backdrop-blur-md relative z-10">Learn Strategy</button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
