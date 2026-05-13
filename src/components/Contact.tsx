import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { useSeo } from './Sitemap';
import { Mail, Sparkles, Clock, ShieldCheck, Twitter, Github, Linkedin } from 'lucide-react';
import ContactForm from './ContactForm';

export default function Contact() {
  useSeo('İletişim', 'Öneri, soru veya kurumsal iş birliği talepleriniz için bizimle iletişime geçebilirsiniz.');

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
      <Helmet>
        <title>İletişim - Karlısın | Bize Ulaşın</title>
        <meta name="description" content="Öneri, soru veya kurumsal iş birliği talepleriniz için bizimle iletişime geçebilirsiniz. Karlısın ekibi en kısa sürede size geri dönüş yapacaktır." />
      </Helmet>
      
      {/* Hero Section */}
      <div className="text-center mb-20">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 text-indigo-300 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-6 border border-indigo-500/20"
        >
          <Sparkles size={14} />
          Bize Ulaşın
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 leading-tight uppercase"
        >
          Geleceği Birlikte <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Şekillendirelim.</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-slate-400 font-medium max-w-3xl mx-auto"
        >
          Finansal araçlarımızı geliştirmek, hata bildirmek veya sadece bir mesaj bırakmak için formumuzu kullanabilirsiniz.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-10"
        >
          <div className="space-y-6">
            {/* Contact Method */}
            <div className="p-1 w-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-[32px] group hover:from-indigo-500/30 hover:to-purple-600/30 transition-all">
              <div className="bg-slate-950 rounded-[30px] p-8 flex items-center gap-6">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-indigo-500/30 transition-all shadow-lg">
                  <Mail className="text-indigo-400" size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">E-Posta</p>
                  <a href="mailto:ahmet@karlisin.com" className="text-xl font-bold text-white hover:text-indigo-400 transition-colors">ahmet@karlisin.com</a>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Response Time */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-4">
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 border border-amber-500/20">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm mb-1 uppercase tracking-wider">Hızlı Yanıt</h4>
                  <p className="text-slate-400 text-xs font-medium">Genelde 12-48 saat içerisinde dönüş sağlıyoruz.</p>
                </div>
              </div>

              {/* Data Safety */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-4">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm mb-1 uppercase tracking-wider">Veri Güvenliği</h4>
                  <p className="text-slate-400 text-xs font-medium">Mesajlarınız uçtan uca şifrelenerek saklanır.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-indigo-500/5 rounded-[32px] border border-indigo-500/10 relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-white font-bold text-lg mb-4">Sosyal Medya</h4>
              <div className="flex gap-4">
                <a href="#" className="w-12 h-12 bg-white/5 hover:bg-indigo-500/20 text-slate-400 hover:text-white rounded-xl flex items-center justify-center transition-all border border-white/10">
                  <Twitter size={20} />
                </a>
                <a href="#" className="w-12 h-12 bg-white/5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl flex items-center justify-center transition-all border border-white/10">
                  <Github size={20} />
                </a>
                <a href="#" className="w-12 h-12 bg-white/5 hover:bg-indigo-600/20 text-slate-400 hover:text-white rounded-xl flex items-center justify-center transition-all border border-white/10">
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
            {/* Background Blur */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl -mr-16 -mt-16" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <ContactForm />
        </motion.div>
      </div>

      {/* FAQ Section */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-32 max-w-4xl mx-auto"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-white mb-4">Sıkça Sorulan Sorular</h2>
          <p className="text-slate-400 font-medium">Aklınıza takılan soruların yanıtlarını burada bulabilirsiniz.</p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "Veriler ne kadar güncel?",
              a: "Hisse senedi ve temettü verilerimiz Unified Data Engine v3.1 sayesinde 5 farklı kaynaktan doğrulanarak anlık ve 12 saatlik periyotlarla güncellenmektedir."
            },
            {
              q: "Hizmetleriniz ücretli mi?",
              a: "Temel takip araçlarımız ve günlük sınırlı AI analizlerimiz tamamen ücretsizdir. Gelecekte daha gelişmiş özellikler için abonelik seçenekleri eklenebilir."
            },
            {
              q: "Hata bildirimi nasıl yapılır?",
              a: "Yukarıdaki formu kullanarak 'Hata Bildirimi' başlığıyla bize ulaşabilirsiniz. Ekibimiz teknik sorunları genellikle 24 saat içinde incelemektedir."
            },
            {
              q: "İş birliği süreçleri nasıl işliyor?",
              a: "Kurumsal iş birliği ve veri entegrasyonu talepleriniz için 'İş Birliği' seçeneğini seçerek detaylı mesaj bırakabilirsiniz, Ahmet Bey sizinle doğrudan iletişime geçecektir."
            }
          ].map((faq, index) => (
            <div key={index} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300">
              <h4 className="text-white font-bold text-lg mb-2">{faq.q}</h4>
              <p className="text-slate-400 font-medium lead-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
