import yahooFinanceModule from 'yahoo-finance2';

async function test() {
  try {
    let yf;
    const raw: any = yahooFinanceModule;
    if (raw && typeof raw === 'function') {
      yf = new raw({ suppressNotices: ['yahooSurvey'] });
    } else if (raw.default && typeof raw.default === 'function') {
      yf = new raw.default({ suppressNotices: ['yahooSurvey'] });
    } else {
      yf = raw;
    }
    const q = await yf.quote('TAVHL.IS');
    console.log("QUOTE SUCCESS:", q.regularMarketPrice);
  } catch(e) {
    console.error("FAILED:", e);
  }
}
test();
