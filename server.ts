import express from 'express';
import { createServer as createViteServer } from 'vite';
import { Resend } from 'resend';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

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

  // TEST ENDPOINT - API'nın hayatta olduğunu doğrulamak için
  app.get('/api/verify', (req, res) => {
    res.json({ message: 'Karlısın API is alive!', time: new Date().toISOString() });
  });

  // ANA API ROTASI
  app.post('/karlisin-mail-service', async (req, res) => {
    console.log('[Karlısın-API] İstek alındı:', req.body);
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'E-posta adresi eksik' });
    }

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ error: 'Sunucu yapılandırma hatası (API Key eksik)' });
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
        console.error('[Karlısın-API] Resend Hatası:', error);
        return res.status(400).json({ error });
      }

      console.log('[Karlısın-API] Başarılı:', data?.id);
      res.status(200).json({ status: 'success', id: data?.id });
    } catch (err: any) {
      console.error('[Karlısın-API] Catch Hatası:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // İstek Loglayıcı (Yalnızca API olmayanlar için aşağıda kalabilir)
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (req.url === '/karlisin-mail-service') return; // API'yı pas geç
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
  });
}

startServer();
