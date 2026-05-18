import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();

import { createServer as createViteServer } from 'vite';
import { Resend } from 'resend';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { fileURLToPath } from 'url';
import yahooFinanceModule from 'yahoo-finance2';
import NodeCache from 'node-cache';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection as clientCollection, getDocsFromServer as clientGetDocs, doc as clientDoc, getDocFromServer as clientGetDoc, setDoc as clientSetDoc, setLogLevel } from 'firebase/firestore';
import { getApp, getApps, initializeApp as initializeAdminApp } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { TwitterApi } from 'twitter-api-v2';
import { articles } from './src/constants/articles';

// Lazy initialization of Twitter client
let xClient: TwitterApi | null = null;

async function postToX(text: string) {
    const xApiKey = process.env.X_API_KEY?.trim();
    const xApiSecret = process.env.X_API_SECRET?.trim();
    const xAccessToken = process.env.X_ACCESS_TOKEN?.trim();
    const xAccessSecret = (process.env.X_ACCESS_TOKEN_SECRET || process.env.X_ACCESS_SECRET)?.trim();

    if (!xApiKey || !xApiSecret || !xAccessToken || !xAccessSecret) {
      const missing = [];
      if (!xApiKey) missing.push('X_API_KEY');
      if (!xApiSecret) missing.push('X_API_SECRET');
      if (!xAccessToken) missing.push('X_ACCESS_TOKEN');
      if (!xAccessSecret) missing.push('X_ACCESS_TOKEN_SECRET/X_ACCESS_SECRET');
      console.warn(`[Karlısın-X] X API anahtarları EKSİK: ${missing.join(', ')}. Tweet paylaşılamadı.`);
      return;
    }

  try {
    if (!xClient) {
      xClient = new TwitterApi({
        appKey: xApiKey,
        appSecret: xApiSecret,
        accessToken: xAccessToken,
        accessSecret: xAccessSecret,
      });
    }

    // Use readWrite client for posting
    const rwClient = xClient.readWrite;
    console.log('[Karlısın-X] Tweet gönderiliyor...');
    console.log(`[Karlısın-X] Kullanılan Anahtar (API): ${xApiKey.substring(0, 4)}...`);
    
    const result = await rwClient.v2.tweet({ text: text.slice(0, 275) });
    const tweetId = result.data?.id || (result as any).id;
    console.log(`[Karlısın-X] Tweet başarıyla paylaşıldı: ${tweetId}`);
    lastXError = null;
    return result;
  } catch (err: any) {
    const errorBody = err.data || err;
    let errorDetail = err.data?.detail || err.data?.message || err.message || 'Detay yok';
    
    // Specially handle 402 CreditsDepleted for X
    if (err.status === 402 || err.code === 402 || (err.data && err.data.title === 'CreditsDepleted')) {
      errorDetail = 'X API Kota Limitine Takıldı (Credits Depleted). Lütfen X Developer Portal üzerinden "Free" planın aktif olduğunu ve Post limitlerinizin dolmadığını kontrol edin. Yeni hesaplarda onaylanma süreci bir kaç saat sürebilir.';
    }

    lastXError = {
      message: err.message,
      code: err.code,
      status: err.data?.status || err.statusCode || err.code,
      errorDetail: errorDetail,
      fullData: errorBody,
      timestamp: new Date().toISOString()
    };
    console.error('[Karlısın-X] Tweet PAYLAŞILAMADI!');
    console.error(`[Karlısın-X] Hata: ${lastXError.errorDetail}`);
    console.error('[Karlısın-X] Tweet paylaşım hatası!');
    console.error(`[Karlısın-X] Status: ${lastXError.status}`);
    console.error(`[Karlısın-X] Detail: ${lastXError.errorDetail}`);
    
    if (err.data) {
      console.error(`[Karlısın-X] API Yanıtı: ${JSON.stringify(err.data)}`);
    }
    
    // On 401/403 errors, maybe clear client to force re-init
    if (err.status === 401 || err.status === 403 || err.code === 401 || err.code === 403 || err.statusCode === 401 || err.statusCode === 403) {
      console.warn('[Karlısın-X] YETKİLENDİRME HATASI (401/403). LÜTFEN ŞUNLARI KONTROL EDİN:');
      console.warn('1. X Dev Portal -> User authentication settings -> App permissions: "Read and write" seçili mi?');
      console.warn('2. Bu ayar yapıldıktan sonra Access Token ve Secret YENİDEN OLUŞTURULDU MU?');
      xClient = null;
    }
  }
}

// global handles
let adminDb: any;
let __dirname = '';

// Initialize Firebase lazily
let db: any = null;
const getDb = () => {
  if (db) return db;
  try {
    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      const firebaseApp = initializeApp(firebaseConfig);
      db = initializeFirestore(firebaseApp, {
        experimentalForceLongPolling: true,
      }, firebaseConfig.firestoreDatabaseId);
      console.log('[Karlısın-Firebase] Sunucu tarafı bağlantısı hazır (Long Polling aktif).');
      return db;
    }
    console.warn('[Karlısın-Firebase] firebase-applet-config.json bulunamadı.');
  } catch (err) {
    console.error('[Karlısın-Firebase] Başlatma sırasında hata oluştu:', err);
  }
  return null;
};

