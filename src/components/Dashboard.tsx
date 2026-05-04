import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { LayoutDashboard, FileText, Settings, HelpCircle, LogOut, Search, PlusCircle, ExternalLink, Calendar } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto flex flex-col md:flex-row gap-8 min-h-screen">
      <Helmet>
        <title>Dashboard - Karlısın Finansal Yönetim Paneli</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 gap-8">
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[32px] border border-white/10 shadow-sm flex flex-col gap-2">
          {[
            { icon: <LayoutDashboard size={20} />, label: 'Dashboard', active: true },
            { icon: <FileText size={20} />, label: 'My Reports', active: false },
            { icon: <Settings size={20} />, label: 'Settings', active: false },
            { icon: <HelpCircle size={20} />, label: 'Support', active: false },
          ].map((item, i) => (
            <button 
              key={i}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                item.active 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          <div className="mt-8 pt-6 border-t border-white/10">
            <button className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm text-rose-400 hover:bg-rose-500/10 transition-all w-full">
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-lg p-6 rounded-[32px] text-white relative overflow-hidden shadow-sm border border-white/10">
          <h4 className="text-sm font-black uppercase tracking-widest mb-2 relative z-10">Pro Account</h4>
          <p className="text-xs font-semibold mb-6 relative z-10 opacity-80 leading-relaxed">Unlock advanced API tools and team collaboration.</p>
          <button className="w-full py-3 bg-white/10 border border-white/20 hover:bg-white/20 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-sm transition-all relative z-10">Upgrade</button>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col gap-8">
        {/* Header Area */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Welcome back, John!</h1>
            <p className="text-sm text-slate-400 font-bold">Here is what's happening with your finances today.</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search tools..." 
                className="w-full md:w-64 bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-11 pr-5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-white placeholder:text-slate-500 transition-all font-medium"
              />
            </div>
            <button className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all active:scale-95 shrink-0">
              <PlusCircle size={24} />
            </button>
          </div>
        </header>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Saved Calculators', value: '12', sub: '3 active scenarios', icon: <Calculator size={24} />, color: 'bg-indigo-500/10 text-indigo-400' },
            { label: 'Recent Reports', value: '4', sub: 'Updated 2h ago', icon: <FileText size={24} />, color: 'bg-indigo-500/10 text-indigo-400' },
            { label: 'Days until Payout', value: '14', sub: 'Next: Oct 25th', icon: <Calendar size={24} />, color: 'bg-purple-500/10 text-purple-400' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 backdrop-blur-md p-6 rounded-[28px] border border-white/10 shadow-sm flex flex-col items-start"
            >
              <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center mb-6 border border-white/5`}>
                {stat.icon}
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{stat.label}</span>
              <span className="text-3xl font-black text-white tracking-tighter mb-2">{stat.value}</span>
              <span className="text-xs font-bold text-slate-400 opacity-60">{stat.sub}</span>
            </motion.div>
          ))}
        </div>

        {/* Main Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Recent Evaluations */}
          <div className="bg-white/5 backdrop-blur-md p-8 rounded-[36px] border border-white/10 shadow-sm h-fit">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-black text-white tracking-tight uppercase tracking-wider">Recent Evaluations</h3>
              <button className="text-xs font-black text-indigo-400 uppercase tracking-widest hover:underline underline-offset-4">View All</button>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { name: 'Amazon Q3 Electronics', type: 'Profit Analysis', date: 'Oct 12, 2026', status: 'Completed' },
                { name: 'Downtown Penthouse', type: 'Mortgage Review', date: 'Oct 10, 2026', status: 'Pending' },
                { name: 'Index Fund 20-Year', type: 'ROI Projection', date: 'Oct 05, 2026', status: 'Draft' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl group transition-all border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-indigo-300 border border-white/10 shadow-sm group-hover:scale-110 transition-transform">
                      <Calculator size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">{item.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.type} • {item.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest border border-white/10 ${
                      item.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 
                      item.status === 'Pending' ? 'bg-orange-500/10 text-orange-400' : 'bg-slate-500/10 text-slate-400'
                    }`}>
                      {item.status}
                    </span>
                    <ExternalLink size={16} className="text-white/10 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Insight */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-8 rounded-[36px] text-white flex flex-col justify-between relative overflow-hidden shadow-2xl border border-white/10">
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-indigo-400 font-black uppercase tracking-widest text-[10px] mb-4">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                Live Market Update
              </div>
              <h3 className="text-2xl font-black mb-2 tracking-tight leading-tight">Mortgage rates dipped to 6.2% today.</h3>
              <p className="text-sm text-slate-400 font-medium mb-8 leading-relaxed">Refinance your existing 7%+ loan now to save an average of $240/month per $100k borrowed.</p>
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Potential Savings</span>
                  <span className="text-xs font-black text-emerald-400 tracking-widest uppercase">Significant</span>
                </div>
                <div className="text-3xl font-black text-white">$8,450 / Year</div>
              </div>
            </div>

            <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95 relative z-10 shadow-lg">
              See Comparison
            </button>
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
          </div>
        </div>
      </main>
    </div>
  );
}

const Calculator = ({ size, className }: { size?: number, className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="16" height="20" x="4" y="2" rx="2" /><line x1="8" x2="16" y1="6" y2="6" /><line x1="16" x2="16" y1="14" y2="18" /><path d="M16 10h.01" /><path d="M12 10h.01" /><path d="M8 10h.01" /><path d="M12 14h.01" /><path d="M8 14h.01" /><path d="M12 18h.01" /><path d="M8 18h.01" /></svg>
