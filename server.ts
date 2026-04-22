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
    console.log(`[Sunucu-Log] ${req.method} ${req.url}`);
    next();
  });

  // TEST VE ANA API
  const mailHandler = async (req: express.Request, res: express.Response) => {
    console.log('[Karlısın-API] Mail isteği işleniyor...');
    const email = req.method === 'POST' ? req.body.email : req.query.email;
    
    if (!email) {
      return res.status(400).json({ error: 'E-posta adresi bulunamadı' });
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('[Karlısın-API] RESEND_API_KEY tanımsız!');
      return res.status(500).json({ error: 'Sistem hatası (API Key)' });
    }

    try {
      const sender = process.env.RESEND_FROM_EMAIL || 'Karlısın <info@karlisin.com>';
      const { data, error } = await resend.emails.send({
        from: sender,
        to: [email],
        subject: 'Karlısın Temettü Takibi - Hoş Geldin! 🚀',
        html: `<h1>Hoş Geldin!</h1><p>Bekleme listesine katıldın. En kısa sürede görüşmek üzere.</p>`
      });

      if (error) {
        console.error('[Karlısın-API] Resend hatası:', error);
        return res.status(400).json({ 
          error: error.message || 'Resend API Hatası', 
          details: 'Lütfen Resend panelinden domain doğrulamasını ve API key yetkilerini kontrol edin. Domain doğrulanmadıysa sadece kendi mailinize gönderim yapabilirsiniz.',
          raw: error 
        });
      }

      console.log('[Karlısın-API] Başarılı gönderim:', data?.id);
      return res.status(200).json({ success: true, id: data?.id });
    } catch (err: any) {
      console.error('[Karlısın-API] Beklenmedik hata:', err);
      return res.status(500).json({ error: err.message });
    }
  };

  // Hem GET hem POST destekle (Test kolaylığı için)
  app.get('/api/mail', mailHandler);
  app.post('/api/mail', mailHandler);

  // API CATCH-ALL (404 JSON Hatası Dönmek İçin)
  app.all('/api/*', (req, res) => {
    console.warn(`[API-404] Bulunamayan API Rotası: ${req.method} ${req.url}`);
    res.status(404).json({ 
      error: `API rotası bulunamadı: ${req.url}`,
      method: req.method,
      suggestion: 'Lütfen /api/mail rotasını kullandığınızdan emin olun.'
    });
  });

  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    
    // API dışındaki her şeyi index.html'e gönder
    app.get('*', (req, res) => {
      // API isteklerini SPA fallback'ten muaf tut
      if (req.url.startsWith('/api')) {
        return; 
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Test API: http://localhost:${PORT}/api/mail?email=test@example.com`);
  });
}

startServer();
