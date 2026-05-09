import fetch from "node-fetch";

async function test() {
  const avKey = process.env.ALPHA_VANTAGE_API_KEY || "demo";
  const res = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=TAVHL.IS&apikey=${avKey}`);
  const data = await res.json();
  console.log("ALPHAVANTAGE TAVHL.IS:", data);
}
test();
