import React from 'react';
import { motion } from 'motion/react';
import { Rocket, Target, Globe, BarChart3, Users, Zap } from 'lucide-react';

const stats = [
  { label: 'Kullanıcı Kitlesi', value: '25M+', desc: 'E-Ticaret & Yatırım' },
  { label: 'Geliştirme Hızı', value: '12x', desc: 'Geleneksel Metotlara Göre' },
  { label: 'Koda Bağımlılık', value: '0', desc: 'Manuel Müdahale' },
  { label: 'AI Karar Gücü', value: '%100', desc: 'Uçtan Uca Mimari' }
];

const phases = [
  {
    title: 'Pazar Analizi & AI Strategy',
    desc: 'Finansal pazarın boşlukları AI tarafından tespit edildi ve çözüm mimarisi otonom olarak tasarlandı.',
    icon: <Target className="w-6 h-6 text-indigo-400" />
  },
  {
    title: 'Otonom Geliştirme Katmanı',
    desc: 'Bütün backend algoritmaları ve frontend arayüzü Google Gemini motoruyla saniyeler içinde inşa edildi.',
    icon: <Zap className="w-6 h-6 text-amber-400" />
  },
  {
    title: 'Global Ölçekleme',
    desc: 'Çok dilli altyapı ve evrensel finansal modüller ile dünya pazarına çıkış stratejisi.',
    icon: <Globe className="w-6 h-6 text-blue-400" />
  }
];

export default function AIStory() {
  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-sm font-medium mb-6"
          >
            <Rocket className="w-4 h-4" />
            <span>Gelecek Burada: %100 AI-Native</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight"
          >
            Karlısın'ın Hikayesi:<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Bir Kod Devrimi
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
          >
            Karlısın, geleneksel bir yazılım projesi değil; bir yapay zekanın "ideal finansal ekosistemi" yaratma vizyonudur. Tek bir satır kod bile insan eliyle yazılmadı.
          </motion.p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-24">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 text-center"
            >
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-indigo-400 text-sm font-semibold mb-2">{stat.label}</div>
              <div className="text-slate-500 text-xs">{stat.desc}</div>
            </motion.div>
          ))}
        </div>

        {/* The Process Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Yapay Zeka ile Nasıl Oluşturduk?</h2>
            <div className="space-y-8">
              {phases.map((phase, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-white/5 shadow-lg">
                    {phase.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-2">{phase.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{phase.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl absolute inset-0 animate-pulse" />
            <div className="relative bg-slate-900/80 border border-white/10 rounded-3xl p-8 backdrop-blur-sm overflow-hidden group">
              <pre className="text-[10px] md:text-xs text-indigo-300 font-mono overflow-hidden">
                {`
{
  "project": "Karlısın",
  "engine": "Gemini 1.5 Pro",
  "architect": "AI System",
  "frameworks": ["React", "Vite", "Firebase"],
  "goal": "Democratize Finance",
  "build_time": "Otonom",
  "status": "Perfected"
}
                `}
              </pre>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                    <BarChart3 className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">Hata Payı 0.00%</div>
                    <div className="text-indigo-400 text-xs font-mono">Algorithmic Precision</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 blur-[80px] rounded-full" />
          <h2 className="text-3xl font-bold text-white mb-4 relative z-10">Bize Katılın</h2>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto relative z-10 font-medium leading-relaxed">
            Karlısın sadece bir başlangıç. Yapay zekanın dönüştürdüğü finans dünyasında yerinizi alın.
          </p>
          <div className="flex flex-wrap justify-center gap-4 relative z-10">
            <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/20 flex items-center gap-2 group">
              <span>Hemen Başlayın</span>
              < Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-white/5">
              İş Birliği Teklifi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
