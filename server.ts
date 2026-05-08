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
      const clean = symbol.replace('.IS', '').toLowerCase();
      const upper = clean.toUpperCase();
      
      const commonBistSlugs: Record<string, string> = {
        'KCHOL': 'koc-holding',
        'THYAO': 'turkish-airlines',
        'ASELS': 'aselsan',
        'EREGL': 'eregli-demir-celik',
        'TUPRS': 'tupras',
        'SAHOL': 'sabanci-holding',
        'SISE': 'sise-cam',
        'GARAN': 'turkiye-garanti-bankasi',
        'AKBNK': 'akbank',
        'ISCTR': 'is-bankasi-c',
        'FROTO': 'ford-otosan',
        'TOASO': 'tofas-turk-otomobil-fabrikasi',
        'PETKM': 'petkim',
        'ARCLK': 'arcelik-as',
        'DOAS': 'dogus-otomotiv',
        'BIMAS': 'bim-birlesik-magazalar',
        'PGSUS': 'pegasus-hava-tasimaciligi'
      };

      const slug = commonBistSlugs[upper] || clean;

      const urls = [
        `https://tr.investing.com/equities/${slug}-dividends`,
        `https://tr.investing.com/equities/${slug}`,
        `https://www.investing.com/equities/${slug}-dividends`,
        `https://www.investing.com/equities/${slug}`,
        `https://www.investing.com/search/?q=${encodeURIComponent(symbol)}`
      ];
      
      for (const url of urls) {
        try {
          const response = await fetch(url, {
            headers: {
              'User-Agent': getRandomUserAgent(),
              'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
              'Referer': 'https://www.google.com/',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          
          if (!response.ok) continue;
          const html = await response.text();
          
          const priceMatch = 
            html.match(/id="last_last"[^>]*>([\d,.]+)</) || 
            html.match(/"last":([\d,.]+)/) || 
            html.match(/data-test="instrument-price-last"[^>]*>([\d,.]+)</) ||
            html.match(/class="instrument-price_last[^>]*>([\d,.]+)</) ||
            html.match(/last_last">([\d,.]+)</) ||
            html.match(/data-realtime-value="([^"]+)"/) ||
            html.match(/class="text-2xl[^>]*>([\d,.]+)</) ||
            html.match(/class="[^"]*price[^"]*"[^>]*>([\d,.]+)</i);

          const yieldMatch = 
            html.match(/>Div Yield<[\s\S]*?>([\d,.]+)%/) || 
            html.match(/"yield":([\d,.]+)/) ||
            html.match(/>Temettü Verimi<[\s\S]*?>([\d,.]+)%/) ||
            html.match(/dividend_yield">([\d,.]+)%/) ||
            html.match(/id="pair-details-yield">([\d,.]+)%/) ||
            html.match(/data-test="dividend-yield-value">([\d,.]+)%/);

          const nameMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i) || html.match(/"name":"([^"]+)"/);

          if (priceMatch) {
             const rawPrice = priceMatch[1];
             // Ultra-resilient float parser for tr-TR (1.234,56 or 213,40)
             let price = 0;
             const cleanPrice = rawPrice.replace(/\s/g, '');
             if (cleanPrice.includes(',') && cleanPrice.includes('.')) {
               price = parseFloat(cleanPrice.replace(/\./g, '').replace(',', '.'));
             } else if (cleanPrice.includes(',')) {
               price = parseFloat(cleanPrice.replace(',', '.'));
             } else {
               price = parseFloat(cleanPrice);
             }

             if (isNaN(price) || price === 0) continue;

             const divYield = yieldMatch ? parseFloat(yieldMatch[1].toString().replace(',', '.')) / 100 : 0;
             
             // Additional Fields - Scraped with extreme flexibility for TR locale
             const targetMatch = html.match(/>1y Target Est<[\s\S]*?>([\d,.]+)</) || html.match(/"target":([\d,.]+)/) || html.match(/>1 Yıllık Hedef Fiyat<[\s\S]*?>([\d,.]+)</);
             
             const rangeMatch = 
               html.match(/>Day's Range<[\s\S]*?class="[^"]*inline-block[^"]*"[^>]*>([\d,.]+)\s*-\s*([\d,.]+)</) ||
               html.match(/>Günlük Aralık<[\s\S]*?class="[^"]*inline-block[^"]*"[^>]*>([\d,.]+)\s*-\s*([\d,.]+)</) ||
               html.match(/>Day's Range<[\s\S]*?>([\d,.]+)\s*-\s*([\d,.]+)</) || 
               html.match(/>Günlük Aralık<[\s\S]*?>([\d,.]+)\s*-\s*([\d,.]+)</) ||
               html.match(/>Gün İçi Aralık<[\s\S]*?>([\d,.]+)\s*-\s*([\d,.]+)</) ||
               html.match(/"range":"([\d,.]+)\s*-\s*([\d,.]+)"/) ||
               html.match(/"low":([\d,.]+),"high":([\d,.]+)/);

             const volumeMatch = 
               html.match(/>Volume<[\s\S]*?>([\d,.]+)</) || 
               html.match(/>Hacim<[\s\S]*?>([\d,.]+)</) ||
               html.match(/id="pair-details-volume">([\d,.]+)</) ||
               html.match(/"volume":([\d,.]+)/) ||
               html.match(/data-test="volume-value">([\d,.]+)</) ||
               html.match(/"volume":\s*(\d+)/);

             const sectorMatch = html.match(/"industry":"([^"]+)"/) || html.match(/>Industry<[\s\S]*?>([^<]+)</i) || html.match(/>Endüstri<[\s\S]*?>([^<]+)</i);
             const marketCapMatch = html.match(/>Market Cap<[\s\S]*?>([^<]+)</i) || html.match(/>Piyasa Değeri<[\s\S]*?>([^<]+)</i);

             console.log(`[Investing] Success for ${symbol} @ ${price} via ${url}`);
             return {
               price,
               name: nameMatch ? nameMatch[1].trim() : symbol,
               dividendYield: divYield,
               targetMeanPrice: targetMatch ? parseFloat(targetMatch[1].toString().replace(/\./g, '').replace(',', '.')) : 0,
               dayHigh: rangeMatch ? parseFloat(rangeMatch[2].replace(/\./g, '').replace(',', '.')) : 0,
               dayLow: rangeMatch ? parseFloat(rangeMatch[1].replace(/\./g, '').replace(',', '.')) : 0,
               volume: volumeMatch ? parseFloat(volumeMatch[1].replace(/[^\d.]/g, '')) : 0,
               sector: sectorMatch ? sectorMatch[1].trim() : null,
               marketCap: marketCapMatch ? this.parsePrice(marketCapMatch[1]) : 0,
               source: 'Investing'
             };
          }
        } catch (inner) {}
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  private static parsePrice(raw: string): number {
    if (!raw) return 0;
    // Handle Turkish locale price formatting (thousands dot, decimal comma)
    let clean = raw.trim().replace(/\s/g, '');
    if (clean.includes('.') && clean.includes(',')) {
       clean = clean.replace(/\./g, '').replace(',', '.');
    } else if (clean.includes(',')) {
       clean = clean.replace(',', '.');
    }
    return parseFloat(clean) || 0;
  }

  private static async fetchFinnhub(symbol: string) {
    const key = process.env.FINNHUB_API_KEY;
    if (!key || key === 'YOUR_FINNHUB_KEY') return null;

    try {
      // BIST symbols on Finnhub usually look like KCHOL.IS
      const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${key}`);
      const data = await res.json();
      
      if (data && data.c > 0) {
        console.log(`[Finnhub] Success for ${symbol} @ ${data.c}`);
        return {
          price: data.c,
          dayHigh: data.h,
          dayLow: data.l,
          changePercent: data.dp,
          source: 'Finnhub'
        };
      }
    } catch (e) {
      console.warn(`[Finnhub] Error for ${symbol}:`, e);
    }
    return null;
  }

  static async getFullStockData(symbol: string, forceRefresh = false) {
    const cleanSymbol = symbol.toUpperCase().trim();
    const cacheKey = `unified_v3.1.0_${cleanSymbol}`;
    
    const cached = cache.get(cacheKey) as any;
    if (cached && !forceRefresh) {
      if (cached.summary?.price?.regularMarketPrice > 0) {
        return cached;
      }
    }

    console.log(`[UnifiedDS v3.1.0] Aggregating multi-source for: ${cleanSymbol}`);
    
    // Providers to run in parallel
    const [yahoo, google, av, investing, finnhub] = await Promise.allSettled([
      this.fetchYahoo(cleanSymbol),
      this.fetchGoogle(cleanSymbol),
      this.fetchAlphaVantage(cleanSymbol),
      this.fetchInvesting(cleanSymbol),
      this.fetchFinnhub(cleanSymbol)
    ]);

    const results: any = {
      yahoo: yahoo.status === 'fulfilled' ? yahoo.value : null,
      google: google.status === 'fulfilled' ? google.value : null,
      av: av.status === 'fulfilled' ? av.value : null,
      investing: investing.status === 'fulfilled' ? investing.value : null,
      finnhub: finnhub.status === 'fulfilled' ? finnhub.value : null
    };

    // Detailed Debugging for sources
    console.log(`[UnifiedDS v2.8] ${cleanSymbol} Status:`, {
      yahoo: !!results.yahoo,
      google: !!results.google,
      av: !!results.av,
      investing: !!results.investing,
      finnhub: !!results.finnhub
    });

    const getValidPrice = () => {
      if (results.google?.price && results.google.price > 0) return results.google.price;
      if (results.yahoo?.price && results.yahoo.price > 0) return results.yahoo.price;
      if (results.finnhub?.price && results.finnhub.price > 0) return results.finnhub.price;
      if (results.investing?.price && results.investing.price > 0) return results.investing.price;
      if (results.av?.price && results.av.price > 0) return results.av.price;
      return 0;
    };

    const price = getValidPrice();
    if (price === 0) {
      console.error(`[UnifiedDS] CRITICAL: All 5 fetchers failed for ${cleanSymbol}.`);
    }

    // CROSS-VERIFICATION & AUGMENTATION LOGIC
    const aggregated = {
      symbol: cleanSymbol,
      version: '3.1.0',
      source: 'Unified Engine v3.1 (ZIRHLI PROD-MAX)',
      timestamp: new Date().toISOString(),
      summary: {
        price: {
          regularMarketPrice: price,
          longName: results.google?.name || results.yahoo?.name || results.investing?.name || results.av?.name || cleanSymbol,
          currency: results.google?.currency || results.yahoo?.currency || results.investing?.currency || results.av?.currency || 'TRY',
          regularMarketChangePercent: results.google?.changePercent !== undefined ? results.google?.changePercent : (results.finnhub?.changePercent || results.yahoo?.changePercent || 0),
          dayHigh: [results.google?.dayHigh, results.yahoo?.dayHigh, results.finnhub?.dayHigh, results.investing?.dayHigh].find(v => v && v > 0) || 0,
          dayLow: [results.google?.dayLow, results.yahoo?.dayLow, results.finnhub?.dayLow, results.investing?.dayLow].find(v => v && v > 0) || 0,
          volume: [results.google?.volume, results.yahoo?.volume, results.investing?.volume, results.av?.volume].find(v => v && v > 0) || 0
        },
        summaryDetail: {
          dividendYield: [results.yahoo?.dividendYield, results.investing?.dividendYield, results.av?.dividendYield, results.google?.dividendYield].find(v => v && v > 0) || 0,
          dividendRate: [results.yahoo?.dividendRate, results.investing?.dividendRate, results.av?.dividendRate, results.google?.dividendRate].find(v => v && v > 0) || 0,
          forwardDividendRate: [results.yahoo?.forwardDividendRate, results.av?.dividendRate, results.google?.dividendRate].find(v => v && v > 0) || 0,
          forwardDividendYield: [results.yahoo?.forwardDividendYield, results.av?.dividendYield, results.google?.dividendYield].find(v => v && v > 0) || 0,
          payoutRatio: [results.yahoo?.payoutRatio, results.av?.payoutRatio, results.investing?.payoutRatio].find(v => v && (v > 0 || v < 0)) || 0,
          marketCap: [results.yahoo?.marketCap, results.av?.marketCap, results.google?.marketCap, results.investing?.marketCap].find(v => v && v > 0) || 0,
          trailingPE: [results.yahoo?.pe, results.av?.pe, results.investing?.pe, results.google?.pe].find(v => v && v > 0) || 0,
          fiftyTwoWeekHigh: [results.yahoo?.high52, results.google?.high52, results.av?.high52, results.investing?.high52].find(v => v && v > 0) || 0,
          fiftyTwoWeekLow: [results.yahoo?.low52, results.google?.low52, results.av?.low52, results.investing?.low52].find(v => v && v > 0) || 0,
          industry: results.yahoo?.industry || results.google?.industry || results.av?.industry || results.investing?.industry || null,
          sector: results.yahoo?.sector || results.google?.sector || results.av?.sector || results.investing?.sector || null
        },
        assetProfile: {
          longBusinessSummary: results.yahoo?.longBusinessSummary || results.google?.summary || results.av?.Description || null,
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
        finnhub_verified: !!results.finnhub,
        last_sync: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) || new Date().toISOString().split('T')[1].split('.')[0]
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
        .filter((h: any) => h.date >= oneYearAgo)
        .reduce((sum: number, h: any) => sum + (h.amount || 0), 0); 
      
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

    // 6. Payout Ratio Fallback
    if ((sd.payoutRatio === 0 || !sd.payoutRatio) && (sd.dividendRate > 0 || sd.forwardDividendRate > 0)) {
       const eps = results.yahoo?.eps || results.av?.eps || results.google?.eps || 0;
       const rate = sd.forwardDividendRate || sd.dividendRate;
       if (eps > 0 && rate > 0) {
         sd.payoutRatio = rate / eps;
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

        // Fetch detailed data with fallbacks
        const [summary, chart] = await Promise.all([
          yf.quoteSummary(t, { 
            modules: ['summaryDetail', 'assetProfile', 'defaultKeyStatistics', 'financialData'] 
          }).catch(() => null),
          yf.chart(t, { 
            period1: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000), 
            period2: new Date(), 
            events: 'dividends' 
          }).catch(() => null)
        ]);

        let history = [];
        if (chart?.events?.dividends) {
          history = Object.values(JSON.parse(JSON.stringify(chart.events.dividends)));
        }

        const sd = summary?.summaryDetail;
        const dks = summary?.defaultKeyStatistics;
        const fd = summary?.financialData;
        const ap = summary?.assetProfile;

        return {
          price: quote.regularMarketPrice,
          name: quote.longName || quote.shortName || t,
          currency: quote.currency || 'TRY',
          changePercent: quote.regularMarketChangePercent || 0,
          dividendYield: quote.trailingAnnualDividendYield || quote.dividendYield || sd?.dividendYield?.value || dks?.yield?.value || dks?.lastDividendYield?.value || 0,
          dividendRate: quote.trailingAnnualDividendRate || quote.dividendRate || sd?.dividendRate?.value || dks?.lastDividendValue?.value || 0,
          forwardDividendRate: sd?.forwardDividendRate?.value || quote.dividendRate || dks?.lastDividendValue?.value || 0,
          forwardDividendYield: sd?.forwardDividendYield?.value || quote.dividendYield || 0,
          payoutRatio: sd?.payoutRatio?.value || dks?.payoutRatio?.value || quote.payoutRatio || 0,
          eps: dks?.trailingEps?.value || fd?.earningsPerShare?.value || quote.epsTrailingTwelveMonths || 0,
          marketCap: quote.marketCap || sd?.marketCap?.value || 0,
          pe: quote.trailingPE || sd?.trailingPE?.value || 0,
          high52: quote.fiftyTwoWeekHigh || sd?.fiftyTwoWeekHigh?.value || 0,
          low52: quote.fiftyTwoWeekLow || sd?.fiftyTwoWeekLow?.value || 0,
          dayHigh: quote.regularMarketDayHigh || (quote as any).dayHigh || 0,
          dayLow: quote.regularMarketDayLow || (quote as any).dayLow || 0,
          volume: quote.regularMarketVolume || (quote as any).volume || 0,
          recommendationKey: fd?.recommendationKey,
          targetMeanPrice: fd?.targetMeanPrice?.value || 0,
          numberOfAnalystOpinions: fd?.numberOfAnalystOpinions?.value || 0,
          industry: ap?.industry,
          sector: ap?.sector,
          longBusinessSummary: ap?.longBusinessSummary,
          website: ap?.website,
          history
        };
      } catch (e) {}
    }
    return null;
  }

  private static async fetchGoogle(symbol: string) {
    const tickers = [symbol];
    if (symbol.endsWith('.IS')) {
      const base = symbol.split('.')[0];
      tickers.unshift(`IST:${base}`);
      tickers.unshift(base); // Just the base
      tickers.push(`${base}:IST`);
      tickers.push(`TR:${base}`); // TradingView/other style sometimes indexed
      tickers.push(`EPA:${base}`); 
    }

    for (const gt of tickers) {
      try {
        const url = `https://www.google.com/finance/quote/${gt}?hl=tr`; // Force Turkish for BIST consistency
        const res = await fetch(url, {
          headers: { 
            'User-Agent': getRandomUserAgent(),
            'Accept-Language': 'tr-TR,tr;q=0.9'
          }
        });
        if (!res.ok) continue;
        const html = await res.text();
        
        const priceMatch = 
          html.match(/data-last-price="([^"]+)"/) || 
          html.match(/class="YMlS7e"[^>]*>([^<]+)</) || 
          html.match(/"price":([\d.]+),/) ||
          html.match(/class="AHmHk"[^>]*>([\d,.]+)</) ||
          html.match(/class="I67m4c"[^>]*>([\d,.]+)</) ||
          html.match(/class="fxKbKc"[^>]*>([\d,.]+)</) ||
          html.match(/class="r61m6"[^>]*>([\d,.]+)</);

        if (priceMatch) {
          const rawPrice = priceMatch[1].trim();
          let priceVal = 0;
          
          // Google TR often uses "." as thousands separator and "," as decimal separator
          // Or just standard decimal. Let's be smart.
          if (rawPrice.includes(',') && rawPrice.includes('.')) {
            // 1.234,56 -> 1234.56
            priceVal = parseFloat(rawPrice.replace(/\./g, '').replace(',', '.'));
          } else if (rawPrice.includes(',')) {
            // 213,40 -> 213.40
            priceVal = parseFloat(rawPrice.replace(',', '.'));
          } else {
            priceVal = parseFloat(rawPrice.replace(/[^\d.]/g, ''));
          }
          
          if (isNaN(priceVal) || priceVal === 0) continue;

          console.log(`[Google] Success for ${symbol} (${gt}) @ ${priceVal}`);

          let dividendYield = 0;
          let dividendRate = 0;
          let pe = 0;
          let eps = 0;
          let high52 = 0;
          let low52 = 0;
          let dayLow = 0;
          let dayHigh = 0;
          let volume = 0;
          let marketCap = 0;
          let sector = null;
          let industry = null;

          // Robust Pattern Matcher - Improved for flexibility
          const findVal = (labels: string[]) => {
            for (const label of labels) {
              // Try variations: Label inside tag or plain text, value in next tag
              const regexes = [
                // Pattern 1: Label then value in same or next tag
                new RegExp(`(?:${label})<[\\s\\S]*?<(?:div|span|td|a)[^>]*>([\\d,.\\w\\s/\\-]+)<`, 'i'),
                // Pattern 2: Label in one tag, value in sister tag
                new RegExp(`>${label}<[\\s\\S]*?class="[^"]*P66m9b[^"]*"[^>]*>([\\d,.\\w\\s/\\-]+)<`, 'i'),
                // Pattern 3: Direct label mapping
                new RegExp(`>${label}<[\\s\\S]*?>([\\d,.\\w\\s/\\-]+)<`, 'i')
              ];

              for (const reg of regexes) {
                const m = html.match(reg);
                if (m && m[1]) {
                  const val = m[1].trim();
                  if (val && val !== '-' && val !== '---') return val;
                }
              }
            }
            return null;
          };

          const parseGoogleVal = (v: string) => {
            if (!v) return 0;
            const c = v.trim().replace(/\s/g, '').toUpperCase();
            let multi = 1;
            
            // TR Locale specific multipliers
            if (c.includes('MN') || (c.includes('M') && !c.includes(','))) multi = 1000000;
            else if (c.includes('ML') || (c.includes('B') && !c.includes(','))) multi = 1000000000;
            else if (c.includes('B') && (c.length < 5 || c.includes('BIN'))) multi = 1000;
            else if (c.includes('T') && !c.includes(',')) multi = 1000000000000;

            const rawNum = c.replace(/[MBNLT]/g, '').replace(/[^\d.,-]/g, '');
            if (rawNum.includes(',') && rawNum.includes('.')) return parseFloat(rawNum.replace(/\./g, '').replace(',', '.')) * multi;
            if (rawNum.includes(',')) return parseFloat(rawNum.replace(',', '.')) * multi;
            return parseFloat(rawNum) * multi;
          };

          // Yield Patterns
          const yieldVal = findVal(['Temettü verimi', 'Kâr payı verimi', 'Dividend yield', 'Verim']);
          if (yieldVal) dividendYield = parseFloat(yieldVal.replace(',', '.')) / 100;

          // Rate Patterns
          const rateVal = findVal(['Son temettü', 'Last dividend', 'Kâr payı', 'Dividend', 'Hisse Başı Temettü']);
          if (rateVal) dividendRate = parseFloat(rateVal.replace(/[^\d.,]/g, '').replace(',', '.'));

          // PE Ratio Patterns
          const peVal = findVal(['F/K oranı', 'P/E ratio', 'Fiyat/Kazanç', 'F/K']);
          if (peVal) pe = parseFloat(peVal.replace(/[^\d.,]/g, '').replace(',', '.'));

          if (pe > 0 && priceVal > 0) eps = priceVal / pe;

          // Ranges - More aggressive extraction
          const rangeVal = findVal(['Günlük aralık', 'Gün içi aralık', 'Gün içi aralığı', 'Day range', 'Aralık']);
          const rangeMatch = rangeVal ? rangeVal.match(/([\d,.]+)\s*-\s*([\d,.]+)/) : null;
          if (rangeMatch) {
             dayLow = parseGoogleVal(rangeMatch[1]);
             dayHigh = parseGoogleVal(rangeMatch[2]);
          } else {
             // Backup range match via exact class if text search fails (Common for Google Finance)
             const bcRange = html.match(/class="P66m9b"[^>]*>([\d,.]+)\s*-\s*([\d,.]+)</i) || 
                             html.match(/class="mfs7be"[^>]*>([\d,.]+)\s*-\s*([\d,.]+)</i);
             if (bcRange) {
                dayLow = parseGoogleVal(bcRange[1]);
                dayHigh = parseGoogleVal(bcRange[2]);
             }
          }

          const yearRangeVal = findVal(['52 haftalık aralık', '52-week range', '52 hafta']);
          const yrMatch = yearRangeVal ? yearRangeVal.match(/([\d,.]+)\s*-\s*([\d,.]+)/) : null;
          if (yrMatch) {
            low52 = parseGoogleVal(yrMatch[1]);
            high52 = parseGoogleVal(yrMatch[2]);
          }

          const volVal = findVal(['Hacim', 'Volume', 'Avg Volume', 'Ort. Hacim']);
          if (volVal) volume = parseGoogleVal(volVal);

          const mCapVal = findVal(['Piyasa değeri', 'Market cap', 'Piyasa Değ.']);
          if (mCapVal) marketCap = parseGoogleVal(mCapVal);

          // Sector/Industry - Improved extraction for production HTML
          const sectorMatch = html.match(/>(?:Sektör|Sector)<[\s\S]*?<div[^>]*>(?:<a[^>]*>)?([^<]+)(?:<\/a>)?/i) ||
                             html.match(/alt="Sektör"[^>]*>[\s\S]*?>([^<]+)</i);
          if (sectorMatch) sector = sectorMatch[1].trim();

          const industryMatch = html.match(/>(?:Endüstri|Industry)<[\s\S]*?<div[^>]*>(?:<a[^>]*>)?([^<]+)(?:<\/a>)?/i) ||
                               html.match(/alt="Endüstri"[^>]*>[\s\S]*?>([^<]+)</i);
          if (industryMatch) industry = industryMatch[1].trim();

          const summaryMatch = html.match(/class="bNoS7c"[^>]*>([^<]+)</i) || html.match(/class="Q891ec"[^>]*>([^<]+)</i);
          const summary = summaryMatch ? summaryMatch[1].trim() : null;

          const nameMatch = html.match(/<div class="zzDe9c">([^<]+)<\/div>/) || html.match(/class="Dd939e"[^>]*>([^<]+)</) || html.match(/"name":"([^"]+)"/);

          return {
            price: priceVal,
            currency: 'TRY',
            name: nameMatch ? nameMatch[1] : symbol,
            dividendYield,
            dividendRate,
            pe,
            eps,
            high52,
            low52,
            dayLow,
            dayHigh,
            volume,
            marketCap,
            sector,
            industry,
            summary,
            source: 'Google'
          };
        }
      } catch (e) {}
    }
    return null;
  }

  private static async fetchAlphaVantage(symbol: string) {
    const key = process.env.ALPHA_VANTAGE_API_KEY || '59M2UN3BINTUJO7J';
    if (!key || key === 'YOUR_AV_KEY') return null;
    
    const variants = [symbol];
    if (symbol.endsWith('.IS')) {
      variants.unshift(symbol.replace('.IS', '.IST'));
      variants.push(symbol.split('.')[0]); // Just the base symbol
    }

    for (const avt of variants) {
      try {
        console.log(`[AlphaVantage] Trying ${avt} for ${symbol}...`);
        const ovRes = await fetch(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${avt}&apikey=${key}`);
        const ovData = await ovRes.json();
        
        if (ovData.Note || ovData.Information) {
          console.warn(`[AlphaVantage] Limit reached while trying ${avt}`);
          continue;
        }

        if (!ovData.Symbol) {
          console.log(`[AlphaVantage] No data for ${avt}`);
          continue;
        }

        const qRes = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${avt}&apikey=${key}`);
        const qData = await qRes.json();
        const quote = qData['Global Quote'] || {};

        return {
          price: parseFloat(quote['05. price']) || 0,
          name: ovData.Name,
          dividendYield: parseFloat(ovData.DividendYield) || 0,
          dividendRate: parseFloat(ovData.DividendPerShare) || 0,
          payoutRatio: parseFloat(ovData.PayoutRatio) || 0,
          eps: parseFloat(ovData.EPS) || 0,
          marketCap: parseFloat(ovData.MarketCapitalization) || 0,
          targetMeanPrice: parseFloat(ovData.AnalystTargetPrice) || 0,
          volume: parseFloat(quote['06. volume']) || parseFloat(ovData.Volume) || 0,
          pe: parseFloat(ovData.PERatio) || 0,
          industry: ovData.Industry,
          sector: ovData.Sector,
          currency: ovData.Currency || 'TRY',
          dayHigh: parseFloat(quote['03. high']) || 0,
          dayLow: parseFloat(quote['04. low']) || 0
        };
      } catch (e) {}
    }
    return null;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Key Diagnostics
  console.log('--- [KARLISIN ENGINE] API Diagnostics ---');
  console.log('ALPHA_VANTAGE_API_KEY:', process.env.ALPHA_VANTAGE_API_KEY ? 'Present (Using API)' : 'MISSING (Falling back to Web Scrapers)');
  console.log('FINNHUB_API_KEY:', process.env.FINNHUB_API_KEY ? 'Present (Using API)' : 'MISSING');
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Present (Active)' : 'MISSING (Email services disabled)');
  console.log('-----------------------------------------');

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
    res.json({ version: '3.1.0', mode: process.env.NODE_ENV, timestamp: new Date().toISOString() });
  });

  // DIVIDEND API (Unified Engine: v3.1.0)
  app.get('/api/dividends', async (req, res) => {
    const symbol = (req.query.symbol as string || '').toUpperCase().trim();
    const forceRefresh = req.query.refresh === 'true';

    if (!symbol) return res.status(400).json({ error: 'Sembol eksik' });

    // Cache bypass for forced refresh
    if (forceRefresh) {
      console.log(`[UnifiedDS] Force refreshing: ${symbol}`);
      cache.del(`unified_v3.1.0_${symbol}`);
    }

    try {
      const data = await UnifiedDataService.getFullStockData(symbol, forceRefresh);
      
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
