import * as dotenv from 'dotenv';
// .env dosyasını EN BAŞTA yükle
dotenv.config();

import express from 'express';
import { createServer as createViteServer } from 'vite';
import { Resend } from 'resend';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import yahooFinanceModule from 'yahoo-finance2';
import NodeCache from 'node-cache';

const APP_VERSION = '1.0.7';

// Yahoo Finance initialization
let yahooFinance: any;
try {
  const YFClass = (yahooFinanceModule as any).default || yahooFinanceModule;
  yahooFinance = new YFClass({
    queue: { concurrency: 1 },
    validation: { logErrors: true },
    suppressNotices: ['yahooSurvey']
  });
  console.log(`[Karlısın-Sunucu] v${APP_VERSION} Yahoo Finance örneği başarıyla oluşturuldu.`);
} catch (e: any) {
  console.error(`[Karlısın-Sunucu] v${APP_VERSION} Yahoo Finance başlatılamadı:`, e.message);
  yahooFinance = null;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache instance (1 hour default TTL)
const cache = new NodeCache({ stdTTL: 3600 });
const AV_CACHE_TTL = 86400; // 24 hours for Alpha Vantage
const YAHOO_CACHE_TTL = 14400; // 4 hours for Yahoo Finance

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  const isProduction = process.env.NODE_ENV === 'production';
  console.log(`[Karlısın-Sunucu] Başlatılıyor. Mod: ${process.env.NODE_ENV} (v${APP_VERSION})`);
  
  // Ortam değişkenleri kontrolü
  console.log('--- Sistem Yapılandırması ---');
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Tanımlı' : 'EKSİK!');
  console.log('ALPHA_VANTAGE_API_KEY:', process.env.ALPHA_VANTAGE_API_KEY ? 'Tanımlı' : 'EKSİK!');
  console.log('---------------------------');

  const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key');

  // 1. GLOBAL MIDDLEWARE
  app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'], allowedHeaders: ['Content-Type'] }));
  app.use(express.json());

  // Request logger
  app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
      console.log(`[Karlısın-API] ${req.method} ${req.url}`);
    }
    next();
  });

  // WWW -> Non-WWW Redirect (Keep for HTML pages, skip for API)
  app.use((req, res, next) => {
    const host = req.headers.host || '';
    if (host.startsWith('www.') && !req.url.startsWith('/api') && !host.includes('localhost') && !host.includes('.run.app')) {
      const newHost = host.replace(/^www\./, '');
      return res.redirect(301, `https://${newHost}${req.url}`);
    }
    next();
  });

  // ---------------------------------------------------------
  // 2. API ROUTER
  // ---------------------------------------------------------
  const api = express.Router();

  // DIVIDEND API
  api.get('/dividends', async (req, res) => {
    const symbol = (req.query.symbol as string || '').toUpperCase().trim();
    if (!symbol) return res.status(400).json({ error: 'Sembol eksik', version: APP_VERSION });
    
    const cacheKey = `div_v2_${symbol}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json({ ...(cachedData as any), version: APP_VERSION, cached: true });
    }

    try {
      if (!yahooFinance) throw new Error('Yahoo Finance servisi hazır değil.');

      const summary = await yahooFinance.quoteSummary(symbol, {
        modules: ['summaryDetail', 'calendarEvents', 'assetProfile', 'defaultKeyStatistics', 'financialData', 'price']
      });

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
        console.warn(`[Karlısın-API] No history for ${symbol}`);
      }

      const result = { symbol, summary, history: historyData, version: APP_VERSION };
      cache.set(cacheKey, result, YAHOO_CACHE_TTL);
      res.json(result);
    } catch (err: any) {
      console.error(`[Karlısın-API] Hata (${symbol}):`, err.message);
      const statusCode = err.name === 'YahooFinanceError' ? 404 : 500;
      res.status(statusCode).json({ error: 'Veri çekilemedi', message: err.message, version: APP_VERSION });
    }
  });

  api.get('/health', (req, res) => {
    res.json({ status: 'ok', version: APP_VERSION, env: process.env.NODE_ENV, time: new Date().toISOString() });
  });

  // alpha vantage ve arama api'larını buraya taşıyabiliriz ama şimdilik ana router'a mount edelim


  // Mount API Router
  app.use('/api', api);

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

  // Mount Alpha Vantage routes to API router or app
  api.get('/alphavantage/overview', async (req, res) => {
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

  api.get('/alphavantage/news', async (req, res) => {
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

  api.get('/alphavantage/rsi', async (req, res) => {
    const symbol = (req.query.symbol as string || '').toUpperCase();
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) return res.status(503).json({ error: 'API Key missing' });

    let avSymbol = symbol;
    if (symbol.endsWith('.IS')) avSymbol = symbol.replace('.IS', '.IST');
    const url = `https://www.alphavantage.co/query?function=RSI&symbol=${avSymbol}&interval=daily&time_period=14&series_type=close&apikey=${apiKey}`;
    const cacheKey = `av_rsi_${symbol}`;
    return handleAVResponse(req, res, url, cacheKey);
  });

  api.get('/alphavantage/calendar', async (req, res) => {
    const horizon = req.query.horizon || '3month'; 
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) return res.status(503).json({ error: 'API Key missing' });

    const cacheKey = `av_calendar_${horizon}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    try {
      const url = `https://www.alphavantage.co/query?function=DIVIDEND_CALENDAR&horizon=${horizon}&apikey=${apiKey}`;
      const response = await fetch(url);
      if (!response.ok) return res.status(response.status).json({ error: 'Calendar API error' });
      const csvText = await response.text();
      // ... same CSV logic ...
      const lines = csvText.trim().split('\n').filter(l => l.trim().length > 0);
      if (lines.length < 2) return res.json([]);
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const results = lines.slice(1).map(line => {
        const values = line.split(',');
        const entry: any = {};
        headers.forEach((header, i) => {
          let cleanHeader = header.replace(/"/g, '');
          if (cleanHeader === 'dividend_amount') cleanHeader = 'amount';
          if (cleanHeader === 'ex_dividend_date') cleanHeader = 'dividend_date';
          entry[cleanHeader] = (values[i] || '').replace(/"/g, '').trim();
        });
        return entry;
      });
      cache.set(cacheKey, results, AV_CACHE_TTL);
      res.json(results);
    } catch (err: any) { res.status(500).json({ error: 'Calendar Error', message: err.message }); }
  });

  // SEARCH
  api.get('/stock/search', async (req, res) => {
    const query = req.query.q as string;
    if (!query) return res.status(400).json({ error: 'Sorgu eksik' });
    try {
      if (!yahooFinance) throw new Error('Arama servisi hazır değil.');
      const results = await yahooFinance.search(query) as any;
      const quotes = (results.quotes || []).filter((q: any) => q.isYahooFinance || q.symbol);
      res.json(quotes);
    } catch (err: any) { res.status(500).json({ error: 'Arama Hatası', message: err.message }); }
  });

  // MAIL
  const mailHandler = async (req: express.Request, res: express.Response) => {
    const { email, type } = req.method === 'POST' ? req.body : req.query;
    if (!email) return res.status(400).json({ error: 'E-posta eksik' });
    try {
      const sender = process.env.RESEND_FROM_EMAIL || 'Karlısın <merhaba@karlisin.com>';
      const { data, error } = await resend.emails.send({
        from: sender,
        to: [email as string],
        subject: type === 'newsletter' ? 'Bülten Aboneliği' : 'Hoş Geldin!',
        html: `<p>Merhaba, Karlısın'a hoş geldin!</p>`
      });
      if (error) return res.status(400).json({ error: error.message });
      res.status(200).json({ success: true, id: data?.id });
    } catch (err: any) { res.status(500).json({ error: 'Mail Hatası', message: err.message }); }
  };
  api.all('/mail', mailHandler);

  // Fallback for API
  api.all('*', (req, res) => {
    res.status(404).json({ error: 'API rotası bulunamadı', path: req.path });
  });

  // ---------------------------------------------------------
  // 2. ERROR HANDLING (Kritik: HTML yerine JSON dönmek için)
  // ---------------------------------------------------------
  
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[Karlısın-HATA] Kritik Sunucu Hatası:', err);
    res.status(500).json({ 
      error: 'Sunucu hatası oluştu', 
      message: err.message,
      path: req.path
    });
  });

  // ---------------------------------------------------------
  // 3. LOGLAMA VE DİĞERLERİ
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

  // isProduction already declared at the top of startServer
  
  if (isProduction) {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    
    app.get('*', (req, res) => {
      // API isteklerini ASLA index.html'e gönderme
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API rotası bulunamadı (Fallback)', path: req.path });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    
    app.use((req, res, next) => {
      if (req.path.startsWith('/api')) return next();
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
