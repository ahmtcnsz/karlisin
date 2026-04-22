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

  app.use(express.json());
  app.use(cors());

  // İstek Loglayıcı (Debug için)
  app.use((req, res, next) => {
    console.log(`[Karlısın-Log] ${req.method} ${req.url}`);
    next();
  });

  // Durum kontrolü endpoint'i
  app.get(['/api/status', '/api/status/'], (req, res) => {
    res.json({ status: 'ok', mode: process.env.NODE_ENV || 'development' });
  });

  app.post('/welcome-email', async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'E-posta adresi gerekli' });
    }

    try {
      const sender = process.env.RESEND_FROM_EMAIL || 'Karlısın <info@karlisin.com>';
      const { data, error } = await resend.emails.send({
        from: sender,
        to: [email],
        subject: 'Karlısın Temettü Takibi - Aramıza Hoş Geldin! 🚀',
        html: `<h1>Hoş Geldin!</h1><p>Bekleme listesine katıldın.</p>`
      });

      if (error) return res.status(400).json({ error });
      res.status(200).json({ status: 'success' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite ve Statik Dosya İşlemleri
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (req.url === '/welcome-email') return; // API'yı pas geç
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
