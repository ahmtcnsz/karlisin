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
  
  // API Key buraya gelecek (.env'den okunmalı)
  const resend = new Resend(process.env.RESEND_API_KEY);

  app.use(express.json());
  app.use(cors());

  // E-posta gönderim API'sı
  app.post('/api/welcome-email', async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'E-posta adresi gerekli' });
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY bulunamadı, mail gönderilemiyor ancak işleme devam ediliyor.');
      return res.status(200).json({ message: 'API anahtarı eksik, mail atlanıyor' });
    }

    try {
      console.log(`E-posta gönderiliyor: ${email}`);
      const sender = process.env.RESEND_FROM_EMAIL || 'FinCalc <onboarding@resend.dev>';
      
      const { data, error } = await resend.emails.send({
        from: sender,
        to: [email],
        subject: 'FinCalc Temettü Takibi - Aramıza Hoş Geldin! 🚀',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
            <h1 style="color: #6366f1; font-size: 28px; font-weight: 800; margin-bottom: 20px;">Hoş Geldin!</h1>
            <p style="font-size: 16px; line-height: 1.6;">Merhaba,</p>
            <p style="font-size: 16px; line-height: 1.6;">FinCalc Temettü Takibi özelliği için bekleme listesine başarıyla katıldın. Borsa İstanbul ve Amerikan borsalarındaki yatırım yolculuğunu kolaylaştırmak için sabırsızlanıyoruz.</p>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 30px 0;">
              <h3 style="margin-top: 0; color: #6366f1;">Seni Neler Bekliyor?</h3>
              <ul style="padding-left: 20px;">
                <li>Otomatik temettü takvimi</li>
                <li>Vergi ve beyanname hesaplama araçları</li>
                <li>10 yıllık pasif gelir projeksiyonları</li>
              </ul>
            </div>

            <p style="font-size: 16px; line-height: 1.6;">Özellik yayına girdiğinde sana buradan haber vereceğiz. O zamana kadar bizi takipte kal!</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            <p style="font-size: 12px; color: #94a3b8;">FinCalc Ekibi</p>
          </div>
        `
      });

      if (error) {
        console.error('Resend API Hatası:', JSON.stringify(error, null, 2));
        return res.status(400).json({ error });
      }

      console.log('E-posta başarıyla gönderildi:', data?.id);
      res.status(200).json({ message: 'E-posta başarıyla gönderildi', data });
    } catch (err) {
      console.error('Sunucu hatası:', err);
      res.status(500).json({ error: 'E-posta gönderilemedi' });
    }
  });

  // Vite middleware default (SPA)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
