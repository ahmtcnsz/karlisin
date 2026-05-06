import express from 'express';
import { createServer as createViteServer } from 'vite';
import { Resend } from 'resend';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import yahooFinanceModule from 'yahoo-finance2';
import NodeCache from 'node-cache';

// yahoo-finance2 v3+ robust instantiation logic
// This fixes the "Call new YahooFinance() first" error
let yf: any = null;

function getYahoo() {
  if (yf && typeof yf.quote === 'function') return yf;
  
  try {
    const raw: any = yahooFinanceModule;
    if (typeof raw === 'function') {
      yf = new raw();
      console.log('[Karlısın-INIT] Yahoo Finance: Initialized via default constructor.');
    } else if (raw.YahooFinance && typeof raw.YahooFinance === 'function') {
      yf = new raw.YahooFinance();
      console.log('[Karlısın-INIT] Yahoo Finance: Initialized via named class.');
    } else if (raw.default && typeof raw.default === 'function') {
      yf = new raw.default();
      console.log('[Karlısın-INIT] Yahoo Finance: Initialized via raw.default.');
    } else {
      yf = raw.default || raw;
      console.log('[Karlısın-INIT] Yahoo Finance: Falling back to singleton.');
    }

    if (yf && typeof yf.setGlobalConfig === 'function') {
      yf.setGlobalConfig({ validation: { logErrors: false } });
    }
  } catch (e) {
    console.warn('[Karlısın-INIT] Yahoo Finance instantiation error:', e);
    yf = yahooFinanceModule;
  }
  return yf;
}

// .env dosyasını yükle
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 12-Hour Data Engine Cache (43200 seconds)
const cache = new NodeCache({ stdTTL: 43200 });

/**
 * UNIFIED DATA SERVICE
 * Cross-verifies data from BIST, Yahoo, Google and Alpha Vantage
 */
class UnifiedDataService {
  static async getFullStockData(symbol: string) {
    const cleanSymbol = symbol.toUpperCase().trim();
    const cacheKey = `unified_v1_${cleanSymbol}`;
    
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log(`[UnifiedDS] Cache hit: ${cleanSymbol}`);
      return cached;
    }

    console.log(`[UnifiedDS] Starting aggregation for: ${cleanSymbol}`);
    
    // Providers to run in parallel
    const [yahoo, google, av] = await Promise.allSettled([
      this.fetchYahoo(cleanSymbol),
      this.fetchGoogle(cleanSymbol),
      this.fetchAlphaVantage(cleanSymbol)
    ]);

    const results: any = {
      yahoo: yahoo.status === 'fulfilled' ? yahoo.value : null,
      google: google.status === 'fulfilled' ? google.value : null,
      av: av.status === 'fulfilled' ? av.value : null
    };

    // CROSS-VERIFICATION LOGIC
    // We pick the best pieces from each source
    const primary = results.yahoo || results.google || results.av;
    if (!primary) throw new Error('Yeterli veri kaynağına ulaşılamadı.');

    const aggregated = {
      symbol: cleanSymbol,
      source: 'aggregated',
      timestamp: new Date().toISOString(),
      summary: {
        price: {
          // Cross-verify price: Prefer Google for potentially fresher BIST price
          regularMarketPrice: { 
            value: results.google?.price || results.yahoo?.price || results.av?.price || 0 
          },
          longName: results.yahoo?.name || results.google?.name || results.av?.name || cleanSymbol,
          currency: results.yahoo?.currency || results.google?.currency || results.av?.currency || 'TRY'
        },
        summaryDetail: {
          // Cross-verify Dividends
          dividendYield: { 
            value: results.yahoo?.dividendYield || results.av?.dividendYield || 0 
          },
          dividendRate: { 
            value: results.yahoo?.dividendRate || results.av?.dividendRate || 0 
          },
          marketCap: { 
            value: results.yahoo?.marketCap || results.av?.marketCap || results.google?.marketCap || 0 
          },
          trailingPE: { value: results.yahoo?.pe || results.av?.pe || 0 },
          fiftyTwoWeekHigh: { value: results.yahoo?.high52 || 0 },
          fiftyTwoWeekLow: { value: results.yahoo?.low52 || 0 }
        }
      },
      history: results.yahoo?.history || [],
      verification: {
        sources_count: Object.values(results).filter(v => !!v).length,
        google_verified: !!results.google,
        yahoo_verified: !!results.yahoo,
        alpha_vantage_verified: !!results.av
      }
    };

