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

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1'
];

function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * UNIFIED DATA SERVICE v2.1
 * Cross-verifies data from multiple sources with 12h caching
 */
class UnifiedDataService {
  private static async fetchInvesting(symbol: string) {
    try {
      // Investing.com is sensitive to headers. We try a lookup approach.
      // For BIST: symbol is typically EREGL.IS
      const clean = symbol.replace('.IS', '').toLowerCase();
      const url = `https://www.investing.com/search/?q=${encodeURIComponent(symbol)}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      const html = await response.text();
      
      // Look for data points in search result or redirect
      const priceMatch = html.match(/id="last_last"[^>]*>([\d,.]+)</) || html.match(/"last":([\d,.]+)/);
      const yieldMatch = html.match(/>Div Yield<[\s\S]*?>([\d,.]+)%/);
      const targetMatch = html.match(/>1y Target Est<[\s\S]*?>([\d,.]+)</) || html.match(/"target":([\d,.]+)/);
      
      // Range and Volume for Investing
      const rangeMatch = html.match(/>Day's Range<[\s\S]*?>([\d,.]+)\s*-\s*([\d,.]+)</);
      const volumeMatch = html.match(/>Volume<[\s\S]*?>([\d,.]+)</);

      if (priceMatch) {
         return {
           price: parseFloat(priceMatch[1].replace(',', '')),
           dividendYield: yieldMatch ? parseFloat(yieldMatch[1].replace(',', '.')) / 100 : 0,
           targetMeanPrice: targetMatch ? parseFloat(targetMatch[1].replace(',', '')) : 0,
           dayHigh: rangeMatch ? parseFloat(rangeMatch[2].replace(',', '')) : 0,
           dayLow: rangeMatch ? parseFloat(rangeMatch[1].replace(',', '')) : 0,
           volume: volumeMatch ? parseFloat(volumeMatch[1].replace(/[^\d.]/g, '')) : 0,
           source: 'Investing'
         };
      }
      
      return null;
    } catch (e) {
      return null;
    }
  }

  static async getFullStockData(symbol: string) {
    const cleanSymbol = symbol.toUpperCase().trim();
    const cacheKey = `unified_v2.2_${cleanSymbol}`;
    
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log(`[UnifiedDS v2.2] Cache hit: ${cleanSymbol}`);
      return cached;
    }

    console.log(`[UnifiedDS v2.2] Starting heavy aggregation for: ${cleanSymbol}`);
    
    // Providers to run in parallel
    const [yahoo, google, av, investing] = await Promise.allSettled([
      this.fetchYahoo(cleanSymbol),
      this.fetchGoogle(cleanSymbol),
      this.fetchAlphaVantage(cleanSymbol),
      this.fetchInvesting(cleanSymbol)
    ]);

    const results: any = {
      yahoo: yahoo.status === 'fulfilled' ? yahoo.value : null,
      google: google.status === 'fulfilled' ? google.value : null,
      av: av.status === 'fulfilled' ? av.value : null,
      investing: investing.status === 'fulfilled' ? investing.value : null
    };

    // CROSS-VERIFICATION & AUGMENTATION LOGIC
    // Hybrid approach: Prefer Yahoo for complex metrics, Google for live price, AlphaV for fallback
    const aggregated = {
      symbol: cleanSymbol,
      version: '2.6.0',
      source: 'Unified Engine v2.6 (Discovery + Fallback)',
      timestamp: new Date().toISOString(),
      summary: {
        price: {
          regularMarketPrice: (cleanSymbol.endsWith('.IS') ? (results.yahoo?.price || results.google?.price) : (results.google?.price || results.yahoo?.price)) || results.investing?.price || results.av?.price || 0,
          longName: results.yahoo?.name || results.google?.name || results.investing?.name || results.av?.name || cleanSymbol,
          currency: results.yahoo?.currency || results.google?.currency || results.investing?.currency || results.av?.currency || 'TRY',
          regularMarketChangePercent: results.yahoo?.changePercent || results.google?.changePercent || 0,
          dayHigh: results.yahoo?.dayHigh || results.google?.dayHigh || results.investing?.dayHigh || 0,
          dayLow: results.yahoo?.dayLow || results.google?.dayLow || results.investing?.dayLow || 0,
          volume: results.yahoo?.volume || results.google?.volume || results.investing?.volume || results.av?.volume || 0
        },
        summaryDetail: {
          dividendYield: results.yahoo?.dividendYield || results.investing?.dividendYield || results.av?.dividendYield || results.google?.dividendYield || 0,
          dividendRate: results.yahoo?.dividendRate || results.investing?.dividendRate || results.av?.dividendRate || results.google?.dividendRate || 0,
          forwardDividendRate: results.yahoo?.forwardDividendRate || results.av?.dividendRate || results.google?.dividendRate || 0,
          forwardDividendYield: results.yahoo?.forwardDividendYield || results.av?.dividendYield || results.google?.dividendYield || 0,
          payoutRatio: results.yahoo?.payoutRatio || results.av?.payoutRatio || results.investing?.payoutRatio || 0,
          marketCap: results.yahoo?.marketCap || results.av?.marketCap || results.google?.marketCap || results.investing?.marketCap || 0,
          trailingPE: results.yahoo?.pe || results.av?.pe || results.investing?.pe || 0,
          fiftyTwoWeekHigh: results.yahoo?.high52 || results.av?.high52 || results.investing?.high52 || 0,
          fiftyTwoWeekLow: results.yahoo?.low52 || results.av?.low52 || results.investing?.low52 || 0,
          industry: results.yahoo?.industry || results.google?.industry || results.av?.industry || results.investing?.industry || null,
          sector: results.yahoo?.sector || results.google?.sector || results.av?.sector || results.investing?.sector || null
        },
        assetProfile: {
          longBusinessSummary: results.yahoo?.longBusinessSummary || results.av?.Description || null,
          website: results.yahoo?.website || results.av?.Website || null
        },
        financialData: {
          recommendationKey: results.yahoo?.recommendationKey || null,
          targetMeanPrice: results.yahoo?.targetMeanPrice || results.google?.targetMeanPrice || results.investing?.targetMeanPrice || results.av?.targetMeanPrice || 0,
          numberOfAnalystOpinions: results.yahoo?.numberOfAnalystOpinions || 0,
          isTechnicalTarget: false
        }
      },
      history: results.yahoo?.history || [],
      verification: {
        sources_count: Object.values(results).filter(v => !!v).length,
        google_verified: !!results.google,
        yahoo_verified: !!results.yahoo,
        alpha_vantage_verified: !!results.av,
        investing_verified: !!results.investing,
        last_sync: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }
    };

    // --- FALLBACK CALCULATION ENGINE ---
    const prc = aggregated.summary.price.regularMarketPrice;
    const sd = aggregated.summary.summaryDetail;

    // 0. Target Price Fallback: If 0, use 52w High as a technical target
    if (aggregated.summary.financialData.targetMeanPrice === 0 && sd.fiftyTwoWeekHigh > 0) {
      aggregated.summary.financialData.targetMeanPrice = sd.fiftyTwoWeekHigh;
      aggregated.summary.financialData.isTechnicalTarget = true;
    }

    // 1. Calculate from History: If rate/yield is 0, sum dividends from last 12 months
    if (sd.dividendRate === 0 && aggregated.history && aggregated.history.length > 0) {
      const oneYearAgo = (Date.now() / 1000) - (365 * 24 * 60 * 60);
      const recentDividends = aggregated.history
        .filter(h => h.date >= oneYearAgo)
        .reduce((sum, h) => sum + (h.amount || h.adjClose || 0), 0); 
      
      // If we found dividends in history but not in summary
      if (recentDividends > 0) {
        sd.dividendRate = recentDividends;
        console.log(`[UnifiedDS] Extracted ${recentDividends} from history for ${cleanSymbol}`);
      }
    }

    // 2. Cross-Calculate Yield + Price -> Rate
    if (sd.dividendRate === 0 && sd.dividendYield > 0 && prc > 0) {
      sd.dividendRate = sd.dividendYield * prc;
    }
    
    // 3. Forward Yield + Price -> Forward Rate
    if (sd.forwardDividendRate === 0 && sd.forwardDividendYield > 0 && prc > 0) {
      sd.forwardDividendRate = sd.forwardDividendYield * prc;
    }

    // 4. Projection: If Forward Rate is 0, use Trailing Rate
    if (sd.forwardDividendRate === 0 && sd.dividendRate > 0) {
      sd.forwardDividendRate = sd.dividendRate;
    }

    // 5. Final Yield Recalculation: If we have Rate but Yield is still 0
    if (sd.forwardDividendYield === 0 && sd.forwardDividendRate > 0 && prc > 0) {
      sd.forwardDividendYield = sd.forwardDividendRate / prc;
    }
    
    if (sd.dividendYield === 0 && sd.dividendRate > 0 && prc > 0) {
      sd.dividendYield = sd.dividendRate / prc;
    }

    // 6. Payout Ratio Fallback: Often missing for BIST stocks
    if ((sd.payoutRatio === 0 || !sd.payoutRatio) && (sd.dividendRate > 0 || sd.forwardDividendRate > 0)) {
       const eps = results.yahoo?.eps || results.av?.eps || 0;
       const rate = sd.forwardDividendRate || sd.dividendRate;
       if (eps > 0 && rate > 0) {
         sd.payoutRatio = rate / eps;
         console.log(`[UnifiedDS] Calculated Payout Ratio ${sd.payoutRatio} (Rate: ${rate} / EPS: ${eps}) for ${cleanSymbol}`);
       }
    }
    // ------------------------------------

    // Cache for 12 hours (43200s)
    cache.set(cacheKey, aggregated, 43200);
    return aggregated;
  }

  private static async fetchYahoo(symbol: string) {
    const yf = getYahoo();
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
          if (chart?.events?.dividends) {
            history = Object.values(JSON.parse(JSON.stringify(chart.events.dividends)));
          }
        } catch (e) {}

        const summary = await yf.quoteSummary(t, { modules: ['summaryDetail', 'assetProfile', 'defaultKeyStatistics', 'financialData'] }).catch(() => null);

        // Debug log for data discovery
        if (summary) {
           console.log(`[Discovery] ${t} - Yield: ${summary.summaryDetail?.dividendYield?.value}, Rate: ${summary.summaryDetail?.dividendRate?.value}, Payout: ${summary.summaryDetail?.payoutRatio?.value}`);
        }

        return {
          price: quote.regularMarketPrice,
          name: quote.longName || quote.shortName,
          currency: quote.currency,
          changePercent: quote.regularMarketChangePercent,
          dividendYield: quote.trailingAnnualDividendYield || quote.dividendYield || summary?.summaryDetail?.dividendYield?.value || summary?.defaultKeyStatistics?.yield?.value || summary?.defaultKeyStatistics?.lastDividendYield?.value || 0,
          dividendRate: quote.trailingAnnualDividendRate || quote.dividendRate || summary?.summaryDetail?.dividendRate?.value || summary?.defaultKeyStatistics?.lastDividendValue?.value || 0,
          forwardDividendRate: summary?.summaryDetail?.forwardDividendRate?.value || quote.dividendRate || summary?.defaultKeyStatistics?.lastDividendValue?.value || 0,
          forwardDividendYield: summary?.summaryDetail?.forwardDividendYield?.value || quote.dividendYield || 0,
          payoutRatio: summary?.summaryDetail?.payoutRatio?.value || summary?.defaultKeyStatistics?.payoutRatio?.value || quote.payoutRatio || 0,
          eps: summary?.defaultKeyStatistics?.trailingEps?.value || summary?.financialData?.earningsPerShare?.value || 0,
          marketCap: quote.marketCap,
          pe: quote.trailingPE || summary?.summaryDetail?.trailingPE?.value || 0,
          high52: quote.fiftyTwoWeekHigh || summary?.summaryDetail?.fiftyTwoWeekHigh?.value || 0,
          low52: quote.fiftyTwoWeekLow || summary?.summaryDetail?.fiftyTwoWeekLow?.value || 0,
          dayHigh: quote.regularMarketDayHigh || 0,
          dayLow: quote.regularMarketDayLow || 0,
          volume: quote.regularMarketVolume || 0,
          recommendationKey: summary?.financialData?.recommendationKey,
          targetMeanPrice: summary?.financialData?.targetMeanPrice?.value || 0,
          numberOfAnalystOpinions: summary?.financialData?.numberOfAnalystOpinions?.value || 0,
          industry: summary?.assetProfile?.industry,
          sector: summary?.assetProfile?.sector,
          longBusinessSummary: summary?.assetProfile?.longBusinessSummary,
          website: summary?.assetProfile?.website,
          history
        };
      } catch (e) {}
    }
    return null;
  }

  private static async fetchGoogle(symbol: string) {
    const tickers = [symbol];
    if (!symbol.includes('.')) tickers.unshift(`IST:${symbol}`);
    else if (symbol.endsWith('.IS')) tickers.unshift(`IST:${symbol.split('.')[0]}`);

    for (const gt of tickers) {
      try {
        const res = await fetch(`https://www.google.com/finance/quote/${gt}`, {
          headers: { 'User-Agent': getRandomUserAgent() }
        });
        if (!res.ok) continue;
        const html = await res.text();
        
