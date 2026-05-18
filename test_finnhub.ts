async function test() {
  const finnhubKey = process.env.FINNHUB_API_KEY || "cq3abk9r01quj9vsc22gcq3abk9r01quj9vsc230"; // Usually public or available. Let's just use some dummy call if it fails.
  const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=TAVHL.IS&token=${finnhubKey}`);
  const data = await res.json();
  console.log("FINNHUB TAVHL.IS:", data);
}
test();