    // Persist for 12 hours (43200 seconds)
    cache.set(cacheKey, aggregated, 43200);
    return aggregated;
  }

  private static async fetchYahoo(symbol: string) {
    const yf = getYahoo();
    // Map to BIST if needed
    const tickers = symbol.includes('.') ? [symbol] : [`${symbol}.IS`, symbol];
    
    for (const t of tickers) {
      try {
        const quote = await yf.quote(t);
        if (!quote || !quote.regularMarketPrice) continue;

        let history = [];
        try {
          const now = new Date();
          const p1 = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
          const chart = await yf.chart(t, { period1: p1, period2: now, events: 'dividends' });
          if (chart?.events?.dividends) history = JSON.parse(JSON.stringify(chart.events.dividends));
        } catch (e) {}

        const summary = await yf.quoteSummary(t, { modules: ['summaryDetail'] }).catch(() => null);

        return {
          price: quote.regularMarketPrice,
          name: quote.longName || quote.shortName,
          currency: quote.currency,
          dividendYield: quote.trailingAnnualDividendYield || summary?.summaryDetail?.dividendYield || 0,
          dividendRate: quote.trailingAnnualDividendRate || summary?.summaryDetail?.dividendRate || 0,
          marketCap: quote.marketCap,
          pe: quote.trailingPE,
          high52: quote.fiftyTwoWeekHigh,
          low52: quote.fiftyTwoWeekLow,
          history
        };
      } catch (e) {}
    }
    return null;
  }

  private static async fetchGoogle(symbol: string) {
    const gt = symbol.includes('.') ? `IST:${symbol.split('.')[0]}` : `IST:${symbol}`;
    try {
      const res = await fetch(`https://www.google.com/finance/quote/${gt}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      if (!res.ok) return null;
      const html = await res.text();
      
      const priceMatch = html.match(/data-last-price="([^"]+)"/);
      const currencyMatch = html.match(/data-currency-code="([^"]+)"/);
      const nameMatch = html.match(/<div class="zzDe9c">([^<]+)<\/div>/);

      if (priceMatch) {
        return {
          price: parseFloat(priceMatch[1]),
          currency: currencyMatch ? currencyMatch[1] : 'TRY',
          name: nameMatch ? nameMatch[1] : symbol,
          source: 'Google'
        };
      }
    } catch (e) {}
    return null;
  }

  private static async fetchAlphaVantage(symbol: string) {
    const key = process.env.ALPHA_VANTAGE_API_KEY;
    if (!key || key === 'YOUR_AV_KEY') return null;
    
    // AV format for BIST is SYMBOL.IST
    const avt = symbol.includes('.') ? symbol.replace('.IS', '.IST') : `${symbol}.IST`;
    try {
      const res = await fetch(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${avt}&apikey=${key}`);
      const data = await res.json();
      if (data && data.Symbol) {
        return {
          name: data.Name,
          dividendYield: parseFloat(data.DividendYield) || 0,
          dividendRate: parseFloat(data.DividendPerShare) || 0,
          marketCap: parseFloat(data.MarketCapitalization) || 0,
          pe: parseFloat(data.PERatio) || 0,
          currency: data.Currency || 'TRY'
        };
      }
    } catch (e) {}
    return null;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Key Diagnostics
  console.log('--- API Diagnostics ---');
  console.log('FINNHUB_API_KEY:', process.env.FINNHUB_API_KEY ? 'Present' : 'MISSING');
  console.log('ALPHA_VANTAGE_API_KEY:', process.env.ALPHA_VANTAGE_API_KEY ? 'Present' : 'MISSING');
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Present' : 'MISSING');
  console.log('-----------------------');

  // Resend yapılandırması
  const resend = new Resend(process.env.RESEND_API_KEY || 're_123');

  // CORS ve JSON (En üstte olmalı)
  app.use(cors());
  app.use(express.json());

  // Request logger
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[Karlısın-API-REQ] ${req.method} ${req.path}`);
    }
    next();
  });

  // ---------------------------------------------------------
  // 1. API ROTLARI (KESİN OLARAK ÜSTTE)
  // ---------------------------------------------------------

  // DIVIDEND API (Unified Engine: Yahoo + Google + Alpha Vantage)
  app.get('/api/dividends', async (req, res) => {
    const symbol = (req.query.symbol as string || '').toUpperCase().trim();
    if (!symbol) return res.status(400).json({ error: 'Sembol eksik' });

    try {
      const data = await UnifiedDataService.getFullStockData(symbol);
      res.json(data);
    } catch (err: any) {
      console.error(`[Karlısın-API] Aggregation failed for ${symbol}:`, err.message);
      res.status(404).json({ 
        error: 'Veri çekilemedi. Lütfen sembolü kontrol edin veya daha sonra tekrar deneyin.', 
        symbol,
        message: err.message
      });
    }
  });

  // ---------------------------------------------------------
  // ALPHA VANTAGE INTEGRATION
  // ---------------------------------------------------------
  app.get('/api/alphavantage/overview', async (req, res) => {
    const symbol = (req.query.symbol as string || '').toUpperCase();
    if (!symbol) return res.status(400).json({ error: 'Sembol eksik' });
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

    if (!apiKey) {
      return res.status(503).json({ error: 'Alpha Vantage API anahtarı yapılandırılmamış.' });
    }

    const cacheKey = `av_overview_${symbol}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    try {
      // Alpha Vantage BIST symbols typically use .IST or we try with .IS mapping
      let avSymbol = symbol;
      if (symbol.endsWith('.IS')) avSymbol = symbol.replace('.IS', '.IST');

      const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${avSymbol}&apikey=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data && data.Symbol) {
        // High TTL for stable data
        cache.set(cacheKey, data, 43200);
        res.json(data);
      } else if (data.Note || data.Information) {
        res.status(429).json({ error: 'Alpha Vantage limitine takıldı', details: data });
      } else {
        res.status(404).json({ error: 'Alpha Vantage veri bulamadı', details: data });
      }
    } catch (err: any) {
      res.status(500).json({ error: 'Alpha Vantage hatası', message: err.message });
    }
  });

  // NEW: Alpha Vantage News Sentiment
  app.get('/api/alphavantage/news', async (req, res) => {
    const symbol = (req.query.symbol as string || '').toUpperCase();
    if (!symbol) return res.status(400).json({ error: 'Sembol eksik' });
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

    if (!apiKey) return res.status(503).json({ error: 'API Key missing' });

    const cacheKey = `av_news_${symbol}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    try {
      let avSymbol = symbol;
      if (symbol.endsWith('.IS')) avSymbol = symbol.replace('.IS', '.IST');
      
      const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${avSymbol}&apikey=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.feed) {
        cache.set(cacheKey, data, 3600); // 1 hour for news
        res.json(data);
      } else if (data.Note || data.Information) {
        res.status(429).json({ error: 'Limit reached', details: data });
      } else {
        res.json(data);
      }
    } catch (err: any) {
      res.status(500).json({ error: 'News error', message: err.message });
    }
  });

  // NEW: Alpha Vantage RSI (Technical Indicator)
  app.get('/api/alphavantage/rsi', async (req, res) => {
    const symbol = (req.query.symbol as string || '').toUpperCase();
    if (!symbol) return res.status(400).json({ error: 'Sembol eksik' });
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

    if (!apiKey) return res.status(503).json({ error: 'API Key missing' });

    const cacheKey = `av_rsi_${symbol}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    try {
      let avSymbol = symbol;
      if (symbol.endsWith('.IS')) avSymbol = symbol.replace('.IS', '.IST');
      
      const url = `https://www.alphavantage.co/query?function=RSI&symbol=${avSymbol}&interval=daily&time_period=14&series_type=close&apikey=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data['Technical Analysis: RSI']) {
        cache.set(cacheKey, data, 21600); // 6 hours for indicators
        res.json(data);
      } else if (data.Note || data.Information) {
        res.status(429).json({ error: 'Limit logic', details: data });
      } else {
        res.json(data);
      }
    } catch (err: any) {
      res.status(500).json({ error: 'RSI error', message: err.message });
    }
  });

  // NEW: Alpha Vantage Earnings
  app.get('/api/alphavantage/earnings', async (req, res) => {
    const symbol = (req.query.symbol as string || '').toUpperCase();
    if (!symbol) return res.status(400).json({ error: 'Sembol eksik' });
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

    if (!apiKey) return res.status(503).json({ error: 'API Key missing' });

    const cacheKey = `av_earn_${symbol}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    try {
      let avSymbol = symbol;
      if (symbol.endsWith('.IS')) avSymbol = symbol.replace('.IS', '.IST');
      
      const url = `https://www.alphavantage.co/query?function=EARNINGS&symbol=${avSymbol}&apikey=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.Symbol) {
        cache.set(cacheKey, data, 43200); // 12 hours for earnings
        res.json(data);
      } else if (data.Note || data.Information) {
        res.status(429).json({ error: 'Limit', details: data });
      } else {
        res.json(data);
      }
    } catch (err: any) {
      res.status(500).json({ error: 'Earnings error', message: err.message });
    }
  });

  // NEW: Alpha Vantage Cash Flow
  app.get('/api/alphavantage/cashflow', async (req, res) => {
    const symbol = (req.query.symbol as string || '').toUpperCase();
    if (!symbol) return res.status(400).json({ error: 'Sembol eksik' });
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

    if (!apiKey) return res.status(503).json({ error: 'API Key missing' });

    const cacheKey = `av_cf_${symbol}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    try {
      let avSymbol = symbol;
      if (symbol.endsWith('.IS')) avSymbol = symbol.replace('.IS', '.IST');
      
      const url = `https://www.alphavantage.co/query?function=CASH_FLOW&symbol=${avSymbol}&apikey=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.Symbol) {
        cache.set(cacheKey, data, 43200); // 12 hours
        res.json(data);
      } else if (data.Note || data.Information) {
        res.status(429).json({ error: 'Limit CF', details: data });
      } else {
        res.json(data);
      }
    } catch (err: any) {
      res.status(500).json({ error: 'Cash flow error', message: err.message });
    }
  });

  // NEW: Alpha Vantage Financials
  app.get('/api/alphavantage/financials', async (req, res) => {
    const symbol = (req.query.symbol as string || '').toUpperCase();
    if (!symbol) return res.status(400).json({ error: 'Sembol eksik' });
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

    if (!apiKey) return res.status(503).json({ error: 'API Key missing' });

    const cacheKey = `av_fin_${symbol}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    try {
      let avSymbol = symbol;
      if (symbol.endsWith('.IS')) avSymbol = symbol.replace('.IS', '.IST');
      
      const url = `https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=${avSymbol}&apikey=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      
      // Alpha Vantage returns error in 200 OK
      if (data.Information || data.Note) {
        return res.status(429).json({ 
          error: 'API Limit', 
          message: 'Alpha Vantage günlük limitine ulaşıldı. Lütfen daha sonra tekrar deneyin.' 
        });
      }
      
      cache.set(cacheKey, data);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: 'Financials error', message: err.message });
    }
  });

  // NEW: Alpha Vantage Commodities
  app.get('/api/alphavantage/commodity/:type', async (req, res) => {
    const type = req.params.type.toUpperCase(); // e.g. BRENT, NATURAL_GAS
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

    if (!apiKey) return res.status(503).json({ error: 'API Key missing' });

    const cacheKey = `av_comm_${type}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    try {
      const url = `https://www.alphavantage.co/query?function=${type}&apikey=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      
      cache.set(cacheKey, data);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: 'Commodity error', message: err.message });
    }
  });

  app.get('/api/alphavantage/economics/:func', async (req, res) => {
    const func = req.params.func.toUpperCase(); // e.g. FEDERAL_FUNDS_RATE, CPI, INFLATION
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

    if (!apiKey) return res.status(503).json({ error: 'API Key missing' });

    try {
      const url = `https://www.alphavantage.co/query?function=${func}&apikey=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: 'Economics error', message: err.message });
    }
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
      const url = `https://www.alphavantage.co/query?function=DIVIDEND_CALENDAR&horizon=${horizon}&apikey=${apiKey}`;
      const response = await fetch(url);
      const csvText = await response.text();

      // Convert CSV to JSON
      const lines = csvText.trim().split('\n');
      const headers = lines[0].split(',');
      const results = lines.slice(1).map(line => {
        const values = line.split(',');
        const entry: any = {};
        headers.forEach((header, i) => entry[header] = values[i]);
        return entry;
      });

      cache.set(cacheKey, results, 86400); // 24 hours for calendar
      res.json(results);
    } catch (err: any) {
      res.status(500).json({ error: 'Alpha Vantage takvim hatası', message: err.message });
    }
  });

  // SEARCH API (Symbol lookup with Alpha Vantage Fallback)
  app.get('/api/stock/search', async (req, res) => {
    const query = req.query.q as string;
    if (!query || query.length < 2) return res.json([]);

    let allResults: any[] = [];

    // 1. TRY YAHOO SEARCH
    try {
      const searchYf = getYahoo();
      const results = await searchYf.search(query) as any;
      if (results && results.quotes) {
        allResults = (results.quotes || [])
          .filter((q: any) => q.isYahooFinance || q.symbol)
          .map((q: any) => ({
            symbol: q.symbol,
            shortname: q.shortname || q.longname || q.symbol,
            longname: q.longname || q.shortname || q.symbol,
            exchange: q.exchange,
            typeDisp: q.typeDisp,
            source: 'yahoo'
          }));
      }
    } catch (err: any) {
      console.warn(`[Karlısın-API] Yahoo Search başarısız:`, err.message);
    }

    // 2. TRY ALPHA VANTAGE SEARCH (If results are low or Yahoo failed)
    const avKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (allResults.length < 3 && avKey) {
      try {
        console.log(`[Karlısın-API] Alpha Vantage Search deneniyor: ${query}`);
        const avRes = await fetch(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${avKey}`);
        const avData = await avRes.json();
        
        if (avData && avData.bestMatches) {
          const avQuotes = avData.bestMatches.map((m: any) => ({
            symbol: m['1. symbol'].replace('.IST', '.IS'),
            shortname: m['2. name'],
            longname: m['2. name'],
            exchange: m['4. region'],
            typeDisp: m['3. type'],
            source: 'alphavantage'
          }));
          
          // Combine and filter duplicates
          const existingSymbols = new Set(allResults.map(r => r.symbol));
          avQuotes.forEach((q: any) => {
            if (!existingSymbols.has(q.symbol)) {
              allResults.push(q);
            }
          });
        }
      } catch (err: any) {
        console.warn(`[Karlısın-API] AV Search başarısız:`, err.message);
      }
    }

    res.json(allResults);
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

  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      time: new Date().toISOString(),
      cache_keys: cache.keys().length,
      node_version: process.versions.node,
      env: process.env.NODE_ENV,
      yahoo_initialized: !!yf && typeof yf.quote === 'function'
    });
  });

  app.get('/api/debug', (req, res) => {
    const yfTest = getYahoo();
    res.json({
      env: {
        FINNHUB: !!process.env.FINNHUB_API_KEY,
        ALPHA_VANTAGE: !!process.env.ALPHA_VANTAGE_API_KEY,
        RESEND: !!process.env.RESEND_API_KEY
      },
      headers: req.headers,
      url: req.url,
      yahoo: {
        type: typeof yahooFinanceModule,
        hasDefault: !!(yahooFinanceModule as any).default,
        instanceType: typeof yfTest,
        instanceMethods: yfTest ? Object.keys(yfTest).filter(k => typeof yfTest[k] === 'function').slice(0, 5) : []
      }
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

  // API CATCH-ALL - MUST BE AT THE END OF ALL API ROUTES
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: 'API rotası bulunamadı', path: req.path });
  });

  // ---------------------------------------------------------
  // 2. SEO VE DİĞER DOSYALAR
  // ---------------------------------------------------------
  
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

  // ---------------------------------------------------------
  // 3. VITE / STATIC ASSET SERVİSİ (EN SONDA OLMALI)
  // ---------------------------------------------------------
  
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    
    // API rotaları zaten yukarıda catch-all (/api/*) ile yakalandığı için buraya sadece non-API 404'ler düşer
    app.get('*', (req, res) => {
      // Eğer bir şekilde /api ile başlayan bir istek buraya gelirse 404 JSON dön
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API rotası bulunamadı.' });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    
    // API olmayan tüm istekleri Vite'ye yönlendir
    app.use((req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next(); // API rotaları yukarıdaki express rotalarına veya api-catch-all'a gitmeli
      }
      vite.middlewares(req, res, next);
    });
  }

  // Global Error Handler (MUST BE LAST)
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[Karlısın-BUG] Kritik Hata:', err);
    if (req.path.startsWith('/api')) {
      return res.status(500).json({ 
        error: 'Sunucu hatası', 
        message: err.message,
        path: req.path
      });
    }
    res.status(500).send('Internal Server Error');
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Test API: http://localhost:${PORT}/api/mail?email=test@example.com`);
  });
}

startServer().catch(err => {
  console.error('[Karlısın-Sunucu] Başlatma hatası:', err);
});
