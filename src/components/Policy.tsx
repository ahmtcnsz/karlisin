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
      "1- Kişisel Veri Toplanmaz: Karlısın, kullanıcılarını kayıt etmez, takip etmez ve hiçbir kişisel veriyi (isim, e-posta, iletişim bilgisi) sisteminde tutmaz. Araçlarımız anonim kullanım ilkesine dayanır.",
      "2- Şeffaf Bilgi Kaynağı: Piyasa verileri ve hesaplamalar, üçüncü taraf sağlayıcılardan (Yahoo, Google, Investing) anlık olarak çekilir. Bu veriler sistemlerimizde kalıcı olarak depolanmaz.",
      "3- Teknik Çerezler: Site performansı ve kullanıcı tercihlerini (örneğin karanlık mod seçimi) hatırlamak için yalnızca tarayıcı tabanlı teknik çerezler kullanılabilir.",
      "4- Analiz Araçları: Site trafiğini anlamak için kullanılan standart analiz servisleri, kullanıcıların kimliğini belirleyecek hiçbir veriyi Karlısın ile paylaşmaz.",
      "5- Güvenli Bağlantı: Tüm hesaplama süreçleri ve veri iletimi modern SSL sertifikaları ile korunarak tarayıcınız ve sunucumuz arasında güvenli bir tünel üzerinden gerçekleşir.",
      "6- Dış Bağlantılar: Sitemiz üzerinden yönlendirilen dış bağlantıların kendi gizlilik politikaları geçerlidir. Karlısın, dış platformların veri politikalarından sorumlu değildir."
    ]
  } : {
    title: 'Kullanım Şartları',
    icon: <FileText size={48} className="text-purple-400" />,
    items: [
      "1- Bilgilendirme Amaçlıdır: Karlısın araçları sadece matematiksel modellemeler sunar. Hiçbir sonuç resmi belge, yatırım tavsiyesi veya finansal danışmanlık yerine geçmez.",
      "2- Veri Doğruluğu: Veriler Unified Data Engine ile çapraz sorgulanarak sunulsa da, piyasa koşullarına bağlı gecikme veya hatalar yaşanabilir. Yatırım kararlarınızı bu verilere dayanarak almayınız.",
      "3- Ücretsiz Hizmet: Platformdaki tüm hesaplama araçları ücretsizdir ve 'olduğu gibi' sunulur. Hizmet kalitesi veya kesintisiz erişim konusunda garanti verilmez.",
      "4- Fikri Mülkiyet: Karlısın görsel tasarımı, logoları ve hesaplama algoritmaları özel mülkiyetimizdir. İzinsiz kopyalanması veya ticari amaçla kullanılması yasaktır.",
      "5- Sorumluluk Reddi: Kullanıcıların bu araçları kullanarak yaptığı finansal tercihlerden doğabilecek maddi veya manevi zararlardan Karlısın sorumlu tutulamaz.",
      "6- Koşul Güncellemeleri: Hizmetlerimizi geliştikçe bu şartlar güncellenebilir. Platformu kullanarak mevcut şartları kabul etmiş sayılırsınız."
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
          Bu döküman son olarak 8 Mayıs 2026 tarihinde güncellenmiştir. Sorularınız için bizimle iletişime geçebilirsiniz.
        </p>
      </motion.div>
    </div>
  );
}
