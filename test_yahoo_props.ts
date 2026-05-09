import yahooFinanceModule from 'yahoo-finance2';

async function test() {
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
  console.log("QUOTE REGULAR MARKET:", q.regularMarketPrice);
  console.log("QUOTE DAY HIGH:", (q as any).dayHigh, q.regularMarketDayHigh);
  console.log("QUOTE DAY LOW:", (q as any).dayLow, q.regularMarketDayLow);
}
test();
