import React from 'react';
import { motion } from 'motion/react';
import { Shield, FileText, Info } from 'lucide-react';

interface PolicyProps {
  type: 'privacy' | 'terms';
}

export default function Policy({ type }: PolicyProps) {
  const content = type === 'privacy' ? {
    title: 'Gizlilik Politikası',
    icon: <Shield size={48} className="text-indigo-400" />,
    items: [
      "Fiyat Hesaplayıcı, yalnızca hesaplama ve bilgilendirme amacıyla sunulan bir araçtır. Sunulan sonuçlar finansal, hukuki veya ticari tavsiye niteliği taşımaz",
      "Kullanıcı, elde ettiği sonuçları kendi sorumluluğunda değerlendirir. Uygulamanın kullanımından doğabilecek doğrudan veya dolaylı zararlardan sorumluluk kabul edilmez.",
      "Hesaplama algoritmaları genel senaryolara göre tasarlanmıştır. Pazaryeri komisyonları, hizmet bedelleri ve diğer ücretler zamanla değişebilir. Kullanıcı, bu değişiklikleri kontrol etmekle yükümlüdür.",
      "Kullanıcı, uygulamayı kötüye kullanmayacağını, sistemin işleyişine zarar verecek herhangi bir girişimde bulunmayacağını kabul eder.",
      "Fiyat Hesaplayıcı, önceden bildirimde bulunmaksızın güncellenebilir, geliştirilebilir veya geçici/süresiz olarak durdurulabilir.",
      "Bu kullanım şartları zaman zaman güncellenebilir. Güncellenmiş versiyonlar yayınlandığı andan itibaren geçerli sayılır."
    ]
  } : {
    title: 'Kullanım Şartları',
    icon: <FileText size={48} className="text-purple-400" />,
    items: [
      "Fiyat Hesaplayıcı, yalnızca hesaplama ve bilgilendirme amacıyla sunulan bir araçtır. Sunulan sonuçlar finansal, hukuki veya ticari tavsiye niteliği taşımaz",
      "Kullanıcı, elde ettiği sonuçları kendi sorumluluğunda değerlendirir. Uygulamanın kullanımından doğabilecek doğrudan veya dolaylı zararlardan sorumluluk kabul edilmez.",
      "Hesaplama algoritmaları genel senaryolara göre tasarlanmıştır. Pazaryeri komisyonları, hizmet bedelleri ve diğer ücretler zamanla değişebilir. Kullanıcı, bu değişiklikleri kontrol etmekle yükümlüdür.",
      "Kullanıcı, uygulamayı kötüye kullanmayacağını, sistemin işleyişine zarar verecek herhangi bir girişimde bulunmayacağını kabul eder.",
      "Fiyat Hesaplayıcı, önceden bildirimde bulunmaksızın güncellenebilir, geliştirilebilir veya geçici/süresiz olarak durdurulabilir.",
      "Bu kullanım şartları zaman zaman güncellenebilir. Güncellenmiş versiyonlar yayınlandığı andan itibaren geçerli sayılır."
    ]
  };

  return (
    <div className="pt-24 pb-20 px-6 max-w-4xl mx-auto min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center mb-16"
      >
        <div className="p-6 bg-white/5 rounded-[32px] border border-white/10 mb-8 backdrop-blur-md">
          {content.icon}
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">
          {content.title}
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
      </motion.div>

      <div className="grid grid-cols-1 gap-6">
        {content.items.map((item, i) => {
          const number = item.match(/^(\d+)-/);
          const cleanItem = number ? item.replace(/^\d+-/, '').trim() : item;
          const displayId = number ? number[1] : (i + 1).toString();

          return (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group flex gap-6 p-8 bg-white/5 backdrop-blur-md rounded-[32px] border border-white/10 hover:border-indigo-500/30 transition-all"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-lg group-hover:bg-indigo-500 group-hover:text-white transition-all">
                {displayId}
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-slate-300 font-medium leading-relaxed">
                  {cleanItem}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-16 p-8 bg-indigo-500/5 rounded-[32px] border border-indigo-500/10 flex items-start gap-4"
      >
        <Info className="text-indigo-400 shrink-0 mt-1" size={20} />
        <p className="text-sm text-slate-400 font-medium leading-relaxed text-center sm:text-left">
          Bu döküman son olarak 22 Nisan 2026 tarihinde güncellenmiştir. Sorularınız için bizimle iletişime geçebilirsiniz.
        </p>
      </motion.div>
    </div>
  );
}
