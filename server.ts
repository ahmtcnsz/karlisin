import express from 'express';
import { createServer as createViteServer } from 'vite';
import { Resend } from 'resend';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import YahooFinance from 'yahoo-finance2';
const yahooFinance = new (YahooFinance as any)();
import NodeCache from 'node-cache';

// .env dosyasını yükle
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache instance (1 hour default TTL)
const cache = new NodeCache({ stdTTL: 3600 });
const AV_CACHE_TTL = 86400; // 24 hours for Alpha Vantage
const YAHOO_CACHE_TTL = 14400; // 4 hours for Yahoo Finance

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
  const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key');

  // WWW -> Non-WWW Redirect (Canonical Domain)
  app.use((req, res, next) => {
    const host = req.headers.host;
    if (host && host.startsWith('www.')) {
      const newHost = host.replace(/^www\./, '');
      console.log(`[Karlısın-Redirect] Redirecting ${host} to ${newHost}`);
      return res.redirect(301, `https://${newHost}${req.url}`);
    }
    next();
  });

  // CORS YAPILANDIRMASI
  app.use(cors({
    origin: '*', // Tüm domainlerden gelen isteklere (CORS) izin ver
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
  }));
  app.use(express.json());

  // Request logger
  app.use((req, res, next) => {
    console.log(`[Karlısın-REQ] ${req.method} ${req.url}`);
    next();
  });

  // ---------------------------------------------------------
  // 1. API ROTLARI (EN ÜSTTE OLMALI - VITE'DEN ÖNCE)
  // ---------------------------------------------------------

  // DIVIDEND API (Yahoo Finance)
  app.get('/api/dividends', async (req, res) => {
    const symbol = (req.query.symbol as string || '').toUpperCase();
    if (!symbol) return res.status(400).json({ error: 'Sembol eksik' });
    
    console.log(`[Karlısın-API] Temettü verisi isteniyor: ${symbol}`);

    const cacheKey = `div_${symbol}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log(`[Karlısın-API] Cache hit: ${symbol}`);
      return res.json(cachedData);
    }

    try {
      console.log(`[Karlısın-API] Yahoo Finance sorgusu başlıyor: ${symbol}`);
      // 1. Get core summary data (Reduced modules to avoid validation errors)
      // Note: 'dividendHistory' and 'recommendationTrend' often cause schema errors
      const summary = await yahooFinance.quoteSummary(symbol, {
        modules: ['summaryDetail', 'calendarEvents', 'assetProfile', 'defaultKeyStatistics', 'financialData', 'price']
      });
      console.log(`[Karlısın-API] Summary alındı: ${symbol}`);

      // 2. Get historical dividends (last 5 years)
      const now = new Date();
      const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
      
      let historyData = [];
      try {
        const history = await yahooFinance.chart(symbol, {
          period1: fiveYearsAgo,
          period2: now,
          events: 'dividends'
        }) as any;
        historyData = history.events?.dividends || [];
      } catch (histErr) {
        console.warn(`[Karlısın-API] Geçmiş temettü verisi çekilemedi (${symbol}):`, histErr);
      }

      const result = {
        symbol,
        summary,
        history: historyData
      };

      cache.set(cacheKey, result, YAHOO_CACHE_TTL);
      res.json(result);
    } catch (err: any) {
      console.error(`[Karlısın-API] Yahoo Finance Hatası (${symbol}):`, err);
      
      // Detailed error logging for debugging validation issues
      if (err.name === 'YahooFinanceError' && err.errors) {
        console.error('Validation Errors:', JSON.stringify(err.errors, null, 2));
      }

      res.status(500).json({ 
        error: 'Veri çekilemedi', 
        message: err.message,
        details: err.errors || [] 
      });
    }
  });

  // HEALTH CHECK API
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      time: new Date().toISOString(),
      keys: {
        resend: !!process.env.RESEND_API_KEY,
        alphavantage: !!process.env.ALPHA_VANTAGE_API_KEY
      },
      cache: cache.getStats()
    });
  });

  // ALPHA VANTAGE INTEGRATION
  const handleAVResponse = async (req: express.Request, res: express.Response, url: string, cacheKey?: string) => {
    try {
      console.log(`[Karlısın-AV] Fetching: ${url.replace(/apikey=[^&]+/, 'apikey=REDACTED')}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`[Karlısın-AV] HTTP Error ${response.status}: ${url}`);
        return res.status(response.status).json({ error: 'Alpha Vantage API HTTP Error', status: response.status });
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        
        // Alpha Vantage signals limits/errors in 200 OK JSON
        if (data && (data.Note || data.Information || data['Error Message'])) {
          console.warn(`[Karlısın-AV] API Message:`, data.Note || data.Information || data['Error Message']);
          return res.status(data['Error Message'] ? 400 : 429).json({ 
            error: data['Error Message'] ? 'API Hata' : 'API Limit', 
            message: data.Note || data.Information || data['Error Message'] 
          });
        }

        if (cacheKey) cache.set(cacheKey, data, AV_CACHE_TTL);
        return res.json(data);
      } else {
        // Probably CSV or text
        const text = await response.text();
        return res.json({ raw: text, type: contentType });
      }
    } catch (err: any) {
      console.error(`[Karlısın-AV] Critical Error:`, err);
      res.status(500).json({ error: 'Alpha Vantage Bridge Error', message: err.message });
    }
  };

  app.get('/api/alphavantage/overview', async (req, res) => {
    const symbol = (req.query.symbol as string || '').toUpperCase();
    if (!symbol) return res.status(400).json({ error: 'Sembol eksik' });
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) return res.status(503).json({ error: 'API Key missing' });

    const cacheKey = `av_overview_${symbol}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    let avSymbol = symbol;
    if (symbol.endsWith('.IS')) avSymbol = symbol.replace('.IS', '.IST');
    const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${avSymbol}&apikey=${apiKey}`;
    return handleAVResponse(req, res, url, cacheKey);
  });

  app.get('/api/alphavantage/news', async (req, res) => {
    const symbol = (req.query.symbol as string || '').toUpperCase();
    if (!symbol) return res.status(400).json({ error: 'Sembol eksik' });
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) return res.status(503).json({ error: 'API Key missing' });

    const cacheKey = `av_news_${symbol}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    let avSymbol = symbol;
    if (symbol.endsWith('.IS')) avSymbol = symbol.replace('.IS', '.IST');
    const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${avSymbol}&apikey=${apiKey}`;
    return handleAVResponse(req, res, url, cacheKey);
  });

  app.get('/api/alphavantage/rsi', async (req, res) => {
    const symbol = (req.query.symbol as string || '').toUpperCase();
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) return res.status(503).json({ error: 'API Key missing' });

    let avSymbol = symbol;
    if (symbol.endsWith('.IS')) avSymbol = symbol.replace('.IS', '.IST');
    const url = `https://www.alphavantage.co/query?function=RSI&symbol=${avSymbol}&interval=daily&time_period=14&series_type=close&apikey=${apiKey}`;
    const cacheKey = `av_rsi_${symbol}`;
    return handleAVResponse(req, res, url, cacheKey);
  });

  app.get('/api/alphavantage/earnings', async (req, res) => {
    const symbol = (req.query.symbol as string || '').toUpperCase();
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) return res.status(503).json({ error: 'API Key missing' });

    let avSymbol = symbol;
    if (symbol.endsWith('.IS')) avSymbol = symbol.replace('.IS', '.IST');
    const url = `https://www.alphavantage.co/query?function=EARNINGS&symbol=${avSymbol}&apikey=${apiKey}`;
    const cacheKey = `av_earn_${symbol}`;
    return handleAVResponse(req, res, url, cacheKey);
  });

  app.get('/api/alphavantage/cashflow', async (req, res) => {
    const symbol = (req.query.symbol as string || '').toUpperCase();
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) return res.status(503).json({ error: 'API Key missing' });

    let avSymbol = symbol;
    if (symbol.endsWith('.IS')) avSymbol = symbol.replace('.IS', '.IST');
    const url = `https://www.alphavantage.co/query?function=CASH_FLOW&symbol=${avSymbol}&apikey=${apiKey}`;
    const cacheKey = `av_cf_${symbol}`;
    return handleAVResponse(req, res, url, cacheKey);
  });

  app.get('/api/alphavantage/financials', async (req, res) => {
    const symbol = (req.query.symbol as string || '').toUpperCase();
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) return res.status(503).json({ error: 'API Key missing' });

    const cacheKey = `av_fin_${symbol}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    let avSymbol = symbol;
    if (symbol.endsWith('.IS')) avSymbol = symbol.replace('.IS', '.IST');
    const url = `https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=${avSymbol}&apikey=${apiKey}`;
    return handleAVResponse(req, res, url, cacheKey);
  });

  app.get('/api/alphavantage/commodity/:type', async (req, res) => {
    const type = req.params.type.toUpperCase();
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) return res.status(503).json({ error: 'API Key missing' });

    const cacheKey = `av_comm_${type}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);
    
    const url = `https://www.alphavantage.co/query?function=${type}&apikey=${apiKey}`;
    return handleAVResponse(req, res, url, cacheKey);
  });

  app.get('/api/alphavantage/economics/:func', async (req, res) => {
    const func = req.params.func.toUpperCase();
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) return res.status(503).json({ error: 'API Key missing' });

    const cacheKey = `av_econ_${func}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const url = `https://www.alphavantage.co/query?function=${func}&apikey=${apiKey}`;
    return handleAVResponse(req, res, url, cacheKey);
  });

  app.get('/api/alphavantage/calendar', async (req, res) => {
    const horizon = req.query.horizon || '3month'; // 3month or 6month
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

    if (!apiKey) {
      return res.status(503).json({ error: 'Alpha Vantage API anahtarı yapılandırılmamış.' });
    }

    const cacheKey = `av_calendar_${horizon}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    try {
      console.log(`[Karlısın-AV] Calendar request for horizon: ${horizon}`);
      const url = `https://www.alphavantage.co/query?function=DIVIDEND_CALENDAR&horizon=${horizon}&apikey=${apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        return res.status(response.status).json({ error: 'Calendar API error', status: response.status });
      }

      const csvText = await response.text();

      // Check for Alpha Vantage standard error/info JSON embedded in text
      if (csvText.includes('"Note":') || csvText.includes('"Information":') || csvText.includes('"Error Message":')) {
        try {
          const errObj = JSON.parse(csvText);
          return res.status(429).json({ error: 'API Limit/Error', message: errObj.Note || errObj.Information || errObj['Error Message'] });
        } catch (e) {
          // Continue to parse as CSV if it's not JSON
        }
      }

      // Basic CSV to JSON
      const lines = csvText.trim().split('\n').filter(l => l.trim().length > 0);
      if (lines.length < 2) {
        return res.json([]);
      }
      
      // Some versions of the API might return "No events found" as a single line
      if (lines.length === 1 && lines[0].toLowerCase().includes('no events')) {
        return res.json([]);
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const results = lines.slice(1).map(line => {
        const values = line.split(',');
        const entry: any = {};
        headers.forEach((header, i) => {
          // Map potentially different header names to what frontend expects
          let cleanHeader = header.replace(/"/g, '');
          if (cleanHeader === 'dividend_amount') cleanHeader = 'amount';
          if (cleanHeader === 'ex_dividend_date') cleanHeader = 'dividend_date';
          
          entry[cleanHeader] = (values[i] || '').replace(/"/g, '').trim();
        });
        return entry;
      });

      cache.set(cacheKey, results, AV_CACHE_TTL);
      res.json(results);
    } catch (err: any) {
      console.error(`[Karlısın-AV] Calendar Error:`, err);
      res.status(500).json({ error: 'Alpha Vantage takvim hatası', message: err.message });
    }
  });

  // SEARCH API (Symbol lookup)
  app.get('/api/stock/search', async (req, res) => {
    const query = req.query.q as string;
    if (!query) return res.status(400).json({ error: 'Sorgu eksik' });

    try {
      const results = await yahooFinance.search(query) as any;
      if (!results || !results.quotes) {
        return res.json([]);
      }
      // Filter for Yahoo Finance valid quotes and map to a clean structure
      const quotes = (results.quotes || []).filter((q: any) => q.isYahooFinance || q.symbol);
      res.json(quotes);
    } catch (err: any) {
      console.error(`[Karlısın-API] Arama Hatası:`, err);
      res.status(500).json({ error: 'Arama yapılamadı' });
    }
  });
  
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
    const { email, type } = req.method === 'POST' ? req.body : req.query;
    
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
      
      let subject = 'Karlısın Temettü Takibi - Aramıza Hoş Geldin! 🚀';
      let content = `
        <p style="font-size: 16px; margin-bottom: 24px;">
          <strong>Karlısın</strong> Temettü Takibi özelliği için bekleme listesine başarıyla katıldın. 
          Borsa İstanbul ve Amerikan borsalarındaki yatırım yolculuğunu kolaylaştırmak için sabırsızlanıyoruz.
        </p>
        
        <div style="background-color: #f8fafc; border-radius: 24px; padding: 32px; margin-bottom: 24px; border: 1px solid #f1f5f9;">
          <h2 style="color: #4f46e5; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">Seni Neler Bekliyor?</h2>
          <ul style="margin: 0; padding-left: 20px; color: #475569;">
            <li style="margin-bottom: 8px;">Otomatik temettü takvimi</li>
            <li style="margin-bottom: 8px;">Vergi ve beyanname hesaplama araçları</li>
            <li style="margin-bottom: 8px;">10 yıllık pasif gelir projeksiyonları</li>
          </ul>
        </div>
      `;

      if (type === 'newsletter') {
        subject = 'Karlısın Bülten - Haftalık Analizler Başlıyor! 📚';
        content = `
          <p style="font-size: 16px; margin-bottom: 24px;">
            <strong>Karlısın Haftalık Bülten</strong>'ine başarıyla abone oldun! Artık e-ticaret ve piyasa analizleri e-posta kutuna gelecek.
          </p>
          
          <div style="background-color: #f0f9ff; border-radius: 24px; padding: 32px; margin-bottom: 24px; border: 1px solid #e0f2fe;">
            <h2 style="color: #0369a1; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">Neleri Takip Edeceğiz?</h2>
            <ul style="margin: 0; padding-left: 20px; color: #0c4a6e;">
              <li style="margin-bottom: 8px;">Haftalık pazaryeri analizleri</li>
              <li style="margin-bottom: 8px;">Kârlılık artırma stratejileri</li>
              <li style="margin-bottom: 8px;">Yeni blog yazıları ve güncel haberler</li>
            </ul>
          </div>
          
          <p style="font-size: 14px; font-weight: 600; color: #4f46e5;">
            Yeni bir blog yazısı paylaştığımızda ilk senin haberin olacak.
          </p>
        `;
      }

      const { data, error } = await resend.emails.send({
        from: sender,
        to: [email as string],
        subject: subject,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; padding: 20px; line-height: 1.6;">
            <h1 style="color: #4f46e5; font-size: 32px; font-weight: 800; margin-bottom: 24px; letter-spacing: -0.025em;">Hoş Geldin!</h1>
            
            <p style="font-size: 16px; margin-bottom: 16px;">Merhaba,</p>
            
            ${content}
            
            <p style="font-size: 14px; color: #64748b; margin-bottom: 32px;">
              Tüm gelişmeleri sana buradan haber vereceğiz. O zamana kadar bizi takipte kal!
            </p>
            
            <div style="border-top: 1px solid #e2e8f0; pt: 24px; text-align: center;">
              <p style="font-size: 12px; color: #94a3b8; margin-top: 20px;">
                © 2024 Karlısın — Finansal Özgürlük Yolculuğun
              </p>
            </div>
          </div>
        `
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

  // TOPLU MAİL GÖNDERİMİ (Yeni Blog Yazısı Haber Ver)
  app.post('/api/broadcast', async (req, res) => {
    const { subscribers, articleTitle, articleExcerpt, articleUrl } = req.body;
    
    if (!subscribers || !Array.isArray(subscribers) || subscribers.length === 0) {
      return res.status(400).json({ error: 'Abone listesi eksik' });
    }

    console.log(`[Karlısın-API] Broadcast başlatılıyor: ${subscribers.length} kişi`);
    
    const sender = process.env.RESEND_FROM_EMAIL || 'Karlısın <merhaba@karlisin.com>';
    const results = { success: 0, fail: 0 };

    // Basit seri gönderim (Hız limiti için)
    for (const email of subscribers) {
      try {
        await resend.emails.send({
          from: sender,
          to: [email],
          subject: `Yeni Blog Yazısı: ${articleTitle} 📚`,
          html: `
            <div style="font-family:sans-serif;padding:20px;color:#1e293b;max-width:600px;margin:0 auto;">
              <h2 style="color:#4f46e5;">Yeni Bir Yazımız Var!</h2>
              <p>Merhaba, Karlısın Blog'da yeni bir içerik paylaştık:</p>
              <div style="background:#f8fafc;padding:24px;border-radius:20px;border:1px solid #e2e8f0;margin:20px 0;">
                <h3 style="margin-top:0;">${articleTitle}</h3>
                <p style="color:#64748b;">${articleExcerpt}</p>
                <a href="${articleUrl || 'https://karlisin.com/blog'}" style="display:inline-block;background:#4f46e5;color:white;padding:12px 24px;text-decoration:none;border-radius:12px;font-weight:bold;">Şimdi Oku</a>
              </div>
              <p style="font-size:12px;color:#94a3b8;">Haftalık bültenimize abone olduğunuz için bu maili aldınız.</p>
            </div>
          `
        });
        results.success++;
      } catch (err) {
        console.error(`Broadcast hatası (${email}):`, err);
        results.fail++;
      }
    }

    res.json({ message: 'Broadcast tamamlandı', results });
  });

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

  // SEO DOSYALARI İÇİN AÇIK ROTALAR (Her zaman erişilebilir olmalı)
  app.get('/sitemap.xml', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
  });
  app.get('/robots.txt', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
  });
  app.get('/ads.txt', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.sendFile(path.join(__dirname, 'public', 'ads.txt'));
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

startServer().catch(err => {
  console.error('[Karlısın-Sunucu] Başlatma hatası:', err);
});
