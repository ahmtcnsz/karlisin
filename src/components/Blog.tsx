import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Clock, ArrowRight, BookOpen, Loader2, CheckCircle2, ArrowLeft, Share2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';

const articles = [
  {
    id: 1,
    title: 'Haftalık Temettü Analizi: Portföy Stratejileri',
    excerpt: 'Bugün yayınladığımız analizde BIST 100 ve global piyasalardaki temettü verimi en yüksek şirketleri inceledik.',
    category: 'Analiz',
    date: '23 Nisan 2026',
    readTime: '8 dk',
    image: 'https://images.unsplash.com/photo-1611974717528-58730d385ad2?auto=format&fit=crop&q=80&w=800',
    content: `
      <p>Bugün, 23 Nisan 2026 itibarıyla piyasalarda temettü odaklı bir hareketlilik gözlemliyoruz. Karlısın ekibi olarak hazırladığımız bu haftalık analizde, portföyünüzü koruyacak ve büyütecek stratejilere odaklandık.</p>
      <h3 style="color: white; margin-top: 24px;">Piyasa Özeti</h3>
      <p>Borsa İstanbul'da işlem hacmi bugün rekor seviyelere yaklaştı. Özellikle enerji ve teknoloji hisselerindeki temettü projeksiyonları, uzun vadeli yatırımcılar için yeşil ışık yakıyor.</p>
      <h3 style="color: white; margin-top: 24px;">Pasif Gelir Odak Noktası</h3>
      <p>Unutmayın, temettü yatırımcılığı bir sprint değil, maratondur. Karlısın'ın 10 yıllık projeksiyon araçlarıyla geleceğinizi bugünden planlayın.</p>
    `
  },
  {
    id: 2,
    title: 'Dijital Dönüşümde E-ticaretin Geleceği',
    excerpt: 'E-ticarette başarının anahtarı artık sadece ürün satmak değil, veriyi doğru okumaktan geçiyor.',
    category: 'Gelecek',
    date: '23 Nisan 2026',
    readTime: '6 dk',
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800',
    content: `
      <h3 style="color: white; margin-top: 24px;">Veri Odaklı Karar Verme</h3>
      <p>Karlısın blog yazarı olarak bugün şunu vurgulamak istiyoruz: Verileriniz size hikayenizi anlatır. Satış rakamlarınızın ötesine geçin.</p>
      <h3 style="color: white; margin-top: 24px;">Yapay Zeka Entegrasyonu</h3>
      <p>2026 yılı, yapay zekanın e-ticaret lojistiğinde %30 daha fazla verimlilik sağladığı yıl olarak tarihe geçecek.</p>
    `
  },
  {
    id: 3,
    title: 'Yeni Nesil Vergi Yapılandırması ve Karlılık',
    excerpt: 'Vergi maliyetlerini yasal yollarla optimize ederek kâr marjınızı nasıl %5 artırırsınız?',
    category: 'Finans',
    date: '23 Nisan 2026',
    readTime: '5 dk',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
    content: `
      <p>Mevzuat değişiklikleri her zaman bir fırsat barındırır. Karlısın ile bu fırsatları yakalayın.</p>
      <h3 style="color: white; margin-top: 24px;">Maliyet Analizi</h3>
      <p>Bugün her işletmeyen yapması gereken ilk şey, gizli operasyonel maliyetleri ortaya çıkarmaktır.</p>
    `
  },
  {
    id: 4,
    title: 'Haftalık Analiz: E-ticaret Başarı İpuçları',
    excerpt: 'Kendi markasını kurmak isteyenler için bu haftanın altın değerindeki tavsiyeleri.',
    category: 'Özel',
    date: '23 Nisan 2026',
    readTime: '7 dk',
    image: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaad5b?auto=format&fit=crop&q=80&w=800',
    content: `
      <p>Karlısın Haftalık Analiz dizisinin bu bölümünde, yeni başlayanlar için yol haritasını çiziyoruz.</p>
      <h3 style="color: white; margin-top: 24px;">Marka Kimliği</h3>
      <p>Siz sadece bir ürün değil, bir çözüm satıyorsunuz. Markanızın sesi, müşterinizin duymak istediği cevap olmalı.</p>
      <h3 style="color: white; margin-top: 24px;">Lojistik Gücü</h3>
      <p>Doğru kargo anlaşması ve hızlı teslimat, markanızı zirveye taşıyacak iki temel dayanaktır.</p>
    `
  },
  {
    id: 5,
    title: 'Maliyet Yönetimi: 2026 Stratejileri',
    excerpt: 'Artan maliyetler karşısında kâr marjınızı korumanın yolları ve yeni ekonomi modeli.',
    category: 'Finans',
    date: '23 Nisan 2026',
    readTime: '9 dk',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800',
    content: `
      <p>2026 yılı maliyet yönetimi açısından zorlayıcı olsa da Karlısın araçlarıyla bu süreci avantaja çevirebilirsiniz.</p>
      <h3 style="color: white; margin-top: 24px;">Operasyonel Verimlilik</h3>
      <p>Gereksiz harcamaları kısmak yerine, var olan kaynakları daha verimli kullanma stratejilerini inceliyoruz.</p>
      <h3 style="color: white; margin-top: 24px;">Fiyatlandırma Psikolojisi</h3>
      <p>Maliyet artışlarını fiyata yansıtırken müşteri sadakatini bozmamak için kullanabileceğiniz psikolojik modeller.</p>
    `
  },
  {
    id: 6,
    title: '2026\'da Pasif Gelir Modelleri: Nereden Başlamalı?',
    excerpt: 'Finansal özgürlük yolunda pasif gelir inşa etmek için 2026 yılının en kârlı ve sürdürülebilir modellerini keşfedin.',
    category: 'Strateji',
    date: '23 Nisan 2026',
    readTime: '10 dk',
    image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=800',
    content: `
      <p>Gerçek finansal özgürlük, siz uyurken bile çalışan sistemler kurmaktan geçer. Karlısın olarak 2026 projeksiyonlarımızda öne çıkan modelleri sizin için derledik.</p>
      <h3 style="color: white; margin-top: 24px;">Dijital Varlık Yatırımcılığı</h3>
      <p>Artık sadece hisse senedi değil, yapay zeka tarafından yönetilen dijital gelir kapıları da portföylerin vazgeçilmezi haline geldi.</p>
      <h3 style="color: white; margin-top: 24px;">Otomatik E-Ticaret Kanalları</h3>
      <p>Stoksuz satışın ötesinde, marka sadakati üzerine kurulu ve tam otomatize edilmiş niş mağazalar, 2026'nın en yüksek ROI (Geri Dönüş) oranına sahip.</p>
    `
  },
  {
    id: 7,
    title: 'B2B E-ticarette Müşteri Edinme Maliyeti (CAC) Nasıl Düşürülür?',
    excerpt: 'Artan reklam maliyetleri karşısında, B2B sektöründe müşteri başına maliyeti optimize etmenin 5 stratejik yolu.',
    category: 'Analiz',
    date: '23 Nisan 2026',
    readTime: '12 dk',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800',
    content: `
      <p>B2B dünyasında rekabet artık sadece fiyatta değil, operasyonel verimlilikte yaşanıyor. CAC değerlerinizi nasıl tek haneli yüzdelere indirirsiniz?</p>
      <h3 style="color: white; margin-top: 24px;">Hesap Odaklı Pazarlama (ABM)</h3>
      <p>Geniş kitlelere reklam vermek yerine, Karlısın verileriyle nokta atışı yaparak potansiyeli en yüksek müşterilere odaklanın.</p>
      <h3 style="color: white; margin-top: 24px;">Sadakat Döngüsü</h3>
      <p>Yeni müşteri bulmak, var olanı elde tutmaktan 5 kat daha pahalıdır. CAC'ı düşürmenin en iyi yolu, churn (kayıp) oranını sıfıra yaklaştırmaktır.</p>
    `
  },
  {
    id: 8,
    title: 'Küresel Pazarlarda Marka Olmak: Yerellik ve Evrensellik Dengesi',
    excerpt: 'Türk markalarının yurt dışı pazarlara açılırken yaptığı en yaygın 3 hatayı ve lokalizasyonun gücünü inceliyoruz.',
    category: 'Gelecek',
    date: '23 Nisan 2026',
    readTime: '15 dk',
    image: 'https://images.unsplash.com/photo-1529400971008-f566de0e6dfc?auto=format&fit=crop&q=80&w=800',
    content: `
      <p>Yurt dışına açılmak sadece dili çevirmek değildir; o kültüre adapte olmaktır. Karlısın global strateji ekibi olarak yeni oyuncular için bir rehber hazırladık.</p>
      <h3 style="color: white; margin-top: 24px;">Lokalizasyon Stratejisi</h3>
      <p>Hedef pazarın ödeme alışkanlıkları, renk tercihleri ve teslimat beklentileri ana stratejinizin bir parçası olmalı.</p>
      <h3 style="color: white; margin-top: 24px;">Veri Odaklı Pazar Seçimi</h3>
      <p>Hangi ülkeye gireceğinize hislerinizle değil, Karlısın'ın pazar analiz araçlarıyla karar verin. Doğru veri, sizi milyonlarca dolarlık reklam israfından korur.</p>
    `
  },
  {
    id: 9,
    title: 'Finansal Özgürlüğün Gizli Formülü: Bileşik Getiri Gücü',
    excerpt: 'Einstein\'ın "Dünyanın 8. harikası" dediği bileşik getiriyi kullanarak 10 yılda nasıl servet inşa edilir?',
    category: 'Strateji',
    date: '23 Nisan 2026',
    readTime: '14 dk',
    image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800',
    content: `
      <p>Finansal özgürlük, bir varış noktası değil, bir yolculuktur. Bu yolculuğun en güçlü yakıtı ise zaman ve bileşik getiridir. Karlısın olarak, bu gücü hesaplamalarınıza dahil etmenin yollarını inceliyoruz.</p>
      <h3 style="color: white; margin-top: 24px;">Bileşik Getiri Nedir?</h3>
      <p>Bileşik getiri, sadece ana paranızın değil, kazandığınız faiz veya kârın da tekrar kazanç getirmesi sürecidir. Küçük miktarlarla başlasanız bile, zamanla kartopu etkisi yaratarak devasa bir portföye dönüşebilir.</p>
      <h3 style="color: white; margin-top: 24px;">2026 Ekonomi Modelinde Strateji</h3>
      <p>Günümüzün volatil piyasalarında, anlık kazançlar yerine sürdürülebilir büyüme oranlarına odaklanmak kritik. Karlısın'ın yatırım projeksiyon araçları, size yıllık %10 ile %25 arasındaki farkın 20 yılda ne kadar büyük bir uçuruma dönüştüğünü somut verilerle gösterir.</p>
      <h3 style="color: white; margin-top: 24px;">Disiplin ve Sabır</h3>
      <p>Bileşik getirinin en büyük düşmanı sabırsızlıktır. Erken yaşta, küçük bütçelerle bile olsa bugün başlayın. Karlısın ile hedeflerinizi belirleyin ve her ay bu hedefe ne kadar yaklaştığınızı takip edin. Unutmayın, finansal gelecek şansa değil, doğru hesaplamalara dayanır.</p>
    `
  },
  {
    id: 10,
    title: 'Yapay Zeka Destekli Karlılık Analizi: 2026 ve Ötesi',
    excerpt: 'Verilerinizdeki saklı hazineyi keşfedin. Yapay zeka, finansal kararlarınızı nasıl bir üst seviyeye taşıyor?',
    category: 'Gelecek',
    date: '23 Nisan 2026',
    readTime: '11 dk',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
    content: `
      <p>Veri, günümüzün yeni petrolüdür; ancak bu petrolü işleyecek bir rafineriniz yoksa sadece maliyet üretir. 2026 yılında Karlısın olarak biz, bu rafineriyi yapay zeka ile güçlendiriyoruz.</p>
      <h3 style="color: white; margin-top: 24px;">Tahminlemeli Analiz (Predictive Analytics)</h3>
      <p>Artık sadece "geçen ay ne kazandım?" sorusuna yanıt aramıyoruz. Yapay zeka algoritmaları, mevcut trendleri ve pazar dinamiklerini analiz ederek "önümüzdeki 6 ayda ne kazanacağım?" sorusuna %90'ın üzerinde doğrulukla yanıt verebiliyor. Bu, nakit akışı yönetiminde devrim niteliğinde bir değişim.</p>
      <h3 style="color: white; margin-top: 24px;">Dinamik Fiyatlandırma ve Marj Koruması</h3>
      <p>E-ticaret dünyasında saniyeler içinde değişen maliyetlere manuel olarak yetişmek imkansız. AI destekli sistemler, rakip fiyatlarını, stok durumunu ve lojistik maliyetlerini anlık takip ederek en yüksek marjı koruyan fiyatı otomatik olarak belirleyebilir. Karlısın vizyonuyla, bu şeffaflığı her ölçekteki işletmeye sunuyoruz.</p>
      <h3 style="color: white; margin-top: 24px;">Görünmeyen Giderlerin Keşfi</h3>
      <p>Yapay zeka, insanın gözden kaçıracağı küçük ama birikince büyük zarar yaratan operasyonel sızıntıları tespit etmekte ustadır. İade oranlarındaki anormalliklerden, vergi beyannamesindeki gizli indirim fırsatlarına kadar her detayı analiz eden bir dijital asistana sahip olmak, 2026'nın en büyük rekabet avantajıdır.</p>
    `
  },
  {
    id: 11,
    title: '2026 Rehberi: Brütten Nete Maaş Hesaplama Nasıl Yapılır?',
    excerpt: 'Gelir vergisi dilimleri, SGK işçi payı ve damga vergisi... Maaş dökümünüzdeki tüm detayları uzman bakışıyla inceleyin.',
    category: 'Maaş',
    date: '23 Nisan 2026',
    readTime: '15 dk',
    image: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&q=80&w=800',
    content: `
      <p>Çalışanlar ve işverenler için en kritik finansal verilerden biri olan <b>brütten nete maaş hesaplama</b>, 2026 yılındaki vergi düzenlemeleriyle daha da önemli hale geldi. Karlısın olarak, maaşınızın her kuruşunun nereye gittiğini anlamanız için bu rehberi hazırladık.</p>
      <h3 style="color: white; margin-top: 24px;">Brüt Maaş vs. Net Maaş</h3>
      <p>Brüt maaş, işvereninizle anlaştığınız, üzerinden kesintiler yapılmadan önceki toplam tutardır. Net maaş ise kesintiler sonrası banka hesabınıza yatan paradır. 2026 yılında asgari ücret istisnası ve vergi dilimleri bu farkı belirleyen ana unsurlardır.</p>
      <h3 style="color: white; margin-top: 24px;">Temel Kesintiler Nelerdir?</h3>
      <p>Bir maaş dökümünde şu kalemler yer alır:
        <ul>
          <li><b>SGK İşçi Payı (%14):</b> Sosyal güvenlik sistemine katkınız.</li>
          <li><b>İşsizlik Sigortası (%1):</b> İşsizlik durumunda güvenceniz için.</li>
          <li><b>Gelir Vergisi:</b> Kazancınıza göre %15'ten başlayıp %40'a kadar çıkan dilimler.</li>
          <li><b>Damga Vergisi:</b> Yasal evraklar üzerinden alınan cüzi bir kesinti.</li>
        </ul>
      </p>
      <h3 style="color: white; margin-top: 24px;">Maaş Vergi Hesaplama Neden Zor?</h3>
      <p>Vergi dilimleri kümülatif olarak hesaplandığı için, yılın sonuna doğru vergi diliminiz artar ve net maaşınız azalır. Karlısın'ın <b>maaş vergi hesaplama</b> aracı, bu kümülatif artışı otomatik olarak hesaplar ve size yıl boyu alacağınız gerçek net tutarı önceden söyler.</p>
      <h3 style="color: white; margin-top: 24px;">Karlısın ile Geleceği Planlayın</h3>
      <p>Elinize geçecek rakamı önceden bilmek, kredi ödemelerinizi ve birikimlerinizi planlamanızın anahtarıdır. Hemen yukarıdaki hesaplayıcıyı kullanarak 2026 projeksiyonunuzu oluşturun.</p>
    `
  },
  {
    id: 12,
    title: 'Kaça Satayım? E-Ticarette Kâr Hesaplama ve Fiyatlandırma',
    excerpt: 'Ürününüzü kaça satmalısınız? Komisyonlar, kargo ve reklam giderleri sonrası net kârınızı nasıl korursunuz?',
    category: 'E-Ticaret',
    date: '23 Nisan 2026',
    readTime: '12 dk',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800',
    content: `
      <p>E-ticarete yeni başlayanların en büyük hatası, sadece alış fiyatının üzerine kâr koyarak satış fiyatı belirlemektir. Gerçek dünyada kâr hesapla denildiğinde işin içine görünmeyen onlarca kalem girer.</p>
      <h3 style="color: white; margin-top: 24px;">Görünmez Maliyetler: Komisyon ve Kargo</h3>
      <p>Pazaryerlerinde satış yaptığınızda %10 ile %25 arasında değişen kategori komisyonları ile karşılaşırsınız. Bunun üzerine kargo ücreti, paketleme maliyeti ve ürün iade risk payını eklediğinizde, "kârlı" sandığınız satış aslında zarar ettiriyor olabilir.</p>
      <h3 style="color: white; margin-top: 24px;">Psikolojik Fiyatlandırma ve Rekabet</h3>
      <p>Rakipleriniz kaça satıyor? Sizin onlardan farkınız ne? Karlısın'ın kâr analiz araçları, size minimum satış fiyatınızı çıkarırken aynı zamanda reklam maliyetlerinizi (ROAS) de hesaba katmanızı sağlar.</p>
      <h3 style="color: white; margin-top: 24px;">Doğal Kâr Bariyeri</h3>
      <p>Fiyatınızı belirlerken KDV dengesini asla unutmayın. Satış fiyatınızın içindeki KDV'yi düştükten sonra kalan tutar üzerinden kârınızı hesaplamalısınız. Karlısın ile tüm bu karmaşık matematik saniyeler içinde önünüze gelir.</p>
    `
  },
  {
    id: 13,
    title: 'E-ticarette Kar Hesapla ve Fiyat Belirle: Kaça Satayım?',
    excerpt: 'Satış fiyatınızı belirlerken yapılan en büyük hatalar ve doğru kar hesaplama yöntemleri ile Karlısın rehberi.',
    category: 'SEO Rehber',
    date: '23 Nisan 2026',
    readTime: '12 dk',
    image: 'https://images.unsplash.com/photo-1554224155-1696413575b8?auto=format&fit=crop&q=80&w=800',
    content: `
      <p>E-ticaret dünyasına adım atan her girişimcinin aklındaki ilk soru aynıdır: <strong>"Kaça satayım?"</strong> Bir ürünü sadece rakibinizden ucuza satmak, sizi kar etmekten uzaklaştırabilir. Doğru bir fiyatlandırma stratejisi için profesyonel bir <strong>kar hesapla</strong> yaklaşımı şarttır.</p>
      
      <h3 style="color: white; margin-top: 24px;">Doğru Kar Hesaplama Formülü</h3>
      <p>Sadece alış ve satış fiyatı arasındaki farka odaklanmak büyük bir yanılgıdır. Gerçek karı görmek için şu giderleri mutlaka hesaba katmalısınız:</p>
      <ul>
        <li>Paryer komisyon oranları (Trendyol, Hepsiburada vb.)</li>
        <li>Kargo ve paketleme maliyetleri</li>
        <li>İade oranları ve operasyonel giderler</li>
        <li>Reklam ve pazarlama bütçesi</li>
      </ul>

      <h3 style="color: white; margin-top: 24px;">Stratejik Fiyatlandırma Modelleri</h3>
      <p>Pazarda sadece "en ucuz" olmak sürdürülebilir bir model değildir. Müşterilerinize sunduğunuz değer önerisini fiyatınıza yansıtın. Karlısın'ın gelişmiş analiz araçları ile piyasa trendlerini takip ederek <strong>kaça satayım</strong> sorusuna en karlı cevabı verebilirsiniz.</p>
      
      <p>Unutmayın, e-ticarette başarı matematiksel bir kesinlik gerektirir. Karlısın ile finansal verilerinizi doğru okuyun, geleceğinizi güvenle inşa edin.</p>
    `
  },
  {
    id: 14,
    title: '2026\'da Borsa İstanbul: Temettü Emekliliği Hayal mi?',
    excerpt: 'Enflasyon ve faiz sarmalında temettü yatırımcılığının 2026 yılındaki rolünü ve Karlısın ile nasıl pasif gelir inşa edilebileceğini tartışıyoruz.',
    category: 'Yatırım',
    date: '24 Nisan 2026',
    readTime: '10 dk',
    image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800',
    content: `
      <p>2026 yılına geldiğimizde ekonomi dünyası artık çok daha hızlı kararlar gerektiriyor. Birçok yatırımcı için ise en güvenli liman hala aynı: <strong>Temettü Yatırımcılığı</strong>. Peki, bugünün koşullarında gerçekten bir 'Temettü Emeklisi' olmak mümkün mü?</p>
      
      <h3 style="color: white; margin-top: 24px;">Enflasyon Koruması Olarak Temettü</h3>
      <p>Hisse senetlerinin sunduğu temettü verimi, sadece nakit akışı sağlamakla kalmaz, aynı zamanda şirketin büyüme potansiyeliyle birlikte enflasyona karşı doğal bir koruma kalkanı oluşturur. Karlısın ekibi olarak hazırladığımız bu analizde, doğru şirketlerin reel getiride nasıl fark yarattığını inceliyoruz.</p>
      
      <h3 style="color: white; margin-top: 24px;">Karlısın ile Gelecek Projeksiyonu</h3>
      <p>Bir temettü portföyü kurarken en büyük hata, sadece yüksek verime odaklanmaktır. Önemli olan süreklilik ve büyümedir. Karlısın'ın özel projeksiyon araçları sayesinde, aldığınız her bir temettü ödemesinin portföyünüze olan bileşik etkisini 10, 20 ve hatta 30 yıllık vadelerde simüle edebilirsiniz.</p>
      
      <h3 style="color: white; margin-top: 24px;">Disiplinli Yatırım</h3>
      <p>Temettü emekliliği bir hayal değil, disiplinli bir matematik oyunudur. Karlısın ile hedeflerinizi belirleyin ve her ay bu hedefe ne kadar yaklaştığınızı takip edin.</p>
    `
  },
  {
    id: 15,
    title: 'Karlı Bir E-ticaret Markası İnşası: 2026 Yol Haritası',
    excerpt: 'Sıfırdan kârlı bir marka yaratmanın matematiği, lojistik stratejileri ve 2026 yılındaki büyüme fırsatları.',
    category: 'Marka',
    date: '24 Nisan 2026',
    readTime: '12 dk',
    image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=800',
    content: `
      <p>Bir e-ticaret markası kurmak, sadece bir ürün bulup siteye yüklemekten çok daha fazlasıdır. 2026 yılında "kârlılık", bir tercih değil, hayatta kalma meselesidir.</p>
      
      <h3 style="color: white; margin-top: 24px;">Niş Belirleme ve Pazar Analizi</h3>
      <p>Genel geçer ürünlerden kaçının. Karlısın'ın pazar analiz araçlarıyla, rekabetin düşük ama talebin sürdürülebilir olduğu mikro-nişleri keşfedin. Büyük balıkların olmadığı sularda yüzmek, reklam maliyetlerinizi (CAC) %60'a kadar düşürebilir.</p>
      
      <h3 style="color: white; margin-top: 24px;">Operasyonel Kusursuzluk</h3>
      <p>Gereksiz her operasyonel adım, kâr marjınızdan çalınan bir parçadır. Otomasyonu merkeze alın. Tedarik zincirinden kargo süreçlerine kadar her aşamayı Karlısın ile takip ederek "gizli sızıntıları" durdurun.</p>
      
      <h3 style="color: white; margin-top: 24px;">Topluluk ve Sadakat</h3>
      <p>2026'da reklamlar pahalı, güven ise nadirdir. Müşterilerinize sadece bir ürün değil, bir topluluk sunun. Tek seferlik satışlar yerine abonelik modellerine ve yüksek LTV (Müşteri Başam Boyu Değeri) oranlarına odaklanın.</p>
      
      <p>Karlısın ile markanızı rakamların gücüyle büyütün. Doğru hesaplanmış her adım, sizi zirveye bir adım daha yaklaştırır.</p>
    `
  },
  {
    id: 16,
    title: '2026 Maaş Hesaplama Rehberi: Vergi Dilimi, Dolar ve Altın Karşılığı Analizi',
    excerpt: 'Karlısın ile finansal geleceğinizi planlayın: 2026 maaş vergi dilimleri, alım gücü analizi ve yatırım projeksiyonları.',
    category: 'Maaş',
    date: '25 Nisan 2026',
    readTime: '10 dk',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cbd22cd6?auto=format&fit=crop&q=80&w=1200',
    content: `
      <p>Günümüzde sadece "net maaş" rakamını bilmek artık yeterli değil. Enflasyonun, değişen döviz kurlarının ve yıl ortasında aniden düşen maaşların (vergi dilimi) olduğu bir ekonomide, çalışanların gerçek satın alma gücünü bilmesi gerekiyor. Karlısın olarak, 2026 yılı için geliştirdiğimiz yeni nesil <a href="/maas-vergi-hesaplama" style="color: #818cf8; text-decoration: underline;">maaş hesaplama</a> aracımızla finansal geleceğinizi nasıl planlayabileceğinizi anlatıyoruz.</p>

      <h2 style="color: white; margin-top: 32px; font-weight: 900;">1. Maaşım Neden Düşüyor? 2026 Vergi Dilimi Takibi</h2>
      <p>Türkiye’de çalışanların en büyük kabusu, yılın ikinci yarısında eline geçen paranın azalmasıdır. Bunun temel sebebi Kümülatif Gelir Vergisi Matrahı’dır.</p>
      <p>Karlısın Maaş Hesaplayıcı, sadece bugünkü maaşınızı hesaplamaz; 2026 güncel vergi dilimi baremlerine göre hangi ayda %20, hangi ayda %27’lik dilime gireceğinizi önceden haber verir.</p>
      <ul>
        <li><strong>Erken Uyarı:</strong> Maaşınız düşmeden 3 ay önce sistem sizi uyarır.</li>
        <li><strong>Hassas Hesaplama:</strong> SGK işçi payı, işsizlik sigortası ve damga vergisi istisnaları kuruşu kuruşuna hesaplanır.</li>
      </ul>

      <h2 style="color: white; margin-top: 32px; font-weight: 900;">2. Satın Alma Gücü: Maaşım Kaç Dolar ve Kaç Gram Altın Ediyor?</h2>
      <p>Rakamlar büyüse de alım gücü değişebiliyor. Karlısın’ın en sevilen özelliği olan Canlı Kur Entegrasyonu sayesinde, net maaşınızın o anki piyasa değerini anında görebilirsiniz.</p>
      <ul>
        <li><strong>Dolar Bazlı Kariyer Planı:</strong> Maaşınızın global standartlardaki karşılığını takip edin.</li>
        <li><strong>Altın Endeksi:</strong> Maaşınızla kaç gram altın alabileceğinizi görerek, birikim potansiyelinizi ölçün.</li>
      </ul>
      <p>Apple-esque Deneyim: Karmaşık finansal verileri, Inter fontu ve minimalist tasarımımızla en sade haliyle sunuyoruz.</p>

      <h2 style="color: white; margin-top: 32px; font-weight: 900;">3. Finansal Özgürlük İçin Yatırım Simülasyonu</h2>
      <p>"Ne kadar biriktirebilirim?" sorusunun cevabı artık çok kolay. Sitemizdeki İnteraktif Yatırım Slider’ı ile maaşınızın belirli bir yüzdesini ayırdığınızda, yıl sonunda elinizde ne kadar birikeceğini canlı olarak simüle edebilirsiniz.</p>
      <blockquote style="border-left: 4px solid #818cf8; padding-left: 20px; font-style: italic; margin: 24px 0;">"Küçük tasarruflar, doğru yatırım araçlarıyla birleştiğinde büyük bir finansal özgürlüğe dönüşür."</blockquote>

      <h2 style="color: white; margin-top: 32px; font-weight: 900;">4. Neden Karlısın Kullanmalısınız?</h2>
      <p>Piyasada birçok "bürütten nete hesaplama" aracı var. Ancak Karlısın’ı ayıran özellikler şunlardır:</p>
      <ul>
        <li><strong>Hız:</strong> Apple standartlarında arayüz ile 5 saniyede sonuç.</li>
        <li><strong>Güncellik:</strong> 2026 resmi vergi mevzuatına %100 uyum.</li>
        <li><strong>Gizlilik:</strong> Verileriniz asla kaydedilmez, her şey tarayıcınızda hesaplanır.</li>
        <li><strong>E-Ticaret Entegrasyonu:</strong> Eğer bir yandan da satış yapıyorsanız, Pazaryeri Kâr Hesaplama aracımızla toplam kazancınızı optimize edebilirsiniz.</li>
      </ul>

      <h3 style="color: white; margin-top: 32px; font-weight: 900;">Sonuç: Geleceğinizi Verilerle Yönetin</h3>
      <p>2026 yılında finansal okuryazarlık bir tercih değil, zorunluluktur. Maaşınızın vergi yükünü, döviz karşılığını ve yatırım potansiyelini bilmek sizi bir adım öne taşır.</p>
      <p>Siz de hemen Karlısın <a href="/maas-vergi-hesaplama" style="color: #818cf8; text-decoration: underline;">Maaş Hesaplama</a> sayfamızı ziyaret edin ve gerçek kazancınızı keşfedin!</p>
    `
  },
  {
    id: 17,
    title: 'Pazaryeri Satıcıları İçin Kâr Rehberi: Trendyol, Hepsiburada ve Amazon’da Zarar Etmekten Nasıl Kurtulursunuz?',
    excerpt: 'E-ticarette "kaça satmalıyım?" sorusuna profesyonel bir cevap. 2026 kâr marjı yönetimi, komisyon ve kargo baremleri rehberi.',
    category: 'E-Ticaret',
    date: '25 Nisan 2026',
    readTime: '12 dk',
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=1200',
    content: `
      <p>E-ticaret dünyasında ciro yapmak harikadır, ancak günün sonunda cebinizde kalan "net kâr" gerçek başarınızı belirler. Çoğu satıcı, sadece ürün maliyetine bakarak fiyat belirlediği için gizli giderlerin altında eziliyor. Karlısın olarak, 2026 e-ticaret dinamiklerinde kâr marjınızı nasıl koruyacağınızı ve yeni nesil <a href="/pazaryeri-kar-hesaplama" style="color: #818cf8; text-decoration: underline;">hesaplama aracımızın</a> size nasıl zaman (ve para) kazandıracağını anlatıyoruz.</p>

      <h2 style="color: white; margin-top: 32px; font-weight: 900;">1. Gizli Giderlerin Farkında mısınız? Komisyon ve Kargo Denklemi</h2>
      <p>Pazaryerlerinde satış yaparken en büyük yanılgı, komisyon oranını sadece ürün fiyatından düşmektir. Oysa gerçek kâr hesabı çok daha karmaşıktır:</p>
      <ul>
        <li><strong>Kategori Bazlı Komisyonlar:</strong> 2026 güncel komisyon oranları kategoriden kategoriye (Tekstil, Elektronik, Gıda) ciddi farklar gösterir.</li>
        <li><strong>Kargo Baremleri:</strong> Ürününüzün desisi ve satış fiyatı, ödeyeceğiniz kargo ücretini doğrudan etkiler.</li>
        <li><strong>Hizmet Bedelleri:</strong> Pazaryerlerinin her sipariş başına kestiği küçük ama kümülatifte devleşen işlem ücretlerini asla unutmayın.</li>
      </ul>

      <h2 style="color: white; margin-top: 32px; font-weight: 900;">2. Karlısın ile "Kaça Satmalıyım?" Sorusuna Son!</h2>
      <p>Sitemizdeki <a href="/pazaryeri-kar-hesaplama" style="color: #818cf8; text-decoration: underline;">Pazaryeri Kâr Hesaplama</a> aracı, sizi karmaşık Excel tablolarından kurtarmak için tasarlandı. Apple-esque sadeliğiyle çalışan aracımızda şunları saniyeler içinde görebilirsiniz:</p>
      <ul>
        <li><strong>Brüt Kâr vs. Net Kâr:</strong> KDV, komisyon ve kargo sonrası cebine kalacak net nakit.</li>
        <li><strong>KDV Yönetimi:</strong> %1, %10 veya %20 KDV dilimlerine göre maliyet simülasyonu.</li>
        <li><strong>Fiyatlandırma Stratejisi:</strong> Ürünü zararına satmamak için "Minimum Satış Fiyatı" önerileri.</li>
      </ul>

      <h2 style="color: white; margin-top: 32px; font-weight: 900;">3. Platformlar Arası Kıyaslama: Hangi Pazaryeri Daha Karlı?</h2>
      <p>Trendyol'da çok satmak mı, Amazon'da yüksek marjla satmak mı? Karlısın'ın Bento-Grid yapısındaki modern kartları sayesinde platformları yan yana getirebilirsiniz.</p>
      <ul>
        <li><strong>Trendyol:</strong> Yüksek trafik, sıkı rekabet, detaylı komisyon yapısı.</li>
        <li><strong>Hepsiburada:</strong> Kampanya odaklı satış stratejileri ve lojistik avantajlar.</li>
        <li><strong>Amazon TR:</strong> Global standartlarda iade politikaları ve FBA maliyetleri.</li>
      </ul>

      <h2 style="color: white; margin-top: 32px; font-weight: 900;">4. E-Ticarette Sürdürülebilir Büyüme İçin 3 İpucu</h2>
      <ol>
        <li><strong>Dinamik Fiyatlandırma:</strong> Rakipler fiyat kırdığında kâr marjınızın hangi noktada "kırmızı bölgeye" girdiğini saniyeler içinde hesaplayın.</li>
        <li><strong>Paketleme ve Desi Optimizasyonu:</strong> Kargo maliyetlerini düşürmek için ürün boyutlarınızı Karlısın simülatöründe test edin.</li>
        <li><strong>Finansal Okuryazarlık:</strong> Satış verilerinizi düzenli analiz edin. Karlısın'ın Inter fontuyla hazırlanan net grafiklerini kullanarak operasyonel giderlerinizi minimize edin.</li>
      </ol>

      <h3 style="color: white; margin-top: 32px; font-weight: 900;">Sonuç: Hesabını Bilmeyen Satıcı, Pazaryerine Çalışır!</h3>
      <p>2026 e-ticaret rekabetinde ayakta kalmak için sadece iyi ürün bulmak yetmez; matematiği iyi yönetmek gerekir. Karlısın, e-ticaret satıcılarının en yakın finansal dostu olmak için burada.</p>
      <p>Siz de hemen <a href="/pazaryeri-kar-hesaplama" style="color: #818cf8; text-decoration: underline;">Pazaryeri Kâr Hesaplama</a> aracımızı deneyin, sürpriz kesintilere veda edin!</p>
    `
  }
];

