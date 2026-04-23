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

  // Loglama - Hangi istek nereye geliyor görelim
  app.use((req, res, next) => {
    if (req.url.includes('api')) {
      console.log(`[Karlısın-Sunucu] API İstek: ${req.method} ${req.url}`);
    }
    next();
  });

  // BASİT PING TESTİ
  app.get('/api/ping', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString(), env: {
      has_resend_key: !!process.env.RESEND_API_KEY,
      from_email: process.env.RESEND_FROM_EMAIL || 'Tanımsız'
    }});
  });

  // TEST VE ANA API
  const mailHandler = async (req: express.Request, res: express.Response) => {
    console.log('[Karlısın-API] Mail isteği işleniyor...');
    const email = req.method === 'POST' ? req.body.email : req.query.email;
    
    if (!email) {
      console.warn('[Karlısın-API] Email adresi eksik!');
      return res.status(400).json({ error: 'E-posta adresi bulunamadı' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey === 're_your_api_key_here') {
      console.error('[Karlısın-API] Geçersiz veya eksik RESEND_API_KEY!');
      return res.status(500).json({ 
        error: 'Sistem hatası: API Anahtarı yüklenemedi.',
        details: 'Lütfen .env dosyasını veya ortam değişkenlerini kontrol edin.'
      });
    }

    try {
      const sender = process.env.RESEND_FROM_EMAIL || 'Karlısın <info@karlisin.com>';
      console.log(`[Karlısın-API] Gönderim yapılıyor: ${sender} -> ${email}`);
      
      const { data, error } = await resend.emails.send({
        from: sender,
        to: [email],
        subject: 'Karlısın Temettü Takibi - Hoş Geldin! 🚀',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
            <h1 style="color: #4f46e5;">Hoş Geldin!</h1>
            <p style="font-size: 16px; line-height: 1.6;">Bekleme listemize başarıyla katıldın.</p>
            <p>Finansal özgürlük yolculuğunda birlikteyiz. Uygulamamız aktif olduğunda ilk haberdar olan sen olacaksın.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
            <p style="font-size: 12px; color: #64748b;">Karlısın Ekibi</p>
          </div>
        `
      });

      if (error) {
        console.error('[Karlısın-API] Resend API Hatası:', error);
        return res.status(400).json({ 
          error: 'Mail gönderilemedi.', 
          message: error.message,
          details: 'Domain doğrulanmadıysa sadece kendi mailinize gönderim yapabilirsiniz. Resend panelinden kontrol edin.'
        });
      }

      console.log('[Karlısın-API] Başarıyla gönderildi. ID:', data?.id);
      return res.status(200).json({ success: true, id: data?.id });
    } catch (err: any) {
      console.error('[Karlısın-API] Kritik Hata:', err);
      return res.status(500).json({ 
        error: 'Sunucu hatası oluştu.', 
        message: err.message 
      });
    }
  };

  app.get('/api/mail', mailHandler);
  app.post('/api/mail', mailHandler);

  // API CATCH-ALL (404 JSON Hatası Dönmek İçin) - DİĞER TÜM /api/* YOLLARINI YAKALA
  app.all('/api/*', (req, res) => {
    console.warn(`[Karlısın-API] Bilinmeyen Rota: ${req.method} ${req.url}`);
    res.status(404).json({ 
      error: 'Bu API rotası mevcut değil.',
      tip: '/api/mail rotasını kullanın.'
    });
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