        const priceMatch = html.match(/data-last-price="([^"]+)"/);
        const currencyMatch = html.match(/data-currency-code="([^"]+)"/);
        const nameMatch = html.match(/<div class="zzDe9c">([^<]+)<\/div>/);

        if (priceMatch) {
          // Attempt to extract extra metadata (Supports Turkish & English)
          let dividendYield = 0;
          let sector = null;
          let industry = null;

          // Google Finance labels in Turkish ("Kâr payı verimi") or English ("Dividend yield")
          const yieldMatch = html.match(/>(?:Temettü verimi|Kâr payı verimi|Dividend yield)<[\s\S]*?<div[^>]*>([\d,.]+)%/i);
          if (yieldMatch) {
            dividendYield = parseFloat(yieldMatch[1].replace(',', '.')) / 100;
          }

          // Try to get hard Dividend Rate (Kâr payı) from Google Finance if available
          let dividendRate = 0;
          const rateMatch = html.match(/>(?:Kâr payı|Dividend|Hisse Başı Temettü)<[\s\S]*?<div[^>]*>([\d,.]+)</i);
          if (rateMatch) {
            dividendRate = parseFloat(rateMatch[1].replace(/[^\d.,]/g, '').replace(',', '.'));
          }

          const sectorMatch = html.match(/>(?:Sektör|Sector)<[\s\S]*?<div[^>]*>([^<]+)</i);
          if (sectorMatch) sector = sectorMatch[1].trim();

          const industryMatch = html.match(/>(?:Endüstri|Industry)<[\s\S]*?<div[^>]*>([^<]+)</i);
          if (industryMatch) industry = industryMatch[1].trim();
          
          const rangeMatch = html.match(/>(?:Günlük aralık|Day range)<[\s\S]*?<div[^>]*>([\d,.]+)\s*-\s*([\d,.]+)</i);
          let dayLow = 0;
          let dayHigh = 0;
          if (rangeMatch) {
             dayLow = parseFloat(rangeMatch[1].replace(/[^\d.,]/g, '').replace(',', '.'));
             dayHigh = parseFloat(rangeMatch[2].replace(/[^\d.,]/g, '').replace(',', '.'));
          }

          const volumeReg = html.match(/>(?:Hacim|Volume)<[\s\S]*?<div[^>]*>([\d,.\w]+)</i);
          let volume = 0;
          if (volumeReg) {
             const cleanVol = volumeReg[1].trim().toUpperCase();
             if (cleanVol.endsWith('M')) volume = parseFloat(cleanVol) * 1000000;
             else if (cleanVol.endsWith('B')) volume = parseFloat(cleanVol) * 1000000000;
             else if (cleanVol.endsWith('K')) volume = parseFloat(cleanVol) * 1000;
             else volume = parseFloat(cleanVol.replace(/[^\d.,]/g, '').replace(',', '.'));
          }

          const targetMatch = html.match(/>(?:Fiyat Hedefi|Price Target)<[\s\S]*?<div[^>]*>([\d,.]+)</i);
          let targetMeanPrice = 0;
          if (targetMatch) {
            targetMeanPrice = parseFloat(targetMatch[1].replace(/[^\d.,]/g, '').replace(',', '.'));
          }

          return {
            price: parseFloat(priceMatch[1].replace(/[^\d.,]/g, '').replace(',', '.')),
            currency: currencyMatch ? currencyMatch[1] : 'TRY',
            name: nameMatch ? nameMatch[1] : symbol,
            dividendYield,
            dividendRate,
            targetMeanPrice,
            dayHigh,
            dayLow,
            volume,
            sector,
            industry,
            source: 'Google'
          };
        }
      } catch (e) {}
    }
    return null;
  }

  private static async fetchAlphaVantage(symbol: string) {
    const key = process.env.ALPHA_VANTAGE_API_KEY;
    if (!key || key === 'YOUR_AV_KEY') return null;
    
    const avt = symbol.includes('.') ? symbol.replace('.IS', '.IST') : `${symbol}.IST`;
    try {
      const res = await fetch(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${avt}&apikey=${key}`);
      const data = await res.json();
      if (data && data.Symbol) {
        return {
          name: data.Name,
          dividendYield: parseFloat(data.DividendYield) || 0,
          dividendRate: parseFloat(data.DividendPerShare) || 0,
          payoutRatio: parseFloat(data.PayoutRatio) || 0,
          eps: parseFloat(data.EPS) || 0,
          marketCap: parseFloat(data.MarketCapitalization) || 0,
          targetMeanPrice: parseFloat(data.AnalystTargetPrice) || 0,
          volume: parseFloat(data.Volume) || 0,
          pe: parseFloat(data.PERatio) || 0,
          industry: data.Industry,
          sector: data.Sector,
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

  // Debug Version API
  app.get('/api/version', (req, res) => {
    res.json({ version: '2.2.0', mode: process.env.NODE_ENV, timestamp: new Date().toISOString() });
  });

  // DIVIDEND API (Unified Engine: Yahoo + Google + Alpha Vantage)
  app.get('/api/dividends', async (req, res) => {
    const symbol = (req.query.symbol as string || '').toUpperCase().trim();
    const forceRefresh = req.query.refresh === 'true';

    if (!symbol) return res.status(400).json({ error: 'Sembol eksik' });

    // Cache bypass for forced refresh
    if (forceRefresh) {
      console.log(`[UnifiedDS] Force refreshing: ${symbol}`);
      cache.del(`unified_v2.2_${symbol}`);
    }

    try {
      const data = await UnifiedDataService.getFullStockData(symbol);
      
      // Ensure we always return a fresh-looking response
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
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
    const distPath = path.resolve(__dirname, 'dist');
    console.log(`[Karlısın-INIT] Versiyon: 2.2.1-stable`);
    console.log(`[Karlısın-INIT] Production modu aktif.`);
    console.log(`[Karlısın-INIT] Statik dosya yolu: ${distPath}`);
    
    // Serve static files first
    app.use(express.static(distPath, { index: false }));
    
    app.get('*', (req, res) => {
      // API rotalarını atla - Eğer buraya geldiyse rewrite kuralı çalışmıyor demektir
      if (req.path.startsWith('/api')) {
        console.warn(`[Karlısın-FATAL] API isteği statik catch-all'a düştü! Rewrite ayarlarını kontrol edin: ${req.path}`);
        return res.status(404).json({ 
          error: 'API Endpoint Not Found on Server', 
          message: 'Bu hata Firebase Hosting rewrite kurallarının yanlış yapılandırıldığını gösterir.',
          path: req.path 
        });
      }

      const indexPath = path.join(distPath, 'index.html');
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error(`[Karlısın-ERROR] index.html gönderilemedi:`, err);
          res.status(500).send('Sunucu hatası: Frontend derlemesi bulunamadı.');
        }
      });
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
