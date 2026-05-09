import fetch from "node-fetch";

async function test() {
  const url = "https://www.google.com/finance/quote/TAVHL:IST?hl=tr";
  const res = await fetch(url, {
    headers: {
      'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      'Accept-Language': "tr-TR,tr"
    }
  });
  console.log("GOOGLE STATUS:", res.status);
  const html = await res.text();
  console.log("DAY RANGE MATCH:", html.match(/Günlük aralık<\/div><div[^>]*>([^<]+)<\/div>/i));
  console.log("ALL TEXT MATCHES:", html.match(/class="[^"]*P6K39c[^"]*"[^>]*>([^<]+)<\/div>/g)?.slice(0, 5));
}
test();