export default function Blog() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<typeof articles[0] | null>(null);
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [searchParams] = useSearchParams();

  // URL'den makale ID'sini oku (örn: /blog?id=16)
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      const article = articles.find(a => String(a.id) === id);
      if (article) {
        setSelectedArticle(article);
      }
    }
  }, [searchParams]);

  // OTOMATİK DUYURU TETİĞİ (Yeni Yazı Eklenince Çalışır)
  useEffect(() => {
    const triggerBroadcast = async () => {
      // LocalStorage ile sadece bir kez (makale başına) çalışmasını sağlıyoruz
      const lastArticle = articles[articles.length - 1];
      const currentArticleId = String(lastArticle.id);
      const lastBroadcasted = localStorage.getItem('last_broadcast_article_id');

      if (lastBroadcasted === currentArticleId || broadcastSent) return;

      try {
        console.log(`[Karlısın] Yeni yazı (${currentArticleId}) için 5 dakikalık geri sayım başladı...`);
        
        // 5 Dakika Geciktirme (User Request: Yazı paylaşıldıktan 5 dk sonra gitsin)
        // Not: Bu basit implementasyon tarayıcı açık kaldığı sürece çalışır.
        await new Promise(resolve => setTimeout(resolve, 300000));

        console.log('[Karlısın] Abonelere duyuru gönderiliyor...');
        const querySnapshot = await getDocs(collection(db, 'newsletter_subscribers'));
        const subscribers = querySnapshot.docs.map(doc => doc.data().email).filter(e => !!e);

        if (subscribers.length > 0) {
          const workingCloudRunUrl = 'https://karl-s-n-1001236491636.europe-west2.run.app/api/broadcast';
          const isCustomDomain = window.location.hostname.includes('karlisin.com') || window.location.hostname.includes('www');
          const apiUrl = isCustomDomain ? workingCloudRunUrl : '/api/broadcast';

          const res = await fetch(apiUrl, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subscribers,
              articleTitle: lastArticle.title,
              articleExcerpt: lastArticle.excerpt,
              articleUrl: `https://www.karlisin.com/blog?id=${currentArticleId}`
            })
          });

          if (res.ok) {
            console.log('[Karlısın] Abonelere özel link başarıyla gönderildi!');
            localStorage.setItem('last_broadcast_article_id', currentArticleId);
            setBroadcastSent(true);
          }
        }
      } catch (err) {
        console.error('[Karlısın] Otomatik duyuru hatası:', err);
      }
    };

    triggerBroadcast();
  }, [broadcastSent]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Lütfen geçerli bir e-posta adresi girin.');
      setStatus('error');
      return;
    }

    try {
      setStatus('loading');
      setErrorMessage('');
      
      await addDoc(collection(db, 'newsletter_subscribers'), {
        email: email,
        subscribedAt: serverTimestamp(),
        source: 'blog_newsletter'
      });

      try {
        const workingCloudRunUrl = 'https://karl-s-n-1001236491636.europe-west2.run.app/api/mail';
        const isCustomDomain = window.location.hostname.includes('karlisin.com') || window.location.hostname.includes('www');
        const apiUrl = isCustomDomain ? workingCloudRunUrl : '/api/mail';

        await fetch(apiUrl, {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, type: 'newsletter' })
        });
      } catch (mailErr) {
        console.error('Mail trigger error:', mailErr);
      }

      setStatus('success');
      setEmail('');
    } catch (err: any) {
      console.error('Subscription error:', err);
      setErrorMessage('Bir hata oluştu. Tekrar deneyin.');
      setStatus('error');
    }
  };

  if (selectedArticle) {
    return (
      <div className="pt-24 pb-20 px-6 max-w-4xl mx-auto min-h-screen">
        <Helmet>
          <title>{selectedArticle.title} | Karlısın Blog</title>
          <meta name="description" content={selectedArticle.excerpt} />
        </Helmet>
        <div className="flex justify-between items-center mb-8">
          <motion.button 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setSelectedArticle(null)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group font-bold tracking-tight"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Geri Dön
          </motion.button>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="aspect-[21/9] rounded-[40px] overflow-hidden mb-12 border border-white/10 shadow-2xl">
            <img src={selectedArticle.image} alt={selectedArticle.title} className="w-full h-full object-cover" />
          </div>

          <div className="flex items-center gap-4 text-xs font-black text-indigo-400 uppercase tracking-widest mb-6">
            <span className="px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20">{selectedArticle.category}</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><Clock size={14} /> {selectedArticle.readTime} oku</span>
            <span>•</span>
            <span>{selectedArticle.date}</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-8 tracking-tight leading-[1.1]">
            {selectedArticle.title}
          </h1>

          <div className="prose prose-invert prose-indigo max-w-none">
            <div 
              className="text-slate-300 text-lg leading-relaxed space-y-6 font-medium"
              dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
            />
          </div>

          <div className="mt-16 pt-8 border-t border-white/10">
            <h3 className="text-2xl font-black text-white mb-8 italic uppercase tracking-wider">İlginizi Çekebilir</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {articles
                .filter(a => a.id !== selectedArticle.id)
                .sort(() => Math.random() - 0.5)
                .slice(0, 2)
                .map(related => (
                  <motion.div
                    key={related.id}
                    onClick={() => {
                      setSelectedArticle(related);
                      window.scrollTo(0, 0);
                    }}
                    className="group bg-white/5 rounded-3xl border border-white/5 hover:border-indigo-500/30 overflow-hidden cursor-pointer transition-all"
                  >
                    <div className="aspect-[21/9] overflow-hidden">
                      <img src={related.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={related.title} />
                    </div>
                    <div className="p-6">
                      <h4 className="text-white font-bold group-hover:text-indigo-400 transition-colors line-clamp-1">{related.title}</h4>
                      <p className="text-slate-400 text-xs mt-2 line-clamp-2">{related.excerpt}</p>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white">K</div>
              <div>
                <p className="text-white font-bold">Karlısın Ekibi</p>
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Finans Editörü</p>
              </div>
            </div>
            <button className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-white transition-all">
              <Share2 size={20} />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
      <Helmet>
        <title>Blog - Karlısın | Finansal Stratejiler ve Pazar Analizleri</title>
        <meta name="description" content="E-ticaret başarısı, 2026 maaş hesaplamaları ve yatırım stratejileri üzerine güncel Karlısın blog yazıları." />
      </Helmet>
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
        <div className="max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-300 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-indigo-500/20 font-bold">
            Haberler & İpuçları
          </motion.div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Karlısın <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Blog</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-slate-400 font-medium mt-4 text-lg">
            E-ticaret ve finans dünyasındaki en son gelişmeleri, stratejileri ve başarı hikayelerini takip edin.
          </motion.p>
        </div>

        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Yazı ara..." className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium transition-all text-white" />
        </div>
      </div>

      <div className="flex flex-col gap-16 items-center">
        {/* Featured Article */}
        <motion.article 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          onClick={() => setSelectedArticle(articles[articles.length - 1])} 
          className="bg-white/5 backdrop-blur-md rounded-[48px] border border-white/10 overflow-hidden group hover:border-indigo-500/50 transition-all flex flex-col cursor-pointer shadow-2xl max-w-5xl"
        >
          <div className="aspect-video overflow-hidden relative">
            <img src={articles[articles.length - 1].image} alt={articles[articles.length - 1].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
            <div className="absolute top-6 left-6">
              <span className="px-4 py-1.5 bg-indigo-500 backdrop-blur-md text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg">SON YAZI</span>
            </div>
          </div>
          
          <div className="p-10 md:p-16 flex flex-col items-center text-center">
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-black text-slate-500 uppercase tracking-widest mb-6">
              <span className="px-3 py-1 bg-white/5 rounded-lg border border-white/10">{articles[articles.length - 1].category}</span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5"><Clock size={14} /> {articles[articles.length - 1].readTime} oku</span>
              <span className="hidden sm:inline">•</span>
              <span>{articles[articles.length - 1].date}</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 group-hover:text-indigo-400 transition-colors leading-tight tracking-tight">{articles[articles.length - 1].title}</h2>
            <p className="text-lg text-slate-400 font-medium mb-10 line-clamp-3 leading-relaxed max-w-3xl">{articles[articles.length - 1].excerpt}</p>
            <button className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-indigo-400 group-hover:text-white transition-all">
              Hemen Oku <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </motion.article>

        {/* Regular Articles List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-7xl">
          {articles.slice(0, -1).reverse().map((article, i) => (
            <motion.article 
              key={article.id} 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }} 
              onClick={() => setSelectedArticle(article)} 
              className="bg-white/5 backdrop-blur-md rounded-[40px] border border-white/10 overflow-hidden group hover:border-indigo-500/50 transition-all flex flex-col cursor-pointer text-center items-center"
            >
              <div className="aspect-[16/9] w-full overflow-hidden relative">
                <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-lg border border-white/10">{article.category}</span>
                </div>
              </div>
              
              <div className="p-10 flex flex-col items-center flex-grow">
                <div className="flex items-center justify-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
                  <span className="flex items-center gap-1.5"><Clock size={12} /> {article.readTime} oku</span>
                  <span>•</span>
                  <span>{article.date}</span>
                </div>
                <h2 className="text-2xl font-black text-white mb-4 group-hover:text-indigo-400 transition-colors leading-tight">{article.title}</h2>
                <p className="text-base text-slate-400 font-medium mb-8 line-clamp-2 leading-relaxed">{article.excerpt}</p>
                <div className="mt-auto pt-6 border-t border-white/5 w-full">
                  <button className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-400 group-hover:text-white transition-colors w-full">
                    Devamını Oku <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      {/* Featured Newsletter */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-20 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-xl p-12 rounded-[48px] border border-white/10 text-center relative overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto">
          <BookOpen size={48} className="mx-auto text-indigo-400 mb-6" />
          <h2 className="text-3xl font-black text-white mb-4">Haftalık Analizler Kapınıza Gelsin</h2>
          <p className="text-slate-300 font-medium mb-8">E-ticaret başarısı için gereken verileri ve ipuçlarını haftalık olarak e-posta adresinize gönderelim.</p>
          
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl">
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="text-emerald-400" size={32} />
                  <p className="text-white font-bold text-lg">Bültene Abone Oldunuz!</p>
                  <p className="text-emerald-400/80 text-sm">Analizlerimizi size ulaştırmak için sabırsızlanıyoruz.</p>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-grow flex flex-col items-start gap-2">
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-posta adresiniz" className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-white font-medium" />
                  {status === 'error' && <p className="text-rose-400 text-xs font-bold ml-2">{errorMessage}</p>}
                </div>
                <button type="submit" disabled={status === 'loading'} className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center min-w-[140px]">
                  {status === 'loading' ? <Loader2 size={20} className="animate-spin" /> : 'Abone Ol'}
                </button>
              </form>
            )}
          </AnimatePresence>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#4f46e5,transparent_70%)] opacity-10 pointer-events-none" />
      </motion.div>
    </div>
  );
}
