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

  // ÖNCELİKLİ API ROTASI - Hiçbir katman buna dokunmasın
  app.post('/karlisin-mail-service', async (req, res) => {
    console.log('[Karlısın-API] Mail isteği geldi:', req.body.email);
    const { email } = req.body;
    
    if (!email) return res.status(400).json({ error: 'E-posta gerekli' });

    try {
      const sender = process.env.RESEND_FROM_EMAIL || 'Karlısın <info@karlisin.com>';
      const { data, error } = await resend.emails.send({
        from: sender,
        to: [email],
        subject: 'Karlısın Temettü Takibi - Hoş Geldin! 🚀',
        html: `<h1>Hoş Geldin!</h1><p>Bekleme listesine katıldın.</p>`
      });

      if (error) return res.status(400).json({ error });
      return res.status(200).json({ status: 'success', id: data?.id });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // TEST ENDPOINT
  app.get('/api-verify', (req, res) => {
    res.json({ msg: 'API is working' });
  });

  const isProduction = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test';
  
  if (isProduction) {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    
    // API dışındaki her şeyi index.html'e gönder
    app.get('*', (req, res) => {
      // Eğer istek bir API rotasıysa (örneğin mail service), buraya hiç uğramamalı
      // Ama Express'in bazen şaşırdığı durumlar için manuel kontrol yapalım
      if (req.url === '/karlisin-mail-service' || req.url === '/api-verify') {
        return; // İşlemi durdur, rota zaten yukarıda tanımlı
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
  });
}

startServer();
