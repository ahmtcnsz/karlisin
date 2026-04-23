import express from 'express';
import { createServer as createViteServer } from 'vite';
import { Resend } from 'resend';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

// .env dosyasını yükle
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  // Ortam değişkenleri kontrolü (Debug için)
  console.log('--- Sistem Yapılandırması ---');
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Tanımlı (Ok)' : 'EKSİK!');
  console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL || 'Tanımlı Değil (Varsayılan kullanılıyor)');
  console.log('RESEND_REGION:', process.env.RESEND_REGION || 'Global/US');
  console.log('---------------------------');

  // Resend yapılandırması
  const resendOptions = process.env.RESEND_REGION === 'eu' 
    ? { baseUrl: 'https://eu.resend.com' } 
    : {};
  const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key', resendOptions);

  app.use(cors());
  app.use(express.json());

  // ---------------------------------------------------------
  // 1. API ROTLARI (EN ÜSTTE OLMALI - VITE'DEN ÖNCE)
  // ---------------------------------------------------------
  
  // BASİT PING TESTİ
  app.get('/api/ping', (req, res) => {
    console.log('[Karlısın-Sunucu] Ping isteği geldi');
    res.json({ 
      status: 'ok', 
      time: new Date().toISOString(), 
      env_key: !!process.env.RESEND_API_KEY 
    });
  });

  // ANA MAIL API (Tüm metodları destekle)
  const mailHandler = async (req: express.Request, res: express.Response) => {
    console.log(`[Karlısın-API] Mail isteği geldi: ${req.method} ${req.path}`);
    const email = req.method === 'POST' ? req.body.email : req.query.email;
    
    if (!email) {
      return res.status(400).json({ error: 'E-posta adresi eksik' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('[Karlısın-API] RESEND_API_KEY bulunamadı!');
      return res.status(500).json({ error: 'Sunucu yapılandırma hatası (API Key)' });
    }

    try {
      const sender = process.env.RESEND_FROM_EMAIL || 'Karlısın <merhaba@karlisin.com>';
      const { data, error } = await resend.emails.send({
        from: sender,
        to: [email as string],
        subject: 'Karlısın Temettü Takibi - Hoş Geldin! 🚀',
        html: `<div style="font-family:sans-serif;padding:20px;color:#333;">
                <h2 style="color:#4f46e5;">Merhaba!</h2>
                <p>Bekleme listemize katıldığın için teşekkürler. Uygulama aktif olduğunda seni haberdar edeceğiz.</p>
              </div>`
      });

      if (error) {
        console.error('[Karlısın-API] Resend Hatası:', error);
        return res.status(400).json({ error: error.message });
      }

      console.log('[Karlısın-API] Mail başarıyla kuyruğa alındı:', data?.id);
      return res.status(200).json({ success: true, id: data?.id });
    } catch (err: any) {
      console.error('[Karlısın-API] Kritik Hata:', err);
      return res.status(500).json({ error: 'Kritik sunucu hatası', message: err.message });
    }
  };

  app.all('/api/mail', mailHandler);

  // API CATCH-ALL (API içindeki 404'ler JSON dönmeli)
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: 'API rotası bulunamadı', path: req.path });
  });

  // ---------------------------------------------------------
  // 2. LOGLAMA VE DİĞERLERİ
  // ---------------------------------------------------------

  app.use((req, res, next) => {
    if (!req.url.startsWith('/api')) {
      // API değilse sessiz kal veya logla
    }
    next();
  });

  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    
    // API dışındaki her şeyi index.html'e gönder
    app.get('*', (req, res) => {
      // API istekleri yukarıda catch-all ile yakalanmış olmalı, buraya düşerse 404 dön
      if (req.url.startsWith('/api')) {
        return res.status(404).json({ error: 'API rotası bulunamadı.' });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    
  // API rotalarını Vite'den koru (Daha Kesin Filtreleme)
    app.use((req, res, next) => {
      // API istekleri doğrudan alttaki express rotalarına akmalı
      // req.path kullanmak sorgu parametrelerinden etkilenmeyi önler
      if (req.path.startsWith('/api/')) {
        return next();
      }
      vite.middlewares(req, res, next);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Test API: http://localhost:${PORT}/api/mail?email=test@example.com`);
  });
}

startServer();
