import fetch from "node-fetch";

async function test() {
  const urls = [
    `https://tr.investing.com/equities/tav-havalimanlari`,
  ];
  for (const url of urls) {
    const res = await fetch(url, {
      headers: {
        'User-Agent': "Mozilla/5.0",
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
      }
    });
    console.log(res.status);
    const html = await res.text();
    const priceMatch = html.match(/data-test="instrument-price-last"[^>]*>([\d,.]+)</) || html.match(/class="text-2xl[^>]*>([\d,.]+)</);
    console.log("PRICE MATCH:", priceMatch);
  }
}
test();