// Helper to get clean sender email
const getSenderEmail = () => {
  let envFrom = process.env.RESEND_FROM_EMAIL || 'merhaba@karlisin.com';
  
  // Remove ANY type of quotes and trim
  envFrom = envFrom.replace(/['"“”]/g, '').trim();
  
  // CRITICAL SECURITY & VALIDATION: 
  // 1. If empty or too short
  // 2. If it contains 're_' (Resend API Key prefix)
  // 3. If it doesn't contain '@'
  // 4. Default fallback to verified domain email
  if (!envFrom || envFrom.length < 5 || envFrom.includes('re_') || !envFrom.includes('@')) {
    console.error(`[Karlısın-Resend] GEÇERSİZ GÖNDERİCİ TESPİT EDİLDİ: "${envFrom}". Varsayılana dönülüyor.`);
    return 'merhaba@karlisin.com';
  }
  
  return envFrom;
};

// Initialize Gemini
let genAI: GoogleGenAI | null = null;

const rateLimitCache = new NodeCache({ stdTTL: 86400 });

// Robust IP extraction
const getClientIdentifier = (req: any): string => {
  const fromBody = req.body?.deviceId;
  if (fromBody) return fromBody;
  
  const fromQuery = req.query?.deviceId;
  if (fromQuery) return fromQuery;

  const deviceId = req.headers['x-device-id'];
  if (deviceId) return Array.isArray(deviceId) ? deviceId[0] : (deviceId as string).trim();

  const fastlyIp = req.headers['fastly-client-ip'];
  if (fastlyIp) return Array.isArray(fastlyIp) ? fastlyIp[0] : (fastlyIp as string).split(',')[0].trim();
  
  const xff = req.headers['x-forwarded-for'];
  if (xff) return Array.isArray(xff) ? xff[0] : (xff as string).split(',')[0].trim();
  
  const trueClient = req.headers['true-client-ip'];
  if (trueClient) return Array.isArray(trueClient) ? trueClient[0] : (trueClient as string).trim();

  return req.ip || 'unknown';
};

// Global in-memory lock for broadcast
let isLocalBroadcastPending = false;
let lastXError: any = null;

// Rate limit helper
const checkIpLimit = (identifier: string): { allowed: boolean; remaining: number } => {
  const LIMIT = 3; // 3 hakkı olsun, normal limite dönüldü
  const today = new Date().toISOString().split('T')[0];
  const key = `limit:${identifier}:${today}`;
  const count = rateLimitCache.get<number>(key) || 0;
  
  if (count >= LIMIT) return { allowed: false, remaining: 0 };
  
  rateLimitCache.set(key, count + 1);
  return { allowed: true, remaining: LIMIT - (count + 1) };
};

const decrementIpLimit = (identifier: string): void => {
  const today = new Date().toISOString().split('T')[0];
  const key = `limit:${identifier}:${today}`;
  const count = rateLimitCache.get<number>(key) || 0;
  if (count > 0) rateLimitCache.set(key, count - 1);
};

const decrementExtractLimit = (identifier: string): void => {
  const today = new Date().toISOString().split('T')[0];
  const key = `extract_limit:${identifier}:${today}`;
  const count = rateLimitCache.get<number>(key) || 0;
  if (count > 0) rateLimitCache.set(key, count - 1);
};

const getGenAI = () => {
  if (genAI) return genAI;
  
  const rawApiKey = (process.env.USER_GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "").trim();

  // Bilinen sahte/geçersiz anahtarları engelle
  if (rawApiKey.includes("MY_GEMINI") || rawApiKey.includes("YOUR_KEY")) {
    console.error(`[Karlısın-AI] HATA: Ortam değişkenlerinde geçersiz/sahte bir anahtar (placeholder) tespit edildi: ${rawApiKey.substring(0,8)}...`);
    return null;
  }

  const apiKey = rawApiKey;

  if (apiKey) {
    console.log(`[Karlısın-AI] Anahtar Aktif. Uzunluk: ${apiKey.length}`);
    genAI = new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    return genAI;
  }
  
  console.error(`[Karlısın-AI] KRİTİK: Geçerli bir GEMINI_API_KEY bulunamadı!`);
  return null;
};

// Initial attempt
try {
  getGenAI();
} catch (e) {}

// yahoo-finance2 v3+ robust instantiation logic
// This fixes the "Call new YahooFinance() first" error
let yf: any = null;

function getYahoo() {
  if (yf && typeof yf.quote === 'function' && !yf.isModule) return yf;
  
  try {
    const raw: any = yahooFinanceModule;
    if (typeof raw === 'function') {
      yf = new raw({ suppressNotices: ['yahooSurvey'] });
      console.log('[Karlısın-INIT] Yahoo Finance: Initialized via default constructor.');
    } else if (raw.default && typeof raw.default === 'function') {
      yf = new raw.default({ suppressNotices: ['yahooSurvey'] });
      console.log('[Karlısın-INIT] Yahoo Finance: Initialized via raw.default.');
    } else {
      console.log('[Karlısın-INIT] Yahoo Finance: Cannot find constructor, looking for instance.');
      yf = raw;
      yf.isModule = true; // Mark to avoid caching broken module if it throws
    }
  } catch (e) {
    console.warn('[Karlısın-INIT] Yahoo Finance instantiation error:', e);
    yf = yahooFinanceModule;
    yf.isModule = true;
  }
  return yf;
}

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
 * YAPİ KREDİ API SERVICE v1.0
 * Official Banking API for Borsa İstanbul Data
 */
class YapiKrediService {
  private static token: string | null = null;
  private static tokenExpiry: number = 0;

  private static async getAccessToken() {
    const clientId = process.env.YAPIKREDI_CLIENT_ID;
    const clientSecret = process.env.YAPIKREDI_CLIENT_SECRET;

    if (!clientId || !clientSecret) return null;

    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    try {
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const res = await fetch('https://api.yapikredi.com.tr/oauth2/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });

      if (!res.ok) throw new Error('Yapi Kredi Auth Failed');
      const data = await res.json();
      
      this.token = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // 1 min buffer
      return this.token;
    } catch (err) {
      console.error('[YapiKredi-Auth] Error:', err);
      return null;
    }
  }

  static async getStockInformation(symbol: string) {
    const token = await this.getAccessToken();
    if (!token) return null;

    try {
      const clean = symbol.replace('.IS', '').toUpperCase();
      const res = await fetch(`https://api.yapikredi.com.tr/api/stockmarket/v1/stockInformation?stockCode=${clean}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!res.ok) return null;
      const data = await res.json();
      
      if (data && data.responseContent) {
        const item = data.responseContent;
        return {
          price: parseFloat(item.lastPrice) || 0,
          changePercent: parseFloat(item.changePercentage) || 0,
          dayHigh: parseFloat(item.highPrice) || 0,
          dayLow: parseFloat(item.lowPrice) || 0,
          volume: parseFloat(item.volume) || 0,
          marketCap: parseFloat(item.marketValue) || 0,
          name: item.stockName || clean,
          source: 'Yapı Kredi API'
        };
      }
    } catch (err) {
      console.error('[YapiKredi-API] Error:', err);
    }
    return null;
  }
}

/**
 * UNIFIED DATA SERVICE v3.2
 * Cross-verifies data from multiple sources including Yapı Kredi
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
               html.match(/data-test="day-range-value"[^>]*>([\d,.]+)\s*-\s*([\d,.]+)</) ||
               html.match(/"range":"([\d,.]+)\s*-\s*([\d,.]+)"/) ||
               html.match(/"low":([\d,.]+),"high":([\d,.]+)/);

             const volumeMatch = 
               html.match(/>Volume<[\s\S]*?>([\d,.]+)</) || 
               html.match(/>Hacim<[\s\S]*?>([\d,.]+)</) ||
               html.match(/id="pair-details-volume">([\d,.]+)</) ||
               html.match(/data-test="volume-value"[^>]*>([\d,.]+)</) ||
               html.match(/"volume":([\d,.]+)/) ||
               html.match(/data-test="volume-value">([\d,.]+)</) ||
               html.match(/"volume":\s*(\d+)/);

             const sectorMatch = html.match(/"industry":"([^"]+)"/) || html.match(/>Industry<[\s\S]*?>([^<]+)</i) || html.match(/>Endüstri<[\s\S]*?>([^<]+)</i);
             const marketCapMatch = html.match(/>Market Cap<[\s\S]*?>([^<]+)</i) || html.match(/>Piyasa Değeri<[\s\S]*?>([^<]+)</i);

             console.log(`[Investing] Success for ${symbol}. Price: ${price}, Range: ${rangeMatch ? rangeMatch[1] + '-' + rangeMatch[2] : 'MISSING'}, Vol: ${volumeMatch ? volumeMatch[1] : 'MISSING'}`);
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
    let clean = raw.trim().replace(/\s/g, '').toUpperCase();
    
    let multiplier = 1;
    if (clean.includes('MN') || (clean.endsWith('M') && !clean.includes(','))) multiplier = 1000000;
    else if (clean.includes('MR') || clean.includes('ML') || clean.includes('B')) multiplier = 1000000000;
    else if (clean.includes('K')) multiplier = 1000;

    clean = clean.replace(/[MBNLRTK]/g, '');

    if (clean.includes('.') && clean.includes(',')) {
       clean = clean.replace(/\./g, '').replace(',', '.');
    } else if (clean.includes(',')) {
       clean = clean.replace(',', '.');
    }
    return (parseFloat(clean) || 0) * multiplier;
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
    const [yahoo, google, av, investing, finnhub, yapikredi] = await Promise.allSettled([
      this.fetchYahoo(cleanSymbol),
      this.fetchGoogle(cleanSymbol),
      this.fetchAlphaVantage(cleanSymbol),
      this.fetchInvesting(cleanSymbol),
      this.fetchFinnhub(cleanSymbol),
      YapiKrediService.getStockInformation(cleanSymbol)
    ]);

    const results: any = {
      yahoo: yahoo.status === 'fulfilled' ? yahoo.value : null,
      google: google.status === 'fulfilled' ? google.value : null,
      av: av.status === 'fulfilled' ? av.value : null,
      investing: investing.status === 'fulfilled' ? investing.value : null,
      finnhub: finnhub.status === 'fulfilled' ? finnhub.value : null,
      yapikredi: yapikredi.status === 'fulfilled' ? yapikredi.value : null
    };

    // Detailed Debugging for sources
    console.log(`[UnifiedDS v3.2.0] ${cleanSymbol} Status:`, {
      yahoo: !!results.yahoo,
      google: !!results.google,
      av: !!results.av,
      investing: !!results.investing,
      finnhub: !!results.finnhub,
      yapikredi: !!results.yapikredi
    });

    const getValidPrice = () => {
      if (results.yapikredi?.price && results.yapikredi.price > 0) return results.yapikredi.price;
      if (results.google?.price && results.google.price > 0) return results.google.price;
      if (results.yahoo?.price && results.yahoo.price > 0) return results.yahoo.price;
      if (results.finnhub?.price && results.finnhub.price > 0) return results.finnhub.price;
      if (results.investing?.price && results.investing.price > 0) return results.investing.price;
      if (results.av?.price && results.av.price > 0) return results.av.price;
      return 0;
    };

    const price = getValidPrice();
    if (price === 0) {
      console.error(`[UnifiedDS] CRITICAL: All 6 fetchers failed for ${cleanSymbol}.`);
    }

    // CROSS-VERIFICATION & AUGMENTATION LOGIC
    const aggregated = {
      symbol: cleanSymbol,
      version: '3.2.0',
      source: results.yapikredi ? 'Yapı Kredi Verified' : 'Unified Engine v3.2 (ZIRHLI PROD-MAX)',
      timestamp: new Date().toISOString(),
      summary: {
        price: {
          regularMarketPrice: price,
          longName: results.yapikredi?.name || results.google?.name || results.yahoo?.name || results.investing?.name || results.av?.name || cleanSymbol,
          currency: results.google?.currency || results.yahoo?.currency || results.investing?.currency || results.av?.currency || 'TRY',
          regularMarketChangePercent: results.yapikredi?.changePercent !== undefined ? results.yapikredi?.changePercent : (results.google?.changePercent !== undefined ? results.google?.changePercent : (results.finnhub?.changePercent || results.yahoo?.changePercent || 0)),
          dayHigh: [results.yapikredi?.dayHigh, results.google?.dayHigh, results.yahoo?.dayHigh, results.finnhub?.dayHigh, results.investing?.dayHigh, results.av?.dayHigh].find(v => v && v > 0) || 0,
          dayLow: [results.yapikredi?.dayLow, results.google?.dayLow, results.yahoo?.dayLow, results.finnhub?.dayLow, results.investing?.dayLow, results.av?.dayLow].find(v => v && v > 0) || 0,
          volume: [results.yapikredi?.volume, results.google?.volume, results.yahoo?.volume, results.investing?.volume, results.av?.volume].find(v => v && v > 0) || 0
        },
        summaryDetail: {
          dividendYield: [results.yahoo?.dividendYield, results.investing?.dividendYield, results.av?.dividendYield, results.google?.dividendYield].find(v => v && v > 0) || 0,
          dividendRate: [results.yahoo?.dividendRate, results.investing?.dividendRate, results.av?.dividendRate, results.google?.dividendRate].find(v => v && v > 0) || 0,
          forwardDividendRate: [results.yahoo?.forwardDividendRate, results.av?.dividendRate, results.google?.dividendRate].find(v => v && v > 0) || 0,
          forwardDividendYield: [results.yahoo?.forwardDividendYield, results.av?.dividendYield, results.google?.dividendYield].find(v => v && v > 0) || 0,
          payoutRatio: [results.yahoo?.payoutRatio, results.av?.payoutRatio, results.investing?.payoutRatio].find(v => v && (v > 0 || v < 0)) || 0,
          marketCap: [results.yapikredi?.marketCap, results.yahoo?.marketCap, results.av?.marketCap, results.google?.marketCap, results.investing?.marketCap].find(v => v && v > 0) || 0,
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
        yapikredi_verified: !!results.yapikredi,
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
          dayHigh: quote.regularMarketDayHigh || quote.regularMarketDayRange?.high || quote.dayHigh || sd?.dayHigh?.value || (quote as any).dayHigh || 0,
          dayLow: quote.regularMarketDayLow || quote.regularMarketDayRange?.low || quote.dayLow || sd?.dayLow?.value || (quote as any).dayLow || 0,
          volume: quote.regularMarketVolume || quote.volume || sd?.volume?.value || (quote as any).volume || 0,
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

          console.log(`[Google] Found price for ${symbol} (${gt}): ${priceVal}`);

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
                // Pattern 0: Specific Google Finance data-test or similar
                new RegExp(`data-test="[^"]*${label}[^"]*"[^>]*>([\\d,.\\w\\s/\\-]+)<`, 'i'),
                // Pattern 1: Label then value in same or next tag
                new RegExp(`(?:${label})<[\\s\\S]*?<(?:div|span|td|a)[^>]*>([\\d,.\\w\\s/\\-]+)<`, 'i'),
                // Pattern 2: Label in one tag, value in sister tag
                new RegExp(`>${label}<[\\s\\S]*?class="[^"]*(?:P66m9b|mfs7be|Q891ec|P6K39c)[^"]*"[^>]*>([\\d,.\\w\\s/\\-]+)<`, 'i'),
                // Pattern 3: Direct label mapping
                new RegExp(`>${label}<[\\s\\S]*?>([\\d,.\\w\\s/\\-]+)<`, 'i'),
                // Pattern 4: More aggressive sibling search
                new RegExp(`>${label}<[\\s\\S]*?class="[^"]*"[^>]*>([\\d,.\\w\\s/\\-]+)<`, 'i')
              ];

              for (const reg of regexes) {
                const m = html.match(reg);
                if (m && m[1]) {
                  const val = m[1].trim();
                  if (val && val !== '-' && val !== '---' && val.length < 50) return val;
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
            // Mn = Milyon, Mr = Milyar, B = Bin
            if (c.includes('MN') || (c.endsWith('M') && !c.includes(','))) multi = 1000000;
            else if (c.includes('MR') || c.includes('ML') || (c.endsWith('B') && c.length > 5)) multi = 1000000000;
            else if (c.includes('BIN') || (c.endsWith('B') && c.length <= 4)) multi = 1000;
            else if (c.includes('T') && !c.includes(',')) multi = 1000000000000;

            const rawNum = c.replace(/[MBNLRT]/g, '').replace(/[^\d.,-]/g, '');
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
                             html.match(/class="mfs7be"[^>]*>([\d,.]+)\s*-\s*([\d,.]+)</i) ||
                             html.match(/class="Q891ec"[^>]*>([\d,.]+)\s*-\s*([\d,.]+)</i) ||
                             html.match(/class="[^"]*P6K39c[^"]*"[^>]*>[^\d]*([\d,.]+)\s*-\s*[^\d]*([\d,.]+)[^<]*</i) ||
                             html.match(/class="[^"]*P6K39c[^"]*"[^>]*>.*?([\d,.]+)\s*-\s*.*?([\d,.]+)[^<]*</i);
             // Note: if it has currency symbol inside P6K39c, we extract it carefully.
             if (bcRange && bcRange[1] && bcRange[2]) {
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

          console.log(`[Google] Metrics for ${symbol}. Range: ${rangeVal || 'MISSING'}, Vol: ${volVal || 'MISSING'}, Yield: ${dividendYield}`);

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

// WordPress API Integration
async function fetchWordPressPosts() {
  const wpUrl = process.env.WORDPRESS_URL?.trim();
  console.log(`[Karlısın-WP] Fetching from URL: ${wpUrl || 'NOT SET (using local articles)'}`);
  if (!wpUrl || wpUrl === '') return articles;

  const cacheKey = 'wp_posts';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const wpApiUrl = `${wpUrl.replace(/\/$/, '')}/wp-json/wp/v2/posts?_embed&per_page=50&status=publish`;
    console.log(`[Karlısın-WP] Fetching from: ${wpApiUrl}`);
    
    const startTime = Date.now();
    const response = await fetch(wpApiUrl, {
      headers: {
        'User-Agent': 'Karlisin-Platform-Bot/1.0'
      }
    });

    console.log(`[Karlısın-WP] Response received in ${Date.now() - startTime}ms. Status: ${response.status} (${response.statusText})`);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No body');
      console.warn(`[Karlısın-WP] API YANITI HATALI. URL: ${wpApiUrl}, Status: ${response.status}, Body: ${errorText.substring(0, 200)}`);
      return articles;
    }
    
    const posts = await response.json();
    if (!Array.isArray(posts)) {
      console.warn(`[Karlısın-WP] Beklenen dizi formatı gelmedi. Gelen: ${typeof posts}`);
      return articles;
    }
    
    console.log(`[Karlısın-WP] ${posts.length} ham yazı başarıyla alındı.`);

    const mappedPosts = posts.map((post: any, index: number) => {
      // Öne çıkan görseli al - Ultra kapsamlı kontrol hiyerarşisi
      let imageUrl = 'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?auto=format&fit=crop&q=80&w=1200';
      let detectionSource = 'default';
      
      // 1. Standart WP Embedded Media
      const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];
      
      if (featuredMedia) {
        imageUrl = featuredMedia.source_url || 
                   featuredMedia.media_details?.sizes?.full?.source_url || 
                   featuredMedia.media_details?.sizes?.large?.source_url ||
                   featuredMedia.media_details?.sizes?.medium_large?.source_url ||
                   featuredMedia.media_details?.sizes?.medium?.source_url ||
                   featuredMedia.guid?.rendered ||
                   imageUrl;
        detectionSource = 'wp:featuredmedia';
      } 
      // 2. Direct Featured URL fields (common in some WP setups/plugins)
      else if (post.featured_media_url) { imageUrl = post.featured_media_url; detectionSource = 'featured_media_url'; }
      else if (post.jetpack_featured_media_url) { imageUrl = post.jetpack_featured_media_url; detectionSource = 'jetpack_featured_media_url'; }
      else if (post.featured_media_src_url) { imageUrl = post.featured_media_src_url; detectionSource = 'featured_media_src_url'; }
      else if (post.featured_image_url) { imageUrl = post.featured_image_url; detectionSource = 'featured_image_url'; }
      
      // 3. Yoast SEO / Social Graph Metadata (Highly reliable fallback)
      else if (post.yoast_head_json?.og_image?.[0]?.url) { imageUrl = post.yoast_head_json.og_image[0].url; detectionSource = 'yoast_og_image'; }
      else if (post.yoast_head_json?.twitter_image) { imageUrl = post.yoast_head_json.twitter_image; detectionSource = 'yoast_twitter_image'; }
      
      // 4. Rank Math / Other SEO Plugins
      else if (post.rank_math_facebook_image) { imageUrl = post.rank_math_facebook_image; detectionSource = 'rank_math_fb'; }
      
      // 5. Common Legacy Fields
      else if (post.better_featured_image?.source_url) { imageUrl = post.better_featured_image.source_url; detectionSource = 'better_featured_image'; }
      else if (post.parselyMeta?.['parsely-image-url']) { imageUrl = post.parselyMeta['parsely-image-url']; detectionSource = 'parsely'; }
      
      // 6. Content Scraping (Final attempt)
      else {
        const content = post.content?.rendered || "";
        const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
        if (imgMatch && imgMatch[1] && !imgMatch[1].includes('avatar')) {
          imageUrl = imgMatch[1];
          detectionSource = 'content_scrape';
        }
      }
      
      if (index === 0) {
        console.log(`[Karlısın-WP] İlk Yazı Detayı: "${post.title?.rendered}", Görsel Kaynağı: ${detectionSource}, URL: ${imageUrl.substring(0, 50)}...`);
      }

      // Kategori bul
      const categories = post._embedded?.['wp:term']?.[0] || [];
      const categoryName = categories.length > 0 ? categories[0].name : 'Finans';

      // HTML temizleme ve düzgün özet oluşturma
      const cleanExcerpt = post.excerpt?.rendered 
        ? post.excerpt.rendered.replace(/<[^>]*>?/gm, '').trim()
        : (post.content?.rendered || '').replace(/<[^>]*>?/gm, '').substring(0, 160).trim() + '...';

      return {
        id: post.id,
        slug: post.slug,
        title: post.title?.rendered || 'Başlıksız Yazı',
        excerpt: cleanExcerpt,
        content: post.content?.rendered || '',
        category: categoryName,
        date: new Date(post.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
        readTime: `${Math.max(3, Math.ceil((post.content?.rendered || '').split(' ').length / 200))} dk`,
        image: imageUrl
      };
    });

    // 30 saniye önbelleğe al (Neredeyse gerçek zamanlı güncelleme için)
    cache.set(cacheKey, mappedPosts, 30);
    return mappedPosts;
  } catch (error) {
    console.error('[Karlısın-WP] FETCH HATASI:', error);
    // Hata durumunda önbellekteki veriyi döndürmeye çalış
    const staleContent = cache.get(cacheKey);
    if (staleContent) {
      console.log('[Karlısın-WP] Hata nedeniyle eski önbellek verisi döndürülüyor.');
      return staleContent;
    }
    return articles; // Hiçbir şey yoksa lokale dön
  }
}

async function startServer() {
  // Deriving __dirname for ES module compatibility/CommonJS
  try {
    const { fileURLToPath } = await import('url');
    // @ts-ignore
    const __filename = fileURLToPath(import.meta.url);
    __dirname = path.dirname(__filename);
  } catch (e) {
    __dirname = process.cwd();
  }

  // Silence Firestore logs to avoid noisey gRPC cancellation messages
  setLogLevel('error');

  // Initialize Firebase Admin (Server-side privileged access)
  try {
    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    let projectId = 'gen-lang-client-0551179549';
    let databaseId = '';

    if (fs.existsSync(configPath)) {
      const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      projectId = firebaseConfig.projectId || projectId;
      databaseId = firebaseConfig.firestoreDatabaseId || '';
    }

    // Provisioned Project Priority
    const PROVISIONED_PROJECT = 'gen-lang-client-0551179549';
    const PROVISIONED_DB = 'ai-studio-49437603-f001-4c08-82f8-dff9de0114f3';

    const getAdminDb = async (pId: string, dId: string, label: string) => {
      console.log(`[Karlısın-Firebase] Attempting ${label}: Project=${pId || 'auto'}, Db=${dId || 'default'}`);
      const appName = `app-${pId || 'default'}-${dId || 'default'}`;
      let app = getApps().find(a => a.name === appName);
      if (!app) {
        const options = pId ? { projectId: pId } : {};
        app = initializeAdminApp(options, appName);
      }
      const db = dId && dId !== '(default)' ? getAdminFirestore(app, dId) : getAdminFirestore(app);
      
      // Verify with a timeout
      const verifyPromise = db.collection('newsletter_subscribers').limit(1).get();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      );
      
      try {
        await Promise.race([verifyPromise, timeoutPromise]);
        return db;
      } catch (err: any) {
        if (err.message.includes('permission_denied') || err.message.includes('Permission denied')) {
           console.error(`[Karlısın-Firebase] IAM HATASI [${label}]: Proje ID: ${pId}. "Cloud Datastore User" rolü eksik olabilir.`);
        }
        throw err;
      }
    };

    // Sequence of attempts
    try {
      // 1. Provisioned Config (Most likely to work after set_up_firebase)
      adminDb = await getAdminDb(PROVISIONED_PROJECT, PROVISIONED_DB, 'Provisioned-Config');
    } catch (e) {
      console.warn(`[Karlısın-Firebase] Provisioned-Config failed, trying fallbacks...`);
      try {
        // 2. Local File Config
        if (projectId && projectId !== PROVISIONED_PROJECT) {
           adminDb = await getAdminDb(projectId, databaseId, 'File-Config');
        }
      } catch (e2) {
        try {
          // 3. Auto-detect (Cloud Run default)
          adminDb = await getAdminDb('', '', 'Auto-Detect');
        } catch (e3) {
          console.error(`[Karlısın-Firebase] ALL Firebase Admin patterns failed.`);
        }
      }
    }

    if (adminDb) {
      console.log(`[Karlısın-Firebase] Active Database: ${adminDb.databaseId} in Project: ${adminDb.projectId}`);
    }

  } catch (err: any) {
    console.error('[Karlısın-Firebase] Admin SDK Init failure:', err.message);
  }

  const app = express();
  app.set('trust proxy', true);
  const PORT = Number(process.env.PORT) || 3000;

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
  app.use(express.json({ limit: '10mb' }));

  // Request logger
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[Karlısın-API-REQ] ${req.method} ${req.path}`);
    }
    next();
  });

  // ---------------------------------------------------------
  // 0. SEO VE DİĞER KRİTİK DOSYALAR (EN BAŞTA OLMALI)
  // ---------------------------------------------------------
  const serveSEOFile = (fileName: string, contentType: string, fallbackContent?: string) => {
    return (req: express.Request, res: express.Response) => {
      const paths = [
        path.join(__dirname, 'public', fileName),
        path.join(__dirname, 'dist', fileName),
        path.join(__dirname, fileName)
      ];

      for (const p of paths) {
        if (fs.existsSync(p)) {
          console.log(`[Karlısın-SEO] Serving ${fileName} from path: ${p}`);
          res.setHeader('Content-Type', contentType);
          res.setHeader('Cache-Control', 'public, max-age=3600'); 
          return res.sendFile(p);
        }
      }

      if (fallbackContent) {
        console.log(`[Karlısın-SEO] Serving ${fileName} from fallback content`);
        res.setHeader('Content-Type', contentType);
        return res.send(fallbackContent);
      }

      console.warn(`[Karlısın-SEO] Dosya bulunamadı: ${fileName}`);
      res.status(404).send('File not found');
    };
  };

  app.get('/sitemap.xml', serveSEOFile('sitemap.xml', 'application/xml'));
  app.get('/robots.txt', serveSEOFile('robots.txt', 'text/plain'));
  app.get('/ads.txt', serveSEOFile('ads.txt', 'text/plain', 'google.com, pub-6525616618289921, DIRECT, f08c47fec0942fa0'));
  app.get('/Ads.txt', (req, res) => res.redirect(301, '/ads.txt'));

  // ---------------------------------------------------------
  // DEBUG & MANUAL TRIGGER
  // ---------------------------------------------------------
  app.get('/api/debug/broadcast', async (req, res) => {
    console.log('[Karlısın-DEBUG] Manuel broadcast tetiklendi.');
    
    const mask = (s: string | undefined) => s ? `${s.substring(0, 4)}...${s.substring(s.length - 4)}` : 'MISSING';
    const envKeys = Object.keys(process.env).filter(k => k.startsWith('X_') || k.startsWith('RESEND_'));
    
    const diagnostics: any = {
      version: 'v4.1-diagnostics-expanded',
      step1_adminDb_initialized: !!adminDb,
      step2_firestore_test: 'pending'
    };

    try {
      if (adminDb) {
        diagnostics.active_database = adminDb.databaseId || 'default?';
        diagnostics.project_id = adminDb.projectId || 'missing?';
        
        try {
          const testSnap = await adminDb.collection('newsletter_subscribers').limit(1).get();
          diagnostics.step2_firestore_active_test = `success (found ${testSnap.size} docs)`;
          
          const systemRef = adminDb.collection('system_config').doc('broadcast_status');
          await systemRef.set({ status: 'IDLE', last_broadcasted_article_id: '0' }, { merge: true });
          diagnostics.step3_reset_status = 'success';
        } catch (fErr: any) {
          diagnostics.step2_firestore_active_test = `error: ${fErr.message} (code: ${fErr.code})`;
          console.error('[Karlısın-DEBUG] Firestore Active Test Error:', fErr);
          
          // Try default database as well
          try {
             const { getFirestore } = await import('firebase-admin/firestore');
             const defaultDb = getFirestore();
             const dSnap = await defaultDb.collection('newsletter_subscribers').limit(1).get();
             diagnostics.step2_firestore_default_test = `success (found ${dSnap.size} docs)`;
          } catch (dErr: any) {
             diagnostics.step2_firestore_default_test = `error: ${dErr.message}`;
          }

          // If 5 NOT_FOUND, maybe try a listCollections to see what's there
          try {
             const collections = await adminDb.listCollections();
             diagnostics.collections_found = collections.map((c: any) => c.id);
          } catch (listErr: any) {
             diagnostics.collections_list_error = listErr.message;
          }
        }
      }

      // X Client'ı sıfırla ki yeni anahtarlarla başlasın
      xClient = null;

      // SYNC BROADCAST if possible or just wait longer
      const broadcastPromise = initAutoBroadcast(true); 

      // Biraz daha bekle ki async başlayan broadcast lastXError'ı güncelleyebilsin (eğer hata verirse)
      // Veya direkt promise'i bekleyelim (initAutoBroadcast bir timer başlatıyor ama biz içindeki broadcastArticle'ı beklemek istiyoruz)
      // Aslında broadcastArticle'ı export etmedik, o yüzden bekleyemiyoruz.
      // Ama broadcastArticle içindeki isLocalBroadcastPending flag'ini izleyebiliriz.
      
      await new Promise(resolve => setTimeout(resolve, 8000)); // 8 saniye bekle

      res.json({ 
        success: true, 
        message: 'Manuel tetikleme adımları icra edildi. (8sn beklendi)',
        diagnostics,
        keys: {
          RESEND: mask(process.env.RESEND_API_KEY),
          X_API_KEY: mask(process.env.X_API_KEY),
          X_API_SECRET: mask(process.env.X_API_SECRET),
          X_ACCESS_TOKEN: mask(process.env.X_ACCESS_TOKEN),
          X_ACCESS_TOKEN_SECRET: mask(process.env.X_ACCESS_TOKEN_SECRET || process.env.X_ACCESS_SECRET),
        },
        lastXError: lastXError || 'Hata yok (Henüz)'
      });
    } catch (err: any) {
      console.error('[Karlısın-DEBUG] Kritik Hata:', err.message);
      res.status(500).json({ 
        error: err.message,
        diagnostics,
        lastXError: lastXError || 'Hata yok'
      });
    }
  });

  // ---------------------------------------------------------
  // 1. API ROTLARI (KESİN OLARAK ÜSTTE)
  // ---------------------------------------------------------

  // Debug Version API
  app.get('/api/version', (req, res) => {
    res.json({ 
      version: '3.1.0', 
      mode: process.env.NODE_ENV, 
      wordpress_configured: !!process.env.WORDPRESS_URL,
      wordpress_url_preview: process.env.WORDPRESS_URL ? `${process.env.WORDPRESS_URL.substring(0, 15)}...` : 'not set',
      timestamp: new Date().toISOString(),
      last_x_error: lastXError 
    });
  });

  // X (Twitter) Test Endpoint
  app.get('/api/test-x', async (req, res) => {
    const text = `Karlısın X Entegrasyon Testi 🚀\nZaman: ${new Date().toLocaleString('tr-TR')}\n#Karlısın #Test`;
    console.log('[Karlısın-DEBUG] Manuel X testi başlatıldı...');
    
    try {
      const result = await postToX(text);
      if (result) {
        res.json({ 
          success: true, 
          message: 'Tweet başarıyla gönderildi.', 
          tweet: result 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: 'Tweet gönderilemedi, lastXError kontrol edin.',
          error: lastXError 
        });
      }
    } catch (e: any) {
      res.status(500).json({ 
        success: false, 
        message: 'Kritik hata', 
        error: e.message,
        lastXError: lastXError
      });
    }
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
  // API Status Check
  app.get('/api/portfolio/ai-status', (req, res) => {
    // Add explicitly no-cache to avoid CDN caching
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const aiClient = getGenAI();
    
    // Güvenilir Cihaz/IP tespiti
    const guestIp = getClientIdentifier(req);
    
    console.log(`[Karlısın-AI] Status Check ID: ${guestIp}`);
    
    const today = new Date().toISOString().split('T')[0];
    const key = `limit:${guestIp}:${today}`;
    const usedCount = rateLimitCache.get<number>(key) || 0;
    
    // Extract limit
    const extractKey = `extract_limit:${guestIp}:${today}`;
    const extractUsedCount = rateLimitCache.get<number>(extractKey) || 0;

    const raw = (process.env.USER_GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "").trim();
    let displayRaw = raw;
    if (raw.includes("MY_GEMINI") || raw.includes("YOUR_KEY")) {
      displayRaw = ""; // Fake key, behave like empty
    }

    const LIMIT = 3;
    const EXTRACT_LIMIT = 1;
    res.json({ 
      status: aiClient ? 'authenticated' : 'missing', 
      message: aiClient ? 'AI Servisi Hazır' : 'Geçersiz veya Eksik Anahtar',
      remaining: Math.max(0, LIMIT - usedCount),
      remainingExtract: Math.max(0, EXTRACT_LIMIT - extractUsedCount),
      ip: guestIp
    });
  });

  // Portfolio Analysis & Extraction Endpoints
  app.post('/api/portfolio/extract', async (req, res) => {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'Görsel eksik' });
    const aiClient = getGenAI();
    if (!aiClient) return res.status(503).json({ error: 'AI servisi yapılandırılmamış' });

    // ID Based Limit Check for extract (1 per day)
    const guestIp = getClientIdentifier(req);
    const today = new Date().toISOString().split('T')[0];
    const key = `extract_limit:${guestIp}:${today}`;
    const count = rateLimitCache.get<number>(key) || 0;
    
    if (count >= 1) {
       return res.status(429).json({ 
         error: 'Günlük görsel okuma limiti doldu', 
         message: 'Günde sadece 1 kez portföy görseli okutabilirsiniz. Lütfen manuel girişi kullanın veya yarın tekrar deneyin.' 
       });
    }
    rateLimitCache.set(key, count + 1);

    try {
      const mimeType = image.split(';')[0].split(':')[1] || "image/jpeg";
      const prompt = `
        Sen bir finansal veri okuma uzmanısın. Ekli görsel bir borsa/portföy uygulaması ekran görüntüsüdür.
        Görseldeki hisse senedi veya fon bilgilerini (Sembol, Adet, Ortalama Maliyet, Toplam Tutar) ayıkla.
        
        ÖNEMLİ KURALLAR:
        1. Sadece hisse adı/sembolü ve sayısal verileri al.
        2. Çıktıyı MUTLAKA şu JSON formatında ver: [{"symbol": "THYAO", "amount": 10, "cost": 250.50, "totalValue": 2505}]
        3. Sayıları verirken sadece rakam ve ondalık nokta kullan, binlik ayracı veya virgül kullanma (örn: 1250.50).
        4. Matematiksel olarak tahminde bulunma. Görselde Adet veya Lot ibaresini açıkça görüyorsan "amount" değerini doldur, yoksa 0 bırak.
        5. Görselde hissenin "TL Karşılığı" (Toplam Değeri/Tutarı) açıkça görünüyorsa "totalValue" değerini doldur, yoksa 0 bırak.
        6. Fiyat/Maliyet (cost) bölümünü görebiliyorsan yaz, yoksa 0 bırak.
        7. Sembolü tam okuyamazsan mantıklı bir tahmin yap (örn: Türk Hava Yolları -> THYAO) veya aynen yaz.
        8. Sadece JSON döndür, kod blokları (markdown) kullanma, açıklama yapma.
        9. Hiçbir veriyi bulamazsan boş bir liste döndür: []
      `;
      const result = await aiClient.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: [
          { text: prompt },
          {
            inlineData: {
              data: image.split(',')[1],
              mimeType: mimeType
            }
          }
        ],
        config: {
          responseMimeType: "application/json"
        }
      });

      let text = result.text || "";
      let parsed = [];
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error("JSON parse error:", text);
          // try to fix common JSON errors or just return empty list
        }
      }
      
      if (parsed && Array.isArray(parsed)) {
        // Temizlik: Sayısal alanları doğrula
        const sanitized = parsed.map((item: any) => ({
          symbol: String(item.symbol || '').toUpperCase(),
          amount: parseFloat(item.amount) || 0,
          cost: parseFloat(item.cost) || 0,
          totalValue: item.totalValue ? parseFloat(String(item.totalValue).replace(/,/g, '')) || undefined : undefined
        }));

        const yf = getYahoo();
        const enrichedSanitized = await Promise.all(sanitized.map(async (item: any) => {
          let livePrice = 0;
          if (yf && typeof yf.quote === 'function' && item.symbol) {
            try {
              const sym = item.symbol.toUpperCase();
              const tickers = sym.includes('.') ? [sym] : [`${sym}.IS`, sym];
              for (const t of tickers) {
                const quote = await yf.quote(t).catch(() => null);
                if (quote && quote.regularMarketPrice) {
                  livePrice = quote.regularMarketPrice;
                  break;
                }
              }
            } catch(e) {}
          }
          
          let amount = item.amount || 0;
          let cost = item.cost || 0;
          let totalValue = item.totalValue || 0;
          
          if (livePrice > 0 && totalValue > 0) {
             if (amount === 0 && cost === 0) {
                cost = livePrice;
                amount = totalValue / livePrice;
             } else if (amount === 0 && cost > 0) {
                amount = totalValue / cost;
             } else if (cost === 0 && amount > 0) {
                cost = totalValue / amount;
             }
          } else if (totalValue > 0) {
             if (amount === 0 && cost > 0) {
               amount = totalValue / cost;
             } else if (cost === 0 && amount > 0) {
               cost = totalValue / amount;
             }
          }

          if (totalValue === 0 && amount > 0 && cost > 0) {
            totalValue = amount * cost;
          }

          return {
            ...item,
            amount: Number.isFinite(amount) ? Number(amount.toFixed(4)) : 0,
            cost: Number.isFinite(cost) ? Number(cost.toFixed(2)) : 0,
            totalValue: Number.isFinite(totalValue) ? Number(totalValue.toFixed(2)) : 0
          };
        }));

        return res.json(enrichedSanitized);
      }
      decrementExtractLimit(guestIp);
      res.status(422).json({ error: 'Görselden veri ayıklanamadı' });
    } catch (err: any) {
      console.error('[AI Extract Error]:', err);
      decrementExtractLimit(guestIp);
      const errMsg = err.message || String(err) || '';
      if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('API key not valid') || errMsg.includes('400')) {
        return res.status(401).json({ 
          error: 'Sunucu bağlantı hatası oluştu', 
          message: 'AI Servis anahtarı (GEMINI_API_KEY) geçersiz veya yapılandırılmamış.' 
        });
      }
      if (errMsg.includes('503 Service Unavailable') || errMsg.includes('high demand') || errMsg.includes('503') || errMsg.includes('504')) {
        return res.status(503).json({ 
          error: 'AI Servis Yoğunluğu', 
          message: 'Şu anda yapay zeka servisinde anlık bir yoğunluk yaşanıyor (503). Lütfen birkaç saniye bekleyip tekrar deneyin.' 
        });
      }
      res.status(500).json({ error: 'AI servisi hatası', message: err.message, details: errMsg });
    }
  });

  // Dev only route to reset ID limit
  app.post('/api/portfolio/reset-limit', (req, res) => {
    const guestIp = getClientIdentifier(req);
    const today = new Date().toISOString().split('T')[0];
    rateLimitCache.del(`limit:${guestIp}:${today}`);
    res.json({ success: true, message: 'Limit sıfırlandı' });
  });

  app.post('/api/portfolio/analyze', async (req, res) => {
    const { portfolio } = req.body;
    if (!portfolio || !Array.isArray(portfolio)) return res.status(400).json({ error: 'Portföy verisi eksik' });
    
    const aiClient = getGenAI();
    if (!aiClient) return res.status(503).json({ error: 'AI servisi yapılandırılmamış' });

    // ID Based Limit Check
    const guestIp = getClientIdentifier(req);
    const { allowed } = checkIpLimit(guestIp);
    
    if (!allowed) {
       return res.status(429).json({ 
         error: 'Günlük limit doldu', 
         message: 'Günde sadece 3 ücretsiz analiz hakkınız bulunmaktadır. Lütfen yarın tekrar deneyin.' 
       });
    }

    try {
      const yf = getYahoo();
      let totalCost = 0;
      let totalLiveValue = 0;

      const cleanPortfolio = await Promise.all(portfolio.map(async (item: any) => {
        let livePrice = 0;
        let amount = item.amount || 0;
        let cost = item.cost || 0;
        const totalValue = item.totalValue || 0;
        
        if (amount === 0 && cost > 0 && totalValue > 0) amount = totalValue / cost;
        if (cost === 0 && amount > 0 && totalValue > 0) cost = totalValue / amount;
        
        if (yf && typeof yf.quote === 'function' && item.symbol) {
          try {
            const sym = item.symbol.toUpperCase();
            const tickers = sym.includes('.') ? [sym] : [`${sym}.IS`, sym];
            for (const t of tickers) {
              const quote = await yf.quote(t).catch(() => null);
              if (quote && quote.regularMarketPrice) {
                livePrice = quote.regularMarketPrice;
                break;
              }
            }
          } catch(e) {}
        }

        const finalTotal = totalValue || (amount * cost);
        totalCost += finalTotal;
        
        const currentTotalValue = livePrice > 0 && amount > 0 ? livePrice * amount : finalTotal;
        totalLiveValue += currentTotalValue;

        const profit = currentTotalValue - finalTotal;
        const profitPercentage = finalTotal > 0 ? (profit / finalTotal) * 100 : 0;

        return {
          symbol: item.symbol,
          amount,
          cost,
          totalValue: finalTotal,
          livePrice: livePrice > 0 ? livePrice : undefined,
          liveTotalValue: livePrice > 0 ? currentTotalValue : undefined,
          profit: (livePrice > 0 || currentTotalValue > 0) ? profit : undefined,
          profitPercentage: (livePrice > 0 || currentTotalValue > 0) ? profitPercentage : undefined
        };
      }));

      const totalProfit = totalLiveValue - totalCost;
      const totalProfitPercentage = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

      const prompt = `
        Aşağıdaki portföyü analiz et ve bir yatırım danışmanı gibi motive edici, şevk verici ve samimi bir dille yorumla.

        PORTFÖY ÖZETİ:
        - Toplam Tutar (Maliyet/Giriş): ${totalCost} TL
        - Güncel Canlı Değer: ${totalLiveValue} TL
        - Toplam Kâr/Zarar: ${totalProfit} TL (%${totalProfitPercentage.toFixed(2)})
        
        Hisse Detayları (Maliyet ve Canlı Fiyatlar): 
        ${JSON.stringify(cleanPortfolio)}

        Analiz şunları içermeli:
        1. Portföy Sağlık Skoru (1-100 arası).
        2. Varlık Dağılım Özeti (örn: '%40 Teknoloji, %30 Döviz...'. Mutlaka TEK BİR DÜZ METİN/STRING olmalı, JSON objesi kullanma).
        3. Teknik Not (Kullanıcıya profesyonel bir yatırım danışmanı gibi saygılı ve anlaşılır bir dille hitap et. Kullanıcının girdiği maliyet veya tutar üzerinden her hisseyi tek tek kısa kısa yorumla. Ayrıca analizine mutlaka şu minvalde bir ekleme yap: "Maliyet hesaplamalarınızı mevcut genel piyasa koşulları ve anlık fiyatlamalar üzerinden genel bir tahminle yaptım. Daha kesin sonuçlar için maliyetinizi manuel olarak sisteme girebilirsiniz, böylece toplam kar/zarar hesaplamalarınızı bu kesin maliyet üzerinden gerçekleştirebilirim." Ardından portföyün genel durumu hakkında toparlayıcı bir kapanış yap).
        4. Mutlaka "Bu bir yatırım tavsiyesi değildir, sadece eğitim amaçlı bir AI analizidir." ifadesini yorumun içine ekle.

        Yanıtı MUTLAKA şu JSON formatında ver, markdown kod bloğu kullanma:
        {"score": 85, "distribution": "Sadece düz bir metin (string)", "technicalNote": "..."}
      `;

      const result = await aiClient.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      let text = result.text || "";

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
         try {
           const analysis = JSON.parse(jsonMatch[0]);
           return res.json({
             ...analysis,
             portfolio: cleanPortfolio,
             createdAt: new Date()
           });
         } catch(e) {
           console.error("JSON parse error in analyze:", text);
           decrementIpLimit(guestIp);
           return res.status(422).json({ error: 'Yapay zeka yanıtı anlaşılamadı. Lütfen tekrar deneyin.' });
         }
      }
      decrementIpLimit(guestIp);
      res.status(422).json({ error: 'Analiz oluşturulamadı' });
    } catch (err: any) {
      console.error('[AI Analyze Error]:', err);
      decrementIpLimit(guestIp);
      const errMsg = err.message || String(err) || '';
      if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('API key not valid') || errMsg.includes('400')) {
        return res.status(401).json({ 
          error: 'Sunucu bağlantı hatası oluştu', 
          message: 'AI Servis anahtarı (GEMINI_API_KEY) geçersiz veya yapılandırılmamış.' 
        });
      }
      if (errMsg.includes('503 Service Unavailable') || errMsg.includes('high demand') || errMsg.includes('503') || errMsg.includes('504')) {
        return res.status(503).json({ 
          error: 'AI Servis Yoğunluğu', 
          message: 'Şu anda yapay zeka servisinde anlık bir yoğunluk yaşanıyor (503). Lütfen birkaç saniye bekleyip tekrar deneyin.' 
        });
      }
      res.status(500).json({ error: 'AI servisi hatası', message: err.message, details: errMsg });
    }
  });

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

  // STOCK DETAIL API (Unified Engine)
  app.get('/api/stock/:symbol', async (req, res) => {
    const { symbol } = req.params;
    if (!symbol) return res.status(400).json({ error: 'Sembol gerekli' });
    
    try {
      console.log(`[Karlısın-API] Hisse detayı isteniyor: ${symbol}`);
      const data = await UnifiedDataService.getFullStockData(symbol);
      res.json(data);
    } catch (err: any) {
      console.error(`[Karlısın-API] Hisse detayı hatası (${symbol}):`, err.message);
      res.status(500).json({ error: 'Hisse verisi alınamadı', details: err.message });
    }
  });

  // Search Alias for easier frontend access
  app.get('/api/search', async (req, res) => {
    const query = req.query.q as string;
    if (!query) return res.json([]);
    
    // Redirect to the existing search implementation
    res.redirect(`/api/stock/search?q=${encodeURIComponent(query)}`);
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
      version: '3.1.8', 
      mode: process.env.NODE_ENV, 
      wordpress_configured: !!process.env.WORDPRESS_URL,
      wordpress_url_preview: process.env.WORDPRESS_URL ? `${process.env.WORDPRESS_URL.substring(0, 15)}...` : 'not set',
      timestamp: new Date().toISOString(),
      last_x_error: lastXError 
    });
  });

  // WordPress Hata Ayıklama Endpoint'i
  app.get('/api/blog/debug', async (req, res) => {
    const wpUrl = process.env.WORDPRESS_URL?.trim();
    if (!wpUrl) return res.json({ error: 'WORDPRESS_URL environment variable is not set.' });
    
    try {
      const apiUrl = `${wpUrl.replace(/\/$/, '')}/wp-json/wp/v2/posts?_embed&per_page=1`;
      console.log(`[Karlısın-DEBUG] Fetching: ${apiUrl}`);
      const response = await fetch(apiUrl);
      const data = await response.json();
      res.json({
        config_url: wpUrl,
        fetch_url: apiUrl,
        status: response.status,
        post_count: Array.isArray(data) ? data.length : 0,
        sample_post_keys: data[0] ? Object.keys(data[0]) : [],
        sample_embedded_keys: data[0]?._embedded ? Object.keys(data[0]._embedded) : [],
        full_post_data: data[0] || null
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message, stack: err.stack });
    }
  });

  // WordPress Blog API
  app.get('/api/blog/v2/posts', async (req, res) => {
    console.log(`[Karlısın-API] /api/blog/v2/posts isteği geldi.`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    try {
      const wpPosts = await fetchWordPressPosts() as any[];
      console.log(`[Karlısın-API] /api/blog/v2/posts: ${wpPosts.length} yazı bulundu.`);
      res.json(wpPosts);
    } catch (err: any) {
      console.error(`[Karlısın-API] /api/blog/v2/posts HATASI:`, err.message);
      res.status(500).json({ error: 'Blog yazıları yüklenemedi', details: err.message });
    }
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
      const sender = getSenderEmail();
      const notificationReceiver = 'ahmet@karlisin.com';
      
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
                © 2026 Karlısın — Finansal Özgürlük Yolculuğun
              </p>
            </div>
          </div>
        `
      });

      if (error) {
        console.error('[Karlısın-API] Resend Hatası:', error);
        return res.status(400).json({ error: error.message });
      }

      // Ayrıca Admin'e bildir
      try {
        await resend.emails.send({
          from: sender,
          to: [notificationReceiver],
          subject: `Yeni Kayıt: ${email} 🔔`,
          html: `<p>Yeni bir kullanıcı (${email}) <strong>${type}</strong> listesine katıldı.</p>`
        });
      } catch (e) {
        console.warn('[Karlısın-API] Admin bildirimi gönderilemedi:', e);
      }

      console.log('[Karlısın-API] Mail başarıyla kuyruğa alındı:', data?.id);
      return res.status(200).json({ success: true, id: data?.id });
    } catch (err: any) {
      console.error('[Karlısın-API] Kritik Hata:', err);
      return res.status(500).json({ error: 'Kritik sunucu hatası', message: err.message });
    }
  };

  app.all('/api/mail', mailHandler);

  // İLETİŞİM FORMU API
  app.post('/api/contact', async (req, res) => {
    const { email, type, message, source, _hp_name, _hp_time, recaptchaToken } = req.body;
    
    // 0. reCAPTCHA VERIFICATION
    if (process.env.RECAPTCHA_SECRET_KEY) {
      try {
        const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`;
        const verifyRes = await fetch(verifyUrl, { method: 'POST' });
        const verifyData: any = await verifyRes.json();
        
        if (!verifyData.success) {
          return res.status(400).json({ error: 'reCAPTCHA doğrulaması başarısız. Lütfen tekrar deneyin.' });
        }
      } catch (err) {
        console.error('[Karlısın-Güvenlik] reCAPTCHA Kritik Hata:', err);
        // Hata durumunda güvenli tarafta kalıp devam edebiliriz veya engelleyebiliriz.
      }
    }

    // 1. HONEYPOT KONTROLÜ
    if (_hp_name) {
      console.warn('[Karlısın-Güvenlik] Honeypot tetiklendi, bot engellendi.');
      return res.status(200).json({ success: true, message: 'Bot detected but handled silently' });
    }

    // 2. ZAMAN KONTROLÜ (2 saniyeden hızlı gönderen bot olabilir)
    const now = Date.now();
    const submissionTime = parseInt(_hp_time || '0');
    if (now - submissionTime < 2000) {
      console.warn('[Karlısın-Güvenlik] Çok hızlı gönderim, bot şüphesi.');
      return res.status(400).json({ error: 'Lütfen formu doldurmak için biraz daha zaman ayırın.' });
    }

    if (!email || !message) {
      return res.status(400).json({ error: 'E-posta ve mesaj alanları zorunludur' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('[Karlısın-API] RESEND_API_KEY bulunamadı.');
      return res.status(200).json({ success: true, message: 'Saved to DB (Key Missing)' });
    }

    try {
      // Admin adresi
      const receiver = 'ahmet@karlisin.com';
      const sender = getSenderEmail();
      
      const { data, error } = await resend.emails.send({
        from: sender,
        to: [receiver],
        replyTo: email,
        subject: `Karlısın İletişim: ${type || 'Genel Mesaj'} 📩`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; padding: 20px;">
            <h2 style="color: #4f46e5;">Yeni İletişim Formu Mesajı</h2>
            <div style="background-color: #f8fafc; border-radius: 16px; padding: 24px; border: 1px solid #e2e8f0; margin-top: 20px;">
              <p><strong>Gönderen:</strong> ${email}</p>
              <p><strong>Konu:</strong> ${type}</p>
              <p><strong>Kaynak:</strong> ${source || 'contact_page'}</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p><strong>Mesaj:</strong></p>
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
            <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">
              Bu mail Karlısın.com iletişim formu üzerinden otomatik olarak gönderilmiştir.
            </p>
          </div>
        `
      });

      if (error) {
        console.error('[Karlısın-API] İletişim Mail Hatası:', error);
        return res.status(400).json({ error: error.message });
      }

      res.json({ success: true, id: data?.id });
    } catch (err: any) {
      console.error('[Karlısın-API] İletişim Kritik Hata:', err);
      res.status(500).json({ error: 'Mail gönderilemedi', message: err.message });
    }
  });

  // TOPLU MAİL GÖNDERİMİ (Yeni Blog Yazısı Haber Ver)
  app.post('/api/broadcast', async (req, res) => {
    const { subscribers, articleTitle, articleExcerpt, articleUrl } = req.body;
    
    if (!subscribers || !Array.isArray(subscribers) || subscribers.length === 0) {
      return res.status(400).json({ error: 'Abone listesi eksik' });
    }

    console.log(`[Karlısın-API] Broadcast başlatılıyor: ${subscribers.length} kişi`);
    
    // X (Twitter) Paylaşımı
    const tweetText = `🚀 Yeni Blog Yazımız Yayında! 🚀\n\n"${articleTitle}"\n\n${articleExcerpt.slice(0, 100)}...\n\nDetaylı analiz için tıklayın: ${articleUrl || 'https://karlisin.com/blog'}\n\n#Karlısın #Bist100 #Temettü #Yatırım @KarlisinTR`;
    await postToX(tweetText);

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

  // LIVE IPO DATA ENGINE (Scrapes + Gemini Intelligence)
  app.get('/api/ipo-data', async (req, res) => {
    console.log(`[Karlısın-IPO] İSTEK ALINDI: ${req.url}`);
    const cacheKey = 'live_ipo_data_v7';
    const isRefresh = req.query.refresh === 'true';
    const cachedData = cache.get(cacheKey) as any;
    
    // Zaman Mantığı: Günde 1 kez saat 10:00'da (TR) güncelleme
    // 10:00 TR = 07:00 UTC
    const now = new Date();
    const updateTimeUTC = new Date(now);
    updateTimeUTC.setUTCHours(7, 0, 0, 0);

    const isStale = cachedData ? (!cachedData.lastUpdate || new Date(cachedData.lastUpdate).getTime() < updateTimeUTC.getTime()) : true;
    const isPastUpdateHour = now.getTime() > updateTimeUTC.getTime();

    const isFourHoursStale = cachedData && cachedData.lastUpdate && (now.getTime() - new Date(cachedData.lastUpdate).getTime() > 4 * 60 * 60 * 1000);
    const shouldUpdate = !cachedData || isRefresh || (isPastUpdateHour && isStale) || isFourHoursStale;

    if (cachedData && !shouldUpdate) {
      console.log('[Karlısın-IPO] Güncel veri önbellekten dönülüyor.');
      return res.json(cachedData);
    }

    const aiClient = getGenAI();
    if (!aiClient) {
      if (cachedData) return res.json(cachedData);
      return res.status(503).json({ error: 'AI Servisi bulunamadı.' });
    }

    const maxRetries = 2;
    let attempt = 0;

    const runProc = async (): Promise<any> => {
      attempt++;
      console.log(`[Karlısın-IPO] Günlük güncelleme başlatılıyor... (Deneme: ${attempt})`);
      
      try {
        const todayIso = new Date().toISOString().split('T')[0];
        const todayTR = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

        function getRandomUserAgent() {
          const uas = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          ];
          return uas[Math.floor(Math.random() * uas.length)];
        }

        let bistHtml = '';
        let archiveHtml = '';
        let draftHtml = '';
        let investazHtml = '';
        let gedikHtml = '';
        let yapikrediHtml = '';

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes for scrapes

        const fetchOptions = {
          headers: { 
            'User-Agent': getRandomUserAgent(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'tr,en-US;q=0.7,en;q=0.3',
            'Cache-Control': 'no-cache',
          },
          signal: controller.signal as any
        };

        try {
          // Individual timeouts for slow sources to prevent blocking the whole pipe
          const fetchWithTimeout = async (url: string, options: any, timeout = 60000) => {
            const innerController = new AbortController();
            const id = setTimeout(() => innerController.abort(), timeout);
            try {
              const res = await fetch(url, { ...options, signal: innerController.signal });
              return res;
            } finally {
              clearTimeout(id);
            }
          };

          const [bistRes, archiveRes, draftRes, investazRes, gedikRes, yapikrediRes] = await Promise.all([
            fetchWithTimeout('https://halkarz.com/', fetchOptions, 40000).catch(() => null),
            fetchWithTimeout('https://halkarz.com/arsiv/', fetchOptions, 40000).catch(() => null),
            fetchWithTimeout('https://halkarz.com/taslak-izahnameler/', fetchOptions, 60000).catch(() => null),
            fetchWithTimeout('https://www.investaz.com.tr/halka-arz-takvimi', fetchOptions, 40000).catch(() => null),
            fetchWithTimeout('https://gedik.com/halka-arz-takvimi', fetchOptions, 40000).catch(() => null),
            fetchWithTimeout('https://www.yapikredi.com.tr/bireysel-bankacilik/yatirim-urunleri/hisse-senetleri/halka-arz-takvimi', fetchOptions, 40000).catch(() => null)
          ]);
          
          bistHtml = (bistRes && bistRes.ok) ? await bistRes.text() : '';
          archiveHtml = (archiveRes && archiveRes.ok) ? await archiveRes.text() : '';
          draftHtml = (draftRes && draftRes.ok) ? await draftRes.text() : '';
          investazHtml = (investazRes && investazRes.ok) ? await investazRes.text() : '';
          gedikHtml = (gedikRes && gedikRes.ok) ? await gedikRes.text() : '';
          yapikrediHtml = (yapikrediRes && yapikrediRes.ok) ? await yapikrediRes.text() : '';
          
          console.log(`[Karlısın-IPO] Sources scraped: Main, Archive, Drafts, InvestAz, Gedik, YapiKredi.`);
        } catch (e: any) {
          console.warn('[Karlısın-IPO] Scrape warning:', e.message);
        } finally {
          clearTimeout(timeoutId);
        }

        const prompt = `
            GÖREV: Sana verdiğim 6 farklı finans kaynağından gelen verileri karşılaştır ve Borsa İstanbul (BIST) halka arz takvimini oluştur.
            ÖZELLİKLE "TASLAK İZAHNAME" (BAŞVURU SÜRECİNDE) OLAN TÜM ŞİRKETLERİ LİSTELE. 
            İnternette 200'den fazla taslak şirket var, bulabildiğin kadarını (en az 100-150 tane) JSON içine ekle.
            
            BUGÜNÜN TARİHİ: ${todayTR} (YIL 2026)
            
            KATEGORİZASYON:
            1. ongoing (TALEP TOPLAYANLAR): Sadece bugün (${todayTR}) talep toplama tarihlerindeyse.
            2. upcoming (ONAY BEKLEYEN / TASLAK): SPK onayı bekleyen, taslak izahnamesi sunulmuş olan TÜM şirketler. Bu liste çok uzun olmalı!
            3. completed (İŞLEMDE OLANLAR): Yakın zamanda (2025-2026) halka arzı bitmiş ve borsada işlem gören şirketler.
            
            ÖNEMLİ: 2024 ve 2025 verilerini "ongoing" yapma, onlar "completed" olmalı.
            
            JSON FORMATI:
            {
              "bist": [
                {
                  "name": "Şirket Adı",
                  "code": "KOD",
                  "price": 0.0,
                  "date": "Tarih veya 'Taslak'",
                  "status": "ongoing|upcoming|completed",
                  "method": "...",
                  "lotRange": "...",
                  "market": "...",
                  "description": "..."
                }
              ],
              "nasdaq": [],
              "lastUpdate": "${new Date().toISOString()}"
            }
          `;

        const cleanHtml = (html: string, limit = 15000) => {
          if (!html) return '';
          return html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '')
            .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
            .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
            .replace(/\s+/g, ' ')
            .substring(0, limit); 
        };

        const result = await aiClient.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [{ role: 'user', parts: [
            { text: prompt },
            { text: `KAYNAK 1 (HalkArz Ana/Ongoing):\n${cleanHtml(bistHtml)}` },
            { text: `KAYNAK 2 (HalkArz Taslaklar - 200+ Şirket):\n${cleanHtml(draftHtml, 40000)}` },
            { text: `KAYNAK 3 (HalkArz Arşiv - Completed):\n${cleanHtml(archiveHtml)}` },
            { text: `KAYNAK 4 (Finans Kurumları):\n${cleanHtml(investazHtml)}\n${cleanHtml(gedikHtml)}\n${cleanHtml(yapikrediHtml)}` }
          ]}],
          config: { 
            responseMimeType: "application/json",
            temperature: 0,
            tools: [{ googleSearch: {} }]
          }
        });
        
        let text = "";
        try {
          text = (result as any).candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        } catch (e) {
          text = (result as any).text || "{}";
        }

        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) text = jsonMatch[0];
        
        if (text) {
          try {
            const parsed = JSON.parse(text);
            parsed.lastUpdate = new Date().toISOString(); 
            
            if (!parsed.bist) parsed.bist = [];
            if (!parsed.nasdaq) parsed.nasdaq = [];

            // --- SERVER-SIDE FINAL VALIDATION ---
            parsed.bist = parsed.bist.map((item: any, i: number) => {
              const dateStr = (item.date || "").toLowerCase();
              
              // 2024-2025 verilerini "completed" olarak işaretle
              if (dateStr.includes("2024") || dateStr.includes("2025")) {
                item.status = "completed";
              }
              
              // Yiğit Akü ve Horoz Lojistik koruması
              if (item.code === "YIGIT" || item.code === "HOROZ") {
                item.status = "completed";
              }

              return { ...item, id: item.id || (item.code + "_" + i) };
            });

            if (parsed.bist.length === 0 && cachedData && cachedData.bist && cachedData.bist.length > 0) {
              return cachedData;
            }

            cache.set(cacheKey, parsed, 7200); 
            return parsed;
          } catch (pErr: any) {
            console.error('[Karlısın-IPO] JSON Parse Hatası:', pErr.message, 'Text:', text.substring(0, 200));
            throw new Error(`Invalid JSON: ${pErr.message}`);
          }
        }
        throw new Error('Yanıt boş.');
      } catch (err: any) {
        const isBusy = err.message?.includes('503') || err.message?.includes('demand') || err.message?.includes('UNAVAILABLE');
        if (isBusy && attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 2000));
          return runProc();
        }
        throw err;
      }
    };

    try {
      const data = await runProc();
      return res.json(data);
    } catch (err: any) {
      console.error('[Karlısın-IPO] Hata:', err.message);
      
      // FALLBACK: Eğer AI veya Scrape tamamen başarısız olursa
      // En azından önbellekteki eski veriyi dön, o da yoksa boş bir yapı dön
      // Böylece frontend 500 hatası alıp "siyaha düşmez"
      const fallback = cachedData || { 
        bist: [], 
        nasdaq: [], 
        lastUpdate: new Date().toISOString(),
        isFallback: true 
      };
      
      console.log('[Karlısın-IPO] Hata durumunda güvenli veri (fallback) dönülüyor.');
      return res.json(fallback);
    }
  });

  // API CATCH-ALL
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: 'API rotası bulunamadı', path: req.path });
  });

  // ---------------------------------------------------------
  // 3. VITE / STATIC ASSET SERVİSİ (EN SONDA OLMALI)
  // ---------------------------------------------------------
  
  const distPath = path.resolve(__dirname, 'dist');
  const isProduction = false; // FORCED FALSE FOR PREVIEW STABILITY
  
  if (isProduction && fs.existsSync(distPath)) {
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

      // Tarayıcının eski index.html sürümünü önbellekte tutmasını engelle!
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

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

  console.log('[Karlısın-Boot] Sunucu dinlemeye hazırlanıyor...');
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Test API: http://localhost:${PORT}/api/mail?email=test@example.com`);
    
    // Server startup automatic broadcast check
    initAutoBroadcast();

    // Check for new WordPress posts every 10 minutes
    setInterval(() => {
      console.log('[Karlısın-WP-Sync] Periyodik kontrol başlatılıyor...');
      initAutoBroadcast();
    }, 600000); 
  });
}

