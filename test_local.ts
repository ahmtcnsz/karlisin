fetch('http://localhost:3000/api/dividends?symbol=KCHOL.IS').then(r=>r.json()).then(console.log).catch(console.error);
