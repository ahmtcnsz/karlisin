import { getApiUrl, getDeviceId } from '../lib/utils';

export interface PortfolioItem {
  symbol: string;
  amount: number;
  cost: number;
  totalValue?: number;
  livePrice?: number;
  liveTotalValue?: number;
  profit?: number;
  profitPercentage?: number;
}

export interface AnalysisResult {
  score: number;
  distribution: string;
  technicalNote: string;
  createdAt: any;
  portfolio: PortfolioItem[];
}

export const extractPortfolioFromImage = async (base64Image: string): Promise<PortfolioItem[]> => {
  try {
    const response = await fetch(getApiUrl('/api/portfolio/extract'), {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-device-id': getDeviceId()
      },
      body: JSON.stringify({ image: base64Image, deviceId: getDeviceId() })
    });
    const contentType = response.headers.get("content-type");
    if (response.ok && contentType && contentType.includes("application/json")) {
      return await response.json();
    }
    
    let errMessage = "Bağlantı hatası veya sunucu yanıt vermedi.";
    if (contentType && contentType.includes("application/json")) {
      const errJson = await response.json();
      if (errJson.message) {
        errMessage = errJson.message;
      } else if (errJson.error) {
        errMessage = errJson.error;
      }
    } else {
      const errText = await response.text();
      if (errText) errMessage = errText;
    }
    throw new Error(errMessage);
  } catch (err: any) {
    console.error("Backend extract failed", err);
    throw new Error(err.message || "Bağlantı hatası");
  }
};

export const analyzePortfolio = async (portfolio: PortfolioItem[]): Promise<AnalysisResult> => {
  try {
    const response = await fetch(getApiUrl('/api/portfolio/analyze'), {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-device-id': getDeviceId()
      },
      body: JSON.stringify({ portfolio, deviceId: getDeviceId() })
    });
    const contentType = response.headers.get("content-type");
    if (response.ok && contentType && contentType.includes("application/json")) {
      return await response.json();
    }
    let errMessage = "Bağlantı hatası veya sunucu yanıt vermedi.";
    if (contentType && contentType.includes("application/json")) {
      const errJson = await response.json();
      if (errJson.message) {
        errMessage = errJson.message;
      } else if (errJson.error) {
        errMessage = errJson.error;
      }
    } else {
      const errText = await response.text();
      if (errText) errMessage = errText;
    }
    throw new Error(errMessage);
  } catch (err: any) {
    console.error("Backend analyze failed", err);
    throw new Error(err.message || "Bağlantı hatası");
  }
};

export const checkDailyLimit = async (): Promise<{ canAnalyze: boolean; lastAnalysis?: Date }> => {
  try {
    const history = await getAnalysisHistory();
    const today = new Date();
    const todaysAnalyses = history.filter(h => {
      if (!h.createdAt) return false;
      const d = new Date(h.createdAt);
      return d.getDate() === today.getDate() &&
             d.getMonth() === today.getMonth() &&
             d.getFullYear() === today.getFullYear();
    });
    
    if (todaysAnalyses.length >= 3) {
       return { canAnalyze: false, lastAnalysis: new Date(todaysAnalyses[0].createdAt) };
    }

    const res = await fetch(getApiUrl(`/api/portfolio/ai-status?t=${Date.now()}&deviceId=${encodeURIComponent(getDeviceId())}`), {
      headers: { 'x-device-id': getDeviceId() }
    });
    const data = await res.json();
    return { canAnalyze: data.remaining > 0 };
  } catch (error) {
    return { canAnalyze: true };
  }
};

export const getTodayAnalysis = async (): Promise<AnalysisResult | null> => {
  try {
    const history = await getAnalysisHistory();
    if (history.length === 0) return null;
    
    const latest = history[0];
    const lastDate = new Date(latest.createdAt);
    const today = new Date();
    
    const isSameDay = 
      lastDate.getDate() === today.getDate() &&
      lastDate.getMonth() === today.getMonth() &&
      lastDate.getFullYear() === today.getFullYear();
      
    if (isSameDay) return latest;
    return null;
  } catch (error) {
    return null;
  }
};

export const saveAnalysis = async (analysis: AnalysisResult) => {
  try {
    const history = await getAnalysisHistory();
    const newHistory = [analysis, ...history].slice(0, 10);
    
    localStorage.setItem('portfolio_analysis_history', JSON.stringify(newHistory));
    localStorage.setItem('last_portfolio_analysis_date', Date.now().toString());
  } catch (error) {
    console.error("Save analysis failed:", error);
  }
};

export const getAnalysisHistory = async (): Promise<AnalysisResult[]> => {
  try {
    // 24 saatlik limit temizliği / test için (sadece bir kez çalışır)
    if (!localStorage.getItem('wiped_v4_test')) {
      localStorage.removeItem('portfolio_analysis_history');
      localStorage.setItem('wiped_v4_test', 'true');
    }

    const stored = localStorage.getItem('portfolio_analysis_history');
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    return [];
  }
};