async function initAutoBroadcast(force = false) {
  if (!adminDb) {
    console.warn('[Karlısın-AUTO] adminDb henüz hazır değil. 10 saniye sonra tekrar denenecek...');
    setTimeout(() => initAutoBroadcast(force), 10000);
    return;
  }

  if (isLocalBroadcastPending && !force) {
    console.log('[Karlısın-AUTO] Bir broadcast bekleme aşamasında (In-Memory Lock).');
    return;
  }

  try {
    // Önce WordPress yazılarını almayı dene
    let latestArticles = articles;
    const wpUrl = process.env.WORDPRESS_URL?.trim();
    
    if (wpUrl) {
      try {
        const wpPosts = await fetchWordPressPosts();
        if (wpPosts && Array.isArray(wpPosts) && wpPosts.length > 0) {
          latestArticles = wpPosts as any[];
        }
      } catch (err) {
        console.warn('[Karlısın-AUTO] WordPress yazıları alınamadı, yerel listeye bakılıyor.');
      }
    }

    const lastArticle = latestArticles[0]; // WordPress API en yeniyi en başa getirir
    if (!lastArticle) {
      console.log('[Karlısın-AUTO] Yayınlanmış yazı bulunamadı.');
      return;
    }

    const currentId = String(lastArticle.id);
    const systemRef = adminDb.collection('system_config').doc('broadcast_status');
    const systemSnap = await systemRef.get();
    
    const lastBroadcastedId = systemSnap.exists ? systemSnap.data()?.last_broadcasted_article_id : null;
    const dbStatus = systemSnap.exists ? systemSnap.data()?.status : 'IDLE';
    const pendingAt = systemSnap.exists ? systemSnap.data()?.pending_at : null;

    // Check if "PENDING" is stuck (older than 10 mins)
    const isStuck = dbStatus === 'PENDING' && pendingAt && (Date.now() - new Date(pendingAt).getTime() > 600000);

    if ((lastBroadcastedId !== currentId || force) && (dbStatus !== 'PENDING' || isStuck)) {
      isLocalBroadcastPending = true;
      // Mark as PENDING immediately to prevent other processes from starting
      await systemRef.set({ 
        status: 'PENDING', 
        pending_article_id: currentId,
        pending_at: new Date().toISOString() 
      }, { merge: true });

      const delayMs = force ? 0 : 180000; // 3 minutes delay
      console.log(`[Karlısın-AUTO] Broadcast BAŞLATILDI (${lastArticle.title}, ID: ${currentId}). ${delayMs/1000} saniye bekleme süresi başladı...`);
      
      setTimeout(async () => {
        try {
          console.log('[Karlısın-AUTO] Broadcast işlemi yürütülüyor...');
          
          // Re-verify it still needs to be sent
          const reCheckSnap = await systemRef.get();
          const finalCheckId = reCheckSnap.data()?.last_broadcasted_article_id;
          if (finalCheckId === currentId && !force) {
            console.log('[Karlısın-AUTO] Atlanıyor: Bu yazı zaten gönderilmiş.');
            await systemRef.set({ status: 'IDLE' }, { merge: true });
            isLocalBroadcastPending = false;
            return;
          }

          const querySnapshot = await adminDb.collection('newsletter_subscribers').get();
          const subscribers = querySnapshot.docs
            .map((doc: any) => doc.data().email)
            .filter((e: any) => !!e && e.includes('@') && !e.includes('example.com') && e.length > 5);

          console.log(`[Karlısın-AUTO] ${subscribers.length} geçerli abone bulundu.`);

          // 1. X (Twitter) Otomatik Paylaşım
          const tweetText = `📢 Yeni Yazı: ${lastArticle.title}\n\n${lastArticle.excerpt.slice(0, 110)}...\n\n🔗 Okumak için: https://www.karlisin.com/blog/${lastArticle.slug || currentId}\n\n#Karlısın #Borsa #FinansalOzgurluk @KarlisinTR`;
          console.log('[Karlısın-AUTO] X Paylaşımı başlatılıyor...');
          try {
            await postToX(tweetText);
          } catch (xErr: any) {
            console.error('[Karlısın-AUTO] X Paylaşım hatası:', xErr.message);
          }

          if (subscribers.length === 0) {
            console.log('[Karlısın-AUTO] Abone yok, sadece durum güncelleniyor.');
            await systemRef.set({ 
              last_broadcasted_article_id: currentId,
              status: 'IDLE',
              updated_at: new Date().toISOString(),
              total_sent: 0
            }, { merge: true });
            isLocalBroadcastPending = false;
            return;
          }

          const resendFromEnv = process.env.RESEND_API_KEY;
          const resendInstance = new Resend(resendFromEnv || 're_123');
          const sender = getSenderEmail();
          const articleUrl = `https://www.karlisin.com/blog/${lastArticle.slug || currentId}`;

          let successCount = 0;
          console.log(`[Karlısın-AUTO] ${subscribers.length} mail gönderimi başlıyor... (From: ${sender})`);

          for (const email of subscribers) {
            try {
              const res = await resendInstance.emails.send({
                from: sender,
                to: [email],
                subject: `Karlısın'dan Yeni İçerik: ${lastArticle.title} 📚`,
                html: `
                  <div style="font-family:sans-serif;padding:20px;color:#1e293b;max-width:600px;margin:0 auto;">
                    <div style="text-align:center;margin-bottom:30px;">
                      <h1 style="color:#4f46e5;margin:0;">Karlısın.com</h1>
                      <p style="color:#64748b;margin:5px 0 0 0;">Finansal Özgürlük Analizleri</p>
                    </div>
                    <div style="background:#f8fafc;padding:30px;border-radius:24px;border:1px solid #e2e8f0;margin-bottom:20px;">
                      <h2 style="margin-top:0;color:#1e293b;font-size:20px;">${lastArticle.title}</h2>
                      <p style="color:#475569;line-height:1.6;">${lastArticle.excerpt}</p>
                      <div style="margin-top:25px;text-align:center;">
                        <a href="${articleUrl}" style="display:inline-block;background:#4f46e5;color:white;padding:14px 28px;text-decoration:none;border-radius:12px;font-weight:bold;font-size:16px;">Yazının Tamamını Oku</a>
                      </div>
                    </div>
                    <div style="text-align:center;color:#94a3b8;font-size:12px;">
                      <p>© 2026 Karlısın. Tüm hakları saklıdır.</p>
                      <p>Haftalık bülten aboneliğiniz kapsamında gönderilmiştir.</p>
                    </div>
                  </div>
                `
              });
              
              if (res.error) {
                console.error(`[Karlısın-AUTO] Resend Hatası (${email}):`, res.error);
              } else {
                successCount++;
              }
            } catch (err: any) {
              console.error(`[Karlısın-AUTO] Mail İstisnası (${email}):`, err.message);
            }
          }

          // Final update
          await systemRef.set({ 
            last_broadcasted_article_id: currentId,
            status: 'IDLE',
            updated_at: new Date().toISOString(),
            total_sent: successCount,
            last_article_title: lastArticle.title
          }, { merge: true });

          isLocalBroadcastPending = false;
          console.log(`[Karlısın-AUTO] Broadcast tamamlandı. Gönderilen: ${successCount}`);
        } catch (err: any) {
          console.error('[Karlısın-AUTO] İşlem hatası:', err.message);
          await systemRef.set({ status: 'IDLE' }, { merge: true });
          isLocalBroadcastPending = false;
        }
      }, delayMs); 
    } else if (dbStatus === 'PENDING') {
      console.log('[Karlısın-AUTO] Bir broadcast işlemi zaten beklemede (PENDING).');
    } else {
      console.log(`[Karlısın-AUTO] Sistem güncel. (Son ID: ${currentId})`);
    }
  } catch (err: any) {
    console.error('[Karlısın-AUTO] Kontrol hatası:', err.message);
    isLocalBroadcastPending = false;
  }
}

startServer().catch(err => {
  console.error('[Karlısın-Sunucu] Başlatma hatası:', err);
});